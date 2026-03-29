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
  TextInput,
  Modal,
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [podName, setPodName] = useState('');
  const [creating, setCreating] = useState(false);

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
      
      // Try to load real pods from API
      try {
        const podList = await podService.listPods();
        console.log('Loaded pods:', podList.length);
        setPods(podList);
      } catch (error: any) {
        console.log('Failed to load pods:', error.message);
        // Show empty state - user needs to create a pod
        setPods([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleCreatePod() {
    if (!podName.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a pod name');
      } else {
        Alert.alert('Error', 'Please enter a pod name');
      }
      return;
    }

    setCreating(true);
    try {
      console.log('Creating pod:', podName);
      
      // Check if we have a real JWK (imported) or demo wallet
      const wallet = await authService.getWallet();
      const isRealJWK = wallet?.jwk?.d && wallet?.jwk?.n && wallet?.jwk?.p && wallet?.jwk?.q;
      
      if (!isRealJWK) {
        // Demo mode - create mock pod
        const mockPod: Pod = {
          id: `demo-${Date.now()}`,
          name: podName.trim(),
          status: 'running',
          subdomain: `${podName.trim().toLowerCase()}.demo.permaweb.run`,
          ownerWallet: wallet?.address || 'demo',
          createdAt: new Date().toISOString(),
        };
        
        setPods([...pods, mockPod]);
        setShowCreateModal(false);
        setPodName('');
        setCreating(false);
        
        if (Platform.OS === 'web') {
          alert(`Demo Pod Created! ✅\n\n${mockPod.name}\n${mockPod.subdomain}\n\nNote: This is a demo pod. Import a real Arweave JWK to create production pods.`);
        } else {
          Alert.alert('Demo Pod Created! ✅', `${mockPod.name}\n${mockPod.subdomain}\n\nNote: Import a real Arweave JWK for production.`);
        }
        return;
      }
      
      // Real JWK - try to create on production
      const newPod = await podService.createPod(podName.trim(), 'claude-3-opus');
      console.log('Pod created:', newPod);
      
      setShowCreateModal(false);
      setPodName('');
      await loadData();
      
      if (Platform.OS === 'web') {
        alert(`Pod Created! ✅\n\n${newPod.name}\n${newPod.subdomain}`);
      } else {
        Alert.alert('Pod Created! ✅', `${newPod.name}\n${newPod.subdomain}`);
      }
    } catch (error: any) {
      console.error('Failed to create pod:', error);
      if (Platform.OS === 'web') {
        alert('Failed to create pod: ' + error.message);
      } else {
        Alert.alert('Error', 'Failed to create pod: ' + error.message);
      }
    } finally {
      setCreating(false);
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
            <Text style={styles.emptyHint}>Tap + to create your first pod</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Pod</Text>
            <Text style={styles.modalHint}>
              Enter a name for your coding pod:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="my-project"
              placeholderTextColor="#64748B"
              value={podName}
              onChangeText={setPodName}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setPodName('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreatePod}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#F8FAFC" />
                ) : (
                  <Text style={styles.buttonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  modalHint: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#6366F1',
  },
  buttonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
});