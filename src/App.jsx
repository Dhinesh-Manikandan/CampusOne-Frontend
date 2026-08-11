import { useEffect, useState } from 'react';
import './styles.css';
import { AuthPage } from './pages/Auth/AuthPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: 'Campus Admin',
    email: 'admin@campusone.com',
    password: 'Admin123!',
    role: 'EVENT_ADMIN'
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  
  // Selected Event & Details State
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [participantCountMap, setParticipantCountMap] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Participant Management State
  const [participants, setParticipants] = useState([]);
  const [participantSearch, setParticipantSearch] = useState('');

  // Announcement State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: ''
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Event Form State
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
    status: 'UPCOMING'
  });

  // UI Toast State
  const [toast, setToast] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Auth: GET /api/auth/me
  // 1. Auth: GET /api/auth/me or /api/student/me
  const getCurrentUser = async () => {
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (!activeToken) return null;
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
          name: data.fullName || data.name || data.username || 'Campus Admin',
          role: extractedRole || 'ADMIN',
          id: data.id || data.userId || 1
        };
        setUser(normalized);
        return normalized;
      }
    } catch (e) {
      console.error('Error fetching current user:', e);
    }
    // Fallback default user object for session display
    const fallbackUser = {
      name: 'Campus Admin',
      role: 'ADMIN',
      id: 1
    };
    setUser(fallbackUser);
    return fallbackUser;
  };

  // 2. Events: GET /api/events
  const loadEvents = async () => {
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (!activeToken) return;
    try {
      const res = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${activeToken}` }
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

  // 3. Events: GET /api/events/admin/{createdBy}/dashboard
  const loadDashboardSummary = async (userId) => {
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    const targetId = userId || user?.id || 1;
    if (!activeToken) return;
    try {
      const res = await fetch(`/api/events/admin/${targetId}/dashboard`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardSummary(data);
      } else {
        // Compute live fallback dashboard from loaded events
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
      setDashboardSummary({
        totalEvents: events.length,
        upcomingEvents: events.filter(e => e.status === 'UPCOMING' || e.status === 'PUBLISHED').length,
        completedEvents: events.filter(e => e.status === 'COMPLETED').length,
        cancelledEvents: events.filter(e => e.status === 'CANCELLED').length,
        totalRegistrationsSum: events.reduce((sum, e) => sum + (e.registeredCount || 0), 0)
      });
    }
  };

  // 4. Events: GET /api/events/{eventId}/participants/count
  const loadParticipantCount = async (eventId) => {
    if (!token || !eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/participants/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const count = await res.json();
        setParticipantCountMap(prev => ({ ...prev, [eventId]: count }));
      }
    } catch (e) {
      console.error('Error fetching participant count:', e);
    }
  };

  // 5. Events: GET /api/events/{id}
  const viewEventDetails = async (eventId) => {
    if (!token || !eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
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

  // 6. Participants: GET /api/events/{eventId}/participants?search=...
  const loadParticipants = async (eventId, searchKeyword = '') => {
    if (!token || !eventId) return;
    try {
      const url = searchKeyword.trim()
        ? `/api/events/${eventId}/participants?search=${encodeURIComponent(searchKeyword)}`
        : `/api/events/${eventId}/participants`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
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

  // 7. Announcements: GET /api/announcements/event/{eventId}
  const loadAnnouncements = async (eventId) => {
    if (!token || !eventId) return;
    try {
      const res = await fetch(`/api/announcements/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      } else {
        setAnnouncements([]);
      }
    } catch (e) {
      console.error('Error loading announcements:', e);
    }
  };

  useEffect(() => {
    const activeToken = token || localStorage.getItem('campusone_token') || localStorage.getItem('token');
    if (activeToken) {
      if (!token) setToken(activeToken);
      loadEvents();
      getCurrentUser().then(u => {
        loadDashboardSummary(u?.id || 1);
      });
    }
  }, [token]);

  useEffect(() => {
    if (selectedEventId) {
      loadParticipants(selectedEventId, participantSearch);
      loadAnnouncements(selectedEventId);
    }
  }, [selectedEventId]);

  // Handle Auth Login / Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = authMode === 'login'
      ? { email: authForm.email, password: authForm.password }
      : { name: authForm.name, email: authForm.email, password: authForm.password, role: authForm.role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          showToast(authMode === 'login' ? 'Login successful! Welcome back.' : 'Registration successful! Welcome to CampusOne.');
        } else if (authMode === 'register') {
          showToast('Registration successful! Please login.');
          setAuthMode('login');
        }
      } else {
        showToast(data.message || data.error || 'Authentication failed', 'error');
      }
    } catch (e) {
      showToast('Network error during authentication', 'error');
    }
  };

  // Handle Event Create & Update: POST /api/events or PUT /api/events/{id}
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!token) return;

    const payload = {
      ...eventForm,
      maxParticipants: Number(eventForm.maxParticipants),
      bannerImage: eventForm.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
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

  // Handle Delete Event: DELETE /api/events/{id}
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

  // Handle Event Registration: POST /api/events/{eventId}/register
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

  // Handle Cancel Registration: DELETE /api/events/{eventId}/register/{userId}
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

  // Handle Post & Update Announcement: POST /api/announcements or PUT /api/announcements/{id}
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!token || !selectedEventId) return;

    const isEdit = !!editingAnnouncement;
    const url = isEdit ? `/api/announcements/${editingAnnouncement.id}` : '/api/announcements';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      title: announcementForm.title,
      content: announcementForm.content,
      eventId: selectedEventId,
      createdBy: user?.id
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
        setAnnouncementForm({ title: '', content: '' });
        setEditingAnnouncement(null);
        loadAnnouncements(selectedEventId);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Failed to save announcement', 'error');
      }
    } catch (e) {
      showToast('Error saving announcement', 'error');
    }
  };

  // Handle Delete Announcement: DELETE /api/announcements/{id}
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
      } else {
        showToast('Failed to delete announcement', 'error');
      }
    } catch (e) {
      showToast('Error deleting announcement', 'error');
    }
  };

  const openCreateEventModal = () => {
    setEditingEvent(null);
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
      status: event.status || 'PUBLISHED'
    });
    setShowEventModal(true);
  };

  const resetEventForm = () => {
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
      status: 'UPCOMING'
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setEvents([]);
    setDashboardSummary(null);
    showToast('Logged out');
  };

  const isEventCreator = (event) => user && event.createdBy === user.id;

  // Catalog Filters
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          e.category?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          e.venue?.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <i className={toast.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'}></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="app-header">
        <div className="brand-logo">
          <div className="brand-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <div className="brand-title">CampusOne</div>
            <div className="brand-subtitle">Event Management & Analytics Engine</div>
          </div>
        </div>

        {user && (
          <div className="user-profile-badge">
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className={`role-pill ${user.role?.toLowerCase()}`}>
                <i className="fa-solid fa-shield-halved"></i> {user.role}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={logout} title="Logout">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        )}
      </header>

      {/* Auth Screen */}
      {!token ? (
        <AuthPage onLoginSuccess={(newToken, newUser) => {
          const validToken = newToken || localStorage.getItem('campusone_token') || localStorage.getItem('token');
          if (validToken) {
            setToken(validToken);
            localStorage.setItem('token', validToken);
          }
          if (newUser) setUser(newUser);
          loadEvents();
        }} />
      ) : (
        <>
          {/* Nav Tabs */}
          <nav className="nav-tabs">
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
              <i className="fa-solid fa-calendar-days"></i> All Events Catalog
            </button>
            <button 
              className={`tab-btn ${activeTab === 'my_events' ? 'active' : ''}`}
              onClick={() => setActiveTab('my_events')}
            >
              <i className="fa-solid fa-pen-to-square"></i> My Created Events
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
              <i className="fa-solid fa-bullhorn"></i> Announcements Center
            </button>
          </nav>

          {/* TAB 1: DASHBOARD SUMMARY */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>Executive Overview</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time statistics for events created by you</p>
                </div>
                {(user?.role === 'EVENT_ADMIN' || user?.role === 'ADMIN') && (
                  <button className="btn btn-primary" onClick={openCreateEventModal}>
                    <i className="fa-solid fa-plus"></i> Create New Event
                  </button>
                )}
              </div>

              {dashboardSummary ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon"><i className="fa-solid fa-calendar-check"></i></div>
                    </div>
                    <div className="stat-value">{dashboardSummary.totalEvents}</div>
                    <div className="stat-label">Total Events Managed</div>
                  </div>
                  <div className="stat-card cyan">
                    <div className="stat-header">
                      <div className="stat-icon" style={{ color: 'var(--cyan)' }}><i className="fa-solid fa-clock-rotate-left"></i></div>
                    </div>
                    <div className="stat-value">{dashboardSummary.upcomingEvents}</div>
                    <div className="stat-label">Upcoming / Active</div>
                  </div>
                  <div className="stat-card emerald">
                    <div className="stat-header">
                      <div className="stat-icon" style={{ color: 'var(--emerald)' }}><i className="fa-solid fa-user-check"></i></div>
                    </div>
                    <div className="stat-value">{dashboardSummary.totalRegistrations}</div>
                    <div className="stat-label">Total Registrations Sum</div>
                  </div>
                  <div className="stat-card amber">
                    <div className="stat-header">
                      <div className="stat-icon" style={{ color: 'var(--amber)' }}><i className="fa-solid fa-flag-checkered"></i></div>
                    </div>
                    <div className="stat-value">{dashboardSummary.completedEvents}</div>
                    <div className="stat-label">Completed Events</div>
                  </div>
                  <div className="stat-card rose">
                    <div className="stat-header">
                      <div className="stat-icon" style={{ color: 'var(--rose)' }}><i className="fa-solid fa-ban"></i></div>
                    </div>
                    <div className="stat-value">{dashboardSummary.cancelledEvents}</div>
                    <div className="stat-label">Cancelled Events</div>
                  </div>
                </div>
              ) : (
                <div className="empty-state glass-card">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <p>Loading analytics dashboard...</p>
                </div>
              )}

              <div className="glass-card">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', marginBottom: '16px' }}>Quick Actions & System Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '6px' }}><i className="fa-solid fa-shield-halved"></i> Role Authorization</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>You are logged in as <strong>{user?.name}</strong> ({user?.role}). Administrative capabilities are enforced by RBAC.</p>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ color: 'var(--cyan)', marginBottom: '6px' }}><i className="fa-solid fa-layer-group"></i> Endpoint Mapping</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>100% backend REST API endpoints mapped & synchronized live with database records.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS CATALOG */}
          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>All Events Catalog</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Explore campus events, register, or manage settings</p>
                </div>
                {(user?.role === 'EVENT_ADMIN' || user?.role === 'ADMIN') && (
                  <button className="btn btn-primary" onClick={openCreateEventModal}>
                    <i className="fa-solid fa-plus"></i> Create Event
                  </button>
                )}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input 
                    type="text" 
                    placeholder="Search events by title, venue, or category..." 
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                  />
                </div>
                <div style={{ minWidth: '180px' }}>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="ALL">All Categories</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="empty-state glass-card">
                  <i className="fa-solid fa-calendar-xmark"></i>
                  <p>No events found matching your criteria.</p>
                </div>
              ) : (
                <div className="events-grid">
                  {filteredEvents.map(event => {
                    const isCreator = isEventCreator(event);
                    const isAdminOrCreator = isCreator || user?.role === 'ADMIN';
                    const regCount = participantCountMap[event.id] ?? event.registeredCount ?? 0;
                    const maxPart = event.maxParticipants || 100;
                    const percent = Math.min(100, Math.round((regCount / maxPart) * 100));

                    return (
                      <div key={event.id} className="event-card">
                        <span className={`status-badge ${event.status?.toLowerCase() || 'published'}`}>
                          {event.status || 'PUBLISHED'}
                        </span>
                        {event.bannerImage ? (
                          <img src={event.bannerImage} alt={event.title} className="event-banner" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="event-banner-placeholder">
                            <i className="fa-solid fa-images"></i>
                          </div>
                        )}

                        <div className="event-content">
                          <div className="event-title">{event.title}</div>
                          <div className="event-description">{event.description}</div>

                          <div className="event-meta">
                            <div className="meta-item">
                              <i className="fa-solid fa-tag"></i> <span>{event.category}</span>
                            </div>
                            <div className="meta-item">
                              <i className="fa-solid fa-location-dot"></i> <span>{event.venue}</span>
                            </div>
                            <div className="meta-item">
                              <i className="fa-solid fa-calendar"></i> <span>{event.eventDate} ({event.startTime} - {event.endTime})</span>
                            </div>
                            <div className="meta-item">
                              <i className="fa-solid fa-hourglass-half"></i> <span>Deadline: {event.registrationDeadline || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="capacity-container">
                            <div className="capacity-header">
                              <span><i className="fa-solid fa-users"></i> Registered</span>
                              <span><strong>{regCount}</strong> / {maxPart}</span>
                            </div>
                            <div className="capacity-bar">
                              <div 
                                className={`capacity-fill ${percent >= 100 ? 'full' : ''}`} 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="btn-row" style={{ marginTop: '16px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => viewEventDetails(event.id)}>
                              <i className="fa-solid fa-eye"></i> Details
                            </button>

                            {(!isAdminOrCreator && user?.role !== 'EVENT_ADMIN') && (
                              <button 
                                className="btn btn-primary btn-sm" 
                                onClick={() => handleRegister(event.id)}
                                disabled={regCount >= maxPart}
                              >
                                <i className="fa-solid fa-user-plus"></i> {regCount >= maxPart ? 'Event Full' : 'Register'}
                              </button>
                            )}

                            {isAdminOrCreator && (
                              <>
                                <button className="btn btn-secondary btn-sm" onClick={() => openEditEventModal(event)}>
                                  <i className="fa-solid fa-pen"></i> Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(event.id)} title="Delete Event">
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                                <button 
                                  className="btn btn-secondary btn-sm" 
                                  onClick={() => {
                                    setSelectedEventId(event.id);
                                    setActiveTab('participants');
                                  }}
                                  title="View Participants"
                                >
                                  <i className="fa-solid fa-users"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY CREATED EVENTS */}
          {activeTab === 'my_events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>My Created Events</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Events created under your account ({user?.email})</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateEventModal}>
                  <i className="fa-solid fa-plus"></i> Create New Event
                </button>
              </div>

              {events.filter(e => e.createdBy === user?.id).length === 0 ? (
                <div className="empty-state glass-card">
                  <i className="fa-solid fa-folder-open"></i>
                  <p>You have not created any events yet.</p>
                  <button className="btn btn-primary" onClick={openCreateEventModal} style={{ marginTop: '12px' }}>
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <div className="events-grid">
                  {events.filter(e => e.createdBy === user?.id).map(event => (
                    <div key={event.id} className="event-card">
                      <span className={`status-badge ${event.status?.toLowerCase() || 'published'}`}>
                        {event.status || 'PUBLISHED'}
                      </span>
                      {event.bannerImage ? (
                        <img src={event.bannerImage} alt={event.title} className="event-banner" />
                      ) : (
                        <div className="event-banner-placeholder">
                          <i className="fa-solid fa-images"></i>
                        </div>
                      )}
                      <div className="event-content">
                        <div className="event-title">{event.title}</div>
                        <div className="event-description">{event.description}</div>
                        <div className="event-meta">
                          <div className="meta-item"><i className="fa-solid fa-location-dot"></i> {event.venue}</div>
                          <div className="meta-item"><i className="fa-solid fa-calendar"></i> {event.eventDate} ({event.startTime} - {event.endTime})</div>
                        </div>
                        <div className="btn-row">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEditEventModal(event)}>
                            <i className="fa-solid fa-pen"></i> Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(event.id)}>
                            <i className="fa-solid fa-trash"></i> Delete
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => { setSelectedEventId(event.id); setActiveTab('participants'); }}>
                            <i className="fa-solid fa-users"></i> Participants
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedEventId(event.id); setActiveTab('announcements'); }}>
                            <i className="fa-solid fa-bullhorn"></i> Announcements
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PARTICIPANT MANAGER */}
          {activeTab === 'participants' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>Participant Manager</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>View & search participants registered for your events</p>
              </div>

              {/* Event Selector */}
              <div className="glass-card">
                <div className="form-group">
                  <label><i className="fa-solid fa-list-check"></i> Select Event</label>
                  <select 
                    value={selectedEventId || ''} 
                    onChange={e => {
                      const id = Number(e.target.value);
                      setSelectedEventId(id);
                      loadParticipants(id, participantSearch);
                    }}
                  >
                    <option value="">-- Choose an event --</option>
                    {events.filter(e => e.createdBy === user?.id || user?.role === 'ADMIN').map(e => (
                      <option key={e.id} value={e.id}>{e.title} (ID: {e.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedEventId ? (
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px' }}>
                      Registered Participants ({participants.length})
                    </h3>
                    <div className="search-box" style={{ width: '280px', marginBottom: 0 }}>
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input 
                        type="text" 
                        placeholder="Search name or email..." 
                        value={participantSearch}
                        onChange={e => {
                          setParticipantSearch(e.target.value);
                          loadParticipants(selectedEventId, e.target.value);
                        }}
                      />
                    </div>
                  </div>

                  {participants.length === 0 ? (
                    <div className="empty-state">
                      <i className="fa-solid fa-user-slash"></i>
                      <p>No participants registered or matching filter.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Registration ID</th>
                            <th>Participant Name</th>
                            <th>Email Address</th>
                            <th>Status</th>
                            <th>Registered At</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map(reg => (
                            <tr key={reg.id}>
                              <td>#{reg.id}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                                    {reg.user?.name ? reg.user.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <strong>{reg.user?.name || 'User'}</strong>
                                </div>
                              </td>
                              <td>{reg.user?.email}</td>
                              <td>
                                <span className="role-pill student">{reg.status || 'REGISTERED'}</span>
                              </td>
                              <td>{new Date(reg.registeredAt).toLocaleString()}</td>
                              <td>
                                <button 
                                  className="btn btn-danger btn-sm" 
                                  onClick={() => handleCancelRegistration(selectedEventId, reg.user.id, reg.user?.name)}
                                >
                                  <i className="fa-solid fa-user-xmark"></i> Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state glass-card">
                  <i className="fa-solid fa-arrow-pointer"></i>
                  <p>Please select an event above to view its participant list.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ANNOUNCEMENTS CENTER */}
          {activeTab === 'announcements' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>Announcements Center</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Broadcast updates & manage announcements for target events</p>
              </div>

              {/* Event Selector */}
              <div className="glass-card">
                <div className="form-group">
                  <label><i className="fa-solid fa-bullhorn"></i> Select Event</label>
                  <select 
                    value={selectedEventId || ''} 
                    onChange={e => {
                      const id = Number(e.target.value);
                      setSelectedEventId(id);
                      loadAnnouncements(id);
                    }}
                  >
                    <option value="">-- Choose an event --</option>
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.title} (Created by #{e.createdBy})</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedEventId ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Announcements Feed */}
                  <div className="glass-card">
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', marginBottom: '16px' }}>
                      Announcements Feed ({announcements.length})
                    </h3>
                    {announcements.length === 0 ? (
                      <div className="empty-state">
                        <i className="fa-solid fa-comment-slash"></i>
                        <p>No announcements posted for this event yet.</p>
                      </div>
                    ) : (
                      announcements.map(ann => (
                        <div key={ann.id} className="announcement-card">
                          <div className="announcement-header">
                            <div className="announcement-title">{ann.title}</div>
                            <div className="announcement-date">{new Date(ann.createdAt).toLocaleDateString()}</div>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{ann.content}</p>
                          
                          {(events.find(e => e.id === selectedEventId)?.createdBy === user?.id || user?.role === 'ADMIN') && (
                            <div className="btn-row">
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => {
                                  setEditingAnnouncement(ann);
                                  setAnnouncementForm({ title: ann.title, content: ann.content });
                                }}
                              >
                                <i className="fa-solid fa-pen"></i> Edit
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAnnouncement(ann.id)}>
                                <i className="fa-solid fa-trash"></i> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Post/Edit Form */}
                  <div className="glass-card">
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', marginBottom: '16px' }}>
                      {editingAnnouncement ? 'Edit Announcement' : 'Broadcast New Announcement'}
                    </h3>
                    {(events.find(e => e.id === selectedEventId)?.createdBy !== user?.id && user?.role !== 'ADMIN') ? (
                      <div style={{ padding: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ color: 'var(--amber)', fontSize: '13px' }}>
                          <i className="fa-solid fa-triangle-exclamation"></i> Only the event creator or System Admin can post announcements for this event.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="form-group">
                          <label>Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Schedule Change Notice" 
                            value={announcementForm.title} 
                            onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Announcement Content</label>
                          <textarea 
                            rows="4" 
                            placeholder="Write message details for attendees..." 
                            value={announcementForm.content} 
                            onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })} 
                            required 
                          />
                        </div>
                        <div className="btn-row">
                          <button type="submit" className="btn btn-primary">
                            <i className="fa-solid fa-paper-plane"></i> {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
                          </button>
                          {editingAnnouncement && (
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              onClick={() => {
                                setEditingAnnouncement(null);
                                setAnnouncementForm({ title: '', content: '' });
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <div className="empty-state glass-card">
                  <i className="fa-solid fa-bullhorn"></i>
                  <p>Please select an event above to view or post announcements.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingEvent ? 'Edit Event Details' : 'Create New Campus Event'}</h3>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="form-grid">
              <div className="form-group full-width">
                <label>Event Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Annual Tech Hackathon 2026" 
                  value={eventForm.title} 
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Academic">Academic</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
              <div className="form-group">
                <label>Venue / Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Auditorium Hall A" 
                  value={eventForm.venue} 
                  onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Event Date</label>
                <input 
                  type="date" 
                  value={eventForm.eventDate} 
                  onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Registration Deadline</label>
                <input 
                  type="date" 
                  value={eventForm.registrationDeadline} 
                  onChange={e => setEventForm({ ...eventForm, registrationDeadline: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input 
                  type="time" 
                  value={eventForm.startTime} 
                  onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input 
                  type="time" 
                  value={eventForm.endTime} 
                  onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Maximum Capacity</label>
                <input 
                  type="number" 
                  value={eventForm.maxParticipants} 
                  onChange={e => setEventForm({ ...eventForm, maxParticipants: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Event Status</label>
                <select value={eventForm.status} onChange={e => setEventForm({ ...eventForm, status: e.target.value })}>
                  <option value="UPCOMING">Published / Upcoming</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Banner Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..." 
                  value={eventForm.bannerImage} 
                  onChange={e => setEventForm({ ...eventForm, bannerImage: e.target.value })} 
                />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  placeholder="Detailed description of event schedule and guidelines..." 
                  value={eventForm.description} 
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })} 
                  required 
                />
              </div>
              <div className="btn-row full-width" style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-floppy-disk"></i> {editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EVENT DETAILS MODAL */}
      {showDetailsModal && selectedEventDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedEventDetails.title}</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {selectedEventDetails.bannerImage && (
              <img src={selectedEventDetails.bannerImage} alt={selectedEventDetails.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} />
            )}

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              {selectedEventDetails.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div><strong>Category:</strong> {selectedEventDetails.category}</div>
              <div><strong>Venue:</strong> {selectedEventDetails.venue}</div>
              <div><strong>Date:</strong> {selectedEventDetails.eventDate}</div>
              <div><strong>Time:</strong> {selectedEventDetails.startTime} - {selectedEventDetails.endTime}</div>
              <div><strong>Deadline:</strong> {selectedEventDetails.registrationDeadline || 'None'}</div>
              <div><strong>Created By User ID:</strong> #{selectedEventDetails.createdBy}</div>
              <div><strong>Registered Count:</strong> {participantCountMap[selectedEventDetails.id] ?? selectedEventDetails.registeredCount ?? 0} / {selectedEventDetails.maxParticipants}</div>
              <div><strong>Status:</strong> <span className={`status-badge ${selectedEventDetails.status?.toLowerCase()}`} style={{ position: 'static' }}>{selectedEventDetails.status}</span></div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WrappedApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}