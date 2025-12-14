import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'My Profile', icon: '👤' },
    { title: 'Settings', icon: '⚙️' },
    { title: 'Notifications', icon: '🔔' },
    { title: 'Help & Support', icon: '❓' },
    { title: 'About', icon: 'ℹ️' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.full_name || user?.username || 'User'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Student'}</Text>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <LinearGradient
              colors={['#e74c3c', '#c0392b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: '#888',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  menuItemArrow: {
    color: '#888',
    fontSize: 24,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
