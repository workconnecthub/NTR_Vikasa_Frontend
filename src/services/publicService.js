import apiClient, { parseApiError } from './apiClient';

/**
 * Public Data Service
 * Provides public visitor / candidate access to strictly APPROVED & PUBLISHED backend data:
 * - Jobs (/jobs)
 * - Internships (/internships)
 * - Companies (/companies)
 * - Job Melas (/job-melas)
 */
const publicService = {
  /**
   * Fetch approved/published jobs.
   * @param {Object} [params]
   * @returns {Promise<Object>} { items, total, page, page_size, total_pages }
   */
  async getPublishedJobs(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.search || params.q) query.set('search', params.search || params.q);
      if (params.location && params.location !== 'All Locations') query.set('location', params.location);
      if (params.experience_level || params.experience) query.set('experience_level', params.experience_level || params.experience);
      if (params.salary_min !== undefined && params.salary_min !== null && params.salary_min !== '') query.set('salary_min', params.salary_min);
      if (params.salary_max !== undefined && params.salary_max !== null && params.salary_max !== '') query.set('salary_max', params.salary_max);
      if (params.salary_range || params.salary) query.set('salary_range', params.salary_range || params.salary);
      if (params.work_mode || params.mode) query.set('work_mode', params.work_mode || params.mode);
      if (params.employment_type || params.job_type || params.type) query.set('employment_type', params.employment_type || params.job_type || params.type);
      if (params.required_skill || params.skill) query.set('required_skill', params.required_skill || params.skill);
      if (params.industry_sector || params.industry || params.department) query.set('industry_sector', params.industry_sector || params.industry || params.department);
      if (params.sort || params.sort_by || params.sortBy) query.set('sort', params.sort || params.sort_by || params.sortBy);

      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/jobs${qs}`);
    } catch (err) {
      console.warn('publicService.getPublishedJobs error:', parseApiError(err));
      return { items: [], total: 0, page: 1, page_size: params.page_size || 12, total_pages: 1 };
    }
  },

  /**
   * Fetch single published job by ID or number.
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  async getPublishedJob(jobId) {
    try {
      return await apiClient.get(`/jobs/${jobId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  /**
   * Fetch approved/published internships.
   * @param {Object} [params]
   * @returns {Promise<Object>} { items, total, page, page_size, total_pages }
   */
  async getPublishedInternships(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.search || params.q) query.set('search', params.search || params.q);
      if (params.location && params.location !== 'All Locations') query.set('location', params.location);
      if (params.mode || params.work_mode) query.set('mode', params.mode || params.work_mode);
      if (params.duration && params.duration !== 'All Durations') query.set('duration', params.duration);
      if (params.stipend_min !== undefined && params.stipend_min !== null && params.stipend_min !== '') query.set('stipend_min', params.stipend_min);
      if (params.stipend_max !== undefined && params.stipend_max !== null && params.stipend_max !== '') query.set('stipend_max', params.stipend_max);
      if (params.company_id) query.set('company_id', params.company_id);
      if (params.sort || params.sort_by || params.sortBy) query.set('sort', params.sort || params.sort_by || params.sortBy);

      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/internships${qs}`);
    } catch (err) {
      console.warn('publicService.getPublishedInternships error:', parseApiError(err));
      return { items: [], total: 0, page: 1, page_size: params.page_size || 12, total_pages: 1 };
    }
  },

  /**
   * Fetch single published internship by ID.
   * @param {string} internshipId
   * @returns {Promise<Object>}
   */
  async getPublishedInternship(internshipId) {
    try {
      return await apiClient.get(`/internships/${internshipId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  /**
   * Fetch approved/verified companies.
   * @param {Object} [params]
   * @returns {Promise<Object>} { items, total, page, page_size, total_pages }
   */
  async getPublishedCompanies(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.search) query.set('search', params.search);
      if (params.industry) query.set('industry', params.industry);
      if (params.location) query.set('location', params.location);

      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/companies${qs}`);
    } catch (err) {
      console.warn('publicService.getPublishedCompanies error:', parseApiError(err));
      return { items: [], total: 0 };
    }
  },

  /**
   * Fetch single verified company.
   * @param {string} companyId
   * @returns {Promise<Object>}
   */
  async getPublishedCompany(companyId) {
    try {
      return await apiClient.get(`/companies/${companyId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  /**
   * Fetch approved/published job melas.
   * @returns {Promise<Array>}
   */
  async getPublishedJobMelas() {
    try {
      return await apiClient.get('/job-melas');
    } catch (err) {
      console.warn('publicService.getPublishedJobMelas error:', parseApiError(err));
      return [];
    }
  },
};

export default publicService;
