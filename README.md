# Permaweb Mobile

> A self-contained Arweave wallet app for coding with AI agents via HTTPSig-authenticated pods.

## Overview

Permaweb Mobile is a **wallet-first** mobile application that manages JWK (JSON Web Key) wallets directly on device. It uses HTTPSig (RFC 9421) for authenticated communication with PermawebOS coding agent pods.

### Key Features

- **JWK Wallet Management** - Create, import, export wallets securely
- **HTTPSig Authentication** - Sign all pod requests with wallet JWK
- **No External Dependencies** - Wallet keys never leave device
- **Secure Storage** - Keychain (iOS) / Keystore (Android)
- **Offline-First** - Local state with sync when online
- **Real-Time Streaming** - SSE for AI responses

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 Wallet Manager                           ││
│  │  - Create JWK           - Import JWK                    ││
│  │  - Export (backup)      - SecureStore                   ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  HTTPSig Signer                          ││
│  │  - Sign HTTP requests    - Verify signatures            ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Pod Client                             ││
│  │  - Create pods          - Send messages                  ││
│  │  - File operations      - SSE stream                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPSig-signed requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PermawebOS Pod                            │
│  - HTTPSig verification                                      │
│  - Persistent storage (PVC)                                 │
│  - OpenCode agent                                           │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Framework**: Expo 50 + React Native 0.73
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (file-based)
- **State**: Zustand + React Query
- **Auth**: JWK wallet + HTTPSig
- **Storage**: Expo SecureStore (Keychain/Keystore)
- **Real-time**: SSE (Server-Sent Events)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator (or physical device)

### Installation

```bash
# Clone
git clone https://github.com/twilson63/permaweb-mobile.git
cd permaweb-mobile

# Install dependencies
npm install

# Start development server
npx expo start
```

### Run on Device

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android

# Web (for testing)
npx expo start --web
```

## Wallet Flow

### Create Wallet

```typescript
import { authService } from './services/AuthService';

// Create new JWK wallet
const wallet = await authService.createWallet();
console.log('Address:', wallet.address);
// Backup JWK
const jwk = await authService.exportWallet();
```

### Import Wallet

```typescript
// Import from JWK JSON
const wallet = await authService.importWallet(jwkJson);
```

### Unlock with PIN

```typescript
// If wallet has PIN protection
const wallet = await authService.unlockWallet(pin);
```

## HTTPSig Authentication

All pod requests are signed with the wallet's JWK:

```typescript
import { podService } from './services/PodService';

// Create pod (signed request)
const pod = await podService.createPod('my-project', 'claude-3-opus');

// Send message (signed request)
await podService.sendMessage(pod.id, sessionId, 'Write a React component');

// Subscribe to responses (SSE stream)
const es = podService.subscribeToEvents(pod.id, sessionId, (event) => {
  console.log('Agent response:', event);
});
```

## Security

| Aspect | Implementation |
|--------|---------------|
| **Key Storage** | SecureStore (Keychain/Keystore) |
| **Key Export** | QR code or file, optional PIN encryption |
| **Request Signing** | HTTPSig with RSA-SHA256 |
| **Session Auth** | Signature verified by pod's auth-proxy |
| **Biometric** | Optional Face ID / Touch ID |

## Project Structure

```
permaweb-mobile/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Entry (redirects)
│   ├── auth/
│   │   ├── create.tsx       # Create wallet
│   │   └── import.tsx       # Import wallet
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Home (pod list)
│   │   ├── files.tsx        # File browser
│   │   └── settings.tsx     # Settings
│   └── session/
│       └── [podId].tsx      # Coding session
├── src/
│   ├── components/          # UI components
│   ├── services/
│   │   ├── AuthService.ts   # Wallet auth
│   │   ├── WalletManager.ts # JWK management
│   │   ├── HTTPSigSigner.ts # Request signing
│   │   └── PodService.ts    # Pod client
│   └── hooks/               # Custom hooks
├── docs/
│   ├── MOCKUPS.md          # UI mockups
│   ├── WALLET_ARCHITECTURE.md
│   └── EXPO_BEST_PRACTICES.md
└── package.json
```

## Building

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA updates
eas update --branch production --message "New features"
```

## Documentation

- [Wallet Architecture](./docs/WALLET_ARCHITECTURE.md) - JWK management and HTTPSig
- [Expo Best Practices](./docs/EXPO_BEST_PRACTICES.md) - Performance and patterns
- [UI Mockups](./docs/MOCKUPS.md) - Screen designs

## License

MIT