import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';

// ✅ Tipagem correta conforme retorno do Supabase
type Perfil = {
  nome: string | null;
  igrejas: {
    nome: string;
  }[] | null;
};

export default function HomeScreen() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select(
            `
            nome,
            igrejas (
              nome
            )
          `
          )
          .eq('id', user.id)
          .maybeSingle();

        if (mounted && data) {
          setPerfil(data as Perfil);
        }
      } finally {
        if (mounted) setCarregandoPerfil(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const onLogout = async () => {
    if (loadingLogout) return;

    try {
      setLoadingLogout(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // ✅ NÃO redireciona aqui.
      // O guard em app/_layout.tsx vai detectar "sem sessão"
      // e mandar para /(auth)/login, sem flicker/loop.
    } catch (e: any) {
      Alert.alert('Erro ao sair', e?.message ?? 'Erro desconhecido');
    } finally {
      setLoadingLogout(false);
    }
  };

  if (carregandoPerfil) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const nomeIgreja = perfil?.igrejas?.[0]?.nome;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Home</ThemedText>

      {perfil?.nome && <ThemedText>👤 {perfil.nome}</ThemedText>}

      {nomeIgreja && <ThemedText>⛪ {nomeIgreja}</ThemedText>}

      <TouchableOpacity
        onPress={onLogout}
        disabled={loadingLogout}
        style={styles.button}
      >
        <ThemedText>{loadingLogout ? 'Saindo...' : 'SAIR'}</ThemedText>
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
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    marginTop: 24,
  },
});
