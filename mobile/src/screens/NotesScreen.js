import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { classesAPI, notesAPI } from '../services/api';

const NotesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [notes, setNotes] = useState(null);

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  const fetchClassesAndSubjects = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        classesAPI.getClasses(),
        classesAPI.getSubjects(),
      ]);
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const generateNotes = async () => {
    if (!selectedClass || !selectedSubject) {
      Alert.alert('Error', 'Please select a class and subject');
      return;
    }

    setLoading(true);
    try {
      const response = await notesAPI.generateNotes({
        class_id: selectedClass,
        subject_id: selectedSubject,
      });
      setNotes(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetNotes = () => {
    setNotes(null);
  };

  if (fetchingData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6c5ce7" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (notes) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={resetNotes} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Study Notes</Text>
          </View>
          <ScrollView style={styles.notesContent}>
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>{notes.title || 'Generated Notes'}</Text>
              <Text style={styles.notesText}>{notes.content || notes.notes || 'No content available'}</Text>
            </View>
            <TouchableOpacity style={styles.newButton} onPress={resetNotes}>
              <LinearGradient
                colors={['#6c5ce7', '#a29bfe']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Generate Another</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Notes</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📚</Text>
          </View>
          <Text style={styles.title}>Generate Notes</Text>
          <Text style={styles.subtitle}>
            Get detailed study notes with examples and practice questions
          </Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Select Class</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedClass}
                onValueChange={setSelectedClass}
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Choose a class..." value="" />
                {classes.map((cls) => (
                  <Picker.Item key={cls._id || cls.id} label={cls.name} value={cls._id || cls.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Select Subject</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSubject}
                onValueChange={setSelectedSubject}
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Choose a subject..." value="" />
                {subjects.map((sub) => (
                  <Picker.Item key={sub._id || sub.id} label={sub.subject_name || sub.name || 'Unknown'} value={sub.subject_name || sub._id || sub.id} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateNotes}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6c5ce7', '#a29bfe']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate Notes</Text>
              )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notesContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  notesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  notesTitle: {
    color: '#6c5ce7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  notesText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
  },
  newButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
});

export default NotesScreen;
