import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LayoutTemplate, Home, Briefcase, GraduationCap, CalendarDays,
  Info, Edit3, ArrowRight, ArrowLeft, ExternalLink, RotateCcw,
  CheckCircle2, Sparkles, Building2, Users,
  TrendingUp, Award, ShieldCheck, ArrowUpRight, Plus,
  Eye, EyeOff, BookOpen, Code2, Database, Landmark,
  Calculator, Cpu, Activity, Megaphone, Laptop, Target, X,
  UploadCloud, Trash2, Image
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import {
  useAdmin,
  DEFAULT_HOME_CONTENT,
  DEFAULT_JOBS_PAGE_CONTENT,
  DEFAULT_JOB_MELA_CONTENT,
  DEFAULT_SKILL_PAGE_CONTENT,
  DEFAULT_ABOUT_CONTENT
} from '../../context/AdminContext';
import heroImgDefault from '../../assets/hero.jpeg';
import { INDIAN_STATES, INDIAN_UNION_TERRITORIES } from '../../data/indiaLocations';
import AdminGalleryManager from '../../components/admin/AdminGalleryManager';
import AdminNewsManager from '../../components/admin/AdminNewsManager';

const AVAILABLE_ICONS = [
  { value: 'Briefcase', label: 'Briefcase (Jobs)' },
  { value: 'Building2', label: 'Building (Companies)' },
  { value: 'Users', label: 'Users (Candidates)' },
  { value: 'TrendingUp', label: 'Trending Up (Placements)' },
  { value: 'Award', label: 'Award (Achievements)' },
  { value: 'ShieldCheck', label: 'Shield Check (Trust)' },
  { value: 'GraduationCap', label: 'Graduation Cap (Skills)' },
  { value: 'CalendarDays', label: 'Calendar Days (Job Melas)' },
  { value: 'ArrowUpRight', label: 'Arrow Up Right (Applications)' },
  { value: 'CheckCircle2', label: 'Check Circle (Success)' },
  { value: 'Sparkles', label: 'Sparkles (Featured)' },
  { value: 'BookOpen', label: 'Book Open (Learning)' },
  { value: 'Code2', label: 'Code (Technology)' },
  { value: 'Laptop', label: 'Laptop (Practical Labs)' },
  { value: 'Database', label: 'Database (Data / AI)' },
  { value: 'Landmark', label: 'Landmark (Banking)' },
  { value: 'Calculator', label: 'Calculator (Accounting)' },
  { value: 'Cpu', label: 'CPU (Engineering)' },
  { value: 'Activity', label: 'Activity (Healthcare)' },
  { value: 'Megaphone', label: 'Megaphone (Marketing)' },
  { value: 'Target', label: 'Target (Mission)' },
];

