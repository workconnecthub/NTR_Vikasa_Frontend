import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, SlidersHorizontal, X, RotateCcw, Briefcase,
  DollarSign, Clock, Building2, GraduationCap, Sparkles, AlertCircle,
  Heart, ShieldCheck, ArrowRight, Filter, Check, Eye, ChevronDown
} from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { EmptyState, ErrorState } from '../../components/ui/States';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import ApplyModal from '../../components/ui/ApplyModal';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import { useAdmin, DEFAULT_JOBS_PAGE_CONTENT } from '../../context/AdminContext';
import publicService from '../../services/publicService';
import { INDIAN_STATES, INDIAN_UNION_TERRITORIES } from '../../data/indiaLocations';

import {
  MOCK_JOBS,
  LOCATIONS,
  JOB_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
  SALARY_RANGES,
  INDUSTRIES,
  EDUCATION_LEVELS,
  SKILL_OPTIONS,
  POSTED_DATES
} from '../../data/mockData';

// Extended realistic mock jobs list (10 jobs)
const EXTENDED_MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior Python Developer',
    company: 'TechCorp India',
    verified: true,
    location: 'Hyderabad, Telangana',
    salary: '₹6 - ₹10 LPA',
    salaryMin: 6,
    salaryMax: 10,
    experience: '2-4 Years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Information Technology',
    skills: ['Python', 'FastAPI', 'SQL', 'PostgreSQL', 'Docker'],
    matchScore: 92,
    postedTime: 'Posted 2 days ago',
    featured: true,
    description: 'Lead backend microservices design using Python, FastAPI, and scalable PostgreSQL database clusters.'
  },
  {
    id: '2',
    title: 'Senior Frontend Engineer (React + TypeScript)',
    company: 'Flipkart',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹14 - ₹22 LPA',
    salaryMin: 14,
    salaryMax: 22,
    experience: '3-5 Years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'E-Commerce & Retail',
    skills: ['React', 'TypeScript', 'Redux Toolkit', 'Next.js', 'Tailwind CSS'],
    matchScore: 96,
    postedTime: 'Posted 1 day ago',
    featured: true,
    description: 'Architect customer checkout journeys handling millions of peak requests with sub-second latency.'
  },
  {
    id: '3',
    title: 'Data & AI Engineer (Machine Learning)',
    company: 'Infosys',
    verified: true,
    location: 'Visakhapatnam, Andhra Pradesh',
    salary: '₹10 - ₹18 LPA',
    salaryMin: 10,
    salaryMax: 18,
    experience: '3-5 Years',
    type: 'Full-time',
    workMode: 'Remote',
    industry: 'Information Technology',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'AWS'],
    matchScore: 89,
    postedTime: 'Posted 3 days ago',
    featured: false,
    description: 'Develop enterprise predictive pipelines and generative AI solutions for Fortune 500 enterprise clients.'
  },
  {
    id: '4',
    title: 'Full Stack Web Developer (MERN)',
    company: 'Swiggy',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹12 - ₹20 LPA',
    salaryMin: 12,
    salaryMax: 20,
    experience: '2-4 Years',
    type: 'Full-time',
    workMode: 'On-site',
    industry: 'Information Technology',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    matchScore: 85,
    postedTime: 'Posted 4 days ago',
    featured: false,
    description: 'Build real-time delivery logistics telemetry portals and merchant dashboards.'
  },
  {
    id: '5',
    title: 'DevOps & Cloud Infrastructure Engineer',
    company: 'Wipro Technologies',
    verified: true,
    location: 'Hyderabad, Telangana',
    salary: '₹10 - ₹16 LPA',
    salaryMin: 10,
    salaryMax: 16,
    experience: '3-5 Years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Information Technology',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    matchScore: 88,
    postedTime: 'Posted 5 days ago',
    featured: false,
    description: 'Automate multi-region cloud provisioning and zero-downtime Kubernetes deployments.'
  },
  {
    id: '6',
    title: 'UI/UX Product Designer',
    company: 'Razorpay',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹8 - ₹14 LPA',
    salaryMin: 8,
    salaryMax: 14,
    experience: '1-3 years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Fintech & Banking',
    skills: ['UI/UX Design', 'Figma', 'Prototyping', 'Design Systems'],
    matchScore: 90,
    postedTime: 'Posted 1 day ago',
    featured: true,
    description: 'Design frictionless payment checkout interfaces and merchant onboarding workflows.'
  },
  {
    id: '7',
    title: 'Junior Software Engineer (Fresher)',
    company: 'Tata Consultancy Services (TCS)',
    verified: true,
    location: 'Vijayawada, Andhra Pradesh',
    salary: '₹3 - ₹6 LPA',
    salaryMin: 3,
    salaryMax: 6,
    experience: 'Fresher (0-1 yr)',
    type: 'Full-time',
    workMode: 'On-site',
    industry: 'Information Technology',
    skills: ['Java', 'SQL', 'JavaScript', 'HTML/CSS'],
    matchScore: 82,
    postedTime: 'Posted today',
    featured: false,
    description: 'Exciting entry-level software developer opening for 2025/2026 engineering graduates across Andhra Pradesh.'
  },
  {
    id: '8',
    title: 'Financial Analyst & Risk Modeler',
    company: 'HDFC Bank',
    verified: true,
    location: 'Visakhapatnam, Andhra Pradesh',
    salary: '₹6 - ₹10 LPA',
    salaryMin: 6,
    salaryMax: 10,
    experience: '1-3 years',
    type: 'Full-time',
    workMode: 'On-site',
    industry: 'Fintech & Banking',
    skills: ['Financial Modeling', 'SQL', 'Excel', 'Data Analysis'],
    matchScore: 78,
    postedTime: 'Posted 3 days ago',
    featured: false,
    description: 'Analyze commercial credit portfolios, risk stress-testing, and compliance metrics.'
  },
  {
    id: '9',
    title: 'Lead Product Manager',
    company: 'Zomato',
    verified: true,
    location: 'Gurugram, Haryana',
    salary: '₹28 - ₹42 LPA',
    salaryMin: 28,
    salaryMax: 42,
    experience: '5-8 years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Information Technology',
    skills: ['Product Management', 'SQL', 'Data Analytics', 'Roadmapping'],
    matchScore: 87,
    postedTime: 'Posted 6 days ago',
    featured: false,
    description: 'Own end-to-end customer retention metrics, delivery ETA algorithms, and loyalty funnels.'
  },
  {
    id: '10',
    title: 'AI Prompt Engineer & Data Evaluator',
    company: 'Cognizant',
    verified: true,
    location: 'Tirupati, Andhra Pradesh',
    salary: '₹6 - ₹10 LPA',
    salaryMin: 6,
    salaryMax: 10,
    experience: '1-3 years',
    type: 'Full-time',
    workMode: 'Remote',
    industry: 'Information Technology',
    skills: ['Python', 'Machine Learning', 'Data Evaluation', 'NLP'],
    matchScore: 86,
    postedTime: 'Posted 2 days ago',
    featured: false,
    description: 'Benchmark large language model outputs and design robust safety evaluation datasets.'
  },
  {
    id: '11',
    title: 'Cloud Security & DevOps Architect',
    company: 'TechCorp India',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹18 - ₹30 LPA',
    salaryMin: 18,
    salaryMax: 30,
    experience: '5-8 years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Information Technology',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Python', 'CI/CD'],
    matchScore: 91,
    postedTime: 'Posted 1 day ago',
    featured: true,
    description: 'Lead enterprise cloud migration architectures, zero-trust security postures, and Kubernetes orchestration pipelines.'
  },
  {
    id: '12',
    title: 'Senior QA Automation Engineer (Cypress / Playwright)',
    company: 'Flipkart',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹10 - ₹18 LPA',
    salaryMin: 10,
    salaryMax: 18,
    experience: '3-5 Years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'E-Commerce & Retail',
    skills: ['JavaScript', 'TypeScript', 'Node.js', 'React'],
    matchScore: 88,
    postedTime: 'Posted 3 days ago',
    featured: false,
    description: 'Design robust automated E2E test suites for checkout and payment flows across multi-device viewports.'
  },
  {
    id: '13',
    title: 'Data Analyst & BI Specialist',
    company: 'Razorpay',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹8 - ₹14 LPA',
    salaryMin: 8,
    salaryMax: 14,
    experience: '1-3 years',
    type: 'Full-time',
    workMode: 'Remote',
    industry: 'Fintech & Banking',
    skills: ['SQL', 'Python', 'Analytics', 'Financial Modeling'],
    matchScore: 84,
    postedTime: 'Posted 4 days ago',
    featured: false,
    description: 'Analyze payment conversion funnels, transaction latency trends, and build automated Looker / Tableau dashboards.'
  },
  {
    id: '14',
    title: 'Growth Marketing & SEO Specialist',
    company: 'Zomato',
    verified: true,
    location: 'Gurugram, Haryana',
    salary: '₹10 - ₹16 LPA',
    salaryMin: 10,
    salaryMax: 16,
    experience: '3-5 Years',
    type: 'Full-time',
    workMode: 'On-site',
    industry: 'E-Commerce & Retail',
    skills: ['Digital Marketing', 'SEO', 'Analytics'],
    matchScore: 83,
    postedTime: 'Posted 2 days ago',
    featured: false,
    description: 'Scale organic restaurant discovery and user acquisition through data-driven performance marketing and content SEO.'
  },
  {
    id: '15',
    title: 'Embedded Firmware Engineer (Automotive / EV)',
    company: 'Ola Electric',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹12 - ₹20 LPA',
    salaryMin: 12,
    salaryMax: 20,
    experience: '2-4 Years',
    type: 'Full-time',
    workMode: 'On-site',
    industry: 'Automotive & EV',
    skills: ['Python', 'Docker'],
    matchScore: 89,
    postedTime: 'Posted 5 days ago',
    featured: true,
    description: 'Develop real-time CAN-bus protocols and battery management firmware for Ola next-gen electric scooter platforms.'
  },
  {
    id: '16',
    title: 'Human Resources Talent Partner',
    company: 'Infosys',
    verified: true,
    location: 'Hyderabad, Telangana',
    salary: '₹6 - ₹10 LPA',
    salaryMin: 6,
    salaryMax: 10,
    experience: '1-3 years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Information Technology',
    skills: ['Human Resources'],
    matchScore: 80,
    postedTime: 'Posted today',
    featured: false,
    description: 'Manage full-cycle campus hiring and lateral technical talent acquisition across Pan-India development hubs.'
  },
  {
    id: '17',
    title: 'Site Reliability & Cloud Ops Engineer',
    company: 'Razorpay',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹14 - ₹24 LPA',
    salaryMin: 14,
    salaryMax: 24,
    experience: '3-5 Years',
    type: 'Full-time',
    workMode: 'Remote',
    industry: 'Fintech & Banking',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Python'],
    matchScore: 90,
    postedTime: 'Posted 2 days ago',
    featured: false,
    description: 'Ensure 99.999% system availability, automated incident response, and latency optimization across payment clusters.'
  },
  {
    id: '18',
    title: 'Senior Mobile App Developer (React Native)',
    company: 'Swiggy',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹16 - ₹26 LPA',
    salaryMin: 16,
    salaryMax: 26,
    experience: '3-5 Years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Information Technology',
    skills: ['React', 'JavaScript', 'TypeScript'],
    matchScore: 88,
    postedTime: 'Posted 3 days ago',
    featured: true,
    description: 'Build responsive iOS and Android consumer experiences with seamless real-time map tracking and smooth checkout animations.'
  },
  {
    id: '19',
    title: 'Backend Microservices Specialist (Java / Spring)',
    company: 'TechCorp India',
    verified: true,
    location: 'Hyderabad, Telangana',
    salary: '₹12 - ₹20 LPA',
    salaryMin: 12,
    salaryMax: 20,
    experience: '2-4 Years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Information Technology',
    skills: ['Java', 'Spring Boot', 'SQL'],
    matchScore: 85,
    postedTime: 'Posted 1 day ago',
    featured: false,
    description: 'Architect secure enterprise transactional microservices and RESTful integrations for global cloud banking clients.'
  },
  {
    id: '20',
    title: 'Product Data Scientist & Experimentation Lead',
    company: 'Flipkart',
    verified: true,
    location: 'Bengaluru, Karnataka',
    salary: '₹22 - ₹35 LPA',
    salaryMin: 22,
    salaryMax: 35,
    experience: '5-8 years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'E-Commerce & Retail',
    skills: ['Python', 'Machine Learning', 'SQL', 'Analytics'],
    matchScore: 93,
    postedTime: 'Posted 4 days ago',
    featured: true,
    description: 'Lead marketplace pricing intelligence, recommendation algorithms, and statistical multivariate A/B experimentation.'
  },
  {
    id: '21',
    title: 'Security Operations & Compliance Analyst',
    company: 'Cognizant',
    verified: true,
    location: 'Visakhapatnam, Andhra Pradesh',
    salary: '₹8 - ₹14 LPA',
    salaryMin: 8,
    salaryMax: 14,
    experience: '1-3 years',
    type: 'Full-time',
    workMode: 'Remote',
    industry: 'Information Technology',
    skills: ['SQL', 'Python', 'Analytics'],
    matchScore: 81,
    postedTime: 'Posted 5 days ago',
    featured: false,
    description: 'Monitor enterprise SOC telemetry, conduct vulnerability assessments, and ensure ISO 27001 / SOC 2 compliance.'
  },
  {
    id: '22',
    title: 'Associate Technical Project Manager',
    company: 'Wipro Technologies',
    verified: true,
    location: 'Vijayawada, Andhra Pradesh',
    salary: '₹10 - ₹16 LPA',
    salaryMin: 10,
    salaryMax: 16,
    experience: '3-5 Years',
    type: 'Full-time',
    workMode: 'Hybrid',
    industry: 'Information Technology',
    skills: ['Product Management', 'Analytics'],
    matchScore: 84,
    postedTime: 'Posted today',
    featured: false,
    description: 'Coordinate cross-functional delivery milestones, sprint backlogs, and client stakeholder communications across enterprise projects.'
  }
];

