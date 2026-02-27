import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: Colors.background,
                },
                headerTintColor: Colors.primary,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
            <Stack.Screen name="new-chat" options={{ title: 'New Chat', presentation: 'modal' }} />
            <Stack.Screen name="create-group" options={{ title: 'Create Group' }} />
            <Stack.Screen name="call" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        </Stack>
    );
}
