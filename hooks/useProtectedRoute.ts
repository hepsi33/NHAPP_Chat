import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export function useProtectedRoute() {
    const router = useRouter();
    const segments = useSegments();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!isReady || isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            if (!user?.displayName) {
                router.replace('/(auth)/profile-setup');
            } else {
                router.replace('/(main)/(tabs)/chats');
            }
        } else if (isAuthenticated && segments[0] === '(main)') {
            return;
        } else if (isAuthenticated) {
            if (!user?.displayName) {
                router.replace('/(auth)/profile-setup');
            } else {
                router.replace('/(main)/(tabs)/chats');
            }
        }
    }, [isAuthenticated, isLoading, segments, user, isReady]);
}
