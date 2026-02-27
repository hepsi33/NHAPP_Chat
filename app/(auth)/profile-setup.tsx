import { useMutation } from "convex/react";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileSetupScreen() {
    const [displayName, setDisplayName] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    const updateProfile = useMutation(api.users.updateProfile);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSaveProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Name Required', 'Please enter your name.');
            return;
        }

        if (!user) return;

        setLoading(true);
        try {
            await updateProfile({
                userId: user.uid,
                name: displayName,
                avatar: image || undefined,
                status: "Hey there! I am using NHAPP.",
            });

            setUser({
                ...user,
                displayName,
                photoURL: image || null,
                status: "Hey there! I am using NHAPP.",
            });

            router.replace('/(main)/(tabs)/chats');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Finish your profile</Text>
            <Text style={styles.subtitle}>
                Provide your name and a profile photo.
            </Text>

            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                    <View style={styles.placeholder}>
                        <Camera color={Colors.primary} size={40} />
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Your beautiful name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    maxLength={25}
                    placeholderTextColor="#A0A0A0"
                />
                <Text style={styles.charCount}>{25 - displayName.length}</Text>
            </View>

            <TouchableOpacity
                style={[styles.button, (!displayName || loading) && styles.buttonDisabled]}
                onPress={handleSaveProfile}
                disabled={!displayName || loading}
            >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>START CHATTING</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        color: Colors.primary,
        fontWeight: '700',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.secondaryText,
        textAlign: 'center',
        marginBottom: 40,
    },
    imageContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: Colors.background,
        elevation: 5,
    },
    avatar: {
        width: 140,
        height: 140,
    },
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderBottomWidth: 2,
        borderBottomColor: Colors.accent,
        paddingBottom: 5,
        marginBottom: 40,
    },
    input: {
        flex: 1,
        fontSize: 20,
        color: Colors.text,
        fontWeight: '500',
    },
    charCount: {
        color: Colors.secondaryText,
        fontSize: 14,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '80%',
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
