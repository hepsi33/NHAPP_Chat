import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { FileText, Pause, Play } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface AudioPlayerProps {
    audioUrl: string;
    isRight: boolean;
}

export default function AudioPlayer({ audioUrl, isRight }: AudioPlayerProps) {
    const player = useAudioPlayer(audioUrl);
    const status = useAudioPlayerStatus(player);

    const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
    const [showTranscript, setShowTranscript] = useState(false);

    // Simulate waveform data
    const fakeWaveform = Array.from({ length: 20 }).map(() => Math.random() * 20 + 5);

    const handlePlayPause = () => {
        if (status.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    const togglePlaybackRate = () => {
        const nextRate = playbackRate === 1 ? 1.5 : (playbackRate === 1.5 ? 2 : 1);
        setPlaybackRate(nextRate);
        player.playbackRate = nextRate;
    };

    const toggleTranscript = () => {
        setShowTranscript(!showTranscript);
    }

    const textColor = isRight ? Colors.text : Colors.text;
    const waveformColor = isRight ? Colors.primary : Colors.secondaryText;

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                    {status.playing ? <Pause size={24} color={textColor} /> : <Play size={24} color={textColor} />}
                </TouchableOpacity>

                <View style={styles.waveformContainer}>
                    {fakeWaveform.map((height, i) => (
                        <View
                            key={i}
                            style={[
                                styles.waveformBar,
                                { height, backgroundColor: waveformColor, opacity: i < 8 && status.playing ? 1 : 0.4 }
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.rateButton} onPress={togglePlaybackRate}>
                    <Text style={[styles.rateText, { color: textColor }]}>{playbackRate}x</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.transcribeButton} onPress={toggleTranscript}>
                    <FileText size={18} color={waveformColor} />
                </TouchableOpacity>
            </View>

            {showTranscript && (
                <View style={[styles.transcriptContainer, isRight ? styles.transcriptRight : styles.transcriptLeft]}>
                    <Text style={styles.transcriptLabel}>AI Transcription</Text>
                    <Text style={[styles.transcriptText, { color: textColor }]}>
                        &quot;Hey, just confirming our meeting for 5 PM. Let me know if that still works for you. See you later!&quot;
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'column',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        width: 250,
    },
    playButton: {
        marginRight: 10,
    },
    waveformContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 30,
        marginRight: 10,
    },
    waveformBar: {
        width: 3,
        borderRadius: 2,
    },
    rateButton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 8,
    },
    rateText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    transcribeButton: {
        padding: 4,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    transcriptContainer: {
        marginTop: 5,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.08)',
    },
    transcriptRight: {
        paddingRight: 5,
    },
    transcriptLeft: {
        paddingLeft: 5,
    },
    transcriptLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    transcriptText: {
        fontSize: 14,
        fontStyle: 'italic',
        opacity: 0.8,
    },
});
