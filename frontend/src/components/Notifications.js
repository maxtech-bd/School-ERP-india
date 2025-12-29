import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Users,
  GraduationCap,
  UserCheck,
  Send,
  FileText,
  Calendar,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    notification_type: "custom",
    target_role: "all",
    target_class: "",
    target_section: "",
    target_subject: "",
    priority: "normal",
  });

  const notificationTypes = [
    { value: "timetable_upgrade", label: "Timetable Upgrade", icon: Calendar },
    { value: "exam_date", label: "Exam Date Alert", icon: AlertCircle },
    {
      value: "progress_report",
      label: "Progress Report Update",
      icon: TrendingUp,
    },
    { value: "custom", label: "Custom Notification", icon: FileText },
  ];

  const targetRoles = [
    { value: "all", label: "All Users", icon: Users },
    { value: "admin", label: "Admins Only", icon: UserCheck },
    { value: "teacher", label: "Teachers Only", icon: UserCheck },
    { value: "student", label: "Students Only", icon: GraduationCap },
    { value: "parent", label: "Parents Only", icon: Users },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
  ];

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filterType !== "all") params.append("notification_type", filterType);
      if (filterRole !== "all") params.append("target_role", filterRole);
      if (showUnreadOnly) params.append("unread_only", "true");

      console.log(
        "Fetching notifications from:",
        `${API_BASE_URL}/notifications?${params.toString()}`,
      );
      const response = await axios.get(
        `${API_BASE_URL}/notifications?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Notifications response:", response.data);
      const data = response.data;
      const notificationsArray = Array.isArray(data)
        ? data
        : data.notifications || [];
      console.log(
        "Processed notifications:",
        notificationsArray.length,
        "items",
      );
      setNotifications(notificationsArray);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterRole, showUnreadOnly]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching notification templates...");
      const response = await axios.get(
        `${API_BASE_URL}/notification-templates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Templates response:", response.data);
      const data = response.data;
      const templatesArray = Array.isArray(data) ? data : [];
      console.log("Processed templates:", templatesArray.length, "items");
      setTemplates(templatesArray);
    } catch (error) {
      console.error("Error fetching templates:", error);
      console.error(
        "Template error details:",
        error.response?.data || error.message,
      );
      setTemplates([]);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");

    fetchNotifications();
    fetchUnreadCount();
    fetchTemplates();
    fetchClasses();
  }, [fetchNotifications, fetchUnreadCount, fetchTemplates, fetchClasses]);

  const handleCreateNotification = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Creating notification with data:", formData);
      const response = await axios.post(
        `${API_BASE_URL}/notifications`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Create notification response:", response.data);

      toast.success("Notification created successfully!");
      setIsCreateModalOpen(false);
      resetForm();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error creating notification:", error);
      console.error(
        "Create error details:",
        error.response?.data || error.message,
      );
      toast.error(
        error.response?.data?.detail || "Failed to create notification",
      );
    }
  };

  const handleUpdateNotification = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/notifications/${selectedNotification.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Notification updated successfully!");
      setIsEditModalOpen(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error("Error updating notification:", error);
      toast.error(
        error.response?.data?.detail || "Failed to update notification",
      );
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Notification deleted successfully!");
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(
        error.response?.data?.detail || "Failed to delete notification",
      );
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/notifications/${notificationId}/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("All notifications marked as read");
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleEditClick = (notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      body: notification.body,
      notification_type: notification.notification_type,
      target_role: notification.target_role,
      target_class: notification.target_class || "",
      target_section: notification.target_section || "",
      target_subject: notification.target_subject || "",
      priority: notification.priority,
    });
    setIsEditModalOpen(true);
  };

  const handleTemplateSelect = (templateType) => {
    const template = templates.find((t) => t.template_type === templateType);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        title: template.title_template,
        body: template.body_template,
        notification_type: templateType,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      body: "",
      notification_type: "custom",
      target_role: "all",
      target_class: "",
      target_section: "",
      target_subject: "",
      priority: "normal",
    });
    setSelectedNotification(null);
  };

  const getPriorityBadge = (priority) => {
    const p = priorities.find((pr) => pr.value === priority);
    return p ? p.color : "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type) => {
    const t = notificationTypes.find((nt) => nt.value === type);
    return t ? t.icon : FileText;
  };

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const canManageNotifications = ["admin", "super_admin", "teacher"].includes(
    userRole,
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Bell className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3 text-emerald-600" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage school notifications
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead} className="text-sm">
              <CheckCheck className="h-4 w-4 mr-1" />
              <span className="sm:hidden">Read All</span>
              <span className="hidden sm:inline">Mark All Read ({unreadCount})</span>
            </Button>
          )}
          {canManageNotifications && (
            <Button
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-sm"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="sm:hidden">Create</span>
              <span className="hidden sm:inline">Create Notification</span>
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {canManageNotifications && (
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    {targetRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant={showUnreadOnly ? "default" : "outline"}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`text-xs sm:text-sm ${showUnreadOnly ? "bg-emerald-600" : ""}`}
              >
                {showUnreadOnly ? <Check className="h-4 w-4 mr-1 sm:mr-2" /> : null}
                <span className="hidden sm:inline">Unread Only</span>
                <span className="sm:hidden">Unread</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unread</p>
                <p className="text-2xl font-bold text-orange-600">
                  {unreadCount}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    notifications.filter(
                      (n) => n.priority === "high" || n.priority === "urgent",
                    ).length
                  }
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600">
              No notifications found
            </h3>
            <p className="text-gray-400 mt-2">
              {searchTerm
                ? "Try a different search term"
                : "No notifications to display"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.notification_type);
            return (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${!notification.is_read ? "border-l-4 border-l-emerald-500 bg-emerald-50/30" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div
                        className={`p-2 rounded-lg ${!notification.is_read ? "bg-emerald-100" : "bg-gray-100"}`}
                      >
                        <TypeIcon
                          className={`h-5 w-5 ${!notification.is_read ? "text-emerald-600" : "text-gray-500"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3
                            className={`font-semibold ${!notification.is_read ? "text-gray-900" : "text-gray-700"}`}
                          >
                            {notification.title}
                          </h3>
                          <Badge
                            className={getPriorityBadge(notification.priority)}
                          >
                            {notification.priority}
                          </Badge>
                          {!notification.is_read && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {notification.body}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {targetRoles.find(
                              (r) => r.value === notification.target_role,
                            )?.label || "All"}
                          </span>
                          {notification.created_by_name && (
                            <span>By: {notification.created_by_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {canManageNotifications && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(notification)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2 text-emerald-600" />
              Create Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Use Template</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter notification title"
              />
            </div>

            <div>
              <Label htmlFor="body">Message *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                placeholder="Enter notification message"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Audience</Label>
                <Select
                  value={formData.target_role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, target_role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Filter by Class (Optional)</Label>
              <Select
                value={formData.target_class || "all"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    target_class: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNotification}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              Edit Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter notification title"
              />
            </div>

            <div>
              <Label htmlFor="edit-body">Message *</Label>
              <Textarea
                id="edit-body"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                placeholder="Enter notification message"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Audience</Label>
                <Select
                  value={formData.target_role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, target_role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNotification}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
