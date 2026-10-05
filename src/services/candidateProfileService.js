/**
 * Candidate Profile Service
 * Communicates with /api/v1/candidate/profile endpoints using the authenticated apiClient.
 */
import apiClient, { parseApiError } from './apiClient';

const candidateProfileService = {
  /**
   * Fetch authenticated candidate's complete profile
   */
  async getProfile() {
    try {
      return await apiClient.get('/candidate/profile');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update personal info (headline, bio, phone, location, links, avatar)
   */
  async updatePersonal(data) {
    try {
      return await apiClient.patch('/candidate/profile/personal', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  /**
   * Update career preferences (salary, experience, workMode, preferredRoles, preferredLocations)
   */
  async updatePreferences(data) {
    try {
      return await apiClient.patch('/candidate/profile/preferences', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  // ── Skills ─────────────────────────────────────────────────────────────────

  async getSkills() {
    try {
      return await apiClient.get('/candidate/profile/skills');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async addSkill(skillName) {
    try {
      return await apiClient.post('/candidate/profile/skills', { skill_name: skillName });
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async deleteSkill(skillId) {
    try {
      return await apiClient.delete(`/candidate/profile/skills/${skillId}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  // ── Resume ─────────────────────────────────────────────────────────────────

  async uploadResume(payload) {
    try {
      if (payload instanceof FormData) {
        return await apiClient.post('/candidate/profile/resume', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return await apiClient.post('/candidate/profile/resume', payload);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  getResumeViewUrl(resumeId) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/candidate/profile/resume/${resumeId}/view`;
  },

  getResumeDownloadUrl(resumeId) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/candidate/profile/resume/${resumeId}/download`;
  },

  // ── Work Experience ────────────────────────────────────────────────────────

  async getWorkExperience() {
    try {
      return await apiClient.get('/candidate/profile/work-experience');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async addWorkExperience(data) {
    try {
      return await apiClient.post('/candidate/profile/work-experience', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async updateWorkExperience(id, data) {
    try {
      return await apiClient.patch(`/candidate/profile/work-experience/${id}`, data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async deleteWorkExperience(id) {
    try {
      return await apiClient.delete(`/candidate/profile/work-experience/${id}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  // ── Education ──────────────────────────────────────────────────────────────

  async getEducation() {
    try {
      return await apiClient.get('/candidate/profile/education');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async addEducation(data) {
    try {
      return await apiClient.post('/candidate/profile/education', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async updateEducation(id, data) {
    try {
      return await apiClient.patch(`/candidate/profile/education/${id}`, data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async deleteEducation(id) {
    try {
      return await apiClient.delete(`/candidate/profile/education/${id}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  // ── Certifications ─────────────────────────────────────────────────────────

  async getCertifications() {
    try {
      return await apiClient.get('/candidate/profile/certifications');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async addCertification(data) {
    try {
      return await apiClient.post('/candidate/profile/certifications', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async updateCertification(id, data) {
    try {
      return await apiClient.patch(`/candidate/profile/certifications/${id}`, data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async deleteCertification(id) {
    try {
      return await apiClient.delete(`/candidate/profile/certifications/${id}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  // ── Projects ───────────────────────────────────────────────────────────────

  async getProjects() {
    try {
      return await apiClient.get('/candidate/profile/projects');
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async addProject(data) {
    try {
      return await apiClient.post('/candidate/profile/projects', data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async updateProject(id, data) {
    try {
      return await apiClient.patch(`/candidate/profile/projects/${id}`, data);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },

  async deleteProject(id) {
    try {
      return await apiClient.delete(`/candidate/profile/projects/${id}`);
    } catch (error) {
      throw new Error(parseApiError(error));
    }
  },
};

export default candidateProfileService;
