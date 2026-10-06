/**
 * Candidate Interview Service
 * Communicates with /api/v1/candidate/interviews using the authenticated apiClient.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateInterviewService = {
  /**
   * Fetch interviews for the authenticated candidate with dynamic category counts and pagination.
   * @param {Object} [params]
   * @param {string} [params.status] - 'ALL', 'UPCOMING', 'TODAY', 'COMPLETED'
   * @param {string} [params.search] - Search keyword
   * @param {number} [params.page] - Page number (default 1)
   * @param {number} [params.pageSize] - Page size (default 9)
   * @returns {Promise<{
   *   items: Array,
   *   total: number,
   *   page: number,
   *   page_size: number,
   *   total_pages: number,
   *   counts: { all: number, upcoming: number, today: number, completed: number }
   * }>}
   */
  async getInterviews(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.status && params.status !== 'ALL') {
        queryParams.set('status', params.status);
      }
      if (params.search && params.search.trim()) {
        queryParams.set('search', params.search.trim());
      }
      if (params.page) {
        queryParams.set('page', params.page);
      }
      if (params.pageSize || params.page_size) {
        queryParams.set('page_size', params.pageSize || params.page_size);
      }
      const qs = queryParams.toString();
      const endpoint = qs ? `/candidate/interviews?${qs}` : '/candidate/interviews';
      return await apiClient.get(endpoint);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch single interview details by ID (verifies candidate ownership).
   * @param {string} interviewId
   * @returns {Promise<Object>}
   */
  async getInterviewDetail(interviewId) {
    try {
      return await apiClient.get(`/candidate/interviews/${interviewId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateInterviewService;
