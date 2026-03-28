import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useAppStore } from '../store/AppStore';
import { podService } from '../services/PodService';
import { Pod } from '../services/PodService';

export function HomeScreen({ navigation }: any) {
  const { pods, setPods, token } = useAppStore();
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (token) {
      podService.setToken(token);
      loadPods();
    }
  }, [token]);

  const loadPods = async () => {
    setLoading(true);
    try {
      const podList = await podService.listPods();
      setPods(podList);
    } catch (error) {
      console.error('Failed to load pods:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPods();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#10B981';
      case 'pending': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  const renderPod = ({ item }: { item: Pod }) => (
    <TouchableOpacity 
      style={styles.podCard}
      onPress={() => navigation.navigate('Session', { podId: item.id })}
    >
      <View style={styles.podHeader}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={styles.podName}>{item.name}</Text>
      </View>
      <Text style={styles.podDomain}>{item.subdomain}</Text>
      <Text style={styles.podDate}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading && !pods.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pods}
        keyExtractor={(item) => item.id}
        renderItem={renderPod}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pods yet</Text>
            <Text style={styles.emptyHint}>Create your first coding pod</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {/* Create pod modal */}}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 16
  },
  podCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  podHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  podName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC'
  },
  podDomain: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4
  },
  podDate: {
    fontSize: 12,
    color: '#64748B'
  },
  empty: {
    alignItems: 'center',
    marginTop: 48
  },
  emptyText: {
    fontSize: 18,
    color: '#F8FAFC'
  },
  emptyHint: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8
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
    alignItems: 'center'
  },
  fabText: {
    fontSize: 24,
    color: '#F8FAFC'
  }
});