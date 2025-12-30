import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  ExternalLink,
  School,
  Package,
  Calendar,
  IndianRupee,
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
import { Badge } from "./ui/badge";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;
  if (!detail) return "An error occurred";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((e) => e.msg || e.message || JSON.stringify(e)).join(", ");
  }
  return "An error occurred";
};

const SchoolList = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSize, setFilterSize] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    school_name: "",
    school_type: "small",
    package_amount: "",
    is_genuine: false,
  });

  const schoolTypes = [
    { value: "small", label: "Small", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    { value: "large", label: "Large", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  ];

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setSchools(Array.isArray(data) ? data : data.schools || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to load schools");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleCreateSchool = async () => {
    if (!formData.school_name.trim()) {
      toast.error("School name is required");
      return;
    }
    if (!formData.package_amount || formData.package_amount <= 0) {
      toast.error("Valid package amount is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/schools`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("School created successfully!");
      setIsCreateModalOpen(false);
      resetForm();
      fetchSchools();
    } catch (error) {
      console.error("Error creating school:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateSchool = async () => {
    if (!formData.school_name.trim()) {
      toast.error("School name is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/schools/${selectedSchool.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("School updated successfully!");
      setIsEditModalOpen(false);
      resetForm();
      fetchSchools();
    } catch (error) {
      console.error("Error updating school:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteSchool = async (schoolId, isGenuine) => {
    if (isGenuine) {
      toast.error("Genuine schools cannot be deleted");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this dummy school?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/schools/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("School deleted successfully!");
      fetchSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleViewDashboard = (school) => {
    localStorage.setItem("selected_school_id", school.id);
    localStorage.setItem("selected_school_name", school.school_name);
    window.location.href = "/dashboard";
  };

  const handleEditClick = (school) => {
    setSelectedSchool(school);
    setFormData({
      school_name: school.school_name,
      school_type: school.school_type,
      package_amount: school.package_amount,
      is_genuine: school.is_genuine,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      school_name: "",
      school_type: "small",
      package_amount: "",
      is_genuine: false,
    });
    setSelectedSchool(null);
  };

  const getSchoolTypeBadge = (type) => {
    const t = schoolTypes.find((st) => st.value === type);
    return t ? t.color : "bg-gray-100 text-gray-800";
  };

  const filteredSchools = schools.filter((school) => {
    const schoolName = school.school_name || "";
    const matchesSearch = schoolName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "genuine" && school.is_genuine) ||
      (filterType === "dummy" && !school.is_genuine);
    const matchesSize =
      filterSize === "all" || school.school_type === filterSize;
    return matchesSearch && matchesType && matchesSize;
  });

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterSize]);

  const genuineCount = schools.filter((s) => s.is_genuine).length;
  const dummyCount = schools.filter((s) => !s.is_genuine).length;

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3 text-emerald-600" />
            School List
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all ERP-linked schools
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-sm"
        >
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add School</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Schools</p>
                <p className="text-xl sm:text-2xl font-bold dark:text-white">{schools.length}</p>
              </div>
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Genuine</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{genuineCount}</p>
              </div>
              <School className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Demo/Dummy</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{dummyCount}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                <SelectItem value="genuine">Genuine Only</SelectItem>
                <SelectItem value="dummy">Demo Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSize} onValueChange={setFilterSize}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredSchools.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No schools found
            </h3>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              {searchTerm ? "Try a different search term" : "Add your first school"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  School Name
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                  Type
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">
                  Package
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                  Created
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {paginatedSchools.map((school) => (
                <tr key={school.id || school._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 sm:px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {school.school_name || "Unnamed School"}
                      </p>
                      <div className="sm:hidden flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getSchoolTypeBadge(school.school_type)}`}>
                          {school.school_type || "N/A"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ₹{school.package_amount ? school.package_amount.toLocaleString() : "0"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                    <Badge className={getSchoolTypeBadge(school.school_type)}>
                      {school.school_type ? school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1) : "N/A"}
                    </Badge>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                      <IndianRupee className="h-3 w-3 mr-1" />
                      {school.package_amount ? school.package_amount.toLocaleString() : "0"}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {school.created_at
                        ? new Date(school.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <Badge
                      className={
                        school.is_genuine
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                      }
                    >
                      {school.is_genuine ? "Genuine" : "Demo"}
                    </Badge>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDashboard(school)}
                        title="View Dashboard"
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(school)}
                        title="Edit"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!school.is_genuine && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchool(school.id, school.is_genuine)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredSchools.length)} of{" "}
              {filteredSchools.length} schools
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        </>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-emerald-600" />
              Add New School
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="school_name">School Name *</Label>
              <Input
                id="school_name"
                value={formData.school_name}
                onChange={(e) =>
                  setFormData({ ...formData, school_name: e.target.value })
                }
                placeholder="Enter school name"
              />
            </div>

            <div>
              <Label>School Type</Label>
              <Select
                value={formData.school_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, school_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {schoolTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="package_amount">Package Amount (₹) *</Label>
              <Input
                id="package_amount"
                type="number"
                value={formData.package_amount}
                onChange={(e) =>
                  setFormData({ ...formData, package_amount: parseInt(e.target.value) || "" })
                }
                placeholder="Enter package amount"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_genuine"
                checked={formData.is_genuine}
                onChange={(e) =>
                  setFormData({ ...formData, is_genuine: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_genuine">Genuine School (Cannot be deleted)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchool} className="bg-emerald-600 hover:bg-emerald-700">
              Create School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-emerald-600" />
              Edit School
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_school_name">School Name *</Label>
              <Input
                id="edit_school_name"
                value={formData.school_name}
                onChange={(e) =>
                  setFormData({ ...formData, school_name: e.target.value })
                }
                placeholder="Enter school name"
              />
            </div>

            <div>
              <Label>School Type</Label>
              <Select
                value={formData.school_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, school_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {schoolTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit_package_amount">Package Amount (₹) *</Label>
              <Input
                id="edit_package_amount"
                type="number"
                value={formData.package_amount}
                onChange={(e) =>
                  setFormData({ ...formData, package_amount: parseInt(e.target.value) || "" })
                }
                placeholder="Enter package amount"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_genuine"
                checked={formData.is_genuine}
                onChange={(e) =>
                  setFormData({ ...formData, is_genuine: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit_is_genuine">Genuine School (Cannot be deleted)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSchool} className="bg-emerald-600 hover:bg-emerald-700">
              Update School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolList;
