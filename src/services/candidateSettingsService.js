/**
 * Candidate Settings & Privacy API Service
 * Handles notification preferences, recruiter visibility, secure password change, and account deactivation.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateSettingsService = {
  /**
   * Fetch current settings and preferences for the authenticated candidate.
   * @returns {Promise<{
   *   email_job_application_alerts: boolean,
   *   sms_whatsapp_notifications: boolean,
   *   upcoming_interview_reminders: boolean,
   *   weekly_job_recommendation_digest: boolean,
   *   visible_in_recruiter_talent_search: boolean,
   *   direct_recruiter_messages: boolean
   * }>}
   */
  async getSettings() {
    try {
      return await apiClient.get('/candidate/settings');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Persist updated notification preferences.
   * @param {Object} data
   * @param {boolean} [data.email_job_application_alerts]
   * @param {boolean} [data.sms_whatsapp_notifications]
   * @param {boolean} [data.upcoming_interview_reminders]
   * @param {boolean} [data.weekly_job_recommendation_digest]
   * @returns {Promise<Object>} Updated settings object
   */
  async updateNotifications(data) {
    try {
      return await apiClient.patch('/candidate/settings/notifications', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Persist updated profile visibility and recruiter messaging preferences.
   * @param {Object} data
   * @param {boolean} [data.visible_in_recruiter_talent_search]
   * @param {boolean} [data.direct_recruiter_messages]
   * @returns {Promise<Object>} Updated settings object
   */
  async updatePrivacy(data) {
    try {
      return await apiClient.patch('/candidate/settings/privacy', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update candidate account password after verifying current password.
   * @param {Object} data
   * @param {string} data.current_password
   * @param {string} data.new_password
   * @param {string} data.confirm_password
   * @returns {Promise<{ message: string, status: string }>}
   */
  async changePassword(data) {
    try {
      return await apiClient.patch('/candidate/settings/password', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Deactivate/delete candidate account.
   * @returns {Promise<{ message: string, status: string }>}
   */
  async deleteAccount() {
    try {
      return await apiClient.delete('/candidate/account');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateSettingsService;
