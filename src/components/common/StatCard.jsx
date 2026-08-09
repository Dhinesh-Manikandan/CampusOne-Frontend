import React from 'react';
import './StatCard.css';

export const StatCard = ({ title, value, change, icon: Icon, color = 'brand' }) => {
  return (
    <div className={`stat-card card card-hover color-${color}`}>
      <div className="stat-card-header">
        <div className={`stat-icon-bg bg-${color}`}>
          {Icon && <Icon size={24} />}
        </div>
        {change && (
          <span className={`badge ${change.startsWith('+') ? 'badge-success' : 'badge-danger'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
};
