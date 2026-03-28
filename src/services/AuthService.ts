// Auth Service - Wallet authentication for Permaweb Mobile

export interface WalletInfo {
  type: 'arweave' | 'ethereum';
  address: string;
}

export interface AuthResponse {
  token: string;
  podId?: string;
}

export class AuthService {
  private token: string | null = null;
  private wallet: WalletInfo | null = null;

  // Arweave Wallet (Wander)
  async connectArweave(): Promise<WalletInfo> {
    // In production, use Wander SDK
    // For now, mock the connection
    if (typeof window !== 'undefined' && (window as any).arweaveWallet) {
      const wallet = (window as any).arweaveWallet;
      const address = await wallet.getActiveAddress();
      return { type: 'arweave', address };
    }
    
    // Mock for development
    throw new Error('Arweave wallet not installed. Please install Wander wallet.');
  }

  // Ethereum Wallet (MetaMask / WalletConnect)
  async connectEthereum(): Promise<WalletInfo> {
    // In production, use WalletConnect or ethers
    // For now, mock the connection
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts'
      });
      return { type: 'ethereum', address: accounts[0] };
    }
    
    throw new Error('Ethereum wallet not installed. Please install MetaMask.');
  }

  // Get authentication nonce
  async getNonce(address: string, walletType: 'arweave' | 'ethereum'): Promise<string> {
    const response = await fetch('https://api.permaweb.run/api/auth/nonce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, walletType })
    });
    
    const { nonce } = await response.json();
    return nonce;
  }

  // Verify signature and get token
  async verify(
    address: string,
    signature: string,
    nonce: string,
    walletType: 'arweave' | 'ethereum'
  ): Promise<AuthResponse> {
    const response = await fetch('https://api.permaweb.run/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature, nonce, walletType })
    });
    
    const data = await response.json();
    this.token = data.token;
    return data;
  }

  // Sign message with wallet
  async signMessage(message: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('No wallet connected');
    }

    if (this.wallet.type === 'arweave') {
      if (typeof window !== 'undefined' && (window as any).arweaveWallet) {
        return await (window as any).arweaveWallet.signMessage(message);
      }
    } else if (this.wallet.type === 'ethereum') {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        return await (window as any).ethereum.request({
          method: 'personal_sign',
          params: [message, this.wallet.address]
        });
      }
    }

    throw new Error('Wallet not available');
  }

  // Full authentication flow
  async authenticate(walletType: 'arweave' | 'ethereum'): Promise<AuthResponse> {
    // 1. Connect wallet
    this.wallet = walletType === 'arweave'
      ? await this.connectArweave()
      : await this.connectEthereum();

    // 2. Get nonce
    const nonce = await this.getNonce(this.wallet.address, walletType);

    // 3. Sign nonce
    const signature = await this.signMessage(nonce);

    // 4. Verify and get token
    return await this.verify(this.wallet.address, signature, nonce, walletType);
  }

  // Get stored token
  getToken(): string | null {
    return this.token;
  }

  // Get connected wallet
  getWallet(): WalletInfo | null {
    return this.wallet;
  }

  // Logout
  logout(): void {
    this.token = null;
    this.wallet = null;
  }
}

export const authService = new AuthService();