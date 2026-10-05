/**
 * Candidate Dashboard Service
 * Calls GET /api/v1/candidate/dashboard using the stored JWT access token.
 * The apiClient interceptor automatically attaches the Authorization header.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateDashboardService = {
  /**
   * Fetch the authenticated candidate's full dashboard data.
   * @returns {Promise<CandidateDashboardResponse>}
   */
  async getDashboard() {
    try {
      return await apiClient.get('/candidate/dashboard');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateDashboardService;
