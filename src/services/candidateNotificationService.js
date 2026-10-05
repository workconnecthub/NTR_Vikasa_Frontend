/**
 * Candidate Notification Service
 * Communicates with /api/v1/candidate/notifications using the authenticated apiClient.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateNotificationService = {
  /**
   * Fetch candidate notifications with optional filters.
   * @param {Object} [params]
   * @param {string} [params.search]
   * @param {string} [params.category]
   * @param {boolean} [params.is_read]
   * @param {boolean} [params.include_dismissed]
   * @param {number} [params.page]
   * @param {number} [params.page_size]
   * @returns {Promise<{ items: Array, total: number, unread_count: number }>}
   */
  async getNotifications(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.search && params.search.trim()) {
        query.set('search', params.search.trim());
      }
      if (params.category && params.category.toUpperCase() !== 'ALL') {
        query.set('category', params.category);
      }
      if (typeof params.is_read === 'boolean') {
        query.set('is_read', String(params.is_read));
      }
      if (typeof params.include_dismissed === 'boolean') {
        query.set('include_dismissed', String(params.include_dismissed));
      }
      if (params.page) {
        query.set('page', String(params.page));
      }
      if (params.page_size) {
        query.set('page_size', String(params.page_size));
      }

      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/candidate/notifications${queryString}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch total unread notification count for the header bell badge.
   * @returns {Promise<{ unread_count: number }>}
   */
  async getUnreadCount() {
    try {
      return await apiClient.get('/candidate/notifications/unread-count');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch a single notification by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getNotificationById(id) {
    try {
      return await apiClient.get(`/candidate/notifications/${encodeURIComponent(id)}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Mark a single notification as read.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async markRead(id) {
    try {
      return await apiClient.patch(`/candidate/notifications/${encodeURIComponent(id)}/read`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Mark multiple notifications (or all if ids is omitted) as read.
   * @param {string[]} [ids]
   * @returns {Promise<Object>}
   */
  async markMultipleRead(ids) {
    try {
      return await apiClient.post('/candidate/notifications/mark-read', {
        notification_ids: ids && ids.length > 0 ? ids : null,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Dismiss a single notification.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async dismiss(id) {
    try {
      return await apiClient.patch(`/candidate/notifications/${encodeURIComponent(id)}/dismiss`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Dismiss multiple notifications.
   * @param {string[]} ids
   * @returns {Promise<Object>}
   */
  async dismissMultiple(ids) {
    try {
      return await apiClient.post('/candidate/notifications/dismiss', {
        notification_ids: ids,
      });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateNotificationService;
