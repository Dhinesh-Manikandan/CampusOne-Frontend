import React from 'react';

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast-container">
      <div className={`toast ${toast.type}`}>
        <i className={toast.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'}></i>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
