import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminRequestService } from '../../services/adminRequestService';
import { useAuth } from '../../context/AuthContext';
import './AppAdminsManagementPage.css';

export const AppAdminsManagementPage = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminRequestService.getApplicationAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch application admins:', err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from Application Admins?`)) return;

    try {
      await adminRequestService.removeApplicationAdmin(id);
      setAlert({ type: 'success', message: `Removed ${name} from Application Admins.` });
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to remove admin.' });
    }
  };

  return (
    <div className="app-admins-page">
      <div className="page-header">
        <div>
          <h1>Application Admin Directory</h1>
          <p>Manage application-level admins and permissions (API: <code>GET /api/admin/application-admins</code>).</p>
        </div>
      </div>

      {alert && (
        <div className={`auth-alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="card app-admins-card">
        <div className="card-header">
          <h2>Registered Application Admins</h2>
          <span className="badge badge-info">{admins.length} Admins</span>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading application admins...</p>
        ) : admins.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No application admins found.</p>
        ) : (
          <div className="admins-table-wrapper">
            <table className="admins-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Registration No</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((adm) => (
                  <tr key={adm.id}>
                    <td>#{adm.id}</td>
                    <td className="adm-name-cell">
                      <ShieldCheck size={16} className="adm-icon" /> {adm.fullName || adm.name || 'Admin User'}
                    </td>
                    <td>{adm.email || 'N/A'}</td>
                    <td><code>{adm.registrationNumber || 'N/A'}</code></td>
                    <td><span className="badge badge-danger">{adm.role || 'APP_ADMIN'}</span></td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm btn-remove"
                        onClick={() => handleRemoveAdmin(adm.id, adm.fullName || adm.email || 'Admin')}
                        title="Remove Application Admin Role (DELETE /api/admin/application-admins/{id})"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
