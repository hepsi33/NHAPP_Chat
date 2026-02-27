import { useMutation, useQuery } from "convex/react";
import * as ImagePicker from 'expo-image-picker';
import { PlusCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { api } from "../../../convex/_generated/api";
import { useAuthStore } from '../../../store/useAuthStore';

export default function StatusScreen() {
    const user = useAuthStore((state) => state.user);

    const statusesData = useQuery(api.status.listActiveStatuses, { currentUserId: user?.uid || "" });
    const createStatus = useMutation(api.status.createStatus);

    const handleAddStatus = async () => {
        if (!user) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            Alert.alert('Coming Soon', 'Status uploads will be available soon.');
        }
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
        <View style={styles.statusItem}>
            <View style={styles.statusRing}>
                <Image
                    source={{ uri: item.user?.avatar || 'https://via.placeholder.com/150' }}
                    style={styles.statusAvatar}
                />
            </View>
            <View style={styles.statusInfo}>
                <Text style={styles.statusName}>{item.user?.name || 'User'}</Text>
                <Text style={styles.statusTime}>
                    {item.statuses?.length || 0} status updates
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={otherStatuses}
                renderItem={renderStatusItem}
                keyExtractor={(item, index) => item.user?.userId || index.toString()}
                ListHeaderComponent={
                    <View style={styles.myStatusSection}>
                        <TouchableOpacity style={styles.myStatusItem} onPress={handleAddStatus}>
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
                        {myStatuses && (
                            <View style={styles.myStatusItem}>
                                <View style={styles.statusRing}>
                                    <Image
                                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
                                        style={styles.statusAvatar}
                                    />
                                </View>
                                <View style={styles.statusInfo}>
                                    <Text style={styles.statusName}>My Status</Text>
                                    <Text style={styles.statusTime}>
                                        {myStatuses.statuses?.length || 0} updates
                                    </Text>
                                </View>
                            </View>
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
});
