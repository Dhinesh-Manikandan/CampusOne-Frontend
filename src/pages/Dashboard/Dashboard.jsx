import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, UserCheck, Clock, Sparkles } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { adminRequestService } from '../../services/adminRequestService';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    adminRequestService
      .getPendingRequests('PENDING')
      .then((data) => {
        if (Array.isArray(data)) setPendingCount(data.length);
      })
      .catch(() => setPendingCount(0));
  }, []);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome, {user?.fullName || user?.name || 'User'}! 👋</h1>
          <p>
            Core Platform & Authentication Module • Role: <span className="badge badge-info">{user?.role || 'STUDENT'}</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin-requests')}>
          <UserCheck size={16} /> Manage Admin Requests
        </button>
      </div>

      {/* Application Admin Metrics Grid */}
      <div className="stats-grid">
        <StatCard title="Pending App-Admin Requests" value={pendingCount.toString()} change="Requires Review" icon={ShieldCheck} color="amber" />
        <StatCard title="Account Role Status" value={user?.role || 'STUDENT'} change="Active Session" icon={UserCheck} color="emerald" />
        <StatCard title="Registration No" value={user?.registrationNumber || 'N/A'} change="Verified" icon={Users} color="brand" />
      </div>

      {/* Quick Action Manager */}
      <div className="card announcements-card">
        <div className="card-header">
          <h2>Administrative Actions</h2>
        </div>

        <div className="quick-action-box">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Access administrative management tools for handling student requests and application admins.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/admin-requests')}>
              <UserCheck size={16} /> Review Pending Admin Requests (GET/POST /api/admin/app-admin-requests)
            </button>
            <button className="btn btn-secondary btn-full" onClick={() => navigate('/app-admins')}>
              <ShieldCheck size={16} /> Application Admin Directory (GET/DELETE /api/admin/application-admins)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
