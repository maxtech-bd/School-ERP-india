import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { attendanceAPI } from '../services/api';

const AttendanceScreen = () => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance();
      const data = response.data || [];
      setAttendance(data);
      
      const present = data.filter(a => a.status === 'present').length;
      const absent = data.filter(a => a.status === 'absent').length;
      const late = data.filter(a => a.status === 'late').length;
      setStats({ present, absent, late, total: data.length });
    } catch (error) {
      console.log('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.present / stats.total) * 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00b894" />
            <Text style={styles.loadingText}>Loading attendance...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Attendance</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.percentageCard}>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageText}>{getPercentage()}%</Text>
            </View>
            <Text style={styles.percentageLabel}>Overall Attendance</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.presentCard]}>
              <Text style={styles.statNumber}>{stats.present}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={[styles.statCard, styles.absentCard]}>
              <Text style={styles.statNumber}>{stats.absent}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={[styles.statCard, styles.lateCard]}>
              <Text style={styles.statNumber}>{stats.late}</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          {attendance.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No attendance records found</Text>
            </View>
          ) : (
            attendance.slice(0, 10).map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordDate}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.recordSubject}>{record.subject || 'General'}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  record.status === 'present' && styles.presentBadge,
                  record.status === 'absent' && styles.absentBadge,
                  record.status === 'late' && styles.lateBadge,
                ]}>
                  <Text style={styles.statusText}>{record.status}</Text>
                </View>
              </View>
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  percentageCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  percentageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#00b894',
    marginBottom: 12,
  },
  percentageText: {
    color: '#00b894',
    fontSize: 32,
    fontWeight: 'bold',
  },
  percentageLabel: {
    color: '#888',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  presentCard: {
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
  },
  absentCard: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  lateCard: {
    backgroundColor: 'rgba(241, 196, 15, 0.2)',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  recordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  recordSubject: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  presentBadge: {
    backgroundColor: 'rgba(0, 184, 148, 0.3)',
  },
  absentBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.3)',
  },
  lateBadge: {
    backgroundColor: 'rgba(241, 196, 15, 0.3)',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default AttendanceScreen;
