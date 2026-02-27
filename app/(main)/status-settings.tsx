import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { api } from "../../convex/_generated/api";
import { useAuthStore } from '../../store/useAuthStore';

const MAX_STATUS_LENGTH = 100;

export default function StatusSettingsScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    
    const userProfile = useQuery(api.users.getUserById, { userId: user?.uid || "" });
    const updateProfile = useMutation(api.users.updateProfile);
    
    const [status, setStatus] = useState(userProfile?.status || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!user?.uid) return;
        
        setIsSaving(true);
        try {
            await updateProfile({
                userId: user.uid,
                status: status.trim() || "Hey there! I'm using NHAPP",
            });
            Alert.alert("Success", "Status updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update status. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const remainingChars = MAX_STATUS_LENGTH - status.length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Status</Text>
                <TouchableOpacity 
                    onPress={handleSave} 
                    disabled={isSaving || status === userProfile?.status}
                    style={styles.saveButton}
                >
                    <Check color={status === userProfile?.status ? Colors.secondaryText : Colors.primary} size={24} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={status}
                        onChangeText={setStatus}
                        placeholder="What's on your mind?"
                        placeholderTextColor={Colors.secondaryText}
                        maxLength={MAX_STATUS_LENGTH}
                        multiline
                        autoFocus
                    />
                    <Text style={[
                        styles.charCount,
                        remainingChars < 20 && styles.charCountWarning
                    ]}>
                        {remainingChars}
                    </Text>
                </View>

                <View style={styles.previewContainer}>
                    <Text style={styles.previewLabel}>Preview</Text>
                    <View style={styles.previewCard}>
                        <Text style={styles.previewText}>
                            {status.trim() || "Hey there! I'm using NHAPP"}
                        </Text>
                    </View>
                </View>

                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Tips</Text>
                    <Text style={styles.tipsText}>• Keep it short and simple</Text>
                    <Text style={styles.tipsText}>• Use emojis to express yourself</Text>
                    <Text style={styles.tipsText}>• Update your status regularly</Text>
                </View>
            </KeyboardAvoidingView>
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
        padding: 20,
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    input: {
        fontSize: 16,
        color: Colors.text,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: Colors.secondaryText,
        textAlign: 'right',
        marginTop: 10,
    },
    charCountWarning: {
        color: '#ff6b6b',
    },
    previewContainer: {
        marginTop: 25,
    },
    previewLabel: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginBottom: 10,
    },
    previewCard: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
    },
    previewText: {
        fontSize: 14,
        color: Colors.primary,
    },
    tipsContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
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
