// HTTPSig Signer - Sign HTTP requests with JWK

import { WalletManager, JWK } from './WalletManager';
import { digestStringAsync, CryptoDigestAlgorithm, CryptoEncoding } from 'expo-crypto';

interface SignedRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

interface SignatureParams {
  keyId: string;
  algorithm: string;
  headers: string[];
  signature: string;
}

export class HTTPSigSigner {
  private walletManager: WalletManager;
  
  constructor(walletManager: WalletManager) {
    this.walletManager = walletManager;
  }
  
  /**
   * Sign an HTTP request with HTTPSig (RFC 9421)
   */
  async signRequest(
    request: SignedRequest,
    pin?: string
  ): Promise<Record<string, string>> {
    const address = await this.walletManager.getAddress();
    if (!address) {
      throw new Error('No wallet found');
    }
    
    const now = new Date().toUTCString();
    const url = new URL(request.url);
    
    // Build headers for signature
    const headersToSign = ['(request-target)', 'host', 'date'];
    const headerValues: Record<string, string> = {
      '(request-target)': `${request.method.toLowerCase()} ${url.pathname}${url.search}`,
      'host': url.host,
      'date': now,
    };
    
    // Add digest for POST/PUT/PATCH
    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      headersToSign.push('content-type', 'digest');
      headerValues['content-type'] = 'application/json';
      headerValues['digest'] = await this.sha256Base64(request.body);
    }
    
    // Build signing string
    const signingString = headersToSign
      .map(h => `${h}: ${headerValues[h]}`)
      .join('\n');
    
    // Sign with JWK
    const signature = await this.walletManager.sign(signingString, pin);
    
    // Build Signature header
    const signatureHeader = this.buildSignatureHeader({
      keyId: address,
      algorithm: 'rsa-sha256',
      headers: headersToSign,
      signature,
    });
    
    // Return signed headers
    return {
      'Date': now,
      'Signature': signatureHeader,
      'Host': url.host,
      ...(request.body ? { 
        'Content-Type': 'application/json',
        'Digest': headerValues['digest'] 
      } : {}),
    };
  }
  
  /**
   * Build Signature header value
   */
  private buildSignatureHeader(params: SignatureParams): string {
    return `keyId="${params.keyId}",algorithm="${params.algorithm}",headers="${params.headers.join(' ')}",signature="${params.signature}"`;
  }
  
  /**
   * SHA-256 hash to base64
   */
  private async sha256Base64(data: string): Promise<string> {
    const hash = await digestStringAsync(
      CryptoDigestAlgorithm.SHA256,
      data,
      CryptoEncoding.BASE64
    );
    
    return `SHA-256=${hash}`;
  }
  
  /**
   * Verify a signature from a response
   */
  async verifySignature(
    data: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    return this.walletManager.verify(data, signature, address);
  }
}

/**
 * Fetch wrapper that signs requests with HTTPSig
 */
export class HTTPSigFetch {
  private signer: HTTPSigSigner;
  private pin?: string;
  
  constructor(walletManager: WalletManager, pin?: string) {
    this.signer = new HTTPSigSigner(walletManager);
    this.pin = pin;
  }
  
  async fetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const method = options.method || 'GET';
    const body = options.body as string | undefined;
    
    // Sign the request
    const signedHeaders = await this.signer.signRequest(
      {
        method,
        url,
        body,
      },
      this.pin
    );
    
    // Merge headers
    const headers = {
      ...options.headers,
      ...signedHeaders,
    };
    
    // Make request
    return fetch(url, {
      ...options,
      headers,
    });
  }
  
  async get(url: string): Promise<Response> {
    return this.fetch(url, { method: 'GET' });
  }
  
  async post(url: string, body: any): Promise<Response> {
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  
  async put(url: string, body: any): Promise<Response> {
    return this.fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
  
  async delete(url: string): Promise<Response> {
    return this.fetch(url, { method: 'DELETE' });
  }
}