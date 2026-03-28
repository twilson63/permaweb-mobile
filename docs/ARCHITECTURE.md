# Permaweb Mobile - Project Structure

```
permaweb-mobile/
├── App.tsx                     # Main app entry
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── docs/
│   ├── MOCKUPS.md             # UI mockups (ASCII)
│   └── ARCHITECTURE.md        # System architecture
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── WalletButton.tsx
│   │   ├── Chat/
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── CodeBlock.tsx
│   │   ├── Editor/
│   │   │   ├── CodeEditor.tsx
│   │   │   └── FileTab.tsx
│   │   ├── Files/
│   │   │   ├── FileTree.tsx
│   │   │   └── FileItem.tsx
│   │   └── Terminal/
│   │       └── TerminalView.tsx
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SessionScreen.tsx
│   │   ├── FilesScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── PodService.ts
│   │   └── AuthService.ts
│   ├── store/
│   │   └── AppStore.ts
│   ├── hooks/
│   │   ├── usePod.ts
│   │   └── useSession.ts
│   ├── utils/
│   │   └── api.ts
│   └── types/
│       └── index.ts
└── assets/
    └── icons/
```