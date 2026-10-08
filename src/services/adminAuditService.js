import apiClient, { parseApiError } from './apiClient';

export const adminAuditService = {
  /**
   * Fetch paginated audit log records from FastAPI backend.
   * @param {Object} params - { page, page_size, search, action, result }
   * @returns {Promise<Object>} - { items: [], total: number, page: number, page_size: number, total_pages: number }
   */
  async getAuditLogs(params = {}) {
    try {
      return await apiClient.get('/admin/audit-logs', { params });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Export audit log records as a downloadable CSV.
   * @param {Object} params - { search, action, result }
   */
  async exportAuditCsv(params = {}) {
    try {
      const data = await apiClient.get('/admin/audit-logs/export', {
        params,
        responseType: 'blob',
      });

      const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default adminAuditService;
