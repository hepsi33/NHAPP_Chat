import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bell, BellOff, Image as ImageIcon, Lock, MoreVertical, Search, Star, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useAuthStore } from '../../store/useAuthStore';

export default function ChatInfoScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    
    const chat = useQuery(api.chats.getChat, { chatId: id as Id<"chats"> });
    const messages = useQuery(api.messages.getMessages, { chatId: id as Id<"chats"> });
    
    const [notifications, setNotifications] = useState(true);
    
    const isGroup = chat?.type === 'group';
    const otherParticipantId = chat?.participants?.find((p: string) => p !== user?.uid);
    const otherUser = useQuery((api as any).users.getUserById, otherParticipantId ? { userId: otherParticipantId } : "skip");

    const mediaMessages = messages?.filter((m: any) => m.type === 'image') || [];
    const starredMessages = useQuery((api as any).reactions.getStarredMessages, { userId: user?.uid || "" });
    const chatStarred = starredMessages?.filter((m: any) => m.chatId === id) || [];

    const handleToggleNotifications = () => {
        setNotifications(!notifications);
        Alert.alert(notifications ? "Notifications Muted" : "Notifications Enabled", 
            notifications ? "You won't receive notifications for this chat." : "You'll receive notifications for this chat.");
    };

    const renderMedia = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.mediaItem}>
            <Image source={{ uri: item.text }} style={styles.mediaImage} />
        </TouchableOpacity>
    );

    const renderSettingItem = ({ icon: Icon, title, subtitle, onPress, showSwitch, switchValue }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={showSwitch}>
            <View style={styles.settingIcon}>
                <Icon size={24} color={Colors.primary} />
            </View>
            <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {showSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onPress}
                    trackColor={{ false: '#e0e0e0', true: Colors.primary + '80' }}
                    thumbColor={switchValue ? Colors.primary : '#f4f3f4'}
                />
            ) : (
                <Text style={styles.chevron}>›</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chat Info</Text>
            </View>

            <FlatList
                data={[]}
                ListHeaderComponent={
                    <>
                        {/* Profile Section */}
                        <View style={styles.profileSection}>
                            <Image 
                                source={{ uri: chat?.avatar || otherUser?.avatar || 'https://via.placeholder.com/150' }} 
                                style={styles.profileImage}
                            />
                            <Text style={styles.profileName}>{chat?.name || otherUser?.name || 'Chat'}</Text>
                            {otherUser?.status && (
                                <Text style={styles.profileStatus}>{otherUser.status}</Text>
                            )}
                            {isGroup && (
                                <Text style={styles.participantCount}>
                                    {chat?.participants?.length || 0} participants
                                </Text>
                            )}
                        </View>

                        {/* Media Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Shared Media</Text>
                            <View style={styles.mediaGrid}>
                                {mediaMessages.length > 0 ? (
                                    mediaMessages.slice(0, 6).map((msg: any, idx: number) => (
                                        <TouchableOpacity key={idx} style={styles.mediaItem}>
                                            <Image source={{ uri: msg.text }} style={styles.mediaImage} />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.emptyMedia}>
                                        <ImageIcon size={40} color={Colors.secondaryText} />
                                        <Text style={styles.emptyText}>No shared media yet</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Settings Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Settings</Text>
                            <View style={styles.settingsGroup}>
                                {renderSettingItem({
                                    icon: notifications ? Bell : BellOff,
                                    title: notifications ? "Notifications" : "Muted",
                                    subtitle: notifications ? "Enabled" : "Disabled",
                                    showSwitch: true,
                                    switchValue: notifications,
                                    onPress: handleToggleNotifications
                                })}
                                {renderSettingItem({
                                    icon: Star,
                                    title: "Starred Messages",
                                    subtitle: `${chatStarred.length} messages`,
                                    onPress: () => router.push('/(main)/starred-messages')
                                })}
                            </View>
                        </View>

                        {/* Search Section */}
                        <View style={styles.section}>
                            <View style={styles.settingsGroup}>
                                {renderSettingItem({
                                    icon: Search,
                                    title: "Search in Chat",
                                    onPress: () => Alert.alert("Search", "Search coming soon!")
                                })}
                            </View>
                        </View>

                        {/* Block Section */}
                        <View style={styles.section}>
                            <View style={styles.settingsGroup}>
                                {renderSettingItem({
                                    icon: Lock,
                                    title: "Block",
                                    subtitle: "You won't receive messages from this user",
                                    onPress: () => Alert.alert("Block User", "Are you sure you want to block this user?")
                                })}
                            </View>
                        </View>

                        <View style={styles.dangerSection}>
                            <TouchableOpacity 
                                style={styles.dangerButton}
                                onPress={() => Alert.alert("Delete Chat", "This will delete this chat and all its messages. This cannot be undone.", [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Delete", style: "destructive", onPress: () => router.back() }
                                ])}
                            >
                                <Text style={styles.dangerText}>Delete Chat</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
                renderItem={null}
            />
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
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 5,
    },
    profileStatus: {
        fontSize: 14,
        color: Colors.primary,
    },
    participantCount: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginTop: 5,
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
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
    },
    mediaItem: {
        width: '31%',
        aspectRatio: 1,
        margin: '1%',
        borderRadius: 8,
        overflow: 'hidden',
    },
    mediaImage: {
        width: '100%',
        height: '100%',
    },
    emptyMedia: {
        width: '100%',
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        color: Colors.secondaryText,
    },
    settingsGroup: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    settingIcon: {
        marginRight: 15,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: Colors.text,
    },
    settingSubtitle: {
        fontSize: 13,
        color: Colors.secondaryText,
        marginTop: 2,
    },
    chevron: {
        fontSize: 24,
        color: Colors.secondaryText,
    },
    dangerSection: {
        marginTop: 30,
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    dangerButton: {
        backgroundColor: '#fee',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    dangerText: {
        color: '#ff4444',
        fontWeight: '600',
    },
});
