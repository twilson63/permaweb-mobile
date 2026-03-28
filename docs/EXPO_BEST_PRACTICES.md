# Expo Best Practices Guide

## Overview

Expo is the recommended framework for building Permaweb Mobile. This guide covers the best practices for 2024/2025.

## Why Expo?

| Feature | Benefit |
|---------|---------|
| **Managed Workflow** | No native code needed |
| **EAS Build** | Cloud builds for iOS/Android |
| **OTA Updates** | Push updates without app store review |
| **Expo Router** | File-based routing (like Next.js) |
| **Dev Client** | Custom native code when needed |
| **New Architecture** | Fabric renderer, synchronous bridge |

## Project Setup

```bash
# Create new Expo project
npx create-expo-app@latest permaweb-mobile --template tabs

# Install dependencies
npx expo install \
  expo-secure-store \
  expo-local-authentication \
  @react-native-async-storage/async-storage \
  expo-notifications

# Install Expo Router (file-based routing)
npx expo install expo-router
```

## Expo Router (File-Based Routing)

### Structure

```
app/
├── _layout.tsx           # Root layout
├── index.tsx             # Home screen (/)
├── auth/
│   ├── _layout.tsx       # Auth layout
│   ├── login.tsx         # Login screen (/auth/login)
│   └── wallet.tsx        # Wallet connect (/auth/wallet)
├── (tabs)/
│   ├── _layout.tsx      # Tabs layout
│   ├── index.tsx        # Home tab
│   ├── files.tsx        # Files tab
│   └── settings.tsx     # Settings tab
├── session/
│   └── [podId].tsx      # Session screen (/session/:podId)
└── +not-found.tsx       # 404 screen
```

### Example Layout

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="session/[podId]" options={{ title: 'Session' }} />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: HomeIcon }} />
      <Tabs.Screen name="files" options={{ title: 'Files', tabBarIcon: FilesIcon }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: SettingsIcon }} />
    </Tabs>
  );
}
```

## Performance Best Practices

### 1. Use TypeScript

```bash
# Enable TypeScript
npx expo customize tsconfig.json

# tsconfig.json
{
  "compilerOptions": {
    "strict": true,  // Always enable strict mode
    "noUncheckedIndexedAccess": true
  }
}
```

### 2. Enable React Compiler

```bash
# Install React Compiler
npm install babel-plugin-react-compiler

# Check codebase health
npx react-compiler-healthcheck@latest
```

```json
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['react-compiler', {}]  // Auto-memoization
    ]
  };
};
```

### 3. Use Static JavaScript Features

```tsx
// ✅ Good: ESM imports (tree-shakeable)
import { PodService } from './services/PodService';

// ❌ Bad: CommonJS (not tree-shakeable)
const { PodService } = require('./services/PodService');

// ✅ Good: const for immutability
const POD_LIMIT = 100;

// ❌ Bad: var (hoisting issues)
var podLimit = 100;
```

### 4. Enable ESLint

```bash
# Setup ESLint
npx expo lint .
```

```json
// .eslintrc.js
module.exports = {
  extends: ['expo', 'eslint:recommended', 'plugin:react/recommended'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'error'
  }
};
```

### 5. Optimize Lists

```tsx
// Use FlashList for large lists (not FlatList)
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={pods}
  renderItem={({ item }) => <PodCard pod={item} />}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>
```

### 6. Use Worklets for Animations

```tsx
// Install Reanimated
npx expo install react-native-reanimated

// Use worklet for UI thread work
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

function AnimatedPod({ pod }) {
  const style = useAnimatedStyle(() => {
    'worklet';  // Runs on UI thread
    return {
      transform: [{ scale: withSpring(pod.isActive ? 1.1 : 1) }]
    };
  });
  
  return <Animated.View style={style}>...</Animated.View>;
}
```

## State Management

### Zustand (Recommended)

```tsx
// stores/appStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create(
  persist(
    (set) => ({
      // State
      pods: [],
      activePod: null,
      
      // Actions
      setPods: (pods) => set({ pods }),
      setActivePod: (pod) => set({ activePod: pod }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### React Query for Server State

```tsx
// hooks/usePods.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { podService } from '../services/PodService';

export function usePods() {
  return useQuery({
    queryKey: ['pods'],
    queryFn: () => podService.listPods(),
  });
}

export function useCreatePod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => podService.createPod(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pods'] });
    },
  });
}
```

## Secure Storage

```tsx
// JWT tokens should use SecureStore (Keychain/Keystore)
import * as SecureStore from 'expo-secure-store';

// Save JWT
await SecureStore.setItemAsync('jwt', token);

// Get JWT
const token = await SecureStore.getItemAsync('jwt');

// Delete JWT
await SecureStore.deleteItemAsync('jwt');
```

## Push Notifications

```tsx
// app/_layout.tsx
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Request permissions
    Notifications.requestPermissionsAsync();
    
    // Get push token
    Notifications.getExpoPushTokenAsync().then(({ data }) => {
      // Send to server
      podService.registerDeviceToken(podId, data);
    });
    
    // Handle notifications
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { sessionId, message } = notification.request.content.data;
      // Handle notification
    });
    
    return () => subscription.remove();
  }, []);
  
  return <Stack>...</Stack>;
}
```

## Network & Offline

### React Query with Offline Support

```tsx
// app/_layout.tsx
import { onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
```

### SSE for Real-Time

```tsx
// hooks/useSSE.ts
import { useEffect, useRef } from 'react';
import { EventSource } from 'eventsource';

export function useSSE(sessionId: string, onMessage: (data: any) => void) {
  const esRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    esRef.current = new EventSource(
      `https://${podId}.pods.permaweb.run/event?session=${sessionId}`
    );
    
    esRef.current.onmessage = (event) => {
      onMessage(JSON.parse(event.data));
    };
    
    return () => {
      esRef.current?.close();
    };
  }, [sessionId]);
}
```

## Debugging

```bash
# Open Chrome DevTools (press J in Expo CLI)
npx expo start

# Highlight React renders
# DevTools > Profiler > Gear > "Highlight updates when components render"
```

## Building

### EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure builds
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### OTA Updates

```bash
# Publish update
eas update --branch production --message "Add new features"

# Rollback
eas update --rollback
```

## Key Libraries

```json
{
  "dependencies": {
    // Core
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "expo-secure-store": "~12.8.0",
    "expo-notifications": "~0.27.0",
    
    // State
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.17.0",
    
    // UI
    "@shopify/flash-list": "^1.4.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    
    // Storage
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-sqlite": "~13.4.0",
    
    // Network
    "eventsource": "^2.0.2",
    "@react-native-community/netinfo": "^11.0.0"
  }
}
```

## Testing

```bash
# Run tests
npx expo test

# E2E tests with Detox
npm install --save-dev detox detox-expo
```

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Compiler Guide](https://react.dev/learn/react-compiler)
- [Performance Best Practices](https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps)