import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>NHAPP</Text>
            <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            <Text style={styles.footer}>Coral & Purple Edition</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    loader: {
        marginTop: 40,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        fontSize: 14,
        color: Colors.secondaryText,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