export default function AdminWebsiteContentPage() {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    homeContent, updateHomeContent, resetHomeContent,
    jobsPageContent, updateJobsPageContent, resetJobsPageContent,
    jobMelaContent, updateJobMelaContent, resetJobMelaContent,
    skillPageContent, updateSkillPageContent, resetSkillPageContent,
    aboutContent, updateAboutContent, resetAboutContent,
  } = useAdmin();

  // Active page tab from query param or local state
  const tabParam = searchParams.get('page') || searchParams.get('tab');
  const [localSelectedPage, setLocalSelectedPage] = useState('home');
  const selectedPage = tabParam || localSelectedPage || 'home';

  const handleSelectPage = (pageKey) => {
    setLocalSelectedPage(pageKey);
    if (pageKey) {
      setSearchParams({ page: pageKey });
    } else {
      setSearchParams({ page: 'home' });
    }
  };

  const handleResetCurrentPage = () => {
    if (selectedPage === 'home') {
      resetHomeContent();
      addToast('Home Page content reset to default values.', 'info');
    } else if (selectedPage === 'jobs') {
      resetJobsPageContent();
      addToast('Jobs Page content reset to default values.', 'info');
    } else if (selectedPage === 'skills') {
      resetSkillPageContent();
      addToast('Skill Development content reset to default values.', 'info');
    } else if (selectedPage === 'job-melas') {
      resetJobMelaContent();
      addToast('Job Melas content reset to default values.', 'info');
    } else if (selectedPage === 'about') {
      resetAboutContent();
      addToast('About Us content reset to default values.', 'info');
    } else if (selectedPage === 'gallery') {
      updateHomeContent({ gallery: DEFAULT_HOME_CONTENT.gallery });
      addToast('Gallery content reset to default values.', 'info');
    } else if (selectedPage === 'news') {
      updateHomeContent({ newsArticles: DEFAULT_HOME_CONTENT.newsArticles });
      addToast('News articles reset to default values.', 'info');
    }
  };

  // ── Render Icon Helper ──
  const renderIcon = (iconName, size = 18) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase size={size} />;
      case 'Building2': return <Building2 size={size} />;
      case 'Users': return <Users size={size} />;
      case 'TrendingUp': return <TrendingUp size={size} />;
      case 'Award': return <Award size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'GraduationCap': return <GraduationCap size={size} />;
      case 'CalendarDays': return <CalendarDays size={size} />;
      case 'ArrowUpRight': return <ArrowUpRight size={size} />;
      case 'CheckCircle2': return <CheckCircle2 size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'BookOpen': return <BookOpen size={size} />;
      case 'Code2': return <Code2 size={size} />;
      case 'Laptop': return <Laptop size={size} />;
      case 'Database': return <Database size={size} />;
      case 'Landmark': return <Landmark size={size} />;
      case 'Calculator': return <Calculator size={size} />;
      case 'Cpu': return <Cpu size={size} />;
      case 'Activity': return <Activity size={size} />;
      case 'Megaphone': return <Megaphone size={size} />;
      case 'Target': return <Target size={size} />;
      default: return <Sparkles size={size} />;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HOME PAGE CONTENT STATE & HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const curHome = homeContent || DEFAULT_HOME_CONTENT;
  const [homeHeroModal, setHomeHeroModal] = useState(false);
  const [homeWhyChooseModal, setHomeWhyChooseModal] = useState(false);
  const [homeHeroForm, setHomeHeroForm] = useState({
    badge: curHome.hero?.badge || '',
    heading1: curHome.hero?.heading1 || '',
    heading2: curHome.hero?.heading2 || '',
    subtext: curHome.hero?.subtext || '',
    searchPlaceholder: curHome.hero?.searchPlaceholder || '',
    popularSearches: [...(curHome.hero?.popularSearches || [])],
    heroImage: curHome.hero?.heroImage || null,
  });
  const [newHomePopularTag, setNewHomePopularTag] = useState('');
  const [homeWcForm, setHomeWcForm] = useState({
    heading1: curHome.whyChoose?.heading1 || '',
    heading2: curHome.whyChoose?.heading2 || '',
    subtitle: curHome.whyChoose?.subtitle || '',
    cards: (curHome.whyChoose?.cards || []).map(c => ({ ...c })),
  });
  const [savingHome, setSavingHome] = useState(false);

  const handleOpenHomeHero = () => {
    const h = curHome.hero || DEFAULT_HOME_CONTENT.hero;
    setHomeHeroForm({
      badge: h.badge || '',
      heading1: h.heading1 || '',
      heading2: h.heading2 || '',
      subtext: h.subtext || '',
      searchPlaceholder: h.searchPlaceholder || '',
      popularSearches: [...(h.popularSearches || [])],
      heroImage: h.heroImage || null,
    });
    setNewHomePopularTag('');
    setHomeHeroModal(true);
  };

  const handleAddHomePopularTag = (e) => {
    if (e) e.preventDefault();
    const tag = newHomePopularTag.trim();
    if (!tag) return;
    if (homeHeroForm.popularSearches.includes(tag)) {
      addToast('Tag already exists', 'warning');
      return;
    }
    setHomeHeroForm(prev => ({
      ...prev,
      popularSearches: [...prev.popularSearches, tag]
    }));
    setNewHomePopularTag('');
  };

  const handleRemoveHomePopularTag = (tag) => {
    setHomeHeroForm(prev => ({
      ...prev,
      popularSearches: prev.popularSearches.filter(t => t !== tag)
    }));
  };

  const handleSaveHomeHero = (e) => {
    e.preventDefault();
    setSavingHome(true);
    setTimeout(() => {
      updateHomeContent({
        hero: {
          badge: homeHeroForm.badge,
          heading1: homeHeroForm.heading1,
          heading2: homeHeroForm.heading2,
          subtext: homeHeroForm.subtext,
          searchPlaceholder: homeHeroForm.searchPlaceholder,
          popularSearches: homeHeroForm.popularSearches.length ? homeHeroForm.popularSearches : DEFAULT_HOME_CONTENT.hero.popularSearches,
          heroImage: homeHeroForm.heroImage,
        }
      });
      setSavingHome(false);
      setHomeHeroModal(false);
      addToast('Home Page Hero section updated successfully!', 'success');
    }, 250);
  };

  const handleOpenHomeWc = () => {
    const wc = curHome.whyChoose || DEFAULT_HOME_CONTENT.whyChoose;
    setHomeWcForm({
      heading1: wc.heading1 || '',
      heading2: wc.heading2 || '',
      subtitle: wc.subtitle || '',
      cards: (wc.cards || []).map(c => ({ ...c })),
    });
    setHomeWhyChooseModal(true);
  };

  const handleSaveHomeWc = (e) => {
    e.preventDefault();
    setSavingHome(true);
    setTimeout(() => {
      updateHomeContent({
        whyChoose: {
          heading1: homeWcForm.heading1,
          heading2: homeWcForm.heading2,
          subtitle: homeWcForm.subtitle,
          cards: homeWcForm.cards,
        }
      });
      setSavingHome(false);
      setHomeWhyChooseModal(false);
      addToast('Home Page "Why Choose" section updated successfully!', 'success');
    }, 250);
  };

  const handleHeroImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image size should be less than 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setHomeHeroForm(prev => ({ ...prev, heroImage: reader.result }));
      addToast('Custom hero image loaded. Click Save to persist.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Welcome Popup Poster Date Helpers
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts.map(Number);
    if (!y || !m || !d) return dateStr;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getPopupScheduleStatusInfo = (popup) => {
    if (!popup || !popup.imageUrl) {
      return { status: 'NOT_CONFIGURED', label: 'Not Configured', color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' };
    }
    if (!popup.enabled) {
      return { status: 'HIDDEN', label: '● Hidden', color: '#b45309', bg: '#fffbeb', border: '#fde68a' };
    }
    if (!popup.startDate || !popup.endDate) {
      return { status: 'INCOMPLETE', label: '● Incomplete Schedule', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    }
    const today = getTodayDateString();
    if (today < popup.startDate) {
      return { status: 'SCHEDULED', label: '● Scheduled', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
    }
    if (today > popup.endDate) {
      return { status: 'EXPIRED', label: '● Expired', color: '#64748b', bg: '#f8fafc', border: '#cbd5e1' };
    }
    return { status: 'ACTIVE', label: '● Active', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' };
  };

  // Welcome Popup Poster State & Handlers
  const curWelcomePopup = curHome.welcomePopup || DEFAULT_HOME_CONTENT.welcomePopup;
  const [welcomePopupModal, setWelcomePopupModal] = useState(false);
  const [welcomePopupForm, setWelcomePopupForm] = useState({
    enabled: curWelcomePopup.enabled || false,
    imageUrl: curWelcomePopup.imageUrl || '',
    redirectUrl: curWelcomePopup.redirectUrl || '',
    startDate: curWelcomePopup.startDate || '',
    endDate: curWelcomePopup.endDate || '',
  });

  const handleOpenWelcomePopup = () => {
    const h = homeContent || DEFAULT_HOME_CONTENT;
    const wp = h.welcomePopup || DEFAULT_HOME_CONTENT.welcomePopup;
    setWelcomePopupForm({
      enabled: wp.enabled || false,
      imageUrl: wp.imageUrl || '',
      redirectUrl: wp.redirectUrl || '',
      startDate: wp.startDate || '',
      endDate: wp.endDate || '',
    });
    setWelcomePopupModal(true);
  };

  const handlePopupImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setWelcomePopupForm(prev => ({
        ...prev,
        imageUrl: reader.result,
        enabled: true,
      }));
      addToast('Popup poster selected. Configure schedule & click Save Changes to publish.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWelcomePopup = (e) => {
    e.preventDefault();

    // Required date validation when poster image is configured
    if (welcomePopupForm.imageUrl) {
      if (!welcomePopupForm.startDate || !welcomePopupForm.endDate) {
        addToast('Please select both Display Start Date and Display End Date.', 'error');
        return;
      }
      if (welcomePopupForm.endDate < welcomePopupForm.startDate) {
        addToast('End Date must be on or after Start Date.', 'error');
        return;
      }
    }

    if (welcomePopupForm.redirectUrl) {
      const trimmed = welcomePopupForm.redirectUrl.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        addToast('Please enter a valid HTTP or HTTPS redirect URL (e.g. https://forms.google.com/...)', 'error');
        return;
      }
    }

    setSavingHome(true);
    setTimeout(() => {
      updateHomeContent({
        welcomePopup: {
          enabled: welcomePopupForm.enabled,
          imageUrl: welcomePopupForm.imageUrl,
          redirectUrl: (welcomePopupForm.redirectUrl || '').trim(),
          startDate: welcomePopupForm.startDate || '',
          endDate: welcomePopupForm.endDate || '',
        }
      });
      setSavingHome(false);
      setWelcomePopupModal(false);
      addToast('Welcome Popup Poster updated successfully!', 'success');
    }, 250);
  };

  const handleTogglePopupStatus = () => {
    setWelcomePopupForm(prev => {
      const nextStatus = !prev.enabled;
      addToast(nextStatus ? 'Poster set to Active.' : 'Poster set to Hidden.', 'info');
      return { ...prev, enabled: nextStatus };
    });
  };

  const handleRemovePopupPoster = () => {
    setWelcomePopupForm({
      enabled: false,
      imageUrl: '',
      redirectUrl: '',
      startDate: '',
      endDate: '',
    });
    addToast('Poster removed. Click Save Changes to confirm.', 'info');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. JOBS PAGE CONTENT STATE & HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const curJobs = jobsPageContent || DEFAULT_JOBS_PAGE_CONTENT;
  const [jobsHeroModal, setJobsHeroModal] = useState(false);
  const [jobsSearchModal, setJobsSearchModal] = useState(false);
  const [jobsHeroForm, setJobsHeroForm] = useState({
    badge: curJobs.hero?.badge || '',
    heading: curJobs.hero?.heading || '',
    subtitle: curJobs.hero?.subtitle || '',
  });
  const [jobsSearchForm, setJobsSearchForm] = useState({
    searchPlaceholder: curJobs.search?.searchPlaceholder || '',
    locationPlaceholder: curJobs.search?.locationPlaceholder || '',
    popularSearches: [...(curJobs.search?.popularSearches || [])],
  });
  const [newPopularTag, setNewPopularTag] = useState('');
  const [savingJobs, setSavingJobs] = useState(false);

  const handleOpenJobsHero = () => {
    const j = jobsPageContent || DEFAULT_JOBS_PAGE_CONTENT;
    setJobsHeroForm({
      badge: j.hero?.badge || '',
      heading: j.hero?.heading || '',
      subtitle: j.hero?.subtitle || '',
    });
    setJobsHeroModal(true);
  };

  const handleSaveJobsHero = (e) => {
    e.preventDefault();
    setSavingJobs(true);
    setTimeout(() => {
      updateJobsPageContent({
        hero: jobsHeroForm,
      });
      setSavingJobs(false);
      setJobsHeroModal(false);
      addToast('Jobs Page Hero updated successfully!', 'success');
    }, 250);
  };

  const handleOpenJobsSearch = () => {
    const j = jobsPageContent || DEFAULT_JOBS_PAGE_CONTENT;
    setJobsSearchForm({
      searchPlaceholder: j.search?.searchPlaceholder || '',
      locationPlaceholder: j.search?.locationPlaceholder || '',
      popularSearches: [...(j.search?.popularSearches || [])],
    });
    setNewPopularTag('');
    setJobsSearchModal(true);
  };

  const handleAddPopularTag = (e) => {
    if (e) e.preventDefault();
    const tag = newPopularTag.trim();
    if (!tag) return;
    if (jobsSearchForm.popularSearches.includes(tag)) {
      addToast('Tag already exists', 'warning');
      return;
    }
    setJobsSearchForm(prev => ({
      ...prev,
      popularSearches: [...prev.popularSearches, tag]
    }));
    setNewPopularTag('');
  };

  const handleRemovePopularTag = (tag) => {
    setJobsSearchForm(prev => ({
      ...prev,
      popularSearches: prev.popularSearches.filter(t => t !== tag)
    }));
  };

  const handleSaveJobsSearch = (e) => {
    e.preventDefault();
    setSavingJobs(true);
    setTimeout(() => {
      updateJobsPageContent({
        search: jobsSearchForm,
      });
      setSavingJobs(false);
      setJobsSearchModal(false);
      addToast('Jobs Page search & popular search tags updated!', 'success');
    }, 250);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SKILL DEVELOPMENT CONTENT STATE & HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const curSkill = skillPageContent || DEFAULT_SKILL_PAGE_CONTENT;
  const [skillHeroModal, setSkillHeroModal] = useState(false);
  const [skillHighlightsModal, setSkillHighlightsModal] = useState(false);
  const [skillMissionModal, setSkillMissionModal] = useState(false);
  const [skillPathwayModal, setSkillPathwayModal] = useState(false);
  const [skillProgramsModal, setSkillProgramsModal] = useState(false);
  const [skillWhyChooseModal, setSkillWhyChooseModal] = useState(false);

  const [skillHeroForm, setSkillHeroForm] = useState({
    badge: curSkill.hero?.badge || '',
    heading: curSkill.hero?.heading || '',
    description: curSkill.hero?.description || '',
    exploreBtnText: curSkill.hero?.exploreBtnText || 'Explore Programs',
    viewCoursesBtnText: curSkill.hero?.viewCoursesBtnText || 'View Courses',
  });
  const [skillHighlightsForm, setSkillHighlightsForm] = useState(
    (curSkill.highlights || DEFAULT_SKILL_PAGE_CONTENT.highlights).map(h => ({ ...h }))
  );
  const [skillMissionForm, setSkillMissionForm] = useState({
    badge: curSkill.empoweringSkills?.badge || '',
    heading: curSkill.empoweringSkills?.heading || '',
    description: curSkill.empoweringSkills?.description || '',
    cards: (curSkill.empoweringSkills?.cards || []).map(c => ({ ...c })),
  });
  const [skillPathwayForm, setSkillPathwayForm] = useState({
    badge: curSkill.trainingJourney?.badge || '',
    heading: curSkill.trainingJourney?.heading || '',
    description: curSkill.trainingJourney?.description || '',
    steps: (curSkill.trainingJourney?.steps || []).map(s => ({ ...s })),
  });
  const [skillProgramsForm, setSkillProgramsForm] = useState({
    badge: curSkill.programsWeOffer?.badge || '',
    heading: curSkill.programsWeOffer?.heading || '',
    description: curSkill.programsWeOffer?.description || '',
    categories: (curSkill.programsWeOffer?.categories || []).map(c => ({ ...c })),
  });
  const [skillWcForm, setSkillWcForm] = useState({
    badge: curSkill.whyChoose?.badge || '',
    heading: curSkill.whyChoose?.heading || '',
    description: curSkill.whyChoose?.description || '',
    cards: (curSkill.whyChoose?.cards || []).map(c => ({ ...c })),
  });
  const [savingSkill, setSavingSkill] = useState(false);

  const handleOpenSkillHero = () => {
    const s = curSkill.hero || DEFAULT_SKILL_PAGE_CONTENT.hero;
    setSkillHeroForm({
      badge: s.badge || '',
      heading: s.heading || '',
      description: s.description || '',
      exploreBtnText: s.exploreBtnText || 'Explore Programs',
      viewCoursesBtnText: s.viewCoursesBtnText || 'View Courses',
    });
    setSkillHeroModal(true);
  };

  const handleSaveSkillHero = (e) => {
    e.preventDefault();
    setSavingSkill(true);
    setTimeout(() => {
      updateSkillPageContent({ hero: skillHeroForm });
      setSavingSkill(false);
      setSkillHeroModal(false);
      addToast('Skill Development Hero section updated!', 'success');
    }, 250);
  };

  const handleOpenSkillHighlights = () => {
    const hls = curSkill.highlights?.length ? curSkill.highlights : DEFAULT_SKILL_PAGE_CONTENT.highlights;
    setSkillHighlightsForm(hls.map(h => ({ ...h })));
    setSkillHighlightsModal(true);
  };

  const handleSaveSkillHighlights = (e) => {
    e.preventDefault();
    setSavingSkill(true);
    setTimeout(() => {
      updateSkillPageContent({ highlights: skillHighlightsForm });
      setSavingSkill(false);
      setSkillHighlightsModal(false);
      addToast('Skill Highlights updated!', 'success');
    }, 250);
  };

  const handleOpenSkillMission = () => {
    const m = curSkill.empoweringSkills || DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills;
    setSkillMissionForm({
      badge: m.badge || '',
      heading: m.heading || '',
      description: m.description || '',
      cards: (m.cards || []).map(c => ({ ...c })),
    });
    setSkillMissionModal(true);
  };

  const handleSaveSkillMission = (e) => {
    e.preventDefault();
    setSavingSkill(true);
    setTimeout(() => {
      updateSkillPageContent({ empoweringSkills: skillMissionForm });
      setSavingSkill(false);
      setSkillMissionModal(false);
      addToast('Skill Institutional Mission section updated!', 'success');
    }, 250);
  };

  const handleOpenSkillPathway = () => {
    const p = curSkill.trainingJourney || DEFAULT_SKILL_PAGE_CONTENT.trainingJourney;
    setSkillPathwayForm({
      badge: p.badge || '',
      heading: p.heading || '',
      description: p.description || '',
      steps: (p.steps || []).map(s => ({ ...s })),
    });
    setSkillPathwayModal(true);
  };

  const handleSaveSkillPathway = (e) => {
    e.preventDefault();
    setSavingSkill(true);
    setTimeout(() => {
      updateSkillPageContent({ trainingJourney: skillPathwayForm });
      setSavingSkill(false);
      setSkillPathwayModal(false);
      addToast('Candidate Pathway / Training Journey updated!', 'success');
    }, 250);
  };

  const handleOpenSkillPrograms = () => {
    const prg = curSkill.programsWeOffer || DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer;
    setSkillProgramsForm({
      badge: prg.badge || '',
      heading: prg.heading || '',
      description: prg.description || '',
      categories: (prg.categories || []).map(c => ({ ...c })),
    });
    setSkillProgramsModal(true);
  };

  const handleSaveSkillPrograms = (e) => {
    e.preventDefault();
    setSavingSkill(true);
    setTimeout(() => {
      updateSkillPageContent({ programsWeOffer: skillProgramsForm });
      setSavingSkill(false);
      setSkillProgramsModal(false);
      addToast('Programs We Offer section updated!', 'success');
    }, 250);
  };

  const handleOpenSkillWc = () => {
    const wc = curSkill.whyChoose || DEFAULT_SKILL_PAGE_CONTENT.whyChoose;
    setSkillWcForm({
      badge: wc.badge || '',
      heading: wc.heading || '',
      description: wc.description || '',
      cards: (wc.cards || []).map(c => ({ ...c })),
    });
    setSkillWhyChooseModal(true);
  };

  const handleSaveSkillWc = (e) => {
    e.preventDefault();
    setSavingSkill(true);
    setTimeout(() => {
      updateSkillPageContent({ whyChoose: skillWcForm });
      setSavingSkill(false);
      setSkillWhyChooseModal(false);
      addToast('Skill "Why Choose NTR VIKASA" updated!', 'success');
    }, 250);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. JOB MELAS CONTENT STATE & HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const curMela = jobMelaContent || DEFAULT_JOB_MELA_CONTENT;
  const [melaHeroModal, setMelaHeroModal] = useState(false);
  const [melaHeroForm, setMelaHeroForm] = useState({
    badge: curMela.hero?.badge || '',
    heading: curMela.hero?.heading || '',
    description: curMela.hero?.description || '',
  });
  const [savingMela, setSavingMela] = useState(false);

  const handleOpenMelaHero = () => {
    const m = jobMelaContent || DEFAULT_JOB_MELA_CONTENT;
    setMelaHeroForm({
      badge: m.hero?.badge || '',
      heading: m.hero?.heading || '',
      description: m.hero?.description || '',
    });
    setMelaHeroModal(true);
  };

  const handleSaveMelaHero = (e) => {
    e.preventDefault();
    setSavingMela(true);
    setTimeout(() => {
      updateJobMelaContent({ hero: melaHeroForm });
      setSavingMela(false);
      setMelaHeroModal(false);
      addToast('Job Melas Public Page Hero section updated!', 'success');
    }, 250);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ABOUT US CONTENT STATE & HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const curAbout = aboutContent || DEFAULT_ABOUT_CONTENT;
  const [aboutHeroModal, setAboutHeroModal] = useState(false);
  const [aboutWwsfModal, setAboutWwsfModal] = useState(false);
  const [aboutTeamModal, setAboutTeamModal] = useState(false);
  const [aboutMessagesModal, setAboutMessagesModal] = useState(false);
  const [aboutPartnersModal, setAboutPartnersModal] = useState(false);

  const [aboutHeroForm, setAboutHeroForm] = useState({
    badge: curAbout.hero?.badge || 'Our Mission & Impact',
    heading: curAbout.hero?.heading || 'Bridging Talent with Opportunity Across India',
    description: curAbout.hero?.description || '',
  });

  const [aboutWwsfForm, setAboutWwsfForm] = useState({
    heading: curAbout.whatWeStandFor?.heading || 'What We Stand For',
    description: curAbout.whatWeStandFor?.description || '',
    cards: (curAbout.whatWeStandFor?.cards || DEFAULT_ABOUT_CONTENT.whatWeStandFor.cards).map(c => ({ ...c })),
  });

  const [aboutTeamForm, setAboutTeamForm] = useState({
    badge: curAbout.team?.badge || 'Our Leadership & Team',
    heading: curAbout.team?.heading || 'Our Team',
    description: curAbout.team?.description || '',
    members: (curAbout.team?.members || []).map(m => ({ ...m })),
  });

  const [aboutMessagesForm, setAboutMessagesForm] = useState({
    badge: curAbout.leadershipMessages?.badge || 'LEADERSHIP',
    heading: curAbout.leadershipMessages?.heading || 'Leadership Messages',
    description: curAbout.leadershipMessages?.description || '',
    messages: (curAbout.leadershipMessages?.messages || []).map(m => ({ ...m })),
  });

  const [aboutPartnersForm, setAboutPartnersForm] = useState({
    heading: curAbout.partners?.heading || 'OUR INDUSTRY & ACADEMIC TRAINING PARTNERS',
    description: curAbout.partners?.description || '',
    list: (curAbout.partners?.list || []).map(p => ({ ...p })),
  });

  const [savingAbout, setSavingAbout] = useState(false);

  const handleOpenAboutHero = () => {
    const h = curAbout.hero || DEFAULT_ABOUT_CONTENT.hero;
    setAboutHeroForm({
      badge: h.badge || 'Our Mission & Impact',
      heading: h.heading || 'Bridging Talent with Opportunity Across India',
      description: h.description || '',
    });
    setAboutHeroModal(true);
  };

  const handleSaveAboutHero = (e) => {
    e.preventDefault();
    setSavingAbout(true);
    setTimeout(() => {
      updateAboutContent({ hero: aboutHeroForm });
      setSavingAbout(false);
      setAboutHeroModal(false);
      addToast('About Us Hero / Mission & Impact updated!', 'success');
    }, 250);
  };

  const handleOpenAboutWwsf = () => {
    const w = curAbout.whatWeStandFor || DEFAULT_ABOUT_CONTENT.whatWeStandFor;
    setAboutWwsfForm({
      heading: w.heading || 'What We Stand For',
      description: w.description || '',
      cards: (w.cards || DEFAULT_ABOUT_CONTENT.whatWeStandFor.cards).map(c => ({ ...c })),
    });
    setAboutWwsfModal(true);
  };

  const handleSaveAboutWwsf = (e) => {
    e.preventDefault();
    setSavingAbout(true);
    setTimeout(() => {
      updateAboutContent({ whatWeStandFor: aboutWwsfForm });
      setSavingAbout(false);
      setAboutWwsfModal(false);
      addToast('About Us "What We Stand For" section updated!', 'success');
    }, 250);
  };

  const handleOpenAboutTeam = () => {
    const t = curAbout.team || DEFAULT_ABOUT_CONTENT.team;
    setAboutTeamForm({
      badge: t.badge || 'Our Leadership & Team',
      heading: t.heading || 'Our Team',
      description: t.description || '',
      members: (t.members || []).map(m => ({ ...m })),
    });
    setAboutTeamModal(true);
  };

  const handleSaveAboutTeam = (e) => {
    e.preventDefault();
    setSavingAbout(true);
    setTimeout(() => {
      updateAboutContent({ team: aboutTeamForm });
      setSavingAbout(false);
      setAboutTeamModal(false);
      addToast('About Us "Our Team" members updated!', 'success');
    }, 250);
  };

  const handleOpenAboutMessages = () => {
    const m = curAbout.leadershipMessages || DEFAULT_ABOUT_CONTENT.leadershipMessages;
    setAboutMessagesForm({
      badge: m.badge || 'LEADERSHIP',
      heading: m.heading || 'Leadership Messages',
      description: m.description || '',
      messages: (m.messages || []).map(msg => ({ ...msg })),
    });
    setAboutMessagesModal(true);
  };

  const handleSaveAboutMessages = (e) => {
    e.preventDefault();
    setSavingAbout(true);
    setTimeout(() => {
      updateAboutContent({ leadershipMessages: aboutMessagesForm });
      setSavingAbout(false);
      setAboutMessagesModal(false);
      addToast('About Us Leadership Messages updated!', 'success');
    }, 250);
  };

  const handleOpenAboutPartners = () => {
    const p = curAbout.partners || DEFAULT_ABOUT_CONTENT.partners;
    setAboutPartnersForm({
      heading: p.heading || 'OUR INDUSTRY & ACADEMIC TRAINING PARTNERS',
      description: p.description || '',
      list: (p.list || []).map(partner => ({ ...partner })),
    });
    setAboutPartnersModal(true);
  };

  const handleSaveAboutPartners = (e) => {
    e.preventDefault();
    setSavingAbout(true);
    setTimeout(() => {
      updateAboutContent({ partners: aboutPartnersForm });
      setSavingAbout(false);
      setAboutPartnersModal(false);
      addToast('About Us Training Partners updated!', 'success');
    }, 250);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGES CONFIGURATION LIST (FOR 5 CARDS - OPTION 1)
  // ═══════════════════════════════════════════════════════════════════════════
  const pagesList = [
    {
      id: 'home',
      title: 'Home Page',
      icon: '🏠',
      desc: 'Manage content',
      publicPath: '/',
    },
    {
      id: 'jobs',
      title: 'Jobs Page',
      icon: '💼',
      desc: 'Manage content',
      publicPath: '/jobs',
    },
    {
      id: 'skills',
      title: 'Skill Development',
      icon: '🎓',
      desc: 'Manage content',
      publicPath: '/skill-development',
    },
    {
      id: 'job-melas',
      title: 'Job Melas',
      icon: '🎪',
      desc: 'Manage content',
      publicPath: '/job-melas',
    },
    {
      id: 'about',
      title: 'About Us',
      icon: 'ℹ️',
      desc: 'Manage content',
      publicPath: '/about',
    },
    {
      id: 'gallery',
      title: 'Media & Gallery',
      icon: '🖼️',
      desc: 'Photos & Videos',
      publicPath: '/gallery',
    },
    {
      id: 'news',
      title: 'News & Press',
      icon: '📰',
      desc: 'Newspaper Clippings',
      publicPath: '/#news-articles',
    },
  ];

  const currentPageObj = pagesList.find(p => p.id === selectedPage);

  return (
    <div className="cms-hub-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* ── Top Page Header ── */}
      <div
        className="cms-hub-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-border-2, #e2e8f0)',
        }}
      >
        <div className="cms-hub-header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            className="cms-hub-icon-box"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--color-gray-100, #f1f5f9)',
              border: '1px solid var(--color-border-2, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text, #0f172a)',
            }}
          >
            <LayoutTemplate size={22} />
          </span>
          <div>
            <h1
              className="cms-hub-title"
              style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text, #0f172a)', margin: 0, lineHeight: 1.2 }}
            >
              Website Content Management
            </h1>
            <p
              className="cms-hub-subtitle"
              style={{ fontSize: '13px', color: 'var(--color-text-muted, #64748b)', margin: '4px 0 0 0' }}
            >
              Manage content displayed on the public website
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={currentPageObj?.publicPath || '/'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            Preview Website <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* ── 5 Page Selection Cards (Always Visible at Top) ── */}
      <div className="cms-page-selector-grid">
        {pagesList.map((page) => {
          const isActive = selectedPage === page.id;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => handleSelectPage(page.id)}
              className={`cms-page-selector-card ${isActive ? 'active' : ''}`}
            >
              <div style={{ fontSize: '22px', lineHeight: 1 }}>{page.icon}</div>
              <div>
                <div className="cms-page-selector-title">{page.title}</div>
                <div className="cms-page-selector-desc">{page.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Section Management Cards Container ── */}
      <div className="cms-sections-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 4px 0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{currentPageObj?.icon}</span> {currentPageObj?.title} Sections
          </h2>
          <button
            type="button"
            onClick={handleResetCurrentPage}
            className="btn btn-secondary btn-xs"
            style={{ gap: '4px', fontSize: '12px', color: '#64748b' }}
          >
            <RotateCcw size={13} /> Reset Defaults
          </button>
        </div>

        {/* 1. HOME PAGE SECTIONS */}
        {selectedPage === 'home' && (
          <>
            {/* Hero Section */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Hero Section</h3>
                  <span className="cms-section-badge">Top of Home Page</span>
                </div>
                <p className="cms-section-desc">
                  Manage the homepage hero badge, heading, description and presentation.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenHomeHero}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Why Choose Our Job Portal? */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Why Choose Our Job Portal?</h3>
                  <span className="cms-section-badge">Feature Cards</span>
                </div>
                <p className="cms-section-desc">
                  Manage the six value-proposition cards.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenHomeWc}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Welcome Popup Poster */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <h3 className="cms-section-title">Welcome Popup Poster</h3>
                  <span className="cms-section-badge">Initial Visitor Modal</span>
                  {(() => {
                    const statusInfo = getPopupScheduleStatusInfo(curWelcomePopup);
                    return (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '11px',
                        fontWeight: 700,
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.border}`,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>
                <p className="cms-section-desc">
                  Manage the image and redirect link shown in the welcome popup when visitors first arrive on the website.
                </p>
                {curWelcomePopup.startDate && curWelcomePopup.endDate && (
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                    <strong>Scheduled Display:</strong> {formatDisplayDate(curWelcomePopup.startDate)} – {formatDisplayDate(curWelcomePopup.endDate)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleOpenWelcomePopup}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Manage Popup
              </button>
            </div>

            {/* Media & Event Gallery */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Media & Event Gallery</h3>
                  <span className="cms-section-badge">Photos & Interactive Videos</span>
                </div>
                <p className="cms-section-desc">
                  Manage event photos and YouTube videos with hover-to-play, click pause/play, mute toggle, and YouTube links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectPage('gallery')}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Manage Gallery
              </button>
            </div>

            {/* Newspaper Articles & Media Highlights */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Newspaper Articles & Press Highlights</h3>
                  <span className="cms-section-badge">Newspaper Clippings & Auto-Moving Carousel</span>
                </div>
                <p className="cms-section-desc">
                  Manage authentic newspaper press coverage clippings (Sakshi, Eenadu, Suryaa, etc.) displayed in the slowly auto-moving landing page carousel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectPage('news')}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Manage Press Clippings
              </button>
            </div>

            {/* Platform Key Metrics */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Platform Key Metrics</h3>
                  <span className="cms-section-badge">Active Jobs, Companies, Candidates & Placements</span>
                </div>
                <p className="cms-section-desc">
                  Automatically calculated from database records.
                </p>
              </div>
              <span className="cms-dynamic-badge">
                🔒 Dynamic
              </span>
            </div>
          </>
        )}

        {/* 2. JOBS PAGE SECTIONS */}
        {selectedPage === 'jobs' && (
          <>
            {/* Jobs Page Hero */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Jobs Page Hero</h3>
                  <span className="cms-section-badge">Top Banner</span>
                </div>
                <p className="cms-section-desc">
                  Manage badge, heading and description.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenJobsHero}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Job Search */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Job Search</h3>
                  <span className="cms-section-badge">Search Configuration</span>
                </div>
                <p className="cms-section-desc">
                  Manage search labels and placeholders.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenJobsSearch}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Popular Searches */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Popular Searches</h3>
                  <span className="cms-section-badge">Keyword Chips</span>
                </div>
                <p className="cms-section-desc">
                  Manage popular-search keyword chips.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenJobsSearch}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Job Locations */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Job Locations</h3>
                  <span className="cms-section-badge">Location Filter System</span>
                </div>
                <p className="cms-section-desc">
                  Manage/verify supported Indian States and Union Territories (28 States + 8 UTs).
                </p>
              </div>
              <span className="cms-dynamic-badge">
                ✓ {INDIAN_STATES.length + INDIAN_UNION_TERRITORIES.length} Regions Active
              </span>
            </div>
          </>
        )}

        {/* 3. SKILL DEVELOPMENT SECTIONS */}
        {selectedPage === 'skills' && (
          <>
            {/* Hero Section */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Hero Section</h3>
                  <span className="cms-section-badge">Top Banner</span>
                </div>
                <p className="cms-section-desc">
                  Manage skill development banner heading, badge, and description.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenSkillHero}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Highlights */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Highlights</h3>
                  <span className="cms-section-badge">Trust Metrics</span>
                </div>
                <p className="cms-section-desc">
                  Manage 4 key institutional highlights and metric cards.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenSkillHighlights}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Institutional Mission */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Institutional Mission</h3>
                  <span className="cms-section-badge">Mission & Pillars</span>
                </div>
                <p className="cms-section-desc">
                  Manage empowering mission copy and 3 core pillar cards.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenSkillMission}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Candidate Pathway */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Candidate Pathway</h3>
                  <span className="cms-section-badge">Training Journey</span>
                </div>
                <p className="cms-section-desc">
                  Manage the 6-step candidate training and placement journey.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenSkillPathway}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Why Choose NTR VIKASA */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Why Choose NTR VIKASA</h3>
                  <span className="cms-section-badge">Institutional Excellence</span>
                </div>
                <p className="cms-section-desc">
                  Manage the 6 institutional value and feature cards.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenSkillWc}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Programs We Offer */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Programs We Offer</h3>
                  <span className="cms-section-badge">Programs & Sectors</span>
                </div>
                <p className="cms-section-desc">
                  Manage domain course categories and training sector offerings.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenSkillPrograms}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>
          </>
        )}

        {/* 4. JOB MELAS SECTIONS */}
        {selectedPage === 'job-melas' && (
          <>
            {/* Public Hero Section */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Public Hero Section</h3>
                  <span className="cms-section-badge">Public Page Banner</span>
                </div>
                <p className="cms-section-desc">
                  Manage public Job Melas page badge, heading and description.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenMelaHero}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* Job Mela Event Operations */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Job Mela Event Operations</h3>
                  <span className="cms-section-badge">Operational Workflows</span>
                </div>
                <p className="cms-section-desc">
                  Job Mela Requests, Admin Created Melas & Create Job Mela operations.
                </p>
              </div>
              <Link
                to="/admin/job-melas"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0, textDecoration: 'none' }}
              >
                Manage Melas <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}

        {/* 5. ABOUT US SECTIONS (Preserved Order) */}
        {selectedPage === 'about' && (
          <>
            {/* 1. Mission & Impact */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Mission & Impact</h3>
                  <span className="cms-section-badge">Hero / Mission</span>
                </div>
                <p className="cms-section-desc">
                  Manage About Us hero badge, main heading, and mission statement.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAboutHero}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* 2. Statistics */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Statistics</h3>
                  <span className="cms-section-badge">Platform Metrics</span>
                </div>
                <p className="cms-section-desc">
                  Dynamic statistics calculated automatically from system database.
                </p>
              </div>
              <span className="cms-dynamic-badge">
                🔒 Dynamic
              </span>
            </div>

            {/* 3. What We Stand For */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">What We Stand For</h3>
                  <span className="cms-section-badge">Core Principles</span>
                </div>
                <p className="cms-section-desc">
                  Manage the 3 foundational pillars and principle cards.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAboutWwsf}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* 4. Our Team */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Our Team</h3>
                  <span className="cms-section-badge">Leadership & Management</span>
                </div>
                <p className="cms-section-desc">
                  Manage leadership team members, roles, and profiles.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAboutTeam}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* 5. Leadership Messages */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Leadership Messages</h3>
                  <span className="cms-section-badge">Executive Messages</span>
                </div>
                <p className="cms-section-desc">
                  Manage executive leadership quotes, designations, and statements.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAboutMessages}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>

            {/* 6. Our Industry & Academic Training Partners */}
            <div className="cms-section-card">
              <div className="cms-section-card-info">
                <div className="cms-section-card-header">
                  <h3 className="cms-section-title">Our Industry & Academic Training Partners</h3>
                  <span className="cms-section-badge">Partner Network</span>
                </div>
                <p className="cms-section-desc">
                  Manage all 13 industry, institutional, and academic partner logos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAboutPartners}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', flexShrink: 0 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>
          </>
        )}

        {/* 6. MEDIA & GALLERY MANAGEMENT */}
        {selectedPage === 'gallery' && (
          <AdminGalleryManager />
        )}

        {/* 7. NEWSPAPER ARTICLES & PRESS MANAGEMENT */}
        {selectedPage === 'news' && (
          <AdminNewsManager />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS FOR ALL 5 PAGES (REUSED CLEAN UI PATTERN)
          ══════════════════════════════════════════════════════════════════════ */}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS FOR ALL 5 PAGES (STANDARDIZED CLEAN CMS PATTERN)
          ══════════════════════════════════════════════════════════════════════ */}

      {/* ── 1. HOME HERO MODAL ── */}
      <Modal
        isOpen={homeHeroModal}
        onClose={() => setHomeHeroModal(false)}
        title="Edit Home Page Hero Section"
        size="lg"
      >
        <form onSubmit={handleSaveHomeHero} className="cms-modal-form">
          {/* Live Preview Box */}
          <div className="cms-modal-preview-box">
            <div className="cms-modal-preview-label">
              <Sparkles size={13} className="text-primary-600" /> Live Preview
            </div>
            <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#e0e7ff', color: '#4338ca', marginBottom: '6px' }}>
              {homeHeroForm.badge || 'Badge Text'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '6px' }}>
              {homeHeroForm.heading1 || 'Heading 1'} <span style={{ color: '#6366f1' }}>{homeHeroForm.heading2 || 'Heading 2'}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              {homeHeroForm.subtext || 'Hero description text...'}
            </div>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Hero Copy</h4>
            <FormField label="Hero Badge Text" required>
              <Input
                value={homeHeroForm.badge}
                onChange={(e) => setHomeHeroForm({ ...homeHeroForm, badge: e.target.value })}
                placeholder="e.g. Most Trusted Career & Job Fair Network"
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Main Heading Part 1" required>
                <Input
                  value={homeHeroForm.heading1}
                  onChange={(e) => setHomeHeroForm({ ...homeHeroForm, heading1: e.target.value })}
                  placeholder="Find Your Dream Job."
                  required
                />
              </FormField>
              <FormField label="Main Heading Part 2" required>
                <Input
                  value={homeHeroForm.heading2}
                  onChange={(e) => setHomeHeroForm({ ...homeHeroForm, heading2: e.target.value })}
                  placeholder="Accelerate Your Career."
                  required
                />
              </FormField>
            </div>

            <FormField label="Subtext / Description" required>
              <Textarea
                value={homeHeroForm.subtext}
                onChange={(e) => setHomeHeroForm({ ...homeHeroForm, subtext: e.target.value })}
                rows={3}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Search & Popular Keywords</h4>
            <FormField label="Search Bar Placeholder">
              <Input
                value={homeHeroForm.searchPlaceholder}
                onChange={(e) => setHomeHeroForm({ ...homeHeroForm, searchPlaceholder: e.target.value })}
                placeholder="Job title, keywords, or company..."
              />
            </FormField>

            <div className="form-field">
              <label className="form-label">Popular Searches Keywords</label>
              <div className="cms-chips-input-group">
                <Input
                  value={newHomePopularTag}
                  onChange={(e) => setNewHomePopularTag(e.target.value)}
                  placeholder="Add new keyword (e.g. Flutter, DevOps, UI/UX)..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHomePopularTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddHomePopularTag}
                  style={{ height: '42px', flexShrink: 0, gap: '6px' }}
                >
                  <Plus size={16} /> Add
                </Button>
              </div>
              <div className="cms-chips-container">
                {homeHeroForm.popularSearches.map((tag, idx) => (
                  <span key={idx} className="cms-chip">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHomePopularTag(tag)}
                      className="cms-chip-remove-btn"
                      title={`Remove ${tag}`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {homeHeroForm.popularSearches.length === 0 && (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No keywords added yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Hero Media Asset</h4>
            <FormField label="Hero Graphic / Image">
              <div className="flex items-center gap-4">
                <img
                  src={homeHeroForm.heroImage || heroImgDefault}
                  alt="Hero Preview"
                  className="w-20 h-14 object-cover rounded-lg border border-gray-200"
                />
                <div className="space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {homeHeroForm.heroImage && (
                    <button
                      type="button"
                      onClick={() => setHomeHeroForm(prev => ({ ...prev, heroImage: null }))}
                      className="text-xs text-red-600 block hover:underline"
                    >
                      Reset to Default Asset
                    </button>
                  )}
                </div>
              </div>
            </FormField>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_HOME_CONTENT.hero;
                setHomeHeroForm({
                  badge: def.badge,
                  heading1: def.heading1,
                  heading2: def.heading2,
                  subtext: def.subtext,
                  searchPlaceholder: def.searchPlaceholder,
                  popularSearches: [...def.popularSearches],
                  heroImage: null,
                });
                addToast('Hero section reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setHomeHeroModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingHome}>
                {savingHome ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 2. HOME WHY CHOOSE MODAL ── */}
      <Modal
        isOpen={homeWhyChooseModal}
        onClose={() => setHomeWhyChooseModal(false)}
        title="Edit Why Choose Our Job Portal"
        size="lg"
      >
        <form onSubmit={handleSaveHomeWc} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Section Header</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Heading Part 1" required>
                <Input
                  value={homeWcForm.heading1}
                  onChange={(e) => setHomeWcForm({ ...homeWcForm, heading1: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Heading Part 2" required>
                <Input
                  value={homeWcForm.heading2}
                  onChange={(e) => setHomeWcForm({ ...homeWcForm, heading2: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Section Subtitle" required>
              <Textarea
                value={homeWcForm.subtitle}
                onChange={(e) => setHomeWcForm({ ...homeWcForm, subtitle: e.target.value })}
                rows={2}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">6 Feature Cards</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {homeWcForm.cards.map((c, idx) => (
                <div key={idx} className="cms-item-card">
                  <div className="cms-item-card-header">
                    <span className="cms-item-card-title">Card #{idx + 1}</span>
                    <select
                      value={c.icon}
                      onChange={(e) => {
                        const updated = [...homeWcForm.cards];
                        updated[idx].icon = e.target.value;
                        setHomeWcForm({ ...homeWcForm, cards: updated });
                      }}
                      className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    >
                      {AVAILABLE_ICONS.map(i => (
                        <option key={i.value} value={i.value}>{i.label}</option>
                      ))}
                    </select>
                  </div>
                  <FormField label="Title" required>
                    <Input
                      value={c.title}
                      onChange={(e) => {
                        const updated = [...homeWcForm.cards];
                        updated[idx].title = e.target.value;
                        setHomeWcForm({ ...homeWcForm, cards: updated });
                      }}
                      placeholder="Card Title"
                      required
                    />
                  </FormField>
                  <FormField label="Description" required>
                    <Textarea
                      value={c.desc}
                      onChange={(e) => {
                        const updated = [...homeWcForm.cards];
                        updated[idx].desc = e.target.value;
                        setHomeWcForm({ ...homeWcForm, cards: updated });
                      }}
                      placeholder="Card Description"
                      rows={2}
                      required
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_HOME_CONTENT.whyChoose;
                setHomeWcForm({
                  heading1: def.heading1,
                  heading2: def.heading2,
                  subtitle: def.subtitle,
                  cards: def.cards.map(c => ({ ...c })),
                });
                addToast('Feature cards reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setHomeWhyChooseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingHome}>
                {savingHome ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 3. HOME WELCOME POPUP MODAL ── */}
      <Modal
        isOpen={welcomePopupModal}
        onClose={() => setWelcomePopupModal(false)}
        title="Welcome Popup Poster"
        size="lg"
      >
        <form onSubmit={handleSaveWelcomePopup} className="cms-modal-form">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
            Upload an image to show as a popup overlay when visitors first arrive on the website.
          </p>

          {/* Section 1: Upload Popup Image */}
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Upload Popup Image</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
                Recommended: Portrait or Square (JPG, PNG, WebP up to 5MB)
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <UploadCloud size={15} /> Choose Image / Upload Poster
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handlePopupImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {welcomePopupForm.imageUrl && (
                  <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Poster image selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Popup Redirect Link */}
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Popup Redirect Link</h4>
            <FormField label="Popup Redirect Link" hint="When a visitor clicks the popup poster, they will be redirected to this URL.">
              <Input
                type="url"
                value={welcomePopupForm.redirectUrl}
                onChange={(e) => setWelcomePopupForm({ ...welcomePopupForm, redirectUrl: e.target.value })}
                placeholder="https://forms.google.com/... or https://example.com/register"
              />
            </FormField>
          </div>

          {/* Section 3: Popup Display Schedule */}
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Popup Display Schedule</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <FormField label="Display Start Date*" htmlFor="popupStartDate" hint="From Date (inclusive)">
                <Input
                  id="popupStartDate"
                  type="date"
                  value={welcomePopupForm.startDate}
                  onChange={(e) => setWelcomePopupForm({ ...welcomePopupForm, startDate: e.target.value })}
                  required={Boolean(welcomePopupForm.imageUrl)}
                />
              </FormField>

              <FormField label="Display End Date*" htmlFor="popupEndDate" hint="To Date (inclusive)">
                <Input
                  id="popupEndDate"
                  type="date"
                  value={welcomePopupForm.endDate}
                  onChange={(e) => setWelcomePopupForm({ ...welcomePopupForm, endDate: e.target.value })}
                  required={Boolean(welcomePopupForm.imageUrl)}
                />
              </FormField>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0 0' }}>
              The poster will only be shown to visitors between the Start Date and End Date (inclusive). After the End Date, it automatically stops appearing.
            </p>
          </div>

          {/* Section 4: Current Active Poster */}
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Current Active Poster</h4>
            {welcomePopupForm.imageUrl ? (
              <div className="cms-item-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)' }}>
                    Poster Preview
                  </span>
                  {(() => {
                    const statusInfo = getPopupScheduleStatusInfo(welcomePopupForm);
                    return (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.border}`
                      }}>
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  background: '#0f172a',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                  overflow: 'hidden'
                }}>
                  <img
                    src={welcomePopupForm.imageUrl}
                    alt="Welcome Poster Preview"
                    style={{
                      maxHeight: 240,
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>

                {/* Scheduled Display details */}
                <div style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: 'var(--text-xs)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Scheduled Display:</span>
                    {welcomePopupForm.startDate && welcomePopupForm.endDate ? (
                      <strong style={{ color: 'var(--color-text)' }}>
                        {formatDisplayDate(welcomePopupForm.startDate)} – {formatDisplayDate(welcomePopupForm.endDate)}
                      </strong>
                    ) : (
                      <span style={{ color: '#dc2626', fontStyle: 'italic' }}>Dates not configured</span>
                    )}
                  </div>
                  {welcomePopupForm.startDate && welcomePopupForm.endDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      <span>Start: {welcomePopupForm.startDate}</span>
                      <span>End: {welcomePopupForm.endDate}</span>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
                  <strong>Link:</strong> {welcomePopupForm.redirectUrl ? (
                    <a href={welcomePopupForm.redirectUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', marginLeft: 4 }}>
                      {welcomePopupForm.redirectUrl} <ExternalLink size={11} style={{ display: 'inline' }} />
                    </a>
                  ) : (
                    <span style={{ fontStyle: 'italic', marginLeft: 4 }}>No redirect link configured</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                  <Button
                    type="button"
                    variant={welcomePopupForm.enabled ? 'outline' : 'secondary'}
                    size="sm"
                    leftIcon={welcomePopupForm.enabled ? <EyeOff size={14} /> : <Eye size={14} />}
                    onClick={handleTogglePopupStatus}
                  >
                    {welcomePopupForm.enabled ? 'Hide Poster' : 'Show Poster'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    onClick={handleRemovePopupPoster}
                  >
                    Remove Poster
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px dashed var(--color-border)',
                background: 'var(--color-gray-50)',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-xs)'
              }}>
                <Image size={28} style={{ margin: '0 auto var(--space-2)', color: 'var(--color-text-muted)', opacity: 0.6 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No welcome poster currently uploaded.</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px' }}>Upload an image above to activate the welcome popup for first-time visitors.</p>
              </div>
            )}
          </div>

          <div className="cms-modal-footer">
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {welcomePopupForm.imageUrl
                ? (welcomePopupForm.enabled
                    ? (welcomePopupForm.startDate && welcomePopupForm.endDate
                        ? `Status: ${getPopupScheduleStatusInfo(welcomePopupForm).label.replace('● ', '')}`
                        : 'Schedule incomplete')
                    : 'Poster is set to Hidden')
                : 'No poster uploaded'}
            </div>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setWelcomePopupModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingHome}>
                {savingHome ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 4. JOBS HERO MODAL ── */}
      <Modal
        isOpen={jobsHeroModal}
        onClose={() => setJobsHeroModal(false)}
        title="Edit Jobs Page Hero Section"
        size="lg"
      >
        <form onSubmit={handleSaveJobsHero} className="cms-modal-form">
          {/* Live Preview Box */}
          <div className="cms-modal-preview-box">
            <div className="cms-modal-preview-label">
              <Sparkles size={13} className="text-primary-600" /> Live Preview
            </div>
            <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#dbeafe', color: '#1d4ed8', marginBottom: '6px' }}>
              {jobsHeroForm.badge || 'Badge Text'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '6px' }}>
              {jobsHeroForm.heading || 'Jobs Heading'}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              {jobsHeroForm.subtitle || 'Jobs subtitle text...'}
            </div>
          </div>

          <FormField label="Badge Text" required>
            <Input
              value={jobsHeroForm.badge}
              onChange={(e) => setJobsHeroForm({ ...jobsHeroForm, badge: e.target.value })}
              placeholder="e.g. 5,000+ Active Openings"
              required
            />
          </FormField>
          <FormField label="Main Heading" required>
            <Input
              value={jobsHeroForm.heading}
              onChange={(e) => setJobsHeroForm({ ...jobsHeroForm, heading: e.target.value })}
              placeholder="Find Your Next Career Opportunity"
              required
            />
          </FormField>
          <FormField label="Subtitle / Description" required>
            <Textarea
              value={jobsHeroForm.subtitle}
              onChange={(e) => setJobsHeroForm({ ...jobsHeroForm, subtitle: e.target.value })}
              rows={3}
              placeholder="Explore thousands of job opportunities from verified employers..."
              required
            />
          </FormField>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_JOBS_PAGE_CONTENT.hero;
                setJobsHeroForm({
                  badge: def.badge,
                  heading: def.heading,
                  subtitle: def.subtitle,
                });
                addToast('Jobs hero reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setJobsHeroModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingJobs}>
                {savingJobs ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 4. JOBS SEARCH MODAL ── */}
      <Modal
        isOpen={jobsSearchModal}
        onClose={() => setJobsSearchModal(false)}
        title="Edit Jobs Search Placeholders & Popular Searches"
        size="lg"
      >
        <form onSubmit={handleSaveJobsSearch} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Search Configuration</h4>
            <FormField label="Search Input Placeholder" required>
              <Input
                value={jobsSearchForm.searchPlaceholder}
                onChange={(e) => setJobsSearchForm({ ...jobsSearchForm, searchPlaceholder: e.target.value })}
                placeholder="e.g. Job title, skills (Python, React...), or company..."
                required
              />
            </FormField>
            <FormField label="Location Placeholder" required>
              <Input
                value={jobsSearchForm.locationPlaceholder}
                onChange={(e) => setJobsSearchForm({ ...jobsSearchForm, locationPlaceholder: e.target.value })}
                placeholder="e.g. All Locations (All India)"
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Popular Searches Keywords</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Keyword chips displayed under the main search bar on the public Jobs page.
            </p>
            <div className="cms-chips-input-group">
              <Input
                value={newPopularTag}
                onChange={(e) => setNewPopularTag(e.target.value)}
                placeholder="Add new keyword (e.g. Flutter, DevOps, UI/UX)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPopularTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="primary"
                onClick={handleAddPopularTag}
                style={{ height: '42px', flexShrink: 0, gap: '6px' }}
              >
                <Plus size={16} /> Add
              </Button>
            </div>
            <div className="cms-chips-container">
              {jobsSearchForm.popularSearches.map((tag, idx) => (
                <span key={idx} className="cms-chip">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePopularTag(tag)}
                    className="cms-chip-remove-btn"
                    title={`Remove ${tag}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              {jobsSearchForm.popularSearches.length === 0 && (
                <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No popular searches added yet.</span>
              )}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_JOBS_PAGE_CONTENT.search;
                setJobsSearchForm({
                  searchPlaceholder: def.searchPlaceholder,
                  locationPlaceholder: def.locationPlaceholder,
                  popularSearches: [...def.popularSearches],
                });
                addToast('Search settings reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setJobsSearchModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingJobs}>
                {savingJobs ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 5. SKILL HERO MODAL ── */}
      <Modal
        isOpen={skillHeroModal}
        onClose={() => setSkillHeroModal(false)}
        title="Edit Skill Development Hero Banner"
        size="lg"
      >
        <form onSubmit={handleSaveSkillHero} className="cms-modal-form">
          {/* Live Preview Box */}
          <div className="cms-modal-preview-box">
            <div className="cms-modal-preview-label">
              <Sparkles size={13} className="text-primary-600" /> Live Preview
            </div>
            <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#dcfce7', color: '#15803d', marginBottom: '6px' }}>
              {skillHeroForm.badge || 'Badge Text'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '6px' }}>
              {skillHeroForm.heading || 'Skill Development Heading'}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              {skillHeroForm.description || 'Skill development description...'}
            </div>
          </div>

          <FormField label="Hero Badge" required>
            <Input
              value={skillHeroForm.badge}
              onChange={(e) => setSkillHeroForm({ ...skillHeroForm, badge: e.target.value })}
              placeholder="e.g. NTR VIKASA Skill Initiative"
              required
            />
          </FormField>
          <FormField label="Main Heading" required>
            <Input
              value={skillHeroForm.heading}
              onChange={(e) => setSkillHeroForm({ ...skillHeroForm, heading: e.target.value })}
              placeholder="Empowering Youth Through Industry-Ready Skills"
              required
            />
          </FormField>
          <FormField label="Description" required>
            <Textarea
              value={skillHeroForm.description}
              onChange={(e) => setSkillHeroForm({ ...skillHeroForm, description: e.target.value })}
              rows={3}
              required
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Primary Button Label">
              <Input
                value={skillHeroForm.exploreBtnText}
                onChange={(e) => setSkillHeroForm({ ...skillHeroForm, exploreBtnText: e.target.value })}
                placeholder="Explore Programs"
              />
            </FormField>
            <FormField label="Secondary Button Label">
              <Input
                value={skillHeroForm.viewCoursesBtnText}
                onChange={(e) => setSkillHeroForm({ ...skillHeroForm, viewCoursesBtnText: e.target.value })}
                placeholder="View All Domains"
              />
            </FormField>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_SKILL_PAGE_CONTENT.hero;
                setSkillHeroForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                  exploreBtnText: def.exploreBtnText,
                  viewCoursesBtnText: def.viewCoursesBtnText,
                });
                addToast('Hero banner reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setSkillHeroModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingSkill}>
                {savingSkill ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 6. SKILL HIGHLIGHTS MODAL ── */}
      <Modal
        isOpen={skillHighlightsModal}
        onClose={() => setSkillHighlightsModal(false)}
        title="Edit 4 Key Highlights (Trust Pillars)"
        size="lg"
      >
        <form onSubmit={handleSaveSkillHighlights} className="cms-modal-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillHighlightsForm.map((hl, idx) => (
              <div key={idx} className="cms-item-card">
                <span className="cms-item-card-title">Highlight #{idx + 1}</span>
                <FormField label="Title" required>
                  <Input
                    value={hl.title}
                    onChange={(e) => {
                      const updated = [...skillHighlightsForm];
                      updated[idx].title = e.target.value;
                      setSkillHighlightsForm(updated);
                    }}
                    placeholder="Title (e.g. Government Recognized)"
                    required
                  />
                </FormField>
                <FormField label="Subtitle" required>
                  <Input
                    value={hl.subtitle}
                    onChange={(e) => {
                      const updated = [...skillHighlightsForm];
                      updated[idx].subtitle = e.target.value;
                      setSkillHighlightsForm(updated);
                    }}
                    placeholder="Subtitle (e.g. NSDC / NSQF Certified)"
                    required
                  />
                </FormField>
              </div>
            ))}
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSkillHighlightsForm(DEFAULT_SKILL_PAGE_CONTENT.highlights.map(h => ({ ...h })));
                addToast('Highlights reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setSkillHighlightsModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingSkill}>
                {savingSkill ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 7. SKILL MISSION MODAL ── */}
      <Modal
        isOpen={skillMissionModal}
        onClose={() => setSkillMissionModal(false)}
        title="Edit Institutional Mission & 3 Pillars"
        size="lg"
      >
        <form onSubmit={handleSaveSkillMission} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Mission Overview</h4>
            <FormField label="Badge" required>
              <Input
                value={skillMissionForm.badge}
                onChange={(e) => setSkillMissionForm({ ...skillMissionForm, badge: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Heading" required>
              <Input
                value={skillMissionForm.heading}
                onChange={(e) => setSkillMissionForm({ ...skillMissionForm, heading: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Description" required>
              <Textarea
                value={skillMissionForm.description}
                onChange={(e) => setSkillMissionForm({ ...skillMissionForm, description: e.target.value })}
                rows={3}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">3 Feature Pillars</h4>
            <div className="space-y-3">
              {skillMissionForm.cards.map((c, idx) => (
                <div key={idx} className="cms-item-card">
                  <span className="cms-item-card-title">Pillar #{idx + 1}</span>
                  <FormField label="Title" required>
                    <Input
                      value={c.title}
                      onChange={(e) => {
                        const updated = [...skillMissionForm.cards];
                        updated[idx].title = e.target.value;
                        setSkillMissionForm({ ...skillMissionForm, cards: updated });
                      }}
                      placeholder="Pillar Title"
                      required
                    />
                  </FormField>
                  <FormField label="Description" required>
                    <Textarea
                      value={c.desc}
                      onChange={(e) => {
                        const updated = [...skillMissionForm.cards];
                        updated[idx].desc = e.target.value;
                        setSkillMissionForm({ ...skillMissionForm, cards: updated });
                      }}
                      placeholder="Pillar Description"
                      rows={2}
                      required
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills;
                setSkillMissionForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                  cards: def.cards.map(c => ({ ...c })),
                });
                addToast('Mission reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setSkillMissionModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingSkill}>
                {savingSkill ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 8. SKILL PATHWAY MODAL ── */}
      <Modal
        isOpen={skillPathwayModal}
        onClose={() => setSkillPathwayModal(false)}
        title="Edit Candidate Pathway (6 Journey Steps)"
        size="lg"
      >
        <form onSubmit={handleSaveSkillPathway} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Pathway Overview</h4>
            <FormField label="Badge" required>
              <Input
                value={skillPathwayForm.badge}
                onChange={(e) => setSkillPathwayForm({ ...skillPathwayForm, badge: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Heading" required>
              <Input
                value={skillPathwayForm.heading}
                onChange={(e) => setSkillPathwayForm({ ...skillPathwayForm, heading: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Description" required>
              <Textarea
                value={skillPathwayForm.description}
                onChange={(e) => setSkillPathwayForm({ ...skillPathwayForm, description: e.target.value })}
                rows={2}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">6 Journey Steps</h4>
            <div className="space-y-3">
              {skillPathwayForm.steps.map((st, idx) => (
                <div key={idx} className="cms-item-card">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-700">
                      Step {st.step || `0${idx + 1}`}
                    </span>
                    <Input
                      value={st.title}
                      onChange={(e) => {
                        const updated = [...skillPathwayForm.steps];
                        updated[idx].title = e.target.value;
                        setSkillPathwayForm({ ...skillPathwayForm, steps: updated });
                      }}
                      placeholder="Step Title"
                      required
                    />
                  </div>
                  <Textarea
                    value={st.desc}
                    onChange={(e) => {
                      const updated = [...skillPathwayForm.steps];
                      updated[idx].desc = e.target.value;
                      setSkillPathwayForm({ ...skillPathwayForm, steps: updated });
                    }}
                    placeholder="Step Description"
                    rows={2}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_SKILL_PAGE_CONTENT.trainingJourney;
                setSkillPathwayForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                  steps: def.steps.map(s => ({ ...s })),
                });
                addToast('Pathway reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setSkillPathwayModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingSkill}>
                {savingSkill ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 9. SKILL PROGRAMS MODAL ── */}
      <Modal
        isOpen={skillProgramsModal}
        onClose={() => setSkillProgramsModal(false)}
        title="Edit Programs We Offer (Domain Categories)"
        size="lg"
      >
        <form onSubmit={handleSaveSkillPrograms} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Section Overview</h4>
            <FormField label="Badge" required>
              <Input
                value={skillProgramsForm.badge}
                onChange={(e) => setSkillProgramsForm({ ...skillProgramsForm, badge: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Heading" required>
              <Input
                value={skillProgramsForm.heading}
                onChange={(e) => setSkillProgramsForm({ ...skillProgramsForm, heading: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Description" required>
              <Textarea
                value={skillProgramsForm.description}
                onChange={(e) => setSkillProgramsForm({ ...skillProgramsForm, description: e.target.value })}
                rows={2}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Domain Categories</h4>
            <div className="space-y-3">
              {skillProgramsForm.categories.map((cat, idx) => (
                <div key={idx} className="cms-item-card">
                  <FormField label={`Domain #${idx + 1}`} required>
                    <Input
                      value={cat.name}
                      onChange={(e) => {
                        const updated = [...skillProgramsForm.categories];
                        updated[idx].name = e.target.value;
                        setSkillProgramsForm({ ...skillProgramsForm, categories: updated });
                      }}
                      placeholder="Category Name"
                      required
                    />
                  </FormField>
                  <FormField label="Description" required>
                    <Textarea
                      value={cat.desc}
                      onChange={(e) => {
                        const updated = [...skillProgramsForm.categories];
                        updated[idx].desc = e.target.value;
                        setSkillProgramsForm({ ...skillProgramsForm, categories: updated });
                      }}
                      placeholder="Category Description"
                      rows={2}
                      required
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer;
                setSkillProgramsForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                  categories: def.categories.map(c => ({ ...c })),
                });
                addToast('Programs reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setSkillProgramsModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingSkill}>
                {savingSkill ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 10. SKILL WHY CHOOSE MODAL ── */}
      <Modal
        isOpen={skillWhyChooseModal}
        onClose={() => setSkillWhyChooseModal(false)}
        title="Edit Why Choose NTR VIKASA"
        size="lg"
      >
        <form onSubmit={handleSaveSkillWc} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Overview Copy</h4>
            <FormField label="Badge" required>
              <Input
                value={skillWcForm.badge}
                onChange={(e) => setSkillWcForm({ ...skillWcForm, badge: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Heading" required>
              <Input
                value={skillWcForm.heading}
                onChange={(e) => setSkillWcForm({ ...skillWcForm, heading: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Description" required>
              <Textarea
                value={skillWcForm.description}
                onChange={(e) => setSkillWcForm({ ...skillWcForm, description: e.target.value })}
                rows={2}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">6 Institutional Advantage Cards</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skillWcForm.cards.map((c, idx) => (
                <div key={idx} className="cms-item-card">
                  <span className="cms-item-card-title">Card #{idx + 1}</span>
                  <FormField label="Title" required>
                    <Input
                      value={c.title}
                      onChange={(e) => {
                        const updated = [...skillWcForm.cards];
                        updated[idx].title = e.target.value;
                        setSkillWcForm({ ...skillWcForm, cards: updated });
                      }}
                      placeholder="Card Title"
                      required
                    />
                  </FormField>
                  <FormField label="Description" required>
                    <Textarea
                      value={c.desc}
                      onChange={(e) => {
                        const updated = [...skillWcForm.cards];
                        updated[idx].desc = e.target.value;
                        setSkillWcForm({ ...skillWcForm, cards: updated });
                      }}
                      placeholder="Card Description"
                      rows={2}
                      required
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_SKILL_PAGE_CONTENT.whyChoose;
                setSkillWcForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                  cards: def.cards.map(c => ({ ...c })),
                });
                addToast('Why choose cards reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setSkillWhyChooseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingSkill}>
                {savingSkill ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 11. JOB MELAS HERO MODAL ── */}
      <Modal
        isOpen={melaHeroModal}
        onClose={() => setMelaHeroModal(false)}
        title="Edit Job Melas Public Page Hero Content"
        size="lg"
      >
        <form onSubmit={handleSaveMelaHero} className="cms-modal-form">
          {/* Live Preview Box */}
          <div className="cms-modal-preview-box">
            <div className="cms-modal-preview-label">
              <Sparkles size={13} className="text-primary-600" /> Live Preview
            </div>
            <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#ffedd5', color: '#c2410c', marginBottom: '6px' }}>
              {melaHeroForm.badge || 'Badge Text'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '6px' }}>
              {melaHeroForm.heading || 'Job Melas Heading'}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              {melaHeroForm.description || 'Job Melas description...'}
            </div>
          </div>

          <FormField label="Hero Badge Text" required>
            <Input
              value={melaHeroForm.badge}
              onChange={(e) => setMelaHeroForm({ ...melaHeroForm, badge: e.target.value })}
              placeholder="e.g. Nationwide Recruitment Drives"
              required
            />
          </FormField>
          <FormField label="Main Heading" required>
            <Input
              value={melaHeroForm.heading}
              onChange={(e) => setMelaHeroForm({ ...melaHeroForm, heading: e.target.value })}
              placeholder="e.g. Mega Job Melas & Career Fairs"
              required
            />
          </FormField>
          <FormField label="Hero Description" required>
            <Textarea
              value={melaHeroForm.description}
              onChange={(e) => setMelaHeroForm({ ...melaHeroForm, description: e.target.value })}
              rows={3}
              required
            />
          </FormField>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_JOB_MELA_CONTENT.hero;
                setMelaHeroForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                });
                addToast('Job Melas hero reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setMelaHeroModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingMela}>
                {savingMela ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 12. ABOUT HERO MODAL ── */}
      <Modal
        isOpen={aboutHeroModal}
        onClose={() => setAboutHeroModal(false)}
        title="Edit About Us Hero / Mission & Impact"
        size="lg"
      >
        <form onSubmit={handleSaveAboutHero} className="cms-modal-form">
          {/* Live Preview Box */}
          <div className="cms-modal-preview-box">
            <div className="cms-modal-preview-label">
              <Sparkles size={13} className="text-primary-600" /> Live Preview
            </div>
            <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#fce7f3', color: '#be185d', marginBottom: '6px' }}>
              {aboutHeroForm.badge || 'Badge Text'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '6px' }}>
              {aboutHeroForm.heading || 'About Us Heading'}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              {aboutHeroForm.description || 'About Us mission description...'}
            </div>
          </div>

          <FormField label="Badge Text" required>
            <Input
              value={aboutHeroForm.badge}
              onChange={(e) => setAboutHeroForm({ ...aboutHeroForm, badge: e.target.value })}
              placeholder="e.g. Empowering Youth. Transforming Lives."
              required
            />
          </FormField>
          <FormField label="Main Heading" required>
            <Input
              value={aboutHeroForm.heading}
              onChange={(e) => setAboutHeroForm({ ...aboutHeroForm, heading: e.target.value })}
              placeholder="e.g. Bridging Talent with Opportunity Across India"
              required
            />
          </FormField>
          <FormField label="Mission Description" required>
            <Textarea
              value={aboutHeroForm.description}
              onChange={(e) => setAboutHeroForm({ ...aboutHeroForm, description: e.target.value })}
              rows={3}
              required
            />
          </FormField>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_ABOUT_CONTENT.hero;
                setAboutHeroForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                });
                addToast('About hero reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setAboutHeroModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingAbout}>
                {savingAbout ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 13. ABOUT WHAT WE STAND FOR MODAL ── */}
      <Modal
        isOpen={aboutWwsfModal}
        onClose={() => setAboutWwsfModal(false)}
        title="Edit What We Stand For (3 Core Principles)"
        size="lg"
      >
        <form onSubmit={handleSaveAboutWwsf} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Section Overview</h4>
            <FormField label="Heading" required>
              <Input
                value={aboutWwsfForm.heading}
                onChange={(e) => setAboutWwsfForm({ ...aboutWwsfForm, heading: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Description" required>
              <Textarea
                value={aboutWwsfForm.description}
                onChange={(e) => setAboutWwsfForm({ ...aboutWwsfForm, description: e.target.value })}
                rows={2}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">3 Core Principles</h4>
            <div className="space-y-3">
              {aboutWwsfForm.cards.map((c, idx) => (
                <div key={idx} className="cms-item-card">
                  <span className="cms-item-card-title">Principle #{idx + 1}</span>
                  <FormField label="Title" required>
                    <Input
                      value={c.title}
                      onChange={(e) => {
                        const updated = [...aboutWwsfForm.cards];
                        updated[idx].title = e.target.value;
                        setAboutWwsfForm({ ...aboutWwsfForm, cards: updated });
                      }}
                      placeholder="Principle Title"
                      required
                    />
                  </FormField>
                  <FormField label="Description" required>
                    <Textarea
                      value={c.desc}
                      onChange={(e) => {
                        const updated = [...aboutWwsfForm.cards];
                        updated[idx].desc = e.target.value;
                        setAboutWwsfForm({ ...aboutWwsfForm, cards: updated });
                      }}
                      placeholder="Principle Description"
                      rows={2}
                      required
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_ABOUT_CONTENT.whatWeStandFor;
                setAboutWwsfForm({
                  heading: def.heading,
                  description: def.description,
                  cards: def.cards.map(c => ({ ...c })),
                });
                addToast('What we stand for reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setAboutWwsfModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingAbout}>
                {savingAbout ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 14. ABOUT TEAM MODAL ── */}
      <Modal
        isOpen={aboutTeamModal}
        onClose={() => setAboutTeamModal(false)}
        title="Edit Our Team Members"
        size="lg"
      >
        <form onSubmit={handleSaveAboutTeam} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Team Section Overview</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Badge" required>
                <Input
                  value={aboutTeamForm.badge}
                  onChange={(e) => setAboutTeamForm({ ...aboutTeamForm, badge: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Heading" required>
                <Input
                  value={aboutTeamForm.heading}
                  onChange={(e) => setAboutTeamForm({ ...aboutTeamForm, heading: e.target.value })}
                  required
                />
              </FormField>
            </div>
            <FormField label="Description" required>
              <Textarea
                value={aboutTeamForm.description}
                onChange={(e) => setAboutTeamForm({ ...aboutTeamForm, description: e.target.value })}
                rows={2}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Team Members List</h4>
            <div className="space-y-3">
              {aboutTeamForm.members.map((m, idx) => (
                <div key={idx} className="cms-item-card">
                  <span className="cms-item-card-title">Team Member #{idx + 1}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Full Name" required>
                      <Input
                        value={m.name}
                        onChange={(e) => {
                          const updated = [...aboutTeamForm.members];
                          updated[idx].name = e.target.value;
                          setAboutTeamForm({ ...aboutTeamForm, members: updated });
                        }}
                        placeholder="Member Name"
                        required
                      />
                    </FormField>
                    <FormField label="Role / Designation" required>
                      <Input
                        value={m.role}
                        onChange={(e) => {
                          const updated = [...aboutTeamForm.members];
                          updated[idx].role = e.target.value;
                          setAboutTeamForm({ ...aboutTeamForm, members: updated });
                        }}
                        placeholder="Role / Designation"
                        required
                      />
                    </FormField>
                  </div>
                  <FormField label="Organization" required>
                    <Input
                      value={m.organization}
                      onChange={(e) => {
                        const updated = [...aboutTeamForm.members];
                        updated[idx].organization = e.target.value;
                        setAboutTeamForm({ ...aboutTeamForm, members: updated });
                      }}
                      placeholder="Organization"
                      required
                    />
                  </FormField>
                  <FormField label="Short Biography" required>
                    <Textarea
                      value={m.bio}
                      onChange={(e) => {
                        const updated = [...aboutTeamForm.members];
                        updated[idx].bio = e.target.value;
                        setAboutTeamForm({ ...aboutTeamForm, members: updated });
                      }}
                      placeholder="Short Biography"
                      rows={2}
                      required
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_ABOUT_CONTENT.team;
                setAboutTeamForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                  members: def.members.map(m => ({ ...m })),
                });
                addToast('Team members reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setAboutTeamModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingAbout}>
                {savingAbout ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 15. ABOUT LEADERSHIP MESSAGES MODAL ── */}
      <Modal
        isOpen={aboutMessagesModal}
        onClose={() => setAboutMessagesModal(false)}
        title="Edit Leadership Messages"
        size="lg"
      >
        <form onSubmit={handleSaveAboutMessages} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Section Header</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Badge" required>
                <Input
                  value={aboutMessagesForm.badge}
                  onChange={(e) => setAboutMessagesForm({ ...aboutMessagesForm, badge: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Heading" required>
                <Input
                  value={aboutMessagesForm.heading}
                  onChange={(e) => setAboutMessagesForm({ ...aboutMessagesForm, heading: e.target.value })}
                  required
                />
              </FormField>
            </div>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Leadership Statements</h4>
            <div className="space-y-3">
              {aboutMessagesForm.messages.map((msg, idx) => (
                <div key={idx} className="cms-item-card">
                  <span className="cms-item-card-title">Statement #{idx + 1}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Leader Name" required>
                      <Input
                        value={msg.name}
                        onChange={(e) => {
                          const updated = [...aboutMessagesForm.messages];
                          updated[idx].name = e.target.value;
                          setAboutMessagesForm({ ...aboutMessagesForm, messages: updated });
                        }}
                        placeholder="Leader Name"
                        required
                      />
                    </FormField>
                    <FormField label="Role / Designation" required>
                      <Input
                        value={msg.role}
                        onChange={(e) => {
                          const updated = [...aboutMessagesForm.messages];
                          updated[idx].role = e.target.value;
                          setAboutMessagesForm({ ...aboutMessagesForm, messages: updated });
                        }}
                        placeholder="Role / Designation"
                        required
                      />
                    </FormField>
                  </div>
                  <FormField label="Organization" required>
                    <Input
                      value={msg.organization}
                      onChange={(e) => {
                        const updated = [...aboutMessagesForm.messages];
                        updated[idx].organization = e.target.value;
                        setAboutMessagesForm({ ...aboutMessagesForm, messages: updated });
                      }}
                      placeholder="Organization"
                      required
                    />
                  </FormField>
                  <FormField label="Official Message" required>
                    <Textarea
                      value={msg.message}
                      onChange={(e) => {
                        const updated = [...aboutMessagesForm.messages];
                        updated[idx].message = e.target.value;
                        setAboutMessagesForm({ ...aboutMessagesForm, messages: updated });
                      }}
                      placeholder="Official Message"
                      rows={3}
                      required
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_ABOUT_CONTENT.leadershipMessages;
                setAboutMessagesForm({
                  badge: def.badge,
                  heading: def.heading,
                  description: def.description,
                  messages: def.messages.map(m => ({ ...m })),
                });
                addToast('Leadership messages reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setAboutMessagesModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingAbout}>
                {savingAbout ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── 16. ABOUT PARTNERS MODAL ── */}
      <Modal
        isOpen={aboutPartnersModal}
        onClose={() => setAboutPartnersModal(false)}
        title="Edit Industry & Academic Training Partners"
        size="lg"
      >
        <form onSubmit={handleSaveAboutPartners} className="cms-modal-form">
          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Section Overview</h4>
            <FormField label="Section Heading" required>
              <Input
                value={aboutPartnersForm.heading}
                onChange={(e) => setAboutPartnersForm({ ...aboutPartnersForm, heading: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Section Description" required>
              <Textarea
                value={aboutPartnersForm.description}
                onChange={(e) => setAboutPartnersForm({ ...aboutPartnersForm, description: e.target.value })}
                rows={2}
                required
              />
            </FormField>
          </div>

          <div className="cms-form-section">
            <h4 className="cms-form-section-title">Registered Partners (13 Partners)</h4>
            <div className="space-y-2">
              {aboutPartnersForm.list.map((p, idx) => (
                <div key={idx} className="cms-item-card" style={{ padding: '10px 14px' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-500 w-6">#{p.order || idx + 1}</span>
                      <Input
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...aboutPartnersForm.list];
                          updated[idx].name = e.target.value;
                          setAboutPartnersForm({ ...aboutPartnersForm, list: updated });
                        }}
                        style={{ height: '36px', fontSize: '13px' }}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...aboutPartnersForm.list];
                          updated[idx].active = !updated[idx].active;
                          setAboutPartnersForm({ ...aboutPartnersForm, list: updated });
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          p.active !== false
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300'
                        }`}
                      >
                        {p.active !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                        {p.active !== false ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cms-modal-footer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const def = DEFAULT_ABOUT_CONTENT.partners;
                setAboutPartnersForm({
                  heading: def.heading,
                  description: def.description,
                  list: def.list.map(p => ({ ...p })),
                });
                addToast('Partners reset to defaults.', 'info');
              }}
              style={{ gap: '6px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </Button>
            <div className="cms-modal-footer-actions">
              <Button type="button" variant="outline" onClick={() => setAboutPartnersModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingAbout}>
                {savingAbout ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
