import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../../src/services/AuthService';

// Cross-platform alert
function showAlert(title: string, message: string, buttons?: { text: string; style?: string; onPress?: () => void }[]) {
  if (Platform.OS === 'web') {
    if (buttons?.length === 2) {
      // Two buttons - show confirm dialog
      const result = confirm(`${title}\n\n${message}\n\nPress OK to continue.`);
      if (result) {
        buttons[1]?.onPress?.();
      }
    } else {
      alert(`${title}\n\n${message}`);
      buttons?.[0]?.onPress?.();
    }
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, buttons);
  }
}

export default function SettingsScreen() {
  const state = authService.getState();

  async function handleLogout() {
    if (Platform.OS === 'web') {
      const result = confirm('Logout\n\nAre you sure? You will need your JWK to login again.\n\nClick OK to logout, Cancel to stay logged in.');
      if (result) {
        await authService.deleteWallet();
        router.replace('/auth');
      }
    } else {
      showAlert(
        'Logout',
        'Are you sure you want to logout? You will need your JWK to login again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await authService.deleteWallet();
              router.replace('/auth');
            },
          },
        ]
      );
    }
  }

  async function handleExportWallet() {
    try {
      const jwk = await authService.exportWallet();
      if (Platform.OS === 'web') {
        // On web, copy to clipboard
        await navigator.clipboard.writeText(jwk);
        alert('Wallet Backup\n\nJWK copied to clipboard!\n\nSave it somewhere safe.');
      } else {
        Alert.alert('Wallet Backup', 'Copy your JWK:\n\n' + jwk.slice(0, 50) + '...');
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert('Error: ' + error.message);
      } else {
        Alert.alert('Error', error.message);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>
            {state.wallet?.address.slice(0, 8)}...{state.wallet?.address.slice(-8)}
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleExportWallet}>
          <Text style={styles.buttonText}>Export Wallet (Backup)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>0.1.0</Text>
        </View>
      </View>
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    fontSize: 16,
    color: '#F8FAFC',
  },
});