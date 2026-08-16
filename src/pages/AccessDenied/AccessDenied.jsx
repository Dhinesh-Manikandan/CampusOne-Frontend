import React from 'react';
import { Lock, ArrowLeft, Home, KeyRound, UserCheck } from 'lucide-react';
import { formatRole } from '../../utils/formatRole';
import './AccessDenied.css';

export const AccessDenied = ({ 
  message, 
  user, 
  setActiveTab 
}) => {
  const userRole = user?.role || 'STUDENT';
  const userName = user?.name || user?.fullName || 'Current User';

  const handleReturnHome = () => {
    if (setActiveTab) {
      setActiveTab('events');
    } else {
      window.location.href = '/events';
    }
  };

  const handleRequestPrivileges = () => {
    if (setActiveTab) {
      setActiveTab('profile');
    } else {
      window.location.href = '/profile';
    }
  };

  return (
    <div className="access-denied-container">
      <div className="card access-denied-card">
        <div className="lock-icon-wrapper" title="Access Restricted">
          <Lock size={38} />
        </div>

        <h2>Access Restricted</h2>

        <div className="user-role-badge">
          <UserCheck size={14} /> Signed in as {userName} • ({formatRole(userRole)})
        </div>

        <p className="access-denied-reason">
          {message || 'You don’t have permission to view this section. This page requires Event Admin or Application Admin privileges.'}
        </p>

        <div className="action-buttons-group">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleReturnHome}
          >
            <Home size={16} /> Return to Campus Events
          </button>

          {userRole === 'STUDENT' && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleRequestPrivileges}
              title="Request App Admin privileges from your profile"
            >
              <KeyRound size={16} /> Request Admin Privileges
            </button>
          )}

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
