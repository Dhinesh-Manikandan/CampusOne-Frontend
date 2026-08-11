import React, { useState, useEffect } from 'react';
import './styles.css';
import { AuthPage } from './pages/Auth/AuthPage';
import Header from './components/events/Header';
import DashboardTab from './components/events/DashboardTab';
import EventsCatalogTab from './components/events/EventsCatalogTab';
import MyEventsTab from './components/events/MyEventsTab';
import ParticipantsTab from './components/events/ParticipantsTab';
import AnnouncementsTab from './components/events/AnnouncementsTab';
import EventModal from './components/modals/EventModal';
import EventDetailsModal from './components/modals/EventDetailsModal';
import Toast from './components/common/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function MainApp() {
  const { user: authUser, token: authToken, logout: authLogout } = useAuth();
  const [token, setToken] = useState(() => authToken || localStorage.getItem('campusone_token') || localStorage.getItem('token') || '');
  const [user, setUser] = useState(authUser || null);

  // App Navigation Tabs
  const [activeTab, setActiveTab] = useState('dashboard');

  // Main Data States
  const [events, setEvents] = useState([]);
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
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (!activeToken) return null;

    const jwtClaims = parseJwt(activeToken);
    let jwtRole = 'STUDENT';
    let jwtEmail = jwtClaims?.sub || '';
    let jwtUserId = jwtClaims?.user_id || 1;

    if (jwtClaims?.roles && Array.isArray(jwtClaims.roles) && jwtClaims.roles.length > 0) {
      const firstRole = jwtClaims.roles[0];
      jwtRole = typeof firstRole === 'string' ? firstRole.replace('ROLE_', '') : 'STUDENT';
    }

    try {
      let res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (!res.ok) {
        res = await fetch('/api/student/me', {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
      }
      if (res.ok) {
        const data = await res.json();
        const rawRoles = data.roles || data.authorities || [];
        let extractedRole = data.role;
        if (!extractedRole && Array.isArray(rawRoles) && rawRoles.length > 0) {
          const first = rawRoles[0];
          extractedRole = typeof first === 'string' ? first : (first.roleName || first.authority || first.name);
        }
        if (extractedRole && extractedRole.startsWith('ROLE_')) {
          extractedRole = extractedRole.replace('ROLE_', '');
        }

        const normalized = {
          ...data,
          email: data.email || jwtEmail,
          name: data.fullName || data.name || data.username || (jwtEmail ? jwtEmail.split('@')[0] : 'Campus User'),
          role: extractedRole || jwtRole,
          id: data.id || data.userId || jwtUserId
        };
        setUser(normalized);
        return normalized;
      }
    } catch (e) {
      console.error('Error fetching current user:', e);
    }

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
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    try {
      const res = await fetch('/api/events', {
        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {}
      });
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
    if (!token) return;
    try {
      const targetId = userId || user?.id || 1;
      const res = await fetch(`/api/events/admin/${targetId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (!activeToken || !eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/participants/count`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
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
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (!activeToken || !eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
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
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (!activeToken || !eventId) return;
    try {
      const url = searchKeyword.trim()
        ? `/api/events/${eventId}/participants?search=${encodeURIComponent(searchKeyword)}`
        : `/api/events/${eventId}/participants`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
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
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (!activeToken || !eventId) return;
    try {
      const res = await fetch(`/api/announcements/event/${eventId}`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error('Error loading announcements:', e);
    }
  };

  useEffect(() => {
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (activeToken) {
      setToken(activeToken);
      getCurrentUser().then(userData => {
        loadEvents();
        if (userData?.id) {
          loadDashboardSummary(userData.id);
        }
      });
    }
  }, [authToken]);

  // Auth Handler
  const handleLoginSuccess = (loginData) => {
    const receivedToken = loginData?.token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    setToken(receivedToken);
    getCurrentUser().then(u => {
      loadEvents();
      if (u?.id) loadDashboardSummary(u.id);
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
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
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
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        showToast('Successfully registered for the event!');
        loadEvents();
        loadParticipantCount(eventId);
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
      const res = await fetch(`/api/events/${eventId}/register/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`Removed ${participantName} from event`);
        loadParticipants(eventId, participantSearch);
        loadEvents();
        loadParticipantCount(eventId);
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
      eventId: selectedEventId,
      postedBy: user?.id || 1
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
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
    localStorage.removeItem('token');
    localStorage.removeItem('campusone_token');
    localStorage.removeItem('campusone_refresh_token');
    localStorage.removeItem('campusone_user');
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

  if (!token && !user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <Toast toast={toast} />

      <Header user={user} logout={logout} />

      {/* Main App Navigation Tabs */}
      <nav className="tab-nav-container">
        <div className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fa-solid fa-chart-pie"></i> Dashboard Summary
          </button>
          <button 
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <i className="fa-solid fa-calendar-days"></i> All Events Catalog ({events.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'my_events' ? 'active' : ''}`}
            onClick={() => setActiveTab('my_events')}
          >
            <i className="fa-solid fa-folder-open"></i> My Created Events ({events.filter(e => String(e.createdBy) === String(user?.id)).length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            <i className="fa-solid fa-users"></i> Participant Manager
          </button>
          <button 
            className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <i className="fa-solid fa-bullhorn"></i> Noticeboard & Updates
          </button>
        </div>
      </nav>

      {/* Main Tab Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardTab 
            dashboardSummary={dashboardSummary}
            events={events}
            openCreateEventModal={openCreateEventModal}
            setActiveTab={setActiveTab}
          />
        )}

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
            viewEventDetails={viewEventDetails}
            handleRegister={handleRegister}
            openEditEventModal={openEditEventModal}
            handleDeleteEvent={handleDeleteEvent}
            setSelectedEventId={setSelectedEventId}
            setActiveTab={setActiveTab}
            loadParticipants={loadParticipants}
            loadAnnouncements={loadAnnouncements}
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
            setActiveTab={setActiveTab}
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
      </main>

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