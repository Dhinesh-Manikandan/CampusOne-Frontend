import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import { AuthPage } from './pages/Auth/AuthPage';
import Header from './components/events/Header';
import SidebarNav from './components/events/SidebarNav';
import DashboardTab from './components/events/DashboardTab';
import EventsCatalogTab from './components/events/EventsCatalogTab';
import MyEventsTab from './components/events/MyEventsTab';
import StudentRegisteredEventsTab from './components/events/StudentRegisteredEventsTab';
import ParticipantsTab from './components/events/ParticipantsTab';
import AnnouncementsTab from './components/events/AnnouncementsTab';
import EventModal from './components/modals/EventModal';
import EventDetailsModal from './components/modals/EventDetailsModal';
import Toast from './components/common/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { AppAdminRequestsPage } from './pages/Admin/AppAdminRequestsPage';
import { AppAdminsManagementPage } from './pages/Admin/AppAdminsManagementPage';
import { Profile } from './pages/Profile/Profile';
import AccessDenied from './pages/AccessDenied/AccessDenied';
import { apiClient } from './services/apiClient';

const TAB_PATH_MAP = {
  dashboard: '/dashboard',
  admin_dashboard: '/admin-dashboard',
  events: '/events',
  my_registered_events: '/my-registered-events',
  my_events: '/my-events',
  participants: '/participants',
  announcements: '/announcements',
  admin_requests: '/admin-requests',
  app_admins: '/app-admins',
  profile: '/profile',
  access_denied: '/access-denied',
};

const PATH_TAB_MAP = {
  '/dashboard': 'dashboard',
  '/admin-dashboard': 'admin_dashboard',
  '/events': 'events',
  '/my-registered-events': 'my_registered_events',
  '/my-events': 'my_events',
  '/participants': 'participants',
  '/announcements': 'announcements',
  '/admin-requests': 'admin_requests',
  '/app-admins': 'app_admins',
  '/profile': 'profile',
  '/access-denied': 'access_denied',
};

