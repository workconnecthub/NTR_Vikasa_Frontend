import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Internship Service
 * Handles API calls to /api/v1/recruiters/internships endpoints.
 */
const recruiterInternshipService = {
  /**
   * Fetch paginated internships for the authenticated recruiter.
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.page_size=10]
   * @param {string} [params.status='ALL'] - 'ALL', 'ACTIVE', 'PENDING', 'DRAFT', 'CLOSED'
   * @param {string} [params.search]
   * @returns {Promise<Object>} { items, total, page, page_size, total_pages }
   */
  async getInternships(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.status && params.status !== 'ALL') {
        // Map frontend tab names if needed
        const statusMap = {
          ACTIVE: 'PUBLISHED',
          PENDING: 'PENDING',
          DRAFT: 'DRAFT',
          CLOSED: 'CLOSED',
        };
        query.set('status', statusMap[params.status] || params.status);
      }
      if (params.search && params.search.trim()) {
        query.set('search', params.search.trim());
      }
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/recruiters/internships${queryString}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Submit new internship opportunity for Admin approval.
   * Status is initialized strictly as PENDING.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createInternship(data) {
    try {
      const payload = {
        title: data.title.trim(),
        stipend: data.stipend,
        duration: data.duration,
        work_mode: data.workMode || data.work_mode || 'Hybrid',
        workMode: data.workMode || data.work_mode || 'Hybrid',
        location: data.location || 'Bengaluru, Karnataka',
        number_of_interns: parseInt(data.openings || data.number_of_interns || 1, 10),
        openings: parseInt(data.openings || data.number_of_interns || 1, 10),
        description: data.description || '',
      };
      return await apiClient.post('/recruiters/internships', payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Close an active published internship.
   * @param {string} internshipId
   * @returns {Promise<Object>}
   */
  async closeInternship(internshipId) {
    try {
      return await apiClient.post(`/recruiters/internships/${internshipId}/close`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Submit draft or rejected internship for Admin approval.
   * @param {string} internshipId
   * @returns {Promise<Object>}
   */
  async submitInternship(internshipId) {
    try {
      return await apiClient.post(`/recruiters/internships/${internshipId}/submit`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterInternshipService;

