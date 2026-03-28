import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { walletManager } from '../src/services/WalletManager';

export default function Index() {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);

  useEffect(() => {
    checkWallet();
  }, []);

  async function checkWallet() {
    const exists = await walletManager.hasWallet();
    setHasWallet(exists);
  }

  if (hasWallet === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return <Redirect href={hasWallet ? '/(tabs)' : '/auth'} />;
}