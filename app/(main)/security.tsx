import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, Key, Lock, Mail, Phone, QrCode, Shield, Smartphone, Verified } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';

export default function SecurityScreen() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    
    const [settings, setSettings] = useState({
        twoStepVerification: false,
        biometricLogin: false,
        loginNotifications: true,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        
        if (key === 'twoStepVerification' && !settings.twoStepVerification) {
            Alert.alert(
                "Two-Step Verification",
                "Two-step verification adds an extra layer of security. You'll be asked for a PIN when registering your phone number.",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Enable", 
                        onPress: () => {
                            Alert.alert("Success", "Two-step verification enabled!");
                        }
                    },
                ]
            );
        }
        
        if (key === 'biometricLogin' && !settings.biometricLogin) {
            Alert.alert(
                "Biometric Login",
                "Use fingerprint or face recognition to unlock the app.",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Enable", 
                        onPress: () => {
                            Alert.alert("Success", "Biometric login enabled!");
                        }
                    },
                ]
            );
        }
    };

    const handleChangePassword = () => {
        Alert.alert(
            "Change Password",
            "This will send a password reset link to your email.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Send Link", 
                    onPress: () => {
                        Alert.alert("Success", "Password reset link sent to your email!");
                    }
                },
            ]
        );
    };

    const handleShowSecurityCode = () => {
        const securityCode = "123456";
        Alert.alert("Your Security Code", securityCode, [
            { text: "Copy", onPress: () => Alert.alert("Copied!", "Security code copied") },
            { text: "OK" }
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete My Account",
            "This will permanently delete your account and all your data. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            "Final Confirmation",
                            "Are you absolutely sure? Your account will be deleted immediately.",
                            [
                                { text: "Cancel", style: "cancel" },
                                { 
                                    text: "Yes, Delete", 
                                    style: 'destructive',
                                    onPress: () => {
                                        Alert.alert("Account Deleted", "We're sorry to see you go!");
                                    }
                                },
                            ]
                        );
                    }
                },
            ]
        );
    };

    const SecurityItem = ({ 
        title, 
        subtitle, 
        icon: Icon, 
        onPress, 
        showSwitch,
        switchValue,
        onSwitchToggle,
        danger
    }: { 
        title: string; 
        subtitle?: string; 
        icon: any; 
        onPress?: () => void;
        showSwitch?: boolean;
        switchValue?: boolean;
        onSwitchToggle?: () => void;
        danger?: boolean;
    }) => (
        <TouchableOpacity 
            style={styles.securityItem} 
            onPress={onPress}
            disabled={showSwitch}
        >
            <View style={[styles.securityIcon, danger && styles.dangerIcon]}>
                <Icon size={22} color={danger ? '#ff4444' : Colors.primary} />
            </View>
            <View style={styles.securityTextContainer}>
                <Text style={[styles.securityTitle, danger && styles.dangerText]}>{title}</Text>
                {subtitle && <Text style={styles.securitySubtitle}>{subtitle}</Text>}
            </View>
            {showSwitch && (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchToggle}
                    trackColor={{ false: '#e0e0e0', true: Colors.primary + '80' }}
                    thumbColor={switchValue ? Colors.primary : '#f4f3f4'}
                />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    <View style={styles.sectionContent}>
                        <SecurityItem
                            title="Two-step Verification"
                            subtitle="Extra security for your account"
                            icon={Verified}
                            showSwitch
                            switchValue={settings.twoStepVerification}
                            onSwitchToggle={() => toggleSetting('twoStepVerification')}
                        />
                        <SecurityItem
                            title="Biometric Login"
                            subtitle="Use fingerprint or face to unlock"
                            icon={Smartphone}
                            showSwitch
                            switchValue={settings.biometricLogin}
                            onSwitchToggle={() => toggleSetting('biometricLogin')}
                        />
                        <SecurityItem
                            title="Login Notifications"
                            subtitle="Get notified of new logins"
                            icon={Shield}
                            showSwitch
                            switchValue={settings.loginNotifications}
                            onSwitchToggle={() => toggleSetting('loginNotifications')}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Password</Text>
                    <View style={styles.sectionContent}>
                        <SecurityItem
                            title="Change Password"
                            subtitle="Update your account password"
                            icon={Key}
                            onPress={handleChangePassword}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security Code</Text>
                    <View style={styles.sectionContent}>
                        <SecurityItem
                            title="Show Security Code"
                            subtitle="Your unique security code"
                            icon={QrCode}
                            onPress={handleShowSecurityCode}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Devices</Text>
                    <View style={styles.sectionContent}>
                        <SecurityItem
                            title="Active Sessions"
                            subtitle="Manage your logged in devices"
                            icon={Smartphone}
                            onPress={() => Alert.alert("Active Sessions", "Coming soon!")}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <View style={[styles.sectionContent, styles.dangerZone]}>
                        <SecurityItem
                            title="Delete My Account"
                            subtitle="Permanently delete your account and data"
                            icon={Shield}
                            onPress={handleDeleteAccount}
                            danger
                        />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Shield size={20} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        Your account is protected with end-to-end encryption. We never share your data with third parties.
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
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
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
    dangerZone: {
        borderColor: '#ffcccc',
    },
    securityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    securityIcon: {
        width: 35,
        height: 35,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    dangerIcon: {
        backgroundColor: '#ffeeee',
    },
    securityTextContainer: {
        flex: 1,
    },
    securityTitle: {
        fontSize: 16,
        color: Colors.text,
    },
    securitySubtitle: {
        fontSize: 13,
        color: Colors.secondaryText,
        marginTop: 2,
    },
    dangerText: {
        color: '#ff4444',
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
});
