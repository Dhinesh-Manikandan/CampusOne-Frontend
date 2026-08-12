import { apiClient } from './apiClient';

export const authService = {
  /**
   * Register a new student account
   * @param {Object} data - { registrationNumber, fullName, email, password, department, year, phoneNumber }
   */
  async signup(data) {
    const payload = {
      registrationNumber: data.registrationNumber.trim(),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      password: data.password,
      department: data.department,
      year: parseInt(data.year, 10),
      phoneNumber: data.phoneNumber.trim(),
    };
    return await apiClient.post('/auth/signup', payload);
  },

  /**
   * Login student or admin using email or registration number
   * @param {Object} credentials - { identifier, password }
   */
  async login({ identifier, password }) {
    const payload = {
      identifier: identifier.trim(),
      password: password,
    };
    return await apiClient.post('/auth/login', payload);
  },

  /**
   * Get currently logged-in student profile details
   * @param {string} token - Optional explicit Bearer token
   */
  async getProfile(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.get('/student/me', headers);
  },

  /**
   * Update profile information
   * @param {Object} data - { fullName, department, year, phoneNumber }
   */
  async updateProfile(data) {
    const payload = {
      fullName: data.fullName.trim(),
      department: data.department.trim(),
      year: parseInt(data.year, 10),
      phoneNumber: data.phoneNumber.trim(),
    };
    return await apiClient.put('/user/profile', payload);
  },

  /**
   * Change current password
   * @param {Object} data - { currentPassword, newPassword }
   */
  async changePassword(data) {
    return await apiClient.put('/user/change-password', data);
  },

  /**
   * Refresh JWT token
   * @param {string} refreshToken
   */
  async refreshToken(refreshToken) {
    return await apiClient.post('/auth/refresh', { refreshToken });
  },
};
