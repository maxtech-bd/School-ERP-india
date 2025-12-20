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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { classesAPI, staffAPI } from '../services/api';
import { Picker } from '@react-native-picker/picker';

const ClassCard = ({ classItem, sections, onPress }) => {
  const classSections = sections.filter(s => s.class_id === classItem.id);

  return (
    <TouchableOpacity style={styles.classCard} onPress={() => onPress(classItem)} activeOpacity={0.7}>
      <LinearGradient
        colors={['#0984e3', '#74b9ff']}
        style={styles.classGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.className}>{classItem.name || `Class ${classItem.standard}`}</Text>
        <Text style={styles.classStandard}>Standard: {classItem.standard}</Text>
      </LinearGradient>
      <View style={styles.classDetails}>
        <View style={styles.classInfo}>
          <Text style={styles.infoLabel}>Sections</Text>
          <Text style={styles.infoValue}>{classSections.length}</Text>
        </View>
        <View style={styles.classInfo}>
          <Text style={styles.infoLabel}>Max Students</Text>
          <Text style={styles.infoValue}>{classItem.max_students || 60}</Text>
        </View>
        {classItem.class_teacher_name && (
          <View style={styles.classInfo}>
            <Text style={styles.infoLabel}>Teacher</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{classItem.class_teacher_name}</Text>
          </View>
        )}
      </View>
      {classSections.length > 0 && (
        <View style={styles.sectionsRow}>
          {classSections.map((section, idx) => (
            <View key={idx} style={styles.sectionChip}>
              <Text style={styles.sectionChipText}>{section.name}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const SubjectCard = ({ subject }) => (
  <View style={styles.subjectCard}>
    <View style={styles.subjectIcon}>
      <Text style={styles.subjectIconText}>📖</Text>
    </View>
    <View style={styles.subjectInfo}>
      <Text style={styles.subjectName}>{subject.subject_name || subject.name}</Text>
      <Text style={styles.subjectCode}>{subject.subject_code || ''}</Text>
    </View>
    {subject.is_elective && (
      <View style={styles.electiveBadge}>
        <Text style={styles.electiveBadgeText}>Elective</Text>
      </View>
    )}
  </View>
);

const ClassManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const canEdit = ['super_admin', 'admin', 'principal'].includes(user?.role);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, sectionsRes, subjectsRes] = await Promise.all([
        classesAPI.getClasses(),
        classesAPI.getSections(),
        classesAPI.getSubjects(),
      ]);

      setClasses(classesRes.data || []);
      setSections(sectionsRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleClassPress = (classItem) => {
    setSelectedClass(classItem);
    setModalVisible(true);
  };

  const getFilteredSubjects = () => {
    if (!selectedClass) return subjects;
    return subjects.filter(s => s.class_standard === selectedClass.standard);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0984e3', '#74b9ff']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Class Management</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0984e3" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0984e3', '#74b9ff']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Management</Text>
        <Text style={styles.headerSubtitle}>Manage classes, sections & subjects</Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{classes.length}</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{sections.length}</Text>
          <Text style={styles.statLabel}>Sections</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{subjects.length}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'classes' && styles.activeTab]}
          onPress={() => setActiveTab('classes')}
        >
          <Text style={[styles.tabText, activeTab === 'classes' && styles.activeTabText]}>
            Classes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subjects' && styles.activeTab]}
          onPress={() => setActiveTab('subjects')}
        >
          <Text style={[styles.tabText, activeTab === 'subjects' && styles.activeTabText]}>
            Subjects
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'classes' ? (
          classes.length > 0 ? (
            classes.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                sections={sections}
                onPress={handleClassPress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏫</Text>
              <Text style={styles.emptyText}>No classes found</Text>
              <Text style={styles.emptySubtext}>Classes will appear here once added</Text>
            </View>
          )
        ) : subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <SubjectCard key={subject.id || index} subject={subject} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No subjects found</Text>
            <Text style={styles.emptySubtext}>Subjects will appear here once added</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedClass?.name || `Class ${selectedClass?.standard}`}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>Class Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Standard:</Text>
                <Text style={styles.detailValue}>{selectedClass?.standard}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Max Students:</Text>
                <Text style={styles.detailValue}>{selectedClass?.max_students || 60}</Text>
              </View>
              {selectedClass?.class_teacher_name && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Class Teacher:</Text>
                  <Text style={styles.detailValue}>{selectedClass.class_teacher_name}</Text>
                </View>
              )}

              <Text style={styles.modalSectionTitle}>Sections</Text>
              {sections.filter(s => s.class_id === selectedClass?.id).map((section, idx) => (
                <View key={idx} style={styles.sectionRow}>
                  <Text style={styles.sectionName}>{section.name}</Text>
                  {section.section_teacher_name && (
                    <Text style={styles.sectionTeacher}>{section.section_teacher_name}</Text>
                  )}
                </View>
              ))}

              <Text style={styles.modalSectionTitle}>Subjects</Text>
              {getFilteredSubjects().map((subject, idx) => (
                <View key={idx} style={styles.subjectRow}>
                  <Text style={styles.subjectRowName}>{subject.subject_name}</Text>
                  <Text style={styles.subjectRowCode}>{subject.subject_code}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0984e3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0984e3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#0984e3',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  classGradient: {
    padding: 16,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  classStandard: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  classDetails: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  classInfo: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  sectionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    paddingTop: 8,
  },
  sectionChip: {
    backgroundColor: '#0984e320',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  sectionChipText: {
    color: '#0984e3',
    fontSize: 12,
    fontWeight: '500',
  },
  subjectCard: {
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
  subjectIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0984e320',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectIconText: {
    fontSize: 20,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  subjectCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  electiveBadge: {
    backgroundColor: '#fdcb6e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  electiveBadgeText: {
    color: '#856404',
    fontSize: 11,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionName: {
    fontWeight: '600',
    color: '#333',
  },
  sectionTeacher: {
    color: '#666',
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  subjectRowName: {
    color: '#333',
  },
  subjectRowCode: {
    color: '#666',
  },
});

export default ClassManagementScreen;
