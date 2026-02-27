import { useRouter } from 'expo-router';
import { ChevronLeft, Fingerprint, Lock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
// import * as LocalAuthentication from 'expo-local-authentication';

export default function LockedChatsScreen() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        authenticate();
    }, []);

    const authenticate = async () => {
        // In a real app, use expo-local-authentication:
        // const hasHardware = await LocalAuthentication.hasHardwareAsync();
        // const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Unlock Locked Chats" });
        // if (result.success) setIsAuthenticated(true);

        // Simulating biometric prompt delay for prototype
        setTimeout(() => {
            setIsAuthenticated(true);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Locked chats</Text>
            </View>

            {!isAuthenticated ? (
                <View style={styles.authContainer}>
                    <Lock size={60} color={Colors.primary} style={styles.icon} />
                    <Text style={styles.authTitle}>Locked chats are hidden</Text>
                    <Text style={styles.authSubtitle}>Use your face or fingerprint to open this chat.</Text>
                    <TouchableOpacity style={styles.authBtn} onPress={authenticate}>
                        <Fingerprint size={24} color="#FFF" style={{ marginRight: 10 }} />
                        <Text style={styles.authBtnText}>Unlock</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.vaultContainer}>
                    <View style={styles.emptyVault}>
                        <Lock size={40} color={Colors.secondaryText} style={{ marginBottom: 15 }} />
                        <Text style={styles.emptyTitle}>No locked chats</Text>
                        <Text style={styles.emptySubtitle}>
                            To lock a chat, long press it in your chat list and select &quot;Lock chat&quot;.
                        </Text>
                    </View>
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
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingHorizontal: 15,
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    authContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    icon: {
        marginBottom: 20,
    },
    authTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 10,
    },
    authSubtitle: {
        fontSize: 15,
        color: Colors.secondaryText,
        textAlign: 'center',
        marginBottom: 30,
    },
    authBtn: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignItems: 'center',
    },
    authBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#EA3336',
        marginTop: 15,
    },
    vaultContainer: {
        flex: 1,
    },
    emptyVault: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 15,
        color: Colors.secondaryText,
        textAlign: 'center',
    },
});
