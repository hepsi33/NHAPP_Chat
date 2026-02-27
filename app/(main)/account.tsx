import { useRouter } from 'expo-router';
import { ArrowLeft, Key, Lock, Mail } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function AccountSettingsScreen() {
    const router = useRouter();

    const accountOptions = [
        { id: 'privacy', title: 'Privacy', subtitle: 'Block contacts, disappearing messages', icon: Lock },
        { id: 'security', title: 'Security', subtitle: 'Security notifications, show security code', icon: Key },
        { id: 'email', title: 'Email Address', subtitle: 'Manage your connected email', icon: Mail },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account</Text>
            </View>

            <View style={styles.optionsList}>
                {accountOptions.map((option) => (
                    <TouchableOpacity key={option.id} style={styles.optionItem}>
                        <View style={styles.iconContainer}>
                            <option.icon color={Colors.secondaryText} size={24} />
                        </View>
                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionTitle}>{option.title}</Text>
                            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
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
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    optionsList: {
        marginTop: 10,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 25,
    },
    iconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 20,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 14,
        color: Colors.secondaryText,
    },
});
