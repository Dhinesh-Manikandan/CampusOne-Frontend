import React from 'react';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import './Attendance.css';

export const Attendance = () => {
  const attendanceRecords = [
    { subject: 'DevOps & CI/CD Pipelines', attended: 28, total: 30, percentage: 93.3, status: 'Good' },
    { subject: 'Microservices Architecture', attended: 22, total: 25, percentage: 88.0, status: 'Good' },
    { subject: 'Cloud Infrastructure & AWS', attended: 26, total: 30, percentage: 86.6, status: 'Good' },
    { subject: 'Full Stack Web Development', attended: 30, total: 30, percentage: 100.0, status: 'Excellent' },
  ];

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1>Attendance Tracking</h1>
          <p>Monitor course attendance percentages and requirements (Minimum 75% required).</p>
        </div>
      </div>

      <div className="attendance-summary-cards">
        <div className="card summary-card">
          <div className="icon-wrapper green">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3>Total Classes Attended</h3>
            <p className="val">106 / 115</p>
          </div>
        </div>

        <div className="card summary-card">
          <div className="icon-wrapper brand">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3>Overall Percentage</h3>
            <p className="val">92.2%</p>
          </div>
        </div>

        <div className="card summary-card">
          <div className="icon-wrapper red">
            <XCircle size={24} />
          </div>
          <div>
            <h3>Absences</h3>
            <p className="val">9 Classes</p>
          </div>
        </div>
      </div>

      <div className="card attendance-table-card">
        <h2>Subject Breakdown</h2>
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Classes Attended</th>
                <th>Total Held</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((rec, index) => (
                <tr key={index}>
                  <td className="subject-cell">{rec.subject}</td>
                  <td>{rec.attended}</td>
                  <td>{rec.total}</td>
                  <td>
                    <div className="percent-badge-container">
                      <span className="percent-text">{rec.percentage}%</span>
                      <div className="mini-progress-track">
                        <div className="mini-progress-fill" style={{ width: `${rec.percentage}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${rec.percentage >= 90 ? 'badge-success' : 'badge-warning'}`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
