import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Eye, EyeOff, AlertCircle, CheckCircle2, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import './AuthPage.css';

export const AuthPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Login state
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  // Signup state
  const [signupData, setSignupData] = useState({
    registrationNumber: '',
    fullName: '',
    email: '',
    password: '',
    department: 'CSE',
    year: '2',
    phoneNumber: '',
  });

  const deptLabels = {
    CSE: 'CSE (Computer Science)',
    ECE: 'ECE (Electronics & Comm)',
    EEE: 'EEE (Electrical)',
    MECH: 'Mechanical Engg',
    CIVIL: 'Civil Engg',
    IT: 'Information Tech',
    AIDS: 'AI & Data Science',
  };

  const yearLabels = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year',
  };

  // Password requirements calculation
  const pwd = signupData.password;
  const pwdCriteria = [
    { id: 'length', label: 'Use 8 or more characters', valid: pwd.length >= 8 },
    { id: 'upper', label: 'One Uppercase character', valid: /[A-Z]/.test(pwd) },
    { id: 'lower', label: 'One lowercase character', valid: /[a-z]/.test(pwd) },
    { id: 'special', label: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
    { id: 'number', label: 'One number', valid: /[0-9]/.test(pwd) },
  ];

  // Helper to format technical backend errors into user-friendly messages
  const formatErrorMessage = (rawError) => {
    if (!rawError) return 'An unexpected error occurred. Please try again.';
    let msg = typeof rawError === 'string' ? rawError : rawError.message || String(rawError);

    if (msg.includes('email must match') || msg.includes('student.annauniv.edu') || msg.includes('@student')) {
      return 'Invalid email domain. Allowed domain is student.annauniv.edu (e.g. reg_no@student.annauniv.edu).';
    }

    if (msg.includes('must match "') || msg.includes('must match ^')) {
      return 'Invalid input format. Please check your entered details and try again.';
    }

    return msg;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.identifier.trim() || !loginData.password) {
      setError('Please enter your email or registration number and password.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await login(loginData.identifier, loginData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(formatErrorMessage(err.message || 'Invalid credentials. Please check your details.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { registrationNumber, fullName, email, password, phoneNumber } = signupData;

    if (!registrationNumber.trim() || !fullName.trim() || !email.trim() || !password || !phoneNumber.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailPattern = /^[A-Za-z0-9._%+-]+@student\.annauniv\.edu$/;
    if (!emailPattern.test(email.trim())) {
      setError('Invalid email domain. Allowed domain is student.annauniv.edu (e.g. reg_no@student.annauniv.edu).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await signup(signupData);
      setSuccessMessage('Account created successfully! You can now sign in.');
      setIsLogin(true);
      setLoginData((prev) => ({ ...prev, identifier: email }));
    } catch (err) {
      setError(formatErrorMessage(err.message || 'Registration failed. Registration Number or Email may already exist.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-vector-page">
      {/* Theme Toggle Floating Button */}
      <button
        type="button"
        className="auth-theme-toggle-btn"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div className="auth-vector-container">
        {/* Left Column: Form & Copy */}
        <div className="auth-vector-left">
          {/* Mode Switcher Tabs */}
          <div className="auth-tab-row">
            <button
              type="button"
              className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccessMessage('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccessMessage('');
              }}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-headline-block">
            <h1 className="main-title">Gather with us to unlock campus events</h1>
            <p className="sub-title">
              A centralized platform to discover, organize, and manage campus events and administration
            </p>
          </div>

          {error && (
            <div className="auth-alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert alert-success">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="vector-form">
              <div className="form-group">
                <label className="form-label">Email or Registration No</label>
                <input
                  type="text"
                  name="identifier"
                  className="form-input"
                  placeholder="e.g. 202310XXXX or reg_no@student.annauniv.edu"
                  value={loginData.identifier}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label className="form-label">Password</label>
                  <button
                    type="button"
                    className="pwd-toggle-text-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-action-bar">
                <button type="submit" className="vector-primary-btn" disabled={submitting}>
                  {submitting ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="vector-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="reg_no@annauniv.edu"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Registration No *</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    className="form-input"
                    placeholder="e.g. 20231xxxxx"
                    value={signupData.registrationNumber}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    placeholder="e.g. Alex Rivera"
                    value={signupData.fullName}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <DropdownMenu open={deptOpen} onOpenChange={setDeptOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" type="button">
                        <span>{deptLabels[signupData.department] || 'Select Department'}</span>
                        <ChevronDown size={16} className="dropdown-arrow" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Department</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={signupData.department}
                          onValueChange={(val) => {
                            setSignupData((prev) => ({ ...prev, department: val }));
                            setDeptOpen(false);
                          }}
                        >
                          <DropdownMenuRadioItem value="CSE">CSE (Computer Science)</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="ECE">ECE (Electronics & Comm)</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="EEE">EEE (Electrical)</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="MECH">Mechanical Engg</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="CIVIL">Civil Engg</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="IT">Information Tech</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="AIDS">AI & Data Science</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Year *</label>
                  <DropdownMenu open={yearOpen} onOpenChange={setYearOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" type="button">
                        <span>{yearLabels[signupData.year] || 'Select Year'}</span>
                        <ChevronDown size={16} className="dropdown-arrow" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Academic Year</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={signupData.year}
                          onValueChange={(val) => {
                            setSignupData((prev) => ({ ...prev, year: val }));
                            setYearOpen(false);
                          }}
                        >
                          <DropdownMenuRadioItem value="1">1st Year</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="2">2nd Year</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="3">3rd Year</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="4">4th Year</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="Enter your mobile number"
                  value={signupData.phoneNumber}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label className="form-label">Password</label>
                  <button
                    type="button"
                    className="pwd-toggle-text-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Create a strong password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                />

                {/* Password validation criteria checklist */}
                <div className="password-criteria-grid">
                  {pwdCriteria.map((c) => (
                    <div
                      key={c.id}
                      className={`criteria-item ${c.valid ? 'is-valid' : ''}`}
                    >
                      <span className="criteria-dot">
                        {c.valid ? <Check size={10} /> : '•'}
                      </span>
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-action-bar">
                <button type="submit" className="vector-primary-btn" disabled={submitting}>
                  {submitting ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Campus Illustration */}
        <div className="auth-vector-right">
          <img
            src="/gather_illustration.png"
            alt="Gather Campus Collaboration"
            className="gather-vector-img"
          />
        </div>
      </div>
    </div>
  );
};



