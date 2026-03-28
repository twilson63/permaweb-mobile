// Pod Service - Connect to PermawebOS pods

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
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const API_BASE = 'https://api.permaweb.run';

export class PodService {
  private token: string | null = null;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE;
  }

  // Authentication
  setToken(token: string) {
    this.token = token;
  }

  // Pod Management
  async listPods(): Promise<Pod[]> {
    const response = await fetch(`${this.baseUrl}/api/pods`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.json();
  }

  async createPod(name: string, model: string = 'gpt-4'): Promise<Pod> {
    const response = await fetch(`${this.baseUrl}/api/pods`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, model })
    });
    return response.json();
  }

  async getPod(podId: string): Promise<Pod> {
    const response = await fetch(`${this.baseUrl}/api/pods/${podId}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.json();
  }

  async deletePod(podId: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/pods/${podId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.token}` }
    });
  }

  // Session Management
  async createSession(podId: string): Promise<Session> {
    const response = await fetch(`https://${podId}.pods.permaweb.run/session`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.json();
  }

  // Messaging
  async sendMessage(sessionId: string, podId: string, message: string): Promise<void> {
    await fetch(`https://${podId}.pods.permaweb.run/session/${sessionId}/prompt_async`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: message })
    });
  }

  // Real-time Events (SSE)
  subscribeToEvents(
    sessionId: string,
    podId: string,
    onMessage: (event: any) => void,
    onError?: (error: Error) => void
  ): EventSource {
    const es = new EventSource(
      `https://${podId}.pods.permaweb.run/event?session=${sessionId}&token=${this.token}`
    );
    
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        onMessage(event.data);
      }
    };
    
    es.onerror = (error) => {
      onError?.(new Error('SSE connection error'));
    };
    
    return es;
  }

  // File Operations
  async readFile(podId: string, path: string): Promise<string> {
    const response = await fetch(
      `https://${podId}.pods.permaweb.run/file/content?path=${encodeURIComponent(path)}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return response.text();
  }

  async listFiles(podId: string, path: string = '/workspace'): Promise<string[]> {
    const response = await fetch(
      `https://${podId}.pods.permaweb.run/file/list?path=${encodeURIComponent(path)}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return response.json();
  }

  async writeFile(podId: string, path: string, content: string): Promise<void> {
    await fetch(`https://${podId}.pods.permaweb.run/file`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path, content })
    });
  }
}

export const podService = new PodService();