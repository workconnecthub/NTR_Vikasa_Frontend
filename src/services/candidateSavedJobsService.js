/**
 * Candidate Saved Jobs Service
 * Communicates with /api/v1/candidate/saved-jobs using the authenticated apiClient.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateSavedJobsService = {
  /**
   * Fetch all saved jobs for the logged-in candidate from MySQL.
   * @param {string} [search] - Optional query string
   * @returns {Promise<{candidate: {id: string, full_name: string}, saved_jobs_count: number, saved_jobs: Array}>}
   */
  async getSavedJobs(search = '') {
    try {
      const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      return await apiClient.get(`/candidate/saved-jobs${query}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Save / bookmark a job in MySQL.
   * @param {Object} jobData
   */
  async saveJob(jobData) {
    try {
      return await apiClient.post('/candidate/saved-jobs', jobData);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Delete a saved job from MySQL by identifier (saved_job_id or job_id).
   * @param {string} identifier
   */
  async removeSavedJob(identifier) {
    try {
      return await apiClient.delete(`/candidate/saved-jobs/${identifier}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateSavedJobsService;
