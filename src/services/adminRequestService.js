import { apiClient } from './apiClient';

export const adminRequestService = {
  /**
   * Submit an App Admin request
   * API: POST /api/app-admin-requests
   */
  async submitAppAdminRequest(requestReason) {
    return await apiClient.post('/app-admin-requests', { requestReason });
  },

  /**
   * Alias for backwards compatibility
   */
  async submitRequest(requestReason) {
    return await this.submitAppAdminRequest(requestReason);
  },

  /**
   * Submit an Event Admin request
   * API: POST /api/event-admin-requests
   */
  async submitEventAdminRequest(requestReason) {
    return await apiClient.post('/event-admin-requests', { requestReason });
  },

  /**
   * Fetch my own submitted App Admin privilege requests
   * API: GET /api/app-admin-requests/my
   */
  async getMyRequests() {
    return await apiClient.get('/app-admin-requests/my');
  },

  /**
   * Fetch my own submitted Event Admin privilege requests
   * API: GET /api/event-admin-requests/my
   */
  async getMyEventAdminRequests() {
    return await apiClient.get('/event-admin-requests/my');
  },

  /**
   * Fetch pending App Admin requests (App Admin)
   * API: GET /api/admin/app-admin-requests?status=PENDING
   */
  async getPendingRequests(status = 'PENDING') {
    return await apiClient.get(`/admin/app-admin-requests?status=${status}`);
  },

  /**
   * Fetch pending Event Admin requests (App Admin)
   * API: GET /api/admin/event-admin-requests?status=PENDING
   */
  async getPendingEventAdminRequests(status = 'PENDING') {
    return await apiClient.get(`/admin/event-admin-requests?status=${status}`);
  },

  /**
   * Approve an App Admin request
   * API: POST /api/admin/app-admin-requests/{id}/approve
   */
  async approveRequest(requestId) {
    return await apiClient.post(`/admin/app-admin-requests/${requestId}/approve`, {});
  },

  /**
   * Approve an Event Admin request
   * API: POST /api/admin/event-admin-requests/{id}/approve
   */
  async approveEventAdminRequest(requestId) {
    return await apiClient.post(`/admin/event-admin-requests/${requestId}/approve`, {});
  },

  /**
   * Reject an App Admin request
   * API: POST /api/admin/app-admin-requests/{id}/reject
   */
  async rejectRequest(requestId, remarks = '') {
    return await apiClient.post(`/admin/app-admin-requests/${requestId}/reject`, { remarks });
  },

  /**
   * Reject an Event Admin request
   * API: POST /api/admin/event-admin-requests/{id}/reject
   */
  async rejectEventAdminRequest(requestId, remarks = '') {
    return await apiClient.post(`/admin/event-admin-requests/${requestId}/reject`, { remarks });
  },

  /**
   * View all Application Admins
   */
  async getApplicationAdmins() {
    return await apiClient.get('/admin/application-admins');
  },

  /**
   * Remove Application Admin
   */
  async removeApplicationAdmin(id) {
    return await apiClient.delete(`/admin/application-admins/${id}`);
  },

  /**
   * View all Event Admins
   */
  async getEventAdmins() {
    try {
      return await apiClient.get('/event-admin/event-admins');
    } catch (e) {
      return await apiClient.get('/admin/application-admins/event-admins');
    }
  },

  /**
   * Remove Event Admin
   */
  async removeEventAdmin(id) {
    return await apiClient.delete(`/admin/application-admins/event-admins/${id}`);
  },
};
