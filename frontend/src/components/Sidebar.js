import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  Home,
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
  DollarSign,
  Calculator,
  Award,
  Car,
  BarChart3,
  Fingerprint,
  UserPlus,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  Sparkles,
  Target,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ScrollArea } from './ui/scroll-area';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    {
      key: 'home',
      title: 'Home',
      icon: Home,
      path: '/dashboard',
      roles: ['super_admin', 'admin', 'teacher', 'student', 'parent']
    },
    {
      key: 'admission',
      title: 'Admission Summary',
      icon: GraduationCap,
      path: '/admission-summary',
      roles: ['super_admin', 'admin', 'teacher']
    },
    {
      key: 'students',
      title: 'Students',
      icon: Users,
      roles: ['super_admin', 'admin', 'teacher'],
      subItems: [
        { title: 'Student List', path: '/students' },
        { title: 'Add Student', path: '/students/add' },
        { title: 'Bulk Import', path: '/students/import' },
        { title: 'Photo Upload', path: '/students/photos' },
        { title: 'Attendance', path: '/students/attendance/mark' }
      ]
    },
    {
      key: 'staff',
      title: 'Staff',
      icon: UserCheck,
      roles: ['super_admin', 'admin'],
      subItems: [
        { title: 'Staff List', path: '/staff' },
        { title: 'Add Staff', path: '/staff/add' },
        { title: 'Leave Requests', path: '/staff/leave-requests' },
        { title: 'Attendance', path: '/staff/attendance' }
      ]
    },
    {
      key: 'class',
      title: 'Classes',
      icon: BookOpen,
      path: '/classes',
      roles: ['super_admin', 'admin', 'teacher']
    },
    {
      key: 'attendance',
      title: 'Attendance',
      icon: ClipboardCheck,
      roles: ['super_admin', 'admin', 'teacher'],
      subItems: [
        { title: 'Mark Attendance', path: '/attendance/mark' },
        { title: 'Attendance Report', path: '/attendance/report' }
      ]
    },
    {
      key: 'hss',
      title: 'HSS Module',
      icon: Award,
      roles: ['super_admin', 'admin', 'teacher'],
      subItems: [
        { title: 'Enroll Student', path: '/hss/enroll' },
        { title: 'Admission Register', path: '/hss/register' },
        { title: 'Transfer Certificate', path: '/hss/transfer' },
        { title: 'Conduct Certificate', path: '/hss/conduct' },
        { title: 'Consolidated Report', path: '/hss/consolidated' },
        { title: 'Set Tags', path: '/hss/tags' }
      ]
    },
    {
      key: 'fees',
      title: 'Fees',
      icon: DollarSign,
      roles: ['super_admin', 'admin', 'teacher'],
      subItems: [
        { title: 'Manage Fees', path: '/fees/manage' },
        { title: 'Student Specific', path: '/fees/student-specific' },
        { title: 'Fee Due', path: '/fees/due' },
        { title: 'Select Student', path: '/fees/select-student' },
        { title: 'Fee Collection', path: '/fees/collection' }
      ]
    },
    {
      key: 'accounts',
      title: 'Accounts',
      icon: Calculator,
      path: '/accounts',
      roles: ['super_admin', 'admin']
    },
    {
      key: 'certificates',
      title: 'Certificates',
      icon: Award,
      roles: ['super_admin', 'admin', 'teacher'],
      subItems: [
        { title: 'Course Certificate', path: '/certificates/course' },
        { title: 'Transfer Certificate', path: '/certificates/transfer' },
        { title: 'Progress Report', path: '/certificates/progress' },
        { title: 'Adhar Extract', path: '/certificates/adhar' },
        { title: 'Bonafide', path: '/certificates/bonafide' },
        { title: 'ID Cards', path: '/certificates/id-cards' }
      ]
    },
    {
      key: 'vehicle',
      title: 'Vehicle',
      icon: Car,
      roles: ['super_admin', 'admin'],
      subItems: [
        { title: 'Vehicle Management', path: '/vehicle/manage' },
        { title: 'Vehicle List', path: '/vehicle/list' },
        { title: 'Routes', path: '/vehicle/routes' },
        { title: 'Boarding Points', path: '/vehicle/boarding' },
        { title: 'Student List', path: '/vehicle/students' },
        { title: 'Vehicle Report', path: '/vehicle/report' }
      ]
    },
    {
      key: 'cms',
      title: 'Academic CMS',
      icon: BookOpen,
      roles: ['super_admin', 'admin'],
      subItems: [
        { title: 'Manage Content', path: '/cms' }
      ]
    },
    {
      key: 'ai-assistant',
      title: 'AI Assistant',
      icon: Sparkles,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      subItems: [
        { title: 'Chat Assistant', path: '/ai-assistant' },
        { title: 'AI Activity Logs', path: '/ai-assistant/logs' }
      ]
    },
    {
      key: 'quiz-tool',
      title: 'Quiz Tool',
      icon: Target,
      path: '/quiz-tool',
      roles: ['super_admin', 'admin', 'teacher', 'student']
    },
    {
      key: 'test-generator',
      title: 'Test Generator',
      icon: FileText,
      path: '/test-generator',
      roles: ['super_admin', 'admin', 'teacher']
    },
    {
      key: 'ai-summary',
      title: 'AI Summary',
      icon: BookOpen,
      path: '/ai-summary',
      roles: ['super_admin', 'admin', 'teacher', 'student']
    },
    {
      key: 'ai-notes',
      title: 'AI Notes',
      icon: FileText,
      path: '/ai-notes',
      roles: ['super_admin', 'admin', 'teacher', 'student']
    },
    {
      key: 'reports',
      title: 'Reports',
      icon: BarChart3,
      roles: ['super_admin', 'admin', 'teacher'],
      subItems: [
        { title: 'Admission Report', path: '/reports/admission' },
        { title: 'Login Report', path: '/reports/login' },
        { title: 'Student Information', path: '/reports/students' },
        { title: 'Cross Counting', path: '/reports/cross-count' },
        { title: 'Teacher List', path: '/reports/teachers' },
        { title: 'Attendance Report', path: '/reports/attendance' },
        { title: 'Consolidated Marksheet', path: '/reports/marksheet' },
        { title: 'Staff Attendance', path: '/reports/staff-attendance' }
      ]
    },
    {
      key: 'biometric',
      title: 'Biometric Devices',
      icon: Fingerprint,
      roles: ['super_admin', 'admin'],
      subItems: [
        { title: 'Devices Overview', path: '/biometric/overview' },
        { title: 'Staff List', path: '/biometric/staff' },
        { title: 'Punch Log', path: '/biometric/punch-log' },
        { title: 'Registered Devices', path: '/biometric/devices' },
        { title: 'Calendar', path: '/biometric/calendar' },
        { title: 'Status Report', path: '/biometric/status' }
      ]
    },
    {
      key: 'online-admission',
      title: 'Online Admission',
      icon: UserPlus,
      roles: ['super_admin', 'admin'],
      subItems: [
        { title: 'Online Admission', path: '/online-admission' },
        { title: 'Admission Settings', path: '/online-admission/settings' }
      ]
    },
    {
      key: 'settings',
      title: 'Settings',
      icon: Settings,
      roles: ['super_admin', 'admin'],
      subItems: [
        { title: 'Academic Periods', path: '/settings/academic' },
        { title: 'Manage Classes', path: '/settings/classes' },
        { title: 'Time Table', path: '/settings/timetable' },
        { title: 'Manage Grades', path: '/settings/grades' },
        { title: 'Manage Curriculum', path: '/settings/curriculum' },
        { title: 'Institution Details', path: '/settings/institution' },
        { title: 'Staff Settings', path: '/settings/staff' },
        { title: 'Permissions', path: '/settings/permissions' }
      ]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActiveMenu = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.subItems) {
      return item.subItems.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">School ERP</h1>
            <p className="text-gray-300 text-xs">{user?.full_name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <nav className="py-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveMenu(item);
            const isOpen = openMenus[item.key];

            if (item.subItems) {
              return (
                <Collapsible
                  key={item.key}
                  open={isOpen}
                  onOpenChange={() => toggleMenu(item.key)}
                >
                  <CollapsibleTrigger asChild>
                    <button className={`w-full flex items-center justify-between p-3 rounded-lg transition-all hover:bg-white/10 ${
                      isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-300 hover:text-white'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-2 ml-8">
                    {item.subItems.map((subItem, index) => (
                      <button
                        key={index}
                        onClick={() => handleNavigation(subItem.path)}
                        className={`w-full text-left p-2 rounded-md text-sm transition-all hover:bg-white/10 ${
                          location.pathname === subItem.path
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {subItem.title}
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all hover:bg-white/10 ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        onClick={() => setIsMobileOpen(true)}
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 overflow-y-auto">
        <div className="glass-sidebar min-h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="relative flex w-64 h-full glass-sidebar overflow-y-auto">
            <div className="flex flex-col w-full min-h-full">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold">School ERP</h1>
                    <p className="text-gray-300 text-xs">{user?.full_name}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsMobileOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content offset for desktop */}
      <div className="md:pl-64">
        {/* Content goes here */}
      </div>
    </>
  );
};

export default Sidebar;