import { Phone, PhoneCall } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function CallsScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.emptyContainer}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.bubbleLeft }]}>
                    <Phone color={Colors.primary} size={45} />
                </View>
                <Text style={styles.emptyTitle}>
                    Start a call with your friends and family on NHAPP.
                </Text>
            </View>

            <TouchableOpacity style={styles.fab}>
                <PhoneCall color="#FFF" size={26} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 3,
    },
    emptyTitle: {
        fontSize: 16,
        color: Colors.secondaryText,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        backgroundColor: Colors.primary,
        width: 65,
        height: 65,
        borderRadius: 32.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});
