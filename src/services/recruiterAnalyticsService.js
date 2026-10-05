import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Hiring Analytics Service
 * Handles API calls to /api/v1/recruiter/analytics endpoints.
 */
const recruiterAnalyticsService = {
  /**
   * Fetch hiring analytics metrics for the authenticated recruiter.
   * @param {Object} [params]
   * @param {string} [params.date_range] - '7d', '30d', '90d', '1y', 'custom'
   * @param {string} [params.start_date] - 'YYYY-MM-DD'
   * @param {string} [params.end_date] - 'YYYY-MM-DD'
   * @returns {Promise<Object>}
   */
  async getAnalytics(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.date_range) {
        query.set('date_range', params.date_range);
      }
      if (params.start_date) {
        query.set('start_date', params.start_date);
      }
      if (params.end_date) {
        query.set('end_date', params.end_date);
      }

      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/recruiter/analytics${queryString}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Export recruiter analytics report as a downloadable CSV.
   * @param {Object} [params]
   * @param {string} [params.date_range]
   * @param {string} [params.start_date]
   * @param {string} [params.end_date]
   * @param {string} [params.format='csv']
   * @returns {Promise<void>}
   */
  async exportReport(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.date_range) {
        query.set('date_range', params.date_range);
      }
      if (params.start_date) {
        query.set('start_date', params.start_date);
      }
      if (params.end_date) {
        query.set('end_date', params.end_date);
      }
      query.set('format', params.format || 'csv');

      const response = await apiClient.get(`/recruiter/analytics/export?${query.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `recruiter_hiring_analytics_${params.date_range || 'report'}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterAnalyticsService;
