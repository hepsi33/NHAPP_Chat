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
    const { email, name, mode } = useLocalSearchParams<{ email: string; name: string; mode: string }>();
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const verifyOTP = useMutation(api.auth.verifyOTP);
    const resendOTP = useMutation(api.auth.resendOTP);

    const handleVerify = async () => {
        if (!token || token.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.');
            return;
        }

        if (!email) {
            Alert.alert('Error', 'Email not found. Please start over.');
            return;
        }

        setLoading(true);

        try {
            const result = await verifyOTP({ 
                email, 
                code: token 
            });

            if (result.user) {
                setUser({
                    uid: result.user.userId,
                    email: result.user.email,
                    displayName: result.user.name || null,
                    photoURL: result.user.avatar || null,
                });

                router.replace('/(main)/(tabs)/chats');
            } else {
                Alert.alert('Error', 'Verification failed. Please try again.');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Invalid or expired code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;

        setLoading(true);
        try {
            await resendOTP({ email });
            Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to resend code.');
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
                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>
                    We've sent a verification code to{"\n"}
                    <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{email}</Text>
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
                    <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.resendButton} 
                    onPress={handleResend}
                    disabled={loading}
                >
                    <Text style={styles.resendText}>
                        Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
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
    resendButton: {
        marginTop: 30,
    },
    resendText: {
        color: Colors.secondaryText,
        fontSize: 14,
    },
    resendLink: {
        color: Colors.primary,
        fontWeight: '600',
    },
});
