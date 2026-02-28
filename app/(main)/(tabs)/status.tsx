import { useMutation, useQuery } from "convex/react";
import * as ImagePicker from 'expo-image-picker';
import { PlusCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from '../../../store/useAuthStore';

export default function StatusScreen() {
    const user = useAuthStore((state) => state.user);

    const statusesData = useQuery(api.status.listActiveStatuses, { currentUserId: user?.uid || "" });
    const createStatus = useMutation(api.status.createStatus);
    const deleteStatus = useMutation(api.status.deleteStatus);

    const [showAddModal, setShowAddModal] = useState(false);
    const [statusText, setStatusText] = useState('');

    const handleAddStatus = async () => {
        if (!user) return;

        // For now, support text status
        // Image status requires file upload infrastructure
        if (statusText.trim()) {
            try {
                await createStatus({
                    userId: user.uid,
                    type: "text",
                    text: statusText.trim(),
                });
                setStatusText('');
                setShowAddModal(false);
                Alert.alert("Success", "Status posted!");
            } catch (error) {
                Alert.alert("Error", "Failed to post status.");
            }
        } else {
            Alert.alert("Enter Status", "Please enter some text for your status.");
        }
    };

    const handleAddImageStatus = async () => {
        if (!user) return;
        
        Alert.alert(
            "Add Image Status",
            "Image status requires cloud storage. For now, you can only add text status.",
            [{ text: "OK" }]
        );
    };

    const showAddOptions = () => {
        Alert.alert(
            "Add Status",
            "What would you like to share?",
            [
                { text: "Text Status", onPress: () => setShowAddModal(true) },
                { text: "Image Status", onPress: handleAddImageStatus },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const myStatuses = statusesData?.me;
    const otherStatuses = statusesData?.others || [];

    if (statusesData === undefined) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const renderStatusItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.statusItem}>
            <View style={styles.statusRing}>
                <Image
                    source={{ uri: item.user?.avatar || 'https://via.placeholder.com/150' }}
                    style={styles.statusAvatar}
                />
            </View>
            <View style={styles.statusInfo}>
                <Text style={styles.statusName}>{item.user?.name || 'User'}</Text>
                <Text style={styles.statusTime}>
                    {item.statuses?.length || 0} status updates • {item.statuses?.[item.statuses.length - 1] ? new Date(item.statuses[item.statuses.length - 1].createdAt).toLocaleTimeString() : ''}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    Keyboard.dismiss();
                    setShowAddModal(false);
                }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView 
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}
                        >
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Add Status</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="What's on your mind?"
                                    value={statusText}
                                    onChangeText={setStatusText}
                                    multiline
                                    maxLength={139}
                                    autoFocus
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity 
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            setShowAddModal(false);
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.postButton}
                                        onPress={handleAddStatus}
                                    >
                                        <Text style={styles.postButtonText}>Post</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <FlatList
                data={otherStatuses}
                renderItem={renderStatusItem}
                keyExtractor={(item, index) => item.user?.userId || index.toString()}
                ListHeaderComponent={
                    <View style={styles.myStatusSection}>
                        {!myStatuses || !myStatuses.statuses || myStatuses.statuses.length === 0 ? (
                            <TouchableOpacity style={styles.myStatusItem} onPress={showAddOptions}>
                                <View style={styles.myStatusContainer}>
                                    <Image
                                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                                        style={styles.myStatusAvatar}
                                    />
                                    <View style={styles.addStatusButton}>
                                        <PlusCircle size={20} color={Colors.primary} />
                                    </View>
                                </View>
                                <View style={styles.myStatusInfo}>
                                    <Text style={styles.myStatusLabel}>My Status</Text>
                                    <Text style={styles.myStatusTap}>Tap to add status</Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.myStatusItem} onPress={showAddOptions}>
                                <View style={styles.statusRing}>
                                    <Image
                                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                                        style={styles.statusAvatar}
                                    />
                                </View>
                                <View style={styles.statusInfo}>
                                    <Text style={styles.statusName}>My Status</Text>
                                    <Text style={styles.statusTime}>
                                        {myStatuses.statuses.length} update{myStatuses.statuses.length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No status updates yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    myStatusSection: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    myStatusItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    myStatusContainer: {
        position: 'relative',
    },
    myStatusAvatar: {
        width: 55,
        height: 55,
        borderRadius: 27,
    },
    addStatusButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    myStatusInfo: {
        marginLeft: 15,
    },
    myStatusLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    myStatusTap: {
        fontSize: 13,
        color: Colors.secondaryText,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    statusRing: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: Colors.primary,
        padding: 2,
    },
    statusAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    statusInfo: {
        marginLeft: 15,
    },
    statusName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    statusTime: {
        fontSize: 13,
        color: Colors.secondaryText,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.secondaryText,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    modalInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        marginRight: 10,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: Colors.text,
    },
    postButton: {
        flex: 1,
        padding: 15,
        marginLeft: 10,
        borderRadius: 10,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    postButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});
