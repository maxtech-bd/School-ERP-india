import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Send, Calendar, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const TestGenerator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  
  // Test generation form
  const [testForm, setTestForm] = useState({
    class_standard: '',
    subject: '',
    chapter: '',
    topic: '',
    difficulty_level: 'medium',
    num_questions: 10,
    max_marks: 100,
    tags: []
  });
  
  // Generated test
  const [generatedTest, setGeneratedTest] = useState(null);
  
  // Question editing
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState(null);
  
  // Scheduling
  const [scheduleForm, setScheduleForm] = useState({
    scheduled_start: '',
    scheduled_end: ''
  });
  
  const classes = ['9', '10', '11', '12'];
  const subjects = ['Physics', 'Chemistry', 'Biology', 'Math', 'English', 'Computer Science'];
  const difficultyLevels = ['easy', 'medium', 'hard'];
  const learningTags = ['Knowledge', 'Understanding', 'Application', 'Reasoning', 'Skills'];
  
  // Generate test
  const handleGenerateTest = async () => {
    if (!testForm.class_standard || !testForm.subject) {
      toast.error('Please select class and subject');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/test/generate`,
        testForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setGeneratedTest(response.data);
      setActiveTab('preview');
      toast.success(`Test generated with ${response.data.total_questions} questions!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate test');
      console.error(error);
    }
    setLoading(false);
  };
  
  // Publish test
  const handlePublishTest = async () => {
    if (!generatedTest) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/test/publish`,
        {
          test_id: generatedTest.test_id,
          scheduled_start: scheduleForm.scheduled_start || null,
          scheduled_end: scheduleForm.scheduled_end || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Test published successfully!');
      setGeneratedTest(null);
      setActiveTab('list');
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to publish test');
      console.error(error);
    }
    setLoading(false);
  };
  
  // Start editing a question
  const handleEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({...question});
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditedQuestion(null);
  };
  
  // Save edited question
  const handleSaveQuestion = async () => {
    if (!editedQuestion) return;
    
    // Validation
    if (!editedQuestion.question_text.trim()) {
      toast.error('Question text cannot be empty');
      return;
    }
    if (!editedQuestion.correct_answer.trim()) {
      toast.error('Correct answer cannot be empty');
      return;
    }
    if (editedQuestion.marks <= 0) {
      toast.error('Marks must be greater than 0');
      return;
    }
    
    // Validate MCQ options
    if (editedQuestion.question_type === 'mcq') {
      if (!editedQuestion.options || editedQuestion.options.length === 0) {
        toast.error('MCQ questions must have options');
        return;
      }
      const hasEmptyOption = editedQuestion.options.some(opt => !opt.text.trim());
      if (hasEmptyOption) {
        toast.error('All options must have text');
        return;
      }
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/test/question/${editedQuestion.id}`,
        {
          question_text: editedQuestion.question_text,
          options: editedQuestion.options,
          correct_answer: editedQuestion.correct_answer,
          marks: editedQuestion.marks,
          question_type: editedQuestion.question_type,
          learning_tag: editedQuestion.learning_tag
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state
      const updatedQuestions = generatedTest.questions.map(q =>
        q.id === editedQuestion.id ? editedQuestion : q
      );
      setGeneratedTest({...generatedTest, questions: updatedQuestions});
      
      toast.success('Question updated successfully!');
      setEditingQuestionId(null);
      setEditedQuestion(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update question');
      console.error(error);
    }
    setLoading(false);
  };
  
  // Fetch tests
  const fetchTests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/test/list`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setTests(response.data.tests);
    } catch (error) {
      toast.error('Failed to fetch tests');
      console.error(error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (activeTab === 'list') {
      fetchTests();
    }
  }, [activeTab]);
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-8 h-8 text-emerald-600" />
          AI Test Generator
        </h1>
        <p className="text-gray-600">Create and manage tests with AI assistance</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('generate')}
            className={`${
              activeTab === 'generate'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Plus size={18} />
            Generate Test
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`${
              activeTab === 'preview'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            disabled={!generatedTest}
          >
            <Eye size={18} />
            Preview & Edit
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`${
              activeTab === 'list'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <FileText size={18} />
            All Tests
          </button>
        </nav>
      </div>
      
      {/* Generate Test Tab */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Generate New Test</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Class */}
            <div>
              <label className="block text-sm font-medium mb-2">Class *</label>
              <select
                value={testForm.class_standard}
                onChange={(e) => setTestForm({...testForm, class_standard: e.target.value})}
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
                value={testForm.subject}
                onChange={(e) => setTestForm({...testForm, subject: e.target.value})}
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
                value={testForm.chapter}
                onChange={(e) => setTestForm({...testForm, chapter: e.target.value})}
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <input
                type="text"
                value={testForm.topic}
                onChange={(e) => setTestForm({...testForm, topic: e.target.value})}
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <select
                value={testForm.difficulty_level}
                onChange={(e) => setTestForm({...testForm, difficulty_level: e.target.value})}
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
                value={testForm.num_questions}
                onChange={(e) => setTestForm({...testForm, num_questions: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            {/* Maximum Marks */}
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Marks</label>
              <input
                type="number"
                min="10"
                max="500"
                value={testForm.max_marks}
                onChange={(e) => setTestForm({...testForm, max_marks: parseInt(e.target.value)})}
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
                    if (testForm.tags.includes(tag)) {
                      setTestForm({...testForm, tags: testForm.tags.filter(t => t !== tag)});
                    } else {
                      setTestForm({...testForm, tags: [...testForm.tags, tag]});
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    testForm.tags.includes(tag)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerateTest}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {loading ? 'Generating...' : 'Generate Test with AI'}
          </button>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> After generation, you can edit questions, keep some, regenerate others, and then publish to students.
            </p>
          </div>
        </div>
      )}
      
      {/* Preview & Edit Tab */}
      {activeTab === 'preview' && generatedTest && (
        <div className="space-y-6">
          {/* Test Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{generatedTest.title}</h2>
                <p className="text-sm text-gray-600">
                  {generatedTest.total_questions} Questions · Maximum Marks: {generatedTest.max_marks || 100} · Status: {generatedTest.status}
                </p>
              </div>
              <button
                onClick={handleGenerateTest}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Regenerate
              </button>
            </div>
            
            {/* Scheduling Options */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">Schedule Test (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduled_start}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduled_start: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduled_end}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduled_end: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Questions Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Questions</h3>
            <div className="space-y-4">
              {generatedTest.questions.map((q, idx) => (
                <div key={q.id} className="border rounded-lg p-4">
                  {editingQuestionId === q.id && editedQuestion ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Q{idx + 1}.</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {editedQuestion.learning_tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveQuestion}
                            disabled={loading}
                            className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      
                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Question Text</label>
                        <textarea
                          value={editedQuestion.question_text}
                          onChange={(e) => setEditedQuestion({...editedQuestion, question_text: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                          rows="3"
                        />
                      </div>
                      
                      {/* Marks */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Marks</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={editedQuestion.marks}
                            onChange={(e) => setEditedQuestion({...editedQuestion, marks: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Question Type</label>
                          <select
                            value={editedQuestion.question_type}
                            onChange={(e) => setEditedQuestion({...editedQuestion, question_type: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="mcq">Multiple Choice</option>
                            <option value="short_answer">Short Answer</option>
                            <option value="long_answer">Long Answer</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* MCQ Options */}
                      {editedQuestion.question_type === 'mcq' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Options</label>
                          {editedQuestion.options && editedQuestion.options.map((opt, optIdx) => (
                            <div key={opt.id} className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{opt.id}.</span>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const newOptions = [...editedQuestion.options];
                                  newOptions[optIdx].text = e.target.value;
                                  setEditedQuestion({...editedQuestion, options: newOptions});
                                }}
                                className="flex-1 px-3 py-2 border rounded-lg"
                              />
                              <input
                                type="radio"
                                name="correct_answer"
                                checked={editedQuestion.correct_answer === opt.id}
                                onChange={() => setEditedQuestion({...editedQuestion, correct_answer: opt.id})}
                                className="w-5 h-5"
                              />
                              <span className="text-sm text-gray-600">Correct</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Non-MCQ Answer */}
                      {editedQuestion.question_type !== 'mcq' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Correct Answer</label>
                          <textarea
                            value={editedQuestion.correct_answer}
                            onChange={(e) => setEditedQuestion({...editedQuestion, correct_answer: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows="2"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Q{idx + 1}.</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {q.learning_tag}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {q.marks} marks
                          </span>
                        </div>
                        <p className="text-gray-800 mb-2">{q.question_text}</p>
                        
                        {/* Options for MCQ */}
                        {q.question_type === 'mcq' && q.options && q.options.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`text-sm px-3 py-2 rounded ${
                                  opt.id === q.correct_answer
                                    ? 'bg-emerald-50 border border-emerald-300 font-medium'
                                    : 'bg-gray-50'
                                }`}
                              >
                                {opt.id}. {opt.text}
                                {opt.id === q.correct_answer && (
                                  <span className="ml-2 text-emerald-600">✓ Correct</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Answer for non-MCQ */}
                        {q.question_type !== 'mcq' && (
                          <div className="mt-2 text-sm bg-emerald-50 border border-emerald-200 rounded p-2">
                            <span className="font-medium text-emerald-700">Answer:</span> {q.correct_answer}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit question"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Remove question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Publish Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={handlePublishTest}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <Send size={20} />
              {loading ? 'Publishing...' : 'Publish Test to Students'}
            </button>
          </div>
        </div>
      )}
      
      {/* All Tests Tab (History) */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Test History</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading tests...</p>
            </div>
          ) : tests.length > 0 ? (
            <div className="space-y-3">
              {tests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{test.title || `${test.subject} Test`}</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm text-gray-600">
                        <p><span className="font-medium">Subject:</span> {test.subject}</p>
                        <p><span className="font-medium">Total Questions:</span> {test.total_questions}</p>
                        <p><span className="font-medium">Maximum Marks:</span> {test.max_marks || 100}</p>
                        <p><span className="font-medium">Difficulty:</span> {test.difficulty_level}</p>
                        <p><span className="font-medium">Date & Time:</span> {new Date(test.created_at).toLocaleString()}</p>
                        <p><span className="font-medium">Created By:</span> {test.created_by_name}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          test.status === 'published'
                            ? 'bg-emerald-100 text-emerald-700'
                            : test.status === 'draft'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {test.status.toUpperCase()}
                        </span>
                        {test.is_scheduled && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                            <Calendar size={12} />
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No tests found. Generate a new test to view history here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestGenerator;
