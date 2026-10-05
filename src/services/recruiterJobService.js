import apiClient, { parseApiError } from './apiClient';

/**
 * Recruiter Job Service
 * Handles API calls to /api/v1/recruiters/jobs endpoints.
 */
const recruiterJobService = {
  /**
   * Fetch paginated jobs for the authenticated recruiter.
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.page_size=10]
   * @param {string} [params.status='ALL'] - 'ALL', 'ACTIVE', 'PENDING', 'DRAFT', 'CLOSED'
   * @param {string} [params.department]
   * @param {string} [params.search]
   * @returns {Promise<Object>} { items, total, page, page_size, total_pages }
   */
  async getJobs(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.status && params.status !== 'ALL') {
        const statusMap = {
          ACTIVE: 'PUBLISHED',
          PENDING: 'PENDING',
          DRAFT: 'DRAFT',
          CLOSED: 'CLOSED',
        };
        query.set('status', statusMap[params.status] || params.status);
      }
      if (params.department && params.department !== 'ALL') {
        query.set('department', params.department);
      }
      if (params.search && params.search.trim()) {
        query.set('search', params.search.trim());
      }
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/recruiters/jobs${queryString}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Fetch single job detail for recruiter.
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  async getJob(jobId) {
    try {
      return await apiClient.get(`/recruiters/jobs/${jobId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Submit new job opening for Admin approval.
   * Status is initialized strictly as PENDING.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createJob(data) {
    try {
      const payload = {
        title: data.title?.trim() || '',
        department: data.department || 'Core Engineering',
        job_type: data.jobType || data.employment_type || 'Full-time',
        employment_type: data.jobType || data.employment_type || 'Full-time',
        work_mode: data.workMode || data.workplace_policy || 'Hybrid',
        workplace_policy: data.workMode || data.workplace_policy || 'Hybrid',
        location: data.location || 'Bengaluru, Karnataka',
        experience: data.experience || '3-5 years',
        experience_level: data.experience || '3-5 years',
        salary: data.salary || '',
        openings: parseInt(data.openings || data.number_of_openings || 1, 10),
        number_of_openings: parseInt(data.openings || data.number_of_openings || 1, 10),
        deadline: data.deadline || data.application_deadline || '',
        application_deadline: data.deadline || data.application_deadline || '',
        description: data.description || data.job_summary || '',
        job_summary: data.description || data.job_summary || '',
        responsibilities: data.responsibilities || data.key_responsibilities || '',
        key_responsibilities: data.responsibilities || data.key_responsibilities || '',
        requirements: data.requirements || data.technical_requirements || '',
        technical_requirements: data.requirements || data.technical_requirements || '',
        qualifications: data.qualifications || data.educational_qualifications || '',
        educational_qualifications: data.qualifications || data.educational_qualifications || '',
        skills: data.skills || [],
      };
      return await apiClient.post('/recruiters/jobs', payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Save a job opening as DRAFT.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async saveJobDraft(data) {
    try {
      const payload = {
        title: data.title?.trim() || '',
        department: data.department || 'Core Engineering',
        job_type: data.jobType || data.employment_type || 'Full-time',
        employment_type: data.jobType || data.employment_type || 'Full-time',
        work_mode: data.workMode || data.workplace_policy || 'Hybrid',
        workplace_policy: data.workMode || data.workplace_policy || 'Hybrid',
        location: data.location || 'Bengaluru, Karnataka',
        experience: data.experience || '3-5 years',
        experience_level: data.experience || '3-5 years',
        salary: data.salary || '',
        openings: parseInt(data.openings || data.number_of_openings || 1, 10),
        number_of_openings: parseInt(data.openings || data.number_of_openings || 1, 10),
        deadline: data.deadline || data.application_deadline || '',
        application_deadline: data.deadline || data.application_deadline || '',
        description: data.description || data.job_summary || '',
        job_summary: data.description || data.job_summary || '',
        responsibilities: data.responsibilities || data.key_responsibilities || '',
        key_responsibilities: data.responsibilities || data.key_responsibilities || '',
        requirements: data.requirements || data.technical_requirements || '',
        technical_requirements: data.requirements || data.technical_requirements || '',
        qualifications: data.qualifications || data.educational_qualifications || '',
        educational_qualifications: data.qualifications || data.educational_qualifications || '',
        skills: data.skills || [],
      };
      return await apiClient.post('/recruiters/jobs/draft', payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update an existing job.
   * @param {string} jobId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateJob(jobId, data) {
    try {
      return await apiClient.put(`/recruiters/jobs/${jobId}`, data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Close an active published job.
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  async closeJob(jobId) {
    try {
      return await apiClient.post(`/recruiters/jobs/${jobId}/close`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default recruiterJobService;
