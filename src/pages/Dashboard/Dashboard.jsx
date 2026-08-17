import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, UserCheck, Clock, CheckCircle2, Shield, Zap, Calendar, Bell } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { adminRequestService } from '../../services/adminRequestService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRole } from '../../utils/formatRole';
import './Dashboard.css';

/* ─── Stat Card — exactly like Screenshot 2 ─────────────────
   Layout: icon on LEFT, then label + big number + subtitle on RIGHT (horizontal)
────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, sub }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--card-border)',
    borderRadius: '12px',
    padding: '0.9rem 1.15rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
  }}>
    <div style={{ background: iconBg, color: iconColor, padding: '9px', borderRadius: '10px', flexShrink: 0 }}>
      <Icon size={19} />
    </div>
    <div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{sub}</div>}
    </div>
  </div>
);

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalAppAdmins: 0,
    totalEventAdmins: 0,
    totalStudents: 0,
    pendingRequests: 0,
  });
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pendingApp, pendingEvent, appAdmins, eventAdmins] = await Promise.allSettled([
        adminRequestService.getPendingRequests('PENDING'),
        adminRequestService.getPendingEventAdminRequests('PENDING'),
        adminRequestService.getApplicationAdmins(),
        adminRequestService.getEventAdmins(),
      ]);

      const pApp = pendingApp.status === 'fulfilled' && Array.isArray(pendingApp.value) ? pendingApp.value : [];
      const pEvent = pendingEvent.status === 'fulfilled' && Array.isArray(pendingEvent.value) ? pendingEvent.value : [];
      const aAdmins = appAdmins.status === 'fulfilled' && Array.isArray(appAdmins.value) ? appAdmins.value : [];
      const eAdmins = eventAdmins.status === 'fulfilled' && Array.isArray(eventAdmins.value) ? eventAdmins.value : [];

      const allPending = [
        ...pApp.map(r => ({ ...r, _type: 'APP_ADMIN' })),
        ...pEvent.map(r => ({ ...r, _type: 'EVENT_ADMIN' })),
      ];
      setPendingList(allPending);

      // Try enriched dashboard endpoint
      const dashData = await apiClient.get('/admin/dashboard').catch(() => null);

      setStats({
        totalAppAdmins: dashData?.totalAppAdmins ?? aAdmins.length,
        totalEventAdmins: dashData?.totalEventAdmins ?? eAdmins.length,
        totalStudents: dashData?.totalStudents ?? 0,
        pendingRequests: dashData?.pendingRequests ?? allPending.length,
      });
    } catch (err) {
      console.error('App Admin dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const L = v => loading ? '…' : v;

  const [hasWelcomed] = useState(() => sessionStorage.getItem('gather_admin_welcomed') === 'true');

  useEffect(() => {
    sessionStorage.setItem('gather_admin_welcomed', 'true');
  }, []);

  const adminName = user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'Campus One Admin');
  const heroHeading = !hasWelcomed
    ? `Welcome back, ${adminName}! 👋`
    : 'Core Platform & Admin Overview';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

      {/* ── Hero Banner — exactly like Screenshot 2 ── */}
      <div style={{
        background: 'linear-gradient(135deg, #D97757 0%, #B85032 100%)',
        borderRadius: '16px', padding: '2rem 2.2rem', color: '#fff',
        boxShadow: '0 8px 24px rgba(217,119,87,0.2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          {/* Small badge */}
          <span style={{
            fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800,
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
            padding: '3px 10px', borderRadius: '10px', color: '#fff',
            display: 'inline-block', marginBottom: '0.6rem',
          }}>
            Application Control Center
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.45rem', color: '#fff', lineHeight: 1.2 }}>
            {heroHeading}
          </h1>
          <p style={{ fontSize: '0.88rem', opacity: 0.92, margin: 0, lineHeight: 1.55, maxWidth: '560px' }}>
            Full platform administration control center. Manage system administrators, review privilege requests, and oversee campus event operations.
          </p>
        </div>

        {/* Right side: role pill + mode + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Role pill */}
          <span style={{
            fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.9px', fontWeight: 800,
            background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.42)',
            backdropFilter: 'blur(8px)', padding: '6px 13px', borderRadius: '20px', color: '#fff',
            display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
          }}>
            <ShieldCheck size={13} />
            APP ADMIN
          </span>

          {/* Mode toggle */}
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

          {/* Logout */}
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
      </div>

      {/* ── 4 Stat Cards — exactly like Screenshot 2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.1rem' }}>
        <StatCard
          icon={ShieldCheck} iconBg="rgba(16,185,129,0.12)" iconColor="#10b981"
          label="Application Admins" value={L(stats.totalAppAdmins)} sub="Total App Admins"
        />
        <StatCard
          icon={UserCheck} iconBg="rgba(124,58,237,0.12)" iconColor="#a855f7"
          label="Authorized Organizers" value={L(stats.totalEventAdmins)} sub="Total Event Admins"
        />
        <StatCard
          icon={GraduationCap} iconBg="rgba(59,130,246,0.12)" iconColor="#3b82f6"
          label="Student Role" value={L(stats.totalStudents || '—')} sub="Total Students"
        />
        <StatCard
          icon={Clock} iconBg="rgba(245,158,11,0.12)" iconColor="#f59e0b"
          label="App-Admin Requests" value={L(stats.pendingRequests)} sub="Pending Requests"
        />
      </div>

      {/* ── Pending Privilege Requests Queue — exactly like Screenshot 2 ── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem' }}>
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-main)' }}>
              <Clock size={17} style={{ color: '#f59e0b' }} />
              Pending Privilege Requests Queue ({pendingList.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Submitted student privilege requests requiring administrative review.
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/admin-requests')}
            style={{ borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            Manage All Requests →
          </button>
        </div>

        {/* Content */}
        {pendingList.length === 0 ? (
          /* Empty state — exactly like Screenshot 2 */
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
            <CheckCircle2 size={44} style={{ color: '#10b981' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              All Privilege Requests Handled
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, maxWidth: '400px' }}>
              There are currently zero pending Application or Event Admin requests awaiting evaluation.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingList.slice(0, 5).map(req => {
              const reqUser = req.requestedBy || req.userResponse || {};
              const name = reqUser.fullName || reqUser.name || 'Applicant';
              const email = reqUser.email || 'N/A';
              const isApp = req._type === 'APP_ADMIN';
              return (
                <div key={req.id} style={{
                  background: 'var(--bg-tertiary)', borderRadius: '10px',
                  padding: '0.9rem 1.1rem', border: '1px solid var(--card-border)',
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                }}>
                  <div style={{ background: isApp ? 'rgba(16,185,129,0.12)' : 'rgba(124,58,237,0.12)', color: isApp ? '#10b981' : '#a855f7', padding: '8px', borderRadius: '9px', flexShrink: 0 }}>
                    {isApp ? <Shield size={16} /> : <UserCheck size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {email} · {isApp ? 'App Admin Request' : 'Event Admin Request'}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(isApp ? '/app-admins' : '/event-admins')}
                    style={{ borderRadius: '6px', fontSize: '0.78rem', padding: '4px 12px', fontWeight: 700, flexShrink: 0 }}>
                    Review
                  </button>
                </div>
              );
            })}
            {pendingList.length > 5 && (
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin-requests')}
                style={{ borderRadius: '8px', fontWeight: 700, width: '100%', padding: '0.5rem' }}>
                View {pendingList.length - 5} more requests →
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Quick Admin Shortcuts ── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-main)' }}>
            <Zap size={17} style={{ color: '#D97757' }} /> Quick Administration Shortcuts
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Fast access to system management and administrative control pages.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'App Admin Management', sub: 'System administrators', icon: ShieldCheck, iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981', path: '/app-admins' },
            { title: 'Event Admin Directory', sub: 'Authorized organizers', icon: UserCheck, iconBg: 'rgba(124,58,237,0.12)', iconColor: '#a855f7', path: '/event-admins' },
            { title: 'Campus Events Catalog', sub: 'All events oversight', icon: Calendar, iconBg: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6', path: '/events' },
            { title: 'Broadcast Alerts', sub: 'Noticeboard updates', icon: Bell, iconBg: 'rgba(217,119,87,0.12)', iconColor: '#D97757', path: '/admin-announcements' },
          ].map((sc, i) => {
            const Icon = sc.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(sc.path)}
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {sc.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
