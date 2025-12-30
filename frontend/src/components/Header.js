import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import i18n from "../i18n";
import axios from "axios";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { Input } from "./ui/input";
import LanguageSwitcher from "./LanguageSwitcher";

const API_BASE_URL = "/api";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [, forceUpdate] = useState(0);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });

  useEffect(() => {
    const handleLanguageChange = () => forceUpdate((n) => n + 1);
    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, []);

  const t = (key) => i18n.t(key);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/notifications?limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = response.data;
      const notificationsArray = Array.isArray(data)
        ? data
        : data.notifications || [];
      setNotifications(notificationsArray.slice(0, 5));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  const fetchAttendanceSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/attendance/summary?type=student`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAttendanceSummary({
        present: response.data.present || 0,
        absent: response.data.absent || 0,
        late: response.data.late || 0,
      });
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    fetchNotifications();
    fetchUnreadCount();
    fetchAttendanceSummary();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
      fetchAttendanceSummary();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount, fetchAttendanceSummary]);

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800",
      admin: "bg-blue-100 text-blue-800",
      teacher: "bg-emerald-100 text-emerald-800",
      student: "bg-purple-100 text-purple-800",
      parent: "bg-orange-100 text-orange-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile hamburger menu - in header */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar - Hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex flex-1 max-w-xs md:max-w-md">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder={t("common.search") + "..."}
                className="pl-10 text-sm bg-gray-50 dark:bg-gray-800 border-0 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Mobile Search Icon - Only on mobile */}
        <div className="sm:hidden flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/search")}
          >
            <Search className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>{t("common.notifications")}</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <DropdownMenuItem className="cursor-pointer py-3">
                      <div
                        className={`flex flex-col space-y-1 ${!notification.is_read ? "font-medium" : ""}`}
                      >
                        <p className="text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                    {index < notifications.length - 1 && (
                      <DropdownMenuSeparator />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <DropdownMenuItem className="text-center text-gray-500">
                  No notifications
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-center cursor-pointer text-emerald-600 hover:text-emerald-700"
                onClick={() => navigate("/notifications")}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {darkMode ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px] sm:max-w-none">
                {user?.full_name}
              </p>
              <div className="flex items-center justify-end space-x-2">
                <Badge
                  variant="secondary"
                  className={`text-[10px] sm:text-xs ${getRoleColor(user?.role)}`}
                >
                  {user?.role?.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={user?.avatar} alt={user?.full_name} />
                    <AvatarFallback className="bg-emerald-500 text-white text-xs sm:text-sm">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.full_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("settings.profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("common.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Quick stats bar - hidden on mobile */}
      <div className="hidden sm:flex items-center space-x-4 sm:space-x-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1 sm:gap-0">
          <span className="font-medium">Today:</span>
          <span className="ml-1 sm:ml-2 text-emerald-600 dark:text-emerald-400">
            {attendanceSummary.present} Present
          </span>
          <span className="mx-1 sm:mx-2">•</span>
          <span className="text-red-600 dark:text-red-400">
            {attendanceSummary.absent} Absent
          </span>
          <span className="mx-1 sm:mx-2">•</span>
          <span className="text-orange-600 dark:text-orange-400">
            {attendanceSummary.late} Late
          </span>
        </div>

        <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden md:block">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
};

export default Header;
