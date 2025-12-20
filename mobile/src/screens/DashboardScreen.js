import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { studentsAPI, staffAPI, notificationsAPI } from '../services/api';

const { width } = Dimensions.get('window');

const FeatureCard = ({ title, subtitle, colors, icon, onPress, badge }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>{icon}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const StatCard = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <View style={styles.statInfo}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

const QuickButton = ({ title, icon, onPress, color }) => (
  <TouchableOpacity style={styles.quickButton} onPress={onPress} activeOpacity={0.7}>
    <LinearGradient
      colors={[color, color + '99']}
      style={styles.quickButtonGradient}
    >
      <Text style={styles.quickButtonIconText}>{icon}</Text>
    </LinearGradient>
    <Text style={styles.quickButtonText}>{title}</Text>
  </TouchableOpacity>
);

const getTimeOfDayGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatRole = (role) => {
  if (!role) return '';
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const nav = useNavigation();
  const role = user?.role || 'student';
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    unreadNotifications: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const [notifRes] = await Promise.all([
        notificationsAPI.getUnreadCount().catch(() => ({ data: { count: 0 } })),
      ]);
      
      setStats(prev => ({
        ...prev,
        unreadNotifications: notifRes.data?.count || notifRes.data?.unread_count || 0,
      }));
    } catch (error) {
      console.log('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const openDrawer = () => {
    nav.dispatch(DrawerActions.openDrawer());
  };

  const featureCards = [
    {
      title: 'Ask GiNi',
      subtitle: 'AI Assistant',
      colors: ['#00b894', '#00cec9'],
      icon: '🤖',
      screen: 'Assistant',
    },
    {
      title: 'Quiz',
      subtitle: 'Test Yourself',
      colors: ['#f39c12', '#e74c3c'],
      icon: '📝',
      screen: 'Quiz',
    },
    {
      title: 'Summary',
      subtitle: 'Quick Notes',
      colors: ['#9b59b6', '#8e44ad'],
      icon: '📋',
      screen: 'Summary',
    },
    {
      title: 'Notes',
      subtitle: 'Study Material',
      colors: ['#6c5ce7', '#a29bfe'],
      icon: '📚',
      screen: 'Notes',
    },
  ];

  const getQuickButtonsForRole = () => {
    const commonButtons = [
      { title: 'TimeTable', icon: '📅', screen: 'TimeTable', color: '#3498db' },
      { title: 'Calendar', icon: '🗓️', screen: 'Calendar', color: '#e74c3c' },
    ];

    if (role === 'super_admin' || role === 'admin') {
      return [
        ...commonButtons,
        { title: 'Students', icon: '👥', screen: 'StudentList', color: '#2ecc71' },
        { title: 'Staff', icon: '👨‍🏫', screen: 'StaffList', color: '#9b59b6' },
        { title: 'Classes', icon: '🏫', screen: 'ClassManagement', color: '#0984e3' },
        { title: 'Fees', icon: '💰', screen: 'Fees', color: '#00b894' },
        { title: 'Reports', icon: '📈', screen: 'Reports', color: '#636e72' },
        { title: 'Users', icon: '🔐', screen: 'UserManagement', color: '#8e44ad' },
      ];
    } else if (role === 'teacher' || role === 'principal') {
      return [
        ...commonButtons,
        { title: 'Students', icon: '👥', screen: 'StudentList', color: '#2ecc71' },
        { title: 'Results', icon: '📊', screen: 'Results', color: '#667eea' },
        { title: 'Classes', icon: '🏫', screen: 'ClassManagement', color: '#0984e3' },
        { title: 'Reports', icon: '📈', screen: 'Reports', color: '#636e72' },
      ];
    } else if (role === 'parent') {
      return [
        ...commonButtons,
        { title: 'Results', icon: '📊', screen: 'Results', color: '#667eea' },
        { title: 'Fees', icon: '💰', screen: 'Fees', color: '#00b894' },
        { title: 'Attendance', icon: '✅', screen: 'Attendance', color: '#27ae60' },
      ];
    } else {
      return [
        ...commonButtons,
        { title: 'Results', icon: '📊', screen: 'Results', color: '#667eea' },
        { title: 'Fees', icon: '💰', screen: 'Fees', color: '#00b894' },
        { title: 'Library', icon: '📖', screen: 'AcademicCMS', color: '#e17055' },
        { title: 'Certificates', icon: '📜', screen: 'Certificates', color: '#6c5ce7' },
      ];
    }
  };

  const filteredQuickButtons = getQuickButtonsForRole();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>{getTimeOfDayGreeting()}</Text>
            <Text style={styles.userName}>{user?.full_name || formatRole(role)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => navigation.navigate('Communication')}
          >
            <Text style={styles.notificationButtonText}>🔔</Text>
            {stats.unreadNotifications > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {stats.unreadNotifications > 9 ? '9+' : stats.unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00b894" />
          }
        >
          <Text style={styles.sectionTitle}>AI Features</Text>
          <View style={styles.cardsContainer}>
            {featureCards.map((card, index) => (
              <FeatureCard
                key={index}
                title={card.title}
                subtitle={card.subtitle}
                colors={card.colors}
                icon={card.icon}
                onPress={() => navigation.navigate(card.screen)}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickButtonsContainer}>
            {filteredQuickButtons.map((button, index) => (
              <QuickButton
                key={index}
                title={button.title}
                icon={button.icon}
                color={button.color}
                onPress={() => navigation.navigate(button.screen)}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.communicationButton}
            onPress={() => navigation.navigate('Communication')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00b894', '#00cec9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.communicationGradient}
            >
              <Text style={styles.communicationIcon}>💬</Text>
              <Text style={styles.communicationText}>Communication</Text>
              {stats.unreadNotifications > 0 && (
                <View style={styles.commBadge}>
                  <Text style={styles.commBadgeText}>{stats.unreadNotifications}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    color: '#888',
    fontSize: 14,
  },
  userName: {
    color: '#00b894',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButtonText: {
    fontSize: 22,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 150,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    fontSize: 24,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  statIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    color: '#888',
    fontSize: 13,
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  quickButton: {
    alignItems: 'center',
    marginBottom: 16,
    width: width / 4.5,
  },
  quickButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickButtonIconText: {
    fontSize: 28,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  communicationButton: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  communicationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  communicationIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  communicationText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  commBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  commBadgeText: {
    color: '#00b894',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 30,
  },
});

export default DashboardScreen;
