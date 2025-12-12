import { supabase } from '@/lib/supabase';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [checking, setChecking] = useState(true);

  // ✅ ATENÇÃO: no Expo Router, o grupo vem como "(auth)", não "auth"
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      // deslogado -> manda pro login
      if (!session && !inAuthGroup) {
        router.replace('/(auth)/login' as any);
      }

      // logado e está no auth -> manda pro app
      if (session && inAuthGroup) {
        router.replace('/(tabs)' as any);
      }

      if (mounted) setChecking(false);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, inAuthGroup]);

  const theme = useMemo(
    () => (colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    [colorScheme]
  );

  return (
    <ThemeProvider value={theme}>
      {checking ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      )}
    </ThemeProvider>
  );
}
