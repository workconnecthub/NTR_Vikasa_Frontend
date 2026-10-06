import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Application Service
 * Handles API calls to /api/v1/recruiter/applications endpoints.
 */
const recruiterApplicationService = {
  /**
   * Fetch paginated applications for authenticated recruiter.
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.page_size=9]
   * @param {string} [params.search]
   * @param {string} [params.job_id]
   * @param {string} [params.status]
   * @param {string} [params.sort_by]
   * @param {string} [params.sort_order]
   * @param {string} [params.application_type]
   * @returns {Promise<Object>} { items, pagination, summary, job_postings }
   */
  async getApplications(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.search && params.search.trim()) {
        query.set('search', params.search.trim());
      }
      if (params.job_id && params.job_id !== 'ALL') {
        query.set('job_id', params.job_id);
      }
      if (params.status && params.status !== 'ALL') {
        query.set('status', params.status);
      }
      if (params.sort_by) {
        query.set('sort_by', params.sort_by);
      }
      if (params.sort_order) {
        query.set('sort_order', params.sort_order);
      }
      if (params.application_type) {
        query.set('application_type', params.application_type);
      }

      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/recruiter/applications${queryString}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch full application details.
   * @param {string} applicationId
   * @returns {Promise<Object>}
   */
  async getApplication(applicationId) {
    try {
      return await apiClient.get(`/recruiter/applications/${applicationId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update application status (SCREENING, SHORTLISTED, INTERVIEW, SELECTED, REJECTED).
   * @param {string} applicationId
   * @param {string} status
   * @param {string} [notes]
   * @returns {Promise<Object>}
   */
  async updateApplicationStatus(applicationId, status, notes = '') {
    try {
      return await apiClient.patch(`/recruiter/applications/${applicationId}/status`, {
        status,
        notes,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterApplicationService;
