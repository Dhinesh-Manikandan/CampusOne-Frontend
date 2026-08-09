import React from 'react';
import { BookOpen, Calendar, Award, Bell, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();

  const recentAnnouncements = [
    { id: 1, title: 'End Semester Exam Schedule Released', date: '2 hours ago', category: 'Academic' },
    { id: 2, title: 'Hackathon 2026 Registration Open', date: '1 day ago', category: 'Events' },
    { id: 3, title: 'DevOps Lab Maintenance Window', date: '3 days ago', category: 'IT Support' },
  ];

  const upcomingClasses = [
    { code: 'CS401', name: 'DevOps & Cloud Automation', time: '10:00 AM - 11:30 AM', room: 'Lab 3', instructor: 'Dr. R. Sharma' },
    { code: 'CS405', name: 'Microservices Architecture', time: '01:30 PM - 03:00 PM', room: 'Hall B', instructor: 'Prof. K. Verma' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here is your academic overview and today's schedule for {user?.department}.</p>
        </div>
        <button className="btn btn-primary">View Schedule</button>
      </div>

      <div className="stats-grid">
        <StatCard title="Enrolled Courses" value="6" change="+1 this sem" icon={BookOpen} color="brand" />
        <StatCard title="Overall Attendance" value="92.5%" change="+2.1%" icon={Calendar} color="emerald" />
        <StatCard title="Current CGPA" value="8.9" change="Top 5%" icon={Award} color="amber" />
        <StatCard title="Active Notices" value="12" change="3 new" icon={Bell} color="cyan" />
      </div>

      <div className="dashboard-content-grid">
        <div className="card schedule-card">
          <div className="card-header">
            <h2>Today's Classes</h2>
            <span className="badge badge-info"><Clock size={12} /> Live Updates</span>
          </div>
          <div className="classes-list">
            {upcomingClasses.map((cls, idx) => (
              <div key={idx} className="class-item">
                <div className="class-code">{cls.code}</div>
                <div className="class-details">
                  <h4>{cls.name}</h4>
                  <p>{cls.instructor} • {cls.room}</p>
                </div>
                <div className="class-time">{cls.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card announcements-card">
          <div className="card-header">
            <h2>Recent Announcements</h2>
            <button className="btn-link">View All <ArrowRight size={14} /></button>
          </div>
          <div className="announcements-list">
            {recentAnnouncements.map((item) => (
              <div key={item.id} className="announcement-item">
                <div className="announcement-badge">
                  <CheckCircle2 size={16} className="icon" />
                </div>
                <div className="announcement-info">
                  <h4>{item.title}</h4>
                  <div className="announcement-meta">
                    <span className="badge badge-warning">{item.category}</span>
                    <span className="time">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
