import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MessageSquare,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  ListChecks,
  Send,
  Eye,
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

const RatingSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [pendingSurveys, setPendingSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isViewResponsesModalOpen, setIsViewResponsesModalOpen] =
    useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyResponses, setSurveyResponses] = useState(null);
  const [userRole, setUserRole] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    survey_type: "rating_text",
    target_role: "all",
    target_class: "",
    is_mandatory: true,
    rating_scale: 5,
    text_required: false,
    text_placeholder: "Share your feedback...",
    mcq_options: [],
  });

  const [responseData, setResponseData] = useState({
    rating: 0,
    text_response: "",
    mcq_responses: [],
  });

  const surveyTypes = [
    { value: "rating_text", label: "Rating + Text", icon: Star },
    { value: "rating_only", label: "Rating Only", icon: Star },
    { value: "mcq", label: "Multiple Choice", icon: ListChecks },
  ];

  const targetRoles = [
    { value: "all", label: "All Users" },
    { value: "admin", label: "Admins" },
    { value: "teacher", label: "Teachers" },
    { value: "student", label: "Students" },
  ];

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/rating-surveys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setSurveys(Array.isArray(data) ? data : data.surveys || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      toast.error("Failed to load surveys");
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingSurveys = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/rating-surveys/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = response.data;
      setPendingSurveys(Array.isArray(data) ? data : data.surveys || []);
    } catch (error) {
      console.error("Error fetching pending surveys:", error);
      setPendingSurveys([]);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");

    fetchSurveys();
    fetchPendingSurveys();
  }, [fetchSurveys, fetchPendingSurveys]);

  const handleCreateSurvey = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (formData.survey_type === "mcq" && formData.mcq_options.length < 2) {
      toast.error("MCQ surveys need at least 2 options");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/rating-surveys`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Survey created successfully!");
      setIsCreateModalOpen(false);
      resetForm();
      fetchSurveys();
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error(error.response?.data?.detail || "Failed to create survey");
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/rating-surveys/${surveyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Survey deleted successfully!");
      fetchSurveys();
    } catch (error) {
      console.error("Error deleting survey:", error);
      toast.error(error.response?.data?.detail || "Failed to delete survey");
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedSurvey) return;

    const surveyType = selectedSurvey.survey_type;

    if (surveyType !== "mcq" && responseData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (
      surveyType === "rating_text" &&
      selectedSurvey.text_required &&
      !responseData.text_response.trim()
    ) {
      toast.error("Please provide your feedback");
      return;
    }

    if (surveyType === "mcq" && responseData.mcq_responses.length === 0) {
      toast.error("Please select an option");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/rating-surveys/${selectedSurvey.id}/respond`,
        responseData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Response submitted successfully!");
      setIsResponseModalOpen(false);
      resetResponseData();
      fetchSurveys();
      fetchPendingSurveys();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error(error.response?.data?.detail || "Failed to submit response");
    }
  };

  const handleViewResponses = async (survey) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/rating-surveys/${survey.id}/responses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSurveyResponses(response.data);
      setSelectedSurvey(survey);
      setIsViewResponsesModalOpen(true);
    } catch (error) {
      console.error("Error fetching responses:", error);
      toast.error("Failed to load responses");
    }
  };

  const handleRespondClick = (survey) => {
    setSelectedSurvey(survey);
    resetResponseData();
    setIsResponseModalOpen(true);
  };

  const addMcqOption = () => {
    setFormData((prev) => ({
      ...prev,
      mcq_options: [
        ...prev.mcq_options,
        { id: Date.now().toString(), text: "", order: prev.mcq_options.length },
      ],
    }));
  };

  const updateMcqOption = (index, text) => {
    setFormData((prev) => {
      const newOptions = [...prev.mcq_options];
      newOptions[index] = { ...newOptions[index], text };
      return { ...prev, mcq_options: newOptions };
    });
  };

  const removeMcqOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      mcq_options: prev.mcq_options.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      survey_type: "rating_text",
      target_role: "all",
      target_class: "",
      is_mandatory: true,
      rating_scale: 5,
      text_required: false,
      text_placeholder: "Share your feedback...",
      mcq_options: [],
    });
  };

  const resetResponseData = () => {
    setResponseData({
      rating: 0,
      text_response: "",
      mcq_responses: [],
    });
  };

  const renderStars = (rating, maxRating, onClick, size = "md") => {
    const sizeClass =
      size === "lg" ? "h-8 w-8" : size === "sm" ? "h-4 w-4" : "h-6 w-6";
    return (
      <div className="flex space-x-1">
        {[...Array(maxRating)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} cursor-pointer transition-colors ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onClick && onClick(i + 1)}
          />
        ))}
      </div>
    );
  };

  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (survey.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const canManageSurveys = ["admin", "super_admin", "teacher"].includes(
    userRole,
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Star className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3 text-yellow-500" />
            Rating & Reviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Collect feedback through surveys
          </p>
        </div>
        {canManageSurveys && (
          <Button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-sm"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Create Survey</span>
          </Button>
        )}
      </div>

      {pendingSurveys.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-orange-700">
              <Clock className="h-5 w-5 mr-2" />
              Pending Surveys ({pendingSurveys.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                >
                  <div>
                    <h4 className="font-medium">{survey.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {survey.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRespondClick(survey)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Respond Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Surveys</p>
                <p className="text-2xl font-bold">{surveys.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Response</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingSurveys.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {surveys.filter((s) => s.has_responded).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Responses</p>
                <p className="text-2xl font-bold">
                  {surveys.reduce(
                    (acc, s) => acc + (s.responses_count || 0),
                    0,
                  )}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredSurveys.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No surveys found
            </h3>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              {searchTerm
                ? "Try a different search term"
                : "No surveys to display"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        survey.survey_type === "rating_text"
                          ? "bg-purple-100 text-purple-800"
                          : survey.survey_type === "rating_only"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }
                    >
                      {
                        surveyTypes.find((t) => t.value === survey.survey_type)
                          ?.label
                      }
                    </Badge>
                    {survey.is_mandatory && (
                      <Badge className="bg-red-100 text-red-800">
                        Required
                      </Badge>
                    )}
                  </div>
                  {survey.has_responded && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2">{survey.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {survey.description || "No description provided"}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {
                      targetRoles.find((r) => r.value === survey.target_role)
                        ?.label
                    }
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {survey.responses_count || 0} responses
                  </span>
                </div>

                {survey.average_rating > 0 && survey.survey_type !== "mcq" && (
                  <div className="flex items-center space-x-2 mb-4">
                    {renderStars(
                      Math.round(survey.average_rating),
                      survey.rating_scale,
                      null,
                      "sm",
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({survey.average_rating.toFixed(1)})
                    </span>
                  </div>
                )}

                <div className="flex space-x-2">
                  {!survey.has_responded && (
                    <Button
                      onClick={() => handleRespondClick(survey)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Respond
                    </Button>
                  )}
                  {canManageSurveys && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleViewResponses(survey)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Create Survey
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter survey title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter survey description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Survey Type</Label>
                <Select
                  value={formData.survey_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, survey_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {surveyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            {formData.survey_type !== "mcq" && (
              <div>
                <Label>Rating Scale</Label>
                <Select
                  value={formData.rating_scale.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rating_scale: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">1-5 Stars</SelectItem>
                    <SelectItem value="10">1-10 Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.survey_type === "rating_text" && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="text_required"
                    checked={formData.text_required}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        text_required: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="text_required">
                    Text feedback is required
                  </Label>
                </div>
                <div>
                  <Label>Text Placeholder</Label>
                  <Input
                    value={formData.text_placeholder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        text_placeholder: e.target.value,
                      })
                    }
                    placeholder="Placeholder text for feedback input"
                  />
                </div>
              </>
            )}

            {formData.survey_type === "mcq" && (
              <div>
                <Label className="mb-2 block">MCQ Options</Label>
                <div className="space-y-2">
                  {formData.mcq_options.map((option, index) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <span className="text-sm text-gray-500 w-6">
                        {index + 1}.
                      </span>
                      <Input
                        value={option.text}
                        onChange={(e) => updateMcqOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMcqOption(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addMcqOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_mandatory"
                checked={formData.is_mandatory}
                onChange={(e) =>
                  setFormData({ ...formData, is_mandatory: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_mandatory">Mandatory response required</Label>
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
              onClick={handleCreateSurvey}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Create Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-emerald-600" />
              {selectedSurvey?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-6">
              {selectedSurvey.description && (
                <p className="text-gray-600">{selectedSurvey.description}</p>
              )}

              {selectedSurvey.survey_type !== "mcq" && (
                <div className="text-center">
                  <Label className="block mb-4">Rate your experience</Label>
                  <div className="flex justify-center">
                    {renderStars(
                      responseData.rating,
                      selectedSurvey.rating_scale,
                      (rating) => {
                        setResponseData((prev) => ({ ...prev, rating }));
                      },
                      "lg",
                    )}
                  </div>
                  {responseData.rating > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      {selectedSurvey.rating_labels?.[responseData.rating - 1]
                        ?.label ||
                        `${responseData.rating} of ${selectedSurvey.rating_scale}`}
                    </p>
                  )}
                </div>
              )}

              {selectedSurvey.survey_type === "rating_text" && (
                <div>
                  <Label>
                    Your Feedback {selectedSurvey.text_required && "*"}
                  </Label>
                  <Textarea
                    value={responseData.text_response}
                    onChange={(e) =>
                      setResponseData((prev) => ({
                        ...prev,
                        text_response: e.target.value,
                      }))
                    }
                    placeholder={selectedSurvey.text_placeholder}
                    rows={4}
                  />
                </div>
              )}

              {selectedSurvey.survey_type === "mcq" && (
                <div>
                  <Label className="block mb-3">Select your answer</Label>
                  <div className="space-y-2">
                    {selectedSurvey.mcq_options?.map((option, index) => (
                      <label
                        key={option.id || index}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          responseData.mcq_responses.includes(
                            option.id || option.text,
                          )
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type={
                            selectedSurvey.mcq_allow_multiple
                              ? "checkbox"
                              : "radio"
                          }
                          name="mcq_response"
                          value={option.id || option.text}
                          checked={responseData.mcq_responses.includes(
                            option.id || option.text,
                          )}
                          onChange={(e) => {
                            const value = option.id || option.text;
                            if (selectedSurvey.mcq_allow_multiple) {
                              setResponseData((prev) => ({
                                ...prev,
                                mcq_responses: e.target.checked
                                  ? [...prev.mcq_responses, value]
                                  : prev.mcq_responses.filter(
                                      (v) => v !== value,
                                    ),
                              }));
                            } else {
                              setResponseData((prev) => ({
                                ...prev,
                                mcq_responses: [value],
                              }));
                            }
                          }}
                          className="mr-3"
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResponseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isViewResponsesModalOpen}
        onOpenChange={setIsViewResponsesModalOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Survey Responses - {selectedSurvey?.title}
            </DialogTitle>
          </DialogHeader>
          {surveyResponses && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {surveyResponses.stats.total_responses}
                    </p>
                    <p className="text-sm text-gray-500">Total Responses</p>
                  </CardContent>
                </Card>
                {selectedSurvey?.survey_type !== "mcq" && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {surveyResponses.stats.average_rating.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-500">Average Rating</p>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {(
                        (surveyResponses.stats.total_responses /
                          (surveys.length || 1)) *
                        100
                      ).toFixed(0)}
                      %
                    </p>
                    <p className="text-sm text-gray-500">Response Rate</p>
                  </CardContent>
                </Card>
              </div>

              {selectedSurvey?.survey_type !== "mcq" &&
                surveyResponses.stats.rating_distribution && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Rating Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(
                          surveyResponses.stats.rating_distribution,
                        )
                          .reverse()
                          .map(([rating, count]) => (
                            <div
                              key={rating}
                              className="flex items-center space-x-3"
                            >
                              <span className="w-8 text-sm">{rating}</span>
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-yellow-400 h-3 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      surveyResponses.stats.total_responses > 0
                                        ? (count /
                                            surveyResponses.stats
                                              .total_responses) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="w-12 text-sm text-gray-500">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Individual Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {surveyResponses.responses.map((response, index) => (
                      <div
                        key={response.id || index}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {response.user_name}
                          </span>
                          <Badge>{response.user_role}</Badge>
                        </div>
                        {response.rating && (
                          <div className="flex items-center space-x-2 mb-2">
                            {renderStars(
                              response.rating,
                              selectedSurvey?.rating_scale || 5,
                              null,
                              "sm",
                            )}
                          </div>
                        )}
                        {response.text_response && (
                          <p className="text-sm text-gray-600">
                            {response.text_response}
                          </p>
                        )}
                        {response.mcq_responses?.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Selected: {response.mcq_responses.join(", ")}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(response.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewResponsesModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatingSurveys;
