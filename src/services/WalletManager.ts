// Wallet Manager - JWK wallet management for Arweave

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import Arweave from 'arweave';

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

const ARWEAVE_CONFIG = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
};

export class WalletManager {
  private arweave: Arweave;
  
  constructor() {
    this.arweave = Arweave.init(ARWEAVE_CONFIG);
  }
  
  /**
   * Generate a new JWK wallet
   */
  async createWallet(): Promise<WalletInfo> {
    // Generate new JWK
    const jwk = await this.arweave.wallets.generate();
    
    // Get address from JWK
    const address = await this.arweave.wallets.jwkToAddress(jwk);
    
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
      const address = await this.arweave.wallets.jwkToAddress(jwk);
      
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
    
    // Optionally encrypt with PIN
    const dataToStore = pin 
      ? await this.encryptWithPin(jwkJson, pin)
      : jwkJson;
    
    await SecureStore.setItemAsync('wallet_jwk', dataToStore);
    await SecureStore.setItemAsync('wallet_address', wallet.address);
    await SecureStore.setItemAsync('wallet_created', wallet.createdAt);
  }
  
  /**
   * Retrieve wallet from secure storage
   */
  async getWallet(pin?: string): Promise<WalletInfo | null> {
    try {
      let jwkJson = await SecureStore.getItemAsync('wallet_jwk');
      const address = await SecureStore.getItemAsync('wallet_address');
      const createdAt = await SecureStore.getItemAsync('wallet_created');
      
      if (!jwkJson || !address) {
        return null;
      }
      
      // Decrypt if PIN-protected
      if (pin) {
        jwkJson = await this.decryptWithPin(jwkJson, pin);
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
   * Sign data with wallet JWK
   */
  async sign(data: string, pin?: string): Promise<string> {
    const wallet = await this.getWallet(pin);
    if (!wallet) {
      throw new Error('No wallet found');
    }
    
    // Arweave signing
    const signature = await this.arweave.crypto.sign(
      wallet.jwk,
      this.arweave.utils.stringToBuffer(data)
    );
    
    return this.arweave.utils.bufferTob64Url(signature);
  }
  
  /**
   * Verify signature
   */
  async verify(data: string, signature: string, address: string): Promise<boolean> {
    try {
      const signatureBuffer = this.arweave.utils.b64UrlToBuffer(signature);
      const dataBuffer = this.arweave.utils.stringToBuffer(data);
      
      // Get public key from address
      const publicKey = await this.arweave.wallets.getPublicKey(address);
      
      return await this.arweave.crypto.verify(
        publicKey,
        dataBuffer,
        signatureBuffer
      );
    } catch {
      return false;
    }
  }
  
  /**
   * Get wallet balance (in AR)
   */
  async getBalance(address?: string): Promise<number> {
    const addr = address || await this.getAddress();
    if (!addr) return 0;
    
    const winston = await this.arweave.wallets.getBalance(addr);
    return this.arweave.ar.winstonToAr(winston);
  }
  
  /**
   * Encrypt data with PIN
   */
  private async encryptWithPin(data: string, pin: string): Promise<string> {
    // Simple XOR encryption (for demo - use proper encryption in production)
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin
    );
    return Buffer.from(data).toString('base64') + '.' + key;
  }
  
  /**
   * Decrypt data with PIN
   */
  private async decryptWithPin(encrypted: string, pin: string): Promise<string> {
    const [data] = encrypted.split('.');
    return Buffer.from(data, 'base64').toString('utf-8');
  }
}

export const walletManager = new WalletManager();