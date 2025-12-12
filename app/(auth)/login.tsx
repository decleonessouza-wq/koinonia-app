import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (loading) return; // 🔒 evita clique duplo

    try {
      const e = email.trim();
      const s = senha;

      if (!e || !s) {
        Alert.alert('Atenção', 'Informe email e senha.');
        return;
      }

      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: e,
        password: s,
      });

      if (error) throw error;

      // ✅ NÃO redireciona aqui
      // O guard em app/_layout.tsx decide:
      // - sem church_id -> /(auth)/join-church
      // - com church_id -> /(tabs)
    } catch (err: any) {
      Alert.alert('Erro no login', err?.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Entrar</ThemedText>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        editable={!loading}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={styles.input}
        editable={!loading}
      />

      <TouchableOpacity
        onPress={onLogin}
        disabled={loading}
        style={styles.button}
      >
        <ThemedText>
          {loading ? 'Entrando...' : 'Entrar'}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(auth)/register' as any)}
        disabled={loading}
      >
        <ThemedText style={{ marginTop: 16 }}>
          Não tem conta? Criar agora
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
    borderRadius: 10,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
});
