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
      if (params.company && params.company !== 'ALL') query.set('company', params.company);
      if (params.company_id && params.company_id !== 'ALL') query.set('company_id', params.company_id);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/jobs${qs}`);
    } catch (err) {
      console.warn('adminService.getJobs error:', parseApiError(err));
      return { items: [], total: 0 };
    }
  },

  async patchJobApproval(jobId, status, reason = null) {
    try {
      return await apiClient.patch(`/admin/jobs/${jobId}/approval`, { status, reason });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async approveJob(jobId) {
    try {
      return await apiClient.post(`/admin/jobs/${jobId}/approve`);
    } catch (err) {
      // Fallback to patch approval if needed
      try {
        return await apiClient.patch(`/admin/jobs/${jobId}/approval`, { status: 'approved' });
      } catch {
        throw new Error(parseApiError(err));
      }
    }
  },

  async rejectJob(jobId, reason) {
    try {
      return await apiClient.post(`/admin/jobs/${jobId}/reject`, { reason });
    } catch (err) {
      try {
        return await apiClient.patch(`/admin/jobs/${jobId}/approval`, { status: 'rejected', reason });
      } catch {
        throw new Error(parseApiError(err));
      }
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
      if (params.company && params.company !== 'ALL') query.set('company', params.company);
      if (params.company_id && params.company_id !== 'ALL') query.set('company_id', params.company_id);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/internships${qs}`);
    } catch (err) {
      console.warn('adminService.getInternships error:', parseApiError(err));
      return { items: [], total: 0 };
    }
  },

  async patchInternshipApproval(internshipId, status, reason = null) {
    try {
      return await apiClient.patch(`/admin/internships/${internshipId}/approval`, { status, reason });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async approveInternship(internshipId) {
    try {
      return await apiClient.post(`/admin/internships/${internshipId}/approve`);
    } catch (err) {
      try {
        return await apiClient.patch(`/admin/internships/${internshipId}/approval`, { status: 'approved' });
      } catch {
        throw new Error(parseApiError(err));
      }
    }
  },

  async rejectInternship(internshipId, reason) {
    try {
      return await apiClient.post(`/admin/internships/${internshipId}/reject`, { reason });
    } catch (err) {
      try {
        return await apiClient.patch(`/admin/internships/${internshipId}/approval`, { status: 'rejected', reason });
      } catch {
        throw new Error(parseApiError(err));
      }
    }
  },

  // ── Recruiter Governance ───────────────────────────────────────────────────
  async getRecruiters(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.status && params.status !== 'ALL') query.set('status', params.status);
      if (params.company && params.company !== 'ALL') query.set('company', params.company);
      if (params.search && params.search.trim()) query.set('search', params.search.trim());
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/recruiters${qs}`);
    } catch (err) {
      console.warn('adminService.getRecruiters error:', parseApiError(err));
      return { items: [], total: 0, verified_count: 0, pending_count: 0, suspended_count: 0 };
    }
  },

  async getRecruiterById(recruiterId) {
    try {
      return await apiClient.get(`/admin/recruiters/${recruiterId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async createRecruiter(payload) {
    try {
      return await apiClient.post('/admin/recruiters', payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateRecruiterVerification(recruiterId, payload) {
    try {
      return await apiClient.patch(`/admin/recruiters/${recruiterId}/verification`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateRecruiterAccountStatus(recruiterId, payload) {
    try {
      return await apiClient.patch(`/admin/recruiters/${recruiterId}/account-status`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async verifyRecruiter(recruiterId) {
    try {
      return await apiClient.post(`/admin/recruiters/${recruiterId}/verify`);
    } catch (err) {
      try {
        return await apiClient.patch(`/admin/recruiters/${recruiterId}/verification`, { status: 'VERIFIED' });
      } catch {
        throw new Error(parseApiError(err));
      }
    }
  },

  async suspendRecruiter(recruiterId, reason = 'Suspended by admin') {
    try {
      return await apiClient.post(`/admin/recruiters/${recruiterId}/suspend`, { status: 'SUSPENDED', reason });
    } catch (err) {
      try {
        return await apiClient.patch(`/admin/recruiters/${recruiterId}/account-status`, { status: 'SUSPENDED', reason });
      } catch {
        throw new Error(parseApiError(err));
      }
    }
  },

  async activateRecruiter(recruiterId) {
    try {
      return await apiClient.post(`/admin/recruiters/${recruiterId}/activate`);
    } catch (err) {
      try {
        return await apiClient.patch(`/admin/recruiters/${recruiterId}/account-status`, { status: 'ACTIVE' });
      } catch {
        throw new Error(parseApiError(err));
      }
    }
  },

  async exportRecruiterDossier(recruiterId) {
    try {
      return await apiClient.get(`/admin/recruiters/${recruiterId}/export`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // ── Candidate / Student Governance ─────────────────────────────────────────
  async getCandidates(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.search && params.search.trim()) query.set('search', params.search.trim());
      if (params.placement_status && params.placement_status !== 'ALL') query.set('placement_status', params.placement_status);
      if (params.qualification && params.qualification !== 'ALL') query.set('qualification', params.qualification);
      if (params.mandal && params.mandal !== 'ALL') query.set('mandal', params.mandal);
      if (params.reference && params.reference !== 'ALL') query.set('reference', params.reference);
      if (params.account_status && params.account_status !== 'ALL') query.set('account_status', params.account_status);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/candidates${qs}`);
    } catch (err) {
      console.warn('adminService.getCandidates error:', parseApiError(err));
      return { items: [], total: 0, total_registered: 0, placed_students: 0, ssc_count: 0, inter_count: 0, ug_pg_count: 0 };
    }
  },

  async getCandidateById(candidateId) {
    try {
      return await apiClient.get(`/admin/candidates/${candidateId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async createCandidate(payload) {
    try {
      return await apiClient.post('/admin/candidates', payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateCandidatePlacement(candidateId, payload) {
    try {
      return await apiClient.patch(`/admin/candidates/${candidateId}/placement`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async suspendCandidate(candidateId, reason = 'Suspended by admin') {
    try {
      return await apiClient.post(`/admin/candidates/${candidateId}/suspend`, { reason });
    } catch (err) {
      try {
        return await apiClient.patch(`/admin/candidates/${candidateId}/status`, { status: 'SUSPENDED', reason });
      } catch {
        throw new Error(parseApiError(err));
      }
    }
  },

  async activateCandidate(candidateId) {
    try {
      return await apiClient.post(`/admin/candidates/${candidateId}/activate`);
    } catch (err) {
      try {
        return await apiClient.patch(`/admin/candidates/${candidateId}/status`, { status: 'ACTIVE' });
      } catch {
        throw new Error(parseApiError(err));
      }
    }
  },

  // ── Company Verifications & Directory ──────────────────────────────────────
  async getCompanies(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      if (params.status && params.status !== 'ALL') query.set('status', params.status);
      if (params.industry && params.industry !== 'ALL') query.set('industry', params.industry);
      if (params.search && params.search.trim()) query.set('search', params.search.trim());
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/companies${qs}`);
    } catch (err) {
      console.warn('adminService.getCompanies error:', parseApiError(err));
      return { items: [], total: 0, verified_count: 0 };
    }
  },

  async getCompanyById(companyId) {
    try {
      return await apiClient.get(`/admin/companies/${companyId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async createCompany(payload) {
    try {
      return await apiClient.post('/admin/companies', payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateCompanyVerification(companyId, payload) {
    try {
      return await apiClient.patch(`/admin/companies/${companyId}/verification`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
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

  async suspendCompany(companyId, reason) {
    try {
      return await apiClient.post(`/admin/companies/${companyId}/suspend`, { reason });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async getCompanyDocuments(companyId) {
    try {
      return await apiClient.get(`/admin/companies/${companyId}/documents`);
    } catch (err) {
      console.warn('adminService.getCompanyDocuments error:', parseApiError(err));
      return [];
    }
  },

  async exportCompanyDossier(companyId) {
    try {
      return await apiClient.get(`/admin/companies/${companyId}/export`);
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

  // ── Job Melas Governance ──────────────────────────────────────────────────
  async getAdminJobMelas(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'ALL') query.set('status', params.status);
      if (params.search && params.search.trim()) query.set('search', params.search.trim());
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/job-melas${qs}`);
    } catch (err) {
      console.warn('adminService.getAdminJobMelas error:', parseApiError(err));
      return [];
    }
  },

  async getAdminJobMelaById(melaId) {
    try {
      return await apiClient.get(`/admin/job-melas/${melaId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async createJobMela(payload) {
    try {
      return await apiClient.post('/admin/job-melas', payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateJobMela(melaId, payload) {
    try {
      return await apiClient.patch(`/admin/job-melas/${melaId}`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateJobMelaStatus(melaId, status) {
    try {
      return await apiClient.patch(`/admin/job-melas/${melaId}/status`, { status });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async uploadJobMelaPoster(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await apiClient.post('/admin/job-melas/upload-poster', formData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async getJobMelaMetrics() {
    try {
      return await apiClient.get('/admin/job-melas/metrics');
    } catch (err) {
      console.warn('adminService.getJobMelaMetrics error:', parseApiError(err));
      return null;
    }
  },

  async getJobMelaRegistrations(melaId, params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'ALL') query.set('status', params.status);
      if (params.search && params.search.trim()) query.set('search', params.search.trim());
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/job-melas/${melaId}/registrations${qs}`);
    } catch (err) {
      console.warn('adminService.getJobMelaRegistrations error:', parseApiError(err));
      return [];
    }
  },

  async addCompanyToMela(melaId, payload) {
    try {
      return await apiClient.post(`/admin/job-melas/${melaId}/companies`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateCompanyInMela(melaId, companyEntryId, payload) {
    try {
      return await apiClient.patch(`/admin/job-melas/${melaId}/companies/${companyEntryId}`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async removeCompanyFromMela(melaId, companyEntryId) {
    try {
      return await apiClient.delete(`/admin/job-melas/${melaId}/companies/${companyEntryId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // ── Job Mela Requests ─────────────────────────────────────────────────────
  async getJobMelaRequests(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'ALL') query.set('status', params.status);
      if (params.company && params.company !== 'ALL') query.set('company', params.company);
      if (params.search && params.search.trim()) query.set('search', params.search.trim());
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get(`/admin/job-mela-requests${qs}`);
    } catch (err) {
      console.warn('adminService.getJobMelaRequests error:', parseApiError(err));
      return [];
    }
  },

  async getJobMelaRequestById(requestId) {
    try {
      return await apiClient.get(`/admin/job-mela-requests/${requestId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async approveJobMelaRequest(requestId, payload = {}) {
    try {
      return await apiClient.patch(`/admin/job-mela-requests/${requestId}/approve`, payload);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async rejectJobMelaRequest(requestId, reason = '') {
    try {
      return await apiClient.patch(`/admin/job-mela-requests/${requestId}/reject`, { reason });
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // ── Website Content Management (Media & Gallery, News & Press) ──────────────

  /**
   * Upload image file for website content (photo gallery or news clipping).
   * @param {File} file
   * @param {string} [section='gallery'] 'gallery' or 'press'
   * @returns {Promise<{ url: string, filename: string, size: number }>}
   */
  async uploadWebsiteContentMedia(file, section = 'gallery') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await apiClient.post(`/admin/website-content/upload?section=${encodeURIComponent(section)}`, formData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // Photos
  async getGalleryPhotos(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.search) query.set('search', params.search);
      if (params.is_published !== undefined && params.is_published !== null) query.set('is_published', params.is_published);
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await apiClient.get(`/admin/website-content/gallery/photos${qs}`);
      return Array.isArray(data) ? data : (data?.items || []);
    } catch (err) {
      console.warn('adminService.getGalleryPhotos error:', parseApiError(err));
      return [];
    }
  },

  async createGalleryPhoto(photoData) {
    try {
      return await apiClient.post('/admin/website-content/gallery/photos', photoData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateGalleryPhoto(photoId, photoData) {
    try {
      return await apiClient.patch(`/admin/website-content/gallery/photos/${photoId}`, photoData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async deleteGalleryPhoto(photoId) {
    try {
      return await apiClient.delete(`/admin/website-content/gallery/photos/${photoId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // Videos
  async getGalleryVideos(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.search) query.set('search', params.search);
      if (params.is_published !== undefined && params.is_published !== null) query.set('is_published', params.is_published);
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await apiClient.get(`/admin/website-content/gallery/videos${qs}`);
      return Array.isArray(data) ? data : (data?.items || []);
    } catch (err) {
      console.warn('adminService.getGalleryVideos error:', parseApiError(err));
      return [];
    }
  },

  async createGalleryVideo(videoData) {
    try {
      return await apiClient.post('/admin/website-content/gallery/videos', videoData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updateGalleryVideo(videoId, videoData) {
    try {
      return await apiClient.patch(`/admin/website-content/gallery/videos/${videoId}`, videoData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async deleteGalleryVideo(videoId) {
    try {
      return await apiClient.delete(`/admin/website-content/gallery/videos/${videoId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // Press & Newspaper Clippings
  async getPressArticles(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.search) query.set('search', params.search);
      if (params.is_published !== undefined && params.is_published !== null) query.set('is_published', params.is_published);
      if (params.page) query.set('page', params.page);
      if (params.page_size) query.set('page_size', params.page_size);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await apiClient.get(`/admin/website-content/press${qs}`);
      return Array.isArray(data) ? data : (data?.items || []);
    } catch (err) {
      console.warn('adminService.getPressArticles error:', parseApiError(err));
      return [];
    }
  },

  async createPressArticle(articleData) {
    try {
      return await apiClient.post('/admin/website-content/press', articleData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async updatePressArticle(articleId, articleData) {
    try {
      return await apiClient.patch(`/admin/website-content/press/${articleId}`, articleData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  async deletePressArticle(articleId) {
    try {
      return await apiClient.delete(`/admin/website-content/press/${articleId}`);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },

  // Section Headers
  async getWebsiteSectionHeader(sectionId) {
    try {
      return await apiClient.get(`/admin/website-content/sections/${sectionId}`);
    } catch (err) {
      console.warn(`adminService.getWebsiteSectionHeader(${sectionId}) error:`, parseApiError(err));
      return null;
    }
  },

  async updateWebsiteSectionHeader(sectionId, headerData) {
    try {
      return await apiClient.put(`/admin/website-content/sections/${sectionId}`, headerData);
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  },
};

export default adminService;
