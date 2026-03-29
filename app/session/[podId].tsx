import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { podService } from '../../src/services/PodService';
import { authService } from '../../src/services/AuthService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SessionScreen() {
  const { podId } = useLocalSearchParams<{ podId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initSession();
  }, [podId]);

  async function initSession() {
    try {
      // Create session for this pod
      const session = await podService.createSession(podId!);
      setSessionKey(session.id);
      
      // Add welcome message
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your AI coding assistant. I can help you write code, debug, and explore your workspace. What would you like to work on?',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Failed to create session:', error);
      // Add mock message for demo
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your AI coding assistant. (Demo mode - pod not connected)',
          timestamp: new Date(),
        },
      ]);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (sessionKey) {
        // Send to pod
        await podService.sendMessage(podId!, sessionKey, userMessage.content);
        
        // In real app, would subscribe to SSE for response
        // For demo, add mock response
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I understand you want to "${userMessage.content.slice(0, 50)}...". Let me help you with that. (Demo mode)`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setLoading(false);
        }, 1000);
      } else {
        // Mock response for demo
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I received your message: "${userMessage.content}". In demo mode, I can't connect to the pod, but in production I would help you code!`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setLoading(false);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.message,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Session</Text>
        <Text style={styles.podId}>Pod: {podId?.slice(0, 8)}...</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#64748B"
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendButtonText}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  podId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#6366F1',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
  sendButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
});