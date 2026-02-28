import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Send as SendIcon, ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

    const chat = useQuery(api.chats.getChat, {
        chatId: id as Id<"chats">,
    });

    const messagesData = useQuery(api.messages.getMessages, {
        chatId: id as Id<"chats">
    });

    const sendMessage = useMutation(api.messages.sendMessage);
    const markRead = useMutation(api.messages.markRead);

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

    const handleSend = async () => {
        if (!inputText.trim() || !id || !user) return;
        
        await sendMessage({
            chatId: id as Id<"chats">,
            senderId: user.uid,
            text: inputText,
            type: "text",
        });
        
        setInputText('');
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === user?.uid;
        return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.messageTime}>
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
                            <Image 
                                source={{ uri: chat?.avatar || 'https://via.placeholder.com/150' }} 
                                style={styles.headerAvatar}
                            />
                            <Text style={styles.headerTitleText}>{chat?.name || 'Chat'}</Text>
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
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
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
        color: '#000',
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        alignSelf: 'flex-end',
        marginTop: 4,
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
    sendButton: {
        padding: 8,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    headerTitleText: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
    },
    backButton: {
        padding: 4,
    },
});
