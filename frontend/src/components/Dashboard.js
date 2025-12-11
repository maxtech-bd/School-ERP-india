import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Brain,
  FileQuestion,
  FileText,
  ListChecks,
  Lightbulb,
  TrendingUp,
  Users,
  Activity,
  GraduationCap,
  Download,
  Share2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_API_URL;
const API = BACKEND_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [giniAnalytics, setGiniAnalytics] = useState(null);
  const [timePeriod, setTimePeriod] = useState(7); // 7 or 30 days
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeModule, setActiveModule] = useState("all");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchGiniAnalytics();
    fetchClassesAndSubjects();
  }, [timePeriod, selectedClass, selectedSubject]);

  const fetchGiniAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API}/gini/usage/analytics?days=${timePeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setGiniAnalytics(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch GiNi analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const [classesRes, subjectsRes] = await Promise.all([
        axios.get(`${API}/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch classes/subjects:", error);
    }
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!giniAnalytics || !giniAnalytics.analytics) {
      return {
        totalStudents: 0,
        totalInteractions: 0,
        activeClasses: 0,
        weeklyGrowth: 0,
      };
    }

    const modules = giniAnalytics.analytics;
    const totalInteractions = Object.values(modules).reduce(
      (sum, module) => sum + (module.total_interactions || 0),
      0,
    );

    const uniqueClasses = new Set();
    Object.values(modules).forEach((module) => {
      if (module.class_wise) {
        Object.keys(module.class_wise).forEach((cls) => uniqueClasses.add(cls));
      }
    });

    // Mock growth (ideally from backend)
    const weeklyGrowth = timePeriod === 7 ? 18 : 24;

    return {
      totalStudents: 256, // Mock – swap with backend value when you have it
      totalInteractions,
      activeClasses: uniqueClasses.size,
      weeklyGrowth,
    };
  };

  // Usage trend chart
  const getUsageTrendData = () => {
    if (!giniAnalytics || !giniAnalytics.analytics) return [];

    const dateLabels = giniAnalytics.date_labels || [];
    const modules = giniAnalytics.analytics;

    return dateLabels.map((date, index) => {
      const dataPoint = { date };

      if (activeModule === "all") {
        Object.entries(modules).forEach(([moduleName, moduleData]) => {
          const dailyData = moduleData.daily || [];
          dataPoint[moduleName] = dailyData[index] || 0;
        });
        dataPoint.total = Object.values(dataPoint).reduce(
          (sum, val) => (typeof val === "number" ? sum + val : sum),
          0,
        );
      } else {
        const moduleData = modules[activeModule];
        if (moduleData && moduleData.daily) {
          dataPoint.interactions = moduleData.daily[index] || 0;
        }
      }

      return dataPoint;
    });
  };

  // Class-wise bar chart
  const getClassWiseData = () => {
    if (!giniAnalytics || !giniAnalytics.analytics) return [];

    const classData = {};
    Object.values(giniAnalytics.analytics).forEach((module) => {
      if (module.class_wise) {
        Object.entries(module.class_wise).forEach(([cls, count]) => {
          if (selectedClass === "all" || cls === selectedClass) {
            classData[cls] = (classData[cls] || 0) + count;
          }
        });
      }
    });

    return Object.entries(classData)
      .map(([name, value]) => ({ name: `Class ${name}`, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Subject-wise bar chart
  const getSubjectWiseData = () => {
    if (!giniAnalytics || !giniAnalytics.analytics) return [];

    const subjectData = {};
    Object.values(giniAnalytics.analytics).forEach((module) => {
      if (module.subject_wise) {
        Object.entries(module.subject_wise).forEach(([subject, count]) => {
          if (selectedSubject === "all" || subject === selectedSubject) {
            subjectData[subject] = (subjectData[subject] || 0) + count;
          }
        });
      }
    });

    return Object.entries(subjectData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Table data
  const getTableData = () => {
    if (!giniAnalytics || !giniAnalytics.analytics) return [];

    const tableRows = [];
    const modules = giniAnalytics.analytics;

    Object.values(modules).forEach((module) => {
      if (module.class_wise && module.subject_wise) {
        Object.entries(module.class_wise).forEach(([cls]) => {
          Object.entries(module.subject_wise).forEach(
            ([subject, interactions]) => {
              if (
                (selectedClass === "all" || cls === selectedClass) &&
                (selectedSubject === "all" || subject === selectedSubject)
              ) {
                tableRows.push({
                  class: cls,
                  subject,
                  totalInteractions: interactions,
                  activeStudents: Math.floor(interactions / 3), // Mock
                });
              }
            },
          );
        });
      }
    });

    return tableRows.slice(0, 20);
  };

  const handleExport = (format) => {
    toast.info(`Exporting report as ${format}... (Feature coming soon)`);
  };

  const stats = getSummaryStats();
  const usageTrendData = getUsageTrendData();
  const classWiseData = getClassWiseData();
  const subjectWiseData = getSubjectWiseData();
  const tableData = getTableData();

  const modules = [
    {
      id: "all",
      name: "All Modules",
      icon: Activity,
      color: "bg-gray-100 text-gray-700",
    },
    {
      id: "ai_assistant",
      name: "AI Assistant",
      icon: Brain,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: "quiz",
      name: "Quiz",
      icon: FileQuestion,
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "test_generator",
      name: "Test Generator",
      icon: ListChecks,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "summary",
      name: "Summary",
      icon: FileText,
      color: "bg-orange-100 text-orange-700",
    },
    {
      id: "notes",
      name: "Notes",
      icon: Lightbulb,
      color: "bg-pink-100 text-pink-700",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            GiNi School Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Academic Year 2024-25 | Admin Profile
          </p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
        {/* Time period */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Time Period:
          </label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={timePeriod}
            onChange={(e) => setTimePeriod(Number(e.target.value))}
          >
            <option value={7}>Week</option>
            <option value={30}>Month</option>
          </select>
        </div>

        {/* Class filter – from API */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Class:</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => {
              // backend usually exposes standard & name
              const value = cls.standard?.toString() || cls.name;
              if (!value) return null;
              return (
                <option key={cls.id} value={value}>
                  {cls.name || `Class ${value}`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Subject filter – from API */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Subject:</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {subjects.map((subj) => {
              const value =
                subj.name || subj.title || subj.subject_name || subj.code;
              if (!value) return null;
              return (
                <option key={subj.id} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Total Students Using AI
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Total AI Interactions
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.totalInteractions.toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0 ml-2">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Active Classes
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.activeClasses}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-100 rounded-full flex-shrink-0 ml-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  Weekly Growth
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 mt-1 sm:mt-2">
                  +{stats.weeklyGrowth}%
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-100 rounded-full flex-shrink-0 ml-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Tabs */}
      <div className="flex flex-wrap gap-2">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Button
              key={module.id}
              variant={activeModule === module.id ? "default" : "outline"}
              className={`${
                activeModule === module.id ? module.color : "bg-white"
              } font-medium`}
              onClick={() => setActiveModule(module.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {module.name}
            </Button>
          );
        })}
      </div>

      {/* Charts Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="h-48 sm:h-56 lg:h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Line Chart - Usage Trend */}
          <Card className="shadow-md">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Usage Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={200} className="sm:h-[220px] lg:h-[250px]">
                <LineChart data={usageTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9 }} width={30} />
                  <Tooltip />
                  {activeModule === "all" ? (
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                    />
                  ) : (
                    <Line
                      type="monotone"
                      dataKey="interactions"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Class-wise Chart */}
          <Card className="shadow-md">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Class-wise Usage</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={200} className="sm:h-[220px] lg:h-[250px]">
                <BarChart data={classWiseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9 }} width={30} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject-wise Chart */}
          <Card className="shadow-md md:col-span-2 lg:col-span-1">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Subject-wise Usage</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={200} className="sm:h-[220px] lg:h-[250px]">
                <BarChart data={subjectWiseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9 }} width={30} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card className="shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[400px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700">
                    Class
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700">
                    Subject
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 hidden sm:table-cell">
                    Total Interactions
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 sm:hidden">
                    Total
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 hidden sm:table-cell">
                    Active Students
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 sm:hidden">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 sm:p-3">Class {row.class}</td>
                      <td className="p-2 sm:p-3 max-w-[100px] sm:max-w-none truncate">{row.subject}</td>
                      <td className="p-2 sm:p-3 font-medium">
                        {row.totalInteractions}
                      </td>
                      <td className="p-2 sm:p-3">{row.activeStudents}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 sm:p-6 text-center text-gray-500">
                      No data available for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          className="gap-2 text-xs sm:text-sm"
          onClick={() => handleExport("PDF")}
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          Export PDF
        </Button>
        <Button
          variant="outline"
          className="gap-2 text-xs sm:text-sm"
          onClick={() => handleExport("Excel")}
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          Export Excel
        </Button>
        <Button
          variant="outline"
          className="gap-2 text-xs sm:text-sm"
          onClick={() => handleExport("Share")}
        >
          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
          Share Report
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
