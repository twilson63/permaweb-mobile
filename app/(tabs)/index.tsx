import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { authService } from '../../src/services/AuthService';
import { podService } from '../../src/services/PodService';
import { Pod } from '../../src/services/PodService';

export default function HomeScreen() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState<{ address: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const state = authService.getState();
      if (!state.isAuthenticated) {
        router.replace('/auth');
        return;
      }
      setWallet(state.wallet);
      
      // Try to load pods, but use mock data if offline/demo
      try {
        const podList = await podService.listPods();
        setPods(podList);
      } catch (error) {
        console.log('Using demo data - pod service not available');
        // Mock pods for demo
        setPods([
          {
            id: 'demo-pod-1',
            name: 'my-project',
            status: 'running',
            subdomain: 'demo-pod-1.pods.permaweb.run',
            ownerWallet: state.wallet?.address || '',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load pods:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function handleCreatePod() {
    if (Platform.OS === 'web') {
      alert('Coming Soon!\n\nPod creation will be available soon.\n\nFor now, use the demo pod to explore the app.');
    } else {
      Alert.alert('Coming Soon', 'Pod creation will be available soon.');
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'running':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      default:
        return '#94A3B8';
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.address}>
          {wallet?.address.slice(0, 8)}...{wallet?.address.slice(-8)}
        </Text>
      </View>

      <FlatList
        data={pods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.podCard}
            onPress={() => router.push(`/session/${item.id}`)}
          >
            <View style={styles.podHeader}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
              <Text style={styles.podName}>{item.name}</Text>
            </View>
            <Text style={styles.podDomain}>{item.subdomain}</Text>
            <Text style={styles.podDate}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pods yet</Text>
            <Text style={styles.emptyHint}>Create your first coding pod</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePod}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  address: {
    fontSize: 14,
    color: '#6366F1',
    fontFamily: 'monospace',
  },
  list: {
    padding: 16,
  },
  podCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  podHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  podName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  podDomain: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  podDate: {
    fontSize: 12,
    color: '#64748B',
  },
  empty: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyText: {
    fontSize: 18,
    color: '#F8FAFC',
  },
  emptyHint: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 24,
    color: '#F8FAFC',
  },
});