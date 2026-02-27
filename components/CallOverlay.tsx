import { Camera, MicOff, Phone, PhoneOff, Video } from 'lucide-react-native';
import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useCallStore } from '../store/useCallStore';

export default function CallOverlay() {
    const { isActive, isIncoming, caller, isVideo, acceptCall, endCall } = useCallStore();

    if (!isActive || !caller) return null;

    return (
        <Modal visible={isActive} animationType="slide" transparent={false}>
            <View style={[styles.container, isVideo ? styles.videoContainer : null]}>

                {/* Background visual if not video */}
                {!isVideo && (
                    <Image source={{ uri: caller.avatar || 'https://via.placeholder.com/150' }} style={styles.blurBackground} blurRadius={10} />
                )}

                <View style={styles.content}>
                    <Text style={styles.statusText}>{isIncoming ? (isVideo ? 'Incoming Video Call...' : 'Incoming Audio Call...') : 'Calling...'}</Text>

                    {!isVideo && (
                        <>
                            <Image source={{ uri: caller.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                            <Text style={styles.name}>{caller.name}</Text>
                        </>
                    )}

                    {isVideo && (
                        <View style={styles.videoPlaceholder}>
                            <Text style={styles.videoText}>Remote Video Stream</Text>
                        </View>
                    )}

                    <View style={styles.controls}>
                        {isIncoming ? (
                            <>
                                <TouchableOpacity style={[styles.controlButton, styles.declineButton]} onPress={endCall}>
                                    <PhoneOff size={30} color="#FFF" />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.controlButton, styles.acceptButton]} onPress={acceptCall}>
                                    <Phone size={30} color="#FFF" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={[styles.controlButton, styles.iconButton]}>
                                    <Camera size={26} color="#FFF" />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.controlButton, styles.iconButton]}>
                                    {isVideo ? <Video size={26} color="#FFF" /> : <MicOff size={26} color="#FFF" />}
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.controlButton, styles.declineButton]} onPress={endCall}>
                                    <PhoneOff size={30} color="#FFF" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.chatBackground,
    },
    videoContainer: {
        backgroundColor: '#111',
    },
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 50,
        justifyContent: 'space-between',
    },
    statusText: {
        color: '#FFF',
        fontSize: 16,
        letterSpacing: 1,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginTop: 40,
        marginBottom: 20,
    },
    name: {
        fontSize: 28,
        color: '#FFF',
        fontWeight: 'bold',
    },
    videoPlaceholder: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoText: {
        color: '#666',
        fontSize: 18,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        width: '100%',
    },
    controlButton: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    declineButton: {
        backgroundColor: '#EA3336',
    },
    acceptButton: {
        backgroundColor: '#44C062',
    },
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});
