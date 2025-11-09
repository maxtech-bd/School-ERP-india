import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Sparkles,
  FileText,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const AISummary = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [currentSummary, setCurrentSummary] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    class_standard: "",
    subject: "",
    chapter: "",
    topic: "",
  });

  // Filters
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState(""); // NEW: chapter-wise filter

  const fetchSummaries = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {};
      if (filterClass) params.class_standard = filterClass;
      if (filterSubject) params.subject = filterSubject;
      if (filterChapter) params.chapter = filterChapter; // NEW: send chapter

      const response = await axios.get(`${API}/ai/summary/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.success) {
        setSummaries(response.data.summaries);
      }
    } catch (error) {
      console.error("Fetch summaries error:", error);
    } finally {
      setLoading(false);
    }
  }, [filterClass, filterSubject, filterChapter]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const handleGenerate = async () => {
    if (!formData.class_standard || !formData.subject) {
      toast.error("Please select Class and Subject");
      return;
    }

    setGenerating(true);
    setCurrentSummary(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/ai/summary/generate`, // use API const
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setCurrentSummary(response.data);
        if (response.data.source === "cms") {
          toast.success("Summary loaded from library!");
        } else {
          toast.success("AI Summary generated and saved!");
        }
        fetchSummaries();
      }
    } catch (error) {
      console.error("Generate summary error:", error);
      toast.error(error.response?.data?.detail || "Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (summaryId) => {
    if (!window.confirm("Delete this summary?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/ai/summary/${summaryId}`, {
        // use API const
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Summary deleted");
      fetchSummaries();
      if (currentSummary?.summary_id === summaryId) {
        setCurrentSummary(null);
      }
    } catch (error) {
      console.error("Delete summary error:", error);
      toast.error("Failed to delete summary");
    }
  };

  const handleViewSummary = (summary) => {
    setCurrentSummary({
      summary_id: summary.id,
      content: summary.content,
      source: summary.source,
      class_standard: summary.class_standard,
      subject: summary.subject,
      chapter: summary.chapter,
      topic: summary.topic,
      created_at: summary.created_at,
    });
  };

  const handleDownload = () => {
    if (!currentSummary) return;

    const content = `
${currentSummary.subject} - Class ${currentSummary.class_standard}
${currentSummary.chapter ? `Chapter: ${currentSummary.chapter}` : ""}
${currentSummary.topic ? `Topic: ${currentSummary.topic}` : ""}

${currentSummary.content}

---
Generated: ${new Date(currentSummary.created_at).toLocaleString()}
Source: ${currentSummary.source === "cms" ? "Library" : "AI Generated"}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary_${currentSummary.subject}_${currentSummary.class_standard}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-white" size={32} />
            <h1 className="text-3xl font-bold text-white">
              AI Summary Generator
            </h1>
          </div>
          <p className="text-purple-100">
            Generate comprehensive chapter and topic summaries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Generate Form */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-purple-600" />
              Generate Summary
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
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
                  placeholder="e.g., Motion in a Straight Line"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
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
                  placeholder="e.g., Velocity and Acceleration"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Summary
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Checks library first, generates with AI if needed
              </p>
            </div>
          </div>

          {/* Middle: Summary Display */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText size={20} className="text-purple-600" />
                Summary
              </h2>
              {currentSummary && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  <Download size={18} />
                  Download
                </button>
              )}
            </div>

            {currentSummary ? (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Class:</span>{" "}
                      <span className="text-gray-900">
                        {currentSummary.class_standard}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Subject:
                      </span>{" "}
                      <span className="text-gray-900">
                        {currentSummary.subject}
                      </span>
                    </div>
                    {currentSummary.chapter && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Chapter:
                        </span>{" "}
                        <span className="text-gray-900">
                          {currentSummary.chapter}
                        </span>
                      </div>
                    )}
                    {currentSummary.topic && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Topic:
                        </span>{" "}
                        <span className="text-gray-900">
                          {currentSummary.topic}
                        </span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Source:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          currentSummary.source === "cms"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {currentSummary.source === "cms"
                          ? "Library"
                          : "AI Generated"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentSummary.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <BookOpen size={64} className="mx-auto mb-4 opacity-30" />
                <p>Generate a summary to view it here</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary History */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Summary Library</h2>

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
                placeholder="e.g., Motion in a Straight Line"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
                <Loader2 className="animate-spin" size={18} />
                Loading summaries...
              </div>
            ) : summaries.length > 0 ? (
              summaries.map((summary) => (
                <div
                  key={summary.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition cursor-pointer"
                  onClick={() => handleViewSummary(summary)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {summary.subject} - Class {summary.class_standard}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {summary.chapter && `Chapter: ${summary.chapter}`}
                        {summary.chapter && summary.topic && " | "}
                        {summary.topic && `Topic: ${summary.topic}`}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(summary.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            summary.source === "ai_generated"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {summary.source === "ai_generated" ? "AI" : "Library"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(summary.id);
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
                No summaries found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummary;
