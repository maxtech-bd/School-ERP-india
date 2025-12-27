import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Book,
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  Upload,
  Download,
  BookOpen,
  X,
  File,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helper function to format API validation errors
const formatErrorMessage = (error, fallbackMsg) => {
  const detail = error.response?.data?.detail;

  // If detail is a string, return it
  if (typeof detail === "string") {
    return detail;
  }

  // If detail is an array of validation errors (Pydantic format)
  if (Array.isArray(detail)) {
    const messages = detail.map((err) => {
      const field = err.loc ? err.loc.join(".") : "field";
      return `${field}: ${err.msg}`;
    });
    return messages.join(", ");
  }

  // If detail is an object with msg property
  if (detail && typeof detail === "object" && detail.msg) {
    return detail.msg;
  }

  // Fallback to the provided message
  return fallbackMsg;
};

// --- Initial States ---
const initialChapter = {
  chapter_number: 1,
  title: "Chapter 1",
  file_url: "",
  file_name: "",
};

const initialBookForm = {
  title: "",
  author: "",
  subject: "",
  class_standard: "",
  board: "CBSE",
  prelims_file_url: "",
  prelims_file_name: "",
  chapters: [initialChapter],
  bulk_upload_file: null,
};

const initialQAForm = {
  question: "",
  answer: "",
  subject: "",
  class_standard: "",
  chapter: "", // Mapped to chapter_topic
  question_type: "conceptual",
  difficulty_level: "medium",
  keywords: "",
};

const initialPaperForm = {
  title: "",
  subject: "",
  class_standard: "",
  chapter: "",
  exam_year: new Date().getFullYear().toString(),
  paper_type: "Final Exam",
  file_url: "",
};

