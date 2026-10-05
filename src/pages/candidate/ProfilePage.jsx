import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText,
  Edit2, Save, X, Plus, Trash2, Download, CheckCircle2,
  Sparkles, UploadCloud, ShieldCheck, Award, FolderGit2,
  Globe, Layers, DollarSign, ExternalLink, Sliders, Eye, Check,
  Camera
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import authService from '../../services/authService';
import candidateProfileService from '../../services/candidateProfileService';
import {
  LOCATIONS, SKILL_OPTIONS, JOB_TYPES, WORK_MODES, SALARY_RANGES
} from '../../data/mockData';

export default function CandidateProfilePage() {
  const { toast } = useToast();
  const { candidate, updateProfile, updateResume, updateSkillsPreferences } = useCandidate();

  // Active editing section: null | 'personal' | 'preferences' | 'experience' | 'education' | 'certifications' | 'projects'
  const [editingSection, setEditingSection] = useState(null);

  // ── CANDIDATE PROFILE AVATAR STATE & REFS ──
  const fileInputRef = useRef(null);
  const avatarContainerRef = useRef(null);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [dpModalOpen, setDpModalOpen] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [candidate.avatar]);

  // Close WhatsApp DP action menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarContainerRef.current && !avatarContainerRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
      }
    };
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarMenuOpen]);

  const avatarUrl = candidate.avatar || candidate.profileImage;
  const isImageString = avatarUrl && typeof avatarUrl === 'string' && avatarUrl !== 'REMOVED' && avatarUrl !== 'P' && (
    avatarUrl.startsWith('data:image/') ||
    avatarUrl.startsWith('http://') ||
    avatarUrl.startsWith('https://') ||
    avatarUrl.startsWith('/') ||
    avatarUrl.startsWith('blob:')
  );
  const showImage = Boolean(isImageString && !avatarError);
  const initialFallback = candidate.name?.[0]?.toUpperCase() || 'P';

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        type: 'error',
        title: 'Invalid File Format',
        message: 'Please select a valid image file (PNG, JPG, WEBP, GIF).'
      });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast({
        type: 'error',
        title: 'File Too Large',
        message: 'Profile image must be less than 3 MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setAvatarError(false);
      updateProfile({ avatar: dataUrl });
      setAvatarMenuOpen(false);
      setDpModalOpen(false);
      toast({
        type: 'success',
        title: 'Profile Photo Updated',
        message: 'Your profile photo has been updated successfully.'
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    updateProfile({ avatar: 'REMOVED' });
    setAvatarError(false);
    setAvatarMenuOpen(false);
    setDpModalOpen(false);
    toast({
      type: 'info',
      title: 'Profile Photo Removed',
      message: 'Your profile photo has been removed and reset to default avatar.'
    });
  };

  // ── 1. PERSONAL INFORMATION STATE ──
  const [personal, setPersonal] = useState({
    fullName: candidate.name,
    headline: candidate.headline,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.location,
    bio: candidate.bio,
    linkedin: candidate.linkedin,
    github: candidate.github,
    portfolio: candidate.portfolio
  });

  // ── 2. PROFESSIONAL & CAREER PREFERENCES STATE ──
  const [prefForm, setPrefForm] = useState({
    totalExperience: candidate.skillsPreferences?.experience || '4.2 Years',
    currentSalary: candidate.skillsPreferences?.currentSalary || '₹14,50,000 / year',
    expectedSalary: candidate.skillsPreferences?.expectedSalary || '₹18,00,000 - ₹24,00,000 / year',
    workMode: candidate.skillsPreferences?.workMode || 'Hybrid',
    jobType: candidate.skillsPreferences?.jobType || 'Full-time',
    preferredRoles: candidate.skillsPreferences?.preferredRoles || ['Senior Frontend Developer', 'React Specialist'],
    preferredLocations: candidate.skillsPreferences?.preferredLocations || ['Visakhapatnam', 'Vijayawada', 'Hyderabad']
  });
  const [customRoleInput, setCustomRoleInput] = useState('');

  // ── 3. TECHNICAL SKILLS STATE ──
  const [skills, setSkills] = useState(candidate.skillsPreferences?.skills || []);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // ── 4. RESUME STATE & MODALS ──
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const resume = candidate.resume || {
    fileName: 'Vyshnavi_Resume.pdf',
    uploadedDate: '2 Sept 2026',
    fileSize: '1.4 MB',
    fileType: 'PDF Document'
  };

  // ── 5. WORK EXPERIENCE STATE ──
  const [experienceList, setExperienceList] = useState(candidate.experienceList || [
    {
      id: 'exp-1',
      role: 'Senior Frontend Engineer',
      company: 'Infosys Digital',
      location: 'Hyderabad (Hybrid)',
      duration: 'June 2023 - Present (1 yr 3 mos)',
      description: 'Architected responsive portal components for banking clients. Reduced initial bundle size by 35% using code-splitting and dynamic imports.'
    },
    {
      id: 'exp-2',
      role: 'Frontend Developer',
      company: 'TCS Innovation Labs',
      location: 'Visakhapatnam',
      duration: 'Aug 2021 - May 2023 (1 yr 10 mos)',
      description: 'Developed scalable single-page applications using React, Redux, and RESTful APIs for telecom enterprise solutions.'
    }
  ]);
  const [newExpForm, setNewExpForm] = useState({ role: '', company: '', location: '', duration: '', description: '' });

  // ── 6. EDUCATION STATE ──
  const [educationList, setEducationList] = useState(candidate.educationList || [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'Andhra University College of Engineering, Visakhapatnam',
      duration: '2017 - 2021',
      score: '8.7 CGPA'
    },
    {
      id: 'edu-2',
      degree: 'Intermediate (MPC)',
      institution: 'Sri Chaitanya Junior College, Vijayawada',
      duration: '2015 - 2017',
      score: '96.2%'
    }
  ]);
  const [newEduForm, setNewEduForm] = useState({ degree: '', institution: '', duration: '', score: '' });

  // ── 7. CERTIFICATIONS STATE ──
  const [certificationsList, setCertificationsList] = useState(candidate.certificationsList || [
    { id: 'cert-1', name: 'Meta Certified Frontend Developer', issuer: 'Meta / Coursera', year: '2024' },
    { id: 'cert-2', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2023' }
  ]);
  const [newCertForm, setNewCertForm] = useState({ name: '', issuer: '', year: '' });

  // ── 8. FEATURED PROJECTS STATE ──
  const [projectsList, setProjectsList] = useState(candidate.projectsList || [
    {
      id: 'proj-1',
      title: 'NTR Vikasa Candidate Portal',
      tech: 'React, Vite, CSS Modules',
      description: 'Interactive job portal frontend with responsive candidate dashboard, multi-step filter search, and applicant tracking.'
    },
    {
      id: 'proj-2',
      title: 'Enterprise Design System UI Kit',
      tech: 'TypeScript, Storybook, Tailwind',
      description: 'Comprehensive component library with 45+ accessible UI components used across 6 product teams.'
    }
  ]);
  const [newProjForm, setNewProjForm] = useState({ title: '', tech: '', description: '' });

  // Sync state if candidate prop changes
  useEffect(() => {
    setPersonal({
      fullName: candidate.name,
      headline: candidate.headline,
      email: candidate.email,
      phone: candidate.phone,
      location: candidate.location,
      bio: candidate.bio,
      linkedin: candidate.linkedin,
      github: candidate.github,
      portfolio: candidate.portfolio
    });
    setPrefForm({
      totalExperience: candidate.skillsPreferences?.experience || '4.2 Years',
      currentSalary: candidate.skillsPreferences?.currentSalary || '₹14,50,000 / year',
      expectedSalary: candidate.skillsPreferences?.expectedSalary || '₹18,00,000 - ₹24,00,000 / year',
      workMode: candidate.skillsPreferences?.workMode || 'Hybrid',
      jobType: candidate.skillsPreferences?.jobType || 'Full-time',
      preferredRoles: candidate.skillsPreferences?.preferredRoles || [],
      preferredLocations: candidate.skillsPreferences?.preferredLocations || []
    });
    setSkills(candidate.skillsPreferences?.skills || []);
    if (candidate.experienceList) setExperienceList(candidate.experienceList);
    if (candidate.educationList) setEducationList(candidate.educationList);
    if (candidate.certificationsList) setCertificationsList(candidate.certificationsList);
    if (candidate.projectsList) setProjectsList(candidate.projectsList);
  }, [candidate]);

  // ── INITIAL FETCH FROM REAL BACKEND ──
  useEffect(() => {
    let cancelled = false;
    async function loadBackendProfile() {
      if (!authService.isAuthenticated()) return;
      try {
        const p = await candidateProfileService.getProfile();
        if (cancelled || !p) return;
        updateProfile({
          id: p.id,
          name: p.name || p.fullName,
          fullName: p.name || p.fullName,
          headline: p.headline,
          email: p.email,
          phone: p.phone,
          location: p.location,
          bio: p.bio,
          linkedin: p.linkedin || p.linkedin_url,
          github: p.github || p.github_url,
          portfolio: p.portfolio || p.portfolio_url,
          avatar: p.avatar,
          profileCompletion: p.profile_completion_percentage ?? p.profileCompletion,
          skillsPreferences: p.skillsPreferences,
          resume: p.resume,
          experienceList: p.experienceList,
          educationList: p.educationList,
          certificationsList: p.certificationsList,
          projectsList: p.projectsList,
        });
      } catch (err) {
        console.warn('Backend profile fetch error:', err.message);
      }
    }
    loadBackendProfile();
    return () => { cancelled = true; };
  }, []);

  // ── HANDLERS ──

  // Save Personal Info
  const handleSavePersonal = async () => {
    setEditingSection(null);
    const payload = {
      name: personal.fullName,
      fullName: personal.fullName,
      headline: personal.headline,
      professional_title: personal.headline,
      email: personal.email,
      phone: personal.phone,
      location: personal.location,
      bio: personal.bio,
      professional_summary: personal.bio,
      linkedin: personal.linkedin,
      linkedin_url: personal.linkedin,
      github: personal.github,
      github_url: personal.github,
      portfolio: personal.portfolio,
      portfolio_url: personal.portfolio,
    };

    updateProfile({
      name: personal.fullName,
      headline: personal.headline,
      email: personal.email,
      phone: personal.phone,
      location: personal.location,
      bio: personal.bio,
      linkedin: personal.linkedin,
      github: personal.github,
      portfolio: personal.portfolio
    });

    if (authService.isAuthenticated()) {
      try {
        const updated = await candidateProfileService.updatePersonal(payload);
        if (updated?.profileCompletion !== undefined) {
          updateProfile({ profileCompletion: updated.profileCompletion });
        }
      } catch (err) {
        console.warn('Personal info sync error:', err.message);
      }
    }

    toast({
      type: 'success',
      title: 'Personal Information Updated',
      message: 'Your personal and social details have been saved.'
    });
  };

  // Save Preferences
  const handleSavePreferences = async () => {
    setEditingSection(null);
    const prefPayload = {
      experience: prefForm.totalExperience,
      total_experience: prefForm.totalExperience,
      currentSalary: prefForm.currentSalary,
      current_salary: prefForm.currentSalary,
      expectedSalary: prefForm.expectedSalary,
      expected_salary: prefForm.expectedSalary,
      workMode: prefForm.workMode,
      work_mode: prefForm.workMode,
      jobType: prefForm.jobType,
      employment_type: prefForm.jobType,
      preferredRoles: prefForm.preferredRoles,
      preferred_job_roles: prefForm.preferredRoles,
      preferredLocations: prefForm.preferredLocations,
      preferred_locations: prefForm.preferredLocations
    };

    updateSkillsPreferences({
      experience: prefForm.totalExperience,
      currentSalary: prefForm.currentSalary,
      expectedSalary: prefForm.expectedSalary,
      workMode: prefForm.workMode,
      jobType: prefForm.jobType,
      preferredRoles: prefForm.preferredRoles,
      preferredLocations: prefForm.preferredLocations
    });

    if (authService.isAuthenticated()) {
      try {
        await candidateProfileService.updatePreferences(prefPayload);
      } catch (err) {
        console.warn('Preferences sync error:', err.message);
      }
    }

    toast({
      type: 'success',
      title: 'Preferences Updated',
      message: 'Your career and job preferences have been saved.'
    });
  };

  // Add / Remove Role in Preferences
  const handleAddRole = (e) => {
    e.preventDefault();
    if (customRoleInput.trim() && !prefForm.preferredRoles.includes(customRoleInput.trim())) {
      setPrefForm(prev => ({
        ...prev,
        preferredRoles: [...prev.preferredRoles, customRoleInput.trim()]
      }));
      setCustomRoleInput('');
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setPrefForm(prev => ({
      ...prev,
      preferredRoles: prev.preferredRoles.filter(r => r !== roleToRemove)
    }));
  };

  // Toggle Location in Preferences
  const handleToggleLocation = (loc) => {
    setPrefForm(prev => {
      const exists = prev.preferredLocations.includes(loc);
      return {
        ...prev,
        preferredLocations: exists
          ? prev.preferredLocations.filter(l => l !== loc)
          : [...prev.preferredLocations, loc]
      };
    });
  };

  // Technical Skills Handlers
  const handleToggleSkill = async (skill) => {
    let updated;
    const exists = skills.includes(skill);
    if (exists) {
      updated = skills.filter(s => s !== skill);
    } else {
      updated = [...skills, skill];
    }
    setSkills(updated);
    updateSkillsPreferences({ skills: updated });

    if (authService.isAuthenticated()) {
      try {
        if (!exists) {
          await candidateProfileService.addSkill(skill);
        }
      } catch (err) {
        console.warn('Skill toggle sync error:', err.message);
      }
    }
  };

  const handleAddCustomSkill = async (e) => {
    e.preventDefault();
    const newSkill = customSkillInput.trim();
    if (newSkill && !skills.includes(newSkill)) {
      const updated = [...skills, newSkill];
      setSkills(updated);
      setCustomSkillInput('');
      updateSkillsPreferences({ skills: updated });

      if (authService.isAuthenticated()) {
        try {
          await candidateProfileService.addSkill(newSkill);
        } catch (err) {
          console.warn('Add skill sync error:', err.message);
        }
      }

      toast({ type: 'success', title: 'Skill Added', message: `Added "${newSkill}".` });
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    updateSkillsPreferences({ skills: updated });

    if (authService.isAuthenticated()) {
      try {
        const currentSkills = await candidateProfileService.getSkills();
        const match = currentSkills.find(s => s.skill_name?.toLowerCase() === skillToRemove.toLowerCase() || s.name?.toLowerCase() === skillToRemove.toLowerCase());
        if (match) {
          await candidateProfileService.deleteSkill(match.id);
        }
      } catch (err) {
        console.warn('Remove skill sync error:', err.message);
      }
    }

    toast({ type: 'info', title: 'Skill Removed', message: `Removed "${skillToRemove}".` });
  };

  // Resume Download Handler
  const handleDownloadResume = () => {
    if (resume?.id && authService.isAuthenticated()) {
      const downloadUrl = candidateProfileService.getResumeDownloadUrl(resume.id);
      window.open(downloadUrl, '_blank');
    }
    toast({
      type: 'success',
      title: 'Downloading Resume',
      message: `Downloading "${resume.fileName}" to your device...`
    });
  };

  // Resume File Upload/Replace Handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setUploadError('Invalid format! Please upload PDF, DOC, or DOCX files only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit! Please upload a smaller resume file.');
      return;
    }

    setUploadError('');

    let uploadedItem = null;
    if (authService.isAuthenticated()) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        uploadedItem = await candidateProfileService.uploadResume(formData);
      } catch (err) {
        console.warn('Resume upload API error:', err.message);
      }
    }

    updateResume({
      id: uploadedItem?.id || resume?.id,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: file.name.endsWith('.pdf') ? 'PDF Document' : 'Word Document'
    });

    setReplaceModalOpen(false);
    toast({
      type: 'success',
      title: 'Resume Replaced Successfully',
      message: `Updated your verified candidate resume to "${file.name}".`
    });
  };

  // Work Experience Add / Delete Handlers
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!newExpForm.role || !newExpForm.company) return;
    const newEntry = {
      id: `exp-${Date.now()}`,
      ...newExpForm
    };
    const updated = [newEntry, ...experienceList];
    setExperienceList(updated);
    setNewExpForm({ role: '', company: '', location: '', duration: '', description: '' });
    updateProfile({ experienceList: updated });

    if (authService.isAuthenticated()) {
      try {
        const created = await candidateProfileService.addWorkExperience(newExpForm);
        newEntry.id = created.id;
      } catch (err) {
        console.warn('Add experience sync error:', err.message);
      }
    }

    toast({ type: 'success', title: 'Experience Added', message: `Added "${newEntry.role}" at ${newEntry.company}.` });
  };

  const handleDeleteExperience = async (id) => {
    const updated = experienceList.filter(e => e.id !== id);
    setExperienceList(updated);
    updateProfile({ experienceList: updated });

    if (authService.isAuthenticated()) {
      try {
        await candidateProfileService.deleteWorkExperience(id);
      } catch (err) {
        console.warn('Delete experience sync error:', err.message);
      }
    }

    toast({ type: 'info', title: 'Experience Removed', message: 'Experience record removed.' });
  };

  // Education Add / Delete Handlers
  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!newEduForm.degree || !newEduForm.institution) return;
    const newEntry = {
      id: `edu-${Date.now()}`,
      ...newEduForm
    };
    const updated = [...educationList, newEntry];
    setEducationList(updated);
    setNewEduForm({ degree: '', institution: '', duration: '', score: '' });
    updateProfile({ educationList: updated });

    if (authService.isAuthenticated()) {
      try {
        const created = await candidateProfileService.addEducation(newEduForm);
        newEntry.id = created.id;
      } catch (err) {
        console.warn('Add education sync error:', err.message);
      }
    }

    toast({ type: 'success', title: 'Education Added', message: `Added "${newEntry.degree}".` });
  };

  const handleDeleteEducation = async (id) => {
    const updated = educationList.filter(e => e.id !== id);
    setEducationList(updated);
    updateProfile({ educationList: updated });

    if (authService.isAuthenticated()) {
      try {
        await candidateProfileService.deleteEducation(id);
      } catch (err) {
        console.warn('Delete education sync error:', err.message);
      }
    }

    toast({ type: 'info', title: 'Education Removed', message: 'Education record removed.' });
  };

  // Certifications Add / Delete Handlers
  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (!newCertForm.name) return;
    const newEntry = {
      id: `cert-${Date.now()}`,
      ...newCertForm
    };
    const updated = [...certificationsList, newEntry];
    setCertificationsList(updated);
    setNewCertForm({ name: '', issuer: '', year: '' });
    updateProfile({ certificationsList: updated });

    if (authService.isAuthenticated()) {
      try {
        const created = await candidateProfileService.addCertification(newCertForm);
        newEntry.id = created.id;
      } catch (err) {
        console.warn('Add certification sync error:', err.message);
      }
    }

    toast({ type: 'success', title: 'Certification Added', message: `Added "${newEntry.name}".` });
  };

  const handleDeleteCertification = async (id) => {
    const updated = certificationsList.filter(c => c.id !== id);
    setCertificationsList(updated);
    updateProfile({ certificationsList: updated });

    if (authService.isAuthenticated()) {
      try {
        await candidateProfileService.deleteCertification(id);
      } catch (err) {
        console.warn('Delete certification sync error:', err.message);
      }
    }

    toast({ type: 'info', title: 'Certification Removed', message: 'Certification record removed.' });
  };

  // Projects Add / Delete Handlers
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjForm.title) return;
    const newEntry = {
      id: `proj-${Date.now()}`,
      ...newProjForm
    };
    const updated = [...projectsList, newEntry];
    setProjectsList(updated);
    setNewProjForm({ title: '', tech: '', description: '' });
    updateProfile({ projectsList: updated });

    if (authService.isAuthenticated()) {
      try {
        const created = await candidateProfileService.addProject(newProjForm);
        newEntry.id = created.id;
      } catch (err) {
        console.warn('Add project sync error:', err.message);
      }
    }

    toast({ type: 'success', title: 'Project Added', message: `Added project "${newEntry.title}".` });
  };

  const handleDeleteProject = async (id) => {
    const updated = projectsList.filter(p => p.id !== id);
    setProjectsList(updated);
    updateProfile({ projectsList: updated });

    if (authService.isAuthenticated()) {
      try {
        await candidateProfileService.deleteProject(id);
      } catch (err) {
        console.warn('Delete project sync error:', err.message);
      }
    }

    toast({ type: 'info', title: 'Project Removed', message: 'Project record removed.' });
  };

  return (
    <div className="candidate-profile-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      
      {/* ════════════════════════════════════════════════════════════════════
          1. PROFILE HEADER / CANDIDATE STRENGTH BAR
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, var(--color-surface), var(--color-primary-50))',
        border: '1.5px solid var(--color-primary-200)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="card-body" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              {/* Circular Candidate Profile Image / Avatar (WhatsApp DP Style) */}
              <div ref={avatarContainerRef} style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  title="Click to view or manage profile photo"
                  onClick={() => setDpModalOpen(true)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-accent-600))',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 'var(--text-xl)',
                    boxShadow: 'var(--shadow-md)',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '2px solid #fff',
                    cursor: 'pointer',
                    transition: 'transform var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {showImage ? (
                    <img
                      src={avatarUrl}
                      alt={personal.fullName || 'Candidate Profile'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-full)',
                        display: 'block'
                      }}
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span>{initialFallback}</span>
                  )}
                </div>

                {/* WhatsApp DP Style Camera Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAvatarMenuOpen(prev => !prev);
                  }}
                  title="Profile photo options"
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 22,
                    height: 22,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-600)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    border: '2px solid #fff',
                    padding: 0,
                    transition: 'transform var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <Camera size={11} />
                </button>

                {/* WhatsApp-style Popover Menu */}
                {avatarMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 8,
                      background: 'var(--color-surface, #fff)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.18), 0 8px 10px -6px rgba(0,0,0,0.1)',
                      border: '1px solid var(--color-gray-200)',
                      padding: 4,
                      minWidth: 160,
                      zIndex: 60,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        setDpModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        background: 'none',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-gray-100)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      <Eye size={13} style={{ color: 'var(--color-primary-600)' }} />
                      <span>View Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        background: 'none',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-gray-100)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      <Camera size={13} style={{ color: 'var(--color-primary-600)' }} />
                      <span>{showImage ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>

                    {showImage && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: 'var(--color-danger-600)',
                          background: 'none',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-danger-50)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        <Trash2 size={13} />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  id="candidate-avatar-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleAvatarFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                    {personal.fullName}
                  </h1>
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>
                    <ShieldCheck size={11} style={{ marginRight: 2 }} /> Verified Candidate Profile
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {personal.headline}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                <Sparkles size={16} style={{ color: 'var(--color-primary-600)' }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)' }}>
                  Profile Completion: {candidate.profileCompletion}%
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                High visibility profile among 14,200+ actively hiring recruiters
              </p>
            </div>
          </div>

          <div style={{ height: 8, background: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              width: `${candidate.profileCompletion}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary-600), var(--color-accent-500))',
              borderRadius: 'var(--radius-full)'
            }} />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          2. PERSONAL INFORMATION & SOCIAL LINKS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <User size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Personal Information & Social Links</h2>
          </div>
          {editingSection === 'personal' ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button size="xs" variant="secondary" onClick={() => setEditingSection(null)}>Cancel</Button>
              <Button size="xs" variant="primary" leftIcon={<Save size={13} />} onClick={handleSavePersonal}>Save</Button>
            </div>
          ) : (
            <Button size="xs" variant="ghost" leftIcon={<Edit2 size={13} />} onClick={() => setEditingSection('personal')}>Edit</Button>
          )}
        </div>

        <div className="card-body">
          {editingSection === 'personal' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Profile Photo Management */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--color-gray-300)'
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-accent-600))',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 'var(--text-lg)',
                  border: '2px solid #fff',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {showImage ? (
                    <img src={avatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{initialFallback}</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)' }}>
                    Candidate Profile Photo
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                      type="button"
                      size="xs"
                      variant="secondary"
                      leftIcon={<Camera size={13} />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {showImage ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {showImage && (
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        leftIcon={<Trash2 size={13} />}
                        style={{ color: 'var(--color-danger-600)' }}
                        onClick={handleRemovePhoto}
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                <FormField label="Full Name" required>
                  <Input value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} />
                </FormField>
                <FormField label="Professional Headline" required>
                  <Input value={personal.headline} onChange={(e) => setPersonal({ ...personal, headline: e.target.value })} />
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <FormField label="Email Address" required>
                  <Input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                </FormField>
                <FormField label="Phone Number" required>
                  <Input type="tel" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
                </FormField>
                <FormField label="Location" required>
                  <Input value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} />
                </FormField>
              </div>

              <FormField label="Professional Summary">
                <Textarea rows={3} value={personal.bio} onChange={(e) => setPersonal({ ...personal, bio: e.target.value })} />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <FormField label="LinkedIn URL">
                  <Input value={personal.linkedin} onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })} />
                </FormField>
                <FormField label="GitHub URL">
                  <Input value={personal.github} onChange={(e) => setPersonal({ ...personal, github: e.target.value })} />
                </FormField>
                <FormField label="Portfolio URL">
                  <Input value={personal.portfolio} onChange={(e) => setPersonal({ ...personal, portfolio: e.target.value })} />
                </FormField>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Email Address</span><strong>{personal.email}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Phone Number</span><strong>{personal.phone}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Location</span><strong>{personal.location}</strong></div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block', marginBottom: 2 }}>Professional Summary</span>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 'var(--leading-relaxed)' }}>{personal.bio}</p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45 1.46 1.46 0 0 0-1.45-1.46 1.46 1.46 0 0 0-1.46 1.46c0 .8.65 1.45 1.46 1.45m1.39 9.74v-8.37H5.07v8.37h2.78z"/></svg>
                  LinkedIn <ExternalLink size={11} />
                </a>
                <a href={personal.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                  GitHub <ExternalLink size={11} />
                </a>
                <a href={personal.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <Globe size={14} /> Portfolio <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          3. PROFESSIONAL & CAREER PREFERENCES
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Briefcase size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Professional & Career Preferences</h2>
          </div>
          {editingSection === 'preferences' ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button size="xs" variant="secondary" onClick={() => setEditingSection(null)}>Cancel</Button>
              <Button size="xs" variant="primary" leftIcon={<Save size={13} />} onClick={handleSavePreferences}>Save</Button>
            </div>
          ) : (
            <Button size="xs" variant="ghost" leftIcon={<Edit2 size={13} />} onClick={() => setEditingSection('preferences')}>Edit</Button>
          )}
        </div>

        <div className="card-body">
          {editingSection === 'preferences' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <FormField label="Total Experience">
                  <Input value={prefForm.totalExperience} onChange={(e) => setPrefForm({ ...prefForm, totalExperience: e.target.value })} />
                </FormField>
                <FormField label="Current Salary">
                  <Input value={prefForm.currentSalary} onChange={(e) => setPrefForm({ ...prefForm, currentSalary: e.target.value })} />
                </FormField>
                <FormField label="Expected Annual CTC">
                  <select
                    className="select"
                    value={prefForm.expectedSalary}
                    onChange={(e) => setPrefForm({ ...prefForm, expectedSalary: e.target.value })}
                  >
                    {SALARY_RANGES.filter(s => s !== 'All Salaries').map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Work Mode & Job Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                    Preferred Work Mode
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {WORK_MODES.filter(m => m !== 'All Modes').map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPrefForm({ ...prefForm, workMode: mode })}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: prefForm.workMode === mode ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          background: prefForm.workMode === mode ? 'var(--color-primary-50)' : 'var(--color-surface)',
                          color: prefForm.workMode === mode ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {prefForm.workMode === mode ? '✓ ' : ''}{mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                    Employment Type / Job Type
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {JOB_TYPES.filter(t => t !== 'All Types').map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPrefForm({ ...prefForm, jobType: type })}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: prefForm.jobType === type ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          background: prefForm.jobType === type ? 'var(--color-primary-50)' : 'var(--color-surface)',
                          color: prefForm.jobType === type ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {prefForm.jobType === type ? '✓ ' : ''}{type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferred Job Roles */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                  Preferred Job Roles
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  {prefForm.preferredRoles.map(role => (
                    <span
                      key={role}
                      style={{
                        background: 'var(--color-primary-50)',
                        color: 'var(--color-primary-800)',
                        border: '1px solid var(--color-primary-200)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(role)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-600)', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: 380 }}>
                  <Input
                    placeholder="Add target role (e.g. Fullstack Lead)..."
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                  />
                  <Button size="sm" variant="outline" type="button" onClick={handleAddRole}>Add</Button>
                </div>
              </div>

              {/* Preferred Locations */}
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                  Preferred Locations
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {LOCATIONS.filter(l => l !== 'All Locations').slice(0, 12).map(loc => {
                    const selected = prefForm.preferredLocations.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleToggleLocation(loc)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: selected ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          background: selected ? 'var(--color-primary-600)' : 'var(--color-surface)',
                          color: selected ? '#fff' : 'var(--color-text-muted)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {selected ? '✓ ' : ''}{loc}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Total Experience</span><strong>{prefForm.totalExperience}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Current Salary</span><strong>{prefForm.currentSalary}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Expected Salary</span><strong style={{ color: 'var(--color-success-700)' }}>{prefForm.expectedSalary}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Work Mode</span><strong>{prefForm.workMode}</strong></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block' }}>Employment Type</span><strong>{prefForm.jobType}</strong></div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block', marginBottom: 4 }}>Preferred Job Roles</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {prefForm.preferredRoles.map(role => (
                    <span key={role} style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-800)', border: '1px solid var(--color-primary-200)', padding: '3px 10px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block', marginBottom: 4 }}>Preferred Locations</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {prefForm.preferredLocations.map(loc => (
                    <span key={loc} style={{ background: 'var(--color-gray-100)', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600 }}>
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          4. TECHNICAL SKILLS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Layers size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Technical Skills ({skills.length})</h2>
          </div>
          {editingSection === 'skills' ? (
            <Button size="xs" variant="secondary" onClick={() => setEditingSection(null)}>Done</Button>
          ) : (
            <Button size="xs" variant="ghost" leftIcon={<Edit2 size={13} />} onClick={() => setEditingSection('skills')}>Edit</Button>
          )}
        </div>

        <div className="card-body">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
            Selected technologies and technical proficiencies used by recruiters for search matching.
          </p>

          {/* Active Skills Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-700)',
                  border: '1px solid var(--color-primary-200)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-500)', padding: 0 }}
                  aria-label={`Remove ${skill}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom skill input */}
          <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: 360, marginBottom: 'var(--space-4)' }}>
            <Input
              placeholder="Add skill (e.g. Docker, GraphQL)..."
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
            />
            <Button size="sm" variant="primary" type="submit" leftIcon={<Plus size={14} />}>Add</Button>
          </form>

          {/* Popular Suggested Skills */}
          {editingSection === 'skills' && (
            <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Popular Suggested Skills:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {SKILL_OPTIONS.map((skill) => {
                  const isSelected = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      style={{
                        background: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface)',
                        border: isSelected ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                        color: isSelected ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                        borderRadius: 'var(--radius-md)',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}{skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          5. RESUME & CV DOCUMENTS (ATS Checker completely removed)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileText size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Resume & CV Documents</h2>
          </div>
        </div>

        <div className="card-body">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Active resume attached to your job applications and recruiter searches for {personal.fullName}.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-primary-200)',
            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={26} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)' }}>
                    {resume.fileName}
                  </h3>
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>
                    <ShieldCheck size={11} style={{ marginRight: 2 }} /> Active Default Resume
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  <span>Uploaded: <strong>{resume.uploadedDate}</strong></span>
                  <span>•</span>
                  <span>File Size: <strong>{resume.fileSize}</strong></span>
                  <span>•</span>
                  <span>Format: <strong>{resume.fileType || 'PDF Document'}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Eye size={14} />}
                onClick={() => setPreviewModalOpen(true)}
              >
                View Resume
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Download size={14} />}
                onClick={handleDownloadResume}
              >
                Download Resume
              </Button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<UploadCloud size={14} />}
                onClick={() => setReplaceModalOpen(true)}
              >
                Replace Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          6. WORK EXPERIENCE
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Briefcase size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Work Experience</h2>
          </div>
          {editingSection === 'experience' ? (
            <Button size="xs" variant="secondary" onClick={() => setEditingSection(null)}>Done</Button>
          ) : (
            <Button size="xs" variant="ghost" leftIcon={<Edit2 size={13} />} onClick={() => setEditingSection('experience')}>Edit</Button>
          )}
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {experienceList.map((exp) => (
            <div key={exp.id} style={{ borderBottom: '1px solid var(--color-gray-100)', paddingBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800 }}>{exp.role}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{exp.duration}</span>
                  {editingSection === 'experience' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-danger-500)', cursor: 'pointer', padding: 0 }}
                      title="Delete experience"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary-600)' }}>
                {exp.company} • {exp.location}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', marginTop: 4, lineHeight: 1.5 }}>
                {exp.description}
              </p>
            </div>
          ))}

          {/* Add Experience Form in Edit Mode */}
          {editingSection === 'experience' && (
            <form onSubmit={handleAddExperience} style={{ background: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-2)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Add New Experience</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <Input placeholder="Role (e.g. Senior Frontend Engineer)" value={newExpForm.role} onChange={(e) => setNewExpForm({ ...newExpForm, role: e.target.value })} required />
                <Input placeholder="Company (e.g. Infosys Digital)" value={newExpForm.company} onChange={(e) => setNewExpForm({ ...newExpForm, company: e.target.value })} required />
                <Input placeholder="Location (e.g. Hyderabad)" value={newExpForm.location} onChange={(e) => setNewExpForm({ ...newExpForm, location: e.target.value })} />
                <Input placeholder="Duration (e.g. June 2023 - Present)" value={newExpForm.duration} onChange={(e) => setNewExpForm({ ...newExpForm, duration: e.target.value })} />
              </div>
              <Textarea rows={2} placeholder="Key responsibilities and achievements..." value={newExpForm.description} onChange={(e) => setNewExpForm({ ...newExpForm, description: e.target.value })} style={{ marginBottom: 'var(--space-3)' }} />
              <Button size="sm" variant="primary" type="submit" leftIcon={<Plus size={14} />}>Add Experience</Button>
            </form>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          7. EDUCATION
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <GraduationCap size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Education</h2>
          </div>
          {editingSection === 'education' ? (
            <Button size="xs" variant="secondary" onClick={() => setEditingSection(null)}>Done</Button>
          ) : (
            <Button size="xs" variant="ghost" leftIcon={<Edit2 size={13} />} onClick={() => setEditingSection('education')}>Edit</Button>
          )}
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {educationList.map((edu) => (
            <div key={edu.id} style={{ borderBottom: '1px solid var(--color-gray-100)', paddingBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800 }}>{edu.degree}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{edu.duration || edu.year}</span>
                  {editingSection === 'education' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-danger-500)', cursor: 'pointer', padding: 0 }}
                      title="Delete education"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{edu.institution}</p>
              {edu.score && (
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-700)', marginTop: 2 }}>
                  Score: {edu.score}
                </p>
              )}
            </div>
          ))}

          {/* Add Education Form in Edit Mode */}
          {editingSection === 'education' && (
            <form onSubmit={handleAddEducation} style={{ background: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-2)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Add Education Entry</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <Input placeholder="Degree (e.g. B.Tech in CSE)" value={newEduForm.degree} onChange={(e) => setNewEduForm({ ...newEduForm, degree: e.target.value })} required />
                <Input placeholder="Institution (e.g. Andhra University)" value={newEduForm.institution} onChange={(e) => setNewEduForm({ ...newEduForm, institution: e.target.value })} required />
                <Input placeholder="Duration (e.g. 2017 - 2021)" value={newEduForm.duration} onChange={(e) => setNewEduForm({ ...newEduForm, duration: e.target.value })} />
                <Input placeholder="Score / CGPA (e.g. 8.7 CGPA)" value={newEduForm.score} onChange={(e) => setNewEduForm({ ...newEduForm, score: e.target.value })} />
              </div>
              <Button size="sm" variant="primary" type="submit" leftIcon={<Plus size={14} />}>Add Education</Button>
            </form>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          8. CERTIFICATIONS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Award size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Certifications</h2>
          </div>
          {editingSection === 'certifications' ? (
            <Button size="xs" variant="secondary" onClick={() => setEditingSection(null)}>Done</Button>
          ) : (
            <Button size="xs" variant="ghost" leftIcon={<Edit2 size={13} />} onClick={() => setEditingSection('certifications')}>Edit</Button>
          )}
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {certificationsList.map((c) => (
              <div key={c.id} style={{ padding: 'var(--space-3)', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 800 }}>{c.name || c.title}</h3>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{c.issuer || c.authority} ({c.year})</p>
                </div>
                {editingSection === 'certifications' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCertification(c.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger-500)', cursor: 'pointer', padding: '2px 6px' }}
                    title="Delete certification"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Certification Form in Edit Mode */}
          {editingSection === 'certifications' && (
            <form onSubmit={handleAddCertification} style={{ background: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-2)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Add Certification</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <Input placeholder="Certification Title (e.g. AWS Certified)" value={newCertForm.name} onChange={(e) => setNewCertForm({ ...newCertForm, name: e.target.value })} required />
                <Input placeholder="Issuer (e.g. Amazon Web Services)" value={newCertForm.issuer} onChange={(e) => setNewCertForm({ ...newCertForm, issuer: e.target.value })} />
                <Input placeholder="Year (e.g. 2024)" value={newCertForm.year} onChange={(e) => setNewCertForm({ ...newCertForm, year: e.target.value })} />
              </div>
              <Button size="sm" variant="primary" type="submit" leftIcon={<Plus size={14} />}>Add Certification</Button>
            </form>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          9. FEATURED PROJECTS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FolderGit2 size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title" style={{ fontSize: 'var(--text-base)' }}>Featured Projects</h2>
          </div>
          {editingSection === 'projects' ? (
            <Button size="xs" variant="secondary" onClick={() => setEditingSection(null)}>Done</Button>
          ) : (
            <Button size="xs" variant="ghost" leftIcon={<Edit2 size={13} />} onClick={() => setEditingSection('projects')}>Edit</Button>
          )}
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {projectsList.map((p) => (
              <div key={p.id} style={{ padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-primary-700)' }}>{p.title}</h3>
                    {editingSection === 'projects' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(p.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-danger-500)', cursor: 'pointer', padding: 0 }}
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 6px' }}>{p.tech}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text)', lineHeight: 1.4 }}>{p.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Project Form in Edit Mode */}
          {editingSection === 'projects' && (
            <form onSubmit={handleAddProject} style={{ background: 'var(--color-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-2)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Add Featured Project</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <Input placeholder="Project Title" value={newProjForm.title} onChange={(e) => setNewProjForm({ ...newProjForm, title: e.target.value })} required />
                <Input placeholder="Technologies (e.g. React, TypeScript, CSS)" value={newProjForm.tech} onChange={(e) => setNewProjForm({ ...newProjForm, tech: e.target.value })} />
              </div>
              <Textarea rows={2} placeholder="Project description and key impact..." value={newProjForm.description} onChange={(e) => setNewProjForm({ ...newProjForm, description: e.target.value })} style={{ marginBottom: 'var(--space-3)' }} />
              <Button size="sm" variant="primary" type="submit" leftIcon={<Plus size={14} />}>Add Project</Button>
            </form>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODALS: REPLACE RESUME & PREVIEW RESUME
      ════════════════════════════════════════════════════════════════════ */}
      {/* Replace Resume Modal */}
      {replaceModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)'
          }}
          onClick={() => setReplaceModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%', maxWidth: 480,
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--color-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Upload New Resume</h3>
              <button
                type="button"
                onClick={() => setReplaceModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              border: '2px dashed var(--color-primary-300)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8) var(--space-4)',
              textAlign: 'center',
              background: 'var(--color-primary-50)',
              marginBottom: 'var(--space-4)'
            }}>
              <UploadCloud size={36} style={{ color: 'var(--color-primary-600)', margin: '0 auto var(--space-3)' }} />
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary-900)' }}>
                Choose a PDF or DOCX file to upload
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Supports PDF, DOC, DOCX up to 5MB
              </p>

              <label style={{
                display: 'inline-block',
                marginTop: 'var(--space-4)',
                background: 'var(--color-primary-600)',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
                Browse Computer Files
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {uploadError && (
              <p style={{ fontSize: '11px', color: 'var(--color-danger-500)', marginBottom: 'var(--space-3)' }}>
                {uploadError}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <Button variant="outline" size="sm" onClick={() => setReplaceModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)'
          }}
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%', maxWidth: 580,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800 }}>Resume Preview: {resume.fileName}</h3>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 'var(--space-6)', overflowY: 'auto', flex: 1, fontSize: 'var(--text-xs)', lineHeight: 1.6, background: '#fafafa' }}>
              <div style={{ background: '#fff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{personal.fullName}</h1>
                <p style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>{personal.headline}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{personal.email} • {personal.phone} • {personal.location}</p>

                <hr style={{ margin: 'var(--space-4) 0', borderColor: 'var(--color-gray-200)' }} />

                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Professional Summary</h4>
                <p style={{ marginTop: 4 }}>{personal.bio}</p>

                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>Technical Skills</h4>
                <p style={{ marginTop: 4 }}>{skills.join(' • ')}</p>

                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>Work Experience</h4>
                {experienceList.map(exp => (
                  <div key={exp.id} style={{ marginTop: 6 }}>
                    <strong>{exp.role}</strong> — <span style={{ color: 'var(--color-text-muted)' }}>{exp.company} ({exp.duration})</span>
                  </div>
                ))}

                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>Education & Credentials</h4>
                {educationList.map(edu => (
                  <div key={edu.id} style={{ marginTop: 6 }}>
                    <strong>{edu.degree}</strong> — <span style={{ color: 'var(--color-text-muted)' }}>{edu.institution} ({edu.duration})</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <Button size="sm" variant="outline" onClick={handleDownloadResume} leftIcon={<Download size={14} />}>Download</Button>
              <Button size="sm" variant="primary" onClick={() => setPreviewModalOpen(false)}>Close Preview</Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          WHATSAPP DP STYLE PROFILE PHOTO MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {dpModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 'var(--space-4)'
          }}
          onClick={() => setDpModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface, #fff)',
              borderRadius: 'var(--radius-2xl)',
              maxWidth: 400,
              width: '100%',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-2xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setDpModalOpen(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'var(--color-gray-100)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-gray-600)'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Profile Photo
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '4px 0 var(--space-6) 0' }}>
              {showImage ? 'Manage or remove your display photo' : 'No custom photo added yet'}
            </p>

            {/* Circular DP Preview */}
            <div style={{
              width: 150,
              height: 150,
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-accent-600))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
              border: '4px solid #fff',
              marginBottom: 'var(--space-6)'
            }}>
              {showImage ? (
                <img
                  src={avatarUrl}
                  alt={personal.fullName || 'Profile Photo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '54px', fontWeight: 800 }}>{initialFallback}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', width: '100%', justifyContent: 'center' }}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Camera size={15} />}
                onClick={() => {
                  setDpModalOpen(false);
                  fileInputRef.current?.click();
                }}
              >
                {showImage ? 'Change Photo' : 'Upload Photo'}
              </Button>

              {showImage && (
                <Button
                  type="button"
                  variant="outline-danger"
                  size="sm"
                  leftIcon={<Trash2 size={15} />}
                  onClick={handleRemovePhoto}
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
