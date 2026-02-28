import { useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { useAuthStore } from '../../store/useAuthStore';

export default function StarredMessagesScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const starredMessages = useQuery((api as any).reactions.getStarredMessages, {
        userId: user?.uid || ""
    });

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.messageItem}
            onPress={() => router.push(`/(main)/chat/${item.chatId}`)}
        >
            <View style={styles.messageContent}>
                {item.type === 'image' ? (
                    <Image source={{ uri: item.text }} style={styles.messageImage} />
                ) : (
                    <Text style={styles.messageText} numberOfLines={2}>{item.text}</Text>
                )}
                <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
            </View>
            <View style={styles.starIcon}>
                <Star size={16} color={Colors.primary} fill={Colors.primary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Starred Messages</Text>
            </View>

            {starredMessages && starredMessages.length > 0 ? (
                <FlatList
                    data={starredMessages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Star size={60} color={Colors.secondaryText} />
                    <Text style={styles.emptyTitle}>No Starred Messages</Text>
                    <Text style={styles.emptyText}>
                        Star messages you want to remember and they'll appear here.
                    </Text>
                </View>
            )}
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
    listContent: {
        padding: 10,
    },
    messageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    messageContent: {
        flex: 1,
    },
    messageText: {
        fontSize: 15,
        color: Colors.text,
    },
    messageImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 5,
    },
    messageTime: {
        fontSize: 12,
        color: Colors.secondaryText,
        marginTop: 5,
    },
    starIcon: {
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 20,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.secondaryText,
        textAlign: 'center',
        marginTop: 10,
    },
});
