import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const SettingItem = ({ icon, title, subtitle, onPress, rightElement }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <View style={styles.settingIcon}>
      <Text style={styles.settingIconText}>{icon}</Text>
    </View>
    <View style={styles.settingInfo}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (onPress && <Text style={styles.settingArrow}>→</Text>)}
  </TouchableOpacity>
);

const SettingSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notifications_enabled');
      const dark = await AsyncStorage.getItem('dark_mode');
      const sync = await AsyncStorage.getItem('auto_sync');
      const biometric = await AsyncStorage.getItem('biometric_enabled');

      if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
      if (dark !== null) setDarkMode(JSON.parse(dark));
      if (sync !== null) setAutoSync(JSON.parse(sync));
      if (biometric !== null) setBiometricEnabled(JSON.parse(biometric));
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log('Error saving setting:', error);
    }
  };

  const handleNotificationsToggle = (value) => {
    setNotificationsEnabled(value);
    saveSetting('notifications_enabled', value);
  };

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    saveSetting('dark_mode', value);
  };

  const handleAutoSyncToggle = (value) => {
    setAutoSync(value);
    saveSetting('auto_sync', value);
  };

  const handleBiometricToggle = (value) => {
    setBiometricEnabled(value);
    saveSetting('biometric_enabled', value);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. You will need to re-download content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const keysToKeep = ['token', 'user', 'tenant_id'];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(k => !keysToKeep.includes(k));
              await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About School ERP',
      'Version 1.0.0\n\nA comprehensive school management system.\n\n© 2024 Cloud School ERP',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'For assistance, please contact your school administrator or email support@schoolerp.com',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#636e72', '#2d3436']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <SettingSection title="Account">
          <SettingItem
            icon="👤"
            title={user?.full_name || user?.name || 'User'}
            subtitle={user?.email || user?.username}
          />
          <SettingItem
            icon="🏫"
            title="School"
            subtitle={user?.school_name || 'Demo School'}
          />
          <SettingItem
            icon="🔑"
            title="Role"
            subtitle={(user?.role || 'student').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <SettingItem
            icon="🔔"
            title="Push Notifications"
            subtitle="Receive alerts and updates"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#ccc', true: '#00b894' }}
                thumbColor="#fff"
              />
            }
          />
        </SettingSection>

        <SettingSection title="Appearance">
          <SettingItem
            icon="🌙"
            title="Dark Mode"
            subtitle="Use dark theme (Coming soon)"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#ccc', true: '#00b894' }}
                thumbColor="#fff"
                disabled
              />
            }
          />
        </SettingSection>

        <SettingSection title="Data & Storage">
          <SettingItem
            icon="🔄"
            title="Auto Sync"
            subtitle="Sync data automatically"
            rightElement={
              <Switch
                value={autoSync}
                onValueChange={handleAutoSyncToggle}
                trackColor={{ false: '#ccc', true: '#00b894' }}
                thumbColor="#fff"
              />
            }
          />
          <SettingItem
            icon="🗑️"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
        </SettingSection>

        <SettingSection title="Security">
          <SettingItem
            icon="🔐"
            title="Biometric Login"
            subtitle="Use fingerprint or face ID"
            rightElement={
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#ccc', true: '#00b894' }}
                thumbColor="#fff"
              />
            }
          />
        </SettingSection>

        <SettingSection title="Support">
          <SettingItem
            icon="❓"
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={handleHelp}
          />
          <SettingItem
            icon="ℹ️"
            title="About"
            subtitle="App version and info"
            onPress={handleAbout}
          />
        </SettingSection>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIconText: {
    fontSize: 18,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#d63031',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default SettingsScreen;
