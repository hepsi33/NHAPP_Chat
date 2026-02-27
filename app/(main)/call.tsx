import { useLocalSearchParams, useRouter } from 'expo-router';
import { Phone, Video, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

/**
 * NOTE: The Agora SDK (react-native-agora) contains native code and 
 * .tsx files in node_modules that are incompatible with standard Expo Go.
 * 
 * To use the actual calling feature, you must create a Development Build:
 * npx expo run:android OR npx expo dev-client
 * 
 * For now, this screen is stubbed to allow bundling in Expo Go.
 */

export default function CallScreen() {
    const { channel, type } = useLocalSearchParams<{ channel: string, type: 'voice' | 'video' }>();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <X color="#FFF" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.primary }]}>
                    {type === 'video' ? (
                        <Video color="#FFF" size={60} />
                    ) : (
                        <Phone color="#FFF" size={60} />
                    )}
                </View>

                <Text style={styles.title}>
                    {type === 'video' ? 'Video Call' : 'Voice Call'}
                </Text>
                <Text style={styles.channelText}>Channel: {channel || 'test'}</Text>

                <View style={styles.devBuildNotice}>
                    <Text style={styles.noticeTitle}>Development Build Required</Text>
                    <Text style={styles.noticeText}>
                        The Agora calling SDK requires a custom Expo Development Build.
                        Standard Expo Go cannot bundle native calling modules.
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.endCallButton}>
                    <Phone color="#FFF" size={32} style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
    },
    channelText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 40,
    },
    devBuildNotice: {
        backgroundColor: 'rgba(255, 127, 80, 0.1)',
        padding: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.primary,
        alignItems: 'center',
    },
    noticeTitle: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
    },
    noticeText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    footer: {
        paddingBottom: 60,
        alignItems: 'center',
    },
    endCallButton: {
        backgroundColor: '#FF4B4B',
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
});
