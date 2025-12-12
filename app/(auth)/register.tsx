import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: { name: nome.trim() },
        },
      });

      if (error) throw error;

      Alert.alert('Conta criada', 'Agora você já pode entrar.');
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Erro no cadastro', e?.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Criar conta</ThemedText>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={styles.input}
      />

      <TouchableOpacity onPress={onRegister} disabled={loading} style={styles.button}>
        <ThemedText>{loading ? 'Criando...' : 'Criar conta'}</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
        <ThemedText style={{ marginTop: 16 }}>
          Já tem conta? Entrar
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, gap: 12 },
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
