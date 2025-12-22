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

  /* ================= LANGUAGE ================= */
  useEffect(() => {
    const handleLanguageChange = () => forceUpdate((n) => n + 1);
    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, []);

  /* ================= MODULE PERMISSION ================= */
  useEffect(() => {
    const fetchAllowedModules = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setModulesLoaded(true);

        const res = await fetch("/api/tenant/allowed-modules", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setAllowedModules(data.allowed_modules || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setModulesLoaded(true);
      }
    };

    fetchAllowedModules();
  }, [user]);

  const t = (key) => i18n.t(key);

  const toggleMenu = (key) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  /* ================= MENU CONFIG ================= */
  const menuItems = [
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
      key: "settings",
      title: "Settings",
      icon: Settings,
      path: "/settings",
      roles: ["super_admin", "admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles.includes(user?.role)) return false;
    if (user?.role === "super_admin") return true;
    if (!modulesLoaded) return false;
    if (!allowedModules || allowedModules.length === 0) return true;
    return allowedModules.includes(item.key);
  });

  const isActiveMenu = (item) =>
    item.path
      ? location.pathname === item.path
      : item.subItems?.some((s) => location.pathname === s.path);

  /* ================= SIDEBAR CONTENT ================= */
  const SidebarContent = () => (
    <div className="flex flex-col h-full w-64 bg-gray-900 text-white shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">School ERP</h1>
            <p className="text-xs text-gray-300">{user?.full_name}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <ScrollArea className="flex-1 px-3">
        <nav className="py-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveMenu(item);
            const open = openMenus[item.key];

            if (item.subItems) {
              return (
                <Collapsible
                  key={item.key}
                  open={open}
                  onOpenChange={() => toggleMenu(item.key)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={`w-full flex items-center justify-between p-3 rounded-lg
                        ${active ? "bg-emerald-500/20 text-emerald-300" : "text-gray-300 hover:bg-white/10"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.title}
                      </div>
                      {open ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-8 mt-2 space-y-1">
                    {item.subItems.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => handleNavigation(sub.path)}
                        className={`block w-full text-left p-2 rounded-md text-sm
                          ${
                            location.pathname === sub.path
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "text-gray-400 hover:bg-white/10"
                          }`}
                      >
                        {sub.title}
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
                className={`w-full flex items-center gap-3 p-3 rounded-lg
                  ${active ? "bg-emerald-500/20 text-emerald-300" : "text-gray-300 hover:bg-white/10"}`}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-300 hover:bg-white/10"
        >
          <LogOut className="h-5 w-5 mr-3" />
          {t("common.logout")}
        </Button>
      </div>
    </div>
  );

  /* ================= RENDER ================= */
  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex">
        <SidebarContent />
      </aside>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0">
            <SidebarContent />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X size={20} />
            </button>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
