import { supabase } from '@/lib/supabase';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // não precisa navegar manualmente
    // o guard no app/_layout.tsx fará o redirecionamento
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Koinonia 🙏</Text>

      <Text style={styles.subtitle}>
        Comunhão • Palavra • Serviço
      </Text>

      <Text style={styles.text}>
        Bem-vindo ao app da igreja.
      </Text>

      <View style={styles.spacer} />

      <Button title="Sair" onPress={handleLogout} color="#c0392b" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
  },
  spacer: {
    height: 24,
  },
});
