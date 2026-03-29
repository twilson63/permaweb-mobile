import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { authService } from '../src/services/AuthService';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    checkWallet();
  }, []);

  async function checkWallet() {
    try {
      const exists = await authService.hasWallet();
      
      if (exists) {
        // Auto-login with existing wallet
        const wallet = await authService.getWallet();
        if (wallet) {
          setHasWallet(true);
        }
      }
    } catch (error) {
      console.error('Failed to check wallet:', error);
    } finally {
      setIsReady(true);
    }
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // If wallet exists, go to home. Otherwise, go to auth.
  return <Redirect href={hasWallet ? '/(tabs)' : '/auth'} />;
}