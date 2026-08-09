import React, { useState } from 'react';
import { Sun, Moon, Bell, LogOut, Menu, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export const Navbar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="navbar glass-panel">
      <div className="navbar-left">
        <button className="icon-btn mobile-toggle" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Shield size={18} style={{ color: 'var(--brand-500)' }} />
          <span>Campus Portal • Member 1 Core Module</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="profile-dropdown-container">
          <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.fullName || user?.email || 'User')}`}
              alt={user?.fullName || user?.name || 'User'}
              className="avatar-img"
            />
            <span className="profile-name">{user?.fullName || user?.name || 'User'}</span>
          </button>

          {showProfileMenu && (
            <div className="profile-menu glass-panel">
              <div className="profile-header">
                <p className="profile-user-name">{user?.fullName || user?.name || 'User'}</p>
                <p className="profile-user-email">{user?.email}</p>
                <span className="badge badge-info">{user?.role || 'STUDENT'}</span>
              </div>
              <hr className="divider" />
              <button className="menu-item" onClick={logout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
