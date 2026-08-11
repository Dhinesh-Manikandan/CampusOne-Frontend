import React from 'react';

export default function Header({ user, logout }) {
  return (
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
  );
}
