import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import i18n from "../i18n";
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
  Clock,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState({});
  const [, forceUpdate] = useState(0);
  const [allowedModules, setAllowedModules] = useState(null);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  useEffect(() => {
    const handleLanguageChange = () => forceUpdate((n) => n + 1);
    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, []);

  useEffect(() => {
    const fetchAllowedModules = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setModulesLoaded(true);
          return;
        }

        const response = await fetch("/api/tenant/allowed-modules", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setAllowedModules(data.allowed_modules || []);
        }
      } catch (error) {
        console.error("Error fetching allowed modules:", error);
      } finally {
        setModulesLoaded(true);
      }
    };

    fetchAllowedModules();
  }, [user]);

  const t = (key) => i18n.t(key);

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const menuItems = [
    {
      key: "school-list",
      title: "School List",
      icon: BookOpen,
      path: "/school-list",
      roles: ["super_admin"],
    },
    {
      key: "home",
      title: "Home",
      icon: Home,
      path: "/dashboard",
      roles: ["super_admin", "admin", "teacher"],
    },
    {
      key: "admission-summary",
      title: "Admission Summary",
      icon: ClipboardCheck,
      path: "/admission-summary",
      roles: ["super_admin", "admin"],
    },
    {
      key: "students",
      title: "Students",
      icon: Users,
      roles: ["super_admin", "admin", "teacher"],
      subItems: [
        {
          title: "Student List",
          path: "/students",
          roles: ["super_admin", "admin", "teacher"],
        },
        {
          title: "Add Student",
          path: "/students/add",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Bulk Import",
          path: "/students/import",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "staff",
      title: "Staff",
      icon: UserCheck,
      roles: ["super_admin", "admin", "teacher", "student"],
      subItems: [
        {
          title: "Staff List",
          path: "/staff",
          roles: ["super_admin", "admin", "teacher", "student"],
        },
        {
          title: "Add Staff",
          path: "/staff/add",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "class",
      title: "Classes",
      icon: BookOpen,
      roles: ["super_admin", "admin", "teacher"],
      subItems: [
        {
          title: "Manage Classes",
          path: "/classes",
          roles: ["super_admin", "admin", "teacher"],
        },
        {
          title: "Sections",
          path: "/classes/sections",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Class Subjects",
          path: "/classes/subjects",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "attendance",
      title: "Attendance",
      icon: ClipboardCheck,
      roles: ["super_admin", "admin", "teacher"],
      subItems: [
        {
          title: "Mark Attendance",
          path: "/attendance/mark",
          roles: ["super_admin", "admin", "teacher"],
        },
        {
          title: "View Attendance",
          path: "/attendance",
          roles: ["super_admin", "admin", "teacher"],
        },
        {
          title: "Attendance Reports",
          path: "/attendance/reports",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "results",
      title: "Results",
      icon: FileSpreadsheet,
      roles: [
        "super_admin",
        "admin",
        "principal",
        "teacher",
        "student",
        "parent",
      ],
      subItems: [
        {
          title: "Manage Results",
          path: "/results",
          roles: [
            "super_admin",
            "admin",
            "principal",
            "teacher",
            "student",
            "parent",
          ],
        },
        {
          title: "Configuration",
          path: "/result-configuration",
          roles: ["super_admin", "admin", "principal"],
        },
      ],
    },
    {
      key: "hss-module",
      title: "HSS Module",
      icon: GraduationCap,
      roles: ["super_admin", "admin"],
      subItems: [
        {
          title: "HSS Students",
          path: "/hss/students",
          roles: ["super_admin", "admin"],
        },
        {
          title: "HSS Subjects",
          path: "/hss/subjects",
          roles: ["super_admin", "admin"],
        },
        {
          title: "HSS Results",
          path: "/hss/results",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "fees",
      title: "Fees",
      icon: DollarSign,
      roles: ["super_admin", "admin"],
      subItems: [
        {
          title: "Fee Structure",
          path: "/fees/structure",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Fee Collection",
          path: "/fees/collection",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Fee Reports",
          path: "/fees/reports",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Due Fees",
          path: "/fees/due",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "accounts",
      title: "Accounts",
      icon: Calculator,
      path: "/accounts",
      roles: ["super_admin", "admin"],
    },
    {
      key: "certificates",
      title: "Certificates",
      icon: Award,
      roles: ["super_admin", "admin"],
      subItems: [
        {
          title: "Generate Certificate",
          path: "/certificates/generate",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Certificate Templates",
          path: "/certificates/templates",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Issued Certificates",
          path: "/certificates",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "vehicle",
      title: "Vehicle",
      icon: Car,
      roles: ["super_admin", "admin"],
      subItems: [
        {
          title: "Routes",
          path: "/transport/routes",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Vehicles",
          path: "/transport/vehicles",
          roles: ["super_admin", "admin"],
        },
        {
          title: "Assign Students",
          path: "/transport/assign",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "calendar",
      title: "Calendar",
      icon: Calendar,
      path: "/calendar",
      roles: ["super_admin", "admin", "teacher", "student"],
    },
    {
      key: "timetable",
      title: "TimeTable",
      icon: Clock,
      path: "/settings/timetable",
      roles: ["super_admin", "admin", "teacher", "student"],
    },
    {
      key: "cms",
      title: "Academic CMS",
      icon: BookOpen,
      roles: ["super_admin", "admin", "teacher", "student"],
      subItems: [
        {
          title: "Manage Content",
          path: "/cms",
          roles: ["super_admin", "admin"],
        },
        {
          title: "View Content",
          path: "/cms/view",
          roles: ["teacher", "student"],
        },
      ],
    },
    {
      key: "ai-assistant",
      title: "AI Assistant",
      icon: Sparkles,
      roles: ["super_admin", "admin", "teacher", "student"],
      subItems: [
        {
          title: "Chat Assistant",
          path: "/ai-assistant",
          roles: ["super_admin", "admin", "teacher", "student"],
        },
        {
          title: "AI Activity Logs",
          path: "/ai-assistant/logs",
          roles: ["super_admin", "admin"],
        },
      ],
    },
    {
      key: "quiz-tool",
      title: "Quiz Tool",
      icon: Target,
      path: "/quiz-tool",
      roles: ["super_admin", "admin", "teacher", "student"],
    },
    {
      key: "test-generator",
      title: "Test Generator",
      icon: FileText,
      path: "/test-generator",
      roles: ["super_admin", "admin", "teacher"],
    },
    {
      key: "ai-summary",
      title: "AI Summary",
      icon: BookOpen,
      path: "/ai-summary",
      roles: ["super_admin", "admin", "teacher", "student"],
    },
    {
      key: "ai-notes",
      title: "AI Notes",
      icon: FileText,
      path: "/ai-notes",
      roles: ["super_admin", "admin", "teacher", "student"],
    },
    {
      key: "reports",
      title: "Reports",
      icon: BarChart3,
      roles: ["super_admin", "admin"],
      path: "/reports",
    },
    {
      key: "biometric",
      title: "Biometric Devices",
      icon: Fingerprint,
      path: "/biometric",
      roles: ["super_admin", "admin"],
    },
    {
      key: "online-admission",
      title: "Online Admission",
      icon: UserPlus,
      path: "/online-admission",
      roles: ["super_admin", "admin"],
    },
    {
      key: "settings",
      title: "Settings",
      icon: Settings,
      path: "/settings",
      roles: ["super_admin", "admin"],
    },
    {
      key: "tenant-management",
      title: "Tenant Management",
      icon: Users,
      path: "/tenant-management",
      roles: ["super_admin"],
    },
    {
      key: "communication",
      title: "Communication",
      icon: MessageSquare,
      roles: ["super_admin", "admin", "teacher", "student"],
      subItems: [
        {
          title: "Notifications",
          path: "/notifications",
          roles: ["super_admin", "admin", "teacher", "student"],
        },
        {
          title: "Rating & Reviews",
          path: "/rating-surveys",
          roles: ["super_admin", "admin"],
        },
      ],
    },
  ];

  // Don't show any menu items until modules are loaded (except for super_admin who sees all)
  const filteredMenuItems = menuItems.filter((item) => {
    const hasRole = item.roles.includes(user?.role);

    // Super admin always sees all modules they have role access to
    if (user?.role === "super_admin") {
      return hasRole;
    }

    // For other users, don't show anything until modules are loaded
    if (!modulesLoaded) {
      return false;
    }

    // If no module restrictions set (empty array), show all role-allowed items
    if (!allowedModules || allowedModules.length === 0) {
      return hasRole;
    }

    // Check if this specific module is allowed
    return hasRole && allowedModules.includes(item.key);
  });

  // Flag to show loading state for non-super_admin users
  const isLoadingModules = user?.role !== "super_admin" && !modulesLoaded;

  const isActiveMenu = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.subItems) {
      return item.subItems.some(
        (subItem) => location.pathname === subItem.path,
      );
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
    navigate("/login");
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="bg-emerald-500 p-1.5 sm:p-2 rounded-lg">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-bold text-sm sm:text-lg truncate">School ERP</h1>
            <p className="text-gray-300 text-[10px] sm:text-xs truncate">{user?.full_name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 sm:px-4">
        <nav className="py-3 sm:py-4 space-y-1 sm:space-y-2">
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
                    <button
                      className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all hover:bg-white/10 ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base truncate">{item.title}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1 sm:mt-2 ml-6 sm:ml-8">
                    {item.subItems
                      .filter(
                        (subItem) =>
                          !subItem.roles || subItem.roles.includes(user?.role),
                      )
                      .map((subItem, index) => (
                        <button
                          key={index}
                          onClick={() => handleNavigation(subItem.path)}
                          className={`w-full text-left p-1.5 sm:p-2 rounded-md text-xs sm:text-sm transition-all hover:bg-white/10 ${
                            location.pathname === subItem.path
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "text-gray-400 hover:text-white"
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
                className={`w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-all hover:bg-white/10 ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">{item.title}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-white/10">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 text-sm sm:text-base"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
          {t("common.logout")}
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
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex w-[85%] max-w-64 h-full glass-sidebar overflow-y-auto">
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
