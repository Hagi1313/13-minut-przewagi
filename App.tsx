import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.card}>
        <Text style={styles.badge}>MVP 0.1</Text>

        <Text style={styles.title}>13 Minut Przewagi</Text>

        <Text style={styles.subtitle}>
          Krótkie lekcje audio z książek, podcastów i praktycznej wiedzy.
        </Text>

        <Text style={styles.description}>
          Nie tylko słuchasz. Wdrażasz. Po każdej lekcji dostajesz konkretne
          wnioski i 3 rzeczy do zrobienia.
        </Text>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Rozpocznij słuchanie</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Zobacz bibliotekę</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    color: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
    marginBottom: 16,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 19,
    lineHeight: 28,
    marginBottom: 18,
  },
  description: {
    color: '#94A3B8',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
});