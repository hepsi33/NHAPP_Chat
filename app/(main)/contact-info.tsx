import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Info, Mail, Phone, Video } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function ContactInfoScreen() {
    const { id, name, email, avatar } = useLocalSearchParams<{ id: string, name: string, email: string, avatar: string }>();
    const router = useRouter();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.profileSection}>
                <Image
                    source={{ uri: avatar || 'https://via.placeholder.com/150' }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{name || 'Unknown User'}</Text>
                <Text style={styles.emailText}>{email || 'No email provided'}</Text>
            </View>

            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                    <Phone size={24} color={Colors.primary} />
                    <Text style={styles.actionText}>Audio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Video size={24} color={Colors.primary} />
                    <Text style={styles.actionText}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Mail size={24} color={Colors.primary} />
                    <Text style={styles.actionText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Info size={24} color={Colors.primary} />
                    <Text style={styles.actionText}>Info</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Identity Details</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Primary Email</Text>
                    <Text style={styles.infoValue}>{email || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>User UUID</Text>
                    <Text style={styles.infoValue}>{id}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shared Media & Links</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoValue}>0 Docs, 0 Links</Text>
                </View>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.dangerRow}>
                    <Text style={styles.dangerText}>Block Contact</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.dangerRow}>
                    <Text style={styles.dangerText}>Report User</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
    },
    backButton: {
        padding: 5,
        marginLeft: -5,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        borderWidth: 3,
        borderColor: Colors.accent,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 5,
    },
    emailText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: 20,
        backgroundColor: '#FFF',
        marginBottom: 15,
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        backgroundColor: Colors.chatBackground,
        borderRadius: 15,
    },
    actionText: {
        marginTop: 5,
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    section: {
        backgroundColor: '#FFF',
        padding: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.secondaryText,
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    infoLabel: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: Colors.secondaryText,
    },
    dangerRow: {
        paddingVertical: 12,
    },
    dangerText: {
        fontSize: 16,
        color: '#EA3336',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 5,
    },
});
