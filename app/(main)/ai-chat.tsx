import { useRouter } from 'expo-router';
import { ChevronLeft, Send, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const MOCK_MESSAGES = [
    { id: '1', text: 'Hi! I am your AI assistant. How can I help you today?', sender: 'ai' },
];

export default function AIChatScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newUserMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages((prev) => [...prev, newUserMsg]);
        setInputText('');

        setTimeout(() => {
            const newAiMsg = {
                id: (Date.now() + 1).toString(),
                text: "I'm a prototype assistant, so I don't have a real brain yet. But I can pretend to answer!",
                sender: 'ai'
            };
            setMessages((prev) => [...prev, newAiMsg]);
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.avatarBg}>
                        <Sparkles size={20} color="#FFF" />
                    </View>
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.chatArea}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    renderItem={({ item }) => (
                        <View style={[styles.bubble, item.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                            {item.sender === 'ai' && <Sparkles size={14} color={Colors.primary} style={{ marginBottom: 5 }} />}
                            <Text style={[styles.messageText, item.sender === 'user' ? styles.messageTextUser : null]}>
                                {item.text}
                            </Text>
                        </View>
                    )}
                />

                <View style={styles.suggestionsContainer}>
                    <TouchableOpacity style={styles.suggestionChip}>
                        <Text style={styles.suggestionText}>Summarize unread chats</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.suggestionChip}>
                        <Text style={styles.suggestionText}>Draft a vacation reply</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ask AI anything..."
                        value={inputText}
                        onChangeText={setInputText}
                        placeholderTextColor={Colors.secondaryText}
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <Send size={20} color="#FFF" style={{ marginLeft: -2 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.chatBackground,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingHorizontal: 10,
    },
    backButton: {
        padding: 5,
        marginRight: 5,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#CDB4DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    chatArea: {
        flex: 1,
    },
    messageList: {
        padding: 15,
        paddingBottom: 20,
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    bubbleAi: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.background,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#CDB4DB',
    },
    bubbleUser: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: Colors.text,
    },
    messageTextUser: {
        color: '#FFF',
    },
    suggestionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginBottom: 10,
        gap: 10,
    },
    suggestionChip: {
        backgroundColor: 'rgba(205, 180, 219, 0.3)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CDB4DB',
    },
    suggestionText: {
        color: Colors.primary,
        fontWeight: '500',
        fontSize: 13,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: Colors.background,
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: Colors.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
