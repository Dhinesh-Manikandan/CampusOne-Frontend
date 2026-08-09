import React, { useState } from 'react';
import { Sun, Moon, Bell, Search, User, LogOut, Menu } from 'lucide-react';
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
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search courses, announcements, faculty..." />
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="notification-wrapper">
          <button className="icon-btn" title="Notifications">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="profile-dropdown-container">
          <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <img src={user?.avatar} alt={user?.name} className="avatar-img" />
            <span className="profile-name">{user?.name}</span>
          </button>

          {showProfileMenu && (
            <div className="profile-menu glass-panel">
              <div className="profile-header">
                <p className="profile-user-name">{user?.name}</p>
                <p className="profile-user-email">{user?.email}</p>
                <span className="badge badge-info">{user?.role}</span>
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
