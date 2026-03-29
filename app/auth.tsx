import { router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { walletManager } from '../src/services/WalletManager';
import { authService } from '../src/services/AuthService';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importKey, setImportKey] = useState('');

  async function handleCreateWallet() {
    setLoading(true);
    try {
      console.log('Creating wallet...');
      const wallet = await authService.createWallet();
      console.log('Wallet created:', wallet.address);
      
      // On web, alert is blocking - navigate after
      if (Platform.OS === 'web') {
        alert(`Wallet Created! 🎉\n\nAddress: ${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}\n\nPlease backup your wallet!`);
        setLoading(false);
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Wallet Created! 🎉',
          `Address: ${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}\n\nPlease backup your wallet!`,
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
        );
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      setLoading(false);
      if (Platform.OS === 'web') {
        alert('Error: ' + (error.message || 'Failed to create wallet'));
      } else {
        Alert.alert('Error', error.message || 'Failed to create wallet');
      }
    }
  }

  async function handleImportWallet() {
    if (!importKey.trim()) {
      if (Platform.OS === 'web') {
        alert('Error: Please enter your JWK');
      } else {
        Alert.alert('Error', 'Please enter your JWK');
      }
      return;
    }

    setLoading(true);
    try {
      const wallet = await authService.importWallet(importKey.trim());
      setShowImport(false);
      
      if (Platform.OS === 'web') {
        alert(`Wallet Imported! ✅\n\nAddress: ${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}`);
        setLoading(false);
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Wallet Imported! ✅',
          `Address: ${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}`,
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
        );
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error importing wallet:', error);
      setLoading(false);
      if (Platform.OS === 'web') {
        alert('Error: Invalid JWK format. Please check and try again.');
      } else {
        Alert.alert('Error', 'Invalid JWK format. Please check and try again.');
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>📱</Text>
        <Text style={styles.title}>Permaweb Mobile</Text>
        <Text style={styles.subtitle}>Your AI Coding Wallet</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateWallet}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#F8FAFC" />
          ) : (
            <>
              <Text style={styles.buttonText}>Create New Wallet</Text>
              <Text style={styles.buttonHint}>✨ Generate JWK</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.importButton]}
          onPress={() => setShowImport(true)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Import Wallet</Text>
          <Text style={styles.buttonHint}>📥 Paste or scan JWK</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Your wallet keys are stored securely on this device.
      </Text>

      <Modal visible={showImport} animationType="slide" transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import Wallet</Text>
            <Text style={styles.modalHint}>
              Paste your JWK (private key) below:
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={6}
              placeholder='{"kty":"RSA","n":"...","e":"..."}'
              value={importKey}
              onChangeText={setImportKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowImport(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.importConfirmButton]}
                onPress={handleImportWallet}
              >
                <Text style={styles.buttonText}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#6366F1',
  },
  importButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  buttonHint: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 4,
  },
  disclaimer: {
    marginTop: 32,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  modalHint: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 12,
    fontFamily: 'monospace',
    minHeight: 120,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  importConfirmButton: {
    backgroundColor: '#6366F1',
  },
});