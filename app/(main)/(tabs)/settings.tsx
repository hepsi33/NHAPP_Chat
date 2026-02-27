import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { Bell, HelpCircle, Key, LogOut, Shield, User } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from '../../../store/useAuthStore';

export default function SettingsScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const userProfile = useQuery(api.users.getUserById, { userId: user?.uid || "" });

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{user?.displayName || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <Text style={styles.status}>{userProfile?.status || 'Hey there!'}</Text>
                </View>

                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(main)/account')}>
                        <Key size={24} color={Colors.primary} />
                        <View style={styles.menuText}>
                            <Text style={styles.menuTitle}>Account</Text>
                            <Text style={styles.menuSubtitle}>Privacy, security</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <User size={24} color={Colors.primary} />
                        <View style={styles.menuText}>
                            <Text style={styles.menuTitle}>Status</Text>
                            <Text style={styles.menuSubtitle}>Your status message</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Bell size={24} color={Colors.primary} />
                        <View style={styles.menuText}>
                            <Text style={styles.menuTitle}>Notifications</Text>
                            <Text style={styles.menuSubtitle}>Message notifications</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <HelpCircle size={24} color={Colors.primary} />
                        <View style={styles.menuText}>
                            <Text style={styles.menuTitle}>Help</Text>
                            <Text style={styles.menuSubtitle}>FAQ, contact us</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={24} color="#ff4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
    },
    email: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginTop: 5,
    },
    status: {
        fontSize: 14,
        color: Colors.primary,
        marginTop: 5,
    },
    menuSection: {
        paddingTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        marginLeft: 15,
    },
    menuTitle: {
        fontSize: 16,
        color: Colors.text,
    },
    menuSubtitle: {
        fontSize: 13,
        color: Colors.secondaryText,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        marginTop: 30,
        marginHorizontal: 20,
        backgroundColor: '#ffeeee',
        borderRadius: 10,
    },
    logoutText: {
        fontSize: 16,
        color: '#ff4444',
        marginLeft: 10,
    },
});
