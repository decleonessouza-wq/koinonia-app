import { supabase } from '@/lib/supabase';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useMemo(
    () => (colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    [colorScheme]
  );

  const router = useRouter();
  const segments = useSegments();

  const [checking, setChecking] = useState(true);

  // 🔒 Evita redirect em loop (especialmente no web)
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const safeReplace = (to: string) => {
      if (lastRedirectRef.current === to) return;
      lastRedirectRef.current = to;
      router.replace(to as any);
    };

    const checkAuthAndChurch = async () => {
      try {
        // 1️⃣ Sessão
        const { data: sessionData, error: sessionErr } =
          await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        const session = sessionData.session;

        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';
        const inJoinChurch =
          segments[0] === '(auth)' && segments[1] === 'join-church';

        // 🔴 Sem sessão → login
        if (!session) {
          if (!inAuthGroup) safeReplace('/(auth)/login');
          return;
        }

        // 2️⃣ Com sessão → verifica profile / church_id
        const userId = session.user.id;

        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('church_id')
          .eq('id', userId)
          .maybeSingle();

        // Se falhar leitura (RLS / permissão), mantém no auth
        if (profErr) {
          if (!inAuthGroup) safeReplace('/(auth)/login');
          return;
        }

        const hasChurch = !!profile?.church_id;

        // 🟡 Logado, mas sem igreja → join-church
        if (!hasChurch) {
          if (!inJoinChurch) safeReplace('/(auth)/join-church');
          return;
        }

        // 🟢 Logado + igreja → tabs
        if (!inTabsGroup) safeReplace('/(tabs)');
      } catch {
        // fallback seguro
        safeReplace('/(auth)/login');
      } finally {
        if (mounted) setChecking(false);
      }
    };

    checkAuthAndChurch();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // sempre que logar/deslogar/refresh → revalida
      checkAuthAndChurch();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, segments]);

  return (
    <ThemeProvider value={theme}>
      {checking ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal' }}
          />
        </Stack>
      )}
    </ThemeProvider>
  );
}
