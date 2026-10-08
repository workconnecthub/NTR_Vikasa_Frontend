import apiClient, { TOKEN_STORAGE_KEYS, clearAuthStorage, parseApiError } from './apiClient';

/**
 * Authentication Service for NTR VIKASA FastAPI Backend
 * Handles login, registration (candidate & recruiter), OTP, token refresh, and session persistence.
 */
export const authService = {
  /**
   * Multi-role login: Candidate, Recruiter, Admin
   * @param {Object} credentials - { email, password, role }
   * @returns {Promise<Object>} { access_token, refresh_token, token_type, user }
   */
  async login({ email, password, role = 'CANDIDATE' }) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
        role: role.toUpperCase(),
      });
      authService.saveAuthSession(response);
      return response;
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Candidate Registration KYC
   * @param {Object} payload - { name, email, phone, password, aadhaar_number, district, mandal, village, qualification_level }
   * @returns {Promise<Object>} TokenResponse with authenticated session
   */
  async registerCandidate(payload) {
    try {
      const response = await apiClient.post('/auth/candidate/register', {
        name: (payload.name || '').trim(),
        email: (payload.email || '').trim(),
        phone: (payload.phone || '').replace(/[\s\-()]/g, ''),
        password: payload.password,
        aadhaar_number: (payload.aadhaar_number || '').replace(/[\s\-]/g, ''),
        district: payload.district || 'NTR District',
        mandal: payload.mandal || 'Vijayawada Urban',
        village: payload.village ? payload.village.trim() : null,
        qualification_level: payload.qualification_level || '10TH',
        reference_admin: payload.reference_admin || payload.referenceAdmin || null,
        terms_accepted: payload.terms_accepted !== undefined ? payload.terms_accepted : true,
      });
      clearAuthStorage();
      return response;
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Recruiter Registration with optional document uploads
   * @param {FormData} formData
   * @returns {Promise<Object>} { status: "PENDING", message, company_id }
   */
  async registerRecruiter(formData) {
    try {
      const response = await apiClient.post('/auth/recruiter/register', formData);
      return response;
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Request password reset link to registered email
   * @param {string} email - Registered account email address
   * @returns {Promise<Object>} { message }
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      return response;
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Reset password using token from email link
   * @param {Object} payload - { token, new_password, confirm_password }
   * @returns {Promise<Object>} { message }
   */
  async resetPassword({ token, new_password, confirm_password }) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token: (token || '').trim(),
        new_password,
        confirm_password,
      });
      return response;
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Request OTP code for login/registration
   * @param {string} identifier - Email or phone
   * @param {string} purpose - "LOGIN" | "REGISTER" | "FORGOT_PASSWORD"
   */
  async sendOtp(identifier, purpose = 'REGISTER') {
    try {
      return await apiClient.post('/auth/otp/send', {
        identifier: identifier.trim(),
        purpose,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Verify 6-digit OTP code
   * @param {string} identifier - Email or phone
   * @param {string} otp_code - 6 digit code
   * @param {string} purpose - "LOGIN" | "REGISTER" | "FORGOT_PASSWORD"
   */
  async verifyOtp(identifier, otp_code, purpose = 'REGISTER') {
    try {
      return await apiClient.post('/auth/otp/verify', {
        identifier: identifier.trim(),
        otp_code: String(otp_code).trim(),
        purpose,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Accept Recruiter Team Member Invitation
   * @param {Object} payload - { token, name, password }
   */
  async acceptInvitation({ token, name, password }) {
    try {
      const response = await apiClient.post('/auth/accept-invitation', {
        token,
        name: name?.trim(),
        password,
      });
      authService.saveAuthSession(response);
      return response;
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Validate recruiter team invitation token
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
   * Get Current Authenticated User Identity
   * @returns {Promise<Object>} UserSummary
   */
  async getMe() {
    try {
      const user = await apiClient.get('/auth/me');
      if (user) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
        if (user.role) {
          localStorage.setItem(TOKEN_STORAGE_KEYS.USER_ROLE, user.role);
        }
      }
      return user;
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Change Password for Authenticated User (Admin, Recruiter, Candidate)
   * @param {Object} payload - { current_password, new_password, confirm_password }
   * @returns {Promise<Object>} { status: "success", message: "Password changed successfully." }
   */
  async changePassword({ current_password, new_password, confirm_password }) {
    try {
      const response = await apiClient.post('/auth/change-password', {
        current_password,
        new_password,
        confirm_password,
      });
      return response;
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Explicit Refresh Token Rotation
   */
  async refresh() {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    try {
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      authService.saveAuthSession(response);
      return response;
    } catch (error) {
      authService.logout();
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Save session tokens and authenticated user summary in localStorage
   */
  saveAuthSession(tokenResponse) {
    if (!tokenResponse) return;
    const { access_token, refresh_token, user } = tokenResponse;

    if (access_token) {
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, access_token);
    }
    if (refresh_token) {
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
    }
    if (user) {
      localStorage.setItem(TOKEN_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      if (user.role) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.USER_ROLE, user.role.toUpperCase());
      }
    }
  },

  /**
   * Get current stored access token
   */
  getAccessToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get current stored refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Get current stored user
   */
  getStoredUser() {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEYS.AUTH_USER);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Get current stored role
   */
  getStoredRole() {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.USER_ROLE);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return Boolean(authService.getAccessToken());
  },

  /**
   * Logout user, clear tokens, and reset storage
   */
  logout() {
    clearAuthStorage();
  },
};

export default authService;
