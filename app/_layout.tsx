import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import CallOverlay from '../components/CallOverlay';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

// Initialize Convex Client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || "");

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useProtectedRoute();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexProvider client={convex}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
          </Stack>
          <CallOverlay />
          <StatusBar style="auto" />
        </ThemeProvider>
      </ConvexProvider>
    </GestureHandlerRootView>
  );
}
