/**
 * Candidate Support Service
 * Communicates with /api/v1/candidate/support/tickets using the authenticated apiClient.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateSupportService = {
  /**
   * Submit a new support ticket.
   * @param {Object} data
   * @param {string} data.issue_category
   * @param {string} data.subject
   * @param {string} data.description
   * @returns {Promise<{ message: string, ticket: Object }>}
   */
  async createTicket(data) {
    try {
      return await apiClient.post('/candidate/support/tickets', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch all tickets for the authenticated candidate.
   * @returns {Promise<{ items: Array, total: number }>}
   */
  async getMyTickets() {
    try {
      return await apiClient.get('/candidate/support/tickets');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch details for a specific ticket.
   * @param {string} ticketNumber
   * @returns {Promise<Object>}
   */
  async getTicketDetails(ticketNumber) {
    try {
      return await apiClient.get(`/candidate/support/tickets/${encodeURIComponent(ticketNumber)}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateSupportService;
