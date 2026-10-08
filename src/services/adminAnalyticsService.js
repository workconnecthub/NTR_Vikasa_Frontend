import apiClient, { parseApiError } from './apiClient';

export const adminAnalyticsService = {
  /**
   * Fetch platform-wide aggregated analytics metrics.
   * @param {Object} params - { period: '7d'|'30d'|'90d'|'1y'|'custom', start_date, end_date }
   * @returns {Promise<Object>} AdminAnalyticsResponse
   */
  async getAnalytics(params = {}) {
    try {
      return await apiClient.get('/admin/analytics', { params });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Export platform analytics report as downloadable CSV.
   * @param {Object} params - { period, start_date, end_date }
   */
  async exportAnalyticsCsv(params = {}) {
    try {
      const data = await apiClient.get('/admin/analytics/export', {
        params,
        responseType: 'blob',
      });

      const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `platform_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default adminAnalyticsService;
