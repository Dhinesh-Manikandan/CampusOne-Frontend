import React from 'react';
import { Shield, Building, Edit3, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="card profile-hero-card">
        <div className="profile-hero-content">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.fullName || user?.email || 'User')}`}
            alt={user?.fullName || user?.name || 'User Profile'}
            className="profile-hero-avatar"
          />
          <div className="profile-hero-info">
            <h1>{user?.fullName || user?.name || 'Student Profile'}</h1>
            <p className="role-tag">
              <Shield size={14} /> Role: <span className="badge badge-warning">{user?.role || 'STUDENT'}</span> • Reg No: {user?.registrationNumber || 'N/A'}
            </p>
            {user?.department && (
              <p className="dept"><Building size={14} /> Department of {user?.department}</p>
            )}
          </div>
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="card detail-card">
          <h2>User Profile Details (API: GET /api/student/me)</h2>
          <div className="detail-list">
            <div className="detail-row">
              <span className="label">Full Name</span>
              <span className="value">{user?.fullName || user?.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Registration Number</span>
              <span className="value">{user?.registrationNumber || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Email Address</span>
              <span className="value">{user?.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Phone Number</span>
              <span className="value">{user?.phoneNumber || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Department</span>
              <span className="value">{user?.department || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Academic Year</span>
              <span className="value">{user?.year ? `Year ${user.year}` : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="card detail-card">
          <h2>Account Security & Role</h2>
          <div className="gpa-box">
            <UserCheck size={36} className="award-icon" />
            <div>
              <h3>Security Role</h3>
              <p className="gpa-num">{user?.role || 'STUDENT'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Session restored and authenticated via Spring Security JWT Filter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
