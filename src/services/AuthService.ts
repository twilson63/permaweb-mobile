// Auth Service - JWK wallet authentication

import { walletManager, WalletInfo } from './WalletManager';
import { HTTPSigFetch } from './HTTPSigSigner';

export interface AuthState {
  isAuthenticated: boolean;
  wallet: WalletInfo | null;
  pin: string | null;
}

export class AuthService {
  private httpSigFetch: HTTPSigFetch | null = null;
  private state: AuthState = {
    isAuthenticated: false,
    wallet: null,
    pin: null,
  };
  
  // Check if wallet exists
  async hasWallet(): Promise<boolean> {
    return walletManager.hasWallet();
  }
  
  // Get wallet address (no auth needed)
  async getAddress(): Promise<string | null> {
    return walletManager.getAddress();
  }
  
  // Create new wallet
  async createWallet(pin?: string): Promise<WalletInfo> {
    // Check if wallet already exists
    if (await this.hasWallet()) {
      throw new Error('Wallet already exists. Import or unlock existing wallet.');
    }
    
    // Generate new JWK
    const wallet = await walletManager.createWallet();
    
    // Store securely
    await walletManager.storeWallet(wallet, pin);
    
    // Update state
    this.state = {
      isAuthenticated: true,
      wallet,
      pin: pin || null,
    };
    
    // Create HTTPSig fetch client
    this.httpSigFetch = new HTTPSigFetch(walletManager, pin);
    
    return wallet;
  }
  
  // Import existing wallet
  async importWallet(jwkJson: string, pin?: string): Promise<WalletInfo> {
    // Import JWK
    const wallet = await walletManager.importWallet(jwkJson);
    
    // Store securely
    await walletManager.storeWallet(wallet, pin);
    
    // Update state
    this.state = {
      isAuthenticated: true,
      wallet,
      pin: pin || null,
    };
    
    // Create HTTPSig fetch client
    this.httpSigFetch = new HTTPSigFetch(walletManager, pin);
    
    return wallet;
  }
  
  // Unlock wallet with PIN
  async unlockWallet(pin: string): Promise<WalletInfo> {
    const wallet = await walletManager.getWallet(pin);
    
    if (!wallet) {
      throw new Error('Invalid PIN or no wallet found');
    }
    
    // Update state
    this.state = {
      isAuthenticated: true,
      wallet,
      pin,
    };
    
    // Create HTTPSig fetch client
    this.httpSigFetch = new HTTPSigFetch(walletManager, pin);
    
    return wallet;
  }
  
  // Lock wallet (require PIN again)
  lockWallet(): void {
    this.state = {
      isAuthenticated: false,
      wallet: null,
      pin: null,
    };
    this.httpSigFetch = null;
  }
  
  // Get current auth state
  getState(): AuthState {
    return { ...this.state };
  }
  
  // Get HTTPSig fetch client
  getFetch(): HTTPSigFetch {
    if (!this.httpSigFetch) {
      throw new Error('Not authenticated. Unlock wallet first.');
    }
    return this.httpSigFetch;
  }
  
  // Export wallet for backup
  async exportWallet(pin?: string): Promise<string> {
    return walletManager.exportWallet(pin);
  }
  
  // Delete wallet
  async deleteWallet(pin?: string): Promise<void> {
    // Verify PIN if set
    if (this.state.pin || pin) {
      await this.unlockWallet(pin || this.state.pin || '');
    }
    
    await walletManager.deleteWallet();
    
    this.state = {
      isAuthenticated: false,
      wallet: null,
      pin: null,
    };
    this.httpSigFetch = null;
  }
  
  // Get wallet balance
  async getBalance(): Promise<number> {
    if (!this.state.wallet) {
      throw new Error('Not authenticated');
    }
    
    return walletManager.getBalance(this.state.wallet.address);
  }
}

export const authService = new AuthService();