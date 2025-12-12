import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);

  const onLeaveChurch = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession();

      if (sessErr) throw sessErr;
      if (!session) {
        router.replace('/(auth)/login' as any);
        return;
      }

      const { error: upErr } = await supabase
        .from('profiles')
        .update({ church_id: null })
        .eq('id', session.user.id);

      if (upErr) throw upErr;

      Alert.alert(
        'Você saiu da igreja',
        'Será necessário entrar novamente com um código.'
      );

      // ✅ navegação explícita (evita flicker/loop)
      router.replace('/(auth)/join-church' as any);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // ✅ navegação explícita (evita “piscar”)
      router.replace('/(auth)/login' as any);
    } catch (e: any) {
      Alert.alert('Erro ao sair', e?.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Perfil</ThemedText>

      <TouchableOpacity
        onPress={onLeaveChurch}
        disabled={loading}
        style={styles.button}
      >
        <ThemedText>{loading ? 'Aguarde...' : 'Sair da igreja'}</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onLogout}
        disabled={loading}
        style={styles.button}
      >
        <ThemedText>{loading ? 'Aguarde...' : 'Sair do app'}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    justifyContent: 'center',
  },
  button: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
});
