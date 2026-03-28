// Pod Service - Connect to PermawebOS pods with HTTPSig

import { HTTPSigFetch } from './HTTPSigSigner';
import { authService } from './AuthService';

export interface Pod {
  id: string;
  name: string;
  status: 'running' | 'pending' | 'stopped';
  subdomain: string;
  ownerWallet: string;
  createdAt: string;
}

export interface Session {
  id: string;
  podId: string;
  status: 'active' | 'sleeping' | 'terminated';
  createdAt: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

const API_BASE = 'https://api.permaweb.run';

export class PodService {
  private getFetch(): HTTPSigFetch {
    return authService.getFetch();
  }
  
  // Pod Management
  async listPods(): Promise<Pod[]> {
    const fetch = this.getFetch();
    const response = await fetch.get(`${API_BASE}/api/pods`);
    
    if (!response.ok) {
      throw new Error(`Failed to list pods: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async createPod(name: string, model: string = 'claude-3-opus'): Promise<Pod> {
    const fetch = this.getFetch();
    const response = await fetch.post(`${API_BASE}/api/pods`, { name, model });
    
    if (!response.ok) {
      throw new Error(`Failed to create pod: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async getPod(podId: string): Promise<Pod> {
    const fetch = this.getFetch();
    const response = await fetch.get(`${API_BASE}/api/pods/${podId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get pod: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async deletePod(podId: string): Promise<void> {
    const fetch = this.getFetch();
    const response = await fetch.delete(`${API_BASE}/api/pods/${podId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to delete pod: ${response.statusText}`);
    }
  }
  
  // Session Management
  async createSession(podId: string): Promise<Session> {
    const fetch = this.getFetch();
    const response = await fetch.post(
      `https://${podId}.pods.permaweb.run/session`,
      {}
    );
    
    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async getSession(podId: string, sessionId: string): Promise<Session> {
    const fetch = this.getFetch();
    const response = await fetch.get(
      `https://${podId}.pods.permaweb.run/session/${sessionId}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Messaging
  async sendMessage(
    podId: string,
    sessionId: string,
    message: string
  ): Promise<void> {
    const fetch = this.getFetch();
    
    await fetch.post(
      `https://${podId}.pods.permaweb.run/session/${sessionId}/prompt_async`,
      { prompt: message }
    );
  }
  
  // Real-time Events (SSE)
  subscribeToEvents(
    podId: string,
    sessionId: string,
    onMessage: (event: any) => void,
    onError?: (error: Error) => void
  ): EventSource {
    // Note: EventSource doesn't support custom headers
    // The session ID acts as authentication
    const es = new EventSource(
      `https://${podId}.pods.permaweb.run/event?session=${sessionId}`
    );
    
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        onMessage(event.data);
      }
    };
    
    es.onerror = () => {
      onError?.(new Error('SSE connection error'));
    };
    
    return es;
  }
  
  // File Operations
  async readFile(podId: string, path: string): Promise<string> {
    const fetch = this.getFetch();
    const response = await fetch.get(
      `https://${podId}.pods.permaweb.run/file/content?path=${encodeURIComponent(path)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    
    return response.text();
  }
  
  async listFiles(podId: string, path: string = '/workspace'): Promise<string[]> {
    const fetch = this.getFetch();
    const response = await fetch.get(
      `https://${podId}.pods.permaweb.run/file/list?path=${encodeURIComponent(path)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async writeFile(
    podId: string,
    path: string,
    content: string
  ): Promise<void> {
    const fetch = this.getFetch();
    
    await fetch.put(
      `https://${podId}.pods.permaweb.run/file`,
      { path, content }
    );
  }
  
  async deleteFile(podId: string, path: string): Promise<void> {
    const fetch = this.getFetch();
    
    await fetch.delete(
      `https://${podId}.pods.permaweb.run/file?path=${encodeURIComponent(path)}`
    );
  }
  
  // Health check (no auth needed)
  async healthCheck(podId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://${podId}.pods.permaweb.run/health`
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const podService = new PodService();