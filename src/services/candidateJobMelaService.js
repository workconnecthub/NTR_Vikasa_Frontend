/**
 * Candidate Job Melas Service
 * Communicates with /api/v1/candidate/job-melas using the authenticated apiClient.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateJobMelaService = {
  /**
   * Fetch all published / eligible Job Melas with category counts, search, and pagination.
   * @param {Object} [params] - Query params
   * @param {string} [params.status] - Filter status: 'ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'
   * @param {string} [params.search] - Search keyword
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.page_size] - Page size (default: 12)
   */
  async getJobMelas(params = {}) {
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
      const endpoint = qs ? `/candidate/job-melas?${qs}` : '/candidate/job-melas';
      return await apiClient.get(endpoint);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch full details for a single Job Mela including participating companies & positions.
   * @param {string} jobMelaId
   */
  async getJobMelaDetails(jobMelaId) {
    try {
      return await apiClient.get(`/candidate/job-melas/${jobMelaId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch candidate's registered event passes.
   * @returns {Promise<Array>}
   */
  async getMyRegistrations() {
    try {
      return await apiClient.get('/candidate/job-melas/registrations');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Register authenticated candidate for a Job Mela.
   * @param {string} jobMelaId
   * @param {Object} data - { time_slot, location, resume, etc. }
   */
  async registerForJobMela(jobMelaId, data = {}) {
    try {
      return await apiClient.post(`/candidate/job-melas/${jobMelaId}/register`, data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Retrieve digital QR pass details for a specific registration.
   * @param {string} registrationId
   */
  async getRegistrationPass(registrationId) {
    try {
      return await apiClient.get(`/candidate/job-melas/registrations/${registrationId}/pass`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Submit walk-in application to a specific company in a Job Mela.
   * @param {string} jobMelaId
   * @param {Object} data - { company_name, role, salary, location, etc. }
   */
  async applyToMelaCompany(jobMelaId, data) {
    try {
      return await apiClient.post(`/candidate/job-melas/${jobMelaId}/apply-company`, data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateJobMelaService;
