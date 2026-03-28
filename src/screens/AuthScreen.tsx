import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAppStore } from '../store/AppStore';
import { authService } from '../services/AuthService';

export function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const setAuth = useAppStore((state) => state.setAuth);

  const handleArweaveAuth = async () => {
    setLoading(true);
    try {
      const { token } = await authService.authenticate('arweave');
      const wallet = authService.getWallet();
      setAuth(token, wallet?.address || '');
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEthereumAuth = async () => {
    setLoading(true);
    try {
      const { token } = await authService.authenticate('ethereum');
      const wallet = authService.getWallet();
      setAuth(token, wallet?.address || '');
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>📱</Text>
        <Text style={styles.title}>Permaweb Mobile</Text>
        <Text style={styles.subtitle}>Your AI Coding Assistant</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.arweaveButton]}
          onPress={handleArweaveAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connecting...' : 'Connect with Wander'}
          </Text>
          <Text style={styles.buttonHint}>🔗 Arweave Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.ethereumButton]}
          onPress={handleEthereumAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connecting...' : 'Connect with MetaMask'}
          </Text>
          <Text style={styles.buttonHint}>🦊 Ethereum Wallet</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        By connecting, you agree to our Terms of Service
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    alignItems: 'center',
    marginBottom: 48
  },
  logoText: {
    fontSize: 64,
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8'
  },
  buttons: {
    width: '100%',
    gap: 16
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  arweaveButton: {
    backgroundColor: '#6366F1'
  },
  ethereumButton: {
    backgroundColor: '#8B5CF6'
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC'
  },
  buttonHint: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 4
  },
  disclaimer: {
    marginTop: 32,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  }
});