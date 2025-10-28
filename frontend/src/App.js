import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import components
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StaffList from './components/StaffList';
import ClassManagement from './components/ClassManagement';
import AdmissionSummary from './components/AdmissionSummary';
import HSS from './components/HSS';
import Fees from './components/Fees';
import Accounts from './components/Accounts';
import Certificates from './components/Certificates';
import Vehicle from './components/Vehicle';
import Reports from './components/Reports';
import BiometricDevices from './components/BiometricDevices';
import OnlineAdmission from './components/OnlineAdmission';
import Attendance from './components/Attendance';
import StudentAttendance from './components/StudentAttendance';
import Settings from './components/Settings';
import AIAssistant from './components/AIAssistant';
import AILogs from './components/AILogs';
import AcademicCMS from './components/AcademicCMS';
import QuizTool from './components/QuizTool';
import TestGenerator from './components/TestGenerator';
import AISummary from './components/AISummary';
import AINotes from './components/AINotes';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Toaster } from './components/ui/sonner';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
console.log("API URL - ", API)
// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Setup axios interceptor for 401 responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth state and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, tenantId = null) => {
    console.log('🔄 Login function called with:', { username, password: '***', tenantId });
    try {
      console.log('🔄 Making API request to:', `${API}/auth/login`);
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password,
        tenant_id: tenantId
      });

      console.log('✅ Login API response:', response.data);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login API failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Main Layout Component
const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const mainRef = React.useRef(null);
  
  const isLoginPage = location.pathname === '/login';
  
  // Smooth scroll to top on route change
  React.useEffect(() => {
    if (mainRef.current && !isLoginPage) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [location.pathname, isLoginPage]);
  
  if (isLoginPage) {
    return children;
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main ref={mainRef} className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 px-4 py-6 md:px-6 md:py-8">
          <div className="min-h-[calc(100vh-100px)] pb-24">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admission-summary" 
                element={
                  <ProtectedRoute>
                    <AdmissionSummary />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/students/attendance/*" 
                element={
                  <ProtectedRoute>
                    <StudentAttendance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/students/*" 
                element={
                  <ProtectedRoute>
                    <StudentList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff/*" 
                element={
                  <ProtectedRoute>
                    <StaffList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/classes" 
                element={
                  <ProtectedRoute>
                    <ClassManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/attendance/*" 
                element={
                  <ProtectedRoute>
                    <Attendance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hss/*" 
                element={
                  <ProtectedRoute>
                    <HSS />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/fees/*" 
                element={
                  <ProtectedRoute>
                    <Fees />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accounts" 
                element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/certificates/*" 
                element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vehicle/*" 
                element={
                  <ProtectedRoute>
                    <Vehicle />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports/*" 
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/biometric/*" 
                element={
                  <ProtectedRoute>
                    <BiometricDevices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/online-admission/*" 
                element={
                  <ProtectedRoute>
                    <OnlineAdmission />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings/*" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cms" 
                element={
                  <ProtectedRoute>
                    <AcademicCMS />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-assistant" 
                element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-assistant/logs" 
                element={
                  <ProtectedRoute>
                    <AILogs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz-tool" 
                element={
                  <ProtectedRoute>
                    <QuizTool />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test-generator" 
                element={
                  <ProtectedRoute>
                    <TestGenerator />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-summary" 
                element={
                  <ProtectedRoute>
                    <AISummary />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-notes" 
                element={
                  <ProtectedRoute>
                    <AINotes />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
