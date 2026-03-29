// Wallet Manager - JWK wallet management for Arweave (simplified for demo)

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface JWK {
  kty: string;
  n: string;
  e: string;
  d?: string;
  p?: string;
  q?: string;
  dp?: string;
  dq?: string;
  qi?: string;
}

export interface WalletInfo {
  address: string;
  jwk: JWK;
  createdAt: string;
}

// Storage abstraction for web/native compatibility
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  
  async deleteItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.error('Storage error:', e);
    }
  }
};

export class WalletManager {
  /**
   * Generate a new JWK wallet (simplified - demo only)
   */
  async createWallet(): Promise<WalletInfo> {
    const jwk: JWK = {
      kty: 'RSA',
      n: this.generateBase64Url(256),
      e: 'AQAB',
      d: this.generateBase64Url(256),
      p: this.generateBase64Url(128),
      q: this.generateBase64Url(128),
      dp: this.generateBase64Url(128),
      dq: this.generateBase64Url(128),
      qi: this.generateBase64Url(128),
    };

    const address = await this.getAddressFromJwk(jwk);

    return {
      address,
      jwk,
      createdAt: new Date().toISOString(),
    };
  }

  async importWallet(jwkJson: string): Promise<WalletInfo> {
    try {
      const jwk = typeof jwkJson === 'string' ? JSON.parse(jwkJson) : jwkJson;

      if (!jwk.kty || !jwk.n || !jwk.e) {
        throw new Error('Invalid JWK: missing required fields');
      }

      const address = await this.getAddressFromJwk(jwk);

      return {
        address,
        jwk,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to import wallet: ${error}`);
    }
  }

  async storeWallet(wallet: WalletInfo, pin?: string): Promise<void> {
    const jwkJson = JSON.stringify(wallet.jwk);
    await storage.setItem('wallet_jwk', jwkJson);
    await storage.setItem('wallet_address', wallet.address);
    await storage.setItem('wallet_created', wallet.createdAt);
  }

  async getWallet(pin?: string): Promise<WalletInfo | null> {
    try {
      const jwkJson = await storage.getItem('wallet_jwk');
      const address = await storage.getItem('wallet_address');
      const createdAt = await storage.getItem('wallet_created');

      if (!jwkJson || !address) {
        return null;
      }

      return {
        address,
        jwk: JSON.parse(jwkJson),
        createdAt: createdAt || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async hasWallet(): Promise<boolean> {
    const jwk = await storage.getItem('wallet_jwk');
    return !!jwk;
  }

  async getAddress(): Promise<string | null> {
    return await storage.getItem('wallet_address');
  }

  async deleteWallet(): Promise<void> {
    await storage.deleteItem('wallet_jwk');
    await storage.deleteItem('wallet_address');
    await storage.deleteItem('wallet_created');
  }

  async exportWallet(pin?: string): Promise<string> {
    const wallet = await this.getWallet(pin);
    if (!wallet) {
      throw new Error('No wallet found');
    }
    return JSON.stringify(wallet.jwk);
  }

  async sign(data: string, pin?: string): Promise<string> {
    const wallet = await this.getWallet(pin);
    if (!wallet) {
      throw new Error('No wallet found');
    }

    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + (wallet.jwk.d || '')
    );

    return hash;
  }

  async getBalance(address?: string): Promise<number> {
    return 0.5; // Mock balance for demo
  }

  private async getAddressFromJwk(jwk: JWK): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      jwk.n
    );
    return hash.slice(0, 43);
  }

  private generateBase64Url(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const walletManager = new WalletManager();