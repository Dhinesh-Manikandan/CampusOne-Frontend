import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCheck, ShieldCheck, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Admin Requests', path: '/admin-requests', icon: UserCheck },
    { label: 'App Admin Directory', path: '/app-admins', icon: ShieldCheck },
    { label: 'Student Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Sparkles size={26} className="brand-icon" />
        </div>
        <div className="brand-text">
          <h2>Gather</h2>
          <span>Core Platform</span>
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
          <Sparkles size={18} className="footer-card-icon" />
          <div className="footer-card-text">
            <p className="title">Dhinesh Module</p>
            <p className="sub">Role: {role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
