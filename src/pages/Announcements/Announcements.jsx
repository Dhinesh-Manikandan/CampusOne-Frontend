import React from 'react';
import { Bell, Tag, Calendar, User } from 'lucide-react';
import './Announcements.css';

export const Announcements = () => {
  const notices = [
    {
      id: 1,
      title: 'End Semester Final Examination Schedule 2026',
      author: 'Office of the Controller of Exams',
      date: 'Aug 08, 2026',
      category: 'Exams',
      content: 'The end semester examination datesheet for standard VII CS/IT departments has been published on the official portal. Students must check their individual hall tickets.',
    },
    {
      id: 2,
      title: 'Campus Placement Drive by Top Cloud Companies',
      author: 'Training & Placement Cell',
      date: 'Aug 05, 2026',
      category: 'Placement',
      content: 'Pre-placement talks for AWS, Azure, and Google Cloud DevOps roles will start next Monday at 10 AM in the Auditorium.',
    },
    {
      id: 3,
      title: 'National Level Hackathon - CodeCraft 2026',
      author: 'Department of Computer Science',
      date: 'Aug 01, 2026',
      category: 'Events',
      content: 'Register your teams of 3 to 4 members for the upcoming 36-hour hackathon. Cash prizes up to $5000.',
    },
  ];

  return (
    <div className="announcements-page">
      <div className="page-header">
        <div>
          <h1>Notice Board & Announcements</h1>
          <p>Official circulars and notifications from CampusOne administration.</p>
        </div>
      </div>

      <div className="notices-list">
        {notices.map((notice) => (
          <div key={notice.id} className="card notice-card card-hover">
            <div className="notice-header">
              <span className="badge badge-info">{notice.category}</span>
              <div className="notice-meta">
                <Calendar size={14} />
                <span>{notice.date}</span>
              </div>
            </div>
            <h2 className="notice-title">{notice.title}</h2>
            <p className="notice-content">{notice.content}</p>
            <div className="notice-footer">
              <User size={14} />
              <span>{notice.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
