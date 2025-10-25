import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, Plus, Edit, Trash2, Search, FileText, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const AcademicCMS = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [qaPairs, setQaPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddQA, setShowAddQA] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [editingBookId, setEditingBookId] = useState(null);
  const [editingQAId, setEditingQAId] = useState(null);
  
  // Form states
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    subject: '',
    class_standard: '',
    board: 'CBSE',
    publisher: '',
    description: ''
  });
  
  const [qaForm, setQaForm] = useState({
    book_id: '',
    question: '',
    answer: '',
    subject: '',
    class_standard: '',
    question_type: 'conceptual',
    difficulty_level: 'medium',
    keywords: '',
    tags: ''
  });

  // Fetch books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/cms/books`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(response.data.books || []);
    } catch (error) {
      toast.error('Failed to load books');
      console.error(error);
    }
    setLoading(false);
  };

  // Fetch Q&A pairs
  const fetchQAPairs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/cms/qa-pairs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQaPairs(response.data.qa_pairs || []);
    } catch (error) {
      toast.error('Failed to load Q&A pairs');
      console.error(error);
    }
    setLoading(false);
  };

  // Add or Update book
  const handleAddBook = async (e) => {
    e.preventDefault();
    const isEditing = editingBookId !== null;
    
    try {
      const token = localStorage.getItem('token');
      
      if (isEditing) {
        // UPDATE existing book
        await axios.put(`${API_BASE_URL}/cms/books/${editingBookId}`, bookForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Book updated successfully!');
      } else {
        // CREATE new book
        await axios.post(`${API_BASE_URL}/cms/books`, bookForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Book added successfully!');
      }
      
      setShowAddBook(false);
      setEditingBookId(null);
      setBookForm({
        title: '',
        author: '',
        subject: '',
        class_standard: '',
        board: 'CBSE',
        publisher: '',
        description: ''
      });
      fetchBooks();
    } catch (error) {
      const errorMsg = isEditing ? 'Failed to update book' : 'Failed to add book';
      toast.error(error.response?.data?.detail || errorMsg);
      console.error(error);
    }
  };

  // Edit book
  const handleEditBook = (book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title,
      author: book.author,
      subject: book.subject,
      class_standard: book.class_standard,
      board: book.board || 'CBSE',
      publisher: book.publisher || '',
      description: book.description || ''
    });
    setShowAddBook(true);
  };

  // Delete book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/cms/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Book deleted successfully!');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete book');
      console.error(error);
    }
  };

  // Add or Update Q&A pair
  const handleAddQA = async (e) => {
    e.preventDefault();
    const isEditing = editingQAId !== null;
    
    try {
      const token = localStorage.getItem('token');
      const qaData = {
        ...qaForm,
        keywords: qaForm.keywords.split(',').map(k => k.trim()).filter(k => k),
        tags: qaForm.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      if (isEditing) {
        // UPDATE existing Q&A
        await axios.put(`${API_BASE_URL}/cms/qa-pairs/${editingQAId}`, qaData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Q&A pair updated successfully!');
      } else {
        // CREATE new Q&A
        await axios.post(`${API_BASE_URL}/cms/qa-pairs`, qaData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Q&A pair added successfully!');
      }
      
      setShowAddQA(false);
      setEditingQAId(null);
      setQaForm({
        book_id: '',
        question: '',
        answer: '',
        subject: '',
        class_standard: '',
        question_type: 'conceptual',
        difficulty_level: 'medium',
        keywords: '',
        tags: ''
      });
      fetchQAPairs();
    } catch (error) {
      const errorMsg = isEditing ? 'Failed to update Q&A pair' : 'Failed to add Q&A pair';
      toast.error(error.response?.data?.detail || errorMsg);
      console.error(error);
    }
  };

  // Edit Q&A pair
  const handleEditQA = (qa) => {
    setEditingQAId(qa.id);
    setQaForm({
      book_id: qa.book_id || '',
      question: qa.question,
      answer: qa.answer,
      subject: qa.subject,
      class_standard: qa.class_standard,
      question_type: qa.question_type || 'conceptual',
      difficulty_level: qa.difficulty_level || 'medium',
      keywords: Array.isArray(qa.keywords) ? qa.keywords.join(', ') : (qa.keywords || ''),
      tags: Array.isArray(qa.tags) ? qa.tags.join(', ') : (qa.tags || '')
    });
    setShowAddQA(true);
  };

  // Delete Q&A pair
  const handleDeleteQA = async (qaId) => {
    if (!window.confirm('Are you sure you want to delete this Q&A pair?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/cms/qa-pairs/${qaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Q&A pair deleted successfully!');
      fetchQAPairs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete Q&A pair');
      console.error(error);
    }
  };

  // Bulk upload Q&A pairs
  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', bulkUploadFile);

      const response = await axios.post(
        `${API_BASE_URL}/cms/qa-pairs/bulk-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUploadSummary(response.data.summary);
      toast.success(`✅ ${response.data.summary.successful} Q&A pairs uploaded successfully!`);
      setBulkUploadFile(null);
      fetchQAPairs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Bulk upload failed');
      console.error(error);
    }
    setLoading(false);
  };

  // Download sample template
  const downloadSampleTemplate = () => {
    // Sample data
    const sampleData = [
      {
        question: "What is Newton's Second Law?",
        answer: "Force = mass × acceleration (F = m × a)",
        subject: "Physics",
        class: "9",
        keywords: "newton, force, motion",
        difficulty: "medium",
        type: "conceptual"
      },
      {
        question: "Solve: 2x + 5 = 15",
        answer: "x = 5",
        subject: "Math",
        class: "9",
        keywords: "algebra, equations",
        difficulty: "easy",
        type: "numerical"
      },
      {
        question: "What is photosynthesis?",
        answer: "Photosynthesis is the process by which plants use sunlight, water and carbon dioxide to produce oxygen and energy in the form of sugar.",
        subject: "Biology",
        class: "10",
        keywords: "photosynthesis, plants, chlorophyll",
        difficulty: "medium",
        type: "conceptual"
      }
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Q&A Template");
    
    // Generate Excel file and download
    XLSX.writeFile(workbook, "sample_qa_template.xlsx");
    
    toast.success('📄 Sample template downloaded!');
  };

  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks();
    } else if (activeTab === 'qa') {
      fetchQAPairs();
    }
  }, [activeTab]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Academic Content CMS</h1>
        <p className="text-gray-600">Manage academic books and Q&A knowledge base for AI Assistant</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('books')}
            className={`${
              activeTab === 'books'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Book className="w-4 h-4" />
            Academic Books
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`${
              activeTab === 'qa'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <FileText className="w-4 h-4" />
            Q&A Knowledge Base
          </button>
        </nav>
      </div>

      {/* Books Tab */}
      {activeTab === 'books' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Academic Books ({books.length})</h2>
            <button
              onClick={() => {
                setEditingBookId(null);
                setBookForm({
                  title: '',
                  author: '',
                  subject: '',
                  class_standard: '',
                  board: 'CBSE',
                  publisher: '',
                  description: ''
                });
                setShowAddBook(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Add Book
            </button>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1">{book.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit Book"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <div className="mt-2 flex gap-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {book.subject}
                  </span>
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    Class {book.class_standard}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{book.description}</p>
              </div>
            ))}
          </div>

          {/* Add/Edit Book Modal */}
          {showAddBook && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">
                  {editingBookId ? 'Edit Book' : 'Add New Book'}
                </h3>
                <form onSubmit={handleAddBook} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Book Title"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Author"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject (e.g., Mathematics)"
                    value={bookForm.subject}
                    onChange={(e) => setBookForm({...bookForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Class (e.g., 10th)"
                    value={bookForm.class_standard}
                    onChange={(e) => setBookForm({...bookForm, class_standard: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={bookForm.description}
                    onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                    >
                      {editingBookId ? 'Update Book' : 'Add Book'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddBook(false);
                        setEditingBookId(null);
                        setBookForm({
                          title: '',
                          author: '',
                          subject: '',
                          class_standard: '',
                          board: 'CBSE',
                          publisher: '',
                          description: ''
                        });
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Q&A Tab */}
      {activeTab === 'qa' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Q&A Knowledge Base ({qaPairs.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => {
                  setEditingQAId(null);
                  setQaForm({
                    book_id: '',
                    question: '',
                    answer: '',
                    subject: '',
                    class_standard: '',
                    question_type: 'conceptual',
                    difficulty_level: 'medium',
                    keywords: '',
                    tags: ''
                  });
                  setShowAddQA(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Add Q&A
              </button>
            </div>
          </div>

          {/* Q&A List */}
          <div className="space-y-3">
            {qaPairs.map((qa) => (
              <div key={qa.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Q: {qa.question}</p>
                    <p className="text-sm text-gray-600 mt-2">A: {qa.answer}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {qa.subject}
                      </span>
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Class {qa.class_standard}
                      </span>
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {qa.difficulty_level}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditQA(qa)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit Q&A"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQA(qa.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Q&A"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Q&A Modal */}
          {showAddQA && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  {editingQAId ? 'Edit Q&A Pair' : 'Add New Q&A Pair'}
                </h3>
                <form onSubmit={handleAddQA} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Question</label>
                    <input
                      type="text"
                      value={qaForm.question}
                      onChange={(e) => setQaForm({...qaForm, question: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Answer</label>
                    <textarea
                      value={qaForm.answer}
                      onChange={(e) => setQaForm({...qaForm, answer: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <input
                        type="text"
                        value={qaForm.subject}
                        onChange={(e) => setQaForm({...qaForm, subject: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Class</label>
                      <input
                        type="text"
                        value={qaForm.class_standard}
                        onChange={(e) => setQaForm({...qaForm, class_standard: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                      <select
                        value={qaForm.difficulty_level}
                        onChange={(e) => setQaForm({...qaForm, difficulty_level: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Question Type</label>
                      <select
                        value={qaForm.question_type}
                        onChange={(e) => setQaForm({...qaForm, question_type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="conceptual">Conceptual</option>
                        <option value="numerical">Numerical</option>
                        <option value="theoretical">Theoretical</option>
                        <option value="application">Application</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
                    <input
                      type="text"
                      value={qaForm.keywords}
                      onChange={(e) => setQaForm({...qaForm, keywords: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="newton, force, motion"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                    >
                      {editingQAId ? 'Update Q&A' : 'Add Q&A'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddQA(false);
                        setEditingQAId(null);
                        setQaForm({
                          book_id: '',
                          question: '',
                          answer: '',
                          subject: '',
                          class_standard: '',
                          question_type: 'conceptual',
                          difficulty_level: 'medium',
                          keywords: '',
                          tags: ''
                        });
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bulk Upload Modal */}
          {showBulkUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <h3 className="text-lg font-semibold mb-4">Bulk Upload Q&A Pairs</h3>
                
                <div className="space-y-4">
                  {/* File Format Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">📋 File Requirements</h4>
                    <p className="text-sm text-blue-700 mb-2">Upload Excel (.xlsx) or CSV (.csv) file with these columns:</p>
                    <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                      <li><strong>question</strong> (required) - The question text</li>
                      <li><strong>answer</strong> (required) - The answer text</li>
                      <li><strong>subject</strong> (optional) - e.g., Physics, Math</li>
                      <li><strong>class</strong> or <strong>class_standard</strong> (optional) - e.g., 9, 10, 11</li>
                      <li><strong>keywords</strong> (optional) - comma-separated</li>
                      <li><strong>difficulty</strong> or <strong>difficulty_level</strong> (optional) - easy, medium, hard</li>
                      <li><strong>type</strong> or <strong>question_type</strong> (optional) - conceptual, numerical, etc.</li>
                    </ul>
                    
                    {/* Download Sample Template Button */}
                    <button
                      onClick={downloadSampleTemplate}
                      className="mt-3 w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      📄 Download Sample Template
                    </button>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Select File</label>
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={(e) => setBulkUploadFile(e.target.files[0])}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {bulkUploadFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {bulkUploadFile.name}
                      </p>
                    )}
                  </div>

                  {/* Upload Summary */}
                  {uploadSummary && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">✅ Upload Summary</h4>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>Total rows: {uploadSummary.total_rows}</p>
                        <p>✅ Successful: {uploadSummary.successful}</p>
                        <p>⚠️ Skipped: {uploadSummary.skipped}</p>
                        {uploadSummary.skipped_details && uploadSummary.skipped_details.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Skipped rows:</p>
                            <ul className="list-disc list-inside">
                              {uploadSummary.skipped_details.map((detail, index) => (
                                <li key={index} className="text-xs">{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkUpload}
                      disabled={!bulkUploadFile || loading}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Uploading...' : 'Upload Q&A Pairs'}
                    </button>
                    <button
                      onClick={() => {
                        setShowBulkUpload(false);
                        setBulkUploadFile(null);
                        setUploadSummary(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicCMS;
