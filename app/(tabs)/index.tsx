import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Koinonia 🙏</ThemedText>

      <ThemedText style={styles.subtitle}>
        Comunhão • Palavra • Serviço
      </ThemedText>

      <ThemedText style={styles.text}>
        Seja bem-vindo ao app da igreja.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
  },
  text: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  },
});
