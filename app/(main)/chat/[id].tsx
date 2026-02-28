import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send as SendIcon, ChevronLeft, Plus, X, MoreVertical, Image as ImageIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Alert, Clipboard, FlatList, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const chat = useQuery(api.chats.getChat, {
        chatId: id as Id<"chats">,
        currentUserId: user?.uid,
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
    const deleteMessage = useMutation((api as any).messages.deleteMessage);
    const addReaction = useMutation((api as any).reactions.addReaction);
    const starMessage = useMutation((api as any).reactions.starMessage);
    const setWallpaper = useMutation((api as any).reactions.setWallpaper);
    const generateUploadUrl = useMutation((api as any).storage.generateUploadUrl);
    const getImageUrl = useMutation((api as any).storage.getImageUrl);
    const markImageViewed = useMutation((api as any).messages.markImageViewed);
    const deleteImageFile = useMutation((api as any).messages.deleteImageFile);
    
    const wallpaperData = useQuery((api as any).reactions.getWallpaper, id ? { chatId: id } : "skip");
    const [chatWallpaper, setChatWallpaper] = useState<string | null>(null);
    const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

    useEffect(() => {
        if (wallpaperData) {
            setChatWallpaper(wallpaperData);
        }
    }, [wallpaperData]);

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
            await uploadImage(result.assets[0].uri, id as string, user.uid);
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
                await uploadImage(result.assets[0].uri, id as string, user.uid);
            }
        } else {
            Alert.alert("Permission Required", "Please grant camera permission to take photos.");
        }
    };

    const uploadImage = async (uri: string, chatId: string, senderId: string) => {
        setIsUploading(true);
        try {
            // Get upload URL from Convex
            const uploadUrl = await generateUploadUrl({});
            
            // Upload to Convex storage
            const response = await fetch(uri);
            const blob = await response.blob();
            
            const uploadResult = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": "image/jpeg" },
                body: blob,
            });
            
            if (!uploadResult.ok) {
                throw new Error("Upload failed");
            }
            
            const { storageId } = await uploadResult.json();
            
            // Send message with storage ID
            await sendMessage({
                chatId: chatId as Id<"chats">,
                senderId: senderId,
                text: storageId, // Store the storage ID, not the URI
                type: "image",
            });
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Error", "Failed to send image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Handle viewing image - mark as viewed and delete if from self (like WhatsApp)
    const handleImagePress = async (item: any) => {
        setSelectedImage(item.text);
        
        // If I'm the sender and image hasn't been viewed by recipient, mark as viewed
        if (item.senderId === user?.uid && item.status !== 'viewed') {
            try {
                await markImageViewed({ messageId: item._id });
            } catch (e) {
                console.log("Error marking image viewed:", e);
            }
        }
    };

    // When closing image viewer, check if we should delete the image (WhatsApp style)
    const handleCloseImageViewer = async () => {
        const imageMsg = messages.find(m => m.text === selectedImage && m.type === 'image');
        
        // If sender is viewing and recipient has seen it, delete the image
        if (imageMsg && imageMsg.senderId === user?.uid && imageMsg.status === 'viewed') {
            try {
                await deleteImageFile({ messageId: imageMsg._id });
            } catch (e) {
                console.log("Error deleting image:", e);
            }
        }
        
        setSelectedImage(null);
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

    const handleDeleteMessage = async (messageId: string) => {
        Alert.alert(
            "Delete Message",
            "Are you sure you want to delete this message?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: 'destructive',
                    onPress: async () => {
                        await deleteMessage({ messageId: messageId as Id<"messages"> });
                    }
                },
            ]
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'read': return '✓✓';
            case 'viewed': return '👁️';
            default: return '';
        }
    };

    const handleChatOptions = () => {
        Alert.alert(
            "Chat Options",
            undefined,
            [
                { text: "Change Wallpaper", onPress: handleChangeWallpaper },
                { text: "View Contact", onPress: () => router.push(`/chat-info?id=${id}` as any) },
                { text: "Search", onPress: () => Alert.alert("Search", "Message search coming soon!") },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const handleChangeWallpaper = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.3,
        });

        if (!result.canceled && result.assets[0] && id) {
            await setWallpaper({ chatId: id as Id<"chats">, wallpaper: result.assets[0].uri });
            setChatWallpaper(result.assets[0].uri);
            Alert.alert("Success", "Wallpaper updated!");
        }
    };

    const handleClearWallpaper = async () => {
        if (id) {
            await setWallpaper({ chatId: id as Id<"chats">, wallpaper: undefined });
            setChatWallpaper(null);
            Alert.alert("Success", "Wallpaper cleared!");
        }
    };

    const handleAddReaction = async (messageId: string, emoji: string) => {
        if (!user) return;
        await addReaction({ messageId: messageId as Id<"messages">, emoji, userId: user.uid });
        setShowReactionPicker(null);
    };

    const handleStarMessage = async (messageId: string) => {
        if (!user || !id) return;
        await starMessage({ messageId: messageId as Id<"messages">, chatId: id as Id<"chats">, userId: user.uid });
        Alert.alert("Starred", "Message has been starred.");
    };

    const handleMessageOptions = (item: any) => {
        const options = ["React", "Copy", "Forward"];
        if (item.senderId === user?.uid) {
            options.push("Delete");
        }
        
        Alert.alert(
            "Message",
            undefined,
            [
                ...options.map(opt => ({
                    text: opt,
                    onPress: () => {
                        if (opt === "React") setShowReactionPicker(item._id);
                        if (opt === "Star") handleStarMessage(item._id);
                        if (opt === "Copy") {
                            Clipboard.setString(item.text);
                            Alert.alert("Copied", "Message copied to clipboard.");
                        }
                        if (opt === "Forward") {
                            Alert.alert("Forward", "Forward to another chat coming soon!");
                        }
                        if (opt === "Delete" && item.senderId === user?.uid) handleDeleteMessage(item._id);
                    }
                })),
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === user?.uid;
        const isImage = item.type === 'image';
        
        // For images stored in Convex, we'll try to get the URL
        const imageUri = isImage ? (item.text.startsWith('http') ? item.text : `https://doting-gull-823.convex.cloud/api/storage/${item.text}`) : null;
        
        return (
            <TouchableOpacity 
                onPress={() => isImage && handleImagePress(item)}
                disabled={!isImage}
                onLongPress={() => handleMessageOptions(item)}
            >
                <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                    {isImage ? (
                        <Image 
                            source={{ uri: imageUri || item.text }}
                            style={styles.messageImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.text}</Text>
                    )}
                    <View style={styles.messageFooter}>
                        <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMe && (
                            <Text style={[styles.messageStatus, item.status === 'read' && styles.messageStatusRead]}>
                                {getStatusIcon(item.status)}
                            </Text>
                        )}
                    </View>
                    {item.reactions && item.reactions.length > 0 && (
                        <View style={styles.reactionsContainer}>
                            {item.reactions.map((r: any, idx: number) => (
                                <Text key={idx} style={styles.reactionEmoji}>{r.emoji}</Text>
                            ))}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
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
                    headerRight: () => (
                        <TouchableOpacity onPress={handleChatOptions} style={styles.backButton}>
                            <MoreVertical size={24} color={Colors.text} />
                        </TouchableOpacity>
                    ),
                }} 
            />
            
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item._id}
                style={[styles.messageList, chatWallpaper && { backgroundColor: 'transparent' }]}
                contentContainerStyle={[
                    styles.messageListContent,
                    chatWallpaper && { backgroundColor: 'rgba(0,0,0,0.05)' }
                ]}
            />
            
            {chatWallpaper && (
                <Image 
                    source={{ uri: chatWallpaper }} 
                    style={styles.wallpaperBackground}
                    blurRadius={0}
                />
            )}
            
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

            <Modal
                visible={!!selectedImage}
                transparent
                animationType="fade"
                onRequestClose={handleCloseImageViewer}
            >
                <View style={styles.imageViewerContainer}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleCloseImageViewer}
                    >
                        <X size={28} color="#FFF" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image 
                            source={{ uri: selectedImage.startsWith('http') ? selectedImage : `https://doting-gull-823.convex.cloud/api/storage/${selectedImage}` }} 
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    wallpaperBackground: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        opacity: 0.3,
        zIndex: -1,
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
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    messageStatus: {
        fontSize: 10,
        color: '#DDD',
        marginLeft: 4,
    },
    messageStatusRead: {
        color: '#87CEEB',
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
    imageViewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    reactionsContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    reactionEmoji: {
        fontSize: 14,
        marginRight: 4,
    },
});
