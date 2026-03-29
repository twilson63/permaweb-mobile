import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Folder, File, ChevronRight } from 'lucide-react-native';
import { podService } from '../../src/services/PodService';
import { authService } from '../../src/services/AuthService';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
}

export default function FilesScreen() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPath, setCurrentPath] = useState('/workspace');
  const [selectedPod, setSelectedPod] = useState<string | null>(null);

  async function loadFiles(podId: string, path: string) {
    setLoading(true);
    try {
      const fileList = await podService.listFiles(podId, path);
      // Mock file list for demo
      const mockFiles: FileItem[] = [
        { name: 'src', path: '/workspace/src', type: 'directory' },
        { name: 'package.json', path: '/workspace/package.json', type: 'file' },
        { name: 'README.md', path: '/workspace/README.md', type: 'file' },
        { name: 'tsconfig.json', path: '/workspace/tsconfig.json', type: 'file' },
      ];
      setFiles(mockFiles);
      setSelectedPod(podId);
      setCurrentPath(path);
    } catch (error) {
      console.error('Failed to load files:', error);
      // Show mock data for demo
      const mockFiles: FileItem[] = [
        { name: 'src', path: '/workspace/src', type: 'directory' },
        { name: 'components', path: '/workspace/components', type: 'directory' },
        { name: 'package.json', path: '/workspace/package.json', type: 'file' },
        { name: 'README.md', path: '/workspace/README.md', type: 'file' },
        { name: 'tsconfig.json', path: '/workspace/tsconfig.json', type: 'file' },
        { name: 'App.tsx', path: '/workspace/App.tsx', type: 'file' },
      ];
      setFiles(mockFiles);
    } finally {
      setLoading(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    if (selectedPod) {
      loadFiles(selectedPod, currentPath).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }

  function navigateToDirectory(item: FileItem) {
    if (item.type === 'directory' && selectedPod) {
      loadFiles(selectedPod, item.path);
    }
  }

  function navigateUp() {
    if (currentPath !== '/workspace' && selectedPod) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/workspace';
      loadFiles(selectedPod, parentPath);
    }
  }

  async function selectPod() {
    // Get first pod for demo
    const pods = await podService.listPods();
    if (pods.length > 0) {
      loadFiles(pods[0].id, '/workspace');
    } else {
      Alert.alert('No Pods', 'Create a pod first to browse files.');
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!selectedPod) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No Pod Selected</Text>
        <Text style={styles.emptySubtitle}>
          Select a pod to browse its files
        </Text>
        <TouchableOpacity style={styles.selectButton} onPress={selectPod}>
          <Text style={styles.selectButtonText}>Select Pod</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateUp} disabled={currentPath === '/workspace'}>
          <Text style={styles.path}>{currentPath}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item.path}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.fileItem}
            onPress={() => navigateToDirectory(item)}
          >
            <View style={styles.fileIcon}>
              {item.type === 'directory' ? (
                <Folder color="#6366F1" size={24} />
              ) : (
                <File color="#94A3B8" size={24} />
              )}
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{item.name}</Text>
              <Text style={styles.filePath}>{item.path}</Text>
            </View>
            {item.type === 'directory' && (
              <ChevronRight color="#64748B" size={20} />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No files</Text>
          </View>
        }
      />
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
  path: {
    fontSize: 14,
    color: '#6366F1',
    fontFamily: 'monospace',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#F8FAFC',
  },
  filePath: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  selectButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
});