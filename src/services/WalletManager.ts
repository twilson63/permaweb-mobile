// Wallet Manager - JWK wallet management for Arweave (simplified for demo)

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

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

export class WalletManager {
  /**
   * Generate a new JWK wallet (simplified - demo only)
   */
  async createWallet(): Promise<WalletInfo> {
    // In production, use proper RSA key generation
    // For demo, we create a mock JWK
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

    // Generate address from JWK
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

      // Validate JWK structure
      if (!jwk.kty || !jwk.n || !jwk.e) {
        throw new Error('Invalid JWK: missing required fields');
      }

      // Get address from JWK
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
   * Store wallet securely in device keychain
   */
  async storeWallet(wallet: WalletInfo, pin?: string): Promise<void> {
    const jwkJson = JSON.stringify(wallet.jwk);

    // Store JWK and address
    await SecureStore.setItemAsync('wallet_jwk', jwkJson);
    await SecureStore.setItemAsync('wallet_address', wallet.address);
    await SecureStore.setItemAsync('wallet_created', wallet.createdAt);
  }

  /**
   * Retrieve wallet from secure storage
   */
  async getWallet(pin?: string): Promise<WalletInfo | null> {
    try {
      const jwkJson = await SecureStore.getItemAsync('wallet_jwk');
      const address = await SecureStore.getItemAsync('wallet_address');
      const createdAt = await SecureStore.getItemAsync('wallet_created');

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
    const jwk = await SecureStore.getItemAsync('wallet_jwk');
    return !!jwk;
  }

  /**
   * Get wallet address only (no decryption needed)
   */
  async getAddress(): Promise<string | null> {
    return await SecureStore.getItemAsync('wallet_address');
  }

  /**
   * Delete wallet from device
   */
  async deleteWallet(): Promise<void> {
    await SecureStore.deleteItemAsync('wallet_jwk');
    await SecureStore.deleteItemAsync('wallet_address');
    await SecureStore.deleteItemAsync('wallet_created');
  }

  /**
   * Export wallet JWK for backup
   */
  async exportWallet(pin?: string): Promise<string> {
    const wallet = await this.getWallet(pin);
    if (!wallet) {
      throw new Error('No wallet found');
    }
    return JSON.stringify(wallet.jwk);
  }

  /**
   * Sign data with wallet JWK (simplified for demo)
   */
  async sign(data: string, pin?: string): Promise<string> {
    const wallet = await this.getWallet(pin);
    if (!wallet) {
      throw new Error('No wallet found');
    }

    // In production, use proper RSA signing
    // For demo, we hash the data with the private key
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + (wallet.jwk.d || '')
    );

    return hash;
  }

  /**
   * Get wallet balance (in AR) - mock for demo
   */
  async getBalance(address?: string): Promise<number> {
    // Mock balance for demo
    return 0.5;
  }

  // Private helper methods

  private async getAddressFromJwk(jwk: JWK): Promise<string> {
    // In production, derive from modulus
    // For demo, hash the public key
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      jwk.n
    );
    return hash.slice(0, 43); // Arweave addresses are 43 chars
  }

  private generateBase64Url(length: number): string {
    // Generate random base64url string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const walletManager = new WalletManager();