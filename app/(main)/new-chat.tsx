import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { Mail, Search, UserPlus, User, Send } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { useAuthStore } from '../../store/useAuthStore';

const UserItem = React.memo(({ item, onPress }: { item: any, onPress: (u: any) => void }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => onPress(item)}>
        <Image
            source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
        />
        <View style={styles.userInfo}>
            <Text style={styles.name}>{item.name || 'Unknown User'}</Text>
            <Text style={styles.email}>{item.email}</Text>
            {item.status && (
                <Text style={styles.status} numberOfLines={1}>{item.status}</Text>
            )}
        </View>
    </TouchableOpacity>
));

UserItem.displayName = 'UserItem';

export default function NewChatScreen() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const currentUser = useAuthStore((state) => state.user);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const searchResults = useQuery(
        api.users.searchUsers, 
        { 
            email: debouncedSearch,
        }
    );

    const createChat = useMutation(api.chats.createPrivateChat);
    const addContact = useMutation(api.contacts.addContact);
    const sendInvite = useMutation(api.auth.sendInvite);
    const existingChats = useQuery(api.chats.getUserChats, { userId: currentUser?.uid || "" }) || [];

    const isEmailFormat = debouncedSearch.includes('@') && debouncedSearch.includes('.');

    const handleInvite = async () => {
        if (!currentUser) return;
        
        try {
            const result = await sendInvite({
                fromEmail: currentUser.email || 'unknown',
                fromName: currentUser.displayName || 'Someone',
                toEmail: debouncedSearch,
            });

            if (result.success) {
                Alert.alert(
                    "Invite Sent!",
                    `Your invitation has been sent to ${debouncedSearch}. They will receive an email to join NHAPP!`,
                    [{ text: "OK" }]
                );
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to send invite.");
        }
    };

    const handleAddContact = async () => {
        if (!currentUser || !searchResults || searchResults.length === 0) return;

        const exactMatch = searchResults.find((u: any) => u.email.toLowerCase() === debouncedSearch.toLowerCase());
        if (!exactMatch) return;

        Alert.prompt(
            "Add Contact",
            `Enter a nickname for ${exactMatch.name} (optional):`,
            [
                { text: "Cancel", style: 'cancel' },
                { 
                    text: "Add", 
                    onPress: async (nickname?: string) => {
                        try {
                            await addContact({
                                ownerId: currentUser.uid,
                                contactEmail: exactMatch.email,
                                nickname: nickname || undefined,
                            });
                            Alert.alert("Contact Added", nickname ? `${nickname} has been added to your contacts.` : `${exactMatch.name} has been added to your contacts.`);
                        } catch {
                            Alert.alert("Error", "Could not add contact.");
                        }
                    }
                }
            ],
            'plain-text',
            ''
        );
    };

    const handleStartChat = async (targetUser: any) => {
        if (!currentUser) return;

        // Add as contact first
        try {
            await addContact({
                ownerId: currentUser.uid,
                contactEmail: targetUser.email,
            });
        } catch {
            // Contact might already exist
        }

        // Check if private chat already exists
        const existingPrivateChat = existingChats.find((chat: any) =>
            chat.type === "private" && chat.participants?.includes(targetUser.userId)
        );

        if (existingPrivateChat) {
            router.push(`/(main)/chat/${existingPrivateChat._id}`);
            return;
        }

        // Create new private chat
        try {
            const chatId = await createChat({
                participants: [currentUser.uid, targetUser.userId],
                currentUserId: currentUser.uid,
            });
            router.push(`/(main)/chat/${chatId}`);
        } catch {
            Alert.alert("Error", "Could not start chat.");
        }
    };

    const renderContent = () => {
        if (!debouncedSearch) {
            return (
                <View style={styles.emptyContainer}>
                    <Mail size={60} color={Colors.secondaryText} style={{ marginBottom: 20 }} />
                    <Text style={styles.emptyTitle}>Search by Email</Text>
                    <Text style={styles.emptyText}>
                        Enter an email address to find people on NHAPP.
                        {'\n'}
                        If they don&apos;t have an account, you can invite them.
                    </Text>
                </View>
            );
        }

        if (!isEmailFormat) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Enter a valid email address to search.</Text>
                </View>
            );
        }

        // Show search results
        if (searchResults && searchResults.length > 0) {
            return (
                <View style={styles.resultsContainer}>
                    <Text style={styles.sectionTitle}>Results</Text>
                    {searchResults.map((user: any) => (
                        <React.Fragment key={user.userId}>
                            <UserItem item={user} onPress={handleStartChat} />
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.addContactButton} onPress={handleAddContact}>
                                    <User size={20} color={Colors.primary} />
                                    <Text style={styles.addContactText}>Add</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.chatButton} onPress={() => handleStartChat(user)}>
                                    <Send size={20} color="#FFF" />
                                    <Text style={styles.chatButtonText}>Chat</Text>
                                </TouchableOpacity>
                            </View>
                        </React.Fragment>
                    ))}
                </View>
            );
        }

        // Show invite option
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.inviteCard}>
                    <View style={styles.inviteIcon}>
                        <Mail color="#FFF" size={32} />
                    </View>
                    <View style={styles.inviteInfo}>
                        <Text style={styles.inviteTitle}>Invite to NHAPP</Text>
                        <Text style={styles.inviteEmail}>{debouncedSearch}</Text>
                        <Text style={styles.inviteSubtext}>
                            They don&apos;t have NHAPP yet. Send them an invite!
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
                    <Send size={20} color="#FFF" />
                    <Text style={styles.inviteButtonText}>Send Invite</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchHeader}>
                <View style={styles.searchBar}>
                    <Search size={20} color={Colors.secondaryText} style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search by Email..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#A0A0A0"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                    />
                </View>
                <TouchableOpacity style={styles.createGroupItem} onPress={() => router.push('/(main)/create-group')}>
                    <View style={[styles.groupIcon, { backgroundColor: Colors.primary }]}>
                        <UserPlus color="#FFF" size={20} />
                    </View>
                    <Text style={styles.groupText}>New Group</Text>
                </TouchableOpacity>
            </View>

            {renderContent()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    searchHeader: {
        padding: 20,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    createGroupItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    groupText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.secondaryText,
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    userItem: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 15,
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    email: {
        fontSize: 13,
        color: Colors.secondaryText,
        marginTop: 2,
    },
    status: {
        fontSize: 12,
        color: Colors.secondaryText,
        marginTop: 4,
        fontStyle: 'italic',
    },
    addContactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: Colors.accent + '20',
        borderRadius: 25,
        marginTop: 15,
        borderWidth: 1,
        borderColor: Colors.accent,
    },
    addContactText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: Colors.primary,
        borderRadius: 25,
        marginTop: 10,
    },
    chatButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 10,
    },
    emptyText: {
        color: Colors.secondaryText,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    inviteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 20,
    },
    inviteIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    inviteInfo: {
        flex: 1,
    },
    inviteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    inviteEmail: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginBottom: 6,
    },
    inviteSubtext: {
        fontSize: 12,
        color: Colors.secondaryText,
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: Colors.primary,
        borderRadius: 25,
        width: '100%',
    },
    inviteButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
