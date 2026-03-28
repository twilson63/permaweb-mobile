# Permaweb Mobile - Wallet Architecture

## Overview

The mobile app is a **self-contained Arweave wallet** that manages JWK (JSON Web Key) wallets directly. It uses HTTPSig (RFC 9421) for authenticated communication with PermawebOS pods.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Wallet Manager                         ││
│  │  - Create new JWK wallet                                 ││
│  │  - Import existing JWK                                   ││
│  │  - Export JWK (backup)                                   ││
│  │  - Secure storage (Keychain/Keystore)                    ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    HTTPSig Signer                         ││
│  │  - Sign requests with JWK                               ││
│  │  - Add Signature header                                  ││
│  │  - Verify response signatures                            ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Pod Client                             ││
│  │  - Create pod (signed request)                           ││
│  │  - Send messages (signed request)                        ││
│  │  - Receive responses (SSE stream)                        ││
│  │  - Read/write files (signed request)                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPSig-signed requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PermawebOS Pod                            │
│  - HTTPSig verification                                      │
│  - Session management                                        │
│  - OpenCode agent                                            │
│  - Persistent storage (PVC)                                 │
└─────────────────────────────────────────────────────────────┘
```

## Wallet Management

### Creating a Wallet

```typescript
import Arweave from 'arweave';
import * as SecureStore from 'expo-secure-store';

// Generate new JWK
const arweave = Arweave.init({});
const jwk = await arweave.wallets.generate();

// Get address
const address = await arweave.wallets.jwkToAddress(jwk);

// Store securely
await SecureStore.setItemAsync('wallet_jwk', JSON.stringify(jwk));
await SecureStore.setItemAsync('wallet_address', address);
```

### Importing a Wallet

```typescript
// User provides JWK JSON
async function importWallet(jwkJson: string): Promise<string> {
  const jwk = JSON.parse(jwkJson);
  
  // Validate
  const arweave = Arweave.init({});
  const address = await arweave.wallets.jwkToAddress(jwk);
  
  // Store
  await SecureStore.setItemAsync('wallet_jwk', jwkJson);
  await SecureStore.setItemAsync('wallet_address', address);
  
  return address;
}
```

### Exporting a Wallet (Backup)

```typescript
async function exportWallet(): Promise<string> {
  const jwkJson = await SecureStore.getItemAsync('wallet_jwk');
  if (!jwkJson) throw new Error('No wallet found');
  
  // Offer secure export (QR code, file, clipboard)
  return jwkJson;
}
```

## HTTPSig Signing

### Request Signing

```typescript
import { createSign, createHash } from 'crypto';

interface SignedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

async function signRequest(
  jwk: JWK,
  request: SignedRequest
): Promise<Record<string, string>> {
  const now = new Date().toISOString();
  
  // Build signing string
  const signingString = [
    `(request-target): ${request.method.toLowerCase()} ${new URL(request.url).pathname}`,
    `host: ${new URL(request.url).host}`,
    `date: ${now}`,
    request.body ? `digest: SHA-256=${await sha256Base64(request.body)}` : '',
  ].filter(Boolean).join('\n');
  
  // Sign with JWK
  const signature = await signWithJwk(jwk, signingString);
  
  // Build Signature header
  const keyId = await getAddress(jwk);
  const signatureHeader = `keyId="${keyId}",algorithm="rsa-sha256",headers="(request-target) host date${request.body ? ' digest' : ''}",signature="${signature}"`;
  
  return {
    'Date': now,
    'Signature': signatureHeader,
    ...(request.body ? { 'Digest': `SHA-256=${await sha256Base64(request.body)}` } : {}),
  };
}
```

### Pod Client with HTTPSig

```typescript
class PodClient {
  private jwk: JWK;
  private address: string;
  private baseUrl: string;
  
  constructor(jwk: JWK, address: string) {
    this.jwk = jwk;
    this.address = address;
    this.baseUrl = 'https://api.permaweb.run';
  }
  
  // Create pod with signed request
  async createPod(name: string, model: string): Promise<Pod> {
    const body = JSON.stringify({ name, model });
    const url = `${this.baseUrl}/api/pods`;
    
    const signatureHeaders = await signRequest(this.jwk, {
      method: 'POST',
      url,
      body,
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...signatureHeaders,
      },
      body,
    });
    
