import apiClient, { parseApiError } from './apiClient';

export const adminDashboardService = {
  /**
   * Fetch platform command center dashboard metrics, moderation queues, stream items, and recent audit trail.
   * @returns {Promise<Object>} - { moderation_queue: {}, platform_overview: {}, pending_moderation_stream: [], recent_audit_logs: [] }
   */
  async getDashboard() {
    try {
      return await apiClient.get('/admin/dashboard');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default adminDashboardService;
