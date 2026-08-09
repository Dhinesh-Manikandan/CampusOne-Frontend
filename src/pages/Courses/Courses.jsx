import React from 'react';
import { BookOpen, User, Clock, Star } from 'lucide-react';
import './Courses.css';

export const Courses = () => {
  const courses = [
    {
      id: 1,
      code: 'CS401',
      title: 'DevOps & CI/CD Pipelines',
      instructor: 'Dr. R. Sharma',
      credits: 4,
      progress: 75,
      rating: 4.9,
      tags: ['DevOps', 'Docker', 'Kubernetes'],
    },
    {
      id: 2,
      code: 'CS405',
      title: 'Microservices Architecture',
      instructor: 'Prof. K. Verma',
      credits: 3,
      progress: 60,
      rating: 4.8,
      tags: ['Spring Boot', 'REST', 'Cloud'],
    },
    {
      id: 3,
      code: 'CS408',
      title: 'Cloud Infrastructure & AWS',
      instructor: 'Dr. S. Mehta',
      credits: 4,
      progress: 40,
      rating: 4.7,
      tags: ['AWS', 'Terraform', 'IaC'],
    },
    {
      id: 4,
      code: 'CS412',
      title: 'Full Stack Web Development',
      instructor: 'Prof. A. Nambiar',
      credits: 4,
      progress: 88,
      rating: 4.9,
      tags: ['React', 'Node.js', 'PostgreSQL'],
    },
  ];

  return (
    <div className="courses-page">
      <div className="page-header">
        <div>
          <h1>My Enrolled Courses</h1>
          <p>Manage and track your coursework for the current semester.</p>
        </div>
        <button className="btn btn-primary">+ Enroll New Course</button>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="card course-card card-hover">
            <div className="course-card-top">
              <span className="course-code">{course.code}</span>
              <div className="course-rating">
                <Star size={14} className="star-icon" />
                <span>{course.rating}</span>
              </div>
            </div>

            <h3 className="course-title">{course.title}</h3>

            <div className="course-meta">
              <div className="meta-item">
                <User size={14} />
                <span>{course.instructor}</span>
              </div>
              <div className="meta-item">
                <Clock size={14} />
                <span>{course.credits} Credits</span>
              </div>
            </div>

            <div className="course-tags">
              {course.tags.map((tag, i) => (
                <span key={i} className="badge badge-info">{tag}</span>
              ))}
            </div>

            <div className="course-progress-section">
              <div className="progress-label">
                <span>Completion</span>
                <span>{course.progress}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${course.progress}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