    return response.json();
  }
  
  // Send message to pod
  async sendMessage(podId: string, sessionKey: string, message: string): Promise<void> {
    const body = JSON.stringify({ prompt: message });
    const url = `https://${podId}.pods.permaweb.run/session/${sessionKey}/prompt_async`;
    
    const signatureHeaders = await signRequest(this.jwk, {
      method: 'POST',
      url,
      body,
    });
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...signatureHeaders,
      },
      body,
    });
  }
  
  // Subscribe to SSE stream
  subscribeToEvents(podId: string, sessionKey: string): EventSource {
    // SSE doesn't need signing per-request, but initial auth is required
    return new EventSource(
      `https://${podId}.pods.permaweb.run/event?session=${sessionKey}&owner=${this.address}`
    );
  }
}
```

## Secure Storage

### Keychain Storage (iOS) / Keystore (Android)

```typescript
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Store JWK securely
async function storeWallet(jwk: JWK, address: string, pin?: string): Promise<void> {
  const jwkJson = JSON.stringify(jwk);
  
  // Optionally encrypt with PIN
  const dataToStore = pin 
    ? await encryptWithPin(jwkJson, pin)
    : jwkJson;
  
  await SecureStore.setItemAsync('wallet_jwk', dataToStore);
  await SecureStore.setItemAsync('wallet_address', address);
}

// Retrieve JWK
async function getWallet(pin?: string): Promise<{ jwk: JWK; address: string }> {
  let jwkJson = await SecureStore.getItemAsync('wallet_jwk');
  const address = await SecureStore.getItemAsync('wallet_address');
  
  if (!jwkJson || !address) {
    throw new Error('No wallet found');
  }
  
  // Decrypt if PIN-protected
  if (pin) {
    jwkJson = await decryptWithPin(jwkJson, pin);
  }
  
  return {
    jwk: JSON.parse(jwkJson),
    address,
  };
}

// Check if wallet exists
async function hasWallet(): Promise<boolean> {
  const jwk = await SecureStore.getItemAsync('wallet_jwk');
  return !!jwk;
}

// Delete wallet
async function deleteWallet(): Promise<void> {
  await SecureStore.deleteItemAsync('wallet_jwk');
  await SecureStore.deleteItemAsync('wallet_address');
}
```

## Auth Flow

```
1. App opens
   ├── Check if wallet exists
   │   ├── Yes: Show home screen
   │   └── No: Show welcome/create/import screen
   │
2. Create wallet
   ├── Generate JWK
   ├── Get address
   ├── Store in SecureStore
   └── Show backup prompt (export JWK)
   │
3. Import wallet
   ├── Paste JWK JSON or scan QR
   ├── Validate JWK
   ├── Store in SecureStore
   └── Show home screen
   │
4. Use wallet
   ├── Sign HTTP requests with HTTPSig
   ├── Communicate with pod
   └── Receive responses
```

## Security Considerations

| Aspect | Implementation |
|--------|---------------|
| **Key Storage** | SecureStore (Keychain/Keystore) |
| **Key Export** | QR code or file, optional PIN encryption |
| **Request Signing** | HTTPSig with RSA-SHA256 |
| **Session Auth** | Signature verified by pod's auth-proxy |
| **Biometric** | Optional Face ID / Touch ID for access |

## Wallet Screens

### Welcome Screen

```
┌─────────────────────────────────────┐
│                                     │
│           ┌─────────┐               │
│           │  📱    │               │
│           │ LOGO   │               │
│           └─────────┘               │
│                                     │
│         Permaweb Mobile             │
│      Your AI Coding Wallet          │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Create New Wallet         │   │
│   │   ✨ Generate JWK            │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Import Wallet            │   │
│   │   📥 Paste or scan JWK      │   │
│   └─────────────────────────────┘   │
│                                     │
│          ─────────────              │
│          Your JWK is stored          │
│          securely on device         │
│                                     │
└─────────────────────────────────────┘
```

### Backup Screen

```
┌─────────────────────────────────────┐
│ ← Back                    Backup    │
│                                     │
│   ⚠️  Important: Backup Your Wallet │
│                                     │
│   Your JWK (private key) is the     │
│   only way to recover your wallet.  │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Address:                  │   │
│   │   7CZH...X9KF               │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   [Show JWK as QR Code]     │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   [Copy JWK to Clipboard]   │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   [Export to File]          │   │
│   └─────────────────────────────┘   │
│                                     │
│   ───────────────────────────────   │
│   ⚠️ Never share your JWK!          │
│   Anyone with your JWK can          │
│   control your wallet.              │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   I've backed up my JWK     │   │
│   │   Continue →                │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Implementation Priority

1. **Wallet Creation/Import** - Core functionality
2. **Secure Storage** - Keychain/Keystore
3. **HTTPSig Signing** - Pod authentication
4. **Pod Client** - Signed requests
5. **Backup/Export** - QR code, file export
6. **Biometric Lock** - Face ID/Touch ID