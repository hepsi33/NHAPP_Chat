import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send as SendIcon, ChevronLeft, Plus, Image as ImageIcon, Camera } from 'lucide-react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/Colors';
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthStore } from '../../../store/useAuthStore';

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const chat = useQuery(api.chats.getChat, {
        chatId: id as Id<"chats">,
    });

    const messagesData = useQuery(api.messages.getMessages, {
        chatId: id as Id<"chats">
    });

    const typingData = useQuery((api as any).typing.getTypingStatus, {
        chatId: id as Id<"chats">
    });

    const sendMessage = useMutation(api.messages.sendMessage);
    const markRead = useMutation(api.messages.markRead);
    const setTyping = useMutation((api as any).typing.setTyping);

    useEffect(() => {
        if (messagesData) {
            setMessages(messagesData.reverse());
        }
    }, [messagesData]);

    useEffect(() => {
        if (id && user && messagesData?.length) {
            markRead({ chatId: id as Id<"chats">, userId: user.uid });
        }
    }, [messagesData, id, user, markRead]);

    const handleTyping = (text: string) => {
        setInputText(text);
        
        if (!id || !user) return;
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set typing status
        if (!isTyping && text.length > 0) {
            setIsTyping(true);
            setTyping({ chatId: id as Id<"chats">, userId: user.uid, isTyping: true });
        }
        
        // Clear typing after 2 seconds of no typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTyping({ chatId: id as Id<"chats">, userId: user.uid, isTyping: false });
        }, 2000);
    };

    const handleSend = async () => {
        if (!inputText.trim() || !id || !user) return;
        
        // Clear typing status
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setIsTyping(false);
        await setTyping({ chatId: id as Id<"chats">, userId: user.uid, isTyping: false });
        
        await sendMessage({
            chatId: id as Id<"chats">,
            senderId: user.uid,
            text: inputText,
            type: "text",
        });
        
        setInputText('');
    };

    const handlePickImage = async () => {
        if (!id || !user) return;
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            await sendMessage({
                chatId: id as Id<"chats">,
                senderId: user.uid,
                text: result.assets[0].uri,
                type: "image",
            });
        }
    };

    const handleTakePhoto = async () => {
        if (!id || !user) return;
        
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        
        if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                await sendMessage({
                    chatId: id as Id<"chats">,
                    senderId: user.uid,
                    text: result.assets[0].uri,
                    type: "image",
                });
            }
        } else {
            Alert.alert("Permission Required", "Please grant camera permission to take photos.");
        }
    };

    const showAttachmentOptions = () => {
        Alert.alert(
            "Send Media",
            "Choose an option",
            [
                { text: "Take Photo", onPress: handleTakePhoto },
                { text: "Choose from Library", onPress: handlePickImage },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    // Get other user typing (exclude current user)
    const otherUserTyping = typingData?.find((t: any) => t.userId !== user?.uid);

    // Get other participant's online status
    const otherParticipantId = chat?.participants?.find((p: string) => p !== user?.uid);
    const otherUserStatus = useQuery((api as any).presence.getUserOnlineStatus, 
        otherParticipantId ? { userId: otherParticipantId } : "skip"
    );

    const formatLastSeen = (timestamp: number) => {
        if (!timestamp) return 'offline';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'last seen just now';
        if (diffMins < 60) return `last seen ${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `last seen ${diffHours}h ago`;
        
        return `last seen ${date.toLocaleDateString()}`;
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === user?.uid;
        const isImage = item.type === 'image';
        
        return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                {isImage ? (
                    <Image 
                        source={{ uri: item.text }} 
                        style={styles.messageImage}
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.text}</Text>
                )}
                <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{ 
                    headerTitle: () => (
                        <View style={styles.headerTitleContainer}>
                            <View style={styles.headerAvatarContainer}>
                                <Image 
                                    source={{ uri: chat?.avatar || 'https://via.placeholder.com/150' }} 
                                    style={styles.headerAvatar}
                                />
                                {otherUserStatus?.isOnline && (
                                    <View style={styles.onlineIndicator} />
                                )}
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitleText}>{chat?.name || 'Chat'}</Text>
                                <Text style={styles.headerSubtitleText}>
                                    {otherUserTyping ? 'typing...' : 
                                     otherUserStatus?.isOnline ? 'online' : 
                                     otherUserStatus?.lastSeen ? formatLastSeen(otherUserStatus.lastSeen) : ''}
                                </Text>
                            </View>
                        </View>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ChevronLeft size={28} color={Colors.text} />
                        </TouchableOpacity>
                    ),
                }} 
            />
            
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item._id}
                style={styles.messageList}
                contentContainerStyle={styles.messageListContent}
            />
            
            {otherUserTyping && (
                <View style={styles.typingContainer}>
                    <View style={styles.typingDots}>
                        <View style={[styles.typingDot, styles.typingDotActive]} />
                        <View style={[styles.typingDot, styles.typingDotActive]} />
                        <View style={[styles.typingDot, styles.typingDotActive]} />
                    </View>
                    <Text style={styles.typingText}>typing...</Text>
                </View>
            )}
            
            <View style={styles.inputContainer}>
                <TouchableOpacity onPress={showAttachmentOptions} style={styles.attachButton}>
                    <Plus size={24} color={Colors.primary} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={handleTyping}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    multiline
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                    <SendIcon size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    messageList: {
        flex: 1,
    },
    messageListContent: {
        padding: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.primary,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#e5e5e5',
    },
    messageText: {
        fontSize: 16,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 4,
    },
    myMessageText: {
        color: '#FFF',
    },
    theirMessageText: {
        color: '#000',
    },
    messageTime: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    myMessageTime: {
        color: '#DDD',
    },
    theirMessageTime: {
        color: '#666',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        maxHeight: 100,
        marginRight: 10,
    },
    attachButton: {
        padding: 8,
        marginRight: 5,
    },
    sendButton: {
        padding: 8,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatarContainer: {
        position: 'relative',
        marginRight: 10,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    headerTitleText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    headerSubtitleText: {
        fontSize: 12,
        color: Colors.secondaryText,
    },
    backButton: {
        padding: 4,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
    },
    typingDots: {
        flexDirection: 'row',
        marginRight: 8,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.secondaryText,
        marginHorizontal: 2,
    },
    typingDotActive: {
        backgroundColor: Colors.primary,
    },
    typingText: {
        fontSize: 13,
        color: Colors.secondaryText,
        fontStyle: 'italic',
    },
});
