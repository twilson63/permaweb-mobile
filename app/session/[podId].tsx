import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function SessionScreen() {
  const { podId } = useLocalSearchParams<{ podId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session: {podId}</Text>
      <Text style={styles.subtitle}>Pod ID: {podId}</Text>
      <Text style={styles.comingSoon}>Coming Soon: Chat interface with AI agent</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  comingSoon: {
    fontSize: 16,
    color: '#6366F1',
    textAlign: 'center',
    marginTop: 48,
  },
});