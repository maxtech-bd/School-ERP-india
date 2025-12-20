import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { Picker } from '@react-native-picker/picker';

const UserCard = ({ user, onEdit, onDelete }) => {
  const getRoleColor = (role) => {
    const colors = {
      super_admin: '#e74c3c',
      admin: '#9b59b6',
      principal: '#f39c12',
      teacher: '#3498db',
      student: '#00b894',
      parent: '#1abc9c',
    };
    return colors[role] || '#636e72';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.userCard}>
      <View style={[styles.avatar, { backgroundColor: getRoleColor(user.role) }]}>
        <Text style={styles.avatarText}>{getInitials(user.full_name || user.name || user.username)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.full_name || user.name || user.username}</Text>
        <Text style={styles.userEmail}>{user.email || user.username}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
          <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
            {(user.role || 'user').replace(/_/g, ' ')}
          </Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <View style={[styles.statusDot, { backgroundColor: user.is_active !== false ? '#00b894' : '#d63031' }]} />
      </View>
    </View>
  );
};

const UserManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);

  const fetchUsers = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);

      const response = await adminAPI.getUsers({
        page: pageNum,
        limit: 20,
      });

      const newUsers = response.data?.users || response.data || [];

      if (append) {
        setUsers(prev => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }

      setHasMore(newUsers.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.log('Error fetching users:', error);
      if (pageNum === 1) {
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        (u.full_name || u.name || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query) ||
        (u.username || '').toLowerCase().includes(query)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers(1, false);
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchUsers(page + 1, true);
    }
  };

  const handleEditUser = (editUser) => {
    Alert.alert('Edit User', `Edit functionality for ${editUser.full_name || editUser.username} coming soon.`);
  };

  const handleDeleteUser = (deleteUser) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${deleteUser.full_name || deleteUser.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteUser(deleteUser.id);
              setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#9b59b6', '#8e44ad']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Management</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyText}>Access Denied</Text>
          <Text style={styles.emptySubtext}>You don't have permission to access this section</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#9b59b6', '#8e44ad']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>{users.length} users</Text>
      </LinearGradient>

      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={roleFilter}
            onValueChange={setRoleFilter}
            style={styles.picker}
          >
            <Picker.Item label="All Roles" value="" />
            <Picker.Item label="Super Admin" value="super_admin" />
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="Principal" value="principal" />
            <Picker.Item label="Teacher" value="teacher" />
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Parent" value="parent" />
          </Picker>
        </View>
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9b59b6" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id || item._id || Math.random().toString()}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#9b59b6" style={{ padding: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userActions: {
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserManagementScreen;
