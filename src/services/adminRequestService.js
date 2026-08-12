import { apiClient } from './apiClient';

export const adminRequestService = {
  /**
   * Submit an Event Admin request (Student)
   * API: POST /api/app-admin-requests
   * Payload: { requestReason }
   */
  async submitRequest(requestReason) {
    return await apiClient.post('/app-admin-requests', { requestReason });
  },

  /**
   * Fetch my own submitted admin privilege requests
   * API: GET /api/app-admin-requests/my
   */
  async getMyRequests() {
    return await apiClient.get('/app-admin-requests/my');
  },

  /**
   * Fetch pending Event Admin requests (App Admin)
   * API: GET /api/admin/app-admin-requests?status=PENDING
   */
  async getPendingRequests(status = 'PENDING') {
    return await apiClient.get(`/admin/app-admin-requests?status=${status}`);
  },

  /**
   * Approve an Event Admin request
   * API: POST /api/admin/app-admin-requests/{id}/approve
   */
  async approveRequest(requestId) {
    return await apiClient.post(`/admin/app-admin-requests/${requestId}/approve`, {});
  },

  /**
   * Reject an Event Admin request
   * API: POST /api/admin/app-admin-requests/{id}/reject
   * Payload: { remarks }
   */
  async rejectRequest(requestId, remarks = '') {
    return await apiClient.post(`/admin/app-admin-requests/${requestId}/reject`, { remarks });
  },

  /**
   * View all Application Admins
   * API: GET /api/admin/application-admins
   */
  async getApplicationAdmins() {
    return await apiClient.get('/admin/application-admins');
  },

  /**
   * Remove Application Admin
   * API: DELETE /api/admin/application-admins/{id}
   */
  async removeApplicationAdmin(id) {
    return await apiClient.delete(`/admin/application-admins/${id}`);
  },
};
