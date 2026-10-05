import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Support Service
 * Handles communication with /api/v1/recruiter/support endpoints.
 */
const recruiterSupportService = {
  /**
   * Submit a new support request for the authenticated recruiter.
   * @param {Object} data
   * @param {string} data.issue_category
   * @param {string} data.subject
   * @param {string} data.description
   * @returns {Promise<{ message: string, ticket_number: string, status: string }>}
   */
  async submitSupportRequest(data) {
    try {
      return await apiClient.post('/recruiter/support/requests', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch all support requests for the authenticated recruiter.
   * @returns {Promise<{ items: Array, total: number }>}
   */
  async getSupportRequests() {
    try {
      return await apiClient.get('/recruiter/support/requests');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterSupportService;
