import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface StoryMediaPlayerProps {
    visible: boolean;
    stories: any[];
    onClose: () => void;
    onEnd: () => void;
}

export default function StoryMediaPlayer({ visible, stories, onClose, onEnd }: StoryMediaPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!visible) {
            setCurrentIndex(0);
            return;
        }

        const timer = setTimeout(() => {
            if (currentIndex < stories.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onEnd();
            }
        }, 8000); // 8 sec per story

        return () => clearTimeout(timer);
    }, [visible, currentIndex, stories.length, onEnd]);

    const handlePress = (evt: any) => {
        const x = evt.nativeEvent.locationX;
        if (x < width / 3) {
            // Previous
            if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
        } else {
            // Next
            if (currentIndex < stories.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onEnd();
            }
        }
    };

    if (!visible || !stories.length) return null;

    const currentStory = stories[currentIndex];

    // In a full app, we would resolve currentStory.fileUrl using the Convex generateUrl query if it's a storage ID.
    // For this prototype we assume fileUrl contains the uri (or we pass the URI back appropriately).

    return (
        <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.progressContainer}>
                    {stories.map((_, i) => (
                        <View key={i} style={[styles.progressBar, { opacity: i <= currentIndex ? 1 : 0.4 }]} />
                    ))}
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <X size={30} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.contentArea} activeOpacity={1} onPress={handlePress}>
                    {currentStory.fileUrl ? (
                        <Image source={{ uri: currentStory.fileUrl }} style={styles.image} resizeMode="contain" />
                    ) : (
                        <View style={{ flex: 1, backgroundColor: currentStory.content || '#333' }} />
                    )}
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    progressContainer: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 10,
        zIndex: 20,
        gap: 5,
    },
    progressBar: {
        flex: 1,
        height: 2,
        backgroundColor: '#FFF',
        borderRadius: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 20,
        padding: 10,
    },
    contentArea: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
