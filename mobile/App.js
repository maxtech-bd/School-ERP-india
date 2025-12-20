import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import {
  LoginScreen,
  DashboardScreen,
  QuizScreen,
  SummaryScreen,
  NotesScreen,
  AssistantScreen,
  ProfileScreen,
  AttendanceScreen,
  TestGeneratorScreen,
  TimeTableScreen,
  CalendarScreen,
  StudentListScreen,
  StaffListScreen,
  CommunicationScreen,
  ResultsScreen,
  FeesScreen,
  CertificatesScreen,
  AcademicCMSScreen,
  ClassManagementScreen,
  ReportsScreen,
  SettingsScreen,
  UserManagementScreen,
} from './src/screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabIcon = ({ name, focused }) => {
  const icons = {
    Home: '🏠',
    GiNi: '🤖',
    Tests: '✓',
    Profile: '👤',
  };
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icons[name]}
      </Text>
    </View>
  );
};

const MainTabs = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#00b894',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="GiNi" component={AssistantScreen} options={{ title: 'AI Assistant' }} />
      <Tab.Screen name="Tests" component={TestGeneratorScreen} options={{ title: 'Test Generator' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const CustomDrawerContent = (props) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'student';
  const navigation = props.navigation;

  const menuItems = getMenuItemsForRole(role);

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <View style={styles.drawerAvatar}>
          <Text style={styles.drawerAvatarText}>
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.drawerName}>{user?.full_name || 'User'}</Text>
        <Text style={styles.drawerRole}>{role.toUpperCase()}</Text>
      </View>

      {menuItems.map((item, index) => (
        <DrawerItem
          key={index}
          label={item.label}
          icon={() => <Text style={styles.drawerIcon}>{item.icon}</Text>}
          onPress={() => navigation.navigate(item.screen)}
          labelStyle={styles.drawerLabel}
        />
      ))}

      <View style={styles.drawerDivider} />
      
      <DrawerItem
        label="Logout"
        icon={() => <Text style={styles.drawerIcon}>🚪</Text>}
        onPress={logout}
        labelStyle={[styles.drawerLabel, { color: '#e74c3c' }]}
      />
    </DrawerContentScrollView>
  );
};

const getMenuItemsForRole = (role) => {
  const commonItems = [
    { label: 'Home', icon: '🏠', screen: 'MainTabs' },
  ];

  const aiItems = [
    { label: 'AI Assistant', icon: '🤖', screen: 'Assistant' },
    { label: 'Quiz Tool', icon: '📝', screen: 'Quiz' },
    { label: 'AI Summary', icon: '📋', screen: 'Summary' },
    { label: 'AI Notes', icon: '📚', screen: 'Notes' },
  ];

  const academicItems = [
    { label: 'Calendar', icon: '📅', screen: 'Calendar' },
    { label: 'TimeTable', icon: '🕐', screen: 'TimeTable' },
    { label: 'Results', icon: '📊', screen: 'Results' },
    { label: 'Library', icon: '📖', screen: 'AcademicCMS' },
  ];

  const studentItems = [
    { label: 'Fees', icon: '💰', screen: 'Fees' },
    { label: 'Certificates', icon: '📜', screen: 'Certificates' },
    { label: 'Attendance', icon: '✅', screen: 'Attendance' },
  ];

  if (role === 'super_admin' || role === 'admin') {
    return [
      ...commonItems,
      { label: 'Students', icon: '👥', screen: 'StudentList' },
      { label: 'Staff', icon: '👨‍🏫', screen: 'StaffList' },
      { label: 'Classes', icon: '🏫', screen: 'ClassManagement' },
      ...academicItems,
      { label: 'Fees', icon: '💰', screen: 'Fees' },
      ...aiItems,
      { label: 'Test Generator', icon: '📄', screen: 'TestGenerator' },
      { label: 'Reports', icon: '📈', screen: 'Reports' },
      { label: 'Users', icon: '🔐', screen: 'UserManagement' },
      { label: 'Communication', icon: '💬', screen: 'Communication' },
      { label: 'Settings', icon: '⚙️', screen: 'Settings' },
    ];
  } else if (role === 'teacher' || role === 'principal') {
    return [
      ...commonItems,
      { label: 'Students', icon: '👥', screen: 'StudentList' },
      { label: 'Staff', icon: '👨‍🏫', screen: 'StaffList' },
      { label: 'Classes', icon: '🏫', screen: 'ClassManagement' },
      ...academicItems,
      ...aiItems,
      { label: 'Test Generator', icon: '📄', screen: 'TestGenerator' },
      { label: 'Reports', icon: '📈', screen: 'Reports' },
      { label: 'Communication', icon: '💬', screen: 'Communication' },
      { label: 'Settings', icon: '⚙️', screen: 'Settings' },
    ];
  } else if (role === 'parent') {
    return [
      ...commonItems,
      { label: 'Results', icon: '📊', screen: 'Results' },
      { label: 'Fees', icon: '💰', screen: 'Fees' },
      { label: 'Attendance', icon: '✅', screen: 'Attendance' },
      { label: 'Calendar', icon: '📅', screen: 'Calendar' },
      { label: 'Communication', icon: '💬', screen: 'Communication' },
      { label: 'Settings', icon: '⚙️', screen: 'Settings' },
    ];
  } else {
    return [
      ...commonItems,
      ...aiItems,
      ...academicItems,
      ...studentItems,
      { label: 'Staff List', icon: '👨‍🏫', screen: 'StaffList' },
      { label: 'Communication', icon: '💬', screen: 'Communication' },
      { label: 'Settings', icon: '⚙️', screen: 'Settings' },
    ];
  }
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: styles.drawer,
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
    </Drawer.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="Assistant" component={AssistantScreen} />
      <Stack.Screen name="TestGenerator" component={TestGeneratorScreen} />
      <Stack.Screen name="TimeTable" component={TimeTableScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="StudentList" component={StudentListScreen} />
      <Stack.Screen name="StaffList" component={StaffListScreen} />
      <Stack.Screen name="Communication" component={CommunicationScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Fees" component={FeesScreen} />
      <Stack.Screen name="Certificates" component={CertificatesScreen} />
      <Stack.Screen name="AcademicCMS" component={AcademicCMSScreen} />
      <Stack.Screen name="ClassManagement" component={ClassManagementScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <Navigation />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  tabBar: {
    backgroundColor: '#1a1a2e',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
    height: 60,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  drawer: {
    backgroundColor: '#1a1a2e',
    width: 280,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  drawerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  drawerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  drawerRole: {
    color: '#00b894',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  drawerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  drawerLabel: {
    color: '#fff',
    fontSize: 15,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
    marginHorizontal: 16,
  },
});
