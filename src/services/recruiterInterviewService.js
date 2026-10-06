import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Interview Service
 * Handles API calls to /api/v1/recruiter/interviews endpoints.
 */
const recruiterInterviewService = {
  /**
   * Fetch paginated interviews for the authenticated recruiter.
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.page_size=50]
   * @param {string} [params.status='ALL']
   * @param {string} [params.search]
   * @returns {Promise<Object>} { items, total, page, page_size, tab_counts }
   */
  async getInterviews(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.status && params.status !== 'ALL') {
        query.set('status', params.status);
      }
      if (params.search && params.search.trim()) {
        query.set('search', params.search.trim());
      }
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/recruiter/interviews${queryString}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch single interview detail for recruiter.
   * @param {string} interviewId
   * @returns {Promise<Object>}
   */
  async getInterview(interviewId) {
    try {
      return await apiClient.get(`/recruiter/interviews/${interviewId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Schedule new interview round for an application.
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async scheduleInterview(payload) {
    try {
      return await apiClient.post('/recruiter/interviews', payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Reschedule an existing interview round.
   * @param {string} interviewId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async rescheduleInterview(interviewId, payload) {
    try {
      return await apiClient.patch(`/recruiter/interviews/${interviewId}`, payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Cancel an interview.
   * @param {string} interviewId
   * @param {string} reason
   * @returns {Promise<Object>}
   */
  async cancelInterview(interviewId, reason) {
    try {
      return await apiClient.post(`/recruiter/interviews/${interviewId}/cancel`, {
        reason: reason || 'Candidate requested rescheduling/cancellation',
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Mark interview as completed.
   * @param {string} interviewId
   * @param {string} [notes]
   * @returns {Promise<Object>}
   */
  async completeInterview(interviewId, notes = '') {
    try {
      return await apiClient.post(`/recruiter/interviews/${interviewId}/complete`, {
        notes,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterInterviewService;
