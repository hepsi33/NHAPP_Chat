import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { Lock, Mic, Send as SendIcon, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface VoiceRecorderProps {
    onSend: (uri: string, duration: number) => void;
}

export default function VoiceRecorder({ onSend }: VoiceRecorderProps) {
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [duration, setDuration] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (recorder.isRecording) {
            interval = setInterval(() => {
                setDuration((d) => d + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [recorder.isRecording]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setIsLocked(false);
                startRecording();
            },
            onPanResponderMove: (e, gestureState) => {
                if (gestureState.dy < -40 && !isLocked) {
                    setIsLocked(true);
                }
            },
            onPanResponderRelease: () => {
                if (!isLocked) {
                    stopAndSend();
                }
            },
            onPanResponderTerminate: () => {
                if (!isLocked) stopAndSend();
            }
        })
    ).current;

    async function startRecording() {
        try {
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) {
                console.log('Recording permission not granted');
                return;
            }

            await recorder.record();
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopAndSend() {
        try {
            if (recorder.isRecording) {
                await recorder.stop();
            }
            const uri = recorder.uri;

            if (uri) {
                onSend(uri, duration);
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
        setIsLocked(false);
    }

    async function cancelRecording() {
        try {
            if (recorder.isRecording) {
                await recorder.stop();
            }
        } catch (err) {
            console.error('Failed to cancel recording', err);
        }
        setIsLocked(false);
    }

    return (
        <View style={styles.container}>
            {recorder.isRecording ? (
                <View style={styles.recordingRow}>
                    <Text style={styles.timer}>
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                    </Text>

                    {isLocked ? (
                        <View style={styles.lockedActions}>
                            <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
                                <Trash2 size={24} color="#EA3336" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={stopAndSend} style={styles.sendButton}>
                                <SendIcon size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.slideToLockIndicator}>
                            <Lock size={16} color={Colors.secondaryText} />
                            <Text style={styles.slideToLockText}>Slide up to lock</Text>
                        </View>
                    )}
                </View>
            ) : null}

            {!recorder.isRecording || !isLocked ? (
                <View {...panResponder.panHandlers} style={[styles.micButton, recorder.isRecording && styles.micRecording]}>
                    <Mic size={24} color="#FFF" />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 5,
        position: 'relative',
        justifyContent: 'center',
    },
    micButton: {
        backgroundColor: Colors.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    micRecording: {
        backgroundColor: '#EA3336',
    },
    recordingRow: {
        position: 'absolute',
        right: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.background,
        paddingHorizontal: 15,
        borderRadius: 22,
        height: 44,
        minWidth: 200,
        elevation: 2,
    },
    timer: {
        color: '#EA3336',
        fontWeight: 'bold',
        marginRight: 15,
    },
    slideToLockIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.6,
    },
    slideToLockText: {
        fontSize: 12,
        marginLeft: 5,
        color: Colors.secondaryText,
    },
    lockedActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cancelButton: {
        padding: 5,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
