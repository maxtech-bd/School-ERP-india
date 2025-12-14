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
  FileText,
  Bell,
  Star,
  MessageSquare,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ScrollArea } from './ui/scroll-area';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
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
      roles: ['super_admin', 'admin', 'teacher']
    },
    {
      key: 'students',
      title: 'Students',
      icon: Users,
      roles: ['super_admin', 'admin', 'teacher'],
      subItems: [
        { title: 'Student List', path: '/students', roles: ['super_admin', 'admin', 'teacher'] },
        { title: 'Add Student', path: '/students/add', roles: ['super_admin', 'admin'] },
        { title: 'Bulk Import', path: '/students/import', roles: ['super_admin', 'admin'] }
      ]
    },
    {
      key: 'staff',
      title: 'Staff',
      icon: UserCheck,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      subItems: [
        { title: 'Staff List', path: '/staff', roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { title: 'Add Staff', path: '/staff/add', roles: ['super_admin', 'admin'] }
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
      key: 'calendar',
      title: 'Calendar',
      icon: Calendar,
      path: '/calendar',
      roles: ['super_admin', 'admin', 'teacher', 'student']
    },
    {
      key: 'timetable',
      title: 'TimeTable',
      icon: Clock,
      path: '/settings/timetable',
      roles: ['super_admin', 'admin', 'teacher', 'student']
    },
    {
      key: 'cms',
      title: 'Academic CMS',
      icon: BookOpen,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      subItems: [
        { title: 'Manage Content', path: '/cms', roles: ['super_admin', 'admin'] },
        { title: 'View Content', path: '/cms/view', roles: ['teacher', 'student'] }
      ]
    },
    {
      key: 'ai-assistant',
      title: 'AI Assistant',
      icon: Sparkles,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      subItems: [
        { title: 'Chat Assistant', path: '/ai-assistant', roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { title: 'AI Activity Logs', path: '/ai-assistant/logs', roles: ['super_admin', 'admin'] }
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
      roles: ['super_admin', 'admin'],
      subItems: [
        { title: 'Admission Summary', path: '/admission-summary', roles: ['super_admin', 'admin'] },
        { title: 'All Reports', path: '/reports', roles: ['super_admin', 'admin'] }
      ]
    },
    {
      key: 'communication',
      title: 'Communication',
      icon: MessageSquare,
      roles: ['super_admin', 'admin', 'teacher', 'student'],
      subItems: [
        { title: 'Notifications', path: '/notifications', roles: ['super_admin', 'admin', 'teacher', 'student'] },
        { title: 'Rating & Reviews', path: '/rating-surveys', roles: ['super_admin', 'admin'] }
      ]
    },
    {
      key: 'settings',
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      roles: ['super_admin', 'admin']
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
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
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
                    {item.subItems
                      .filter(subItem => !subItem.roles || subItem.roles.includes(user?.role))
                      .map((subItem, index) => (
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
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 overflow-y-auto">
        <div className="glass-sidebar min-h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative flex w-64 h-full glass-sidebar overflow-y-auto">
            <div className="flex flex-col w-full min-h-full">
              {/* Close button only - no duplicate header */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Sidebar;