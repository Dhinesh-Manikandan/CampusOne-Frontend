import React from 'react';
import { Mail, Shield, Building, Award, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="card profile-hero-card">
        <div className="profile-hero-content">
          <img src={user?.avatar} alt={user?.name} className="profile-hero-avatar" />
          <div className="profile-hero-info">
            <h1>{user?.name}</h1>
            <p className="role-tag"><Shield size={14} /> {user?.role} • Roll No: CS2026-892</p>
            <p className="dept"><Building size={14} /> {user?.department}</p>
          </div>
          <button className="btn btn-primary edit-profile-btn">
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="card detail-card">
          <h2>Personal Information</h2>
          <div className="detail-list">
            <div className="detail-row">
              <span className="label">Email Address</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Phone Number</span>
              <span className="value">+1 (555) 234-5678</span>
            </div>
            <div className="detail-row">
              <span className="label">Semester</span>
              <span className="value">Semester 7</span>
            </div>
            <div className="detail-row">
              <span className="label">Academic Advisor</span>
              <span className="value">Dr. R. Sharma</span>
            </div>
          </div>
        </div>

        <div className="card detail-card">
          <h2>Academic Standing</h2>
          <div className="gpa-box">
            <Award size={36} className="award-icon" />
            <div>
              <h3>Cumulative GPA</h3>
              <p className="gpa-num">8.9 / 10.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
