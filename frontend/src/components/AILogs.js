import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const AccordionItem = ({ log, isOpen, onToggle, formatDate }) => {
  const tags = log?.tags || {};
  const hasTags = tags.subject || tags.chapter || tags.topic || 
    tags.academic_book || tags.reference_book || 
    tags.qa_knowledge_base || tags.previous_papers;

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex-1 pr-3">
          <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
            {log?.question || "No question recorded"}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {log?.created_at ? formatDate(log.created_at) : "—"}
            </span>
            {log?.source && (
              <span className={`px-2 py-0.5 rounded text-xs ${
                log.source === 'FAQ' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : log.source === 'GPT' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {log.source === 'FAQ' ? '❓ FAQ' : log.source === 'GPT' ? '🤖 GPT' : log.source}
              </span>
            )}
            {log?.user_name && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded text-xs">
                {log.user_name}
              </span>
            )}
          </div>
        </div>
        <div className={`flex-shrink-0 p-1 rounded-full bg-gray-100 dark:bg-gray-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
      </button>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
          {log?.answer && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Answer:
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {log.answer}
              </p>
            </div>
          )}

          {hasTags && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
                📚 Source Tags:
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.subject && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs">
                    Subject: {tags.subject}
                  </span>
                )}
                {tags.chapter && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded text-xs">
                    Chapter: {tags.chapter}
                  </span>
                )}
                {tags.topic && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded text-xs">
                    Topic: {tags.topic}
                  </span>
                )}
                {tags.academic_book && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded text-xs">
                    📖 Academic Book: {tags.academic_book}
                  </span>
                )}
                {tags.reference_book && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded text-xs">
                    📚 Reference Book: {tags.reference_book}
                  </span>
                )}
                {tags.qa_knowledge_base && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 rounded text-xs">
                    ❓ Q&A Knowledge Base
                  </span>
                )}
                {tags.previous_papers && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 rounded text-xs">
                    📝 Previous Papers: {tags.previous_papers}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AILogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(0);

  const [contentSource, setContentSource] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [referenceBook, setReferenceBook] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const [filterOptions, setFilterOptions] = useState({
    content_sources: [],
    subjects: [],
    chapters: [],
    topics: [],
    reference_books: [],
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "20",
        sort_order: sortOrder,
      });

      if (contentSource) params.append("content_source", contentSource);
      if (subject) params.append("subject", subject);
      if (chapter) params.append("chapter", chapter);
      if (topic) params.append("topic", topic);
      if (referenceBook) params.append("reference_book", referenceBook);

      const { data } = await axios.get(
        `${API_BASE_URL}/ai-engine/logs?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setLogs(Array.isArray(data?.logs) ? data.logs : []);
      setPagination(data?.pagination ?? null);
      setExpandedIndex(0);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [
    contentSource,
    subject,
    chapter,
    topic,
    referenceBook,
    sortOrder,
    currentPage,
  ]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (contentSource) params.append("content_source", contentSource);
      if (subject) params.append("subject", subject);
      if (chapter) params.append("chapter", chapter);
      if (referenceBook) params.append("reference_book", referenceBook);

      const { data } = await axios.get(
        `${API_BASE_URL}/ai-engine/log-filters?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const f = data?.filters ?? {};
      setFilterOptions({
        content_sources: Array.isArray(f.content_sources)
          ? f.content_sources
          : [],
        subjects: Array.isArray(f.subjects) ? f.subjects : [],
        chapters: Array.isArray(f.chapters) ? f.chapters : [],
        topics: Array.isArray(f.topics) ? f.topics : [],
        reference_books: Array.isArray(f.reference_books)
          ? f.reference_books
          : [],
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      setFilterOptions({
        content_sources: [],
        subjects: [],
        chapters: [],
        topics: [],
        reference_books: [],
      });
    }
  }, [contentSource, subject, chapter, referenceBook]);

  useEffect(() => {
    fetchFilterOptions();
    fetchLogs();
  }, [fetchFilterOptions, fetchLogs]);

  const resetFilters = () => {
    setContentSource("");
    setSubject("");
    setChapter("");
    setTopic("");
    setReferenceBook("");
    setSortOrder("latest");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleItem = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  const dynamicSources = (filterOptions.content_sources || []).filter(
    (s) => s !== "Academic Book" && s !== "Reference Book",
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg shrink-0">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              AI Activity Logs
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Track AI queries including FAQ questions and GPT interactions
            </p>
          </div>
        </div>
        <Button onClick={resetFilters} variant="outline" className="w-full sm:w-auto text-sm">
          Clear Filters
        </Button>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 dark:text-white">
            <Filter className="h-5 w-5" />
            <span>Filter by Content Source & Tags</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Source
              </label>
              <select
                value={contentSource}
                onChange={(e) => {
                  setContentSource(e.target.value);
                  setSubject("");
                  setChapter("");
                  setTopic("");
                  setReferenceBook("");
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Sources</option>
                <option value="Academic Book">Academic Books</option>
                <option value="Reference Book">Reference Books</option>
                <option value="FAQ">FAQ Questions</option>
                <option value="GPT">GPT Responses</option>
                {dynamicSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setChapter("");
                  setTopic("");
                  setReferenceBook("");
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Subjects</option>
                {(filterOptions.subjects || []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chapter
              </label>
              <select
                value={chapter}
                onChange={(e) => {
                  setChapter(e.target.value);
                  setTopic("");
                  setReferenceBook("");
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Chapters</option>
                {(filterOptions.chapters || []).map((chap) => (
                  <option key={chap} value={chap}>
                    {chap}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic (Optional)
              </label>
              <select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Topics</option>
                {(filterOptions.topics || []).map((top) => (
                  <option key={top} value={top}>
                    {top}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reference Book (Optional)
              </label>
              <select
                value={referenceBook}
                onChange={(e) => {
                  setReferenceBook(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Reference Books</option>
                {(filterOptions.reference_books || []).map((rb) => (
                  <option key={rb} value={rb}>
                    {rb}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="dark:text-white">Activity History</CardTitle>
          {pagination && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {logs.length} of {pagination.total_count}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No activity logs found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <AccordionItem
                  key={index}
                  log={log}
                  isOpen={expandedIndex === index}
                  onToggle={() => toggleItem(index)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.current_page} of {pagination.total_pages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_previous}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
