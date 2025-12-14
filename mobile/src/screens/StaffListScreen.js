import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { staffAPI } from '../services/api';

const StaffCard = ({ staff }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['#9b59b6', '#3498db', '#e74c3c', '#f39c12', '#1abc9c', '#34495e'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getRoleColor = (role) => {
    const colors = {
      teacher: '#3498db',
      admin: '#9b59b6',
      super_admin: '#e74c3c',
      principal: '#f39c12',
    };
    return colors[role?.toLowerCase()] || '#1abc9c';
  };

  return (
    <TouchableOpacity style={styles.staffCard} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(staff.full_name || staff.name) }]}>
        <Text style={styles.avatarText}>{getInitials(staff.full_name || staff.name)}</Text>
      </View>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{staff.full_name || staff.name || 'Unknown'}</Text>
        <Text style={styles.staffDesignation}>{staff.designation || staff.role || 'Staff'}</Text>
        {staff.department && (
          <Text style={styles.staffDept}>📁 {staff.department}</Text>
        )}
      </View>
      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(staff.role) + '30' }]}>
        <Text style={[styles.roleText, { color: getRoleColor(staff.role) }]}>
          {(staff.role || 'Staff').replace(/_/g, ' ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const StaffListScreen = ({ navigation }) => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStaff = useCallback(async () => {
    try {
      const response = await staffAPI.getStaff();
      const data = response.data?.staff || response.data || [];
      setStaff(data);
      setFilteredStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
      setFilteredStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStaff(staff);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = staff.filter(s => 
        (s.full_name || s.name || '').toLowerCase().includes(query) ||
        (s.designation || '').toLowerCase().includes(query) ||
        (s.department || '').toLowerCase().includes(query)
      );
      setFilteredStaff(filtered);
    }
  }, [searchQuery, staff]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStaff();
    setRefreshing(false);
  }, [fetchStaff]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredStaff.length}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or designation..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9b59b6" />
            <Text style={styles.loadingText}>Loading staff...</Text>
          </View>
        ) : filteredStaff.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👨‍🏫</Text>
            <Text style={styles.emptyText}>No staff found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Staff members will appear here'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStaff}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => <StaffCard staff={item} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9b59b6" />
            }
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  countBadge: {
    backgroundColor: '#9b59b6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  clearIcon: {
    color: '#888',
    fontSize: 18,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  staffInfo: {
    flex: 1,
    marginLeft: 14,
  },
  staffName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  staffDesignation: {
    color: '#9b59b6',
    fontSize: 13,
    marginTop: 2,
  },
  staffDept: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default StaffListScreen;
