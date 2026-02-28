import { useMutation, useQuery } from "convex/react";
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Lock, MessageSquare, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../../../constants/Colors';
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthStore } from '../../../store/useAuthStore';
import { useContactsSync } from '../../../hooks/useContactsSync';

const ChatListItem = React.memo(({ item }: { item: any }) => {
    const router = useRouter();
    const muteChat = useMutation(api.chats.muteChat);
    const archiveChat = useMutation(api.chats.archiveChat);

    ChatListItem.displayName = 'ChatListItem';

    const formatTime = (timestamp: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return format(date, 'EEEE');
        } else {
            return format(date, 'MMM d');
        }
    };

    const handleMute = async () => {
        try {
            await muteChat({ chatId: item._id as Id<"chats"> });
        } catch (e) {
            console.log('Error muting chat:', e);
        }
    };

    const handleArchive = async () => {
        try {
            await archiveChat({ chatId: item._id as Id<"chats"> });
        } catch (e) {
            console.log('Error archiving chat:', e);
        }
    };

    const renderRightActions = () => {
        return (
            <View style={{ flexDirection: 'row', width: 140 }}>
                <TouchableOpacity 
                    style={{ flex: 1, backgroundColor: '#A0A0A0', justifyContent: 'center', alignItems: 'center' }}
                    onPress={handleMute}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Mute</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{ flex: 1, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }}
                    onPress={handleArchive}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Archive</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const hasUnread = item.unreadCount > 0;

    return (
        <Swipeable renderRightActions={renderRightActions}>
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => router.push(`/(main)/chat/${item._id}`)}
            >
                <Image
                    source={{ uri: typeof item.avatar === 'string' && item.avatar.length > 0 ? item.avatar : 'https://via.placeholder.com/150' }}
                    style={[styles.avatar, hasUnread && styles.avatarUnread]}
                />
                <View style={styles.chatInfo}>
                    <View style={styles.chatRow}>
                        <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
                            {item.type === 'group' ? '👥 ' : ''}{item.name || "Chat"}
                        </Text>
                        <Text style={[styles.time, hasUnread && styles.timeUnread]}>
                            {formatTime(item.lastMessageTime || item.updatedAt)}
                        </Text>
                    </View>
                    <View style={styles.chatRow}>
                        <Text style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} numberOfLines={1}>
                            {item.lastMessage || 'No messages yet'}
                        </Text>
                        {hasUnread && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
});

export default function ChatsScreen() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const { hasPermission, isSyncing, syncContacts, requestPermission } = useContactsSync();

    // Convex Query for chat list
    const chats = useQuery(api.chats.getUserChats, {
        userId: user?.uid || ""
    });

    const [searchQuery, setSearchQuery] = useState('');

    const handleSyncContacts = async () => {
        if (!hasPermission) {
            const granted = await requestPermission();
            if (!granted) {
                Alert.alert('Permission Required', 'Please grant contacts permission to sync your contacts.');
                return;
            }
        }

        try {
            const result = await syncContacts();
            Alert.alert(
                'Contacts Synced',
                `Found ${result.totalDeviceContacts} contacts.\nAdded ${result.newContacts} new contacts to NHAPP.`
            );
        } catch (e: any) {
            Alert.alert('Sync Failed', e.message || 'Could not sync contacts.');
        }
    };

    const filteredChats = chats?.filter((chat: any) =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (chats === undefined) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Loading chats...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#A0A0A0"
                />
            </View>

            <TouchableOpacity style={styles.lockedChatsContainer} onPress={() => router.push('/(main)/locked-chats')}>
                <Lock size={20} color={Colors.primary} style={{ marginRight: 15 }} />
                <Text style={styles.lockedChatsText}>Locked chats</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.lockedChatsContainer, { marginTop: 5 }]} 
                onPress={handleSyncContacts}
                disabled={isSyncing}
            >
                {isSyncing ? (
                    <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 15 }} />
                ) : (
                    <Users size={20} color={Colors.primary} style={{ marginRight: 15 }} />
                )}
                <Text style={styles.lockedChatsText}>
                    {isSyncing ? 'Syncing contacts...' : 'Sync Contacts'}
                </Text>
            </TouchableOpacity>

            {chats.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Start a new conversation!</Text>
                </View>
            ) : filteredChats?.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No chats found matching &quot;{searchQuery}&quot;</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <ChatListItem item={item} />}

                />
            )}
            <TouchableOpacity style={styles.fab} onPress={() => router.push('/(main)/new-chat')}>
                <MessageSquare color="#FFF" size={24} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    searchContainer: {
        padding: 15,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    searchInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: Colors.text,
    },
    lockedChatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        backgroundColor: Colors.background,
    },
    lockedChatsText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    chatInfo: {
        flex: 1,
    },
    chatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text,
    },
    time: {
        fontSize: 12,
        color: Colors.secondaryText,
    },
    timeUnread: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.secondaryText,
        flex: 1,
    },
    lastMessageUnread: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '500',
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    avatarUnread: {
        borderColor: Colors.primary,
    },
    nameUnread: {
        fontWeight: '800',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: Colors.secondaryText,
        fontSize: 16,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        backgroundColor: Colors.primary,
        width: 65,
        height: 65,
        borderRadius: 32.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    fabAI: {
        position: 'absolute',
        bottom: 105, // Above the main FAB
        right: 25,
        backgroundColor: '#CDB4DB', // Pastel Purple AI theme
        width: 55,
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#CDB4DB',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },
});
