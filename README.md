# Permaweb Mobile

> A mobile application for interfacing with PermawebOS coding agent pods.

## Overview

Permaweb Mobile is a React Native application that connects users to their personal coding agent pods. Users authenticate with their Arweave or Ethereum wallet, access persistent workspace storage, and interact with AI coding assistants from their mobile devices.

## Features

- **Wallet Authentication** - Arweave (Wander) and Ethereum (MetaMask, WalletConnect)
- **Persistent Sessions** - Coding sessions survive app restarts
- **Real-Time Streaming** - SSE for streaming AI responses
- **Offline-First** - Local file cache with sync when online
- **Code Editor** - Monaco-powered editor with mobile optimizations
- **Terminal Access** - xterm.js terminal in browser
- **Push Notifications** - Get notified when AI completes tasks

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Auth       │  │  Session    │  │  Code Editor       │ │
│  │  (Wallet)   │  │  Manager    │  │  (Monaco)          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  File       │  │  Terminal   │  │  Push              │ │
│  │  Browser    │  │  View       │  │  Notifications     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + Wallet Auth
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PermawebOS Pod                            │
│  - HTTPSig authentication                                    │
│  - Persistent storage (PVC)                                 │
│  - OpenCode agent                                           │
│  - Real-time streaming                                       │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Auth**: Wander SDK / WalletConnect
- **Editor**: Monaco Editor (web) / CodeMirror (mobile)
- **Terminal**: xterm.js
- **State**: React Query + Zustand
- **Storage**: Expo SecureStore + SQLite
- **Real-time**: SSE (Server-Sent Events)
- **Push**: Expo Notifications

## Project Structure

```
permaweb-mobile/
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   ├── API.md              # API reference
│   └── MOCKUPS.md          # UI mockups
├── src/
│   ├── components/         # Reusable components
│   │   ├── Auth/           # Authentication components
│   │   ├── Editor/         # Code editor components
│   │   ├── Files/          # File browser components
│   │   ├── Terminal/        # Terminal components
│   │   └── Chat/           # Chat/message components
│   ├── screens/            # Screen components
│   ├── services/           # API and business logic
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript types
├── assets/                 # Images, fonts, etc.
├── App.tsx                 # Main app entry
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator (or physical device)

### Installation

```bash
# Clone the repository
git clone https://github.com/twilson63/permaweb-mobile.git
cd permaweb-mobile

# Install dependencies
npm install

# Start development server
npx expo start
```

### Development

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android

# Web (for testing)
npx expo start --web
```

## API Endpoints

The app connects to PermawebOS pods via these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/nonce` | POST | Get authentication nonce |
| `/api/auth/verify` | POST | Verify wallet signature |
| `/api/pods` | POST | Create new pod |
| `/api/pods` | GET | List user's pods |
| `/session` | POST | Create coding session |
| `/session/:id/message` | POST | Send message to agent |
| `/session/:id/prompt_async` | POST | Send message (async) |
| `/event` | GET | SSE stream for responses |
| `/file/content` | GET | Read file from pod |
| `/file/list` | GET | List files in pod |

## Screens

1. **Welcome/Auth** - Wallet connection
2. **Home** - Pod list and status
3. **Session** - Coding session (chat + editor)
4. **Files** - File browser
5. **Settings** - App preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Links

- [PermawebOS](https://github.com/twilson63/permaweb-os)
- [OpenCode](https://github.com/sst/opencode)
- [Wander Wallet](https://wander.app)