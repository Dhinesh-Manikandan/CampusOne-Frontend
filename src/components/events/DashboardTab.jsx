import React, { useState, useEffect } from 'react';
import { Calendar, Ticket, Bell, Award, Sparkles, Users, ShieldCheck, Zap } from 'lucide-react';
import { formatRole } from '../../utils/formatRole';
import { formatDateDMY } from '../../utils/formatDate';
import { useTheme } from '../../context/ThemeContext';

/* ─── Hero right-side controls ───────────────────────────────
   Order: role pill → mode toggle → logout button
────────────────────────────────────────────────────────────── */
const HeroControls = ({ roleLabel, roleIcon: RoleIcon, theme, toggleTheme, logout }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', flexShrink: 0 }}>
    {/* 1. Role pill */}
    <span style={{
      fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.9px', fontWeight: 800,
      background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.42)',
      backdropFilter: 'blur(8px)', padding: '6px 13px', borderRadius: '20px', color: '#fff',
      display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
    }}>
      {RoleIcon && <RoleIcon size={13} />}
      {roleLabel}
    </span>

    {/* 2. Light / Dark mode */}
    <button type="button" onClick={toggleTheme}
      style={{
        background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.38)',
        backdropFilter: 'blur(8px)', padding: '6px 13px', borderRadius: '20px',
        fontSize: '0.73rem', fontWeight: 700, color: '#fff', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
      }}>
      <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} style={{ fontSize: '11px' }} />
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>

    {/* 3. Logout */}
    {logout && (
      <button type="button" onClick={logout}
        style={{
          background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.38)',
          backdropFilter: 'blur(8px)', padding: '6px 13px', borderRadius: '20px',
          fontSize: '0.73rem', fontWeight: 700, color: '#fff', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
        }}>
        <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '11px' }} />
        Logout
      </button>
    )}
  </div>
);

