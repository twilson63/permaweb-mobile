// App State - Global state management with Zustand

import { create } from 'zustand';
import { Pod, Session } from './PodService';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  walletAddress: string | null;
  token: string | null;

  // Pods
  pods: Pod[];
  selectedPod: Pod | null;

  // Session
  activeSession: Session | null;

  // UI
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (token: string, walletAddress: string) => void;
  clearAuth: () => void;
  setPods: (pods: Pod[]) => void;
  selectPod: (pod: Pod | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isAuthenticated: false,
  walletAddress: null,
  token: null,
  pods: [],
  selectedPod: null,
  activeSession: null,
  isLoading: false,
  error: null,

  // Actions
  setAuth: (token, walletAddress) => set({
    isAuthenticated: true,
    token,
    walletAddress
  }),

  clearAuth: () => set({
    isAuthenticated: false,
    token: null,
    walletAddress: null,
    pods: [],
    selectedPod: null,
    activeSession: null
  }),

  setPods: (pods) => set({ pods }),

  selectPod: (pod) => set({ selectedPod: pod }),

  setSession: (session) => set({ activeSession: session }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error })
}));