const AcademicCMS = () => {
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [qaPairs, setQaPairs] = useState([]);
  const [referenceBooks, setReferenceBooks] = useState([]);
  const [previousPapers, setPreviousPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddQA, setShowAddQA] = useState(false);
  const [showAddReferenceBook, setShowAddReferenceBook] = useState(false);
  const [showAddPaper, setShowAddPaper] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);

  const [editingBookId, setEditingBookId] = useState(null);
  const [editingQAId, setEditingQAId] = useState(null);
  const [editingReferenceBookId, setEditingReferenceBookId] = useState(null);
  const [editingPaperId, setEditingPaperId] = useState(null);

  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [qaForm, setQaForm] = useState(initialQAForm);
  const [referenceBookForm, setReferenceBookForm] = useState(initialBookForm);
  const [paperForm, setPaperForm] = useState(initialPaperForm);

  // Navigation states for hierarchical flow
  const [acadNavLevel, setAcadNavLevel] = useState({
    step: "class",
    class: "",
    subject: "",
  });
  const [refNavLevel, setRefNavLevel] = useState({
    step: "class",
    class: "",
    subject: "",
  });

  // Chapter modal
  const [showChaptersModal, setShowChaptersModal] = useState(false);
  const [selectedBookForChapters, setSelectedBookForChapters] = useState(null);
  const [chapterViewIndex, setChapterViewIndex] = useState(0);
  const [chapterLoading, setChapterLoading] = useState(false);

  // --- Helper Functions ---

  // Handle file upload (Max 100MB)
  const handleFileUpload = useCallback(async (file, onSuccess) => {
    if (!file) return null;

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 100MB");
      return null;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/msword", // DOC (legacy)
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, TXT, and DOCX/DOC files are allowed");
      return null;
    }

    setUploadingFile(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE_URL}/files/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("File uploaded successfully!");
      if (onSuccess) onSuccess(response.data.file_url, file.name);
      return response.data.file_url;
    } catch (error) {
      toast.error(formatErrorMessage(error, "File upload failed"));
      console.error(error);
      return null;
    } finally {
      setUploadingFile(false);
    }
  }, []);

  // Handle generic form field changes
  const handleFormChange = (formType, field, value) => {
    if (formType === "book") {
      setBookForm((prev) => ({ ...prev, [field]: value }));
    } else if (formType === "reference") {
      setReferenceBookForm((prev) => ({ ...prev, [field]: value }));
    } else if (formType === "qa") {
      setQaForm((prev) => ({ ...prev, [field]: value }));
    } else if (formType === "paper") {
      setPaperForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle chapter changes (title, file upload)
  const handleChapterChange = (
    formType,
    index,
    field,
    value,
    fileName = null,
  ) => {
    const setForm = formType === "book" ? setBookForm : setReferenceBookForm;

    setForm((prev) => {
      const newChapters = [...prev.chapters];
      if (!newChapters[index]) {
        return prev;
      }
      newChapters[index] = {
        ...newChapters[index],
        [field]: value,
        ...(fileName && { file_name: fileName }),
        ...(field === "file_url" && !value && { file_name: "" }),
      };
      // Auto-populate title if empty and file is uploaded
      if (
        field === "file_url" &&
        value &&
        !newChapters[index].title.trim() &&
        fileName
      ) {
        newChapters[index].title = fileName.split(".").slice(0, -1).join(".");
      }
      return { ...prev, chapters: newChapters };
    });
  };

  // Add a new empty chapter field
  const addChapterField = (formType) => {
    const setForm = formType === "book" ? setBookForm : setReferenceBookForm;

    setForm((prev) => {
      const newIndex = prev.chapters.length;
      if (newIndex < 20) {
        return {
          ...prev,
          chapters: [
            ...prev.chapters,
            {
              chapter_number: newIndex + 1,
              title: `Chapter ${newIndex + 1}`,
              file_url: "",
              file_name: "",
            },
          ],
        };
      }
      toast.warning("Maximum of 20 chapters allowed.");
      return prev;
    });
  };

  // Remove a chapter field
  const removeChapterField = (formType, index) => {
    const setForm = formType === "book" ? setBookForm : setReferenceBookForm;
    setForm((prev) => {
      const newChapters = prev.chapters.filter((_, i) => i !== index);
      const renumberedChapters = newChapters.map((chap, i) => ({
        ...chap,
        chapter_number: i + 1,
        title: chap.title.startsWith("Chapter ")
          ? `Chapter ${i + 1}`
          : chap.title,
      }));
      return { ...prev, chapters: renumberedChapters };
    });
  };

  // Reset Form to initial state
  const resetForm = (formType) => {
    if (formType === "book") {
      setBookForm(initialBookForm);
      setEditingBookId(null);
    } else if (formType === "reference") {
      setReferenceBookForm(initialBookForm);
      setEditingReferenceBookId(null);
    } else if (formType === "qa") {
      setQaForm(initialQAForm);
      setEditingQAId(null);
    } else if (formType === "paper") {
      setPaperForm(initialPaperForm);
      setEditingPaperId(null);
    }
  };

  // --- Fetch Functions ---

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/cms/academic-books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(response.data || []);
    } catch (error) {
      toast.error("Failed to load academic books");
      console.error(error);
    }
    setLoading(false);
  }, []);

  const fetchReferenceBooks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/cms/reference-books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReferenceBooks(response.data || []);
    } catch (error) {
      toast.error("Failed to load reference books");
      console.error(error);
    }
    setLoading(false);
  }, []);

  const fetchQAPairs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/cms/qa-knowledge-base`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setQaPairs(response.data || []);
    } catch (error) {
      toast.error("Failed to load Q&A pairs");
      console.error(error);
    }
    setLoading(false);
  }, []);

  const fetchPreviousPapers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/cms/previous-year-papers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPreviousPapers(response.data || []);
    } catch (error) {
      toast.error("Failed to load previous year papers");
      console.error(error);
    }
    setLoading(false);
  }, []);

  // Initial load / tab change
  useEffect(() => {
    if (activeTab === "books") {
      fetchBooks();
    } else if (activeTab === "reference") {
      fetchReferenceBooks();
    } else if (activeTab === "qa") {
      fetchQAPairs();
    } else if (activeTab === "papers") {
      fetchPreviousPapers();
    }
  }, [
    activeTab,
    fetchBooks,
    fetchReferenceBooks,
    fetchQAPairs,
    fetchPreviousPapers,
  ]);

  // --- CRUD Handlers for Academic Books ---

  const handleAddBook = async (e) => {
    e.preventDefault();
    const isEditing = editingBookId !== null;

    try {
      const token = localStorage.getItem("token");
      const endpoint = `${API_BASE_URL}/cms/academic-books`;

      const payload = {
        ...bookForm,
        chapters: bookForm.chapters.filter(
          (c) => c.title.trim() && c.file_url.trim(),
        ),
        pdf_url: bookForm.prelims_file_url || "",
        cover_image_url: bookForm.prelims_file_url || "",
      };

      if (isEditing) {
        await axios.put(`${endpoint}/${editingBookId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`✅ Academic Book updated successfully!`);
      } else {
        await axios.post(endpoint, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`✅ Academic Book added successfully!`);
      }

      setShowAddBook(false);
      resetForm("book");
      fetchBooks();
    } catch (error) {
      const errorMsg = isEditing
        ? "Failed to update academic book"
        : "Failed to add academic book";
      toast.error(formatErrorMessage(error, errorMsg));
      console.error(error);
    }
  };

  const handleEditBook = (book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title || "",
      author: book.author || "",
      subject: book.subject || "",
      class_standard: book.class_standard || "",
      board: book.board || "CBSE",
      prelims_file_url: book.pdf_url || book.prelims_file_url || "",
      prelims_file_name: book.prelims_file_name || "",
      chapters: (book.chapters || []).map((c, i) => ({
        chapter_number: c.chapter_number || i + 1,
        title:
          c.title || c.chapter_title || `Chapter ${c.chapter_number || i + 1}`,
        file_url: c.file_url || "",
        file_name: c.file_name || "",
      })),
      bulk_upload_file: null,
    });
    setShowAddBook(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (
      !window.confirm("Are you sure you want to delete this Academic book?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/cms/academic-books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Academic Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to delete academic book"));
      console.error(error);
    }
  };

  // --- CRUD Handlers for Reference Books ---

  const handleAddReferenceBook = async (e) => {
    e.preventDefault();
    const isEditing = editingReferenceBookId !== null;

    try {
      const token = localStorage.getItem("token");
      const endpoint = `${API_BASE_URL}/cms/reference-books`;

      const payload = {
        ...referenceBookForm,
        chapters: referenceBookForm.chapters.filter(
          (c) => c.title.trim() && c.file_url.trim(),
        ),
        pdf_url: referenceBookForm.prelims_file_url || "",
      };

      if (isEditing) {
        await axios.put(`${endpoint}/${editingReferenceBookId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Reference Book updated successfully!");
      } else {
        await axios.post(endpoint, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Reference Book added successfully!");
      }

      setShowAddReferenceBook(false);
      resetForm("reference");
      fetchReferenceBooks();
    } catch (error) {
      const errorMsg = isEditing
        ? "Failed to update reference book"
        : "Failed to add reference book";
      toast.error(formatErrorMessage(error, errorMsg));
      console.error(error);
    }
  };

  const handleEditReferenceBook = (book) => {
    setEditingReferenceBookId(book.id);
    setReferenceBookForm({
      title: book.title || "",
      author: book.author || "",
      subject: book.subject || "",
      class_standard: book.class_standard || "",
      board: book.board || "CBSE",
      prelims_file_url: book.pdf_url || book.prelims_file_url || "",
      prelims_file_name: book.prelims_file_name || "",
      chapters: (book.chapters || []).map((c, i) => ({
        chapter_number: c.chapter_number || i + 1,
        title:
          c.title || c.chapter_title || `Chapter ${c.chapter_number || i + 1}`,
        file_url: c.file_url || "",
        file_name: c.file_name || "",
      })),
      bulk_upload_file: null,
    });
    setShowAddReferenceBook(true);
  };

  const handleDeleteReferenceBook = async (bookId) => {
    if (
      !window.confirm("Are you sure you want to delete this reference book?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/cms/reference-books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Reference book deleted successfully!");
      fetchReferenceBooks();
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to delete reference book"));
      console.error(error);
    }
  };

  // --- CRUD Handlers for Q&A ---

  const handleAddQA = async (e) => {
    e.preventDefault();
    const isEditing = editingQAId !== null;

    try {
      const token = localStorage.getItem("token");
      const qaData = {
        ...qaForm,
        keywords: qaForm.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k),
        chapter_topic: qaForm.chapter || "",
      };

      const endpoint = `${API_BASE_URL}/cms/qa-knowledge-base`;

      if (isEditing) {
        await axios.put(`${endpoint}/${editingQAId}`, qaData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Q&A pair updated successfully!");
      } else {
        await axios.post(endpoint, qaData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Q&A pair added successfully!");
      }

      setShowAddQA(false);
      resetForm("qa");
      fetchQAPairs();
    } catch (error) {
      const errorMsg = isEditing
        ? "Failed to update Q&A pair"
        : "Failed to add Q&A pair";
      toast.error(formatErrorMessage(error, errorMsg));
      console.error(error);
    }
  };

  const handleEditQA = (qa) => {
    setEditingQAId(qa.id);
    setQaForm({
      question: qa.question,
      answer: qa.answer,
      subject: qa.subject,
      class_standard: qa.class_standard,
      question_type: qa.question_type || "conceptual",
      difficulty_level: qa.difficulty_level || "medium",
      keywords: Array.isArray(qa.keywords)
        ? qa.keywords.join(", ")
        : qa.keywords || "",
      chapter: qa.chapter_topic || "",
    });
    setShowAddQA(true);
  };

  const handleDeleteQA = async (qaId) => {
    if (!window.confirm("Are you sure you want to delete this Q&A pair?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/cms/qa-knowledge-base/${qaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Q&A pair deleted successfully!");
      fetchQAPairs();
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to delete Q&A pair"));
      console.error(error);
    }
  };

  // Bulk upload Q&A pairs
  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", bulkUploadFile);

      const response = await axios.post(
        `${API_BASE_URL}/cms/qa-knowledge-base/bulk-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUploadSummary(response.data.summary);
      toast.success(
        `✅ ${response.data.summary.successful} Q&A pairs uploaded successfully!`,
      );
      setBulkUploadFile(null);
      fetchQAPairs();
    } catch (error) {
      toast.error(formatErrorMessage(error, "Bulk upload failed"));
      console.error(error);
    }
    setLoading(false);
  };

  // Download sample template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        question: "What is Newton's Second Law?",
        answer: "Force = mass × acceleration (F = m × a)",
        subject: "Physics",
        class: "9",
        chapter_topic: "Laws of Motion",
        keywords: "newton, force, motion",
        difficulty: "medium",
        type: "conceptual",
      },
      {
        question: "Solve: 2x + 5 = 15",
        answer: "x = 5",
        subject: "Math",
        class: "9",
        chapter_topic: "Linear Equations",
        keywords: "algebra, equations",
        difficulty: "easy",
        type: "numerical",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Q&A Template");
    XLSX.writeFile(workbook, "sample_qa_template.xlsx");
    toast.success("📄 Sample template downloaded!");
  };

  // --- CRUD Handlers for Papers ---

  const handleAddPaper = async (e) => {
    e.preventDefault();
    const isEditing = editingPaperId !== null;

    try {
      const token = localStorage.getItem("token");
      const endpoint = `${API_BASE_URL}/cms/previous-year-papers`;

      if (isEditing) {
        await axios.put(`${endpoint}/${editingPaperId}`, paperForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Previous year paper updated successfully!");
      } else {
        await axios.post(endpoint, paperForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("✅ Previous year paper added successfully!");
      }

      setShowAddPaper(false);
      resetForm("paper");
      fetchPreviousPapers();
    } catch (error) {
      const errorMsg = isEditing
        ? "Failed to update paper"
        : "Failed to add paper";
      toast.error(formatErrorMessage(error, errorMsg));
      console.error(error);
    }
  };

  const handleEditPaper = (paper) => {
    setEditingPaperId(paper.id);
    setPaperForm({
      title: paper.title,
      subject: paper.subject,
      class_standard: paper.class_standard,
      chapter: paper.chapter || "",
      exam_year: paper.exam_year,
      paper_type: paper.paper_type,
      file_url: paper.file_url || paper.pdf_url || "",
    });
    setShowAddPaper(true);
  };

  const handleDeletePaper = async (paperId) => {
    if (!window.confirm("Are you sure you want to delete this paper?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/cms/previous-year-papers/${paperId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("✅ Previous year paper deleted successfully!");
      fetchPreviousPapers();
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to delete paper"));
      console.error(error);
    }
  };

  // --- Open Chapters Modal (for Academic & Reference) ---

  const openChaptersModal = async (book, bookType) => {
    try {
      setChapterViewIndex(0);
      setChapterLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/cms/books/${book.id}/chapters`,
        {
          params: { book_type: bookType },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const apiChapters = response.data || [];
      const chaptersSource =
        apiChapters.length > 0 ? apiChapters : book.chapters || [];

      if (!chaptersSource.length) {
        toast.info("No chapters found for this book");
        return;
      }

      const normalized = chaptersSource.map((c, idx) => ({
        chapter_number: c.chapter_number || idx + 1,
        title:
          c.title ||
          c.chapter_title ||
          `Chapter ${c.chapter_number || idx + 1}`,
        file_url: c.file_url || "",
        file_name: c.file_name || "",
        content: c.content || "",
      }));

      setSelectedBookForChapters({
        ...book,
        bookType,
        chapters: normalized,
      });
      setShowChaptersModal(true);
    } catch (error) {
      console.error("Error fetching book chapters:", error);
      toast.error(formatErrorMessage(error, "Failed to load chapters"));
    } finally {
      setChapterLoading(false);
    }
  };

  // --- Common Book/Reference Book Modal Renderer ---

  const renderBookModal = (
    isReference,
    showModal,
    setShowModal,
    formState,
    setFormState,
    handleAddFunction,
    editingId,
    resetFormFn,
  ) => {
    if (!showModal) return null;

    const formType = isReference ? "reference" : "book";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingId
                ? `Edit ${isReference ? "Reference" : "Academic"} Book`
                : `Add New ${isReference ? "Reference" : "Academic"} Book`}
            </h3>
            <button
              onClick={() => {
                setShowModal(false);
                resetFormFn(formType);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleAddFunction} className="space-y-4">
            {/* BOOK TITLE / AUTHOR */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="BOOK TITLE *"
                value={formState.title}
                onChange={(e) =>
                  handleFormChange(formType, "title", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="AUTHOR *"
                value={formState.author}
                onChange={(e) =>
                  handleFormChange(formType, "author", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            {/* SELECT CLASS / SUBJECTS */}
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formState.class_standard}
                onChange={(e) =>
                  handleFormChange(formType, "class_standard", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">SELECT CLASS (5-12) *</option>
                {[5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
              <select
                value={formState.subject}
                onChange={(e) =>
                  handleFormChange(formType, "subject", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">SELECT SUBJECTS *</option>
                {["Physics", "Chemistry", "Biology", "Math", "English"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* PRELIMS Upload */}
            <div className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <label className="block text-xs font-medium mb-2 text-gray-600 dark:text-gray-400 flex justify-between items-center">
                <span>
                  PRELIMS / Full Book File (PDF, TXT, DOCX - Max 100MB Each)
                </span>
                {formState.prelims_file_url && (
                  <button
                    type="button"
                    onClick={() =>
                      handleFormChange(formType, "prelims_file_url", "")
                    }
                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear File
                  </button>
                )}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      await handleFileUpload(file, (url, fileName) => {
                        handleFormChange(formType, "prelims_file_url", url);
                        handleFormChange(
                          formType,
                          "prelims_file_name",
                          fileName,
                        );
                      });
                    }
                  }}
                  className="flex-1 text-sm border p-1 rounded"
                  disabled={uploadingFile || formState.prelims_file_url}
                />
                <div className="text-xs w-1/4">
                  {uploadingFile ? (
                    <span className="text-blue-600">Uploading...</span>
                  ) : formState.prelims_file_name ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <File className="w-3 h-3" /> {formState.prelims_file_name}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">No file chosen</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Chapters Upload */}
            <div className="space-y-3 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-inner">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2 mb-3">
                Chapters (1-{formState.chapters.length})
              </h4>
              {formState.chapters.map((chapter, index) => (
                <div
                  key={index}
                  className="border p-3 rounded-lg bg-gray-50 dark:bg-gray-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                      Chapter {index + 1}
                    </span>
                    {formState.chapters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChapterField(formType, index)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full"
                        title="Remove Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Chapter Title"
                    value={chapter.title}
                    onChange={(e) =>
                      handleChapterChange(
                        formType,
                        index,
                        "title",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
                    required
                  />

                  <div className="flex items-center gap-2">
                    {chapter.file_url ? (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1 text-sm">
                          <File className="w-4 h-4" /> {chapter.file_name || "File uploaded"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleChapterChange(formType, index, "file_url", "")
                          }
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex-1">
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {uploadingFile ? "Uploading..." : "Upload PDF/DOCX"}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.txt,.docx,.doc"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              await handleFileUpload(file, (url, fileName) => {
                                handleChapterChange(
                                  formType,
                                  index,
                                  "file_url",
                                  url,
                                  fileName,
                                );
                              });
                            }
                          }}
                          className="hidden"
                          disabled={uploadingFile}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}

              {formState.chapters.length < 20 && (
                <button
                  type="button"
                  onClick={() => addChapterField(formType)}
                  className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 mt-2 font-bold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  CHAPTER ADD
                </button>
              )}
            </div>

            {/* BULK UPLOAD for Chapters */}
            <div className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <label className="block text-xs font-medium mb-2 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                BULK UPLOAD (All Chapters in One File - Max 100MB)
              </label>
              <input
                type="file"
                accept=".pdf,.txt,.docx,.doc"
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bulk_upload_file: e.target.files[0],
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
                disabled={uploadingFile}
              />
              {formState.bulk_upload_file && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Selected: {formState.bulk_upload_file.name}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
                disabled={uploadingFile}
              >
                {editingId ? "Update Book" : "Add Book"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetFormFn(formType);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          Academic Content CMS
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Manage academic books, reference books, previous papers & Q&A
          knowledge base
        </p>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="border-b border-gray-200 dark:border-gray-600 mb-6 overflow-x-auto scrollbar-hide">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max pb-px">
          <button
            onClick={() => setActiveTab("books")}
            className={`${
              activeTab === "books"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-700"
            } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0`}
          >
            <Book className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Academic</span> Books
          </button>
          <button
            onClick={() => setActiveTab("reference")}
            className={`${
              activeTab === "reference"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-700"
            } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0`}
          >
            <Book className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Reference</span> Books
          </button>
          <button
            onClick={() => setActiveTab("papers")}
            className={`${
              activeTab === "papers"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-700"
            } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0`}
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Previous Years&apos;</span> Papers
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`${
              activeTab === "qa"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-700"
            } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0`}
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            Q&amp;A <span className="hidden sm:inline">Knowledge Base</span>
          </button>
        </nav>
      </div>

      {/* Academic Books Tab (A) - Class → Subject → Books */}
      {activeTab === "books" && (
        <div>
          {/* Breadcrumb Navigation */}
          {acadNavLevel.step !== "class" && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <button
                onClick={() =>
                  setAcadNavLevel({
                    step: "class",
                    class: "",
                    subject: "",
                  })
                }
                className="hover:text-emerald-600"
              >
                Classes
              </button>
              {acadNavLevel.class && (
                <>
                  <span>›</span>
                  <span className="font-medium">
                    Class {acadNavLevel.class}
                  </span>
                </>
              )}
              {acadNavLevel.step === "subject" && (
                <>
                  <span>›</span>
                  <span>Select Subject</span>
                </>
              )}
              {acadNavLevel.step === "books" && (
                <>
                  <span>›</span>
                  <span>{acadNavLevel.subject}</span>
                </>
              )}
            </div>
          )}

          {/* Step 1: Select Class */}
          {acadNavLevel.step === "class" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Academic Books – Select Class (5-12)
                </h2>
                <button
                  onClick={() => {
                    resetForm("book");
                    setShowAddBook(true);
                  }}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Book
                </button>
              </div>
              {books.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No academic books added yet
                  </p>
                  <button
                    onClick={() => setShowAddBook(true)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    Add Your First Book
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...new Set(books.map((book) => book.class_standard))]
                    .sort((a, b) => Number(a) - Number(b))
                    .map((classNum) => (
                      <button
                        key={classNum}
                        onClick={() =>
                          setAcadNavLevel({
                            step: "subject",
                            class: classNum,
                            subject: "",
                          })
                        }
                        className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center"
                      >
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          Class {classNum}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {
                            books.filter((b) => b.class_standard === classNum)
                              .length
                          }{" "}
                          books
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Subject */}
          {acadNavLevel.step === "subject" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Class {acadNavLevel.class} – Select Subject
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setAcadNavLevel({
                        step: "class",
                        class: "",
                        subject: "",
                      })
                    }
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                  >
                    ← Back to Classes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  ...new Set(
                    books
                      .filter(
                        (book) => book.class_standard === acadNavLevel.class,
                      )
                      .map((book) => book.subject),
                  ),
                ]
                  .sort()
                  .map((subject) => (
                    <button
                      key={subject}
                      onClick={() =>
                        setAcadNavLevel({
                          step: "books",
                          class: acadNavLevel.class,
                          subject,
                        })
                      }
                      className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                    >
                      <div className="text-xl font-semibold text-gray-900 dark:text-white">
                        {subject}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {
                          books.filter(
                            (b) =>
                              b.class_standard === acadNavLevel.class &&
                              b.subject === subject,
                          ).length
                        }{" "}
                        books
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Step 3: List Books */}
          {acadNavLevel.step === "books" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Academic Books – Class {acadNavLevel.class} –{" "}
                  {acadNavLevel.subject}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setAcadNavLevel({
                        step: "subject",
                        class: acadNavLevel.class,
                        subject: "",
                      })
                    }
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                  >
                    ← Back to Subjects
                  </button>
                  <button
                    onClick={() => {
                      resetForm("book");
                      setBookForm((prev) => ({
                        ...prev,
                        class_standard: acadNavLevel.class,
                        subject: acadNavLevel.subject,
                      }));
                      setShowAddBook(true);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Book
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books
                  .filter(
                    (book) =>
                      book.class_standard === acadNavLevel.class &&
                      book.subject === acadNavLevel.subject,
                  )
                  .map((book) => (
                    <div
                      key={book.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
                          {book.title}
                        </h3>
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          Class {book.class_standard}
                        </span>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {book.subject}
                        </span>
                        {(book.chapter_count || book.chapters?.length || 0) > 0 && (
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                            {book.chapter_count || book.chapters?.length} Chapters
                          </span>
                        )}
                        {book.pdf_url && !book.has_chapters && !(book.chapters?.length > 0) && (
                          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            Full Book
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {book.pdf_url && !book.has_chapters && !(book.chapters?.length > 0) && (
                          <a
                            href={book.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs px-3 py-1.5 rounded hover:bg-orange-600"
                          >
                            <BookOpen className="w-3 h-3" />
                            Full Book
                          </a>
                        )}
                        {(book.has_chapters || (book.chapters && book.chapters.length > 0)) && (
                          <button
                            type="button"
                            onClick={() => openChaptersModal(book, "academic")}
                            className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs px-3 py-1.5 rounded hover:bg-emerald-600"
                          >
                            <BookOpen className="w-3 h-3" />
                            View Chapters ({book.chapter_count || book.chapters?.length})
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Add/Edit Academic Book Modal */}
          {renderBookModal(
            false,
            showAddBook,
            setShowAddBook,
            bookForm,
            setBookForm,
            handleAddBook,
            editingBookId,
            resetForm,
          )}
        </div>
      )}

      {/* Reference Books Tab (B) – Class → Subject → Books */}
      {activeTab === "reference" && (
        <div>
          {/* Breadcrumb Navigation */}
          {refNavLevel.step !== "class" && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <button
                onClick={() =>
                  setRefNavLevel({
                    step: "class",
                    class: "",
                    subject: "",
                  })
                }
                className="hover:text-emerald-600"
              >
                Classes
              </button>
              {refNavLevel.class && (
                <>
                  <span>›</span>
                  <span className="font-medium">Class {refNavLevel.class}</span>
                </>
              )}
              {refNavLevel.step === "subject" && (
                <>
                  <span>›</span>
                  <span>Select Subject</span>
                </>
              )}
              {refNavLevel.step === "books" && (
                <>
                  <span>›</span>
                  <span>{refNavLevel.subject}</span>
                </>
              )}
            </div>
          )}

          {/* Step 1: Select Class */}
          {refNavLevel.step === "class" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Reference Books – Select Class (5-12)
                </h2>
                <button
                  onClick={() => {
                    resetForm("reference");
                    setShowAddReferenceBook(true);
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Book
                </button>
              </div>
              {referenceBooks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No reference books added yet
                  </p>
                  <button
                    onClick={() => setShowAddReferenceBook(true)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    Add Your First Book
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    ...new Set(
                      referenceBooks.map((book) => book.class_standard),
                    ),
                  ]
                    .sort((a, b) => Number(a) - Number(b))
                    .map((classNum) => (
                      <button
                        key={classNum}
                        onClick={() =>
                          setRefNavLevel({
                            step: "subject",
                            class: classNum,
                            subject: "",
                          })
                        }
                        className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center"
                      >
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          Class {classNum}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {
                            referenceBooks.filter(
                              (b) => b.class_standard === classNum,
                            ).length
                          }{" "}
                          books
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Subject */}
          {refNavLevel.step === "subject" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Class {refNavLevel.class} – Select Subject
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setRefNavLevel({
                        step: "class",
                        class: "",
                        subject: "",
                      })
                    }
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                  >
                    ← Back to Classes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  ...new Set(
                    referenceBooks
                      .filter(
                        (book) => book.class_standard === refNavLevel.class,
                      )
                      .map((book) => book.subject),
                  ),
                ]
                  .sort()
                  .map((subject) => (
                    <button
                      key={subject}
                      onClick={() =>
                        setRefNavLevel({
                          step: "books",
                          class: refNavLevel.class,
                          subject,
                        })
                      }
                      className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                    >
                      <div className="text-xl font-semibold text-gray-900 dark:text-white">
                        {subject}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {
                          referenceBooks.filter(
                            (b) =>
                              b.class_standard === refNavLevel.class &&
                              b.subject === subject,
                          ).length
                        }{" "}
                        books
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Step 3: List Reference Books */}
          {refNavLevel.step === "books" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Reference Books – Class {refNavLevel.class} –{" "}
                  {refNavLevel.subject}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setRefNavLevel({
                        step: "subject",
                        class: refNavLevel.class,
                        subject: "",
                      })
                    }
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                  >
                    ← Back to Subjects
                  </button>
                  <button
                    onClick={() => {
                      resetForm("reference");
                      setReferenceBookForm((prev) => ({
                        ...prev,
                        class_standard: refNavLevel.class,
                        subject: refNavLevel.subject,
                      }));
                      setShowAddReferenceBook(true);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Book
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {referenceBooks
                  .filter(
                    (book) =>
                      book.class_standard === refNavLevel.class &&
                      book.subject === refNavLevel.subject,
                  )
                  .map((book) => (
                    <div
                      key={book.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
                          {book.title}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReferenceBook(book)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit Book"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReferenceBook(book.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          Class {book.class_standard}
                        </span>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {book.subject}
                        </span>
                        {(book.chapter_count || book.chapters?.length || 0) > 0 && (
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                            {book.chapter_count || book.chapters?.length} Chapters
                          </span>
                        )}
                        {book.pdf_url && !book.has_chapters && !(book.chapters?.length > 0) && (
                          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            Full Book
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {book.pdf_url && !book.has_chapters && !(book.chapters?.length > 0) && (
                          <a
                            href={book.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs px-3 py-1.5 rounded hover:bg-orange-600"
                          >
                            <BookOpen className="w-3 h-3" />
                            Full Book
                          </a>
                        )}
                        {(book.has_chapters || (book.chapters && book.chapters.length > 0)) && (
                          <button
                            type="button"
                            onClick={() => openChaptersModal(book, "reference")}
                            className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs px-3 py-1.5 rounded hover:bg-emerald-600"
                          >
                            <BookOpen className="w-3 h-3" />
                            View Chapters ({book.chapter_count || book.chapters?.length})
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Add/Edit Reference Book Modal */}
          {renderBookModal(
            true,
            showAddReferenceBook,
            setShowAddReferenceBook,
            referenceBookForm,
            setReferenceBookForm,
            handleAddReferenceBook,
            editingReferenceBookId,
            resetForm,
          )}
        </div>
      )}

      {/* Previous Years' Papers Tab (C) */}
      {activeTab === "papers" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Previous Years&apos; Papers ({previousPapers.length}) (5-12)
            </h2>
            <button
              onClick={() => {
                resetForm("paper");
                setShowAddPaper(true);
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Paper
            </button>
          </div>
          {/* Papers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previousPapers.map((paper) => (
              <div
                key={paper.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
                    {paper.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPaper(paper)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit Paper"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePaper(paper.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                    Class {paper.class_standard}
                  </span>
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {paper.subject}
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {paper.exam_year}
                  </span>
                  {paper.file_url && (
                    <a
                      href={paper.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded hover:bg-orange-200"
                    >
                      <FileText className="w-3 h-3" />
                      View File
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Paper Modal */}
          {showAddPaper && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  {editingPaperId
                    ? "Edit Previous Year Paper"
                    : "Add New Previous Year Paper"}
                </h3>
                <form onSubmit={handleAddPaper} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Paper Title *"
                    value={paperForm.title}
                    onChange={(e) =>
                      setPaperForm({ ...paperForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={paperForm.subject}
                      onChange={(e) =>
                        setPaperForm({
                          ...paperForm,
                          subject: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Subject *</option>
                      {[
                        "Physics",
                        "Chemistry",
                        "Biology",
                        "Math",
                        "English",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <select
                      value={paperForm.class_standard}
                      onChange={(e) =>
                        setPaperForm({
                          ...paperForm,
                          class_standard: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Class *</option>
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                        <option key={c} value={c}>
                          Class {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Exam Year *"
                      value={paperForm.exam_year}
                      onChange={(e) =>
                        setPaperForm({
                          ...paperForm,
                          exam_year: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      min="2000"
                      max={new Date().getFullYear()}
                      required
                    />
                    <select
                      value={paperForm.paper_type}
                      onChange={(e) =>
                        setPaperForm({
                          ...paperForm,
                          paper_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="Final Exam">Final Exam</option>
                      <option value="Mid-Term">Mid-Term</option>
                      <option value="Practice Paper">Practice Paper</option>
                      <option value="Sample Paper">Sample Paper</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Chapter (optional)"
                    value={paperForm.chapter}
                    onChange={(e) =>
                      setPaperForm({ ...paperForm, chapter: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload File (PDF, TXT, DOCX/DOC - Max 100MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.doc"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          await handleFileUpload(file, (url) => {
                            setPaperForm({ ...paperForm, file_url: url });
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={uploadingFile}
                    />
                    {uploadingFile && (
                      <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                    )}
                    {paperForm.file_url && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ File uploaded
                        <button
                          type="button"
                          onClick={() =>
                            setPaperForm({ ...paperForm, file_url: "" })
                          }
                          className="text-red-500 hover:text-red-700 ml-3"
                        >
                          <X className="w-4 h-4 inline-block" /> Clear
                        </button>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                      disabled={uploadingFile}
                    >
                      {editingPaperId ? "Update Paper" : "Add Paper"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPaper(false);
                        resetForm("paper");
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
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

      {/* Q&A Tab (D) */}
      {activeTab === "qa" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Q&amp;A Knowledge Base ({qaPairs.length}) (5-12)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBulkUpload(true);
                  setUploadSummary(null);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => {
                  resetForm("qa");
                  setShowAddQA(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Add Q&amp;A
              </button>
            </div>
          </div>

          {/* Q&A List */}
          <div className="space-y-3">
            {qaPairs.map((qa) => (
              <div key={qa.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Q: {qa.question}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">A: {qa.answer}</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {qa.subject}
                      </span>
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Class {qa.class_standard}
                      </span>
                      {qa.chapter_topic && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          {qa.chapter_topic}
                        </span>
                      )}
                      <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 text-xs px-2 py-1 rounded">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  {editingQAId ? "Edit Q&A Pair" : "Add New Q&A Pair"}
                </h3>
                <form onSubmit={handleAddQA} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={qaForm.question}
                      onChange={(e) =>
                        handleFormChange("qa", "question", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Answer
                    </label>
                    <textarea
                      value={qaForm.answer}
                      onChange={(e) =>
                        handleFormChange("qa", "answer", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={qaForm.subject}
                        onChange={(e) =>
                          handleFormChange("qa", "subject", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Class
                      </label>
                      <input
                        type="text"
                        value={qaForm.class_standard}
                        onChange={(e) =>
                          handleFormChange(
                            "qa",
                            "class_standard",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Chapter/Topic
                      </label>
                      <input
                        type="text"
                        value={qaForm.chapter}
                        onChange={(e) =>
                          handleFormChange("qa", "chapter", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="e.g. Thermodynamics"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Difficulty Level
                      </label>
                      <select
                        value={qaForm.difficulty_level}
                        onChange={(e) =>
                          handleFormChange(
                            "qa",
                            "difficulty_level",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Question Type
                      </label>
                      <select
                        value={qaForm.question_type}
                        onChange={(e) =>
                          handleFormChange(
                            "qa",
                            "question_type",
                            e.target.value,
                          )
                        }
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
                    <label className="block text-sm font-medium mb-1">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={qaForm.keywords}
                      onChange={(e) =>
                        handleFormChange("qa", "keywords", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="newton, force, motion"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                    >
                      {editingQAId ? "Update Q&A" : "Add Q&A"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddQA(false);
                        resetForm("qa");
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
                <h3 className="text-lg font-semibold mb-4">
                  Bulk Upload Q&amp;A Pairs
                </h3>

                <div className="space-y-4">
                  {/* File Format Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      📋 File Requirements
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Upload Excel (.xlsx) or CSV (.csv) file with these
                      columns:
                    </p>
                    <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                      <li>
                        <strong>question</strong> (required)
                      </li>
                      <li>
                        <strong>answer</strong> (required)
                      </li>
                      <li>
                        <strong>subject</strong> (optional)
                      </li>
                      <li>
                        <strong>class</strong> or{" "}
                        <strong>class_standard</strong> (optional)
                      </li>
                      <li>
                        <strong>chapter_topic</strong> (optional)
                      </li>
                      <li>
                        <strong>keywords</strong> (optional)
                      </li>
                      <li>
                        <strong>difficulty</strong> or{" "}
                        <strong>difficulty_level</strong> (optional)
                      </li>
                      <li>
                        <strong>type</strong> or <strong>question_type</strong>{" "}
                        (optional)
                      </li>
                    </ul>

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
                    <label className="block text-sm font-medium mb-2">
                      Select File
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={(e) => setBulkUploadFile(e.target.files[0])}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {bulkUploadFile && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Selected: {bulkUploadFile.name}
                      </p>
                    )}
                  </div>

                  {/* Upload Summary */}
                  {uploadSummary && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">
                        ✅ Upload Summary
                      </h4>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>Total rows: {uploadSummary.total_rows}</p>
                        <p>✅ Successful: {uploadSummary.successful}</p>
                        <p>⚠️ Skipped: {uploadSummary.skipped}</p>
                        {uploadSummary.skipped_details &&
                          uploadSummary.skipped_details.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium">Skipped rows:</p>
                              <ul className="list-disc list-inside">
                                {uploadSummary.skipped_details.map(
                                  (detail, index) => (
                                    <li key={index} className="text-xs">
                                      {detail}
                                    </li>
                                  ),
                                )}
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
                      {loading ? "Uploading..." : "Upload Q&A Pairs"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBulkUpload(false);
                        setBulkUploadFile(null);
                        setUploadSummary(null);
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
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

      {/* Chapters Viewer Modal (both Academic & Reference) */}
      {showChaptersModal && selectedBookForChapters && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  {selectedBookForChapters.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedBookForChapters.subject} – Class{" "}
                  {selectedBookForChapters.class_standard} • 
                  <span className={`ml-1 ${selectedBookForChapters.bookType === "academic" ? "text-purple-600" : "text-blue-600"}`}>
                    {selectedBookForChapters.bookType === "academic"
                      ? "Academic Book"
                      : "Reference Book"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowChaptersModal(false);
                  setSelectedBookForChapters(null);
                  setChapterViewIndex(0);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 dark:text-gray-400 p-1 hover:bg-gray-100 dark:bg-gray-800 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {chapterLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading chapters...</p>
              </div>
            ) : !selectedBookForChapters.chapters ||
              selectedBookForChapters.chapters.length === 0 ? (
              <div className="py-12 text-center text-gray-600 dark:text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No chapters found for this book.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    All Chapters ({selectedBookForChapters.chapters.length})
                  </h4>
                </div>
                {selectedBookForChapters.chapters.map((chap, index) => {
                  const title = chap.title || chap.chapter_title || `Chapter ${chap.chapter_number}`;
                  const fileUrl = chap.file_url;
                  const fileName = chap.file_name;
                  
                  return (
                    <div 
                      key={chap.id || index} 
                      className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                            {chap.chapter_number || index + 1}
                          </span>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">{title}</h5>
                            {fileName && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{fileName}</p>
                            )}
                          </div>
                        </div>
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Open
                          </a>
                        ) : chap.content ? (
                          <button
                            onClick={() => setChapterViewIndex(index)}
                            className="inline-flex items-center gap-1.5 bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Content
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-3 py-1.5 rounded">
                            No file
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCMS;
