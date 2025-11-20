import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Sparkles,
  BookOpen,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

/**
 * Convert a class object to the canonical class_standard value.
 * Examples:
 *  { name: "Class 10" }  -> "10"
 *  { name: "10" }        -> "10"
 *  { class_standard: 9 } -> "9"
 */
const getClassValue = (cls) => {
  if (cls.class_standard !== undefined && cls.class_standard !== null) {
    return String(cls.class_standard);
  }
  if (cls.name) {
    const nameStr = String(cls.name);
    const match = nameStr.match(/\d+/); // first number in the string
    if (match) return match[0];
    return nameStr;
  }
  return String(cls.id);
};

const AINotes = () => {
  const [loading, setLoading] = useState(false); // history list loading
  const [generating, setGenerating] = useState(false); // generate button loading
  const [notesList, setNotesList] = useState([]);
  const [currentNotes, setCurrentNotes] = useState(null);

  // ---------- Class options (from Class API) ----------
  const [classOptions, setClassOptions] = useState([]);
  const [classLoading, setClassLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(""); // form dropdown value (ID)

  // Form state
  const [formData, setFormData] = useState({
    class_standard: "", // e.g. "10"
    subject: "",
    chapter: "",
    topic: "",
  });

  // Dynamic curriculum state from backend (FORM)
  const [subjectsOptions, setSubjectsOptions] = useState([]); // subjects for selected class (form)
  const [chaptersOptions, setChaptersOptions] = useState([]); // chapters for selected subject (form)
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Filter state for history
  const [filterClass, setFilterClass] = useState(""); // class_standard value
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");

  // ===============================
  // Load classes from backend
  // ===============================

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_BASE_URL}/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClassOptions(res.data || []);
      } catch (err) {
        console.error("Class load failed:", err);
        toast.error("Failed to load class list");
      } finally {
        setClassLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // ===============================
  // Helpers to fetch notes (history)
  // ===============================

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {};
      if (filterClass) params.class_standard = filterClass;
      if (filterSubject) params.subject = filterSubject;
      if (filterChapter) params.chapter = filterChapter;

      const response = await axios.get(`${API_BASE_URL}/ai/notes/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.success) {
        setNotesList(response.data.notes);
      }
    } catch (error) {
      console.error("Fetch notes error:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [filterClass, filterSubject, filterChapter]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ===============================
  // Dynamic Class → Subject → Chapter (FORM)
  // ===============================

  const handleClassChange = async (e) => {
    const classId = e.target.value; // DB ID from select
    setSelectedClassId(classId);

    // Find class and derive class_standard (e.g. "10")
    const cls = classOptions.find((c) => String(c.id) === String(classId));
    const classStandard = cls ? getClassValue(cls) : "";

    setFormData((prev) => ({
      ...prev,
      class_standard: classStandard, // used by AI + notes backend
      subject: "",
      chapter: "",
      topic: "",
    }));
    setCurrentNotes(null);
    setSubjectsOptions([]);
    setChaptersOptions([]);

    if (!classId) return;

    try {
      setSubjectsLoading(true);
      const token = localStorage.getItem("token");

      // SUBJECT API expects CLASS ID
      const res = await axios.get(
        `${API_BASE_URL}/subjects/by-class/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSubjectsOptions(res.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects for selected class");
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleSubjectChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      subject: value,
      chapter: "",
      topic: "",
    }));
    setCurrentNotes(null);

    // Find subject object and build chapter list from syllabus
    const selectedSubject = subjectsOptions.find(
      (s) => s.subject_name === value,
    );

    if (!selectedSubject || !Array.isArray(selectedSubject.syllabus)) {
      setChaptersOptions([]);
      return;
    }

    const chapters = selectedSubject.syllabus
      .map((unit) => unit.unit_name)
      .filter(Boolean);

    const uniqueChapters = Array.from(new Set(chapters));
    setChaptersOptions(uniqueChapters);
  };

  const handleChapterChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, chapter: value }));
  };

  // ===============================
  // Generate Notes
  // ===============================

  const handleGenerate = async () => {
    if (!formData.class_standard || !formData.subject) {
      toast.error("Please select Class and Subject");
      return;
    }

    setGenerating(true);
    setCurrentNotes(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/ai/notes/generate`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setCurrentNotes(response.data);
        if (response.data.source === "cms") {
          toast.success("Notes loaded from library!");
        } else {
          toast.success("AI Notes generated and saved!");
        }
        fetchNotes();
      }
    } catch (error) {
      console.error("Generate notes error:", error);
      toast.error(error?.response?.data?.detail || "Failed to generate notes");
    } finally {
      setGenerating(false);
    }
  };

  // ===============================
  // Notes Actions (View / Delete / Download)
  // ===============================

  const handleDelete = async (notesId) => {
    if (!window.confirm("Delete these notes?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/ai/notes/${notesId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Notes deleted");
      fetchNotes();
      if (currentNotes?.notes_id === notesId) {
        setCurrentNotes(null);
      }
    } catch (error) {
      console.error("Delete notes error:", error);
      toast.error("Failed to delete notes");
    }
  };

  const handleViewNotes = (notes) => {
    setCurrentNotes({
      notes_id: notes.id,
      content: notes.content,
      source: notes.source,
      class_standard: notes.class_standard,
      subject: notes.subject,
      chapter: notes.chapter,
      topic: notes.topic,
      created_at: notes.created_at,
    });

    // Sync form selections when viewing from history
    setFormData((prev) => ({
      ...prev,
      class_standard: notes.class_standard || prev.class_standard,
      subject: notes.subject || prev.subject,
      chapter: notes.chapter || prev.chapter,
      topic: notes.topic || prev.topic,
    }));
  };

  const handleDownload = () => {
    if (!currentNotes) return;

    const content = `
${currentNotes.subject} - Class ${currentNotes.class_standard}
${currentNotes.chapter ? `Chapter: ${currentNotes.chapter}` : ""}
${currentNotes.topic ? `Topic: ${currentNotes.topic}` : ""}

${currentNotes.content}

---
Generated: ${new Date(currentNotes.created_at).toLocaleString()}
Source: ${currentNotes.source === "cms" ? "Library" : "AI Generated"}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes_${currentNotes.subject}_${currentNotes.class_standard}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // ===============================
  // Filter options derived from notesList
  // ===============================

  const subjectFilterOptions = useMemo(() => {
    const filteredByClass = notesList.filter((n) =>
      filterClass ? String(n.class_standard) === String(filterClass) : true,
    );
    const subjects = filteredByClass.map((n) => n.subject).filter(Boolean);
    return Array.from(new Set(subjects));
  }, [notesList, filterClass]);

  const chapterFilterOptions = useMemo(() => {
    const filtered = notesList.filter((n) => {
      if (filterClass && String(n.class_standard) !== String(filterClass))
        return false;
      if (filterSubject && n.subject !== filterSubject) return false;
      return true;
    });

    const chapters = filtered.map((n) => n.chapter).filter(Boolean);
    return Array.from(new Set(chapters));
  }, [notesList, filterClass, filterSubject]);

  // Filter handlers (Notes Library)
  const handleFilterClassChange = (e) => {
    const value = e.target.value; // class_standard
    setFilterClass(value);
    setFilterSubject("");
    setFilterChapter("");
  };

  const handleFilterSubjectChange = (e) => {
    const value = e.target.value;
    setFilterSubject(value);
    setFilterChapter("");
  };

  const handleFilterChapterChange = (e) => {
    const value = e.target.value;
    setFilterChapter(value);
  };

  // ===============================
  // Render
  // ===============================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-white" size={32} />
            <h1 className="text-3xl font-bold text-white">
              AI Notes Generator
            </h1>
          </div>
          <p className="text-blue-100">
            Generate comprehensive study notes with examples and practice
            questions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Generate Form */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600" />
              Generate Notes
            </h2>

            <div className="space-y-4">
              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <select
                  value={selectedClassId}
                  onChange={handleClassChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {classLoading ? "Loading classes..." : "Select Class"}
                  </option>
                  {classOptions.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name || `Class ${getClassValue(cls)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject (dynamic from backend) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={handleSubjectChange}
                  disabled={!formData.class_standard || subjectsLoading}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {subjectsLoading
                      ? "Loading subjects..."
                      : formData.class_standard
                        ? "Select Subject"
                        : "Select Class first"}
                  </option>

                  {/* If backend subjects exist → show them */}
                  {subjectsOptions.length > 0 &&
                    subjectsOptions.map((subject) => (
                      <option key={subject.id} value={subject.subject_name}>
                        {subject.subject_name}
                      </option>
                    ))}

                  {/* DEMO SUBJECTS fallback */}
                  {subjectsOptions.length === 0 && !subjectsLoading && (
                    <>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Computer Science">Computer Science</option>
                    </>
                  )}
                </select>
              </div>

              {/* Chapter (dynamic from syllabus) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter
                </label>
                {chaptersOptions.length > 0 ? (
                  <select
                    value={formData.chapter}
                    onChange={handleChapterChange}
                    disabled={!formData.subject}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Chapter</option>
                    {chaptersOptions.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.chapter}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        chapter: e.target.value,
                      }))
                    }
                    placeholder={
                      formData.subject
                        ? "No syllabus chapters found – type chapter name"
                        : "Select Subject first"
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Topic (free text) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      topic: e.target.value,
                    }))
                  }
                  placeholder="e.g., Laws of Thermodynamics"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Notes
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Includes learning objectives, examples, and practice questions
              </p>
            </div>
          </div>

          {/* Middle: Notes Display */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                Study Notes
              </h2>
              {currentNotes && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  <Download size={18} />
                  Download
                </button>
              )}
            </div>

            {currentNotes ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Class:</span>{" "}
                      <span className="text-gray-900">
                        {currentNotes.class_standard}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Subject:
                      </span>{" "}
                      <span className="text-gray-900">
                        {currentNotes.subject}
                      </span>
                    </div>
                    {currentNotes.chapter && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Chapter:
                        </span>{" "}
                        <span className="text-gray-900">
                          {currentNotes.chapter}
                        </span>
                      </div>
                    )}
                    {currentNotes.topic && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Topic:
                        </span>{" "}
                        <span className="text-gray-900">
                          {currentNotes.topic}
                        </span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Source:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          currentNotes.source === "cms"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {currentNotes.source === "cms"
                          ? "Library"
                          : "AI Generated"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {currentNotes.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FileText size={64} className="mx-auto mb-4 opacity-30" />
                <p>Generate notes to view them here</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes History */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Notes Library</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Filter by Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Class
              </label>
              <select
                value={filterClass}
                onChange={handleFilterClassChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">
                  {classLoading ? "Loading classes..." : "All Classes"}
                </option>
                {classOptions.map((cls) => (
                  <option key={cls.id} value={getClassValue(cls)}>
                    {cls.name || `Class ${getClassValue(cls)}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Subject
              </label>
              <select
                value={filterSubject}
                onChange={handleFilterSubjectChange}
                disabled={subjectFilterOptions.length === 0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {subjectFilterOptions.length
                    ? "All Subjects"
                    : "No subjects found"}
                </option>
                {subjectFilterOptions.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Chapter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Chapter
              </label>
              <select
                value={filterChapter}
                onChange={handleFilterChapterChange}
                disabled={chapterFilterOptions.length === 0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {chapterFilterOptions.length
                    ? "All Chapters"
                    : "No chapters found"}
                </option>
                {chapterFilterOptions.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
                <Loader2 className="animate-spin" size={18} />
                Loading notes...
              </div>
            ) : notesList.length > 0 ? (
              notesList.map((notes) => (
                <div
                  key={notes.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition cursor-pointer"
                  onClick={() => handleViewNotes(notes)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {notes.subject} - Class {notes.class_standard}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notes.chapter && `Chapter: ${notes.chapter}`}
                        {notes.chapter && notes.topic && " | "}
                        {notes.topic && `Topic: ${notes.topic}`}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notes.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            notes.source === "ai_generated"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {notes.source === "ai_generated" ? "AI" : "Library"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notes.id);
                      }}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No notes found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINotes;
