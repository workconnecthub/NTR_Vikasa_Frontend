import apiClient, { parseApiError } from './apiClient';

/**
 * Admin Profile & Identity Management Service
 * Communicates with /api/v1/admin/profile endpoints using authenticated apiClient.
 */
export const adminProfileService = {
  /**
   * Fetch authenticated administrator's profile information.
   * GET /api/v1/admin/profile
   */
  async getProfile() {
    try {
      return await apiClient.get('/admin/profile');
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  /**
   * Update administrator profile details (full_name, email, designation, contact_phone).
   * PATCH /api/v1/admin/profile
   * @param {Object} profileData
   */
  async updateProfile(profileData) {
    try {
      return await apiClient.patch('/admin/profile', profileData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  /**
   * Upload and persist administrator avatar photo.
   * POST /api/v1/admin/profile/image
   * @param {File} file
   */
  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await apiClient.post('/admin/profile/image', formData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },
};

export default adminProfileService;
