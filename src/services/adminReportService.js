import apiClient, { parseApiError } from './apiClient';

export const adminReportService = {
  /**
   * Fetch paginated reports and complaints from FastAPI backend.
   * @param {Object} params - { status, reported_user_type, search, page, page_size, sort_by, sort_order }
   * @returns {Promise<Object>} - { items: [], total: number, page: number, page_size: number, total_pages: number }
   */
  async getReports(params = {}) {
    try {
      return await apiClient.get('/admin/reports', { params });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch aggregate summary counts for moderation tabs and badges.
   * @returns {Promise<Object>} - { all: number, pending: number, resolved: number, dismissed: number, open_complaints: number }
   */
  async getSummary() {
    try {
      return await apiClient.get('/admin/reports/summary');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch complete grievance report details by ID.
   * @param {string} reportId
   * @returns {Promise<Object>}
   */
  async getReportDetail(reportId) {
    try {
      return await apiClient.get(`/admin/reports/${reportId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Mark a pending report as RESOLVED with administrative notes.
   * @param {string} reportId
   * @param {Object} payload - { admin_notes, resolution_reason }
   * @returns {Promise<Object>} - { message: string, report: Object }
   */
  async resolveReport(reportId, payload = {}) {
    try {
      return await apiClient.patch(`/admin/reports/${reportId}/resolve`, payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Mark a pending report as DISMISSED.
   * @param {string} reportId
   * @param {Object} payload - { admin_notes, resolution_reason }
   * @returns {Promise<Object>} - { message: string, report: Object }
   */
  async dismissReport(reportId, payload = {}) {
    try {
      return await apiClient.patch(`/admin/reports/${reportId}/dismiss`, payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Export moderation complaints as downloadable CSV.
   * @param {Object} params - { status, reported_user_type, search }
   */
  async exportReportsCsv(params = {}) {
    try {
      const data = await apiClient.get('/admin/reports/export', {
        params,
        responseType: 'blob',
      });

      const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `moderation_reports_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default adminReportService;
