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
import { classesAPI, quizAPI } from '../services/api';

const QuizScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

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

  const generateQuiz = async () => {
    if (!selectedClass || !selectedSubject) {
      Alert.alert('Error', 'Please select a class and subject');
      return;
    }

    setLoading(true);
    try {
      const response = await quizAPI.generateQuiz({
        class_id: selectedClass,
        subject_id: selectedSubject,
        num_questions: parseInt(numQuestions),
      });
      setQuiz(response.data);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionIndex, answerIndex) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const submitQuiz = () => {
    if (!quiz) return;
    
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (fetchingData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f39c12" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quiz Results</Text>
          </View>
          <View style={styles.resultsContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}/{quiz?.questions?.length || 0}</Text>
            </View>
            <Text style={styles.resultMessage}>
              {score === quiz?.questions?.length ? '🎉 Perfect Score!' :
               score >= quiz?.questions?.length * 0.7 ? '👏 Great Job!' :
               score >= quiz?.questions?.length * 0.5 ? '👍 Good Effort!' : '📚 Keep Learning!'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
              <LinearGradient
                colors={['#f39c12', '#e74c3c']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Try Another Quiz</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (quiz) {
    const question = quiz.questions[currentQuestion];
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={resetQuiz} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Question {currentQuestion + 1}/{quiz.questions.length}</Text>
          </View>
          <ScrollView style={styles.quizContent}>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{question?.question || question?.text}</Text>
            </View>
            <View style={styles.optionsContainer}>
              {(question?.options || []).map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    answers[currentQuestion] === index && styles.optionSelected,
                  ]}
                  onPress={() => selectAnswer(currentQuestion, index)}
                >
                  <Text style={[
                    styles.optionText,
                    answers[currentQuestion] === index && styles.optionTextSelected,
                  ]}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.navigationButtons}>
              {currentQuestion > 0 && (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
              )}
              {currentQuestion < quiz.questions.length - 1 ? (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonNext]}
                  onPress={() => setCurrentQuestion(currentQuestion + 1)}
                >
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.submitButton} onPress={submitQuiz}>
                  <LinearGradient
                    colors={['#00b894', '#00cec9']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Submit Quiz</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
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
          <Text style={styles.headerTitle}>AI Quiz</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📝</Text>
          </View>
          <Text style={styles.title}>Generate Quiz</Text>
          <Text style={styles.subtitle}>
            Test your knowledge with AI-generated quizzes
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

            <Text style={styles.label}>Number of Questions</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={numQuestions}
                onValueChange={setNumQuestions}
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="5 Questions" value="5" />
                <Picker.Item label="10 Questions" value="10" />
                <Picker.Item label="15 Questions" value="15" />
                <Picker.Item label="20 Questions" value="20" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateQuiz}
            disabled={loading}
          >
            <LinearGradient
              colors={['#f39c12', '#e74c3c']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate Quiz</Text>
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
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
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
  quizContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  questionText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionSelected: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    borderColor: '#f39c12',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  navButtonNext: {
    marginLeft: 'auto',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  submitButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    color: '#f39c12',
    fontSize: 36,
    fontWeight: 'bold',
  },
  resultMessage: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
});

export default QuizScreen;
