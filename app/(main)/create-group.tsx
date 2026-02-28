import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { useAuthStore } from '../../store/useAuthStore';

const UserItem = React.memo(({ item, isSelected, toggleUser }: { item: any, isSelected: boolean, toggleUser: (id: string) => void }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => toggleUser(item.userId)}>
        <Image
            source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
        />
        <View style={styles.userInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.status}>{item.status}</Text>
        </View>
        {isSelected && (
            <View style={styles.checkIcon}>
                <Check size={16} color="#FFF" />
            </View>
        )}
    </TouchableOpacity>
));

UserItem.displayName = 'UserItem';

export default function CreateGroupScreen() {
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const currentUser = useAuthStore((state) => state.user);
    const router = useRouter();

    // Convex Hooks
    const users = useQuery(api.users.searchUsers, { email: "" }) || [];
    const filteredUsers = users.filter((u: any) => u.userId !== currentUser?.uid);
    const createGroupChat = useMutation(api.chats.createGroupChat);

    const toggleUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) {
            Alert.alert('Incomplete Info', 'Please provide a group name and select at least one member.');
            return;
        }

        if (!currentUser) return;

        setLoading(true);
        try {
            const chatId = await createGroupChat({
                name: groupName,
                participants: [currentUser.uid, ...selectedUsers],
                currentUserId: currentUser.uid,
            });

            router.replace(`/(main)/chat/${chatId}`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.input}
                    placeholder="Group Subject"
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholderTextColor="#A0A0A0"
                />
            </View>

            <Text style={styles.sectionTitle}>Select Members ({selectedUsers.length})</Text>

            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.userId}
                renderItem={({ item }) => (
                    <UserItem
                        item={item}
                        isSelected={selectedUsers.includes(item.userId)}
                        toggleUser={toggleUser}
                    />
                )}
            />

            <TouchableOpacity
                style={[styles.fab, (selectedUsers.length === 0 || !groupName) && styles.fabDisabled]}
                onPress={handleCreateGroup}
                disabled={loading}
            >
                <ArrowRight color="#FFF" size={26} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: 25,
        backgroundColor: Colors.bubbleLeft,
    },
    input: {
        fontSize: 18,
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        paddingVertical: 10,
        color: Colors.text,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.primary,
        padding: 15,
        paddingHorizontal: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    userItem: {
        flexDirection: 'row',
        padding: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
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
    status: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginTop: 2,
    },
    checkIcon: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 4,
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
    fabDisabled: {
        backgroundColor: Colors.buttonDisabled,
    },
});
