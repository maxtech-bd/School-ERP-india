import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, classesAPI } from '../services/api';
import { Picker } from '@react-native-picker/picker';

const ReportCard = ({ title, icon, description, onPress }) => (
  <TouchableOpacity style={styles.reportCard} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.reportIcon}>
      <Text style={styles.reportIconText}>{icon}</Text>
    </View>
    <View style={styles.reportInfo}>
      <Text style={styles.reportTitle}>{title}</Text>
      <Text style={styles.reportDesc}>{description}</Text>
    </View>
    <Text style={styles.reportArrow}>→</Text>
  </TouchableOpacity>
);

const StatBox = ({ label, value, color }) => (
  <View style={[styles.statBox, { borderLeftColor: color }]}>
    <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
    <Text style={styles.statBoxLabel}>{label}</Text>
  </View>
);

const ReportsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [dateRange, setDateRange] = useState('week');

  const isAdmin = ['super_admin', 'admin', 'principal'].includes(user?.role);

  const reportTypes = [
    {
      id: 'attendance',
      title: 'Attendance Report',
      icon: '📊',
      description: 'View attendance statistics and trends',
      adminOnly: false,
    },
    {
      id: 'fees',
      title: 'Fee Report',
      icon: '💰',
      description: 'Fee collection and pending dues',
      adminOnly: true,
    },
    {
      id: 'academic',
      title: 'Academic Report',
      icon: '📈',
      description: 'Student performance analysis',
      adminOnly: false,
    },
    {
      id: 'student',
      title: 'Student Report',
      icon: '👥',
      description: 'Student enrollment and demographics',
      adminOnly: true,
    },
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.log('Error fetching classes:', error);
    }
  };

  const fetchReport = async (reportId) => {
    try {
      setLoading(true);
      let response;

      switch (reportId) {
        case 'attendance':
          response = await reportsAPI.getAttendanceReport({
            class_id: selectedClass || undefined,
            range: dateRange,
          });
          break;
        case 'fees':
          response = await reportsAPI.getFeeReport({
            class_id: selectedClass || undefined,
          });
          break;
        default:
          response = { data: null };
      }

      setReportData(response.data);
    } catch (error) {
      console.log('Error fetching report:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeReport) {
      await fetchReport(activeReport);
    }
    setRefreshing(false);
  }, [activeReport]);

  const handleReportPress = (report) => {
    if (report.adminOnly && !isAdmin) {
      return;
    }
    setActiveReport(report.id);
    fetchReport(report.id);
  };

  const handleBackToList = () => {
    setActiveReport(null);
    setReportData(null);
  };

  const availableReports = reportTypes.filter(r => !r.adminOnly || isAdmin);

  if (activeReport) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2d3436', '#636e72']} style={styles.header}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <Text style={styles.backText}>← Back to Reports</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {reportTypes.find(r => r.id === activeReport)?.title}
          </Text>
        </LinearGradient>

        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedClass}
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    fetchReport(activeReport);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="All Classes" value="" />
                  {classes.map((cls) => (
                    <Picker.Item
                      key={cls.id}
                      label={cls.name || `Class ${cls.standard}`}
                      value={cls.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.filterItem}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={dateRange}
                  onValueChange={(value) => {
                    setDateRange(value);
                    fetchReport(activeReport);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="This Week" value="week" />
                  <Picker.Item label="This Month" value="month" />
                  <Picker.Item label="This Year" value="year" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#2d3436" style={{ marginTop: 40 }} />
          ) : reportData ? (
            <View>
              {activeReport === 'attendance' && (
                <>
                  <View style={styles.statsGrid}>
                    <StatBox
                      label="Present"
                      value={`${reportData.present_percentage || 0}%`}
                      color="#00b894"
                    />
                    <StatBox
                      label="Absent"
                      value={`${reportData.absent_percentage || 0}%`}
                      color="#d63031"
                    />
                    <StatBox
                      label="Late"
                      value={`${reportData.late_percentage || 0}%`}
                      color="#fdcb6e"
                    />
                    <StatBox
                      label="Total Days"
                      value={reportData.total_days || 0}
                      color="#0984e3"
                    />
                  </View>
                  {reportData.details && (
                    <View style={styles.detailsSection}>
                      <Text style={styles.sectionTitle}>Details</Text>
                      {reportData.details.map((item, idx) => (
                        <View key={idx} style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{item.date || item.name}</Text>
                          <Text style={styles.detailValue}>{item.status || item.value}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}

              {activeReport === 'fees' && (
                <>
                  <View style={styles.statsGrid}>
                    <StatBox
                      label="Total Fees"
                      value={`₹${(reportData.total_fees || 0).toLocaleString()}`}
                      color="#6c5ce7"
                    />
                    <StatBox
                      label="Collected"
                      value={`₹${(reportData.collected || 0).toLocaleString()}`}
                      color="#00b894"
                    />
                    <StatBox
                      label="Pending"
                      value={`₹${(reportData.pending || 0).toLocaleString()}`}
                      color="#fdcb6e"
                    />
                    <StatBox
                      label="Overdue"
                      value={`₹${(reportData.overdue || 0).toLocaleString()}`}
                      color="#d63031"
                    />
                  </View>
                </>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No data available</Text>
              <Text style={styles.emptySubtext}>Try selecting different filters</Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2d3436', '#636e72']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>View analytics and statistics</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Available Reports</Text>
        {availableReports.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            icon={report.icon}
            description={report.description}
            onPress={() => handleReportPress(report)}
          />
        ))}

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
  filterRow: {
    flexDirection: 'row',
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reportCard: {
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
  reportIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2d343620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reportIconText: {
    fontSize: 24,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reportDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  reportArrow: {
    fontSize: 20,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statBoxValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statBoxLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: '600',
    color: '#333',
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
  bottomSpacer: {
    height: 30,
  },
});

export default ReportsScreen;
