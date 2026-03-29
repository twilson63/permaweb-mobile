// Wallet Manager - JWK wallet management for Arweave

import * as SecureStore from 'expo-secure-store';
import { digestStringAsync, CryptoDigestAlgorithm, CryptoEncoding } from 'expo-crypto';
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
   * Generate a new JWK wallet
   */
  async createWallet(): Promise<WalletInfo> {
    // Generate RSA key pair
    const jwk = await this.generateRSAKeyPair();
    const address = await this.getAddressFromJwk(jwk);

    return {
      address,
      jwk,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Import an existing JWK wallet
   */
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

  /**
   * Store wallet securely
   */
  async storeWallet(wallet: WalletInfo, pin?: string): Promise<void> {
    const jwkJson = JSON.stringify(wallet.jwk);
    await storage.setItem('wallet_jwk', jwkJson);
    await storage.setItem('wallet_address', wallet.address);
    await storage.setItem('wallet_created', wallet.createdAt);
  }

  /**
   * Get wallet from storage
   */
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

  /**
   * Check if wallet exists
   */
  async hasWallet(): Promise<boolean> {
    const jwk = await storage.getItem('wallet_jwk');
    return !!jwk;
  }

  /**
   * Get wallet address
   */
  async getAddress(): Promise<string | null> {
    return await storage.getItem('wallet_address');
  }

  /**
   * Delete wallet
   */
  async deleteWallet(): Promise<void> {
    await storage.deleteItem('wallet_jwk');
    await storage.deleteItem('wallet_address');
    await storage.deleteItem('wallet_created');
  }

  /**
   * Export wallet JWK
   */
  async exportWallet(pin?: string): Promise<string> {
    const wallet = await this.getWallet(pin);
    if (!wallet) {
      throw new Error('No wallet found');
    }
    return JSON.stringify(wallet.jwk);
  }

  /**
   * Sign data with RSA-PSS (Arweave compatible)
   */
  async sign(data: string, pin?: string): Promise<string> {
    const wallet = await this.getWallet(pin);
    if (!wallet) {
      throw new Error('No wallet found');
    }

    // For web, we use the Web Crypto API
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.crypto?.subtle) {
      return await this.signWithWebCrypto(data, wallet.jwk);
    }

    // For native, we need to use a proper RSA implementation
    // For now, return a mock signature (demo mode)
    console.warn('RSA signing not fully implemented for native - using demo mode');
    
    const hash = await digestStringAsync(
      CryptoDigestAlgorithm.SHA256,
      data,
      CryptoEncoding.HEX
    );
    return hash;
  }

  /**
   * Sign using Web Crypto API (browser)
   */
  private async signWithWebCrypto(data: string, jwk: JWK): Promise<string> {
    try {
      // Import the private key
      const privateKey = await window.crypto.subtle.importKey(
        'jwk',
        jwk as any,
        {
          name: 'RSA-PSS',
          hash: 'SHA-256',
        },
        false,
        ['sign']
      );

      // Sign the data
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const signatureBuffer = await window.crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        privateKey,
        dataBuffer
      );

      // Convert to base64url
      const signatureArray = new Uint8Array(signatureBuffer);
      return this.arrayBufferToBase64Url(signatureArray);
    } catch (error) {
      console.error('Web Crypto signing failed:', error);
      throw new Error('Failed to sign with Web Crypto');
    }
  }

  /**
   * Generate RSA key pair
   */
  private async generateRSAKeyPair(): Promise<JWK> {
    // For web, use Web Crypto API
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.crypto?.subtle) {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );

      // Export as JWK
      const jwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
      
      return {
        kty: jwk.kty!,
        n: jwk.n!,
        e: jwk.e!,
        d: jwk.d!,
        p: jwk.p!,
        q: jwk.q!,
        dp: jwk.dp!,
        dq: jwk.dq!,
        qi: jwk.qi!,
      } as JWK;
    }

    // For native, generate a mock JWK (demo mode)
    console.warn('RSA generation using mock for native - use importWallet for real keys');
    return {
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
  }

  /**
   * Get address from JWK
   */
  private async getAddressFromJwk(jwk: JWK): Promise<string> {
    const hash = await digestStringAsync(
      CryptoDigestAlgorithm.SHA256,
      jwk.n,
      CryptoEncoding.HEX
    );
    
    return hash.slice(0, 43); // Arweave addresses are 43 characters
  }

  /**
   * Convert ArrayBuffer to base64url
   */
  private arrayBufferToBase64Url(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Generate random base64url string
   */
  private generateBase64Url(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get wallet balance (mock for demo)
   */
  async getBalance(address?: string): Promise<number> {
    return 0.5; // Mock balance
  }
}

export const walletManager = new WalletManager();