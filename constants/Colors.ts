// Coral Pink, Peach, Purple Theme for NHAPP
const coralPink = '#FF6B6B';    // Coral
const peach = '#FFB347';        // Peach
const purple = '#9B51E0';       // Purple
const lightPeach = '#FFF0E5';   // Light Peach background
const lavender = '#E5E0FF';    // Soft Lavender for incoming messages
const lightPurple = '#F3E8FF'; // Light Purple tint

export const Colors = {
    primary: coralPink,
    accent: purple,
    secondary: peach,
    background: lightPeach,
    chatBackground: '#FFF8F5',
    text: '#333333',
    secondaryText: '#666666',
    tabBarActive: purple,
    tabBarInactive: '#A0A0A0',
    buttonDisabled: '#FFC4CE',
    bubbleRight: coralPink,      // Outgoing messages - Coral gradient
    bubbleLeft: lavender,        // Incoming messages - Soft Lavender
    primaryGradient: [coralPink, purple],
    peachGradient: [coralPink, peach],
    statusRing: [coralPink, purple], // Gradient for status rings
    // Additional UI colors
    incomingMessage: lavender,
    outgoingMessage: coralPink,
    callButton: purple,
    fab: purple,
    unreadBadge: purple,
};

export default Colors;
