import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Job Mela Service
 * Handles API calls to /api/v1/recruiter/job-melas endpoints.
 */
const recruiterJobMelaService = {
  /**
   * Fetch Job Melas participation listing for the authenticated recruiter.
   * @param {Object} [params]
   * @param {string} [params.status='ALL'] - 'ALL', 'APPROVED', or 'PENDING'
   * @param {string} [params.search] - Search text for title, venue, city, booth
   * @returns {Promise<Array>}
   */
  async getJobMelas(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'ALL') {
        query.set('status', params.status);
      }
      if (params.search && params.search.trim()) {
        query.set('search', params.search.trim());
      }
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/recruiter/job-melas${queryString}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch available upcoming Job Melas for registration dropdown.
   * @returns {Promise<Array>}
   */
  async getAvailableJobMelas() {
    try {
      return await apiClient.get('/recruiter/job-melas/available');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Submit a company participation request for a Job Mela.
   * Status is initialized strictly as PENDING awaiting admin review.
   * @param {Object} data
   * @param {string} [data.job_mela_id]
   * @param {string} [data.title]
   * @param {string} [data.openings]
   * @param {string} [data.positions]
   * @param {number} [data.target_hires]
   * @param {number} [data.expectedHires]
   * @returns {Promise<Object>}
   */
  async registerJobMela(data) {
    try {
      const payload = {
        job_mela_id: data.job_mela_id || data.id || null,
        title: data.title || null,
        openings: data.openings || data.positions || '',
        positions: data.positions || data.openings || '',
        target_hires: parseInt(data.target_hires || data.expectedHires || data.expected_hires || 1, 10),
        expectedHires: parseInt(data.expectedHires || data.target_hires || 1, 10),
      };
      return await apiClient.post('/recruiter/job-melas/participate', payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterJobMelaService;
