import { X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface EphemeralMediaViewerProps {
    visible: boolean;
    imageUrl: string;
    onClose: () => void;
}

export default function EphemeralMediaViewer({ visible, imageUrl, onClose }: EphemeralMediaViewerProps) {
    useEffect(() => {
        // Any specific mounting logic
        return () => {
            // Cleanup if needed
        };
    }, []);

    const handleClose = () => {
        // When onClose is triggered, the parent should execute the backend deletion
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <X size={30} color="#FFF" />
                </TouchableOpacity>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
