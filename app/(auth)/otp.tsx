import { useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { useAuthStore } from '../../store/useAuthStore';

export default function OTPScreen() {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const { email, name } = useLocalSearchParams<{ email: string; name: string }>();
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const createOrGetUser = useMutation(api.users.createOrGetUser);

    const handleVerify = async () => {
        if (!token || token !== '123456') {
            Alert.alert('Invalid Code', 'Please enter "123456" to continue (dev mode).');
            return;
        }

        setLoading(true);

        try {
            const user = await createOrGetUser({ 
                email: email || 'test@example.com', 
                name: name || 'Test User' 
            });

            if (!user) {
                Alert.alert('Error', 'Could not create user.');
                setLoading(false);
                return;
            }

            setUser({
                uid: user.userId,
                email: user.email,
                displayName: user.name || null,
                photoURL: user.avatar || null,
            });

            router.replace('/(main)/(tabs)/chats');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                <Text style={styles.title}>Enter Code</Text>
                <Text style={styles.subtitle}>
                    Enter "123456" to continue{"\n"}(dev mode)
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="_ _ _ _ _ _"
                    value={token}
                    onChangeText={setToken}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholderTextColor="#A0A0A0"
                />

                <TouchableOpacity
                    style={[styles.button, (token.length < 6 || loading) && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={token.length < 6 || loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Please wait...' : 'CONTINUE'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 80,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: Colors.primary,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.secondaryText,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    input: {
        width: '100%',
        height: 60,
        borderBottomWidth: 2,
        borderBottomColor: Colors.accent,
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 40,
        fontWeight: 'bold',
        color: Colors.text,
        letterSpacing: 8,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '60%',
        alignItems: 'center',
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: Colors.buttonDisabled,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
