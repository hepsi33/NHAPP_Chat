import { useMutation } from "convex/react";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    const createOrGetUser = useMutation(api.users.createOrGetUser);

    const handleAuth = async () => {
        if (!email || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const user = await createOrGetUser({ email, name: name || email.split('@')[0] });

            if (!user) {
                Alert.alert('Error', 'Could not create or get user.');
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
                <Text style={styles.title}>Welcome to NHAPP</Text>
                <Text style={styles.subtitle}>
                    Enter your email to continue
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholderTextColor="#A0A0A0"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#A0A0A0"
                />

                <TouchableOpacity
                    style={[styles.button, (!email || !name || loading) && styles.buttonDisabled]}
                    onPress={handleAuth}
                    disabled={!email || !name || loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Please wait...' : 'CONTINUE'}
                    </Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        color: Colors.primary,
        fontWeight: '700',
        marginBottom: 10,
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
        height: 50,
        borderBottomWidth: 2,
        borderBottomColor: Colors.accent,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: Colors.text,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: Colors.buttonDisabled,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    toggleContext: {
        marginTop: 30,
    },
    toggleText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
