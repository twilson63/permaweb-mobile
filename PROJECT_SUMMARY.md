# Permaweb Mobile - Project Summary

## Project Created ✅

A mobile app for interfacing with PermawebOS coding agent pods.

### Tech Stack

- **Framework**: Expo 50 + React Native 0.73
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (file-based)
- **State**: Zustand + React Query
- **Auth**: Wallet (Arweave/Ethereum)
- **Storage**: Expo SecureStore + SQLite
- **Real-time**: SSE (Server-Sent Events)

### Project Structure

```
permaweb-mobile/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Entry (redirects)
│   ├── auth.tsx             # Auth screen
│   ├── (tabs)/              # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx        # Home (pod list)
│   │   ├── files.tsx        # File browser
│   │   └── settings.tsx     # Settings
│   └── session/
│       └── [podId].tsx      # Coding session
├── src/
│   ├── components/          # UI components
│   ├── services/            # API services
│   │   ├── AuthService.ts   # Wallet auth
│   │   └── PodService.ts    # Pod management
│   ├── store/               # State management
│   └── hooks/               # Custom hooks
├── docs/
│   ├── MOCKUPS.md          # UI mockups
│   ├── ARCHITECTURE.md     # System design
│   └── EXPO_BEST_PRACTICES.md
├── app.json                 # Expo config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

### Key Features

1. **Wallet Authentication**
   - Arweave (Wander) support
   - Ethereum (MetaMask/WalletConnect)
   - Secure JWT storage (Keychain/Keystore)

2. **Pod Management**
   - Create, list, connect to pods
   - Real-time status updates
   - Persistent workspace (PVC)

3. **Coding Session**
   - Chat interface with AI
   - Code editor with syntax highlighting
   - File browser
   - Terminal access

4. **Real-Time Streaming**
   - SSE for AI responses
   - Push notifications
   - Offline-first with sync

5. **Performance**
   - React Compiler enabled
   - FlashList for large lists
   - Reanimated for animations

### Expo Best Practices Applied

- ✅ TypeScript strict mode
- ✅ ESM imports (tree-shakeable)
- ✅ ESLint with React rules
- ✅ React Compiler (auto-memoization)
- ✅ FlashList instead of FlatList
- ✅ Worklets for animations
- ✅ SecureStore for JWT
- ✅ File-based routing

### Getting Started

```bash
# Clone
git clone https://github.com/twilson63/permaweb-mobile.git
cd permaweb-mobile

# Install dependencies
npm install

# Start development
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

### Building

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA updates
eas update --branch production --message "New features"
```

### Design Mockups

See `docs/MOCKUPS.md` for ASCII mockups of:
- Welcome/Auth screen
- Home/Pod list
- Coding session (chat + editor)
- File browser
- Terminal view
- Settings

For professional mockups, consider:
- [ram.zenbin.org](https://ram.zenbin.org) - AI-powered design generation
- Figma - Free for personal use

### API Endpoints

The app connects to PermawebOS pods:

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/nonce` | Get auth nonce |
| `POST /api/auth/verify` | Verify signature |
| `POST /api/pods` | Create pod |
| `GET /api/pods` | List pods |
| `POST /session` | Create coding session |
| `GET /event` | SSE stream for responses |
| `GET /file/content` | Read file |
| `GET /file/list` | List files |

### Cost

| Component | Cost |
|-----------|-----|
| Expo | Free (managed) |
| EAS Build | Free tier: 30 builds/month |
| EAS Update | Free tier: 100K updates/month |
| Push Notifications | Free (Expo) |
| **Backend** | PermawebOS pods (already running) |

### Next Steps

1. **Design**: Get professional mockups from ram.zenbin.org
2. **Implement**: Build remaining screens
3. **Test**: Add E2E tests with Detox
4. **Ship**: EAS Build + App Store submission

### License

MIT