function MainApp() {
  const { user: authUser, token: authToken, logout: authLogout } = useAuth();
  const [token, setToken] = useState(() => authToken || localStorage.getItem('gather_token') || '');
  const [user, setUser] = useState(authUser || null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState('');

  const userRole = (user?.role || authUser?.role || '').toUpperCase();
  const isAppAdmin = userRole === 'APP_ADMIN' || (Array.isArray(user?.roles || authUser?.roles) && (user?.roles || authUser?.roles).some(r => (typeof r === 'string' ? r : r.roleName) === 'ROLE_APP_ADMIN' || r === 'APP_ADMIN'));
  const isEventAdmin = isAppAdmin || userRole === 'EVENT_ADMIN' || (Array.isArray(user?.roles || authUser?.roles) && (user?.roles || authUser?.roles).some(r => (typeof r === 'string' ? r : r.roleName) === 'ROLE_EVENT_ADMIN' || r === 'EVENT_ADMIN'));

  const location = useLocation();
  const navigate = useNavigate();

  const getTabForPath = (path, isAdminApp, isAdminEvent) => {
    if (path === '/admin-requests') return isAdminApp ? 'admin_requests' : 'access_denied';
    if (path === '/app-admins') return isAdminApp ? 'app_admins' : 'access_denied';
    if (path === '/admin-dashboard') return isAdminApp ? 'admin_dashboard' : 'access_denied';
    if (path === '/my-events') return isAdminEvent ? 'my_events' : 'access_denied';
    if (path === '/participants') return isAdminEvent ? 'participants' : 'access_denied';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/events') return 'events';
    if (path === '/my-registered-events') return 'my_registered_events';
    if (path === '/announcements') return 'announcements';
    if (path === '/profile') return 'profile';
    if (path === '/access-denied') return 'access_denied';

    if (isAdminApp) return 'admin_dashboard';
    if (isAdminEvent) return 'my_events';
    return 'events';
  };

  // App Navigation Tabs
  const [activeTab, setActiveTab] = useState(() => {
    return getTabForPath(window.location.pathname, isAppAdmin, isEventAdmin);
  });

  useEffect(() => {
    const handleAccessDeniedEvent = (e) => {
      const msg = e?.detail?.message || 'You don’t currently have permission to access this section. This page requires Event Admin or Application Admin privileges.';
      setAccessDeniedMessage(msg);
      setActiveTab('access_denied');
      if (window.location.pathname !== '/access-denied') {
        navigate('/access-denied');
      }
    };
    window.addEventListener('gather_access_denied', handleAccessDeniedEvent);
    return () => window.removeEventListener('gather_access_denied', handleAccessDeniedEvent);
  }, [navigate]);

  useEffect(() => {
    const expectedTab = getTabForPath(location.pathname, isAppAdmin, isEventAdmin);
    setActiveTab(expectedTab);

    if (expectedTab === 'access_denied' && !accessDeniedMessage) {
      setAccessDeniedMessage('You don’t currently have permission to view this section. You can request admin privileges or return to your campus events dashboard.');
    }

    const canonicalPath = TAB_PATH_MAP[expectedTab] || '/events';
    if (location.pathname === '/' || !PATH_TAB_MAP[location.pathname] || (PATH_TAB_MAP[location.pathname] && PATH_TAB_MAP[location.pathname] !== expectedTab && expectedTab !== 'access_denied')) {
      navigate(canonicalPath, { replace: true });
    }
  }, [location.pathname, isAppAdmin, isEventAdmin, navigate]);

  const handleTabChange = (tabOrFn) => {
    const nextTab = typeof tabOrFn === 'function' ? tabOrFn(activeTab) : tabOrFn;
    setActiveTab(nextTab);
    const targetPath = TAB_PATH_MAP[nextTab] || '/events';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  // Main Data States
  const [events, setEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [participantCountMap, setParticipantCountMap] = useState({});

  // Modals & Forms State
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    eventDate: '',
    startTime: '09:00',
    endTime: '12:00',
    registrationDeadline: '',
    maxParticipants: '100',
    bannerImage: '',
    status: 'UPCOMING',
    pdfFile: null,
    pdfFileName: ''
  });

  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL'
  });

  // UI Toast Notification State
  const [toast, setToast] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const parseJwt = (tokenStr) => {
    try {
      const base64Url = tokenStr.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // 1. Auth: Fetch or Decode Current User
  const getCurrentUser = async () => {
    const activeToken = token || localStorage.getItem('gather_token');
    if (!activeToken) return null;

    const extractRoleFromUser = (roles, fallback = 'STUDENT') => {
      if (!roles) return fallback;
      const list = Array.isArray(roles) ? roles : [roles];
      const norm = list.map(r => {
        if (typeof r === 'string') return r.replace('ROLE_', '');
        if (r && typeof r === 'object') return (r.roleName || r.authority || r.name || '').replace('ROLE_', '');
        return '';
      });
      if (norm.includes('APP_ADMIN')) return 'APP_ADMIN';
      if (norm.includes('EVENT_ADMIN')) return 'EVENT_ADMIN';
      if (norm.includes('STUDENT')) return 'STUDENT';
      return norm[0] || fallback;
    };

    // 1. Try fetching fresh profile from GET /api/student/me
    try {
      const res = await apiClient.fetchWithAuth('/api/student/me').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const primaryRole = extractRoleFromUser(data.roles || data.role);
        const normalized = {
          ...data,
          email: data.email || '',
          name: data.fullName || data.name || (data.email ? data.email.split('@')[0] : 'Campus User'),
          role: primaryRole,
          id: data.id || data.userId || null
        };
        setUser(normalized);
        localStorage.setItem('gather_user', JSON.stringify(normalized));
        return normalized;
      }
    } catch (e) {
      console.warn('getCurrentUser /api/student/me failed:', e);
    }

    // 2. Try stored user object from localStorage
    const storedUserRaw = localStorage.getItem('gather_user');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        const primaryRole = extractRoleFromUser(storedUser.roles || storedUser.role);
        const normalized = {
          ...storedUser,
          email: storedUser.email || storedUser.principal || '',
          name: storedUser.fullName || storedUser.name || (storedUser.email ? storedUser.email.split('@')[0] : 'Campus User'),
          role: primaryRole,
          id: storedUser.id || storedUser.userId || null,
        };
        setUser(normalized);
        return normalized;
      } catch (e) {
        // Fall through to JWT decode
      }
    }

    // 3. Fallback: decode JWT claims
    const jwtClaims = parseJwt(activeToken);
    const jwtEmail = jwtClaims?.sub || '';
    const jwtUserId = jwtClaims?.user_id || 1;
    const jwtRole = extractRoleFromUser(jwtClaims?.roles, 'STUDENT');

    const decodedUser = {
      email: jwtEmail,
      name: jwtEmail ? jwtEmail.split('@')[0] : 'Campus User',
      role: jwtRole,
      id: jwtUserId
    };
    setUser(decodedUser);
    return decodedUser;
  };

  // 2. Fetch Events
  const loadEvents = async () => {
    try {
      const res = await apiClient.fetchWithAuth('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        data.forEach(ev => loadParticipantCount(ev.id));
      }
    } catch (e) {
      console.error('Error loading events:', e);
    }
  };

  // 3. Fetch Dashboard Summary
  const loadDashboardSummary = async (userId) => {
    try {
      const targetId = userId || user?.id || 1;
      const res = await apiClient.fetchWithAuth(`/api/events/admin/${targetId}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setDashboardSummary(data);
      } else {
        setDashboardSummary({
          totalEvents: events.length,
          upcomingEvents: events.filter(e => e.status === 'UPCOMING' || e.status === 'PUBLISHED').length,
          completedEvents: events.filter(e => e.status === 'COMPLETED').length,
          cancelledEvents: events.filter(e => e.status === 'CANCELLED').length,
          totalRegistrationsSum: events.reduce((sum, e) => sum + (e.registeredCount || 0), 0)
        });
      }
    } catch (e) {
      console.error('Error loading dashboard:', e);
    }
  };

  // 4. Fetch Participant Count
  const loadParticipantCount = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await apiClient.fetchWithAuth(`/api/events/${eventId}/participants/count`);
      if (res.ok) {
        const count = await res.json();
        setParticipantCountMap(prev => ({ ...prev, [eventId]: count }));
      }
    } catch (e) {
      console.error('Error fetching participant count:', e);
    }
  };

  // 5. View Event Details
  const viewEventDetails = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await apiClient.fetchWithAuth(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEventDetails(data);
        setShowDetailsModal(true);
        loadParticipantCount(eventId);
      }
    } catch (e) {
      console.error('Error fetching event details:', e);
    }
  };

  // 6. Fetch Participants
  const loadParticipants = async (eventId, searchKeyword = '') => {
    if (!eventId) return;
    try {
      const url = searchKeyword.trim()
        ? `/api/events/${eventId}/participants?search=${encodeURIComponent(searchKeyword)}`
        : `/api/events/${eventId}/participants`;

      const res = await apiClient.fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setParticipants([]);
        if (res.status === 403) {
          showToast(err.message || 'Only event creators can view participant lists', 'error');
        }
      }
    } catch (e) {
      console.error('Error loading participants:', e);
    }
  };

  // 7. Fetch Announcements
  const loadAnnouncements = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await apiClient.fetchWithAuth(`/api/announcements/event/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error('Error loading announcements:', e);
    }
  };

  // 8. Fetch User Registrations (For Student View & Preventing Duplicate Registrations)
  const loadUserRegistrations = async (targetUserId) => {
    const activeToken = token || localStorage.getItem('gather_token') || localStorage.getItem('token');
    const uid = targetUserId || user?.id;
    if (!activeToken || !uid) return;
    try {
      const res = await fetch(`/api/events/user/${uid}/registrations`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserRegistrations(data);
      }
    } catch (e) {
      console.error('Error loading student registrations:', e);
    }
  };

  useEffect(() => {
    const activeToken = token || localStorage.getItem('gather_token');
    if (activeToken) {
      setToken(activeToken);
      getCurrentUser().then(userData => {
        loadEvents();
        if (userData?.id) {
          loadDashboardSummary(userData.id);
          loadUserRegistrations(userData.id);
        }
      });
    }
  }, [authToken]);

  // Auth Handler
  const handleLoginSuccess = (loginData) => {
    const receivedToken = loginData?.token || localStorage.getItem('gather_token');
    setToken(receivedToken);
    getCurrentUser().then(u => {
      loadEvents();
      if (u?.id) {
        loadDashboardSummary(u.id);
        loadUserRegistrations(u.id);
      }
      showToast(`Welcome back, ${u?.name || 'User'}!`);
    });
  };

  // Event Save & Delete Handlers
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!token) return;

    const payload = {
      ...eventForm,
      maxParticipants: Number(eventForm.maxParticipants),
      bannerImage: eventForm.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      createdBy: user?.id || 1
    };

    const isEdit = !!editingEvent;
    const url = isEdit ? `/api/events/${editingEvent.id}` : '/api/events';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await apiClient.fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(isEdit ? 'Event updated successfully!' : 'Event published successfully!');
        setShowEventModal(false);
        setEditingEvent(null);
        resetEventForm();
        loadEvents();
        if (user) loadDashboardSummary(user.id);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || err.error || 'Failed to save event', 'error');
      }
    } catch (e) {
      showToast('Error connecting to server', 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!token || !window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await apiClient.fetchWithAuth(`/api/events/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Event deleted successfully');
        loadEvents();
        if (user) loadDashboardSummary(user.id);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to delete event', 'error');
      }
    } catch (e) {
      showToast('Error deleting event', 'error');
    }
  };

  const handleRegister = async (eventId) => {
    if (!token || !user) return;
    try {
      const res = await apiClient.fetchWithAuth(`/api/events/${eventId}/register`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        showToast('Successfully registered for the event!');
        loadEvents();
        loadParticipantCount(eventId);
        if (user?.id) loadUserRegistrations(user.id);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Registration failed', 'error');
      }
    } catch (e) {
      showToast('Error during registration', 'error');
    }
  };

  const handleCancelRegistration = async (eventId, userId, userName) => {
    if (!token) return;
    const participantName = userName || 'this participant';
    if (!window.confirm(`Are you sure you want to remove ${participantName} from this event?`)) return;

    try {
      const res = await apiClient.fetchWithAuth(`/api/events/${eventId}/register/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Removed ${participantName} from event`);
        loadParticipants(eventId, participantSearch);
        loadEvents();
        loadParticipantCount(eventId);
        if (user?.id) loadUserRegistrations(user.id);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to cancel registration', 'error');
      }
    } catch (e) {
      showToast('Error cancelling registration', 'error');
    }
  };

  // Announcement Handlers
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!token || !selectedEventId) return;

    const isEdit = !!editingAnnouncement;
    const url = isEdit ? `/api/announcements/${editingAnnouncement.id}` : '/api/announcements';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      ...announcementForm,
      eventId: Number(selectedEventId),
      createdBy: user?.id || 1,
      postedBy: user?.id || 1
    };

    try {
      const res = await apiClient.fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(isEdit ? 'Announcement updated!' : 'Announcement posted!');
        setEditingAnnouncement(null);
        setAnnouncementForm({ title: '', content: '', priority: 'NORMAL' });
        loadAnnouncements(selectedEventId);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to post announcement', 'error');
      }
    } catch (e) {
      showToast('Error saving announcement', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!token || !window.confirm('Delete this announcement?')) return;
    try {
      const res = await apiClient.fetchWithAuth(`/api/announcements/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Announcement deleted');
        loadAnnouncements(selectedEventId);
      }
    } catch (e) {
      showToast('Error deleting announcement', 'error');
    }
  };

  const openCreateEventModal = () => {
    resetEventForm();
    setShowEventModal(true);
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      registrationDeadline: event.registrationDeadline,
      maxParticipants: event.maxParticipants?.toString() || '100',
      bannerImage: event.bannerImage || '',
      status: event.status || 'PUBLISHED',
      pdfFile: event.pdfFile || null,
      pdfFileName: event.pdfFileName || ''
    });
    setShowEventModal(true);
  };

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      category: 'Technical',
      venue: '',
      eventDate: '',
      startTime: '09:00',
      endTime: '12:00',
      registrationDeadline: '',
      maxParticipants: '100',
      bannerImage: '',
      status: 'UPCOMING',
      pdfFile: null,
      pdfFileName: ''
    });
  };

  const openEditAnnouncement = (ann) => {
    setEditingAnnouncement(ann);
    setAnnouncementForm({
      title: ann.title,
      content: ann.content,
      priority: ann.priority || 'NORMAL'
    });
  };

  const cancelEditAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', content: '', priority: 'NORMAL' });
  };

  const logout = () => {
    if (authLogout) authLogout();
    // AuthContext.logout() already removes gather_* keys;
    // clear any remaining legacy keys here just in case
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setEvents([]);
    setDashboardSummary(null);
    showToast('Logged out successfully');
  };

  const isEventCreator = (event) => user && (String(event.createdBy) === String(user.id) || user.role === 'ADMIN' || user.role === 'APP_ADMIN');

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          e.category?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          e.venue?.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sidebar Collapse Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const registeredEventIds = new Set(userRegistrations.map(r => r.event?.id || r.eventId));

  if (!token && !user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="official-layout">
      <Toast toast={toast} />

      <SidebarNav 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        events={events}
        userRegistrations={userRegistrations}
        user={user}
        logout={logout}
      />

      <div className={`official-main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Header 
          user={user} 
          logout={logout} 
          activeTab={activeTab} 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />

        {/* Main Tab Content */}
        <main className="main-content" style={{ padding: 0 }}>
          {activeTab === 'dashboard' && (
            <DashboardTab 
              user={user}
              dashboardSummary={dashboardSummary}
              events={events}
              openCreateEventModal={openCreateEventModal}
              setActiveTab={handleTabChange}
            />
          )}

          {activeTab === 'admin_dashboard' && <Dashboard />}

          {activeTab === 'events' && (
            <EventsCatalogTab 
              catalogSearch={catalogSearch}
              setCatalogSearch={setCatalogSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              filteredEvents={filteredEvents}
              user={user}
              participantCountMap={participantCountMap}
              isEventCreator={isEventCreator}
              registeredEventIds={registeredEventIds}
              viewEventDetails={viewEventDetails}
              handleRegister={handleRegister}
              openEditEventModal={openEditEventModal}
              handleDeleteEvent={handleDeleteEvent}
              setSelectedEventId={setSelectedEventId}
              setActiveTab={handleTabChange}
              loadParticipants={loadParticipants}
              loadAnnouncements={loadAnnouncements}
            />
          )}

          {activeTab === 'my_registered_events' && (
            <StudentRegisteredEventsTab 
              userRegistrations={userRegistrations}
              events={events}
              handleCancelRegistration={handleCancelRegistration}
              setActiveTab={handleTabChange}
              viewEventDetails={viewEventDetails}
            />
          )}

          {activeTab === 'my_events' && (
            <MyEventsTab 
              events={events}
              user={user}
              openCreateEventModal={openCreateEventModal}
              participantCountMap={participantCountMap}
              isEventCreator={isEventCreator}
              viewEventDetails={viewEventDetails}
              handleRegister={handleRegister}
              openEditEventModal={openEditEventModal}
              handleDeleteEvent={handleDeleteEvent}
              setSelectedEventId={setSelectedEventId}
              setActiveTab={handleTabChange}
              loadParticipants={loadParticipants}
              loadAnnouncements={loadAnnouncements}
            />
          )}

          {activeTab === 'participants' && (
            <ParticipantsTab 
              events={events}
              user={user}
              selectedEventId={selectedEventId}
              setSelectedEventId={setSelectedEventId}
              loadParticipants={loadParticipants}
              participantSearch={participantSearch}
              setParticipantSearch={setParticipantSearch}
              participants={participants}
              handleCancelRegistration={handleCancelRegistration}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsTab 
              events={events}
              user={user}
              selectedEventId={selectedEventId}
              setSelectedEventId={setSelectedEventId}
              loadAnnouncements={loadAnnouncements}
              editingAnnouncement={editingAnnouncement}
              announcementForm={announcementForm}
              setAnnouncementForm={setAnnouncementForm}
              handleSaveAnnouncement={handleSaveAnnouncement}
              cancelEditAnnouncement={cancelEditAnnouncement}
              announcements={announcements}
              openEditAnnouncement={openEditAnnouncement}
              handleDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {activeTab === 'admin_requests' && <AppAdminRequestsPage />}
          {activeTab === 'app_admins' && <AppAdminsManagementPage />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'access_denied' && (
            <AccessDenied 
              message={accessDeniedMessage} 
              user={user} 
              setActiveTab={handleTabChange} 
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <EventModal 
        showEventModal={showEventModal}
        setShowEventModal={setShowEventModal}
        editingEvent={editingEvent}
        eventForm={eventForm}
        setEventForm={setEventForm}
        handleSaveEvent={handleSaveEvent}
        showToast={showToast}
      />

      <EventDetailsModal 
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedEventDetails={selectedEventDetails}
        participantCountMap={participantCountMap}
      />
    </div>
  );
}

export default function WrappedApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
