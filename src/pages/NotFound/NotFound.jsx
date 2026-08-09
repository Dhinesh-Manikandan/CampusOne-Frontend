import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="card not-found-card">
        <AlertTriangle size={64} className="warning-icon" />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
