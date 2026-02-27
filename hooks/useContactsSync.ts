import { useEffect, useState, useCallback } from 'react';
import * as Contacts from 'expo-contacts';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuthStore } from '../store/useAuthStore';

interface DeviceContact {
    id: string;
    name: string;
    emails: { email: string; label: string }[];
    phones: { number: string; label: string }[];
}

interface SyncResult {
    newContacts: number;
    existingContacts: number;
    totalDeviceContacts: number;
    errors: string[];
}

export function useContactsSync() {
    const user = useAuthStore((state) => state.user);
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

    const addContactMutation = useMutation(api.contacts.addContact);

    const requestPermission = useCallback(async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        return status === 'granted';
    }, []);

    const getDeviceContacts = useCallback(async (): Promise<DeviceContact[]> => {
        if (!hasPermission) {
            const granted = await requestPermission();
            if (!granted) return [];
        }

        const { data } = await Contacts.getContactsAsync({
            fields: [
                Contacts.Fields.Name,
                Contacts.Fields.Emails,
                Contacts.Fields.PhoneNumbers,
            ],
        });

        return data.map((contact: any) => ({
            id: contact.id,
            name: contact.name || '',
            emails: (contact.emails || []).map((e: any) => ({ 
                email: (e.email || '').toLowerCase().trim(), 
                label: e.label || 'other' 
            })),
            phones: contact.phoneNumbers || [],
        })).filter((c: DeviceContact) => c.name || c.emails.length > 0);
    }, [hasPermission, requestPermission]);

    const syncContacts = useCallback(async (): Promise<SyncResult> => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        setIsSyncing(true);

        const result: SyncResult = {
            newContacts: 0,
            existingContacts: 0,
            totalDeviceContacts: 0,
            errors: [],
        };

        try {
            const deviceContacts = await getDeviceContacts();
            result.totalDeviceContacts = deviceContacts.length;

            // Process contacts that have emails
            for (const contact of deviceContacts) {
                if (contact.emails.length > 0) {
                    for (const emailObj of contact.emails) {
                        if (!emailObj.email || !emailObj.email.includes('@')) {
                            continue; // Skip invalid emails
                        }
                        
                        try {
                            // Add to contacts table - returns { id, isNew }
                            const addResult = await addContactMutation({
                                ownerId: user.uid,
                                contactEmail: emailObj.email,
                                nickname: contact.name || undefined,
                            });
                            
                            if (addResult.isNew) {
                                result.newContacts++;
                            } else {
                                result.existingContacts++;
                            }
                        } catch (e: any) {
                            result.errors.push(`Failed to add ${emailObj.email}: ${e.message}`);
                        }
                    }
                }
            }

            setSyncResult(result);
            return result;
        } finally {
            setIsSyncing(false);
        }
    }, [user, getDeviceContacts, addContactMutation]);

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    return {
        hasPermission,
        isSyncing,
        syncResult,
        syncContacts,
        getDeviceContacts,
        requestPermission,
    };
}

export function useContactSuggestions() {
    const user = useAuthStore((state) => state.user);
    const { hasPermission, getDeviceContacts, isSyncing } = useContactsSync();

    const findSuggestions = useCallback(async () => {
        if (!user || !hasPermission) return [];

        const deviceContacts = await getDeviceContacts();
        const emails = deviceContacts
            .flatMap(c => c.emails.map(e => e.email.toLowerCase()))
            .filter(Boolean);

        return emails;
    }, [user, hasPermission, getDeviceContacts]);

    return {
        hasPermission,
        isSyncing,
        findSuggestions,
    };
}
