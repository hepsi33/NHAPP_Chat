import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Edit2, Loader2, Mail, MailPlus, Shield, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';

export default function EmailScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    
    const [isEditing, setIsEditing] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [showAddEmail, setShowAddEmail] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const primaryEmail = user?.email || "Not set";

    const handleSaveEmail = async () => {
        if (!newEmail.includes('@')) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        setIsVerifying(true);
        
        setTimeout(() => {
            setIsVerifying(false);
            Alert.alert(
                "Verification Sent",
                `We've sent a verification link to ${newEmail}. Please check your inbox and click the link to verify your new email address.`,
                [
                    { 
                        text: "OK", 
                        onPress: () => {
                            setShowAddEmail(false);
                            setNewEmail("");
                            setIsEditing(false);
                        }
                    }
                ]
            );
        }, 1500);
    };

    const handleChangePrimaryEmail = () => {
        Alert.alert(
            "Change Primary Email",
            "This will change your login email. You'll need to verify the new email address.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Continue", 
                    onPress: () => {
                        setShowAddEmail(true);
                        setIsEditing(true);
                    }
                },
            ]
        );
    };

    const handleAddSecondaryEmail = () => {
        setShowAddEmail(true);
        setIsEditing(true);
    };

    const handleVerifySecondaryEmail = () => {
        Alert.alert(
            "Verify Email",
            "Enter the verification code sent to your email.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Verify", 
                    onPress: () => {
                        Alert.alert("Success", "Email verified successfully!");
                    }
                },
            ]
        );
    };

    const handleRemoveEmail = (email: string) => {
        Alert.alert(
            "Remove Email",
            `Are you sure you want to remove ${email}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Remove", 
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert("Success", "Email removed successfully!");
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Email Address</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Primary Email</Text>
                    <View style={styles.emailCard}>
                        <View style={styles.emailInfo}>
                            <View style={styles.emailIconContainer}>
                                <Mail size={22} color={Colors.primary} />
                            </View>
                            <View style={styles.emailDetails}>
                                <Text style={styles.emailAddress}>{primaryEmail}</Text>
                                <View style={styles.verifiedBadge}>
                                    <Check size={12} color="#4caf50" />
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.editButton}
                            onPress={handleChangePrimaryEmail}
                        >
                            <Edit2 size={18} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sectionInfo}>
                        This is the email you use to log in and receive notifications.
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Secondary Emails</Text>
                        <TouchableOpacity onPress={handleAddSecondaryEmail}>
                            <View style={styles.addButton}>
                                <MailPlus size={16} color={Colors.primary} />
                                <Text style={styles.addButtonText}>Add</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.emptyState}>
                        <Mail size={40} color={Colors.secondaryText} />
                        <Text style={styles.emptyText}>No secondary emails added</Text>
                        <Text style={styles.emptySubtext}>
                            Add another email to help recover your account
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Why add an email?</Text>
                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <Shield size={18} color={Colors.primary} />
                            <Text style={styles.benefitText}>Recover your account if you lose access</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Mail size={18} color={Colors.primary} />
                            <Text style={styles.benefitText}>Get notifications on multiple devices</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Check size={18} color={Colors.primary} />
                            <Text style={styles.benefitText}>Extra layer of security</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Shield size={20} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        Your email addresses are encrypted and never shared with third parties.
                    </Text>
                </View>
            </ScrollView>

            <Modal
                visible={showAddEmail}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddEmail(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isEditing ? "Add New Email" : "Change Primary Email"}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => {
                                    setShowAddEmail(false);
                                    setNewEmail("");
                                }}
                            >
                                <X size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                value={newEmail}
                                onChangeText={setNewEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={Colors.secondaryText}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity 
                                style={[
                                    styles.saveButton,
                                    (!newEmail || isVerifying) && styles.saveButtonDisabled
                                ]}
                                onPress={handleSaveEmail}
                                disabled={!newEmail || isVerifying}
                            >
                                {isVerifying ? (
                                    <Loader2 size={20} color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Email</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.secondaryText,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    sectionInfo: {
        fontSize: 13,
        color: Colors.secondaryText,
        marginTop: 10,
        lineHeight: 18,
    },
    emailCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    emailInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    emailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    emailDetails: {
        flex: 1,
    },
    emailAddress: {
        fontSize: 15,
        color: Colors.text,
        fontWeight: '500',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    verifiedText: {
        fontSize: 12,
        color: '#4caf50',
        marginLeft: 4,
    },
    editButton: {
        padding: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    addButtonText: {
        fontSize: 13,
        color: Colors.primary,
        marginLeft: 4,
        fontWeight: '500',
    },
    emptyState: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 15,
        color: Colors.text,
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        color: Colors.secondaryText,
        marginTop: 4,
        textAlign: 'center',
    },
    benefitsList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    benefitText: {
        fontSize: 14,
        color: Colors.text,
        marginLeft: 12,
        flex: 1,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        margin: 20,
        padding: 15,
        borderRadius: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1565c0',
        marginLeft: 12,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    modalBody: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});
