import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) throw new Error('EXPO_PUBLIC_SUPABASE_URL is required');
if (!supabaseAnonKey) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');

const isBrowser = typeof window !== 'undefined';

// Storage que funciona em:
// - Mobile: usa AsyncStorage (carregado dinamicamente)
// - Web com window: usa localStorage
// - SSR/Node (sem window): storage noop (não crasha)
const makeStorage = () => {
  // SSR / Node (expo-router node render)
  if (!isBrowser && Platform.OS === 'web') {
    return {
      getItem: async (_key: string) => null,
      setItem: async (_key: string, _value: string) => {},
      removeItem: async (_key: string) => {},
    };
  }

  // Web no browser
  if (Platform.OS === 'web') {
    return {
      getItem: async (key: string) => {
        try {
          return globalThis?.localStorage?.getItem(key) ?? null;
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          globalThis?.localStorage?.setItem(key, value);
        } catch {}
      },
      removeItem: async (key: string) => {
        try {
          globalThis?.localStorage?.removeItem(key);
        } catch {}
      },
    };
  }

  // Mobile (Android/iOS): AsyncStorage via import dinâmico
  return {
    getItem: async (key: string) => {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.removeItem(key);
    },
  };
};

const storage = makeStorage();

// IMPORTANTE:
// - No SSR/Node (web sem window) NÃO pode tentar persistir/refresh/detectSessionInUrl.
// - No browser/mobile mantém tudo ligado.
const authConfig =
  (!isBrowser && Platform.OS === 'web')
    ? {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage,
      }
    : {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: Platform.OS === 'web',
        storage,
        storageKey: 'koinonia.auth', // ✅ opcional, recomendado
      };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: authConfig,
});
