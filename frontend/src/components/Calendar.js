import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { 
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Star,
  PartyPopper,
  GraduationCap,
  Flag,
  Clock,
  MapPin,
  Users,
  Filter
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Calendar = () => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isViewEventModalOpen, setIsViewEventModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    event_type: 'holiday',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    is_all_day: true,
    color: '#10b981'
  });
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  
  const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role || 'student';
  const canManageEvents = ['super_admin', 'admin'].includes(userRole);
  
  const eventTypes = [
    { value: 'holiday', label: 'Holiday', color: '#ef4444', icon: Sun },
    { value: 'school_event', label: 'School Event', color: '#3b82f6', icon: GraduationCap },
    { value: 'function', label: 'Function/Program', color: '#8b5cf6', icon: PartyPopper },
    { value: 'exam', label: 'Examination', color: '#f59e0b', icon: Star },
    { value: 'meeting', label: 'Meeting', color: '#06b6d4', icon: Users },
    { value: 'sports', label: 'Sports Event', color: '#22c55e', icon: Flag },
    { value: 'cultural', label: 'Cultural Event', color: '#ec4899', icon: Moon },
    { value: 'other', label: 'Other', color: '#6b7280', icon: CalendarIcon }
  ];
  
  useEffect(() => {
    fetchEvents();
  }, [currentDate]);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await axios.get(`${API_BASE_URL}/calendar/events?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load calendar events');
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddEvent = async () => {
    if (!eventFormData.title || !eventFormData.start_date) {
      toast.error('Please fill in required fields');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/calendar/events`, eventFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Event added successfully!');
      setIsAddEventModalOpen(false);
      resetEventForm();
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error(error.response?.data?.detail || 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/calendar/events/${selectedEvent.id}`, eventFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Event updated successfully!');
      setIsEditEventModalOpen(false);
      setSelectedEvent(null);
      resetEventForm();
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.detail || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/calendar/events/${selectedEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Event deleted successfully!');
      setIsDeleteConfirmModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };
  
  const resetEventForm = () => {
    setEventFormData({
      title: '',
      description: '',
      event_type: 'holiday',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      location: '',
      is_all_day: true,
      color: '#10b981'
    });
  };
  
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date || event.start_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
      is_all_day: event.is_all_day,
      color: event.color || '#10b981'
    });
    setIsEditEventModalOpen(true);
  };
  
  const openDeleteConfirm = (event) => {
    setSelectedEvent(event);
    setIsDeleteConfirmModalOpen(true);
  };
  
  const openViewEvent = (event) => {
    setSelectedEvent(event);
    setIsViewEventModalOpen(true);
  };
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true });
    }
    
    return days;
  };
  
  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return events.filter(event => {
      const startDate = event.start_date;
      const endDate = event.end_date || event.start_date;
      return dateStr >= startDate && dateStr <= endDate;
    }).filter(event => filterType === 'all' || event.event_type === filterType);
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const getEventTypeInfo = (type) => {
    return eventTypes.find(t => t.value === type) || eventTypes[eventTypes.length - 1];
  };
  
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const days = getDaysInMonth(currentDate);
  
  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.event_type === filterType);
  
  const upcomingEvents = [...filteredEvents]
    .filter(e => new Date(e.start_date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-emerald-600" />
            School Calendar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            View holidays, events, and important dates
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {eventTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canManageEvents && (
            <Button onClick={() => setIsAddEventModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2 text-sm">
                    {day}
                  </div>
                ))}
                
                {days.map((dayObj, index) => {
                  const dayEvents = getEventsForDay(dayObj.day);
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-1 border dark:border-gray-700 rounded-lg transition-all ${
                        dayObj.isCurrentMonth 
                          ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' 
                          : 'bg-gray-50 dark:bg-gray-900'
                      } ${isToday(dayObj.day) ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : ''}`}
                    >
                      {dayObj.day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isToday(dayObj.day) ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {dayObj.day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event, idx) => {
                              const typeInfo = getEventTypeInfo(event.event_type);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => openViewEvent(event)}
                                  className="text-xs p-1 rounded cursor-pointer truncate hover:opacity-80"
                                  style={{ 
                                    backgroundColor: `${typeInfo.color}20`,
                                    color: typeInfo.color,
                                    borderLeft: `3px solid ${typeInfo.color}`
                                  }}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              );
                            })}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eventTypes.map(type => {
                  const Icon = type.icon;
                  const count = events.filter(e => e.event_type === type.value).length;
                  return (
                    <div 
                      key={type.value}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setFilterType(filterType === type.value ? 'all' : type.value)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="p-1.5 rounded"
                          style={{ backgroundColor: `${type.color}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: type.color }} />
                        </div>
                        <span className="text-sm">{type.label}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const typeInfo = getEventTypeInfo(event.event_type);
                    const Icon = typeInfo.icon;
                    return (
                      <div 
                        key={event.id}
                        className="p-3 rounded-lg border hover:shadow-sm cursor-pointer transition-all"
                        onClick={() => openViewEvent(event)}
                      >
                        <div className="flex items-start gap-2">
                          <div 
                            className="p-1.5 rounded mt-0.5"
                            style={{ backgroundColor: `${typeInfo.color}20` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: typeInfo.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{event.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(event.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isAddEventModalOpen} onOpenChange={setIsAddEventModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Event Title *</Label>
              <Input
                value={eventFormData.title}
                onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label>Event Type</Label>
              <Select 
                value={eventFormData.event_type}
                onValueChange={(value) => {
                  const typeInfo = getEventTypeInfo(value);
                  setEventFormData({...eventFormData, event_type: value, color: typeInfo.color});
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={eventFormData.start_date}
                  onChange={(e) => setEventFormData({...eventFormData, start_date: e.target.value})}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={eventFormData.end_date}
                  onChange={(e) => setEventFormData({...eventFormData, end_date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_all_day"
                checked={eventFormData.is_all_day}
                onChange={(e) => setEventFormData({...eventFormData, is_all_day: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="is_all_day">All Day Event</Label>
            </div>
            {!eventFormData.is_all_day && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={eventFormData.start_time}
                    onChange={(e) => setEventFormData({...eventFormData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={eventFormData.end_time}
                    onChange={(e) => setEventFormData({...eventFormData, end_time: e.target.value})}
                  />
                </div>
              </div>
            )}
            <div>
              <Label>Location</Label>
              <Input
                value={eventFormData.location}
                onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                placeholder="Event location (optional)"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={eventFormData.description}
                onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {setIsAddEventModalOpen(false); resetEventForm();}}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Adding...' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditEventModalOpen} onOpenChange={setIsEditEventModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Event Title *</Label>
              <Input
                value={eventFormData.title}
                onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label>Event Type</Label>
              <Select 
                value={eventFormData.event_type}
                onValueChange={(value) => {
                  const typeInfo = getEventTypeInfo(value);
                  setEventFormData({...eventFormData, event_type: value, color: typeInfo.color});
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={eventFormData.start_date}
                  onChange={(e) => setEventFormData({...eventFormData, start_date: e.target.value})}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={eventFormData.end_date}
                  onChange={(e) => setEventFormData({...eventFormData, end_date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_all_day"
                checked={eventFormData.is_all_day}
                onChange={(e) => setEventFormData({...eventFormData, is_all_day: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="edit_is_all_day">All Day Event</Label>
            </div>
            {!eventFormData.is_all_day && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={eventFormData.start_time}
                    onChange={(e) => setEventFormData({...eventFormData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={eventFormData.end_time}
                    onChange={(e) => setEventFormData({...eventFormData, end_time: e.target.value})}
                  />
                </div>
              </div>
            )}
            <div>
              <Label>Location</Label>
              <Input
                value={eventFormData.location}
                onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                placeholder="Event location (optional)"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={eventFormData.description}
                onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {setIsEditEventModalOpen(false); setSelectedEvent(null); resetEventForm();}}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEvent} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewEventModalOpen} onOpenChange={setIsViewEventModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {(() => {
                  const typeInfo = getEventTypeInfo(selectedEvent.event_type);
                  const Icon = typeInfo.icon;
                  return (
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${typeInfo.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: typeInfo.color }} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                  <Badge 
                    style={{ 
                      backgroundColor: `${getEventTypeInfo(selectedEvent.event_type).color}20`,
                      color: getEventTypeInfo(selectedEvent.event_type).color
                    }}
                  >
                    {getEventTypeInfo(selectedEvent.event_type).label}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {new Date(selectedEvent.start_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date && (
                      <> - {new Date(selectedEvent.end_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</>
                    )}
                  </span>
                </div>
                
                {!selectedEvent.is_all_day && selectedEvent.start_time && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{selectedEvent.start_time} - {selectedEvent.end_time || 'N/A'}</span>
                  </div>
                )}
                
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
              
              {canManageEvents && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setIsViewEventModalOpen(false);
                      openEditModal(selectedEvent);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => {
                      setIsViewEventModalOpen(false);
                      openDeleteConfirm(selectedEvent);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Event
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700">
            Are you sure you want to delete "<strong>{selectedEvent?.title}</strong>"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
