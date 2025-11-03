import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Play, RefreshCw, Save, Send, Award, Clock, Target, Pause, PlayCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const QuizTool = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  
  // Quiz generation filters
  const [filters, setFilters] = useState({
    class_standard: '',
    subject: '',
    chapter: '',
    topic: '',
    difficulty_level: 'medium',
    num_questions: 10,
    tags: []
  });
  
  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [studentResults, setStudentResults] = useState(null);
  const [progressData, setProgressData] = useState(null);
  
  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const classes = ['9', '10', '11', '12'];
  const subjects = ['Physics', 'Chemistry', 'Biology', 'Math', 'English', 'Computer Science'];
  const difficultyLevels = ['easy', 'medium', 'hard'];
  const learningTags = ['Knowledge', 'Understanding', 'Application', 'Reasoning', 'Skills'];
  
  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!filters.class_standard || !filters.subject) {
      toast.error('Please select class and subject');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/quiz/generate`,
        filters,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCurrentQuiz(response.data);
      setQuizStartTime(new Date().toISOString());
      setAnswers({});
      setResults(null);
      setElapsedTime(0);
      setTimerRunning(true);
      setTimerPaused(false);
      setActiveTab('quiz');
      toast.success(`Quiz generated with ${response.data.total_questions} questions!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate quiz');
      console.error(error);
    }
    setLoading(false);
  };
  
  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = currentQuiz.questions.length;
    
    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} out of ${totalQuestions} questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }
    
    // Stop timer when submitting
    setTimerRunning(false);
    setTimerPaused(false);
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formattedAnswers = currentQuiz.questions.map(q => ({
        question_id: q.id,
        student_answer: answers[q.id] || ''
      }));
      
      const response = await axios.post(
        `${API_BASE_URL}/quiz/submit`,
        {
          quiz_id: currentQuiz.quiz_id,
          answers: formattedAnswers,
          started_at: quizStartTime
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setResults(response.data);
      setActiveTab('results');
      toast.success(`Quiz submitted! You scored ${response.data.percentage}%`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit quiz');
      console.error(error);
    }
    setLoading(false);
  };
  
  // Fetch student results
  const fetchStudentResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      const response = await axios.get(
        `${API_BASE_URL}/quiz/results/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setStudentResults(response.data);
    } catch (error) {
      toast.error('Failed to fetch quiz history');
      console.error(error);
    }
    setLoading(false);
  };

  // Fetch progress report
  const fetchProgressReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      const response = await axios.get(
        `${API_BASE_URL}/quiz/progress/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setProgressData(response.data);
    } catch (error) {
      toast.error('Failed to fetch progress report');
      console.error(error);
    }
    setLoading(false);
  };
  
  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerRunning && !timerPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerPaused]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Stop timer when switching away from quiz tab
  useEffect(() => {
    if (activeTab !== 'quiz' && timerRunning) {
      setTimerRunning(false);
      setTimerPaused(false);
    }
    
    if (activeTab === 'history') {
      fetchStudentResults();
    } else if (activeTab === 'progress') {
      fetchProgressReport();
    }
  }, [activeTab]);
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          AI Quiz Tool
        </h1>
        <p className="text-gray-600">Practice and self-assessment with AI-generated quizzes</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('generate')}
            className={`${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Target size={18} />
            Generate Quiz
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`${
              activeTab === 'quiz'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            disabled={!currentQuiz}
          >
            <Play size={18} />
            Take Quiz
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            disabled={!results}
          >
            <Award size={18} />
            Results
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Clock size={18} />
            History
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`${
              activeTab === 'progress'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <TrendingUp size={18} />
            Progress Report
          </button>
        </nav>
      </div>
      
      {/* Generate Quiz Tab */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Generate Custom Quiz</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Class */}
            <div>
              <label className="block text-sm font-medium mb-2">Class *</label>
              <select
                value={filters.class_standard}
                onChange={(e) => setFilters({...filters, class_standard: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            {/* Chapter */}
            <div>
              <label className="block text-sm font-medium mb-2">Chapter</label>
              <input
                type="text"
                value={filters.chapter}
                onChange={(e) => setFilters({...filters, chapter: e.target.value})}
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <input
                type="text"
                value={filters.topic}
                onChange={(e) => setFilters({...filters, topic: e.target.value})}
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <select
                value={filters.difficulty_level}
                onChange={(e) => setFilters({...filters, difficulty_level: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {difficultyLevels.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            
            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <input
                type="number"
                min="5"
                max="50"
                value={filters.num_questions}
                onChange={(e) => setFilters({...filters, num_questions: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          {/* Learning Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Learning Dimensions (Tags)</label>
            <div className="flex flex-wrap gap-2">
              {learningTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    if (filters.tags.includes(tag)) {
                      setFilters({...filters, tags: filters.tags.filter(t => t !== tag)});
                    } else {
                      setFilters({...filters, tags: [...filters.tags, tag]});
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    filters.tags.includes(tag)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Play size={20} />
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      )}
      
      {/* Take Quiz Tab */}
      {activeTab === 'quiz' && currentQuiz && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">{currentQuiz.title}</h2>
              <p className="text-sm text-gray-600">
                {currentQuiz.total_questions} Questions · {currentQuiz.duration_minutes} Minutes
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Timer Display */}
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock size={20} className="text-blue-600" />
                <span className="font-mono font-bold text-lg text-blue-600">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              
              {/* Pause/Continue Timer */}
              {timerPaused ? (
                <button
                  onClick={() => setTimerPaused(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <PlayCircle size={18} />
                  Continue
                </button>
              ) : (
                <button
                  onClick={() => setTimerPaused(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <Pause size={18} />
                  Pause
                </button>
              )}
              
              {/* Stop Quiz Button */}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to stop the quiz? Your progress will not be saved.')) {
                    setTimerRunning(false);
                    setTimerPaused(false);
                    setElapsedTime(0);
                    setCurrentQuiz(null);
                    setAnswers({});
                    setActiveTab('generate');
                    toast.info('Quiz stopped');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Clock size={18} />
                Stop Quiz
              </button>
              
              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Regenerate
              </button>
            </div>
          </div>
          
          {/* Paused State Overlay */}
          {timerPaused && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-semibold text-center">
                ⏸ Quiz Paused - Click "Continue" to resume
              </p>
            </div>
          )}
          
          {/* Questions */}
          <div className="space-y-6">
            {currentQuiz.questions.map((q, idx) => (
              <div key={q.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">
                    Q{idx + 1}. {q.question_text}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {q.difficulty_level}
                  </span>
                </div>
                
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                  placeholder="Type your answer here..."
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            ))}
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmitQuiz}
            disabled={loading}
            className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}
      
      {/* Results Tab */}
      {activeTab === 'results' && results && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Quiz Results</h2>
                <p className="text-blue-100">Great job completing the quiz!</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{results.percentage}%</div>
                <div className="text-xl">Grade: {results.grade}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{results.correct_answers}</div>
                <div className="text-sm">Correct</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{results.total_questions - results.correct_answers}</div>
                <div className="text-sm">Incorrect</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{results.time_taken_minutes.toFixed(1)}</div>
                <div className="text-sm">Minutes</div>
              </div>
            </div>
          </div>
          
          {/* Answer Review */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Answer Review</h3>
            <div className="space-y-4">
              {results.answers.map((ans, idx) => (
                <div
                  key={ans.question_id}
                  className={`border-l-4 ${
                    ans.is_correct ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
                  } rounded-lg p-4`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Question {ans.question_number}</h4>
                    <span className={`text-sm font-semibold ${
                      ans.is_correct ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {ans.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Your Answer:</span> {ans.student_answer || '(Not answered)'}
                    </div>
                    {!ans.is_correct && (
                      <div>
                        <span className="font-medium">Correct Answer:</span> {ans.correct_answer}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Report Tab */}
      {activeTab === 'progress' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Overall Progress Report</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading progress data...</div>
          ) : progressData && progressData.overall.total_quizzes > 0 ? (
            <>
              {/* Overall Statistics */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Overall Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm opacity-90">Total Quizzes</div>
                    <div className="text-3xl font-bold">{progressData.overall.total_quizzes}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Average Score</div>
                    <div className="text-3xl font-bold">{progressData.overall.average_score}%</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Best Score</div>
                    <div className="text-3xl font-bold">{progressData.overall.best_score}%</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Accuracy</div>
                    <div className="text-3xl font-bold">{progressData.overall.accuracy}%</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="opacity-90">Correct Answers:</span>{' '}
                      <span className="font-semibold">{progressData.overall.total_correct}</span>
                    </div>
                    <div>
                      <span className="opacity-90">Wrong Answers:</span>{' '}
                      <span className="font-semibold">{progressData.overall.total_wrong}</span>
                    </div>
                    <div>
                      <span className="opacity-90">Total Questions:</span>{' '}
                      <span className="font-semibold">{progressData.overall.total_questions}</span>
                    </div>
                    {progressData.overall.last_attempt && (
                      <div>
                        <span className="opacity-90">Last Attempt:</span>{' '}
                        <span className="font-semibold">
                          {new Date(progressData.overall.last_attempt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject-wise Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
                <div className="space-y-4">
                  {progressData.subject_breakdown.map((subject, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                        <span className="text-2xl font-bold text-blue-600">{subject.average_score}%</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div
                          className={`h-3 rounded-full ${
                            subject.average_score >= 80 ? 'bg-green-500' :
                            subject.average_score >= 60 ? 'bg-blue-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${subject.average_score}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Quizzes:</span> {subject.total_quizzes}
                        </div>
                        <div>
                          <span className="font-medium">Best:</span>{' '}
                          <span className="text-green-600">{subject.best_score}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Accuracy:</span> {subject.accuracy}%
                        </div>
                        <div>
                          <span className="font-medium">Questions:</span>{' '}
                          <span className="text-green-600">{subject.correct_answers}</span>/
                          <span className="text-red-600">{subject.wrong_answers}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapter-wise Breakdown */}
              {progressData.chapter_breakdown.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Chapter-wise Performance</h3>
                  <div className="space-y-4">
                    {progressData.chapter_breakdown.map((chapter, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{chapter.chapter}</h4>
                            <p className="text-xs text-gray-500">{chapter.subject}</p>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{chapter.average_score}%</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                          <div
                            className={`h-3 rounded-full ${
                              chapter.average_score >= 80 ? 'bg-green-500' :
                              chapter.average_score >= 60 ? 'bg-purple-500' :
                              'bg-orange-500'
                            }`}
                            style={{ width: `${chapter.average_score}%` }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Quizzes:</span> {chapter.total_quizzes}
                          </div>
                          <div>
                            <span className="font-medium">Best:</span>{' '}
                            <span className="text-green-600">{chapter.best_score}%</span>
                          </div>
                          <div>
                            <span className="font-medium">Accuracy:</span> {chapter.accuracy}%
                          </div>
                          <div>
                            <span className="font-medium">Questions:</span>{' '}
                            <span className="text-green-600">{chapter.correct_answers}</span>/
                            <span className="text-red-600">{chapter.wrong_answers}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No quiz data available yet. Complete some quizzes to see your progress!</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quiz History</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading history...</div>
          ) : studentResults && studentResults.total_quizzes > 0 ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{studentResults.total_quizzes}</div>
                  <div className="text-sm text-gray-600">Total Quizzes</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{studentResults.average_score}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{studentResults.highest_score}%</div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                </div>
              </div>
              
              {/* Enhanced Submission List */}
              <div className="space-y-3">
                {studentResults.submissions.map((sub, idx) => (
                  <div key={sub.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {sub.subject}
                          </h4>
                          {sub.chapter && sub.chapter !== 'N/A' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {sub.chapter}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Date & Time:</span> {new Date(sub.created_at).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Score:</span>{' '}
                            <span className="text-blue-600 font-semibold">{sub.percentage}%</span> (Grade: {sub.grade})
                          </div>
                          <div>
                            <span className="font-medium">Correct:</span>{' '}
                            <span className="text-green-600">{sub.correct_answers}</span>
                          </div>
                          <div>
                            <span className="font-medium">Wrong:</span>{' '}
                            <span className="text-red-600">{sub.wrong_answers}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className={`text-3xl font-bold ${
                          sub.percentage >= 80 ? 'text-green-600' : 
                          sub.percentage >= 60 ? 'text-blue-600' : 
                          'text-orange-600'
                        }`}>
                          {sub.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No quiz attempts yet. Complete a quiz to see your progress here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizTool;
