import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function JoinChurchScreen() {
  const [code, setCode] = useState('KOINONIA-TESTE');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const onConfirm = async () => {
    try {
      setLoading(true);
      setErrorText(null);

      const normalized = code.trim().toUpperCase();
      if (!normalized) {
        setErrorText('Digite o código/convite.');
        return;
      }

      // 1) sessão
      const { data: sessionData, error: sessionErr } =
        await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;

      const session = sessionData?.session;
      if (!session?.user?.id) {
        showMessage(
          'Sessão ausente',
          'Faça login novamente para entrar na igreja.'
        );
        router.replace('/(auth)/login' as any);
        return;
      }

      const userId = session.user.id;

      // 2) igreja
      const { data: igreja, error: igrejaErr } = await supabase
        .from('igrejas')
        .select('id, nome')
        .ilike('invite_code', normalized)
        .maybeSingle();

      if (igrejaErr) throw igrejaErr;
      if (!igreja) {
        setErrorText(
          'Código inválido. Verifique com a liderança e tente novamente.'
        );
        return;
      }

      // 3) salva no profile
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(
          { id: userId, church_id: igreja.id },
          { onConflict: 'id' }
        );

      if (upsertErr) throw upsertErr;

      // 4) feedback apenas
      showMessage('Sucesso', `Você entrou na igreja: ${igreja.nome}`);

      // ❌ NÃO navega aqui
      // ✅ o guard em app/_layout.tsx vai detectar church_id
    } catch (e: any) {
      const msg = e?.message ?? 'Erro desconhecido';
      setErrorText(msg);
      showMessage('Erro ao entrar na igreja', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Entrar na Igreja</ThemedText>
      <ThemedText style={styles.subtitle}>
        Digite o código/convite fornecido pela liderança.
      </ThemedText>

      <TextInput
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="EX: KOINONIA-TESTE"
        style={styles.input}
        editable={!loading}
      />

      {!!errorText && (
        <View style={styles.errorBox}>
          <ThemedText style={styles.errorText}>{errorText}</ThemedText>
        </View>
      )}

      <TouchableOpacity
        onPress={onConfirm}
        disabled={loading}
        style={styles.button}
      >
        <ThemedText>{loading ? 'Validando...' : 'Confirmar'}</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} disabled={loading}>
        <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>
          Voltar
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, gap: 12 },
  subtitle: { opacity: 0.8 },
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
  errorBox: {
    borderWidth: 1,
    borderColor: '#a33',
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: '#f2b8b5',
  },
});
