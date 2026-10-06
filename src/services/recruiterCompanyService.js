import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Company Profile Service
 * Handles operations against /api/v1/recruiter/company endpoints:
 * - GET company profile
 * - PATCH / update company profile
 * - POST company logo upload
 */
const recruiterCompanyService = {
  /**
   * Fetch company profile of the authenticated recruiter.
   * @returns {Promise<Object>}
   */
  async getCompanyProfile() {
    try {
      return await apiClient.get('/recruiter/company/profile');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update company profile details for the authenticated recruiter.
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  async updateCompanyProfile(profileData) {
    try {
      return await apiClient.patch('/recruiter/company/profile', profileData);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Upload and update company logo.
   * @param {File} file
   * @returns {Promise<{ logo_url: string, message: string }>}
   */
  async uploadCompanyLogo(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await apiClient.post('/recruiter/company/logo', formData);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterCompanyService;
