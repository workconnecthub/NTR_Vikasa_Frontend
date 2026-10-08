import apiClient, { parseApiError } from './apiClient';

/**
 * Admin Platform Settings Service
 * Connects to /api/v1/admin/settings
 */
export const adminSettingsService = {
  /**
   * Fetch current global platform settings
   * @returns {Promise<Object>} PlatformSettingsResponse
   */
  async getSettings() {
    try {
      return await apiClient.get('/admin/settings');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update global platform settings
   * @param {Object} payload - { platform_display_name, primary_support_email, grievance_redressal_email, ... }
   * @returns {Promise<Object>} PlatformSettingsResponse
   */
  async updateSettings(payload) {
    try {
      return await apiClient.patch('/admin/settings', payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default adminSettingsService;
