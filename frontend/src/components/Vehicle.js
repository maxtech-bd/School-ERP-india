import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { 
  Car,
  MapPin,
  Users,
  Route,
  Download,
  Plus,
  Navigation,
  Clock,
  CheckCircle,
  X,
  Eye
} from 'lucide-react';

const Vehicle = () => {
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [activeRoutes, setActiveRoutes] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [students, setStudents] = useState([]);
  const [transportStudents, setTransportStudents] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key

  // Modal States
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showPlanRoutesModal, setShowPlanRoutesModal] = useState(false);
  const [showViewRoutesModal, setShowViewRoutesModal] = useState(false);
  const [showViewBoardingPointsModal, setShowViewBoardingPointsModal] = useState(false);
  const [showAddBoardingPointModal, setShowAddBoardingPointModal] = useState(false);
  const [showAssignStudentsModal, setShowAssignStudentsModal] = useState(false);
  const [showViewStudentListModal, setShowViewStudentListModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [editingRouteId, setEditingRouteId] = useState(null);

  // Form Data States
  const [vehicleFormData, setVehicleFormData] = useState({
    registration: '',
    type: 'bus',
    capacity: '',
    driver_name: '',
    driver_phone: '',
    driver_license: '',
    insurance_number: '',
    route_assigned: '',
    status: 'active'
  });

  const [routeFormData, setRouteFormData] = useState({
    route_name: '',
    start_point: '',
    end_point: '',
    boarding_points: [],
    vehicle_assigned: '',
    morning_start_time: '',
    evening_start_time: '',
    status: 'active'
  });

  const [assignmentData, setAssignmentData] = useState({
    selected_students: [],
    route_id: '',
    boarding_point: '',
    pickup_time: '',
    drop_time: ''
  });

  const [boardingPointFormData, setBoardingPointFormData] = useState({
    point_name: '',
    location: '',
    route_id: '',
    landmark: '',
    coordinates: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchVehicleData();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  // Get auth token for API calls
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch vehicles from backend API
  const fetchVehicles = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to view vehicles');
        return [];
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
      return [];
    }
  };

  // Fetch routes from backend API
  const fetchRoutes = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to view routes');
        return [];
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/routes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
      return [];
    }
  };

  // Create new vehicle via API
  const createVehicle = async (vehicleData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to create vehicles');
        return null;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to create vehicle: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  };

  // Create new route via API
  const createRoute = async (routeData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to create routes');
        return null;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/routes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to create route: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  };

  // Update vehicle via API
  const updateVehicle = async (vehicleId, vehicleData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to update vehicles');
        return null;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to update vehicle: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  // Update route via API
  const updateRoute = async (routeId, routeData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to update routes');
        return null;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/routes/${routeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to update route: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  };

  // Delete route via API
  const deleteRoute = async (routeId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to delete routes');
        return null;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/routes/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to delete route: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  };

  // Student API Functions
  const fetchStudents = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to view students');
        return [];
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
      return [];
    }
  };

  const fetchTransportStudents = async () => {
    try {
      // For now, we'll filter students who have transport assignments
      // In the future, this might be a separate API endpoint
      const allStudents = await fetchStudents();
      
      // Mock filter for transport students - this would come from actual assignments in production
      const transportStudents = allStudents.filter(student => {
        // This is a placeholder - in production you'd have actual transport assignment data
        return Math.random() > 0.7; // Mock 30% of students using transport
      });
      
      return transportStudents;
    } catch (error) {
      console.error('Error fetching transport students:', error);
      return [];
    }
  };

  // Report API Functions
  const generateDailyReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reports/transport/daily?date=${today}&format=json`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate daily report: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Daily Transport Report:', result);
      toast.success('Daily transport report generated successfully!');
      
      // You could open the report in a modal or download it
      return result;
    } catch (error) {
      console.error('Error generating daily report:', error);
      toast.error('Failed to generate daily report');
    }
  };

  const generateMonthlyReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      toast.info('Generating monthly report... Please wait');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reports/transport/monthly?month=${currentMonth}&format=pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate monthly report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly_transport_report_${currentMonth.replace('-', '')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Monthly transport report downloaded successfully!');
    } catch (error) {
      console.error('Error generating monthly report:', error);
      toast.error('Failed to generate monthly report');
    }
  };

  const generateCustomReport = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to generate reports');
        return;
      }

      // Generate report for last 30 days by default
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      toast.info('Generating custom report... Please wait');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reports/transport/generate?start_date=${startDate}&end_date=${endDate}&format=excel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate custom report: ${response.statusText}`);
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `custom_transport_report_${startDate.replace(/-/g, '')}_to_${endDate.replace(/-/g, '')}.xlsx`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Custom transport report downloaded successfully!');
    } catch (error) {
      console.error('Error generating custom report:', error);
      toast.error('Failed to generate custom report');
    }
  };

  // Recalculate counters from current state data
  const recalculateCounters = async (vehicleData, routeData) => {
    setTotalVehicles(vehicleData.length);
    setActiveRoutes(routeData.filter(r => r.status === 'active').length);
    
    // Fetch actual student count for transport
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/transport/assigned-students-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTotalStudents(response.data.count || 0);
    } catch (error) {
      // Fallback: calculate from route data or set to 0
      const assignedStudents = routeData.reduce((total, route) => 
        total + (route.student_count || route.students?.length || 0), 0);
      setTotalStudents(assignedStudents);
    }
  };

  const fetchVehicleData = async () => {
    try {
      const [vehicleData, routeData] = await Promise.all([
        fetchVehicles(),
        fetchRoutes()
      ]);
      
      console.log('🚗 Fetched vehicle data:', vehicleData?.length, 'vehicles');
      console.log('🚗 Vehicle IDs:', vehicleData?.map(v => v.id));
      
      // Force new array reference to ensure React detects the change
      setVehicles([...vehicleData]);
      setRoutes([...routeData]);
      recalculateCounters(vehicleData, routeData);
      
      // Force component re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
      console.log('🔄 Forced re-render with new key');
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      toast.error('Failed to load vehicle data');
    }
  };

  // Vehicle Management Handlers
  const handleEditVehicle = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setEditingVehicleId(vehicleId);
      setVehicleFormData({
        registration: vehicle.registration,
        type: vehicle.type,
        capacity: vehicle.capacity.toString(),
        driver_name: vehicle.driver_name,
        driver_phone: vehicle.driver_phone,
        driver_license: vehicle.driver_license || '',
        insurance_number: vehicle.insurance_number || '',
        route_assigned: vehicle.route_assigned || '',
        status: vehicle.status
      });
      setShowAddVehicleModal(true);
      toast.info('Edit mode: Update vehicle details');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          toast.error('Please log in to delete vehicles');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/${vehicleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to delete vehicle: ${response.statusText}`);
        }

        // Refresh vehicle data from backend after successful deletion
        await fetchVehicleData();
        toast.success('Vehicle deleted successfully!');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error(error.message || 'Failed to delete vehicle');
      } finally {
        setLoading(false);
      }
    }
  };

  // Route Management Handlers
  const handleEditRoute = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setEditingRouteId(routeId);
      setRouteFormData({
        route_name: route.route_name,
        start_point: route.start_point,
        end_point: route.end_point,
        boarding_points: route.boarding_points || [],
        vehicle_assigned: route.vehicle_assigned || '',
        morning_start_time: route.morning_start_time || '',
        evening_start_time: route.evening_start_time || '',
        status: route.status
      });
      setShowViewRoutesModal(false);
      setShowPlanRoutesModal(true);
      toast.info('Edit mode: Update route details');
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      setLoading(true);
      try {
        await deleteRoute(routeId);
        await fetchVehicleData();
        toast.success('Route deleted successfully!');
      } catch (error) {
        console.error('Error deleting route:', error);
        toast.error(error.message || 'Failed to delete route');
      } finally {
        setLoading(false);
      }
    }
  };

  // Button Click Handlers
  const handleAddVehicleClick = () => {
    // Reset form and clear editing mode for new vehicle
    setEditingVehicleId(null);
    setVehicleFormData({
      registration: '',
      type: 'bus',
      capacity: '',
      driver_name: '',
      driver_phone: '',
      driver_license: '',
      insurance_number: '',
      route_assigned: '',
      status: 'active'
    });
    setShowAddVehicleModal(true);
    toast.success('Add Vehicle modal opened!');
  };

  const handlePlanRoutesClick = () => {
    setShowPlanRoutesModal(true);
    toast.success('Route Planning modal opened!');
  };

  const handleViewRoutesClick = async () => {
    setLoading(true);
    try {
      const routesData = await fetchRoutes();
      setRoutes(routesData);
      setShowViewRoutesModal(true);
    } catch (error) {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  // Extract boarding points from all routes
  const extractBoardingPointsFromRoutes = (routesData) => {
    const allBoardingPoints = [];
    routesData.forEach(route => {
      if (route.boarding_points && route.boarding_points.length > 0) {
        route.boarding_points.forEach(point => {
          allBoardingPoints.push({
            id: `${route.id}-${point}`,
            name: point,
            route_id: route.id,
            route_name: route.route_name,
            location: point // assuming point name is the location for now
          });
        });
      }
    });
    return allBoardingPoints;
  };

  const handleViewBoardingPointsClick = async () => {
    setLoading(true);
    try {
      const routesData = await fetchRoutes();
      const extractedBoardingPoints = extractBoardingPointsFromRoutes(routesData);
      setBoardingPoints(extractedBoardingPoints);
      setShowViewBoardingPointsModal(true);
    } catch (error) {
      toast.error('Failed to load boarding points');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoardingPointClick = async () => {
    // Load routes for the dropdown selection
    try {
      const routesData = await fetchRoutes();
      setRoutes(routesData);
      setShowAddBoardingPointModal(true);
    } catch (error) {
      toast.error('Failed to load routes');
    }
  };

  const handleViewStudentListClick = async () => {
    setLoading(true);
    try {
      const transportStudentsData = await fetchTransportStudents();
      setTransportStudents(transportStudentsData);
      setShowViewStudentListModal(true);
    } catch (error) {
      toast.error('Failed to load transport students');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudentsClick = async () => {
    // Load fresh students and routes for the assignment modal
    setLoading(true);
    try {
      console.log('🔄 Fetching fresh student data for assignment...');
      const [studentsData, routesData] = await Promise.all([
        fetchStudents(),
        fetchRoutes()
      ]);
      
      console.log('✅ Fetched students for assignment:', studentsData?.length, 'students');
      console.log('📋 Student data:', studentsData);
      
      setStudents(studentsData);
      setRoutes(routesData);
      
      // Wait for state to update before showing modal
      setTimeout(() => {
        setShowAssignStudentsModal(true);
        toast.success('Student list updated!');
      }, 100);
    } catch (error) {
      console.error('❌ Error loading data for student assignment:', error);
      toast.error('Failed to load data for student assignment');
    } finally {
      setLoading(false);
    }
  };

  // Form Submission Handlers
  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingVehicleId) {
        // Edit mode - update existing vehicle via API
        console.log('📝 Updating vehicle ID:', editingVehicleId);
        const updatedVehicle = await updateVehicle(editingVehicleId, vehicleFormData);
        
        if (updatedVehicle) {
          console.log('✅ Vehicle updated successfully:', updatedVehicle);
          toast.success('Vehicle updated successfully!');
          
          // Reset form and close modal FIRST
          setVehicleFormData({
            registration: '',
            type: 'bus',
            capacity: '',
            driver_name: '',
            driver_phone: '',
            driver_license: '',
            insurance_number: '',
            route_assigned: '',
            status: 'active'
          });
          setEditingVehicleId(null);
          setShowAddVehicleModal(false);
          
          console.log('🔄 Refreshing vehicle data...');
          // Then refresh vehicle data from backend
          await fetchVehicleData();
          console.log('✅ Vehicle data refresh complete');
        }
      } else {
        // Add mode - create new vehicle via API
        console.log('➕ Creating new vehicle:', vehicleFormData);
        const newVehicle = await createVehicle(vehicleFormData);
        
        if (newVehicle) {
          console.log('✅ Vehicle created successfully:', newVehicle);
          toast.success('Vehicle added successfully!');
          
          // Reset form and close modal FIRST
          setVehicleFormData({
            registration: '',
            type: 'bus',
            capacity: '',
            driver_name: '',
            driver_phone: '',
            driver_license: '',
            insurance_number: '',
            route_assigned: '',
            status: 'active'
          });
          setEditingVehicleId(null);
          setShowAddVehicleModal(false);
          
          console.log('🔄 Refreshing vehicle data after add...');
          // Wait for next tick to ensure modal close completes
          await new Promise(resolve => setTimeout(resolve, 150));
          await fetchVehicleData();
          console.log('✅ Vehicle data refresh complete');
        }
      }
    } catch (error) {
      console.error('❌ Error in handleAddVehicleSubmit:', error);
      const errorMessage = error.message || (editingVehicleId ? 'Failed to update vehicle' : 'Failed to add vehicle');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanRouteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingRouteId) {
        // Edit mode - update existing route via API
        console.log('📝 Updating route ID:', editingRouteId);
        const updatedRoute = await updateRoute(editingRouteId, routeFormData);
        
        if (updatedRoute) {
          console.log('✅ Route updated successfully:', updatedRoute);
          toast.success('Route updated successfully!');
          
          // Reset form and close modal
          setRouteFormData({
            route_name: '',
            start_point: '',
            end_point: '',
            boarding_points: [],
            vehicle_assigned: '',
            morning_start_time: '',
            evening_start_time: '',
            status: 'active'
          });
          setEditingRouteId(null);
          setShowPlanRoutesModal(false);
          
          // Refresh vehicle data from backend
          await fetchVehicleData();
        }
      } else {
        // Create mode - create new route via API
        console.log('➕ Creating new route:', routeFormData);
        const newRoute = await createRoute(routeFormData);
        
        if (newRoute) {
          console.log('✅ Route created successfully:', newRoute);
          toast.success('Route planned successfully!');
          
          // Reset form and close modal
          setRouteFormData({
            route_name: '',
            start_point: '',
            end_point: '',
            boarding_points: [],
            vehicle_assigned: '',
            morning_start_time: '',
            evening_start_time: '',
            status: 'active'
          });
          setEditingRouteId(null);
          setShowPlanRoutesModal(false);
          
          // Refresh vehicle data from backend to get updated routes
          await fetchVehicleData();
        }
      }
    } catch (error) {
      console.error('❌ Error in handlePlanRouteSubmit:', error);
      const errorMessage = error.message || (editingRouteId ? 'Failed to update route' : 'Failed to plan route');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAssignmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Please log in to assign students');
        return;
      }

      // Create student assignment via API
      const assignmentPayload = {
        student_ids: assignmentData.selected_students,
        route_id: assignmentData.route_id,
        boarding_point: assignmentData.boarding_point,
        pickup_time: assignmentData.pickup_time || null,
        drop_time: assignmentData.drop_time || null
      };

      console.log('📋 Assigning students to route:', assignmentPayload);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/routes/assign-students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to assign students: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Students assigned successfully:', result);
      
      // Reset form and close modal
      setAssignmentData({
        selected_students: [],
        route_id: '',
        boarding_point: '',
        pickup_time: '',
        drop_time: ''
      });
      setShowAssignStudentsModal(false);
      
      // Refresh data
      await fetchVehicleData();
      
      toast.success(`✅ ${assignmentData.selected_students.length} student(s) assigned successfully!`);
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error(error.message || 'Failed to assign students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoardingPointSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get the selected route
      const selectedRoute = routes.find(route => route.id === boardingPointFormData.route_id);
      if (!selectedRoute) {
        toast.error('Please select a valid route');
        return;
      }

      // Add the new boarding point to the route's boarding_points array
      const updatedBoardingPoints = [...(selectedRoute.boarding_points || []), boardingPointFormData.point_name];
      
      // Create route data with only the fields expected by RouteCreate model
      const updatedRouteData = {
        route_name: selectedRoute.route_name,
        start_point: selectedRoute.start_point,
        end_point: selectedRoute.end_point,
        boarding_points: updatedBoardingPoints,
        vehicle_assigned: selectedRoute.vehicle_assigned,
        morning_start_time: selectedRoute.morning_start_time,
        evening_start_time: selectedRoute.evening_start_time,
        status: selectedRoute.status || "active"
      };

      const token = getAuthToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/routes/${selectedRoute.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedRouteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add boarding point');
      }

      // Refresh data and close modal
      await fetchVehicleData();
      setBoardingPointFormData({
        point_name: '',
        location: '',
        route_id: '',
        landmark: '',
        coordinates: ''
      });
      setShowAddBoardingPointModal(false);
      toast.success('Boarding point added successfully!');
    } catch (error) {
      console.error('Error adding boarding point:', error);
      toast.error(error.message || 'Failed to add boarding point');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Vehicle Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Manage school transport, routes, and student assignments</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Export
          </Button>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm h-8 sm:h-9"
            onClick={handleAddVehicleClick}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="card-hover">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Vehicles</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{totalVehicles}</p>
              </div>
              <Car className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Routes</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-emerald-600">{activeRoutes}</p>
              </div>
              <Route className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Transport</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600">{totalStudents}</p>
              </div>
              <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Boarding</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-orange-600">24</p>
              </div>
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Management Tabs */}
      <Tabs defaultValue="manage" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full lg:grid lg:w-full lg:grid-cols-6 h-auto">
            <TabsTrigger value="manage" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Manage</TabsTrigger>
            <TabsTrigger value="list" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Vehicles</TabsTrigger>
            <TabsTrigger value="routes" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Routes</TabsTrigger>
            <TabsTrigger value="boarding" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Boarding</TabsTrigger>
            <TabsTrigger value="students" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Students</TabsTrigger>
            <TabsTrigger value="reports" className="text-[10px] sm:text-xs lg:text-sm py-2 px-2 sm:px-3 whitespace-nowrap">Reports</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fleet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Car className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-2">Add New Vehicle</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Register a new school bus or vehicle</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddVehicleClick}
                    >
                      Add Vehicle
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Route className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-2">Route Planning</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Create and manage transport routes</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePlanRoutesClick}
                    >
                      Plan Routes
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 transition-colors">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-2">Student Assignment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Assign students to vehicles and routes</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAssignStudentsClick}
                    >
                      Assign Students
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fleet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" key={refreshKey}>
                {/* Dynamic Vehicle Cards */}
                {console.log('🚗 Rendering Vehicle List - vehicles.length:', vehicles.length, 'refreshKey:', refreshKey, 'vehicles:', vehicles)}
                {vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No vehicles added yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Start by adding your first vehicle to the fleet</p>
                    <Button 
                      onClick={handleAddVehicleClick}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="border border-gray-200 dark:border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge 
                              variant={vehicle.status === 'active' ? 'secondary' : 'outline'}
                              className={vehicle.status === 'maintenance' ? 'text-orange-600' : ''}
                            >
                              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                            </Badge>
                            <Car className={`h-6 w-6 ${
                              vehicle.status === 'active' ? 'text-blue-500' : 
                              vehicle.status === 'maintenance' ? 'text-orange-500' : 'text-gray-500'
                            }`} />
                          </div>
                          <h3 className="font-semibold mb-2">{vehicle.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Registration: {vehicle.registration}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Capacity: {vehicle.capacity} students</p>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <span>Route: {vehicle.route_assigned || 'Not assigned'}</span>
                            <span>Driver: {vehicle.driver_name}</span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex justify-between gap-2 pt-2 border-t">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditVehicle(vehicle.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transport Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Navigation className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Route Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Create and manage transport routes with boarding points</p>
                <div className="flex justify-center space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleViewRoutesClick}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'View Routes'}
                  </Button>
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={handlePlanRoutesClick}
                  >
                    Create New Route
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Boarding Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Boarding Points Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Manage pickup and drop-off locations</p>
                <div className="flex justify-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={handleViewBoardingPointsClick}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'View Points'}
                  </Button>
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={handleAddBoardingPointClick}
                  >
                    Add Boarding Point
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transport Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Student Transport List</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">View and manage students using school transport</p>
                <div className="flex justify-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={handleViewStudentListClick}
                  >
                    View Student List
                  </Button>
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={handleAssignStudentsClick}
                  >
                    Assign Students
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Transport Reports</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Generate comprehensive transport and vehicle reports</p>
                <div className="flex justify-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={generateDailyReport}
                    disabled={loading}
                  >
                    Daily Report
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={generateMonthlyReport}
                    disabled={loading}
                  >
                    Monthly Report
                  </Button>
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={generateCustomReport}
                    disabled={loading}
                  >
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{editingVehicleId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddVehicleModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddVehicleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., MH 12 AB 1234"
                    value={vehicleFormData.registration}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, registration: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={vehicleFormData.type}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, type: e.target.value})}
                  >
                    <option value="bus">School Bus</option>
                    <option value="van">Van</option>
                    <option value="car">Car</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Number of students"
                    value={vehicleFormData.capacity}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, capacity: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Driver's full name"
                    value={vehicleFormData.driver_name}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, driver_name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Driver Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Driver's phone number"
                    value={vehicleFormData.driver_phone}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, driver_phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Driver License
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="License number"
                    value={vehicleFormData.driver_license}
                    onChange={(e) => setVehicleFormData({...vehicleFormData, driver_license: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Insurance Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Insurance policy number"
                  value={vehicleFormData.insurance_number}
                  onChange={(e) => setVehicleFormData({...vehicleFormData, insurance_number: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddVehicleModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={loading}
                >
                  {loading ? (editingVehicleId ? 'Updating...' : 'Adding...') : (editingVehicleId ? 'Update Vehicle' : 'Add Vehicle')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Routes Modal */}
      {showPlanRoutesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Plan New Route</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPlanRoutesModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handlePlanRouteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Route Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Central Route, Northern Route"
                  value={routeFormData.route_name}
                  onChange={(e) => setRouteFormData({...routeFormData, route_name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Point *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Starting location"
                    value={routeFormData.start_point}
                    onChange={(e) => setRouteFormData({...routeFormData, start_point: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Point *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="End location (usually school)"
                    value={routeFormData.end_point}
                    onChange={(e) => setRouteFormData({...routeFormData, end_point: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Morning Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={routeFormData.morning_start_time}
                    onChange={(e) => setRouteFormData({...routeFormData, morning_start_time: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Evening Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={routeFormData.evening_start_time}
                    onChange={(e) => setRouteFormData({...routeFormData, evening_start_time: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Assignment
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  value={routeFormData.vehicle_assigned}
                  onChange={(e) => setRouteFormData({...routeFormData, vehicle_assigned: e.target.value})}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name || vehicle.type} ({vehicle.registration}) - {vehicle.driver_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPlanRoutesModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Route'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Routes Modal */}
      {showViewRoutesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Transport Routes</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowViewRoutesModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {routes.length === 0 ? (
                <div className="text-center py-12">
                  <Route className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No routes found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start by creating your first transport route</p>
                  <Button 
                    onClick={() => {
                      setShowViewRoutesModal(false);
                      setShowPlanRoutesModal(true);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Route
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routes.map((route) => (
                    <Card key={route.id} className="border border-gray-200 dark:border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{route.route_name}</h4>
                          <Badge 
                            variant={route.status === 'active' ? 'default' : 'secondary'}
                            className={route.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ''}
                          >
                            {route.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span><strong>Start:</strong> {route.start_point}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span><strong>End:</strong> {route.end_point}</span>
                          </div>
                          {route.vehicle_assigned && (
                            <div className="flex items-center">
                              <Car className="h-4 w-4 mr-2 text-gray-400" />
                              <span><strong>Vehicle:</strong> {route.vehicle_assigned}</span>
                            </div>
                          )}
                          {route.morning_start_time && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <span><strong>Morning:</strong> {route.morning_start_time}</span>
                            </div>
                          )}
                          {route.evening_start_time && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <span><strong>Evening:</strong> {route.evening_start_time}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditRoute(route.id)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteRoute(route.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button 
                onClick={() => {
                  setShowViewRoutesModal(false);
                  setShowPlanRoutesModal(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Route
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowViewRoutesModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {showAssignStudentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Assign Students to Routes</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAssignStudentsModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleStudentAssignmentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Route *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={assignmentData.route_id}
                    onChange={(e) => setAssignmentData({...assignmentData, route_id: e.target.value})}
                  >
                    <option value="">Choose a route</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.route_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Boarding Point *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={assignmentData.boarding_point}
                    onChange={(e) => setAssignmentData({...assignmentData, boarding_point: e.target.value})}
                  >
                    <option value="">Choose boarding point</option>
                    {assignmentData.route_id && routes.find(r => r.id === assignmentData.route_id)?.boarding_points?.map((point, idx) => (
                      <option key={idx} value={point}>
                        {point}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={assignmentData.pickup_time}
                    onChange={(e) => setAssignmentData({...assignmentData, pickup_time: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Students to Assign
                </label>
                <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 max-h-60 overflow-y-auto">
                  {console.log('👥 Rendering student assignment modal - students.length:', students.length, 'students:', students)}
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">No students available</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add students first to assign them to routes</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            assignmentData.selected_students.includes(student.id)
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}
                          onClick={() => {
                            const currentSelected = assignmentData.selected_students;
                            if (currentSelected.includes(student.id)) {
                              setAssignmentData({
                                ...assignmentData,
                                selected_students: currentSelected.filter(id => id !== student.id)
                              });
                            } else {
                              setAssignmentData({
                                ...assignmentData,
                                selected_students: [...currentSelected, student.id]
                              });
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim()}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {student.class_name || 'N/A'} {student.section ? `- ${student.section}` : ''}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {student.admission_number || student.roll_number || 'N/A'}
                              </p>
                            </div>
                            {assignmentData.selected_students.includes(student.id) && (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {assignmentData.selected_students.length} students selected
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAssignStudentsModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={loading || assignmentData.selected_students.length === 0}
                >
                  {loading ? 'Assigning...' : `Assign ${assignmentData.selected_students.length} Students`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Boarding Points Modal */}
      {showViewBoardingPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Boarding Points</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowViewBoardingPointsModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {boardingPoints.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No boarding points found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start by adding boarding points to your routes</p>
                  <Button 
                    onClick={() => {
                      setShowViewBoardingPointsModal(false);
                      handleAddBoardingPointClick();
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Boarding Point
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boardingPoints.map((point) => (
                    <Card key={point.id} className="border border-gray-200 dark:border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{point.name}</h4>
                          <Badge className="bg-blue-100 text-blue-700">
                            Active
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span><strong>Location:</strong> {point.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Route className="h-4 w-4 mr-2 text-gray-400" />
                            <span><strong>Route:</strong> {point.route_name}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button 
                onClick={() => {
                  setShowViewBoardingPointsModal(false);
                  handleAddBoardingPointClick();
                }}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Boarding Point
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowViewBoardingPointsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Boarding Point Modal */}
      {showAddBoardingPointModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Boarding Point</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddBoardingPointModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddBoardingPointSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Boarding Point Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Main Gate, Shopping Mall, Bus Stop A"
                  value={boardingPointFormData.point_name}
                  onChange={(e) => setBoardingPointFormData({...boardingPointFormData, point_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Route *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  value={boardingPointFormData.route_id}
                  onChange={(e) => setBoardingPointFormData({...boardingPointFormData, route_id: e.target.value})}
                >
                  <option value="">Choose a route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.route_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location/Address
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Full address or landmark description"
                  value={boardingPointFormData.location}
                  onChange={(e) => setBoardingPointFormData({...boardingPointFormData, location: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nearby recognizable landmark"
                  value={boardingPointFormData.landmark}
                  onChange={(e) => setBoardingPointFormData({...boardingPointFormData, landmark: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GPS Coordinates (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., 23.8103, 90.4125"
                  value={boardingPointFormData.coordinates}
                  onChange={(e) => setBoardingPointFormData({...boardingPointFormData, coordinates: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddBoardingPointModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Boarding Point'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student List Modal */}
      {showViewStudentListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Transport Student List</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowViewStudentListModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {transportStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Transport Students Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No students are currently assigned to school transport</p>
                  <Button 
                    onClick={() => {
                      setShowViewStudentListModal(false);
                      handleAssignStudentsClick();
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign First Student
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Total Transport Students</h4>
                        <p className="text-2xl font-bold text-emerald-600">{transportStudents.length}</p>
                      </div>
                      <Button 
                        onClick={() => {
                          setShowViewStudentListModal(false);
                          handleAssignStudentsClick();
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Assign More Students
                      </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Student Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                        {transportStudents.map((student, index) => (
                          <tr key={student.id || index} className="hover:bg-gray-50 dark:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {student.name || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Roll: {student.roll_no || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {student.class_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Section: {student.section_name || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <div>{student.email || 'N/A'}</div>
                              <div className="text-gray-500 dark:text-gray-400">{student.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Route #{index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button variant="outline" size="sm" className="mr-2">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowViewStudentListModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicle;