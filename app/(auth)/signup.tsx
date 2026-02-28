import { useMutation } from "convex/react";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const sendOTP = useMutation(api.auth.sendOTP);

    const handleSendOTP = async () => {
        if (!email || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        if (!name || name.trim().length < 2) {
            Alert.alert('Invalid Name', 'Please enter your name.');
            return;
        }

        setLoading(true);

        try {
            await sendOTP({ email, name: name.trim() });
            router.push({ pathname: '/(auth)/otp', params: { email, name, mode: 'signup' } });
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to send OTP.');
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                    Enter your details to get started
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
                    onPress={handleSendOTP}
                    disabled={!email || !name || loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Sending...' : 'Send Verification Code'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginLink}>Log In</Text>
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    dividerLine: {
        width: 100,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: Colors.secondaryText,
    },
    loginButton: {
        marginTop: 10,
    },
    loginText: {
        color: Colors.secondaryText,
        fontSize: 14,
    },
    loginLink: {
        color: Colors.primary,
        fontWeight: '600',
    },
});
