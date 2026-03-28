import { View, Text, StyleSheet } from 'react-native';

export default function FilesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Files</Text>
      <Text style={styles.subtitle}>Browse pod files here</Text>
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
  },
});