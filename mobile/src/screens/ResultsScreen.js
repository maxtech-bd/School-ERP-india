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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { resultsAPI, classesAPI } from '../services/api';
import { Picker } from '@react-native-picker/picker';

const ResultCard = ({ result }) => {
  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#00b894',
      'A': '#00cec9',
      'B+': '#0984e3',
      'B': '#74b9ff',
      'C+': '#fdcb6e',
      'C': '#f39c12',
      'D': '#e17055',
      'F': '#d63031',
    };
    return colors[grade] || '#636e72';
  };

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.subjectName}>{result.subject_name || result.subject}</Text>
        <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(result.grade) }]}>
          <Text style={styles.gradeText}>{result.grade || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.marksRow}>
        <View style={styles.markItem}>
          <Text style={styles.markLabel}>Obtained</Text>
          <Text style={styles.markValue}>{result.marks_obtained || 0}</Text>
        </View>
        <View style={styles.markItem}>
          <Text style={styles.markLabel}>Total</Text>
          <Text style={styles.markValue}>{result.max_marks || 100}</Text>
        </View>
        <View style={styles.markItem}>
          <Text style={styles.markLabel}>Percentage</Text>
          <Text style={styles.markValue}>{result.percentage?.toFixed(1) || 0}%</Text>
        </View>
      </View>
      {result.remarks && (
        <Text style={styles.remarks}>{result.remarks}</Text>
      )}
    </View>
  );
};

const ResultsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [examTerms, setExamTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  const isTeacherOrAdmin = ['super_admin', 'admin', 'principal', 'teacher'].includes(user?.role);
  const isStudent = user?.role === 'student';
  const isParent = user?.role === 'parent';

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedTerm) {
      fetchResults();
    }
  }, [selectedTerm, selectedStudent]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [termsRes, classesRes] = await Promise.all([
        resultsAPI.getExamTerms(),
        isTeacherOrAdmin ? classesAPI.getClasses() : Promise.resolve({ data: [] }),
      ]);

      const publishedTerms = (termsRes.data || []).filter(t => t.is_published);
      setExamTerms(publishedTerms);
      setClasses(classesRes.data || []);

      if (publishedTerms.length > 0) {
        setSelectedTerm(publishedTerms[0].id);
      }
    } catch (error) {
      console.log('Error fetching initial data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    if (!selectedTerm) return;

    try {
      setLoading(true);
      let response;

      if (isStudent || isParent) {
        response = await resultsAPI.getMyResults();
      } else if (selectedStudent) {
        response = await resultsAPI.getStudentResults({
          exam_term_id: selectedTerm,
          student_id: selectedStudent,
        });
      } else {
        setResults([]);
        setSummary(null);
        setLoading(false);
        return;
      }

      const data = response.data;
      setResults(data.subjects || data.results || []);
      setSummary({
        total_marks: data.total_marks || 0,
        obtained_marks: data.obtained_marks || 0,
        percentage: data.percentage || 0,
        grade: data.overall_grade || data.grade || 'N/A',
        rank: data.rank || null,
        result_status: data.result_status || 'Pass',
      });
    } catch (error) {
      console.log('Error fetching results:', error);
      if (error.response?.status !== 404) {
        Alert.alert('Error', 'Failed to load results');
      }
      setResults([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchResults();
    setRefreshing(false);
  }, [selectedTerm, selectedStudent]);

  if (loading && examTerms.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Exam Term</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTerm}
              onValueChange={setSelectedTerm}
              style={styles.picker}
            >
              <Picker.Item label="Select Exam Term" value="" />
              {examTerms.map((term) => (
                <Picker.Item key={term.id} label={term.name} value={term.id} />
              ))}
            </Picker>
          </View>
        </View>

        {isTeacherOrAdmin && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Class</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedClass}
                onValueChange={setSelectedClass}
                style={styles.picker}
              >
                <Picker.Item label="Select Class" value="" />
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
        )}

        {summary && (
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={summary.result_status === 'Pass' ? ['#00b894', '#00cec9'] : ['#d63031', '#e17055']}
              style={styles.summaryGradient}
            >
              <Text style={styles.summaryTitle}>Overall Result</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.obtained_marks}/{summary.total_marks}</Text>
                  <Text style={styles.summaryLabel}>Marks</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.percentage?.toFixed(1)}%</Text>
                  <Text style={styles.summaryLabel}>Percentage</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.grade}</Text>
                  <Text style={styles.summaryLabel}>Grade</Text>
                </View>
              </View>
              {summary.rank && (
                <Text style={styles.rankText}>Class Rank: {summary.rank}</Text>
              )}
              <View style={[styles.statusBadge, { backgroundColor: summary.result_status === 'Pass' ? '#fff' : '#fff3' }]}>
                <Text style={[styles.statusText, { color: summary.result_status === 'Pass' ? '#00b894' : '#d63031' }]}>
                  {summary.result_status}
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 20 }} />
        ) : results.length > 0 ? (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Subject-wise Results</Text>
            {results.map((result, index) => (
              <ResultCard key={index} result={result} />
            ))}
          </View>
        ) : selectedTerm ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No results available</Text>
            <Text style={styles.emptySubtext}>
              {isTeacherOrAdmin ? 'Select a student to view results' : 'Results will appear here once published'}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Select an exam term</Text>
            <Text style={styles.emptySubtext}>Choose an exam term to view results</Text>
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryGradient: {
    padding: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  rankText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markItem: {
    alignItems: 'center',
    flex: 1,
  },
  markLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  markValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  remarks: {
    marginTop: 12,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
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

export default ResultsScreen;
