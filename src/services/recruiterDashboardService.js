/**
 * Recruiter Dashboard Service
 * Calls GET /api/v1/recruiter/dashboard using the stored JWT access token.
 * The apiClient automatically attaches the Authorization: Bearer <token> header.
 */
import apiClient, { parseApiError } from './apiClient';

const recruiterDashboardService = {
  /**
   * Fetch authenticated recruiter's live dashboard data:
   * recruiter identity, summary cards, pipeline funnel, recent applications, active jobs, upcoming interviews.
   * @returns {Promise<RecruiterDashboardResponse>}
   */
  async getDashboard() {
    try {
      return await apiClient.get('/recruiter/dashboard');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterDashboardService;
