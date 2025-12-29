import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BookOpen,
  Play,
  RefreshCw,
  Send,
  Award,
  Clock,
  Target,
  Pause,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const QuizTool = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(false);

  // Class list from API
  const [classOptions, setClassOptions] = useState([]);
  const [classLoading, setClassLoading] = useState(false);

  // Dynamic subjects from API based on selected class
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Quiz generation filters
  const [filters, setFilters] = useState({
    class_standard: "",
    subject: "",
    chapter: "",
    topic: "",
    difficulty_level: "medium",
    num_questions: 10,
    tags: [],
  });

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [studentResults, setStudentResults] = useState(null);
  const [progressData, setProgressData] = useState(null);

  // Progress UI
  const [selectedProgressSubject, setSelectedProgressSubject] = useState(null);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const difficultyLevels = ["easy", "medium", "hard"];
  const learningTags = [
    "Knowledge",
    "Understanding",
    "Application",
    "Reasoning",
    "Skills",
  ];

  // --------- Fetch Classes from API ----------
  const fetchClasses = async () => {
    try {
      setClassLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const classesFromApi = response.data || [];
      const uniqueById = {};
      classesFromApi.forEach((cls) => {
        if (!uniqueById[cls.id]) {
          uniqueById[cls.id] = cls;
        }
      });
      setClassOptions(Object.values(uniqueById));
    } catch (error) {
      console.error("Failed to fetch classes", error);
      toast.error(
        error.response?.data?.detail || "Failed to load classes from server",
      );
    } finally {
      setClassLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // --------- Fetch Subjects for selected class ----------
  const fetchSubjectsForClass = async (classStandard) => {
    if (!classStandard) {
      setSubjectOptions([]);
      return;
    }
    
    try {
      setSubjectsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/subjects/by-class/${classStandard}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubjectOptions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects for class", error);
      setSubjectOptions([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  // Handle class change - fetch subjects dynamically
  const handleClassChange = (e) => {
    const classStandard = e.target.value;
    setFilters({
      ...filters,
      class_standard: classStandard,
      subject: "",
      chapter: "",
    });
    fetchSubjectsForClass(classStandard);
  };

  // --------- Generate Quiz ----------
  const handleGenerateQuiz = async () => {
    if (
      !filters.class_standard ||
      !filters.subject ||
      !filters.chapter ||
      !filters.chapter.trim()
    ) {
      toast.error("Please select class, subject and chapter");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/quiz/generate`,
        filters,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setCurrentQuiz(response.data);
      setQuizStartTime(new Date().toISOString());
      setAnswers({});
      setResults(null);
      setElapsedTime(0);
      setTimerRunning(true);
      setTimerPaused(false);
      setActiveTab("quiz");
      toast.success(
        `Quiz generated with ${response.data.total_questions} questions!`,
      );
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to generate quiz");
      console.error(error);
    }
    setLoading(false);
  };

  // --------- Submit Quiz ----------
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = currentQuiz.questions.length;

    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} out of ${totalQuestions} questions. Submit anyway?`,
      );
      if (!confirmSubmit) return;
    }

    setTimerRunning(false);
    setTimerPaused(false);

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formattedAnswers = currentQuiz.questions.map((q) => ({
        question_id: q.id,
        student_answer: answers[q.id] || "",
      }));

      const response = await axios.post(
        `${API_BASE_URL}/quiz/submit`,
        {
          quiz_id: currentQuiz.quiz_id,
          answers: formattedAnswers,
          started_at: quizStartTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setResults(response.data);
      setActiveTab("results");
      toast.success(`Quiz submitted! You scored ${response.data.percentage}%`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit quiz");
      console.error(error);
    }
    setLoading(false);
  };

  // --------- Fetch History ----------
  const fetchStudentResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      const response = await axios.get(
        `${API_BASE_URL}/quiz/results/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setStudentResults(response.data);
    } catch (error) {
      toast.error("Failed to fetch quiz history");
      console.error(error);
    }
    setLoading(false);
  };

  // --------- Fetch Progress ----------
  const fetchProgressReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr);

      const response = await axios.get(
        `${API_BASE_URL}/quiz/progress/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setProgressData(response.data || null);

      const subjectList = response.data?.subject_breakdown || [];
      if (subjectList.length > 0) {
        setSelectedProgressSubject(subjectList[0].subject);
      } else {
        setSelectedProgressSubject(null);
      }
    } catch (error) {
      toast.error("Failed to fetch progress report");
      console.error(error);
    }
    setLoading(false);
  };

  // --------- Timer Effect ----------
  useEffect(() => {
    let interval = null;
    if (timerRunning && !timerPaused) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // --------- Tab Change Side Effects ----------
  useEffect(() => {
    if (activeTab !== "quiz" && timerRunning) {
      setTimerRunning(false);
      setTimerPaused(false);
    }

    if (activeTab === "history") {
      fetchStudentResults();
    } else if (activeTab === "progress") {
      fetchProgressReport();
    }
  }, [activeTab, timerRunning]);

  // --------- Progress Helpers ----------
  const subjectChapterCounts =
    progressData && progressData.subject_breakdown
      ? progressData.subject_breakdown.map((subj) => {
          const chaptersForSubject =
            progressData.chapter_breakdown?.filter(
              (ch) => ch.subject === subj.subject,
            ) || [];
          return {
            ...subj,
            chapter_count: chaptersForSubject.length,
          };
        })
      : [];

  const chaptersForSelectedSubject =
    progressData && progressData.chapter_breakdown
      ? progressData.chapter_breakdown.filter((ch) =>
          selectedProgressSubject
            ? ch.subject === selectedProgressSubject
            : true,
        )
      : [];

  // --------- MCQ Option Helper ----------
  const getOptionValueAndLabel = (opt, index) => {
    if (typeof opt === "string") {
      return {
        value: opt,
        label: opt,
        prefix: String.fromCharCode(65 + index),
      };
    }
    const value = opt.id ?? opt.value ?? String.fromCharCode(65 + index);
    const label = opt.text ?? opt.label ?? value;
    const prefix = opt.id ?? String.fromCharCode(65 + index);
    return { value, label, prefix };
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          AI Quiz Tool
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Practice and self-assessment with AI-generated quizzes
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide pb-px">
          <button
            onClick={() => setActiveTab("generate")}
            className={`${
              activeTab === "generate"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0`}
          >
            <Target size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">Generate</span>
            <span className="xs:hidden">Gen</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`${
              activeTab === "quiz"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0`}
            disabled={!currentQuiz}
          >
            <Play size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">Take Quiz</span>
            <span className="xs:hidden">Quiz</span>
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`${
              activeTab === "results"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0`}
            disabled={!results}
          >
            <Award size={16} className="sm:w-[18px] sm:h-[18px]" />
            Results
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`${
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0`}
          >
            <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
            History
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`${
              activeTab === "progress"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0`}
          >
            <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
            Progress
          </button>
        </nav>
      </div>

      {/* Generate Quiz Tab */}
      {activeTab === "generate" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 dark:text-white">Generate Custom Quiz</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {/* Class */}
            <div>
              <label className="block text-sm font-medium mb-2">Class *</label>
              <select
                value={filters.class_standard}
                onChange={handleClassChange}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                disabled={classLoading}
              >
                <option value="">
                  {classLoading ? "Loading classes..." : "Select Class"}
                </option>
                {classOptions.map((c) => (
                  <option key={c.id} value={c.standard}>
                    {c.name || c.standard}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject *
              </label>
              <select
                value={filters.subject}
                onChange={(e) =>
                  setFilters({ ...filters, subject: e.target.value })
                }
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                disabled={!filters.class_standard || subjectsLoading}
              >
                <option value="">
                  {subjectsLoading
                    ? "Loading subjects..."
                    : !filters.class_standard
                    ? "Select class first"
                    : subjectOptions.length === 0
                    ? "No subjects available"
                    : "Select Subject"}
                </option>
                {subjectOptions.map((s) => (
                  <option key={s.id || s.subject_name} value={s.subject_name}>
                    {s.subject_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter – now required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Chapter *
              </label>
              <input
                type="text"
                value={filters.chapter}
                onChange={(e) =>
                  setFilters({ ...filters, chapter: e.target.value })
                }
                placeholder="Enter chapter name or number"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <input
                type="text"
                value={filters.topic}
                onChange={(e) =>
                  setFilters({ ...filters, topic: e.target.value })
                }
                placeholder="Optional"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty Level
              </label>
              <select
                value={filters.difficulty_level}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    difficulty_level: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              >
                {difficultyLevels.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={filters.num_questions}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    num_questions: parseInt(e.target.value || "0", 10),
                  })
                }
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Learning Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Learning Dimensions (Tags)
            </label>
            <div className="flex flex-wrap gap-2">
              {learningTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (filters.tags.includes(tag)) {
                      setFilters({
                        ...filters,
                        tags: filters.tags.filter((t) => t !== tag),
                      });
                    } else {
                      setFilters({
                        ...filters,
                        tags: [...filters.tags, tag],
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    filters.tags.includes(tag)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-600"
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
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </div>
      )}

      {/* Take Quiz Tab */}
      {activeTab === "quiz" && currentQuiz && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold dark:text-white">{currentQuiz.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentQuiz.total_questions} Questions ·{" "}
                {currentQuiz.duration_minutes} Min
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Timer */}
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock size={20} className="text-blue-600" />
                <span className="font-mono font-bold text-lg text-blue-600">
                  {formatTime(elapsedTime)}
                </span>
              </div>

              {/* Pause / Continue */}
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

              {/* Stop Quiz */}
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to stop the quiz? Your progress will not be saved.",
                    )
                  ) {
                    setTimerRunning(false);
                    setTimerPaused(false);
                    setElapsedTime(0);
                    setCurrentQuiz(null);
                    setAnswers({});
                    setActiveTab("generate");
                    toast.info("Quiz stopped");
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Clock size={18} />
                Stop Quiz
              </button>

              {/* Regenerate */}
              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Regenerate
              </button>
            </div>
          </div>

          {timerPaused && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-semibold text-center">
                ⏸ Quiz Paused - Click "Continue" to resume
              </p>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6">
            {currentQuiz.questions.map((q, idx) => {
              const isMCQ =
                q.question_type === "mcq" ||
                (Array.isArray(q.options) && q.options.length > 0);

              return (
                <div key={q.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">
                      Q{idx + 1}. {q.question_text}
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {q.difficulty_level}
                    </span>
                  </div>

                  {isMCQ ? (
                    <div className="space-y-2">
                      {Array.isArray(q.options) && q.options.length > 0 ? (
                        q.options.map((opt, optIdx) => {
                          const { value, label, prefix } =
                            getOptionValueAndLabel(opt, optIdx);
                          const selected = answers[q.id] === value;

                          return (
                            <label
                              key={`${q.id}-${value}`}
                              className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm ${
                                selected
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-400"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={value}
                                checked={selected}
                                onChange={() =>
                                  setAnswers({ ...answers, [q.id]: value })
                                }
                                className="h-4 w-4"
                              />
                              <span className="font-semibold">{prefix}.</span>
                              <span>{label}</span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          No options available for this question.
                        </p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      placeholder="Type your answer here..."
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitQuiz}
            disabled={loading}
            className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && results && (
        <div className="space-y-6">
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
                <div className="text-2xl font-bold">
                  {results.correct_answers}
                </div>
                <div className="text-sm">Correct</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">
                  {results.total_questions - results.correct_answers}
                </div>
                <div className="text-sm">Incorrect</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">
                  {results.time_taken_minutes.toFixed(1)}
                </div>
                <div className="text-sm">Minutes</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Answer Review</h3>
            <div className="space-y-4">
              {results.answers.map((ans) => (
                <div
                  key={ans.question_id}
                  className={`border-l-4 ${
                    ans.is_correct
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-red-500 bg-red-50"
                  } rounded-lg p-4`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      Question {ans.question_number}
                    </h4>
                    <span
                      className={`text-sm font-semibold ${
                        ans.is_correct ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {ans.is_correct ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Your Answer:</span>{" "}
                      {ans.student_answer || "(Not answered)"}
                    </div>
                    {!ans.is_correct && (
                      <div>
                        <span className="font-medium">Correct Answer:</span>{" "}
                        {ans.correct_answer}
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
      {activeTab === "progress" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Progress Report</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading progress data...
            </div>
          ) : progressData &&
            progressData.overall &&
            progressData.overall.total_quizzes > 0 ? (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Overall Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm opacity-90">Total Quizzes</div>
                    <div className="text-3xl font-bold">
                      {progressData.overall.total_quizzes}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Average Score</div>
                    <div className="text-3xl font-bold">
                      {progressData.overall.average_score}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Best Score</div>
                    <div className="text-3xl font-bold">
                      {progressData.overall.best_score}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Accuracy</div>
                    <div className="text-3xl font-bold">
                      {progressData.overall.accuracy}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject-wise list */}
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2">
                  Subject-wise List
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Class ➜ Subjects List
                </p>

                {subjectChapterCounts.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No subject-level data yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {subjectChapterCounts.map((subj) => (
                      <button
                        key={subj.subject}
                        onClick={() => setSelectedProgressSubject(subj.subject)}
                        className={`px-4 py-2 rounded-full border text-sm flex flex-col items-center min-w-[110px] ${
                          selectedProgressSubject === subj.subject
                            ? "bg-black text-white border-black"
                            : "bg-gray-50 text-gray-800 border-gray-300 hover:border-black"
                        }`}
                      >
                        <span className="font-semibold uppercase">
                          {subj.subject}
                        </span>
                        <span className="text-[11px] tracking-wide">
                          {subj.chapter_count || 0}-CHAPTER
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chapter-wise progress */}
              <div>
                <h3 className="text-md font-semibold mb-2">
                  Chapter-wise Progress Graph
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Selected Subject ➜ Chapters List
                </p>

                {chaptersForSelectedSubject.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No chapter data for this subject yet.
                  </p>
                ) : (
                  <div className="border rounded-xl p-4">
                    <div className="flex justify-center mb-4">
                      <div className="px-4 py-2 border rounded-full font-semibold uppercase text-sm bg-gray-50">
                        {selectedProgressSubject} ·{" "}
                        {chaptersForSelectedSubject.length}-CHAPTER
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {chaptersForSelectedSubject.map((chapter, idx) => {
                        const score = chapter.average_score || 0;
                        const ringColor =
                          score >= 80
                            ? "border-green-500"
                            : score >= 60
                              ? "border-blue-500"
                              : "border-orange-500";

                        return (
                          <div
                            key={`${chapter.subject}-${chapter.chapter}-${idx}`}
                            className="flex flex-col items-center text-center"
                          >
                            <div
                              className={`relative w-20 h-20 rounded-full border-4 ${ringColor} flex items-center justify-center bg-gray-50`}
                            >
                              <span className="text-sm font-semibold text-gray-700">
                                {score}%
                              </span>
                            </div>
                            <div className="mt-2 text-xs font-semibold uppercase text-gray-700">
                              {chapter.chapter || `Chapter ${idx + 1}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>
                No quiz data available yet. Complete some quizzes to see your
                progress!
              </p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quiz History</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading history...
            </div>
          ) : studentResults && studentResults.total_quizzes > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {studentResults.total_quizzes}
                  </div>
                  <div className="text-sm text-gray-600">Total Quizzes</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {studentResults.average_score}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {studentResults.highest_score}%
                  </div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                </div>
              </div>

              <div className="space-y-3">
                {studentResults.submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {sub.subject}
                          </h4>
                          {sub.chapter && sub.chapter !== "N/A" && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {sub.chapter}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Date & Time:</span>{" "}
                            {new Date(sub.created_at).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Score:</span>{" "}
                            <span className="text-blue-600 font-semibold">
                              {sub.percentage}%
                            </span>{" "}
                            (Grade: {sub.grade})
                          </div>
                          <div>
                            <span className="font-medium">Correct:</span>{" "}
                            <span className="text-green-600">
                              {sub.correct_answers}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Wrong:</span>{" "}
                            <span className="text-red-600">
                              {sub.wrong_answers}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div
                          className={`text-3xl font-bold ${
                            sub.percentage >= 80
                              ? "text-green-600"
                              : sub.percentage >= 60
                                ? "text-blue-600"
                                : "text-orange-600"
                          }`}
                        >
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
              <p>No quiz attempts yet. Complete a quiz to see your progress!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizTool;
