import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, BellOff, Volume2, VolumeX } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Switch, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';

interface NotificationSetting {
    id: string;
    title: string;
    subtitle: string;
    icon: 'bell' | 'bellOff' | 'sound' | 'vibrate';
}

export default function NotificationsScreen() {
    const router = useRouter();
    
    const [settings, setSettings] = useState({
        messageNotifications: true,
        messageSound: true,
        messageVibration: true,
        groupNotifications: true,
        callNotifications: true,
        showPreview: true,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        Alert.alert("Success", "Notification preferences saved!");
        router.back();
    };

    const NotificationItem = ({ 
        title, 
        subtitle, 
        value, 
        onToggle,
        icon 
    }: { 
        title: string; 
        subtitle: string; 
        value: boolean; 
        onToggle: () => void;
        icon: 'bell' | 'bellOff' | 'sound' | 'vibrate';
    }) => {
        const IconComponent = icon === 'bell' ? Bell : 
                             icon === 'bellOff' ? BellOff :
                             icon === 'sound' ? Volume2 : VolumeX;

        return (
            <View style={styles.settingItem}>
                <View style={styles.settingIcon}>
                    <IconComponent size={22} color={Colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingSubtitle}>{subtitle}</Text>
                </View>
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#e0e0e0', true: Colors.primary + '80' }}
                    thumbColor={value ? Colors.primary : '#f4f3f4'}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Messages</Text>
                    <View style={styles.sectionContent}>
                        <NotificationItem
                            title="Message Notifications"
                            subtitle="Receive notifications for new messages"
                            value={settings.messageNotifications}
                            onToggle={() => toggleSetting('messageNotifications')}
                            icon="bell"
                        />
                        <NotificationItem
                            title="Message Sound"
                            subtitle="Play sound for new messages"
                            value={settings.messageSound}
                            onToggle={() => toggleSetting('messageSound')}
                            icon="sound"
                        />
                        <NotificationItem
                            title="Message Vibration"
                            subtitle="Vibrate for new messages"
                            value={settings.messageVibration}
                            onToggle={() => toggleSetting('messageVibration')}
                            icon="vibrate"
                        />
                        <NotificationItem
                            title="Show Preview"
                            subtitle="Show message preview in notification"
                            value={settings.showPreview}
                            onToggle={() => toggleSetting('showPreview')}
                            icon="bell"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Groups</Text>
                    <View style={styles.sectionContent}>
                        <NotificationItem
                            title="Group Notifications"
                            subtitle="Receive notifications for group messages"
                            value={settings.groupNotifications}
                            onToggle={() => toggleSetting('groupNotifications')}
                            icon="bell"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Calls</Text>
                    <View style={styles.sectionContent}>
                        <NotificationItem
                            title="Call Notifications"
                            subtitle="Receive notifications for incoming calls"
                            value={settings.callNotifications}
                            onToggle={() => toggleSetting('callNotifications')}
                            icon="bell"
                        />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        Some notifications may require the app to be open or may be affected by your device's system settings.
                    </Text>
                </View>
            </ScrollView>
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
    saveText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.secondaryText,
        paddingHorizontal: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    sectionContent: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    settingIcon: {
        width: 30,
        alignItems: 'center',
        marginRight: 15,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: Colors.text,
    },
    settingSubtitle: {
        fontSize: 13,
        color: Colors.secondaryText,
        marginTop: 2,
    },
    infoContainer: {
        padding: 20,
        marginTop: 10,
        marginBottom: 30,
    },
    infoText: {
        fontSize: 13,
        color: Colors.secondaryText,
        textAlign: 'center',
        lineHeight: 18,
    },
});
