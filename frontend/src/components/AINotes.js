import React, { useState, useEffect, useCallback } from "react";
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

const AINotes = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [currentNotes, setCurrentNotes] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    class_standard: "",
    subject: "",
    chapter: "",
    topic: "",
  });

  // Filter state for history
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState(""); // NEW: chapter filter

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {};
      if (filterClass) params.class_standard = filterClass;
      if (filterSubject) params.subject = filterSubject;
      if (filterChapter) params.chapter = filterChapter; // NEW: send chapter param

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/ai/notes/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );

      if (response.data.success) {
        setNotesList(response.data.notes);
      }
    } catch (error) {
      console.error("Fetch notes error:", error);
    } finally {
      setLoading(false);
    }
  }, [filterClass, filterSubject, filterChapter]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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
        `${process.env.REACT_APP_API_URL}/ai/notes/generate`,
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
      toast.error(error.response?.data?.detail || "Failed to generate notes");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (notesId) => {
    if (!window.confirm("Delete these notes?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/ai/notes/${notesId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <select
                  value={formData.class_standard}
                  onChange={(e) =>
                    setFormData({ ...formData, class_standard: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter
                </label>
                <input
                  type="text"
                  value={formData.chapter}
                  onChange={(e) =>
                    setFormData({ ...formData, chapter: e.target.value })
                  }
                  placeholder="e.g., Thermodynamics"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  placeholder="e.g., Laws of Thermodynamics"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Class
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Classes</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Class {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* NEW: Chapter filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Chapter
              </label>
              <input
                type="text"
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
                placeholder="e.g., Thermodynamics"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
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
