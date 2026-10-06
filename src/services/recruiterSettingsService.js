import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Settings & Team Management Service
 * Handles authenticated API calls for:
 * - Personal Profile (GET /recruiter/settings/profile, PATCH /recruiter/settings/profile)
 * - Hiring Team & Collaborators (GET /recruiter/settings/team)
 * - Invitations (POST /recruiter/settings/team/invitations, resend, remove/deactivate)
 * - Notification Preferences (GET /recruiter/settings/notifications, PATCH /recruiter/settings/notifications)
 * - Account Security & Password (POST /auth/change-password)
 * - Invitation Validation & Acceptance (GET /auth/invitations/{token}/validate, POST /auth/recruiter/invitations/accept)
 */
const recruiterSettingsService = {
  /**
   * Fetch authenticated recruiter's personal profile and company association.
   */
  async getProfile() {
    try {
      return await apiClient.get('/recruiter/settings/profile');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update authenticated recruiter's personal profile.
   * @param {Object} data - { full_name, designation, phone }
   */
  async updateProfile(data) {
    try {
      return await apiClient.patch('/recruiter/settings/profile', {
        full_name: data.name || data.full_name,
        name: data.name || data.full_name,
        designation: data.designation,
        phone: data.phone || data.mobile_phone,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch hiring team members and pending invitations for the company.
   */
  async getTeam() {
    try {
      return await apiClient.get('/recruiter/settings/team');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Invite a new team member to collaborate.
   * @param {Object} data - { name, email, role }
   */
  async inviteMember(data) {
    try {
      return await apiClient.post('/recruiter/settings/team/invitations', {
        name: data.name,
        full_name: data.name,
        email: data.email,
        role: data.role,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Resend invitation email with a fresh secure token.
   * @param {string} invitationId
   */
  async resendInvitation(invitationId) {
    try {
      return await apiClient.post(`/recruiter/settings/team/invitations/${invitationId}/resend`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Deactivate a team member or cancel pending invitation.
   * @param {string} memberId
   */
  async removeMember(memberId) {
    try {
      return await apiClient.delete(`/recruiter/settings/team/members/${memberId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch recruiter's personal notification preferences.
   */
  async getNotificationPreferences() {
    try {
      return await apiClient.get('/recruiter/settings/notifications');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update recruiter's notification preferences.
   * @param {Object} data - { applicantAlerts, interviewAlerts, jobMelaAlerts, weeklyDigest }
   */
  async updateNotificationPreferences(data) {
    try {
      return await apiClient.patch('/recruiter/settings/notifications', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Change account password.
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   */
  async changePassword(data) {
    try {
      return await apiClient.post('/auth/change-password', {
        current_password: data.currentPassword,
        currentPassword: data.currentPassword,
        new_password: data.newPassword,
        newPassword: data.newPassword,
        confirm_password: data.confirmPassword,
        confirmPassword: data.confirmPassword,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Validate invitation token for public accept page.
   * @param {string} token
   */
  async validateInvitation(token) {
    try {
      return await apiClient.get(`/auth/invitations/${token}/validate`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Accept invitation and set credentials.
   * @param {Object} data - { token, password, confirmPassword, name }
   */
  async acceptInvitation(data) {
    try {
      return await apiClient.post('/auth/recruiter/invitations/accept', {
        token: data.token,
        password: data.password,
        confirm_password: data.confirmPassword || data.password,
        confirmPassword: data.confirmPassword || data.password,
        name: data.name,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterSettingsService;
