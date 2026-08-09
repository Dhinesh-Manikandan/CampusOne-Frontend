import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, Bell, User, GraduationCap, Settings } from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'Attendance', path: '/attendance', icon: Calendar },
    { label: 'Announcements', path: '/announcements', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <GraduationCap size={28} className="brand-icon" />
        </div>
        <div className="brand-text">
          <h2>CampusOne</h2>
          <span>Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-card">
          <GraduationCap size={20} className="footer-card-icon" />
          <div className="footer-card-text">
            <p className="title">CampusOne v1.0</p>
            <p className="sub">DevOps Engineering</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
