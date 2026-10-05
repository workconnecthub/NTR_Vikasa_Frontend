/**
 * Candidate Applications Service
 * Communicates with /api/v1/candidate/applications using the authenticated apiClient.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateApplicationsService = {
  /**
   * Fetch all applications for the logged-in candidate from MySQL.
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.status] - Status filter (e.g. 'APPLIED', 'SCREENING', etc.)
   * @param {string} [params.search] - Search keyword
   * @returns {Promise<{
   *   candidate: { id: string, full_name: string },
   *   status_counts: { all: number, applied: number, screening: number, shortlisted: number, interview: number, selected: number, rejected: number },
   *   applications: Array
   * }>}
   */
  async getApplications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.status && params.status !== 'ALL') {
        queryParams.set('status', params.status);
      }
      if (params.search && params.search.trim()) {
        queryParams.set('search', params.search.trim());
      }
      const qs = queryParams.toString();
      const endpoint = qs ? `/candidate/applications?${qs}` : '/candidate/applications';
      return await apiClient.get(endpoint);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch application details by ID (verifies ownership).
   * @param {string} applicationId
   */
  async getApplicationDetails(applicationId) {
    try {
      return await apiClient.get(`/candidate/applications/${applicationId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch timeline events for an application (verifies ownership).
   * @param {string} applicationId
   * @returns {Promise<{ application_id: string, timeline: Array }>}
   */
  async getApplicationTimeline(applicationId) {
    try {
      return await apiClient.get(`/candidate/applications/${applicationId}/timeline`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Apply for a job / create a new application
   * @param {Object} data - Application payload ({ job_id, ... })
   * @returns {Promise<Object>}
   */
  async createApplication(data) {
    try {
      return await apiClient.post('/candidate/applications', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateApplicationsService;