/* ─── Stat Card — label top · icon + value · link below ─── */
const StatCard = ({ label, value, icon: Icon, iconColor, iconBg, linkText, linkColor, onClick }) => (
  <div onClick={onClick} style={{
    background: 'var(--bg-card)', border: '1px solid var(--card-border)',
    borderRadius: '12px', padding: '0.85rem 1.15rem',
    cursor: onClick ? 'pointer' : 'default',
    display: 'flex', flexDirection: 'column', gap: '0.3rem',
    transition: 'transform 0.15s, box-shadow 0.15s',
  }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
  >
    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)' }}>
      {label}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <div style={{ background: iconBg, color: iconColor, padding: '7px', borderRadius: '9px', flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
        {value}
      </div>
    </div>
    {linkText && (
      <div style={{ fontSize: '0.76rem', color: linkColor || iconColor, fontWeight: 600, marginTop: '2px' }}>
        {linkText}{onClick ? ' ›' : ''}
      </div>
    )}
  </div>
);

/* ─── Event Card ─────────────────────────────────────────── */
const EventCard = ({ evt, onView }) => (
  <div style={{
    background: 'var(--bg-surface-hover, rgba(255, 255, 255, 0.04))',
    border: '1px solid var(--border-highlight, rgba(217, 119, 87, 0.3))',
    borderTop: '3px solid #D97757',
    borderRadius: '14px',
    padding: '1.35rem 1.4rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '0.85rem',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 119, 87, 0.2)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)'; }}
  >
    {/* Top row: category + joined count */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{
        fontSize: '0.73rem', fontWeight: 700,
        background: 'rgba(217,119,87,0.15)', color: '#D97757',
        padding: '4px 11px', borderRadius: '8px', border: '1px solid rgba(217,119,87,0.25)',
      }}>
        {evt.category || 'Technical'}
      </span>
      <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 700 }}>
        <Users size={14} /> {evt.registeredCount || 0} Joined
      </span>
    </div>

    {/* Title & Description */}
    <div>
      <h4 style={{ fontSize: '1.08rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-main)', lineHeight: 1.3 }}>
        {evt.title}
      </h4>
      <p style={{
        fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        lineHeight: 1.5,
      }}>
        {evt.description}
      </p>
    </div>

    {/* Divider */}
    <div style={{ borderTop: '1px solid var(--card-border)' }} />

    {/* Details grid */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '14px' }}>📅</span>
        <span>{formatDateDMY(evt.eventDate)}</span>
      </div>
      {evt.startTime && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🕐</span>
          <span>{evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ''}</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: evt.startTime ? 'span 1' : 'span 2' }}>
        <span style={{ fontSize: '14px' }}>📍</span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.venue || 'Campus Venue'}</span>
      </div>
      {evt.registrationDeadline && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2' }}>
          <span style={{ fontSize: '14px' }}>⏳</span>
          <span style={{ fontSize: '0.76rem', color: '#f59e0b', fontWeight: 600 }}>
            Deadline: {formatDateDMY(evt.registrationDeadline)}
          </span>
        </div>
      )}
    </div>

    {/* CTA Button */}
    <button className="btn btn-primary" onClick={() => onView && onView(evt.id)}
      style={{ fontWeight: 700, borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.86rem', width: '100%' }}>
      View Details &amp; Register
    </button>
  </div>
);

/* ─── Shared Hero Banner ─────────────────────────────────── */
const HeroBanner = ({ title, subtitle, roleLabel, roleIcon, theme, toggleTheme, logout }) => (
  <div style={{
    background: 'linear-gradient(135deg, #D97757 0%, #B85032 100%)',
    borderRadius: '16px', padding: '2rem 2.2rem', color: '#fff',
    boxShadow: '0 8px 24px rgba(217,119,87,0.2)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: '1rem',
  }}>
    <div style={{ flex: 1, minWidth: '220px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff', lineHeight: 1.2 }}>
        {title}
      </h1>
      <p style={{ fontSize: '0.88rem', opacity: 0.92, margin: 0, lineHeight: 1.55, maxWidth: '560px' }}>
        {subtitle}
      </p>
    </div>
    <HeroControls roleLabel={roleLabel} roleIcon={roleIcon} theme={theme} toggleTheme={toggleTheme} logout={logout} />
  </div>
);

/* ─── Featured Events Section ────────────────────────────── */
// Shows ONLY events NOT created by the current user
const FeaturedEvents = ({ events, user, setActiveTab, viewEventDetails }) => {
  const userId = user?.id;
  const upcoming = events.filter(e => {
    const creatorId = typeof e.createdBy === 'object' ? (e.createdBy?.id || e.createdBy?.userId) : (e.createdBy || e.organizerId || e.creatorId);
    const isOwn = userId && String(creatorId) === String(userId);
    const isActive = e.status === 'UPCOMING' || e.status === 'PUBLISHED' || !e.status;
    return !isOwn && isActive;
  });

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Sparkles size={17} style={{ color: '#D97757' }} /> Featured Upcoming Events
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Top campus workshops, technical hackathons, and cultural fests.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('events')}
          style={{ borderRadius: '8px', padding: '0.5rem 1.1rem', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
          Explore Full Catalog ›
        </button>
      </div>
      {upcoming.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>No other upcoming events to show right now.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('events')}
            style={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.84rem' }}>
            Browse Full Catalog ›
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 380px)', gap: '1.2rem', marginTop: '1rem' }}>
          {upcoming.slice(0, 4).map(evt => (
            <EventCard key={evt.id} evt={evt} onView={viewEventDetails} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Quick Shortcuts Section ────────────────────────────── */
const QuickShortcuts = ({ shortcuts }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
    padding: '1.5rem',
  }}>
    <div style={{ marginBottom: '1.1rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-main)' }}>
        <Zap size={17} style={{ color: '#D97757' }} /> Quick Navigation Shortcuts
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
        Fast access to your frequently used portal tools and features.
      </p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
      {shortcuts.map((sc, i) => {
        const Icon = sc.icon;
        return (
          <div
            key={i}
            onClick={sc.onClick}
            style={{
              background: 'var(--bg-surface-hover, rgba(255, 255, 255, 0.04))',
              border: '1px solid var(--border-highlight, rgba(217, 119, 87, 0.25))',
              borderRadius: '12px',
              padding: '1.1rem 1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(217, 119, 87, 0.18)';
              e.currentTarget.style.borderColor = '#D97757';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.borderColor = 'var(--border-highlight, rgba(217, 119, 87, 0.25))';
            }}
          >
            <div style={{ background: sc.iconBg, color: sc.iconColor, padding: '10px', borderRadius: '10px', flexShrink: 0 }}>
              <Icon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {sc.title}
              </div>
              {sc.sub && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {sc.sub}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   STUDENT DASHBOARD
═══════════════════════════════════════════════════════════ */
const StudentDashboard = ({ user, events, userRegistrations, announcements, setActiveTab, viewEventDetails, theme, toggleTheme, logout }) => {
  const [hasWelcomed] = useState(() => sessionStorage.getItem('gather_welcomed') === 'true');

  useEffect(() => {
    sessionStorage.setItem('gather_welcomed', 'true');
  }, []);

  const userName = user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'Student');
  const heroTitle = !hasWelcomed
    ? `Welcome back, ${userName}! 👋`
    : 'Dashboard Summary & Overview';

  const studentShortcuts = [
    { title: 'All Campus Events', sub: 'Explore catalog', icon: Calendar, iconBg: 'rgba(124,58,237,0.12)', iconColor: '#a855f7', onClick: () => setActiveTab('events') },
    { title: 'My Registrations', sub: 'View tickets & RSVPs', icon: Ticket, iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981', onClick: () => setActiveTab('my_registered_events') },
    { title: 'Noticeboard & Alerts', sub: 'Campus updates', icon: Bell, iconBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b', onClick: () => setActiveTab('announcements') },
    { title: 'Request Admin Access', sub: 'Apply for privilege', icon: Award, iconBg: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6', onClick: () => setActiveTab('profile_request_admin') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <HeroBanner
        title={heroTitle}
        subtitle="Browse and register for campus events, track your registrations, and stay informed with noticeboard announcements."
        roleLabel={formatRole(user?.role || 'STUDENT')}
        roleIcon={Award}
        theme={theme} toggleTheme={toggleTheme} logout={logout}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.1rem' }}>
        <StatCard label="Campus Events" value={events.length} icon={Calendar}
          iconBg="rgba(124,58,237,0.12)" iconColor="#a855f7" linkText="Browse Catalog" onClick={() => setActiveTab('events')} />
        <StatCard label="My Registrations" value={userRegistrations.length} icon={Ticket}
          iconBg="rgba(16,185,129,0.12)" iconColor="#10b981" linkText="View Registered" onClick={() => setActiveTab('my_registered_events')} />
        <StatCard label="Noticeboard Alerts" value={announcements.length} icon={Bell}
          iconBg="rgba(245,158,11,0.12)" iconColor="#f59e0b" linkText="Read Notices" onClick={() => setActiveTab('announcements')} />
        <StatCard label="Account Privilege" value={formatRole(user?.role || 'STUDENT')} icon={Award}
          iconBg="rgba(59,130,246,0.12)" iconColor="#3b82f6" linkText="Request Access" onClick={() => setActiveTab('profile_request_admin')} />
      </div>
      <FeaturedEvents events={events} user={user} setActiveTab={setActiveTab} viewEventDetails={viewEventDetails} />
      <QuickShortcuts shortcuts={studentShortcuts} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   EVENT ADMIN DASHBOARD
═══════════════════════════════════════════════════════════ */
const EventAdminDashboard = ({ user, events, userRegistrations, announcements, dashboardSummary, setActiveTab, viewEventDetails, theme, toggleTheme, logout }) => {
  const [hasWelcomed] = useState(() => sessionStorage.getItem('gather_welcomed') === 'true');

  useEffect(() => {
    sessionStorage.setItem('gather_welcomed', 'true');
  }, []);

  const userName = user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'Event Admin');
  const heroTitle = !hasWelcomed
    ? `Welcome back, ${userName}! 👋`
    : 'Dashboard Summary & Overview';

  const uRole = (user?.role || '').replace(/^ROLE_/, '').toUpperCase();
  const uRolesList = (user?.roles || []).map(r => typeof r === 'string' ? r.replace(/^ROLE_/, '') : (r?.roleName || r?.name || '').replace(/^ROLE_/, ''));
  const isAppAdmin = uRole === 'APP_ADMIN' || uRolesList.includes('APP_ADMIN');

  const myCreatedEvents = events.filter(e => {
    const creatorId = typeof e.createdBy === 'object' ? (e.createdBy?.id || e.createdBy?.userId) : (e.createdBy || e.organizerId || e.creatorId);
    return user?.id && String(creatorId) === String(user.id);
  });
  const myEventsCount = myCreatedEvents.length;

  const eventAdminShortcuts = [
    { title: 'All Campus Events', sub: 'Explore catalog', icon: Calendar, iconBg: 'rgba(124,58,237,0.12)', iconColor: '#a855f7', onClick: () => setActiveTab('events') },
    { title: 'My Created Events', sub: 'Manage & edit', icon: ShieldCheck, iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981', onClick: () => setActiveTab('my_events') },
    { title: 'Participant Manager', sub: 'View student RSVPs', icon: Users, iconBg: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6', onClick: () => setActiveTab('participants') },
    { title: 'Noticeboard & Alerts', sub: 'Post announcements', icon: Bell, iconBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b', onClick: () => setActiveTab('announcements') },
    isAppAdmin
      ? { title: 'Admin Overview', sub: 'System control center', icon: ShieldCheck, iconBg: 'rgba(217,119,87,0.12)', iconColor: '#D97757', onClick: () => setActiveTab('admin_dashboard') }
      : { title: 'Event Admin Requests', sub: 'Review pending', icon: Award, iconBg: 'rgba(217,119,87,0.12)', iconColor: '#D97757', onClick: () => setActiveTab('event_admin_requests') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <HeroBanner
        title={heroTitle}
        subtitle="Create and publish campus events, monitor student RSVPs in real time, and broadcast official noticeboard announcements."
        roleLabel={formatRole(user?.role || 'EVENT_ADMIN')}
        roleIcon={ShieldCheck}
        theme={theme} toggleTheme={toggleTheme} logout={logout}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.1rem' }}>
        <StatCard label="Campus Events" value={events.length} icon={Calendar}
          iconBg="rgba(124,58,237,0.12)" iconColor="#a855f7" linkText="Browse Catalog" onClick={() => setActiveTab('events')} />
        <StatCard label="My Created Events" value={myEventsCount} icon={ShieldCheck}
          iconBg="rgba(16,185,129,0.12)" iconColor="#10b981" linkText="Manage Events" onClick={() => setActiveTab('my_events')} />
        <StatCard label="Noticeboard Alerts" value={announcements.length} icon={Bell}
          iconBg="rgba(245,158,11,0.12)" iconColor="#f59e0b" linkText="Read Notices" onClick={() => setActiveTab('announcements')} />
        <StatCard
          label="Account Privilege"
          value={isAppAdmin ? 'App Admin' : 'Event Admin'}
          icon={Award}
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3b82f6"
          linkText={isAppAdmin ? '✓ Full Access Granted' : 'Request Access'}
          linkColor={isAppAdmin ? '#10b981' : undefined}
          onClick={isAppAdmin ? undefined : () => setActiveTab('profile_request_admin')}
        />
      </div>
      <FeaturedEvents events={events} user={user} setActiveTab={setActiveTab} viewEventDetails={viewEventDetails} />
      <QuickShortcuts shortcuts={eventAdminShortcuts} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
export default function DashboardTab({
  user,
  logout,
  dashboardSummary,
  events = [],
  userRegistrations = [],
  announcements = [],
  openCreateEventModal,
  setActiveTab,
  viewEventDetails,
}) {
  const { theme, toggleTheme } = useTheme();

  const currentRole = (user?.role || '').replace('ROLE_', '').toUpperCase();
  const userRolesList = (user?.roles || []).map(r =>
    typeof r === 'string' ? r.replace('ROLE_', '') : ((r && r.roleName) ? r.roleName.replace('ROLE_', '') : 'STUDENT')
  );
  const isStudent =
    currentRole === 'STUDENT' &&
    !userRolesList.includes('EVENT_ADMIN') &&
    !userRolesList.includes('APP_ADMIN');

  const shared = { user, events, userRegistrations, announcements, dashboardSummary, setActiveTab, viewEventDetails, theme, toggleTheme, logout };

  if (isStudent) return <StudentDashboard {...shared} />;
  return <EventAdminDashboard {...shared} />;
}
