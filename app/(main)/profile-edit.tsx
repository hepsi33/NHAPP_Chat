import { useMutation, useQuery } from "convex/react";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Check, Loader2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { useAuthStore } from '../../store/useAuthStore';

const MAX_NAME_LENGTH = 25;

export default function ProfileEditScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    
    const userProfile = useQuery(api.users.getUserById, { userId: user?.uid || "" });
    const updateProfile = useMutation(api.users.updateProfile);
    
    const [name, setName] = useState(userProfile?.name || user?.displayName || "");
    const [avatar, setAvatar] = useState<string | null>(userProfile?.avatar || user?.photoURL || null);
    const [isSaving, setIsSaving] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!user?.uid) return;
        
        if (!name.trim()) {
            Alert.alert("Name Required", "Please enter your name.");
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({
                userId: user.uid,
                name: name.trim(),
                avatar: avatar || undefined,
            });

            setUser({
                ...user,
                displayName: name.trim(),
                photoURL: avatar || null,
            });

            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = 
        name !== (userProfile?.name || user?.displayName || "") ||
        avatar !== (userProfile?.avatar || user?.photoURL || null);

    const remainingChars = MAX_NAME_LENGTH - name.length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity 
                    onPress={handleSave} 
                    disabled={!hasChanges || isSaving || !name.trim()}
                    style={styles.saveButton}
                >
                    {isSaving ? (
                        <Loader2 size={24} color={Colors.primary} />
                    ) : (
                        <Check color={!hasChanges || !name.trim() ? Colors.secondaryText : Colors.primary} size={24} />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Camera color={Colors.primary} size={40} />
                        </View>
                    )}
                    <View style={styles.cameraButton}>
                        <Camera size={16} color="#FFF" />
                    </View>
                </TouchableOpacity>

                <Text style={styles.tapToChange}>Tap to change photo</Text>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Name</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                            placeholderTextColor={Colors.secondaryText}
                            maxLength={MAX_NAME_LENGTH}
                        />
                        <Text style={[
                            styles.charCount,
                            remainingChars < 5 && styles.charCountWarning
                        ]}>
                            {remainingChars}
                        </Text>
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.readOnlyContainer}>
                        <Text style={styles.emailText}>{user?.email}</Text>
                        <Text style={styles.emailNote}>Email cannot be changed</Text>
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>Status</Text>
                    <TouchableOpacity 
                        style={styles.statusButton}
                        onPress={() => router.push('/(main)/status-settings')}
                    >
                        <Text style={styles.statusText}>
                            {userProfile?.status || "Hey there! I'm using NHAPP"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Tips</Text>
                    <Text style={styles.tipsText}>• A clear photo helps friends recognize you</Text>
                    <Text style={styles.tipsText}>• You can change your name anytime</Text>
                    <Text style={styles.tipsText}>• Update your status to share what you're up to</Text>
                </View>
            </View>
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
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    saveButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 30,
    },
    avatarContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        overflow: 'hidden',
        marginBottom: 10,
    },
    avatar: {
        width: 140,
        height: 140,
    },
    avatarPlaceholder: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    tapToChange: {
        fontSize: 14,
        color: Colors.primary,
        marginBottom: 30,
    },
    inputSection: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.secondaryText,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        paddingVertical: 14,
    },
    charCount: {
        fontSize: 12,
        color: Colors.secondaryText,
    },
    charCountWarning: {
        color: '#ff6b6b',
    },
    readOnlyContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    emailText: {
        fontSize: 16,
        color: Colors.text,
    },
    emailNote: {
        fontSize: 12,
        color: Colors.secondaryText,
        marginTop: 4,
    },
    statusButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    statusText: {
        fontSize: 15,
        color: Colors.primary,
    },
    tipsContainer: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        width: '90%',
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 10,
    },
    tipsText: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginBottom: 5,
    },
});
