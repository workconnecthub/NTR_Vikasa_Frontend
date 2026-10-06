import apiClient, { parseApiError } from './apiClient';

/**
 * Admin Governance Service
 * Handles API calls to /api/v1/admin/... endpoints:
 * - Job Approvals
 * - Internship Approvals
 * - Company Verifications
 * - Job Mela Participations
 */
const adminService = {
  // ── Job Governance ─────────────────────────────────────────────────────────
  async getJobs(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/jobs${qs}`);
    } catch (err) {
      console.warn('adminService.getJobs error:', parseApiError(err));
      return { items: [], total: 0 };
    }
  },

  async approveJob(jobId) {
    try {
      return await apiClient.post(`/admin/jobs/${jobId}/approve`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async rejectJob(jobId, reason) {
    try {
      return await apiClient.post(`/admin/jobs/${jobId}/reject`, { reason });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // ── Internship Governance ──────────────────────────────────────────────────
  async getInternships(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/internships${qs}`);
    } catch (err) {
      console.warn('adminService.getInternships error:', parseApiError(err));
      return { items: [], total: 0 };
    }
  },

  async approveInternship(internshipId) {
    try {
      return await apiClient.post(`/admin/internships/${internshipId}/approve`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async rejectInternship(internshipId, reason) {
    try {
      return await apiClient.post(`/admin/internships/${internshipId}/reject`, { reason });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // ── Company Verifications ──────────────────────────────────────────────────
  async getCompanies(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/companies${qs}`);
    } catch (err) {
      console.warn('adminService.getCompanies error:', parseApiError(err));
      return [];
    }
  },

  async approveCompany(companyId) {
    try {
      return await apiClient.post(`/admin/companies/${companyId}/approve`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async rejectCompany(companyId, reason) {
    try {
      return await apiClient.post(`/admin/companies/${companyId}/reject`, { reason });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // ── Job Mela Participations ────────────────────────────────────────────────
  async getParticipations(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/job-melas/participations${qs}`);
    } catch (err) {
      console.warn('adminService.getParticipations error:', parseApiError(err));
      return [];
    }
  },

  async approveParticipation(participationId, payload = {}) {
    try {
      return await apiClient.patch(`/admin/job-melas/participations/${participationId}/approve`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async rejectParticipation(participationId, reason) {
    try {
      return await apiClient.patch(`/admin/job-melas/participations/${participationId}/reject`, { reason });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },
};

export default adminService;
