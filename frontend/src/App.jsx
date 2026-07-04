import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Recommendations from './pages/Recommendations';
import { useNotifications } from './context/NotificationContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Wrapper (prevent authenticated users from going back to login/signup)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const DashboardContainer = () => {
  const [viewTitle, setViewTitle] = useState('Cost Overview');
  const [costSummary, setCostSummary] = useState(null);
  const [costForecast, setCostForecast] = useState([]);
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // Toast notifications state
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const { isAuthenticated } = useAuth();
  const { refreshNotifications } = useNotifications();

  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: 'success' });
    }, 4000);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [summaryRes, forecastRes, resourcesRes, recsRes] = await Promise.all([
        api.get('/costs/summary'),
        api.get('/costs/forecast'),
        api.get('/resources'),
        api.get('/recommendations')
      ]);

      setCostSummary(summaryRes.data);
      setCostForecast(forecastRes.data);
      setResources(resourcesRes.data);
      setRecommendations(recsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error retrieving dashboard metrics. Please re-login if required.', 'danger');
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddResource = async (payload) => {
    try {
      const response = await api.post('/resources', payload);
      
      let statusText = response.data.status.replace('_', ' ');
      let message = `Resource "${response.data.resource.name}" saved. Engine status: ${statusText}.`;
      if (response.data.estimatedSavings > 0) {
        message += ` Potential savings: $${response.data.estimatedSavings.toFixed(2)}/mo.`;
      } else {
        message += ` Operating at optimal health.`;
      }
      
      showToast(message, response.data.status === 'HEALTHY' ? 'success' : 'warning');
      
      // Reload dashboard data instantly
      await fetchDashboardData();
      refreshNotifications();
    } catch (error) {
      showToast('Failed to analyze resource: ' + (error.response?.data?.message || error.message), 'danger');
      throw error;
    }
  };

  const fetchCostSummary = async () => {
    try {
      const res = await api.get('/costs/summary');
      setCostSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/recommendations');
      setRecommendations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyRecommendation = async (recId) => {
    try {
      await api.post(`/recommendations/${recId}/apply`);
      
      // Remove that specific card from the list immediately
      setRecommendations(prev => prev.filter(rec => rec.id !== recId));
      
      // Refetch updated summary
      await fetchCostSummary();
      
      refreshNotifications();
      showToast('✓ Recommendation applied. Savings updated.', 'success');
    } catch (error) {
      showToast('Failed to apply recommendation. Please try again.', 'danger');
      throw error;
    }
  };

  return (
    <Routes>
      <Route
        element={
          <DashboardLayout
            onRefresh={fetchDashboardData}
            viewTitle={viewTitle}
            notification={notification}
            showToast={showToast}
          />
        }
      >
        <Route
          path="/"
          element={
            <Dashboard
              setViewTitle={setViewTitle}
              costSummary={costSummary}
              costForecast={costForecast}
              resources={resources}
              recommendations={recommendations}
              onApplyRecommendation={handleApplyRecommendation}
            />
          }
        />
        <Route
          path="/resources"
          element={
            <Resources
              setViewTitle={setViewTitle}
              resources={resources}
              onAddResource={handleAddResource}
            />
          }
        />
        <Route
          path="/recommendations"
          element={
            <Recommendations
              setViewTitle={setViewTitle}
              recommendations={recommendations}
              onApplyRecommendation={handleApplyRecommendation}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardContainer />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
