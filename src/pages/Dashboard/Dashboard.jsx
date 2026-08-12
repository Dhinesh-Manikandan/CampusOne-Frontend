import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, UserCheck, Clock, LayoutDashboard, ArrowRight, Calendar } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { apiClient } from '../../services/apiClient';
import { adminRequestService } from '../../services/adminRequestService';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalAppAdmins: 0,
    totalEventAdmins: 0,
    totalStudents: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/admin/dashboard').catch(() => null);

      if (data && typeof data.totalAppAdmins === 'number') {
        setStats({
          totalAppAdmins: data.totalAppAdmins,
          totalEventAdmins: data.totalEventAdmins,
          totalStudents: data.totalStudents,
          pendingRequests: data.pendingRequests
        });
      } else {
        // Fallback parallel queries
        const [pendingData, adminsData] = await Promise.all([
          adminRequestService.getPendingRequests('PENDING').catch(() => []),
          adminRequestService.getApplicationAdmins().catch(() => [])
        ]);

        setStats({
          totalAppAdmins: Array.isArray(adminsData) ? adminsData.length : 0,
          totalEventAdmins: 0,
          totalStudents: 0,
          pendingRequests: Array.isArray(pendingData) ? pendingData.length : 0
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ paddingBottom: '2rem' }}>
      {/* Dashboard Page Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={26} style={{ color: 'var(--brand-500, #D97757)' }} /> Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Platform metrics and real-time overview for campus administration.
          </p>
        </div>

        {user?.role === 'APP_ADMIN' && (
          <button className="btn btn-primary" onClick={() => navigate('/app-admins')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} /> Admin Management Center
          </button>
        )}
      </div>

      {/* 4 Stat Cards Grid in Exact Order: App Admins, Event Admins, Students, Pending Requests */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Total App Admins"
          value={loading ? '...' : stats.totalAppAdmins.toString()}
          change="Application Admins"
          icon={ShieldCheck}
          color="emerald"
        />

        <StatCard
          title="Total Event Admins"
          value={loading ? '...' : stats.totalEventAdmins.toString()}
          change="Authorized Organizers"
          icon={UserCheck}
          color="brand"
        />

        <StatCard
          title="Total Students"
          value={loading ? '...' : stats.totalStudents.toString()}
          change="Student Role"
          icon={GraduationCap}
          color="blue"
        />

        <StatCard
          title="Pending Requests"
          value={loading ? '...' : stats.pendingRequests.toString()}
          change="App-Admin Requests"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Navigation Quick Access Links */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Quick Management Navigation</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div
            onClick={() => navigate('/app-admins')}
            style={{
              background: 'var(--bg-tertiary)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <ShieldCheck size={22} style={{ color: 'var(--brand-500, #D97757)' }} />
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>App Admin Management</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Review pending privilege requests & grant application admin access.
            </p>
          </div>

          <div
            onClick={() => navigate('/events')}
            style={{
              background: 'var(--bg-tertiary)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <Calendar size={22} style={{ color: '#3b82f6' }} />
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Campus Events Catalog</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Explore and manage all upcoming technical & cultural campus events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