export default function JobsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn } = useCandidate();
  const { jobsPageContent } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentJobsContent = jobsPageContent || DEFAULT_JOBS_PAGE_CONTENT;
  const heroConfig = currentJobsContent.hero || DEFAULT_JOBS_PAGE_CONTENT.hero;
  const searchConfig = currentJobsContent.search || DEFAULT_JOBS_PAGE_CONTENT.search;

  // Search & Filter state
  const initialSearch = searchParams.get('company') || searchParams.get('company_name') || searchParams.get('search') || searchParams.get('q') || '';
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [experience, setExperience] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [datePosted, setDatePosted] = useState('');
  const [sortBy, setSortBy] = useState('Relevance');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const comp = searchParams.get('company') || searchParams.get('company_name') || searchParams.get('search') || searchParams.get('q');
    if (comp) {
      setSearch(comp);
      setPage(1);
    }
  }, [searchParams]);


  const [savedJobIds, setSavedJobIds] = useState(['1', '3']);
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Live backend jobs
  const [liveJobs, setLiveJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveJobs = async () => {
      setIsLoadingJobs(true);
      try {
        const res = await publicService.getPublishedJobs({
          search: search.trim() || undefined,
          location: location && location !== 'All Locations' ? location : undefined,
          experience_level: experience && experience !== 'All Experience' ? experience : undefined,
          salary_range: salaryRange && salaryRange !== 'All Salaries' ? salaryRange : undefined,
          employment_type: jobType && jobType !== 'All Types' ? jobType : undefined,
          work_mode: workMode && workMode !== 'All Modes' ? workMode : undefined,
          industry_sector: industry && industry !== 'All Industries' ? industry : undefined,
          required_skill: selectedSkill || undefined,
          sort: sortBy === 'Salary: High to Low' ? 'salary_high' : (sortBy === 'Salary: Low to High' ? 'salary_low' : (sortBy === 'Latest' ? 'newest' : 'relevance')),
          page_size: 50,
        });
        if (isMounted && res && res.items) {
          const mapped = res.items.map(j => ({
            id: j.job_id || j.id,
            rawId: j.id,
            title: j.title,
            company: j.company_name || j.company?.name || 'Employer',
            verified: j.company_verified ?? true,
            location: j.location || 'Bengaluru, Karnataka',
            salary: j.salary || (j.salary_min ? `₹${j.salary_min >= 100000 ? (j.salary_min / 100000) : j.salary_min} - ₹${j.salary_max >= 100000 ? (j.salary_max / 100000) : j.salary_max} LPA` : 'Competitive'),
            salaryMin: j.salary_min || 0,
            salaryMax: j.salary_max || 100,
            experience: j.experience || j.experience_level || '3-5 years',
            type: j.job_type || j.employment_type || 'Full-time',
            workMode: j.work_mode || j.workMode || 'Hybrid',
            industry: j.industry || j.department || 'Information Technology',
            skills: j.skills || j.tags || [],
            matchScore: j.match_score || 92,
            postedTime: j.posted_at ? `Posted ${j.posted_at.split(' ')[0]}` : 'Posted recently',
            featured: true,
            description: j.description || j.job_summary || '',
          }));
          setLiveJobs(mapped);
        }
      } catch (err) {
        console.warn('JobsPage public jobs fetch warning:', err);
      } finally {
        if (isMounted) setIsLoadingJobs(false);
      }
    };
    fetchLiveJobs();
    return () => { isMounted = false; };
  }, [search, location, experience, salaryRange, jobType, workMode, industry, selectedSkill, sortBy]);

  // Sync URL query params
  useEffect(() => {
    const q = searchParams.get('q');
    const loc = searchParams.get('location');
    if (q !== null) setSearch(q);
    if (loc !== null) setLocation(loc);
  }, [searchParams]);

  // Reset pagination to page 1 whenever search, filters, or sort change
  useEffect(() => {
    setPage(1);
  }, [search, location, experience, salaryRange, jobType, workMode, industry, selectedSkill, datePosted, sortBy]);

  const handleToggleSave = (jobId, title) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter(id => id !== jobId));
      toast({ type: 'info', title: 'Removed from Saved', message: `Removed "${title}" from saved jobs.` });
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      toast({ type: 'success', title: 'Job Saved', message: `Saved "${title}" to your bookmarks.` });
    }
  };

  const handleOpenApply = (job) => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          redirectTo: `/jobs/${job.id}?apply=true`,
          jobId: job.id,
          jobTitle: job.title
        }
      });
      return;
    }
    setSelectedJobToApply(job);
    setApplyModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setExperience('');
    setSalaryRange('');
    setJobType('');
    setWorkMode('');
    setIndustry('');
    setSelectedSkill('');
    setDatePosted('');
    setSortBy('Relevance');
    setPage(1);
    setSearchParams({});
  };

  // Filter computation
  const baseJobs = liveJobs;
  const filteredJobs = useMemo(() => {
    let result = baseJobs.filter((job) => {

      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(query);
        const matchCompany = job.company.toLowerCase().includes(query);
        const matchSkill = job.skills?.some(s => s.toLowerCase().includes(query));
        if (!matchTitle && !matchCompany && !matchSkill) return false;
      }

      // 2. Location
      if (location && location !== 'All Locations') {
        if (!job.location.toLowerCase().includes(location.toLowerCase())) return false;
      }

      // 3. Experience
      if (experience && experience !== 'All Experience') {
        if (!job.experience.toLowerCase().includes(experience.toLowerCase().replace('all experience', ''))) {
          if (experience.includes('Fresher') && !job.experience.includes('Fresher')) return false;
          if (experience.includes('1-3') && !job.experience.includes('1-3') && !job.experience.includes('2-4')) return false;
          if (experience.includes('3-5') && !job.experience.includes('3-5') && !job.experience.includes('2-4')) return false;
        }
      }

      // 4. Salary
      if (salaryRange && salaryRange !== 'All Salaries') {
        if (salaryRange.includes('0 - ₹3') && job.salaryMin > 3) return false;
        if (salaryRange.includes('3 - ₹6') && (job.salaryMax < 3 || job.salaryMin > 6)) return false;
        if (salaryRange.includes('6 - ₹10') && (job.salaryMax < 6 || job.salaryMin > 10)) return false;
        if (salaryRange.includes('10 - ₹18') && (job.salaryMax < 10 || job.salaryMin > 18)) return false;
        if (salaryRange.includes('18 - ₹30') && (job.salaryMax < 18 || job.salaryMin > 30)) return false;
      }

      // 5. Job Type
      if (jobType && jobType !== 'All Types') {
        if (job.type.toLowerCase() !== jobType.toLowerCase()) return false;
      }

      // 6. Work Mode
      if (workMode && workMode !== 'All Modes') {
        if (job.workMode.toLowerCase() !== workMode.toLowerCase()) return false;
      }

      // 7. Industry
      if (industry && industry !== 'All Industries') {
        if (job.industry !== industry) return false;
      }

      // 8. Skill
      if (selectedSkill) {
        if (!job.skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase())) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'Salary: High to Low') {
      result.sort((a, b) => b.salaryMax - a.salaryMax);
    } else if (sortBy === 'Salary: Low to High') {
      result.sort((a, b) => a.salaryMin - b.salaryMin);
    } else if (sortBy === 'Latest') {
      // Keep order
    } else {
      // Relevance by match score
      result.sort((a, b) => b.matchScore - a.matchScore);
    }

    return result;
  }, [baseJobs, search, location, experience, salaryRange, jobType, workMode, industry, selectedSkill, sortBy]);


  const PER_PAGE = 9;
  const totalPages = Math.ceil(filteredJobs.length / PER_PAGE);
  const paginatedJobs = filteredJobs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeFilterCount = [
    experience, salaryRange, jobType, workMode, industry, selectedSkill, datePosted
  ].filter(Boolean).length;

  const popularTags = searchConfig.popularSearches && searchConfig.popularSearches.length > 0
    ? searchConfig.popularSearches
    : ['Python Developer', 'React JS', 'Data Analyst', 'Fresher Jobs', 'Hybrid Work', 'FastAPI'];

  return (
    <div className="jobs-search-page" style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'var(--space-20)' }}>
      {/* ── 1. Top Search Header Section ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        padding: 'var(--space-12) var(--space-6)',
        position: 'relative'
      }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#c7d2fe', background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {heroConfig.badge || 'Corporate Recruitment Portal'}
            </span>
            <h1 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)', fontWeight: 800, color: '#ffffff', marginTop: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              {heroConfig.heading || 'Find Your Dream Job in Andhra Pradesh & India'}
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: '#cbd5e1' }}>
              {heroConfig.subtitle || 'Explore 2,450+ verified corporate job openings with zero placement fees'}
            </p>
          </div>

          {/* Search Inputs Bar */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-3)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            alignItems: 'center'
          }}>
            {/* Keyword input */}
            <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)' }}>
              <Search size={18} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder={searchConfig.searchPlaceholder || 'Job title, skills (Python, React...), or company...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text)',
                  background: 'transparent'
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ width: 1, height: 32, background: 'var(--color-border)', alignSelf: 'center' }} className="hide-mobile" />

            {/* Location dropdown */}
            <div style={{ flex: '1 1 230px', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', position: 'relative' }}>
              <MapPin size={18} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Filter by Location"
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: 'var(--text-sm)',
                  color: location ? 'var(--color-text)' : 'var(--color-text-muted)',
                  background: 'transparent',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  paddingRight: '18px'
                }}
              >
                <option value="" style={{ color: 'var(--color-text-muted)' }}>
                  {searchConfig.locationPlaceholder || 'All Locations (All India)'}
                </option>
                <optgroup label="States (28)" style={{ fontWeight: 700, color: 'var(--color-primary-700)' }}>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                      {st}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Union Territories (8)" style={{ fontWeight: 700, color: 'var(--color-primary-700)' }}>
                  {INDIAN_UNION_TERRITORIES.map((ut) => (
                    <option key={ut} value={ut} style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                      {ut}
                    </option>
                  ))}
                </optgroup>
              </select>
              {location ? (
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  title="Clear location filter"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                    marginLeft: 2
                  }}
                >
                  <X size={14} />
                </button>
              ) : (
                <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', pointerEvents: 'none', position: 'absolute', right: 12 }} />
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              style={{ flex: '0 0 auto', minWidth: 140, fontWeight: 700 }}
              onClick={() => {}}
            >
              Search Jobs
            </Button>
          </div>

          {/* Popular Searches Chips */}
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: '#c7d2fe', fontWeight: 700 }}>Popular Searches:</span>
            {popularTags.map((chip) => (
              <button
                key={chip}
                onClick={() => setSearch(chip)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  transition: 'background var(--transition-fast)'
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Main Two-Column Layout: Filters on Left, Results on Right ── */}
      <div className="container" style={{ marginTop: 'var(--space-8)' }}>
        <div className="responsive-split-sidebar">

          {/* Left Column: Sticky Filters Panel */}
          <aside className="sticky-filter-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Filter size={16} style={{ color: 'var(--color-primary-600)' }} />
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  Filter Jobs
                </h2>
                {activeFilterCount > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 800, background: 'var(--color-primary-50)', color: 'var(--color-primary-700)', padding: '1px 7px', borderRadius: 'var(--radius-full)' }}>
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-600)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Experience */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  Experience Level
                </label>
                <Select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  options={EXPERIENCE_LEVELS}
                />
              </div>

              {/* Salary Range */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  Salary Range (CTC)
                </label>
                <Select
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  options={SALARY_RANGES}
                />
              </div>

              {/* Work Mode */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  Work Mode
                </label>
                <Select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  options={WORK_MODES}
                />
              </div>

              {/* Job Type */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  Job Type
                </label>
                <Select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  options={JOB_TYPES}
                />
              </div>

              {/* Industry */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  Industry Sector
                </label>
                <Select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  options={INDUSTRIES}
                />
              </div>

              {/* Technical Skills */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                  Required Technical Skills
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {['Python', 'React', 'TypeScript', 'SQL', 'FastAPI', 'Node.js', 'Docker', 'AWS'].map((s) => {
                    const isSelected = selectedSkill.toLowerCase() === s.toLowerCase();
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSkill(isSelected ? '' : s)}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          background: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface)',
                          color: isSelected ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {s} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Posted */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  Date Posted
                </label>
                <Select
                  value={datePosted}
                  onChange={(e) => setDatePosted(e.target.value)}
                  options={POSTED_DATES}
                />
              </div>
            </div>
          </aside>

          {/* Right Column: Results Section */}
          <main style={{ minWidth: 0 }} className="jobs-results-column">
            {/* Results Header Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
              flexWrap: 'wrap',
              gap: 'var(--space-3)'
            }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)' }}>
                  2,450 Jobs Found
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Showing {filteredJobs.length} active matching positions
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    background: 'var(--color-surface)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Relevance">Relevance</option>
                  <option value="Latest">Latest</option>
                  <option value="Salary: High to Low">Salary: High to Low</option>
                  <option value="Salary: Low to High">Salary: Low to High</option>
                </select>
              </div>
            </div>

            {/* Jobs Cards Grid */}
            {filteredJobs.length === 0 ? (
              <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-12)' }}>
                <EmptyState
                  icon="jobs"
                  title="No Jobs Found Matching Filters"
                  description="Try clearing some of your filter criteria or searching for different keywords."
                  action={<Button variant="primary" onClick={handleResetFilters}>Reset All Filters</Button>}
                />
              </div>
            ) : (
              <div className="responsive-card-grid">
                {paginatedJobs.map((job) => {
                  const isSaved = savedJobIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      className="card card-hoverable"
                      style={{
                        borderRadius: 'var(--radius-2xl)',
                        padding: 'var(--space-6)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 'var(--space-4)'
                      }}
                    >
                      <div>
                        {/* Header: Company Avatar/Logo + Badges + Bookmark */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                          <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 'var(--radius-xl)',
                            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
                            color: '#fff',
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-sm)',
                            flexShrink: 0
                          }}>
                            {job.company?.[0] || 'J'}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              color: 'var(--color-primary-700)',
                              background: 'var(--color-primary-50)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <Sparkles size={11} /> {job.matchScore}% Match
                            </span>

                            {job.featured && (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: 'var(--color-accent-700)',
                                background: 'var(--color-accent-50)',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-md)'
                              }}>
                                ★ Featured
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleSave(job.id, job.title)}
                              style={{
                                background: isSaved ? 'var(--color-primary-50)' : 'none',
                                border: 'none',
                                color: isSaved ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              aria-label={isSaved ? 'Remove Bookmark' : 'Save Job'}
                            >
                              <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h3 style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: 700,
                            marginBottom: 4,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {job.title}
                          </h3>
                        </Link>

                        {/* Company */}
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>{job.company}</span>
                          {job.verified && <ShieldCheck size={13} style={{ color: 'var(--color-primary-600)' }} />}
                        </p>

                        {/* Meta Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={13} style={{ flexShrink: 0 }} /> {job.location}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text)', fontWeight: 700 }}>
                            <DollarSign size={13} style={{ flexShrink: 0 }} /> {job.salary}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Briefcase size={13} style={{ flexShrink: 0 }} /> {job.experience} • {job.type} ({job.workMode})
                          </span>
                        </div>

                        {/* Skills Chips */}
                        {job.skills && job.skills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {job.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--color-primary-800)',
                                  background: 'var(--color-primary-50)',
                                  padding: '2px 7px',
                                  borderRadius: 'var(--radius-md)'
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', alignSelf: 'center', fontWeight: 600 }}>
                                +{job.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer: Posted time & Action Buttons */}
                      <div style={{
                        paddingTop: 'var(--space-4)',
                        borderTop: '1px solid var(--color-gray-100)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                      }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {job.postedTime}
                        </span>

                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Link to={`/jobs/${job.id}`}>
                            <Button variant="outline" size="sm">
                              View Job
                            </Button>
                          </Link>
                          <Button variant="primary" size="sm" onClick={() => handleOpenApply(job)}>
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ marginTop: 'var(--space-10)' }}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={filteredJobs.length}
                  pageSize={PER_PAGE}
                  itemName="jobs"
                  onPageChange={setPage}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        job={selectedJobToApply}
      />
    </div>
  );
}
