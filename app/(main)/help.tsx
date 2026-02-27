import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageCircle, Phone, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "How do I reset my password?",
        answer: "Go to the login screen and tap 'Forgot Password'. Enter your email address and we'll send you a reset link."
    },
    {
        question: "How do I block someone?",
        answer: "Open a chat with the person, tap their name at the top, then select 'Block' from the menu."
    },
    {
        question: "How do I delete my account?",
        answer: "Go to Settings > Account > Privacy > Delete My Account. Note that this action is irreversible."
    },
    {
        question: "Can I use NHAPP on multiple devices?",
        answer: "Yes, your account can be accessed from any device. Your chats and contacts will sync automatically."
    },
    {
        question: "How do I change my profile picture?",
        answer: "Go to Settings > Account and tap on your profile picture to change it."
    },
    {
        question: "Are my messages encrypted?",
        answer: "Yes, all messages in NHAPP are end-to-end encrypted to ensure your privacy and security."
    },
];

export default function HelpScreen() {
    const router = useRouter();
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const handleContactSupport = () => {
        Alert.alert(
            "Contact Support",
            "How would you like to reach us?",
            [
                {
                    text: "Email",
                    onPress: () => Linking.openURL("mailto:support@nhapp.com"),
                },
                {
                    text: "Message",
                    onPress: () => Alert.alert("Message", "Live chat support coming soon!"),
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
    };

    const handleCallSupport = () => {
        Alert.alert(
            "Call Support",
            "Our support team is available Mon-Fri, 9am-6pm.",
            [
                { text: "Call Now", onPress: () => Linking.openURL("tel:+1234567890") },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FAQ</Text>
                    <View style={styles.faqContainer}>
                        {faqData.map((item, index) => (
                            <View key={index} style={styles.faqItem}>
                                <TouchableOpacity 
                                    style={styles.faqQuestion} 
                                    onPress={() => toggleFAQ(index)}
                                >
                                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                                    {expandedFAQ === index ? (
                                        <ChevronUp size={20} color={Colors.secondaryText} />
                                    ) : (
                                        <ChevronDown size={20} color={Colors.secondaryText} />
                                    )}
                                </TouchableOpacity>
                                {expandedFAQ === index && (
                                    <View style={styles.faqAnswer}>
                                        <Text style={styles.faqAnswerText}>{item.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <View style={styles.contactOptions}>
                        <TouchableOpacity style={styles.contactOption} onPress={handleContactSupport}>
                            <View style={[styles.contactIcon, { backgroundColor: '#e3f2fd' }]}>
                                <Mail size={24} color="#1976d2" />
                            </View>
                            <View style={styles.contactTextContainer}>
                                <Text style={styles.contactTitle}>Email Support</Text>
                                <Text style={styles.contactSubtitle}>Get help via email</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactOption} onPress={() => Alert.alert("Message", "Live chat support coming soon!")}>
                            <View style={[styles.contactIcon, { backgroundColor: '#e8f5e9' }]}>
                                <MessageCircle size={24} color="#388e3c" />
                            </View>
                            <View style={styles.contactTextContainer}>
                                <Text style={styles.contactTitle}>Live Chat</Text>
                                <Text style={styles.contactSubtitle}>Chat with support</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactOption} onPress={handleCallSupport}>
                            <View style={[styles.contactIcon, { backgroundColor: '#fff3e0' }]}>
                                <Phone size={24} color="#f57c00" />
                            </View>
                            <View style={styles.contactTextContainer}>
                                <Text style={styles.contactTitle}>Call Us</Text>
                                <Text style={styles.contactSubtitle}>Mon-Fri, 9am-6pm</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.aboutContainer}>
                        <View style={styles.aboutItem}>
                            <Text style={styles.aboutLabel}>App Version</Text>
                            <Text style={styles.aboutValue}>1.0.0</Text>
                        </View>
                        <View style={styles.aboutItem}>
                            <Text style={styles.aboutLabel}>Build</Text>
                            <Text style={styles.aboutValue}>2026.02.28</Text>
                        </View>
                        <View style={styles.aboutItem}>
                            <View style={styles.privacyRow}>
                                <Shield size={18} color={Colors.primary} />
                                <Text style={styles.privacyText}>Your privacy is protected</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 NHAPP. All rights reserved.</Text>
                    <View style={styles.footerLinks}>
                        <TouchableOpacity onPress={() => Linking.openURL("https://nhapp.com/privacy")}>
                            <Text style={styles.footerLink}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerDot}>•</Text>
                        <TouchableOpacity onPress={() => Linking.openURL("https://nhapp.com/terms")}>
                            <Text style={styles.footerLink}>Terms of Service</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
    content: {
        flex: 1,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.secondaryText,
        paddingHorizontal: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    faqContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    faqQuestionText: {
        fontSize: 15,
        color: Colors.text,
        flex: 1,
        marginRight: 10,
    },
    faqAnswer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    faqAnswerText: {
        fontSize: 14,
        color: Colors.secondaryText,
        lineHeight: 20,
    },
    contactOptions: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    contactOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    contactIcon: {
        width: 45,
        height: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    contactTextContainer: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    contactSubtitle: {
        fontSize: 13,
        color: Colors.secondaryText,
        marginTop: 2,
    },
    aboutContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    aboutItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    aboutLabel: {
        fontSize: 15,
        color: Colors.text,
    },
    aboutValue: {
        fontSize: 15,
        color: Colors.secondaryText,
    },
    privacyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    privacyText: {
        fontSize: 14,
        color: Colors.primary,
        marginLeft: 8,
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: Colors.secondaryText,
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    footerLink: {
        fontSize: 13,
        color: Colors.primary,
    },
    footerDot: {
        marginHorizontal: 8,
        color: Colors.secondaryText,
    },
});
