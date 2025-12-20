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
  TextInput,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { academicCMSAPI, classesAPI } from '../services/api';
import { Picker } from '@react-native-picker/picker';

const ContentCard = ({ item, type, onPress }) => {
  const getIcon = () => {
    const icons = {
      book: '📚',
      reference: '📖',
      paper: '📝',
      qna: '❓',
    };
    return icons[type] || '📄';
  };

  return (
    <TouchableOpacity style={styles.contentCard} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.contentIcon}>
        <Text style={styles.contentIconText}>{getIcon()}</Text>
      </View>
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle} numberOfLines={2}>
          {item.title || item.name || item.question}
        </Text>
        <Text style={styles.contentMeta}>
          {item.subject_name || item.subject || ''} 
          {item.class_standard ? ` • Class ${item.class_standard}` : ''}
        </Text>
        {item.chapter && <Text style={styles.contentChapter}>Chapter: {item.chapter}</Text>}
      </View>
      <View style={styles.contentAction}>
        <Text style={styles.actionIcon}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const AcademicCMSScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [books, setBooks] = useState([]);
  const [referenceBooks, setReferenceBooks] = useState([]);
  const [previousPapers, setPreviousPapers] = useState([]);
  const [qna, setQna] = useState([]);

  const tabs = [
    { key: 'books', label: 'Books', icon: '📚' },
    { key: 'reference', label: 'Reference', icon: '📖' },
    { key: 'papers', label: 'Papers', icon: '📝' },
    { key: 'qna', label: 'Q&A', icon: '❓' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjectsByClass();
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchContent();
  }, [activeTab, selectedClass, selectedSubject]);

  const fetchInitialData = async () => {
    try {
      const classesRes = await classesAPI.getClasses();
      setClasses(classesRes.data || []);
    } catch (error) {
      console.log('Error fetching classes:', error);
    }
  };

  const fetchSubjectsByClass = async () => {
    try {
      const subjectsRes = await classesAPI.getSubjectsByClass(selectedClass);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.log('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass) params.class_standard = selectedClass;
      if (selectedSubject) params.subject = selectedSubject;
      if (searchQuery) params.search = searchQuery;

      switch (activeTab) {
        case 'books':
          const booksRes = await academicCMSAPI.getBooks(params);
          setBooks(booksRes.data || []);
          break;
        case 'reference':
          const refRes = await academicCMSAPI.getReferenceBooks(params);
          setReferenceBooks(refRes.data || []);
          break;
        case 'papers':
          const papersRes = await academicCMSAPI.getPreviousPapers(params);
          setPreviousPapers(papersRes.data || []);
          break;
        case 'qna':
          const qnaRes = await academicCMSAPI.getQnA(params);
          setQna(qnaRes.data || []);
          break;
      }
    } catch (error) {
      console.log('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  }, [activeTab, selectedClass, selectedSubject]);

  const handleContentPress = (item) => {
    if (item.file_url || item.download_url) {
      Linking.openURL(item.file_url || item.download_url);
    } else if (item.content || item.answer) {
      navigation.navigate('ContentDetail', { item });
    }
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'books': return books;
      case 'reference': return referenceBooks;
      case 'papers': return previousPapers;
      case 'qna': return qna;
      default: return [];
    }
  };

  const getContentType = () => {
    switch (activeTab) {
      case 'books': return 'book';
      case 'reference': return 'reference';
      case 'papers': return 'paper';
      case 'qna': return 'qna';
      default: return 'book';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#e17055', '#fdcb6e']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Academic Library</Text>
        <Text style={styles.headerSubtitle}>Books, Papers & Study Materials</Text>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedClass}
                onValueChange={setSelectedClass}
                style={styles.picker}
              >
                <Picker.Item label="All Classes" value="" />
                {classes.map((cls) => (
                  <Picker.Item
                    key={cls.id}
                    label={cls.name || `Class ${cls.standard}`}
                    value={cls.standard}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.filterItem}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSubject}
                onValueChange={setSelectedSubject}
                style={styles.picker}
              >
                <Picker.Item label="All Subjects" value="" />
                {subjects.map((subj, index) => (
                  <Picker.Item
                    key={index}
                    label={subj.subject_name || subj.name || subj}
                    value={subj.subject_name || subj.name || subj}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchContent}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#e17055" style={{ marginTop: 40 }} />
        ) : getCurrentContent().length > 0 ? (
          getCurrentContent().map((item, index) => (
            <ContentCard
              key={item.id || index}
              item={item}
              type={getContentType()}
              onPress={handleContentPress}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {tabs.find(t => t.key === activeTab)?.icon || '📚'}
            </Text>
            <Text style={styles.emptyText}>No content found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or check back later
            </Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#e17055',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
  searchContainer: {
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentCard: {
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
  contentIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#e1705520',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentIconText: {
    fontSize: 24,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 12,
    color: '#666',
  },
  contentChapter: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  contentAction: {
    width: 30,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
    color: '#e17055',
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

export default AcademicCMSScreen;
