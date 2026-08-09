import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';

import { Dashboard } from './pages/Dashboard/Dashboard';
import { Courses } from './pages/Courses/Courses';
import { Attendance } from './pages/Attendance/Attendance';
import { Announcements } from './pages/Announcements/Announcements';
import { Profile } from './pages/Profile/Profile';
import { NotFound } from './pages/NotFound/NotFound';

import './App.css';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="main-wrapper">
              <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              
              <main className="content-area">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
