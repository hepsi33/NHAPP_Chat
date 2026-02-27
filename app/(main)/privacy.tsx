import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Eye, EyeOff, Lock, Shield, UserMinus, UserX } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Modal, TextInput, FlatList } from 'react-native';
import { Colors } from '../../constants/Colors';

interface PrivacyOption {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    type: 'toggle' | 'action' | 'info';
}

export default function PrivacyScreen() {
    const router = useRouter();
    
    const [settings, setSettings] = useState({
        lastSeen: true,
        onlineStatus: true,
        profilePhoto: true,
        about: true,
        readReceipts: true,
        disappearingMessages: false,
    });

    const [blockedContacts, setBlockedContacts] = useState<string[]>([]);
    const [showBlockedModal, setShowBlockedModal] = useState(false);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        if (key === 'disappearingMessages' && !settings.disappearingMessages) {
            Alert.alert(
                "Disappearing Messages",
                "Messages will be deleted after 7 days of being sent. This feature is currently in beta.",
                [{ text: "OK" }]
            );
        }
    };

    const handleBlockContact = () => {
        Alert.prompt(
            "Block Contact",
            "Enter the email of the contact you want to block:",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Block", 
                    onPress: (email?: string) => {
                        if (email && email.includes('@')) {
                            setBlockedContacts(prev => [...prev, email]);
                            Alert.alert("Success", `${email} has been blocked.`);
                        } else {
                            Alert.alert("Error", "Please enter a valid email address.");
                        }
                    }
                },
            ],
            "plain-text"
        );
    };

    const InfoCircle = ({ size, color }: { size: number; color: string }) => (
        <Eye size={size} color={color} />
    );

    const CheckCircle = ({ size, color }: { size: number; color: string }) => (
        <Eye size={size} color={color} />
    );

    const handleUnblockContact = (email: string) => {
        Alert.alert(
            "Unblock Contact",
            `Do you want to unblock ${email}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Unblock", 
                    style: 'destructive',
                    onPress: () => {
                        setBlockedContacts(prev => prev.filter(e => e !== email));
                        Alert.alert("Success", `${email} has been unblocked.`);
                    }
                },
            ]
        );
    };

    const privacyOptions: PrivacyOption[] = [
        { id: 'lastSeen', title: 'Last Seen', subtitle: settings.lastSeen ? 'Everyone' : 'Nobody', icon: Clock, type: 'toggle' },
        { id: 'onlineStatus', title: 'Online Status', subtitle: settings.onlineStatus ? 'Everyone' : 'Nobody', icon: Eye, type: 'toggle' },
        { id: 'profilePhoto', title: 'Profile Photo', subtitle: settings.profilePhoto ? 'Everyone' : 'My Contacts', icon: UserX, type: 'toggle' },
        { id: 'about', title: 'About', subtitle: settings.about ? 'Everyone' : 'My Contacts', icon: InfoCircle, type: 'toggle' },
        { id: 'readReceipts', title: 'Read Receipts', subtitle: settings.readReceipts ? 'On' : 'Off', icon: CheckCircle, type: 'toggle' },
        { id: 'disappearing', title: 'Disappearing Messages', subtitle: settings.disappearingMessages ? 'On' : 'Off', icon: Clock, type: 'toggle' },
    ];

    const PrivacyItem = ({ option }: { option: PrivacyOption }) => (
        <View style={styles.optionItem}>
            <View style={styles.optionIcon}>
                <option.icon size={22} color={Colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Switch
                value={settings[option.id as keyof typeof settings] as boolean}
                onValueChange={() => toggleSetting(option.id as keyof typeof settings)}
                trackColor={{ false: '#e0e0e0', true: Colors.primary + '80' }}
                thumbColor={settings[option.id as keyof typeof settings] ? Colors.primary : '#f4f3f4'}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Who can see my info?</Text>
                    <View style={styles.optionsContainer}>
                        {privacyOptions.slice(0, 5).map((option) => (
                            <PrivacyItem key={option.id} option={option} />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Messages</Text>
                    <View style={styles.optionsContainer}>
                        <PrivacyItem option={privacyOptions[5]} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Blocked Contacts</Text>
                    <View style={styles.blockedContainer}>
                        <TouchableOpacity style={styles.blockButton} onPress={handleBlockContact}>
                            <UserMinus size={22} color="#ff4444" />
                            <Text style={styles.blockButtonText}>Block a Contact</Text>
                        </TouchableOpacity>

                        {blockedContacts.length > 0 ? (
                            <View style={styles.blockedList}>
                                <Text style={styles.blockedTitle}>Blocked ({blockedContacts.length})</Text>
                                {blockedContacts.map((email, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.blockedItem}
                                        onLongPress={() => handleUnblockContact(email)}
                                    >
                                        <Text style={styles.blockedEmail}>{email}</Text>
                                        <TouchableOpacity onPress={() => handleUnblockContact(email)}>
                                            <Text style={styles.unblockText}>Unblock</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.noBlockedText}>No blocked contacts</Text>
                        )}
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Shield size={20} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        Your messages are end-to-end encrypted. Only you and the recipient can read them.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 5,
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.secondaryText,
        paddingHorizontal: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    optionsContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    optionIcon: {
        width: 30,
        alignItems: 'center',
        marginRight: 15,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        color: Colors.text,
    },
    optionSubtitle: {
        fontSize: 13,
        color: Colors.secondaryText,
        marginTop: 2,
    },
    blockedContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        padding: 20,
    },
    blockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#ffeeee',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffcccc',
    },
    blockButtonText: {
        fontSize: 15,
        color: '#ff4444',
        marginLeft: 8,
        fontWeight: '500',
    },
    blockedList: {
        marginTop: 15,
    },
    blockedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 10,
    },
    blockedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    blockedEmail: {
        fontSize: 14,
        color: Colors.text,
        flex: 1,
    },
    unblockText: {
        fontSize: 14,
        color: Colors.primary,
    },
    noBlockedText: {
        fontSize: 14,
        color: Colors.secondaryText,
        textAlign: 'center',
        marginTop: 15,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        margin: 20,
        padding: 15,
        borderRadius: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1565c0',
        marginLeft: 12,
        lineHeight: 18,
    },
});
