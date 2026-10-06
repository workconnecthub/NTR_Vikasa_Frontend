import { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { dispatchRecruiterEvent, RECRUITER_NOTIFICATION_EVENTS } from '../services/notificationEventService';

// ─── RECRUITER 1 SEED DATA: Arjun Reddy (ABC Technologies) ─────────────────
const RECRUITER_1_DATA = {
  id: 'rec-1',
  email: 'recruiter1@ntrvikasa.com',
  name: 'Arjun Reddy',
  role: 'recruiter',
  designation: 'Director of Talent Acquisition',
  phone: '+91 98765 00112',
  avatar: 'A',

  // Company details
  company: {
    name: 'ABC Technologies Pvt Ltd',
    tagline: 'Leading enterprise cloud modernization, DevOps & digital transformation engineering.',
    description: 'ABC Technologies is a premier enterprise IT software solutions provider. With global delivery centers across Bengaluru, Hyderabad, and Vijayawada, ABC Technologies powers digital platforms for Fortune 500 enterprises across Fintech, E-Commerce, and Supply Chain.',
    industry: 'Information Technology',
    size: '1000-5000 employees',
    employeesCount: '2,400+',
    foundedYear: '2015',
    website: 'https://abctechnologies.example.com',
    email: 'careers@abctechnologies.example.com',
    phone: '+91 80 4920 1000',
    location: 'Bengaluru, Karnataka (Offices in Hyderabad & Vijayawada)',
    address: 'Block B, RMZ Ecospace, Outer Ring Road, Bellandur, Bengaluru 560103',
    cinNumber: 'U72200KA2015PTC078912',
    gstNumber: '29ABCDE1234F1Z5',
    verified: true,
    activeJobsCount: 5,
    internshipsCount: 3,
  },

  // Posted Jobs
  jobs: [
    {
      id: 'job-101',
      title: 'Senior Frontend Engineer (React / TypeScript)',
      department: 'Core Engineering',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      experience: '3-5 years',
      salary: '₹16,00,000 - ₹24,00,000 / year',
      applicantsCount: 78,
      shortlistedCount: 14,
      interviewsCount: 5,
      hiredCount: 2,
      status: 'PUBLISHED',
      createdAt: '2026-08-15',
      deadline: '2026-09-30',
      openings: 3,
      description: 'We are seeking an experienced Senior Frontend Engineer to build high-scale, accessible web applications using React, TypeScript, and modern state architectures.',
      responsibilities: '• Architect and implement performant React UI components.\n• Collaborate with product designers and backend API engineers.\n• Mentor junior frontend developers and uphold testing standards.',
      requirements: '• 4+ years of hands-on React & TypeScript development.\n• Deep knowledge of state management, bundling, and browser rendering optimization.\n• Strong testing practices with Jest & React Testing Library.',
      qualifications: "Bachelor's Degree in Computer Science or equivalent practical experience.",
      skills: ['React.js', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'REST APIs', 'Jest']
    },
    {
      id: 'job-102',
      title: 'Senior Python & Cloud Backend Developer',
      department: 'Platform Core',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Hyderabad, Telangana',
      experience: '3-6 years',
      salary: '₹14,00,000 - ₹22,00,000 / year',
      applicantsCount: 45,
      shortlistedCount: 9,
      interviewsCount: 4,
      hiredCount: 1,
      status: 'PUBLISHED',
      createdAt: '2026-08-18',
      deadline: '2026-09-25',
      openings: 2,
      description: 'Design and scale asynchronous microservices, REST/GraphQL APIs, and distributed event pipelines using Python, FastAPI, and PostgreSQL.',
      responsibilities: '• Build scalable API gateways and asynchronous task workers.\n• Optimize database queries and caching layers in Redis.\n• Deploy containerized services on AWS ECS & Kubernetes.',
      requirements: '• 3+ years experience with Python, FastAPI or Django.\n• Strong database schema design skills in PostgreSQL.\n• Experience with Docker, CI/CD pipelines, and AWS services.',
      qualifications: "Bachelor's Degree in IT / Computer Science.",
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'Microservices']
    },
    {
      id: 'job-103',
      title: 'DevOps & Cloud Infrastructure Specialist',
      department: 'Infra & SecOps',
      type: 'Full-time',
      workMode: 'Remote',
      location: 'Remote (India)',
      experience: '4-7 years',
      salary: '₹20,00,000 - ₹30,00,000 / year',
      applicantsCount: 32,
      shortlistedCount: 6,
      interviewsCount: 2,
      hiredCount: 1,
      status: 'PUBLISHED',
      createdAt: '2026-08-20',
      deadline: '2026-10-10',
      openings: 2,
      description: 'Lead automated multi-cloud provisioning, Kubernetes cluster management, and SOC-2 compliance automation.',
      responsibilities: '• Manage Terraform modules and GitOps pipelines in ArgoCD.\n• Monitor telemetry across Prometheus, Grafana, and Datadog.\n• Automate zero-downtime deployment pipelines.',
      requirements: '• Strong experience with AWS, Kubernetes, Terraform, and Docker.',
      qualifications: "Bachelor's Degree in Engineering.",
      skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'CI/CD', 'Prometheus']
    },
    {
      id: 'job-104',
      title: 'AI / ML Engineer — Computer Vision & NLP',
      department: 'AI Innovation Lab',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      experience: '2-4 years',
      salary: '₹18,00,000 - ₹26,00,000 / year',
      applicantsCount: 12,
      shortlistedCount: 3,
      interviewsCount: 1,
      hiredCount: 0,
      status: 'PENDING',
      createdAt: '2026-08-24',
      deadline: '2026-10-15',
      openings: 2,
      description: 'Build predictive AI models, multimodal pipelines, and production LLM integrations.',
      responsibilities: '• Train, fine-tune, and deploy transformer models.\n• Optimize model inference latency for edge devices.',
      requirements: '• PyTorch, TensorFlow, Hugging Face, Python, Vector DBs.',
      qualifications: "Master's or Bachelor's in CS / AI.",
      skills: ['PyTorch', 'Python', 'Machine Learning', 'NLP', 'TensorFlow', 'LLMs']
    },
    {
      id: 'job-105',
      title: 'Associate Product Marketing Lead',
      department: 'Marketing & Growth',
      type: 'Full-time',
      workMode: 'On-site',
      location: 'Bengaluru, Karnataka',
      experience: '1-3 years',
      salary: '₹8,00,000 - ₹12,00,000 / year',
      applicantsCount: 0,
      shortlistedCount: 0,
      interviewsCount: 0,
      hiredCount: 0,
      status: 'DRAFT',
      createdAt: '2026-08-26',
      deadline: '2026-10-01',
      openings: 1,
      description: 'Draft position for B2B product marketing and campaign analytics.',
      responsibilities: '• Create collateral, case studies, and product release notes.',
      requirements: '• 2+ years B2B product marketing experience.',
      qualifications: 'MBA or Bachelor in Marketing/Communications.',
      skills: ['Product Marketing', 'Content Strategy', 'B2B Marketing', 'Analytics']
    },
    {
      id: 'job-106',
      title: 'Full Stack Java & Spring Boot Developer',
      department: 'Core Engineering',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Vijayawada, Andhra Pradesh',
      experience: '3-5 years',
      salary: '₹12,00,000 - ₹18,00,000 / year',
      applicantsCount: 29,
      shortlistedCount: 5,
      interviewsCount: 2,
      hiredCount: 1,
      status: 'PUBLISHED',
      createdAt: '2026-08-28',
      deadline: '2026-10-12',
      openings: 2,
      description: 'Develop enterprise microservices using Spring Boot, Hibernate, Kafka, and PostgreSQL for financial operations.',
      responsibilities: '• Build secure REST APIs and async messaging listeners.\n• Write unit and integration tests with JUnit and Mockito.',
      requirements: '• 3+ years experience with Java, Spring Boot, and SQL.\n• Solid understanding of microservices design patterns.',
      qualifications: "Bachelor's in Computer Science / IT.",
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Microservices', 'Docker']
    },
    {
      id: 'job-107',
      title: 'Senior QA Automation Engineer (Cypress / Playwright)',
      department: 'Quality Assurance',
      type: 'Full-time',
      workMode: 'Remote',
      location: 'Remote (India)',
      experience: '4-6 years',
      salary: '₹13,00,000 - ₹19,00,000 / year',
      applicantsCount: 34,
      shortlistedCount: 7,
      interviewsCount: 3,
      hiredCount: 1,
      status: 'PUBLISHED',
      createdAt: '2026-08-29',
      deadline: '2026-10-08',
      openings: 2,
      description: 'Establish end-to-end automated testing pipelines across Web, API, and Mobile client applications.',
      responsibilities: '• Architect robust Cypress and Playwright test suites.\n• Integrate test execution into GitHub Actions and GitLab CI.',
      requirements: '• 4+ years of test automation in TypeScript/JavaScript.',
      qualifications: "Bachelor's Degree in CS/IT or equivalent.",
      skills: ['Playwright', 'Cypress', 'TypeScript', 'Jest', 'CI/CD', 'API Testing']
    },
    {
      id: 'job-108',
      title: 'Lead Product Manager — Developer Platform',
      department: 'Product Management',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      experience: '5-8 years',
      salary: '₹24,00,000 - ₹35,00,000 / year',
      applicantsCount: 22,
      shortlistedCount: 4,
      interviewsCount: 2,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-08-30',
      deadline: '2026-10-20',
      openings: 1,
      description: 'Drive the product roadmap for our API developer platform, integrations ecosystem, and cloud SDKs.',
      responsibilities: '• Define PRDs, user stories, and release milestones.\n• Collaborate closely with enterprise customers and engineering squads.',
      requirements: '• 5+ years of B2B SaaS product management experience.',
      qualifications: 'B.Tech/BE with MBA preferred.',
      skills: ['Product Strategy', 'API Design', 'Agile / Scrum', 'Roadmapping', 'Analytics']
    },
    {
      id: 'job-109',
      title: 'Data Engineer — Spark & Databricks',
      department: 'Data & Analytics',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Hyderabad, Telangana',
      experience: '3-6 years',
      salary: '₹15,00,000 - ₹23,00,000 / year',
      applicantsCount: 18,
      shortlistedCount: 3,
      interviewsCount: 1,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-09-01',
      deadline: '2026-10-15',
      openings: 2,
      description: 'Scale streaming data ingestion pipelines, lakehouses in Databricks, and analytics models.',
      responsibilities: '• Maintain Delta Lake pipelines and automated ETL jobs.\n• Optimize SQL queries across multi-terabyte datasets.',
      requirements: '• Strong PySpark, SQL, Databricks, and AWS/Azure skills.',
      qualifications: "Bachelor's in Computer Science, Statistics, or Math.",
      skills: ['PySpark', 'Databricks', 'SQL', 'Python', 'Delta Lake', 'AWS']
    },
    {
      id: 'job-110',
      title: 'Mobile App Engineer (React Native / Flutter)',
      department: 'Mobile Engineering',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Visakhapatnam, Andhra Pradesh',
      experience: '2-5 years',
      salary: '₹11,00,000 - ₹17,00,000 / year',
      applicantsCount: 26,
      shortlistedCount: 5,
      interviewsCount: 2,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-09-02',
      deadline: '2026-10-18',
      openings: 2,
      description: 'Build responsive, offline-first cross-platform mobile apps for candidate career portals.',
      responsibilities: '• Develop high-performance React Native and Flutter features.\n• Manage App Store & Play Store publishing pipelines.',
      requirements: '• 2+ years of React Native or Flutter production experience.',
      qualifications: "Bachelor's Degree in CS/IT.",
      skills: ['React Native', 'Flutter', 'TypeScript', 'iOS', 'Android', 'Redux']
    },
    {
      id: 'job-111',
      title: 'Information Security & SOC Analyst',
      department: 'Security Operations',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Hyderabad, Telangana',
      experience: '3-5 years',
      salary: '₹14,00,000 - ₹20,00,000 / year',
      applicantsCount: 15,
      shortlistedCount: 3,
      interviewsCount: 1,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-09-02',
      deadline: '2026-10-25',
      openings: 1,
      description: 'Monitor threat telemetry, execute SIEM incident response, and enforce zero-trust policies.',
      responsibilities: '• Conduct threat hunting, vulnerability scanning, and pen-testing.\n• Maintain audit compliance for ISO 27001 and SOC 2.',
      requirements: '• 3+ years in SOC analysis, SIEM tools, and AWS Security.',
      qualifications: "Bachelor's Degree in Cybersecurity or IT.",
      skills: ['SIEM', 'SOC', 'AWS Security', 'Vulnerability Assessment', 'Incident Response']
    },
    {
      id: 'job-112',
      title: 'Enterprise Technical Account Lead',
      department: 'Marketing & Growth',
      type: 'Full-time',
      workMode: 'On-site',
      location: 'Bengaluru, Karnataka',
      experience: '3-6 years',
      salary: '₹14,00,000 - ₹22,00,000 / year',
      applicantsCount: 8,
      shortlistedCount: 1,
      interviewsCount: 0,
      hiredCount: 0,
      status: 'PENDING',
      createdAt: '2026-09-03',
      deadline: '2026-10-30',
      openings: 2,
      description: 'Consult with enterprise recruiting clients on ATS integration, volume hiring, and workforce analytics.',
      responsibilities: '• Manage enterprise customer onboarding and retention.\n• Coordinate technical solutions with internal engineering teams.',
      requirements: '• 3+ years B2B tech account management experience.',
      qualifications: "Bachelor's Degree with client-facing experience.",
      skills: ['Client Management', 'SaaS Onboarding', 'Enterprise Sales', 'Solution Consulting']
    },
    {
      id: 'job-113',
      title: 'Backend Go / Golang Systems Engineer',
      department: 'Platform Core',
      type: 'Full-time',
      workMode: 'Remote',
      location: 'Remote (India)',
      experience: '4-7 years',
      salary: '₹22,00,000 - ₹32,00,000 / year',
      applicantsCount: 14,
      shortlistedCount: 3,
      interviewsCount: 1,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-09-04',
      deadline: '2026-10-22',
      openings: 2,
      description: 'Architect ultra low-latency gRPC services and distributed storage nodes in Golang.',
      responsibilities: '• Write concurrent, testable, and memory-efficient Go services.\n• Optimize network I/O and message brokering in NATS/Kafka.',
      requirements: '• 4+ years of Go development in high-throughput environments.',
      qualifications: "Bachelor's in Computer Science or Software Engineering.",
      skills: ['Golang', 'gRPC', 'PostgreSQL', 'Docker', 'Kafka', 'Redis']
    },
    {
      id: 'job-114',
      title: 'Junior Frontend Developer (React / JavaScript)',
      department: 'Core Engineering',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Tirupati, Andhra Pradesh',
      experience: '1-2 years',
      salary: '₹6,00,000 - ₹9,00,000 / year',
      applicantsCount: 48,
      shortlistedCount: 8,
      interviewsCount: 3,
      hiredCount: 1,
      status: 'PUBLISHED',
      createdAt: '2026-09-04',
      deadline: '2026-10-10',
      openings: 3,
      description: 'Build interactive user components, form validations, and dashboard views under senior mentorship.',
      responsibilities: '• Implement responsive React UI components from Figma specs.\n• Connect REST API endpoints and state hooks.',
      requirements: '• 1+ year hands-on experience in React.js, JavaScript, and CSS.',
      qualifications: "B.Tech/MCA in Computer Science.",
      skills: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'REST APIs', 'Git']
    },
    {
      id: 'job-115',
      title: 'Senior Database Administrator (PostgreSQL & CockroachDB)',
      department: 'Infra & SecOps',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Hyderabad, Telangana',
      experience: '5-8 years',
      salary: '₹18,00,000 - ₹28,00,000 / year',
      applicantsCount: 9,
      shortlistedCount: 2,
      interviewsCount: 1,
      hiredCount: 0,
      status: 'CLOSED',
      createdAt: '2026-07-20',
      deadline: '2026-08-30',
      openings: 1,
      description: 'Managed database replication, high availability, backup policies, and query query performance tuning.',
      responsibilities: '• Administer multi-TB PostgreSQL clusters.\n• Automated database failover and point-in-time recovery.',
      requirements: '• 5+ years of enterprise DBA experience.',
      qualifications: "Bachelor's in CS / IT.",
      skills: ['PostgreSQL', 'CockroachDB', 'Database Tuning', 'Linux', 'AWS RDS']
    },
    {
      id: 'job-116',
      title: 'Lead Cloud Solutions Architect',
      department: 'Infra & SecOps',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      experience: '8-12 years',
      salary: '₹30,00,000 - ₹45,00,000 / year',
      applicantsCount: 7,
      shortlistedCount: 2,
      interviewsCount: 1,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-09-05',
      deadline: '2026-11-01',
      openings: 1,
      description: 'Design enterprise cloud architectures, multi-tenant SaaS infrastructure, and cost optimization initiatives.',
      responsibilities: '• Establish cloud design blueprints for microservices.\n• Guide cloud security and disaster recovery strategies.',
      requirements: '• AWS / Azure Certified Solutions Architect Professional.',
      qualifications: "Bachelor's or Master's in Engineering.",
      skills: ['AWS Architecture', 'Kubernetes', 'Cloud Security', 'Terraform', 'System Design']
    },
    {
      id: 'job-117',
      title: 'HR Talent Acquisition Specialist — Tech Hiring',
      department: 'Marketing & Growth',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Vijayawada, Andhra Pradesh',
      experience: '2-4 years',
      salary: '₹7,00,000 - ₹11,00,000 / year',
      applicantsCount: 16,
      shortlistedCount: 3,
      interviewsCount: 1,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-09-05',
      deadline: '2026-10-20',
      openings: 2,
      description: 'Source top software engineering talent, manage interview schedules, and drive university campus placement drives.',
      responsibilities: '• Manage end-to-end recruitment pipelines in ATS.\n• Conduct HR screening and compensation negotiations.',
      requirements: '• 2+ years of technical sourcing experience in IT/SaaS.',
      qualifications: 'MBA in HR or Bachelor degree.',
      skills: ['Technical Recruiting', 'Sourcing', 'Talent Assessment', 'Candidate Engagement']
    },
    {
      id: 'job-118',
      title: 'UX Researcher & Usability Analyst',
      department: 'Product Management',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      experience: '3-5 years',
      salary: '₹12,00,000 - ₹18,00,000 / year',
      applicantsCount: 0,
      shortlistedCount: 0,
      interviewsCount: 0,
      hiredCount: 0,
      status: 'DRAFT',
      createdAt: '2026-09-06',
      deadline: '2026-10-31',
      openings: 1,
      description: 'Conduct candidate journey interviews, usability testing sessions, and recruitment workflow analytics.',
      responsibilities: '• Design user research plans and usability benchmark studies.\n• Translate findings into actionable UX insights.',
      requirements: '• 3+ years in UX research or behavioral psychology.',
      qualifications: "Degree in Design, HCI, or Psychology.",
      skills: ['User Research', 'Usability Testing', 'Wireframing', 'Persona Mapping']
    },
    {
      id: 'job-119',
      title: 'Junior Python & Data Scraping Developer',
      department: 'Platform Core',
      type: 'Full-time',
      workMode: 'Remote',
      location: 'Remote (India)',
      experience: '1-3 years',
      salary: '₹5,50,000 - ₹8,50,000 / year',
      applicantsCount: 52,
      shortlistedCount: 9,
      interviewsCount: 3,
      hiredCount: 1,
      status: 'PUBLISHED',
      createdAt: '2026-09-06',
      deadline: '2026-10-15',
      openings: 2,
      description: 'Develop automated scrapers, parse structured job data feeds, and populate clean SQL databases.',
      responsibilities: '• Maintain Scrapy and BeautifulSoup scraping bots.\n• Validate data consistency and schedule cron jobs.',
      requirements: '• 1+ year in Python, BeautifulSoup, Scrapy, and SQL.',
      qualifications: "Bachelor's in CS / IT.",
      skills: ['Python', 'Scrapy', 'BeautifulSoup', 'PostgreSQL', 'Data Mining']
    },
    {
      id: 'job-120',
      title: 'Senior Site Reliability Engineer (SRE)',
      department: 'Infra & SecOps',
      type: 'Full-time',
      workMode: 'Remote',
      location: 'Remote (India)',
      experience: '5-8 years',
      salary: '₹22,00,000 - ₹32,00,000 / year',
      applicantsCount: 11,
      shortlistedCount: 2,
      interviewsCount: 1,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-09-07',
      deadline: '2026-10-25',
      openings: 1,
      description: 'Drive 99.99% availability SLAs, optimize latency bottlenecks, and lead incident response blameless post-mortems.',
      responsibilities: '• Define SLOs, SLIs, and automated alerting thresholds.\n• Automate auto-healing infrastructure in Kubernetes.',
      requirements: '• 5+ years experience in SRE, Linux internals, and Prometheus/Grafana.',
      qualifications: "Bachelor's in Computer Science or related field.",
      skills: ['SRE', 'Kubernetes', 'Prometheus', 'Grafana', 'Incident Management', 'Python']
    }
  ],

  // Candidates talent pool
  candidates: [
    {
      id: 'cand-1',
      name: 'Priya Sharma',
      role: 'Senior React & Frontend Developer',
      headline: 'Senior React & Frontend Developer | 4+ Years Experience | Visakhapatnam & Bengaluru',
      experience: '4.2 Years',
      location: 'Visakhapatnam, Andhra Pradesh',
      skills: ['React.js', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'Jest', 'REST APIs'],
      matchScore: 95,
      resumeName: 'Priya_Sharma_Resume.pdf',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
      education: 'B.Tech in Computer Science, Andhra University (8.7 CGPA)',
      currentSalary: '₹14,50,000 / year',
      expectedSalary: '₹20,00,000 - ₹24,00,000 / year',
      workMode: 'Hybrid / Remote',
      availability: 'Immediate (15 days notice)',
      summary: 'Passionate frontend engineer specialized in performant React architectures, design systems, TypeScript, and micro-frontend state management with 4+ years of enterprise experience.',
      projects: ['NTR Vikasa Candidate Portal (React, Vite)', 'Enterprise Design System UI Kit (Storybook, TypeScript)'],
      certifications: ['Meta Certified Frontend Developer', 'AWS Cloud Practitioner'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-2',
      name: 'Rahul Kumar',
      role: 'Senior Python & Cloud Backend Engineer',
      headline: 'Senior Python & Cloud Backend Developer | 3.5 Years Experience | Vijayawada & Hyderabad',
      experience: '3.5 Years',
      location: 'Vijayawada, Andhra Pradesh',
      skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'Microservices'],
      matchScore: 92,
      resumeName: 'Rahul_Kumar_Python_Backend.pdf',
      email: 'rahul.kumar@example.com',
      phone: '+91 91234 56789',
      education: 'B.Tech in IT, VR Siddhartha Engineering College (8.4 CGPA)',
      currentSalary: '₹11,00,000 / year',
      expectedSalary: '₹16,00,000 - ₹20,00,000 / year',
      workMode: 'Hybrid / Remote',
      availability: '30 Days Notice',
      summary: 'Backend engineer specialized in Python, FastAPI, Django, PostgreSQL, and AWS microservices. Experienced in building high-throughput RESTful services and async pipelines.',
      projects: ['High-Throughput API Rate Limiter (FastAPI, Redis)', 'Distributed Telemetry Pipeline (Kafka, Python)'],
      certifications: ['AWS Certified Solutions Architect – Associate', 'CKA (Certified Kubernetes Administrator)'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-3',
      name: 'Kavita Reddy',
      role: 'Full Stack Java & Cloud Engineer',
      headline: 'Full Stack Java Developer | Spring Boot, React & Microservices | 5 Years Experience',
      experience: '5.0 Years',
      location: 'Hyderabad, Telangana',
      skills: ['Java', 'Spring Boot', 'React.js', 'PostgreSQL', 'Kafka', 'Docker', 'AWS'],
      matchScore: 88,
      resumeName: 'Kavita_Reddy_FullStack.pdf',
      email: 'kavita.reddy@example.com',
      phone: '+91 98451 23456',
      education: 'B.Tech in CSE, JNTU Hyderabad (8.9 CGPA)',
      currentSalary: '₹16,00,000 / year',
      expectedSalary: '₹22,00,000 - ₹26,00,000 / year',
      workMode: 'Hybrid',
      availability: 'Immediate',
      summary: 'Full stack Java & React developer experienced in high-concurrency banking workflows and microservices.',
      projects: ['Omnichannel Payment Gateway', 'Core Banking Microservices Engine'],
      certifications: ['Oracle Certified Professional Java SE 11', 'AWS Developer Associate'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-4',
      name: 'Vikram Sethi',
      role: 'DevOps & SRE Specialist',
      headline: 'Senior Cloud DevOps Engineer | Kubernetes, Terraform & AWS | 6 Years Experience',
      experience: '6.0 Years',
      location: 'Bengaluru, Karnataka',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD', 'Prometheus', 'Linux'],
      matchScore: 94,
      resumeName: 'Vikram_Sethi_DevOps.pdf',
      email: 'vikram.sethi@example.com',
      phone: '+91 97112 34567',
      education: 'B.E. in Electronics & Communication, RVCE Bengaluru (8.6 CGPA)',
      currentSalary: '₹19,00,000 / year',
      expectedSalary: '₹28,00,000 - ₹34,00,000 / year',
      workMode: 'Remote',
      availability: '30 Days Notice',
      summary: 'Infrastructure architect focused on automated multi-region deployments, security hardening, and zero-downtime upgrades.',
      projects: ['Automated GitOps Platform (ArgoCD)', 'Multi-Region Kubernetes Disaster Recovery'],
      certifications: ['AWS Certified DevOps Engineer – Professional', 'Certified Kubernetes Security Specialist (CKS)'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-5',
      name: 'Sneha Kulkarni',
      role: 'UI/UX Product Designer & Design Systems Lead',
      headline: 'Senior Product Designer | Figma, Design Systems & Frontend UX | 4 Years Experience',
      experience: '4.0 Years',
      location: 'Pune, Maharashtra (Open to Bengaluru/Hyderabad)',
      skills: ['Figma', 'Design Systems', 'UI/UX Design', 'User Research', 'Prototyping', 'HTML/CSS'],
      matchScore: 89,
      resumeName: 'Sneha_Kulkarni_Design_Portfolio.pdf',
      email: 'sneha.kulkarni@example.com',
      phone: '+91 98220 12345',
      education: 'B.Des in Product Design, NID Ahmedabad',
      currentSalary: '₹15,00,000 / year',
      expectedSalary: '₹22,00,000 / year',
      workMode: 'Hybrid',
      availability: '15 Days',
      summary: 'Product designer specialized in B2B SaaS interfaces, accessible token design systems, and rapid prototyping.',
      projects: ['Enterprise Analytics Dashboard Design', 'Mobile POS Design System'],
      certifications: ['NN/g UX Master Certified', 'Interaction Design Foundation Lead'],
      shortlisted: false,
      status: 'ACTIVE',
    },
    {
      id: 'cand-6',
      name: 'Ananya Deshmukh',
      role: 'QA Automation Engineer',
      headline: 'Lead QA Automation Engineer | Cypress, Playwright & API Testing | 4.5 Years',
      experience: '4.5 Years',
      location: 'Bengaluru, Karnataka',
      skills: ['Playwright', 'Cypress', 'TypeScript', 'Jest', 'Postman', 'Docker'],
      matchScore: 91,
      resumeName: 'Ananya_Deshmukh_QA.pdf',
      email: 'ananya.deshmukh@example.com',
      phone: '+91 98112 45678',
      education: 'B.Tech in CSE, PES University Bengaluru',
      currentSalary: '₹13,00,000 / year',
      expectedSalary: '₹18,00,000 / year',
      workMode: 'Remote',
      availability: 'Immediate',
      summary: 'Automation specialist building high-coverage Playwright suites with parallel CI/CD executions.',
      projects: ['Playwright Microservice E2E Suite', 'Automated API Performance Benchmarker'],
      certifications: ['ISTQB Advanced Test Automation Engineer'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-7',
      name: 'Manish Varma',
      role: 'Data Engineer (PySpark & Databricks)',
      headline: 'Senior Data Platform Engineer | PySpark, Databricks & Delta Lake | 5 Years Experience',
      experience: '5.2 Years',
      location: 'Hyderabad, Telangana',
      skills: ['PySpark', 'Databricks', 'Python', 'SQL', 'Delta Lake', 'AWS'],
      matchScore: 93,
      resumeName: 'Manish_Varma_DataEng.pdf',
      email: 'manish.varma@example.com',
      phone: '+91 97001 23456',
      education: 'B.Tech in IT, Gokaraju Rangaraju College (8.8 CGPA)',
      currentSalary: '₹16,50,000 / year',
      expectedSalary: '₹24,00,000 / year',
      workMode: 'Hybrid',
      availability: '30 Days Notice',
      summary: 'Data engineer specialized in real-time streaming architectures, Lakehouse design, and distributed data transforms.',
      projects: ['Realtime Financial Streamer in Databricks', 'Automated CDC Lakehouse Pipeline'],
      certifications: ['Databricks Certified Data Engineer Professional'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-8',
      name: 'Harika Naidu',
      role: 'Mobile App Developer (Flutter & React Native)',
      headline: 'Cross-Platform Mobile Engineer | Flutter & React Native | 3.5 Years',
      experience: '3.5 Years',
      location: 'Visakhapatnam, Andhra Pradesh',
      skills: ['Flutter', 'React Native', 'Dart', 'TypeScript', 'Firebase', 'State Management'],
      matchScore: 89,
      resumeName: 'Harika_Naidu_MobileDev.pdf',
      email: 'harika.naidu@example.com',
      phone: '+91 99887 65432',
      education: 'B.Tech in CSE, GITAM University Vizag',
      currentSalary: '₹10,50,000 / year',
      expectedSalary: '₹15,00,000 / year',
      workMode: 'Hybrid',
      availability: '15 Days',
      summary: 'Mobile developer with 6+ published Play Store/App Store applications, specializing in offline sync and smooth UI animations.',
      projects: ['Fintech Mobile Wallet in Flutter', 'Telehealth Consultation App'],
      certifications: ['Google Associate Android Developer'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-9',
      name: 'Deepak Saxena',
      role: 'Cybersecurity SOC Analyst',
      headline: 'Security Operations & Incident Response Lead | SIEM & Cloud Sec | 4 Years',
      experience: '4.0 Years',
      location: 'Hyderabad, Telangana',
      skills: ['SIEM', 'Splunk', 'AWS Security', 'VAPT', 'Wireshark', 'Incident Response'],
      matchScore: 87,
      resumeName: 'Deepak_Saxena_Security.pdf',
      email: 'deepak.saxena@example.com',
      phone: '+91 91230 45678',
      education: 'B.Tech in IT, Osmania University',
      currentSalary: '₹13,50,000 / year',
      expectedSalary: '₹19,00,000 / year',
      workMode: 'Hybrid',
      availability: 'Immediate',
      summary: 'Security specialist experienced in enterprise threat hunting, zero-trust network policies, and SOC 2 audits.',
      projects: ['Automated SOC Telemetry with Splunk', 'Zero Trust IAM Architecture'],
      certifications: ['CompTIA Security+', 'Certified Ethical Hacker (CEH)'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-10',
      name: 'Suresh Babu',
      role: 'Full Stack Golang & React Developer',
      headline: 'Go Backend & Cloud Engineer | gRPC, Kubernetes & Microservices | 5 Years',
      experience: '5.0 Years',
      location: 'Guntur, Andhra Pradesh',
      skills: ['Golang', 'gRPC', 'React.js', 'PostgreSQL', 'Docker', 'Kafka'],
      matchScore: 94,
      resumeName: 'Suresh_Babu_Golang.pdf',
      email: 'suresh.babu@example.com',
      phone: '+91 98480 12345',
      education: 'B.Tech in CSE, RVR & JC College Guntur',
      currentSalary: '₹17,00,000 / year',
      expectedSalary: '₹25,00,000 / year',
      workMode: 'Remote',
      availability: '30 Days Notice',
      summary: 'Systems backend developer passionate about high-concurrency Go services and low-latency gRPC RPCs.',
      projects: ['Low Latency Order Routing Engine', 'Distributed Key-Value Store in Go'],
      certifications: ['Certified Kubernetes Application Developer (CKAD)'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-11',
      name: 'Ritu Agarwal',
      role: 'Associate Product Manager',
      headline: 'Product Manager | B2B SaaS, User Journeys & Analytics | 3.5 Years',
      experience: '3.5 Years',
      location: 'Bengaluru, Karnataka',
      skills: ['Product Strategy', 'Jira', 'SQL', 'Mixpanel', 'Agile', 'Figma'],
      matchScore: 86,
      resumeName: 'Ritu_Agarwal_PM.pdf',
      email: 'ritu.agarwal@example.com',
      phone: '+91 97123 45670',
      education: 'B.E. in IT, BMSCE Bengaluru + MBA from IIM Indore',
      currentSalary: '₹18,00,000 / year',
      expectedSalary: '₹25,00,000 / year',
      workMode: 'Hybrid',
      availability: '30 Days Notice',
      summary: 'Data-driven Product Manager experienced in driving B2B conversion funnels and shipping multi-tier SaaS features.',
      projects: ['B2B Enterprise Portal Redesign', 'Self-Serve Onboarding Funnel'],
      certifications: ['Certified Scrum Product Owner (CSPO)'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-12',
      name: 'Naveen Chowdary',
      role: 'Junior Frontend Developer',
      headline: 'Junior React & UI Developer | JavaScript, React & Tailwind CSS | 1.8 Years',
      experience: '1.8 Years',
      location: 'Tirupati, Andhra Pradesh',
      skills: ['React.js', 'JavaScript', 'Tailwind CSS', 'HTML5', 'Git', 'REST APIs'],
      matchScore: 84,
      resumeName: 'Naveen_Chowdary_Frontend.pdf',
      email: 'naveen.chowdary@example.com',
      phone: '+91 94401 23456',
      education: 'B.Tech in CSE, Sri Venkateswara University Tirupati (8.5 CGPA)',
      currentSalary: '₹5,50,000 / year',
      expectedSalary: '₹8,50,000 / year',
      workMode: 'Hybrid',
      availability: 'Immediate',
      summary: 'Enthusiastic React developer with strong fundamentals in clean component hierarchies and responsive CSS.',
      projects: ['District Job Portal Frontend', 'E-Commerce Product Catalog'],
      certifications: ['freeCodeCamp Full Stack Certification'],
      shortlisted: true,
      status: 'SHORTLISTED',
    }
  ],

  // Applications received
  applications: [
    {
      id: 'app-501',
      candidateId: 'cand-1',
      candidateName: 'Priya Sharma',
      candidateEmail: 'priya.sharma@example.com',
      candidatePhone: '+91 98765 43210',
      jobId: 'job-101',
      jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
      experience: '4.2 Years',
      location: 'Visakhapatnam, AP',
      skills: ['React.js', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS'],
      matchScore: 95,
      appliedDate: '02 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Priya_Sharma_Resume.pdf',
      coverNote: 'I have 4+ years of hands-on experience building performant frontend architectures at scale. I led the micro-frontend migration and would love to contribute to ABC Technologies.',
      currentSalary: '₹14.5 LPA',
      expectedSalary: '₹22.0 LPA',
      noticePeriod: '15 Days',
      timeline: [
        { stage: 'Applied', date: '02 Sept 2026', completed: true },
        { stage: 'Screening', date: '03 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '04 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: '10 Sept 2026 (11:00 AM)', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-502',
      candidateId: 'cand-2',
      candidateName: 'Rahul Kumar',
      candidateEmail: 'rahul.kumar@example.com',
      candidatePhone: '+91 91234 56789',
      jobId: 'job-102',
      jobTitle: 'Senior Python & Cloud Backend Developer',
      experience: '3.5 Years',
      location: 'Vijayawada, AP',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Redis'],
      matchScore: 92,
      appliedDate: '01 Sept 2026',
      status: 'INTERVIEW',
      resumeName: 'Rahul_Kumar_Python_Backend.pdf',
      coverNote: 'Experienced in high-throughput API architectures, asynchronous processing, and database optimization.',
      currentSalary: '₹11.0 LPA',
      expectedSalary: '₹18.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '01 Sept 2026', completed: true },
        { stage: 'Screening', date: '02 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '03 Sept 2026', completed: true },
        { stage: 'Interview', date: '12 Sept 2026 (02:00 PM)', completed: true, current: true },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-503',
      candidateId: 'cand-4',
      candidateName: 'Vikram Sethi',
      candidateEmail: 'vikram.sethi@example.com',
      candidatePhone: '+91 97112 34567',
      jobId: 'job-103',
      jobTitle: 'DevOps & Cloud Infrastructure Specialist',
      experience: '6.0 Years',
      location: 'Bengaluru, KA',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD'],
      matchScore: 94,
      appliedDate: '28 Aug 2026',
      status: 'SHORTLISTED',
      resumeName: 'Vikram_Sethi_DevOps.pdf',
      coverNote: 'Extensive background in multi-region Kubernetes clusters and automated CI/CD pipelines.',
      currentSalary: '₹19.0 LPA',
      expectedSalary: '₹30.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '28 Aug 2026', completed: true },
        { stage: 'Screening', date: '30 Aug 2026', completed: true },
        { stage: 'Shortlisted', date: '01 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending Schedule', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-504',
      candidateId: 'cand-3',
      candidateName: 'Kavita Reddy',
      candidateEmail: 'kavita.reddy@example.com',
      candidatePhone: '+91 98451 23456',
      jobId: 'job-101',
      jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
      experience: '5.0 Years',
      location: 'Hyderabad, TS',
      skills: ['Java', 'Spring Boot', 'React.js', 'PostgreSQL'],
      matchScore: 88,
      appliedDate: '26 Aug 2026',
      status: 'SCREENING',
      resumeName: 'Kavita_Reddy_FullStack.pdf',
      coverNote: 'Full stack engineer with solid React and Java backend foundations.',
      currentSalary: '₹16.0 LPA',
      expectedSalary: '₹24.0 LPA',
      noticePeriod: 'Immediate',
      timeline: [
        { stage: 'Applied', date: '26 Aug 2026', completed: true },
        { stage: 'Screening', date: '29 Aug 2026', completed: true, current: true },
        { stage: 'Shortlisted', date: 'Pending', completed: false },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-505',
      candidateId: 'cand-5',
      candidateName: 'Sneha Kulkarni',
      candidateEmail: 'sneha.kulkarni@example.com',
      candidatePhone: '+91 98220 12345',
      jobId: 'job-101',
      jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
      experience: '4.0 Years',
      location: 'Pune, MH',
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'HTML/CSS'],
      matchScore: 78,
      appliedDate: '20 Aug 2026',
      status: 'REJECTED',
      resumeName: 'Sneha_Kulkarni_Design_Portfolio.pdf',
      coverNote: 'Specialist in Design Systems and UI Engineering.',
      currentSalary: '₹15.0 LPA',
      expectedSalary: '₹22.0 LPA',
      noticePeriod: '15 Days',
      timeline: [
        { stage: 'Applied', date: '20 Aug 2026', completed: true },
        { stage: 'Screening', date: '22 Aug 2026', completed: true },
        { stage: 'Rejected', date: '24 Aug 2026', completed: true, current: true },
      ]
    },
    {
      id: 'app-506',
      candidateId: 'cand-6',
      candidateName: 'Ananya Deshmukh',
      candidateEmail: 'ananya.deshmukh@example.com',
      candidatePhone: '+91 98112 45678',
      jobId: 'job-107',
      jobTitle: 'Senior QA Automation Engineer (Cypress / Playwright)',
      experience: '4.5 Years',
      location: 'Bengaluru, KA',
      skills: ['Playwright', 'Cypress', 'TypeScript', 'Jest', 'CI/CD'],
      matchScore: 91,
      appliedDate: '01 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Ananya_Deshmukh_QA.pdf',
      coverNote: 'Experienced in setting up parallel Playwright test suites in GitHub Actions.',
      currentSalary: '₹13.0 LPA',
      expectedSalary: '₹18.0 LPA',
      noticePeriod: 'Immediate',
      timeline: [
        { stage: 'Applied', date: '01 Sept 2026', completed: true },
        { stage: 'Screening', date: '02 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '03 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-507',
      candidateId: 'cand-7',
      candidateName: 'Manish Varma',
      candidateEmail: 'manish.varma@example.com',
      candidatePhone: '+91 97001 23456',
      jobId: 'job-109',
      jobTitle: 'Data Engineer — Spark & Databricks',
      experience: '5.2 Years',
      location: 'Hyderabad, TS',
      skills: ['PySpark', 'Databricks', 'Python', 'Delta Lake', 'AWS'],
      matchScore: 93,
      appliedDate: '03 Sept 2026',
      status: 'INTERVIEW',
      resumeName: 'Manish_Varma_DataEng.pdf',
      coverNote: 'Built real-time streaming ingestion architectures on Delta Lake with sub-second queries.',
      currentSalary: '₹16.5 LPA',
      expectedSalary: '₹24.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '03 Sept 2026', completed: true },
        { stage: 'Screening', date: '04 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '05 Sept 2026', completed: true },
        { stage: 'Interview', date: '14 Sept 2026 (04:00 PM)', completed: true, current: true },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-508',
      candidateId: 'cand-8',
      candidateName: 'Harika Naidu',
      candidateEmail: 'harika.naidu@example.com',
      candidatePhone: '+91 99887 65432',
      jobId: 'job-110',
      jobTitle: 'Mobile App Engineer (React Native / Flutter)',
      experience: '3.5 Years',
      location: 'Visakhapatnam, AP',
      skills: ['Flutter', 'React Native', 'Dart', 'TypeScript', 'Firebase'],
      matchScore: 89,
      appliedDate: '03 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Harika_Naidu_MobileDev.pdf',
      coverNote: 'Built 6 production mobile apps with offline caching and complex state sync.',
      currentSalary: '₹10.5 LPA',
      expectedSalary: '₹15.0 LPA',
      noticePeriod: '15 Days',
      timeline: [
        { stage: 'Applied', date: '03 Sept 2026', completed: true },
        { stage: 'Screening', date: '04 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '05 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-509',
      candidateId: 'cand-9',
      candidateName: 'Deepak Saxena',
      candidateEmail: 'deepak.saxena@example.com',
      candidatePhone: '+91 91230 45678',
      jobId: 'job-111',
      jobTitle: 'Information Security & SOC Analyst',
      experience: '4.0 Years',
      location: 'Hyderabad, TS',
      skills: ['SIEM', 'Splunk', 'AWS Security', 'VAPT', 'Incident Response'],
      matchScore: 87,
      appliedDate: '04 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Deepak_Saxena_Security.pdf',
      coverNote: 'Strong hands-on experience in threat telemetry, firewall hardening, and SOC incident triage.',
      currentSalary: '₹13.5 LPA',
      expectedSalary: '₹19.0 LPA',
      noticePeriod: 'Immediate',
      timeline: [
        { stage: 'Applied', date: '04 Sept 2026', completed: true },
        { stage: 'Screening', date: '05 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '06 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-510',
      candidateId: 'cand-10',
      candidateName: 'Suresh Babu',
      candidateEmail: 'suresh.babu@example.com',
      candidatePhone: '+91 98480 12345',
      jobId: 'job-113',
      jobTitle: 'Backend Go / Golang Systems Engineer',
      experience: '5.0 Years',
      location: 'Guntur, AP',
      skills: ['Golang', 'gRPC', 'PostgreSQL', 'Docker', 'Kafka'],
      matchScore: 94,
      appliedDate: '05 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Suresh_Babu_Golang.pdf',
      coverNote: 'Extensive expertise building concurrent Go services handling 50k+ req/sec with low GC overhead.',
      currentSalary: '₹17.0 LPA',
      expectedSalary: '₹25.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '05 Sept 2026', completed: true },
        { stage: 'Screening', date: '06 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '07 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-511',
      candidateId: 'cand-11',
      candidateName: 'Ritu Agarwal',
      candidateEmail: 'ritu.agarwal@example.com',
      candidatePhone: '+91 97123 45670',
      jobId: 'job-108',
      jobTitle: 'Lead Product Manager — Developer Platform',
      experience: '3.5 Years',
      location: 'Bengaluru, KA',
      skills: ['Product Strategy', 'Jira', 'SQL', 'Mixpanel', 'Agile'],
      matchScore: 86,
      appliedDate: '02 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Ritu_Agarwal_PM.pdf',
      coverNote: 'Skilled in roadmap definition, analytics instrumentation, and developer API adoption funnels.',
      currentSalary: '₹18.0 LPA',
      expectedSalary: '₹25.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '02 Sept 2026', completed: true },
        { stage: 'Screening', date: '03 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '05 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-512',
      candidateId: 'cand-12',
      candidateName: 'Naveen Chowdary',
      candidateEmail: 'naveen.chowdary@example.com',
      candidatePhone: '+91 94401 23456',
      jobId: 'job-114',
      jobTitle: 'Junior Frontend Developer (React / JavaScript)',
      experience: '1.8 Years',
      location: 'Tirupati, AP',
      skills: ['React.js', 'JavaScript', 'Tailwind CSS', 'HTML5', 'Git'],
      matchScore: 84,
      appliedDate: '05 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Naveen_Chowdary_Frontend.pdf',
      coverNote: 'Strong foundation in React hooks, state management, and modern component design.',
      currentSalary: '₹5.5 LPA',
      expectedSalary: '₹8.5 LPA',
      noticePeriod: 'Immediate',
      timeline: [
        { stage: 'Applied', date: '05 Sept 2026', completed: true },
        { stage: 'Screening', date: '06 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '07 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-513',
      candidateId: 'cand-13',
      candidateName: 'Abhishek Roy',
      candidateEmail: 'abhishek.roy@example.com',
      candidatePhone: '+91 98300 12345',
      jobId: 'job-106',
      jobTitle: 'Full Stack Java & Spring Boot Developer',
      experience: '4.0 Years',
      location: 'Kolkata / Hyderabad',
      skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Docker'],
      matchScore: 90,
      appliedDate: '29 Aug 2026',
      status: 'SELECTED',
      resumeName: 'Abhishek_Roy_Java.pdf',
      coverNote: 'Offered position for enterprise backend service development.',
      currentSalary: '₹12.5 LPA',
      expectedSalary: '₹18.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '29 Aug 2026', completed: true },
        { stage: 'Screening', date: '31 Aug 2026', completed: true },
        { stage: 'Shortlisted', date: '02 Sept 2026', completed: true },
        { stage: 'Interview', date: '04 Sept 2026', completed: true },
        { stage: 'Selected', date: '06 Sept 2026', completed: true, current: true },
      ]
    },
    {
      id: 'app-514',
      candidateId: 'cand-14',
      candidateName: 'Divya Sree',
      candidateEmail: 'divya.sree@example.com',
      candidatePhone: '+91 99001 54321',
      jobId: 'job-101',
      jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
      experience: '3.0 Years',
      location: 'Kakinada, AP',
      skills: ['React.js', 'Redux', 'TypeScript', 'CSS3', 'REST APIs'],
      matchScore: 82,
      appliedDate: '01 Sept 2026',
      status: 'APPLIED',
      resumeName: 'Divya_Sree_Frontend.pdf',
      coverNote: 'Interested in frontend web application development at ABC Technologies.',
      currentSalary: '₹8.0 LPA',
      expectedSalary: '₹14.0 LPA',
      noticePeriod: 'Immediate',
      timeline: [
        { stage: 'Applied', date: '01 Sept 2026', completed: true, current: true },
        { stage: 'Screening', date: 'Pending', completed: false },
        { stage: 'Shortlisted', date: 'Pending', completed: false },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-515',
      candidateId: 'cand-15',
      candidateName: 'Tarun Teja',
      candidateEmail: 'tarun.teja@example.com',
      candidatePhone: '+91 94900 87654',
      jobId: 'job-102',
      jobTitle: 'Senior Python & Cloud Backend Developer',
      experience: '2.5 Years',
      location: 'Nellore, AP',
      skills: ['Python', 'Django', 'PostgreSQL', 'Git', 'Linux'],
      matchScore: 79,
      appliedDate: '03 Sept 2026',
      status: 'SCREENING',
      resumeName: 'Tarun_Teja_Python.pdf',
      coverNote: 'FastAPI and Django backend engineer seeking cloud microservices role.',
      currentSalary: '₹7.5 LPA',
      expectedSalary: '₹13.0 LPA',
      noticePeriod: '15 Days',
      timeline: [
        { stage: 'Applied', date: '03 Sept 2026', completed: true },
        { stage: 'Screening', date: '05 Sept 2026', completed: true, current: true },
        { stage: 'Shortlisted', date: 'Pending', completed: false },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-516',
      candidateId: 'cand-16',
      candidateName: 'Megha Nair',
      candidateEmail: 'megha.nair@example.com',
      candidatePhone: '+91 98470 98765',
      jobId: 'job-116',
      jobTitle: 'Lead Cloud Solutions Architect',
      experience: '9.0 Years',
      location: 'Bengaluru, KA',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'System Architecture'],
      matchScore: 95,
      appliedDate: '06 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Megha_Nair_Architect.pdf',
      coverNote: 'Architected multi-region cloud systems supporting 10M+ daily active transactions.',
      currentSalary: '₹32.0 LPA',
      expectedSalary: '₹42.0 LPA',
      noticePeriod: '60 Days',
      timeline: [
        { stage: 'Applied', date: '06 Sept 2026', completed: true },
        { stage: 'Screening', date: '07 Sept 2026', completed: true, current: true },
        { stage: 'Shortlisted', date: 'Pending', completed: false },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-517',
      candidateId: 'cand-17',
      candidateName: 'Karthik Raja',
      candidateEmail: 'karthik.raja@example.com',
      candidatePhone: '+91 98400 54321',
      jobId: 'job-119',
      jobTitle: 'Junior Python & Data Scraping Developer',
      experience: '2.0 Years',
      location: 'Chennai / Remote',
      skills: ['Python', 'Scrapy', 'BeautifulSoup', 'PostgreSQL'],
      matchScore: 88,
      appliedDate: '06 Sept 2026',
      status: 'INTERVIEW',
      resumeName: 'Karthik_Raja_PythonScraper.pdf',
      coverNote: 'Built 20+ automated web scraping extractors with proxy rotation.',
      currentSalary: '₹5.0 LPA',
      expectedSalary: '₹8.0 LPA',
      noticePeriod: 'Immediate',
      timeline: [
        { stage: 'Applied', date: '06 Sept 2026', completed: true },
        { stage: 'Screening', date: '07 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '07 Sept 2026', completed: true },
        { stage: 'Interview', date: '15 Sept 2026 (10:00 AM)', completed: true, current: true },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-518',
      candidateId: 'cand-18',
      candidateName: 'Pooja Hegde',
      candidateEmail: 'pooja.hegde@example.com',
      candidatePhone: '+91 97400 11223',
      jobId: 'job-117',
      jobTitle: 'HR Talent Acquisition Specialist — Tech Hiring',
      experience: '3.0 Years',
      location: 'Vijayawada, AP',
      skills: ['Sourcing', 'Tech Recruiting', 'Naukri ATS', 'LinkedIn Recruiter'],
      matchScore: 89,
      appliedDate: '06 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Pooja_Hegde_HR.pdf',
      coverNote: 'Closed 45+ technical requisitions across frontend, backend, and DevOps in last 12 months.',
      currentSalary: '₹7.2 LPA',
      expectedSalary: '₹10.5 LPA',
      noticePeriod: '15 Days',
      timeline: [
        { stage: 'Applied', date: '06 Sept 2026', completed: true },
        { stage: 'Screening', date: '07 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '07 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-519',
      candidateId: 'cand-19',
      candidateName: 'Venkatesh Prasad',
      candidateEmail: 'venkatesh.prasad@example.com',
      candidatePhone: '+91 98800 33445',
      jobId: 'job-120',
      jobTitle: 'Senior Site Reliability Engineer (SRE)',
      experience: '5.5 Years',
      location: 'Hyderabad, TS',
      skills: ['SRE', 'Kubernetes', 'Prometheus', 'Linux', 'Terraform'],
      matchScore: 92,
      appliedDate: '07 Sept 2026',
      status: 'APPLIED',
      resumeName: 'Venkatesh_Prasad_SRE.pdf',
      coverNote: 'Specialist in chaos engineering, auto-healing Kubernetes nodes, and Prometheus alerting.',
      currentSalary: '₹21.0 LPA',
      expectedSalary: '₹28.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '07 Sept 2026', completed: true, current: true },
        { stage: 'Screening', date: 'Pending', completed: false },
        { stage: 'Shortlisted', date: 'Pending', completed: false },
        { stage: 'Interview', date: 'Pending', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-520',
      candidateId: 'cand-20',
      candidateName: 'Sanjay Reddy',
      candidateEmail: 'sanjay.reddy@example.com',
      candidatePhone: '+91 94400 99887',
      jobId: 'job-103',
      jobTitle: 'DevOps & Cloud Infrastructure Specialist',
      experience: '3.8 Years',
      location: 'Kurnool, AP',
      skills: ['AWS', 'Docker', 'Linux', 'Jenkins', 'Shell Scripting'],
      matchScore: 76,
      appliedDate: '24 Aug 2026',
      status: 'REJECTED',
      resumeName: 'Sanjay_Reddy_DevOps.pdf',
      coverNote: 'CI/CD pipeline automation specialist seeking mid-level DevOps opportunity.',
      currentSalary: '₹9.0 LPA',
      expectedSalary: '₹15.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '24 Aug 2026', completed: true },
        { stage: 'Screening', date: '26 Aug 2026', completed: true },
        { stage: 'Rejected', date: '28 Aug 2026', completed: true, current: true },
      ]
    }
  ],

  // Interviews
  interviews: [
    {
      id: 'int-1',
      candidateName: 'Priya Sharma',
      candidateEmail: 'priya.sharma@example.com',
      jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
      date: '2026-09-10',
      time: '11:00 AM - 12:00 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-priya-fe',
      interviewer: 'Arjun Reddy & Deepak Verma (Architect)',
      status: 'SCHEDULED',
      notes: 'Round 1: Component design system, React 19 features, state management, and code challenge.'
    },
    {
      id: 'int-2',
      candidateName: 'Rahul Kumar',
      candidateEmail: 'rahul.kumar@example.com',
      jobTitle: 'Senior Python & Cloud Backend Developer',
      date: '2026-09-12',
      time: '02:00 PM - 03:00 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-rahul-py',
      interviewer: 'Arjun Reddy & Vikram Seth (VP Eng)',
      status: 'SCHEDULED',
      notes: 'Round 1: FastAPI async workers, database indexing, caching strategies, and concurrency.'
    },
    {
      id: 'int-3',
      candidateName: 'Vikram Sethi',
      candidateEmail: 'vikram.sethi@example.com',
      jobTitle: 'DevOps & Cloud Infrastructure Specialist',
      date: '2026-08-25',
      time: '04:00 PM - 05:00 PM IST',
      mode: 'Online (MS Teams)',
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/abc-vikram',
      interviewer: 'Arjun Reddy',
      status: 'COMPLETED',
      notes: 'Cleared technical screening with 9.2/10. Recommended for Senior Director offer stage.'
    },
    {
      id: 'int-4',
      candidateName: 'Manish Varma',
      candidateEmail: 'manish.varma@example.com',
      jobTitle: 'Data Engineer — Spark & Databricks',
      date: '2026-09-14',
      time: '04:00 PM - 05:00 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-manish-de',
      interviewer: 'Arjun Reddy & Data Lead',
      status: 'SCHEDULED',
      notes: 'Technical evaluation on PySpark optimizations, Delta Lake partitioning, and streaming transforms.'
    },
    {
      id: 'int-5',
      candidateName: 'Harika Naidu',
      candidateEmail: 'harika.naidu@example.com',
      jobTitle: 'Mobile App Engineer (React Native / Flutter)',
      date: '2026-09-15',
      time: '11:30 AM - 12:30 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-harika-mob',
      interviewer: 'Arjun Reddy & Mobile Lead',
      status: 'SCHEDULED',
      notes: 'Round 1: State management in Flutter/React Native, native bridges, and offline sync architectures.'
    },
    {
      id: 'int-6',
      candidateName: 'Kavita Reddy',
      candidateEmail: 'kavita.reddy@example.com',
      jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
      date: '2026-09-08',
      time: '03:00 PM - 04:00 PM IST',
      mode: 'In-Person (Office Round)',
      meetingLink: 'ABC Technologies HQ, Outer Ring Road, Bengaluru',
      interviewer: 'Deepak Verma',
      status: 'RESCHEDULED',
      notes: 'Rescheduled upon candidate request due to university presentation schedule.'
    },
    {
      id: 'int-7',
      candidateName: 'Deepak Saxena',
      candidateEmail: 'deepak.saxena@example.com',
      jobTitle: 'Information Security & SOC Analyst',
      date: '2026-09-16',
      time: '02:30 PM - 03:30 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-deepak-sec',
      interviewer: 'Arjun Reddy & CISO',
      status: 'SCHEDULED',
      notes: 'Incident response scenario simulation and threat hunting workflow review.'
    },
    {
      id: 'int-8',
      candidateName: 'Suresh Babu',
      candidateEmail: 'suresh.babu@example.com',
      jobTitle: 'Backend Go / Golang Systems Engineer',
      date: '2026-09-17',
      time: '10:00 AM - 11:00 AM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-suresh-go',
      interviewer: 'Arjun Reddy & Platform Architect',
      status: 'SCHEDULED',
      notes: 'Go concurrency patterns, channels, memory leak debugging, and high-load gRPC service design.'
    },
    {
      id: 'int-9',
      candidateName: 'Ananya Deshmukh',
      candidateEmail: 'ananya.deshmukh@example.com',
      jobTitle: 'Senior QA Automation Engineer (Cypress / Playwright)',
      date: '2026-09-18',
      time: '05:00 PM - 06:00 PM IST',
      mode: 'Online (MS Teams)',
      meetingLink: 'https://teams.microsoft.com/abc-ananya-qa',
      interviewer: 'QA Lead & Arjun Reddy',
      status: 'SCHEDULED',
      notes: 'Live test automation problem statement using Playwright & TypeScript.'
    },
    {
      id: 'int-10',
      candidateName: 'Abhishek Roy',
      candidateEmail: 'abhishek.roy@example.com',
      jobTitle: 'Full Stack Java & Spring Boot Developer',
      date: '2026-09-04',
      time: '02:00 PM - 03:00 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-abhishek-java',
      interviewer: 'Arjun Reddy',
      status: 'COMPLETED',
      notes: 'Candidate completed live architectural interview with high score (9.4/10). Offer approved.'
    },
    {
      id: 'int-11',
      candidateName: 'Ritu Agarwal',
      candidateEmail: 'ritu.agarwal@example.com',
      jobTitle: 'Lead Product Manager — Developer Platform',
      date: '2026-09-19',
      time: '11:00 AM - 12:00 PM IST',
      mode: 'In-Person (Office Round)',
      meetingLink: 'ABC Technologies HQ, Bellandur, Bengaluru',
      interviewer: 'Head of Product & Arjun Reddy',
      status: 'SCHEDULED',
      notes: 'Product teardown, PRD writing exercise, and developer platform monetization strategy.'
    },
    {
      id: 'int-12',
      candidateName: 'Karthik Raja',
      candidateEmail: 'karthik.raja@example.com',
      jobTitle: 'Junior Python & Data Scraping Developer',
      date: '2026-09-15',
      time: '10:00 AM - 11:00 AM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-karthik-py',
      interviewer: 'Data Team Lead',
      status: 'SCHEDULED',
      notes: 'Practical coding exercise parsing complex HTML DOM structures and handling pagination/anti-bot.'
    },
    {
      id: 'int-13',
      candidateName: 'Sanjay Reddy',
      candidateEmail: 'sanjay.reddy@example.com',
      jobTitle: 'DevOps & Cloud Infrastructure Specialist',
      date: '2026-08-26',
      time: '03:00 PM - 04:00 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-sanjay-devops',
      interviewer: 'DevOps Engineer',
      status: 'CANCELLED',
      notes: 'Cancelled due to candidate role mismatch during preliminary screening.'
    },
    {
      id: 'int-14',
      candidateName: 'Naveen Chowdary',
      candidateEmail: 'naveen.chowdary@example.com',
      jobTitle: 'Junior Frontend Developer (React / JavaScript)',
      date: '2026-09-21',
      time: '03:30 PM - 04:30 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/abc-naveen-fe',
      interviewer: 'Deepak Verma',
      status: 'SCHEDULED',
      notes: 'Junior technical screening: React component lifecycle, CSS flexbox/grid, and API fetch handling.'
    }
  ],

  // Internships
  internships: [
    {
      id: 'intern-1',
      title: 'Frontend React Development Intern',
      stipend: '₹25,000 / month',
      duration: '6 Months',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      applicantsCount: 42,
      openings: 4,
      status: 'PUBLISHED',
      postedOn: '2026-08-16',
      description: 'Hands-on frontend development internship working on React, TypeScript, and modern UI components.'
    },
    {
      id: 'intern-2',
      title: 'Cloud Infrastructure & DevOps Intern',
      stipend: '₹30,000 / month',
      duration: '6 Months',
      workMode: 'On-site',
      location: 'Hyderabad, Telangana',
      applicantsCount: 28,
      openings: 2,
      status: 'PUBLISHED',
      postedOn: '2026-08-19',
      description: 'Learn Terraform, Docker, Kubernetes, and AWS automation alongside senior DevOps engineers.'
    },
    {
      id: 'intern-3',
      title: 'AI & Data Science Engineering Intern',
      stipend: '₹28,000 / month',
      duration: '6 Months',
      workMode: 'Remote',
      location: 'Remote (India)',
      applicantsCount: 19,
      openings: 2,
      status: 'PENDING',
      postedOn: '2026-08-25',
      description: 'Train and fine-tune transformer models and build automated Python evaluation pipelines.'
    },
    {
      id: 'intern-4',
      title: 'Full Stack Java & Spring Boot Intern',
      stipend: '₹22,000 / month',
      duration: '6 Months',
      workMode: 'Hybrid',
      location: 'Vijayawada, Andhra Pradesh',
      applicantsCount: 35,
      openings: 3,
      status: 'PUBLISHED',
      postedOn: '2026-08-28',
      description: 'Develop enterprise Java microservices, REST APIs, and PostgreSQL database queries under mentorship.'
    },
    {
      id: 'intern-5',
      title: 'QA Automation & Software Testing Intern',
      stipend: '₹20,000 / month',
      duration: '3 Months',
      workMode: 'Hybrid',
      location: 'Visakhapatnam, Andhra Pradesh',
      applicantsCount: 24,
      openings: 2,
      status: 'PUBLISHED',
      postedOn: '2026-08-30',
      description: 'Write automated integration tests in Playwright and Cypress for web platform releases.'
    },
    {
      id: 'intern-6',
      title: 'UI/UX Product Design Intern',
      stipend: '₹22,000 / month',
      duration: '6 Months',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      applicantsCount: 31,
      openings: 2,
      status: 'PUBLISHED',
      postedOn: '2026-09-01',
      description: 'Create interactive Figma wireframes, design system tokens, and user journey flowcharts.'
    },
    {
      id: 'intern-7',
      title: 'Mobile App Development Intern (Flutter)',
      stipend: '₹24,000 / month',
      duration: '6 Months',
      workMode: 'Hybrid',
      location: 'Tirupati, Andhra Pradesh',
      applicantsCount: 26,
      openings: 2,
      status: 'PUBLISHED',
      postedOn: '2026-09-02',
      description: 'Build cross-platform mobile app widgets, animations, and state management in Flutter & Dart.'
    },
    {
      id: 'intern-8',
      title: 'Cybersecurity & Ethical Hacking Intern',
      stipend: '₹25,000 / month',
      duration: '6 Months',
      workMode: 'On-site',
      location: 'Hyderabad, Telangana',
      applicantsCount: 17,
      openings: 1,
      status: 'PENDING',
      postedOn: '2026-09-03',
      description: 'Assist security team in automated vulnerability scanning, OWASP top 10 auditing, and penetration tests.'
    },
    {
      id: 'intern-9',
      title: 'Python Backend & Data Scraping Intern',
      stipend: '₹20,000 / month',
      duration: '3 Months',
      workMode: 'Remote',
      location: 'Remote (India)',
      applicantsCount: 45,
      openings: 3,
      status: 'PUBLISHED',
      postedOn: '2026-09-04',
      description: 'Build automated Python crawlers, clean structured job datasets, and integrate SQLite/Postgres schemas.'
    },
    {
      id: 'intern-10',
      title: 'Database & SQL Engineering Intern',
      stipend: '₹22,000 / month',
      duration: '6 Months',
      workMode: 'Hybrid',
      location: 'Guntur, Andhra Pradesh',
      applicantsCount: 15,
      openings: 2,
      status: 'DRAFT',
      postedOn: '2026-09-05',
      description: 'Learn relational database design, query optimization, indexing, and backup operations in PostgreSQL.'
    },
    {
      id: 'intern-11',
      title: 'Technical Content & Documentation Intern',
      stipend: '₹18,000 / month',
      duration: '3 Months',
      workMode: 'Remote',
      location: 'Remote (India)',
      applicantsCount: 21,
      openings: 1,
      status: 'PUBLISHED',
      postedOn: '2026-09-05',
      description: 'Draft API documentation, SDK quickstart guides, and engineering blog tutorials.'
    },
    {
      id: 'intern-12',
      title: 'Cloud Security & Compliance Intern',
      stipend: '₹26,000 / month',
      duration: '6 Months',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      applicantsCount: 14,
      openings: 1,
      status: 'CLOSED',
      postedOn: '2026-07-15',
      description: 'Conducted automated AWS IAM policy reviews and SOC 2 security compliance checks.'
    },
    {
      id: 'intern-13',
      title: 'Golang Microservices Engineering Intern',
      stipend: '₹28,000 / month',
      duration: '6 Months',
      workMode: 'Remote',
      location: 'Remote (India)',
      applicantsCount: 29,
      openings: 2,
      status: 'PUBLISHED',
      postedOn: '2026-09-06',
      description: 'Build concurrent Go microservices, gRPC protocol buffers, and containerized Docker images.'
    },
    {
      id: 'intern-14',
      title: 'Machine Learning Model Evaluation Intern',
      stipend: '₹30,000 / month',
      duration: '6 Months',
      workMode: 'Hybrid',
      location: 'Bengaluru, Karnataka',
      applicantsCount: 38,
      openings: 2,
      status: 'PUBLISHED',
      postedOn: '2026-09-07',
      description: 'Benchmark LLM outputs, create evaluation datasets in Hugging Face, and calculate RAG recall metrics.'
    }
  ],

  // Job Melas
  jobMelas: [
    {
      id: 'mela-1',
      title: 'Bengaluru Mega IT & Cloud Career Expo 2026',
      city: 'Bengaluru',
      state: 'Karnataka',
      venue: 'BIEC Exhibition Grounds, Tumkur Road, Hall 3',
      date: '2026-09-18',
      time: '09:00 AM - 06:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Booth B-14 (Hall 3, Premium Corporate Stall)',
      registeredCandidatesAtBooth: 142,
      spotInterviewsConducted: 38,
      spotOffersGiven: 8,
      showcasedPositions: ['Senior Frontend Engineer', 'Python Cloud Developer', 'DevOps Specialist'],
      candidatesQueue: [
        { id: '1', name: 'Priya Sharma', role: 'Senior Frontend Engineer', token: 'T-042', status: 'INTERVIEWED', match: '95%' },
        { id: '2', name: 'Rahul Kumar', role: 'Python Cloud Developer', token: 'T-043', status: 'IN_QUEUE', match: '92%' },
        { id: '3', name: 'Kiran Rao', role: 'DevOps Specialist', token: 'T-044', status: 'OFFERED', match: '94%' },
      ]
    },
    {
      id: 'mela-2',
      title: 'AP Mega IT & Engineering Job Mela 2026',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      venue: 'AU Convention Center, Beach Road',
      date: '2026-10-05',
      time: '09:00 AM - 05:30 PM IST',
      participationStatus: 'PENDING',
      boothNumber: 'Stall Allocation in Progress',
      registeredCandidatesAtBooth: 0,
      spotInterviewsConducted: 0,
      spotOffersGiven: 0,
      showcasedPositions: ['Full Stack Developer', 'Cloud Security Architect'],
      candidatesQueue: []
    },
    {
      id: 'mela-3',
      title: 'Vijayawada Capital Region Mega Career Mela 2026',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      venue: 'Swarna Bharathi Indoor Stadium, MG Road',
      date: '2026-10-12',
      time: '09:00 AM - 06:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Booth A-08 (Main Pavilion)',
      registeredCandidatesAtBooth: 98,
      spotInterviewsConducted: 24,
      spotOffersGiven: 5,
      showcasedPositions: ['React Developers', 'Java Engineers', 'QA Specialists'],
      candidatesQueue: []
    },
    {
      id: 'mela-4',
      title: 'Tirupati Rayalaseema Tech & Skills Summit',
      city: 'Tirupati',
      state: 'Andhra Pradesh',
      venue: 'SV University Auditorium Complex',
      date: '2026-10-19',
      time: '09:30 AM - 05:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Booth C-03 (IT Wing)',
      registeredCandidatesAtBooth: 76,
      spotInterviewsConducted: 18,
      spotOffersGiven: 4,
      showcasedPositions: ['Frontend React Developers', 'Python Cloud Engineers'],
      candidatesQueue: []
    },
    {
      id: 'mela-5',
      title: 'Guntur & Amaravati District Employment Drive',
      city: 'Guntur',
      state: 'Andhra Pradesh',
      venue: 'Acharya Nagarjuna University Campus Grounds',
      date: '2026-10-25',
      time: '09:00 AM - 05:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Booth B-05 (Corporate Enclosure)',
      registeredCandidatesAtBooth: 115,
      spotInterviewsConducted: 32,
      spotOffersGiven: 7,
      showcasedPositions: ['Software Developers', 'DevOps Engineers', 'QA Testers'],
      candidatesQueue: []
    },
    {
      id: 'mela-6',
      title: 'Hyderabad Cyberabad Tech Talent Fair 2026',
      city: 'Hyderabad',
      state: 'Telangana',
      venue: 'HITEX Exhibition Center, Hitec City, Hall 2',
      date: '2026-11-02',
      time: '09:00 AM - 06:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Booth H-12 (Enterprise Hall)',
      registeredCandidatesAtBooth: 180,
      spotInterviewsConducted: 45,
      spotOffersGiven: 11,
      showcasedPositions: ['Golang Engineers', 'Java Spring Boot Leads', 'Cloud Architects'],
      candidatesQueue: []
    },
    {
      id: 'mela-7',
      title: 'Kakinada Godavari Coastal IT Job Drive',
      city: 'Kakinada',
      state: 'Andhra Pradesh',
      venue: 'JNTU Kakinada Indoor Sports Arena',
      date: '2026-11-09',
      time: '09:30 AM - 05:30 PM IST',
      participationStatus: 'PENDING',
      boothNumber: 'Awaiting Admin Allocation',
      registeredCandidatesAtBooth: 0,
      spotInterviewsConducted: 0,
      spotOffersGiven: 0,
      showcasedPositions: ['Frontend Engineers', 'Mobile Developers'],
      candidatesQueue: []
    },
    {
      id: 'mela-8',
      title: 'Kurnool District Youth Career Summit 2026',
      city: 'Kurnool',
      state: 'Andhra Pradesh',
      venue: 'Rayalaseema University Multi-Purpose Hall',
      date: '2026-11-15',
      time: '09:00 AM - 05:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Booth D-02 (Technology Pavilion)',
      registeredCandidatesAtBooth: 64,
      spotInterviewsConducted: 15,
      spotOffersGiven: 3,
      showcasedPositions: ['Junior React Developers', 'Python Scrapers'],
      candidatesQueue: []
    },
    {
      id: 'mela-9',
      title: 'Nellore Coastal Tech & Engineering Fair',
      city: 'Nellore',
      state: 'Andhra Pradesh',
      venue: 'V.R. High School Grounds, Trunk Road',
      date: '2026-11-22',
      time: '09:00 AM - 05:00 PM IST',
      participationStatus: 'PENDING',
      boothNumber: 'Awaiting Admin Allocation',
      registeredCandidatesAtBooth: 0,
      spotInterviewsConducted: 0,
      spotOffersGiven: 0,
      showcasedPositions: ['Full Stack Java Developers', 'Cloud Engineers'],
      candidatesQueue: []
    },
    {
      id: 'mela-10',
      title: 'Anantapur District Skills & Placement Expo',
      city: 'Anantapur',
      state: 'Andhra Pradesh',
      venue: 'JNTU Anantapur College of Engineering Grounds',
      date: '2026-11-29',
      time: '09:00 AM - 05:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Booth E-07 (Main Arena)',
      registeredCandidatesAtBooth: 58,
      spotInterviewsConducted: 12,
      spotOffersGiven: 2,
      showcasedPositions: ['Software Developers', 'Quality Analysts'],
      candidatesQueue: []
    },
    {
      id: 'mela-11',
      title: 'Rajahmundry Godavari Tech Job Expo 2026',
      city: 'Rajahmundry',
      state: 'Andhra Pradesh',
      venue: 'GIET University Campus Convention Center',
      date: '2026-12-05',
      time: '09:30 AM - 05:30 PM IST',
      participationStatus: 'PENDING',
      boothNumber: 'Awaiting Admin Allocation',
      registeredCandidatesAtBooth: 0,
      spotInterviewsConducted: 0,
      spotOffersGiven: 0,
      showcasedPositions: ['Frontend UI Developers', 'Backend Python Engineers'],
      candidatesQueue: []
    },
    {
      id: 'mela-12',
      title: 'Kadapa District Employment & Skill Drive',
      city: 'Kadapa',
      state: 'Andhra Pradesh',
      venue: 'YSR Engineering College Stadium Complex',
      date: '2026-12-12',
      time: '09:00 AM - 05:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Booth F-04 (Corporate Stall)',
      registeredCandidatesAtBooth: 72,
      spotInterviewsConducted: 19,
      spotOffersGiven: 4,
      showcasedPositions: ['Java Developers', 'Mobile App Engineers'],
      candidatesQueue: []
    }
  ],

  // Analytics Metrics
  analytics: {
    jobsPosted: 5,
    totalApplications: 167,
    screened: 112,
    shortlisted: 38,
    interviews: 12,
    selectedHired: 6,
    avgTimeToHire: '18 Days',
    offerAcceptanceRate: '88.5%',
    funnel: [
      { stage: '1. Applications Received', count: 167, pct: '100%', color: '#3b82f6' },
      { stage: '2. Profile Screening', count: 112, pct: '67.1%', color: '#6366f1' },
      { stage: '3. Shortlisted for Round', count: 38, pct: '22.8%', color: '#8b5cf6' },
      { stage: '4. Technical Interviews', count: 12, pct: '7.2%', color: '#f59e0b' },
      { stage: '5. Offers Released / Hired', count: 6, pct: '3.6%', color: '#10b981' },
    ],
    applicationTrends: [
      { month: 'May 2026', applicants: 45, hires: 2 },
      { month: 'Jun 2026', applicants: 78, hires: 3 },
      { month: 'Jul 2026', applicants: 124, hires: 4 },
      { month: 'Aug 2026', applicants: 167, hires: 6 },
    ],
    jobPerformance: [
      { title: 'Senior Frontend Engineer', views: 1840, applicants: 78, conversion: '4.2%' },
      { title: 'Python Cloud Developer', views: 1220, applicants: 45, conversion: '3.7%' },
      { title: 'DevOps & SRE Specialist', views: 890, applicants: 32, conversion: '3.6%' },
      { title: 'AI / ML Engineer', views: 410, applicants: 12, conversion: '2.9%' },
    ]
  },

  // Recruiter Settings
  settings: {
    applicantAlerts: true,
    interviewAlerts: true,
    jobMelaAlerts: true,
    weeklyDigest: true,
    teamMembers: [
      { id: 'tm-1', name: 'Pooja Nair', email: 'pooja.nair@example.com', role: 'Technical Recruiter', status: 'ACTIVE' },
      { id: 'tm-2', name: 'Karthik Varma', email: 'karthik.varma@example.com', role: 'Hiring Lead', status: 'ACTIVE' },
      { id: 'tm-3', name: 'Deepak Verma', email: 'deepak.verma@example.com', role: 'Interview Panelist', status: 'ACTIVE' },
    ]
  }
};

// ─── RECRUITER 2 SEED DATA: Sneha Rao (Tech Solutions) ─────────────────────
const RECRUITER_2_DATA = {
  id: 'rec-2',
  email: 'recruiter2@ntrvikasa.com',
  name: 'Sneha Rao',
  role: 'recruiter',
  designation: 'Head of People & University Talent',
  phone: '+91 91234 88776',
  avatar: 'S',

  company: {
    name: 'Tech Solutions Global Ltd',
    tagline: 'Building next-generation fintech architectures, AI platforms, and enterprise microservices.',
    description: 'Tech Solutions is an enterprise innovation powerhouse delivering mission-critical financial platforms, automated compliance workflows, and cloud-native solutions to multinational banks and tier-1 fintech startups.',
    industry: 'Fintech & Banking Technology',
    size: '500-1000 employees',
    employeesCount: '850+',
    foundedYear: '2018',
    website: 'https://techsolutions.example.com',
    email: 'hiring@techsolutions.example.com',
    phone: '+91 40 6820 4000',
    location: 'Hyderabad, Telangana (Offices in Visakhapatnam & Pune)',
    address: 'Floor 9, Cyber Towers, Hitec City, Madhapur, Hyderabad 500081',
    cinNumber: 'U72900TG2018PTC099142',
    gstNumber: '36ABCDE9876F1Z2',
    verified: true,
    activeJobsCount: 4,
    internshipsCount: 2,
  },

  jobs: [
    {
      id: 'job-201',
      title: 'Full Stack UI Architect (React / Node.js)',
      department: 'Fintech Core',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Hyderabad, Telangana',
      experience: '4-8 years',
      salary: '₹18,00,000 - ₹28,00,000 / year',
      applicantsCount: 64,
      shortlistedCount: 11,
      interviewsCount: 4,
      hiredCount: 1,
      status: 'PUBLISHED',
      createdAt: '2026-08-16',
      deadline: '2026-09-28',
      openings: 2,
      description: 'Lead banking payment gateway UI architectures, design systems, and secure transaction pipelines.',
      responsibilities: '• Architect high-availability financial dashboards.\n• Implement banking grade security and tokenization.\n• Guide team in React, Node, and TypeScript best practices.',
      requirements: '• 4+ years of Fullstack JavaScript/TypeScript experience.\n• Experience with React, Node.js, Next.js, and Redis.',
      qualifications: "Bachelor's Degree in CS/IT.",
      skills: ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Tailwind CSS']
    },
    {
      id: 'job-202',
      title: 'Cloud Data Engineer (Python / Snowflake / Kafka)',
      department: 'Data Platform',
      type: 'Full-time',
      workMode: 'Remote',
      location: 'Remote (India)',
      experience: '3-6 years',
      salary: '₹16,00,000 - ₹25,00,000 / year',
      applicantsCount: 38,
      shortlistedCount: 8,
      interviewsCount: 3,
      hiredCount: 1,
      status: 'PUBLISHED',
      createdAt: '2026-08-19',
      deadline: '2026-10-05',
      openings: 2,
      description: 'Build real-time financial fraud detection streams, ETL data pipelines, and analytics warehouses.',
      responsibilities: '• Design streaming ETL pipelines in Kafka & Spark.\n• Optimize SQL queries and data schemas in Snowflake.',
      requirements: '• Strong Python, SQL, Kafka, and cloud data warehouse knowledge.',
      qualifications: "Bachelor's Degree in CS/IT.",
      skills: ['Python', 'Kafka', 'Snowflake', 'PostgreSQL', 'AWS', 'Spark']
    },
    {
      id: 'job-203',
      title: 'Cybersecurity & KYC Compliance Lead',
      department: 'Security & Risk',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Hyderabad, Telangana',
      experience: '5-9 years',
      salary: '₹22,00,000 - ₹34,00,000 / year',
      applicantsCount: 18,
      shortlistedCount: 4,
      interviewsCount: 2,
      hiredCount: 0,
      status: 'PUBLISHED',
      createdAt: '2026-08-22',
      deadline: '2026-10-15',
      openings: 1,
      description: 'Ensure PCI-DSS, ISO 27001, and RBI regulatory security frameworks across banking applications.',
      responsibilities: '• Conduct regular vulnerability assessments and penetration tests.\n• Lead audits with partner banks and financial regulators.',
      requirements: '• CISSP, CISA, or CEH certification with 5+ years in BFSI security.',
      qualifications: "Bachelor's or Master's in Cybersecurity.",
      skills: ['Cybersecurity', 'PCI-DSS', 'ISO 27001', 'Cloud Security', 'VAPT']
    }
  ],

  candidates: [
    {
      id: 'cand-1',
      name: 'Priya Sharma',
      role: 'Senior React & Frontend Developer',
      headline: 'Senior React & Frontend Developer | 4+ Years Experience | Visakhapatnam & Bengaluru',
      experience: '4.2 Years',
      location: 'Visakhapatnam, Andhra Pradesh',
      skills: ['React.js', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'Jest', 'REST APIs'],
      matchScore: 94,
      resumeName: 'Priya_Sharma_Resume.pdf',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
      education: 'B.Tech in Computer Science, Andhra University (8.7 CGPA)',
      currentSalary: '₹14,50,000 / year',
      expectedSalary: '₹20,00,000 - ₹24,00,000 / year',
      workMode: 'Hybrid / Remote',
      availability: 'Immediate (15 days notice)',
      summary: 'Passionate frontend engineer specialized in performant React architectures and design systems.',
      projects: ['NTR Vikasa Candidate Portal (React, Vite)', 'Enterprise Design System UI Kit'],
      certifications: ['Meta Certified Frontend Developer', 'AWS Cloud Practitioner'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
    {
      id: 'cand-2',
      name: 'Rahul Kumar',
      role: 'Senior Python & Cloud Backend Engineer',
      headline: 'Senior Python & Cloud Backend Developer | 3.5 Years Experience | Vijayawada & Hyderabad',
      experience: '3.5 Years',
      location: 'Vijayawada, Andhra Pradesh',
      skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'Microservices'],
      matchScore: 96,
      resumeName: 'Rahul_Kumar_Python_Backend.pdf',
      email: 'rahul.kumar@example.com',
      phone: '+91 91234 56789',
      education: 'B.Tech in IT, VR Siddhartha Engineering College (8.4 CGPA)',
      currentSalary: '₹11,00,000 / year',
      expectedSalary: '₹16,00,000 - ₹20,00,000 / year',
      workMode: 'Hybrid / Remote',
      availability: '30 Days Notice',
      summary: 'Backend engineer specialized in Python, FastAPI, Django, PostgreSQL, and AWS microservices.',
      projects: ['High-Throughput API Rate Limiter', 'Distributed Telemetry Pipeline'],
      certifications: ['AWS Certified Solutions Architect – Associate', 'CKA'],
      shortlisted: true,
      status: 'SHORTLISTED',
    },
  ],

  applications: [
    {
      id: 'app-601',
      candidateId: 'cand-1',
      candidateName: 'Priya Sharma',
      candidateEmail: 'priya.sharma@example.com',
      candidatePhone: '+91 98765 43210',
      jobId: 'job-201',
      jobTitle: 'Full Stack UI Architect (React / Node.js)',
      experience: '4.2 Years',
      location: 'Visakhapatnam, AP',
      skills: ['React.js', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS'],
      matchScore: 94,
      appliedDate: '01 Sept 2026',
      status: 'SHORTLISTED',
      resumeName: 'Priya_Sharma_Resume.pdf',
      coverNote: 'Interested in leading the payment UI architecture at Tech Solutions.',
      currentSalary: '₹14.5 LPA',
      expectedSalary: '₹22.0 LPA',
      noticePeriod: '15 Days',
      timeline: [
        { stage: 'Applied', date: '01 Sept 2026', completed: true },
        { stage: 'Screening', date: '02 Sept 2026', completed: true },
        { stage: 'Shortlisted', date: '03 Sept 2026', completed: true, current: true },
        { stage: 'Interview', date: '11 Sept 2026 (03:00 PM)', completed: false },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
    {
      id: 'app-602',
      candidateId: 'cand-2',
      candidateName: 'Rahul Kumar',
      candidateEmail: 'rahul.kumar@example.com',
      candidatePhone: '+91 91234 56789',
      jobId: 'job-202',
      jobTitle: 'Cloud Data Engineer (Python / Snowflake / Kafka)',
      experience: '3.5 Years',
      location: 'Vijayawada, AP',
      skills: ['Python', 'PostgreSQL', 'Docker', 'AWS', 'Kafka'],
      matchScore: 96,
      appliedDate: '30 Aug 2026',
      status: 'INTERVIEW',
      resumeName: 'Rahul_Kumar_Python_Backend.pdf',
      coverNote: 'Strong experience in real-time event streaming and high-scale databases.',
      currentSalary: '₹11.0 LPA',
      expectedSalary: '₹19.0 LPA',
      noticePeriod: '30 Days',
      timeline: [
        { stage: 'Applied', date: '30 Aug 2026', completed: true },
        { stage: 'Screening', date: '31 Aug 2026', completed: true },
        { stage: 'Shortlisted', date: '01 Sept 2026', completed: true },
        { stage: 'Interview', date: '14 Sept 2026 (11:30 AM)', completed: true, current: true },
        { stage: 'Selected', date: 'Pending', completed: false },
      ]
    },
  ],

  interviews: [
    {
      id: 'int-201',
      candidateName: 'Priya Sharma',
      candidateEmail: 'priya.sharma@example.com',
      jobTitle: 'Full Stack UI Architect (React / Node.js)',
      date: '2026-09-11',
      time: '03:00 PM - 04:00 PM IST',
      mode: 'Online (Google Meet)',
      meetingLink: 'https://meet.google.com/techsolutions-priya',
      interviewer: 'Sneha Rao & Technical Lead',
      status: 'SCHEDULED',
      notes: 'Round 1: Payment UI architecture, secure tokenization, and live React system design.'
    },
    {
      id: 'int-202',
      candidateName: 'Rahul Kumar',
      candidateEmail: 'rahul.kumar@example.com',
      jobTitle: 'Cloud Data Engineer (Python / Snowflake / Kafka)',
      date: '2026-09-14',
      time: '11:30 AM - 12:30 PM IST',
      mode: 'Online (Zoom)',
      meetingLink: 'https://zoom.us/j/techsolutions-rahul',
      interviewer: 'Sneha Rao & Head of Data Engineering',
      status: 'SCHEDULED',
      notes: 'Round 1: Streaming pipelines, Kafka partitions, and data lake optimization.'
    },
  ],

  internships: [
    {
      id: 'intern-201',
      title: 'Fintech Full Stack Engineering Intern',
      stipend: '₹26,000 / month',
      duration: '6 Months',
      workMode: 'Hybrid',
      location: 'Hyderabad, Telangana',
      applicantsCount: 34,
      openings: 3,
      status: 'PUBLISHED',
      postedOn: '2026-08-20',
      description: 'Build responsive financial dashboards and API integration microservices.'
    }
  ],

  jobMelas: [
    {
      id: 'mela-201',
      title: 'Hyderabad Tech & Banking Drive 2026',
      city: 'Hyderabad',
      state: 'Telangana',
      venue: 'HITEX Exhibition Center, Hitec City',
      date: '2026-09-24',
      time: '09:00 AM - 06:00 PM IST',
      participationStatus: 'APPROVED',
      boothNumber: 'Stall H-08 (Hall 2)',
      registeredCandidatesAtBooth: 98,
      spotInterviewsConducted: 24,
      spotOffersGiven: 5,
      showcasedPositions: ['Full Stack UI Architect', 'Cloud Data Engineer'],
      candidatesQueue: [
        { id: '1', name: 'Rahul Kumar', role: 'Cloud Data Engineer', token: 'T-018', status: 'INTERVIEWED', match: '96%' },
      ]
    }
  ],

  analytics: {
    jobsPosted: 3,
    totalApplications: 120,
    screened: 84,
    shortlisted: 28,
    interviews: 8,
    selectedHired: 4,
    avgTimeToHire: '16 Days',
    offerAcceptanceRate: '92.0%',
    funnel: [
      { stage: '1. Applications Received', count: 120, pct: '100%', color: '#3b82f6' },
      { stage: '2. Profile Screening', count: 84, pct: '70.0%', color: '#6366f1' },
      { stage: '3. Shortlisted for Round', count: 28, pct: '23.3%', color: '#8b5cf6' },
      { stage: '4. Technical Interviews', count: 8, pct: '6.7%', color: '#f59e0b' },
      { stage: '5. Offers Released / Hired', count: 4, pct: '3.3%', color: '#10b981' },
    ],
    applicationTrends: [
      { month: 'Jun 2026', applicants: 50, hires: 1 },
      { month: 'Jul 2026', applicants: 85, hires: 2 },
      { month: 'Aug 2026', applicants: 120, hires: 4 },
    ],
    jobPerformance: [
      { title: 'Full Stack UI Architect', views: 1420, applicants: 64, conversion: '4.5%' },
      { title: 'Cloud Data Engineer', views: 980, applicants: 38, conversion: '3.9%' },
      { title: 'Cybersecurity & KYC Lead', views: 430, applicants: 18, conversion: '4.2%' },
    ]
  },

  settings: {
    applicantAlerts: true,
    interviewAlerts: true,
    jobMelaAlerts: true,
    weeklyDigest: true,
    teamMembers: [
      { id: 'tm-201', name: 'Rohit Sharma', email: 'rohit.sharma@techsolutions.example.com', role: 'Technical Recruiter', status: 'ACTIVE' },
      { id: 'tm-202', name: 'Priya Nair', email: 'priya.nair@techsolutions.example.com', role: 'Hiring Manager', status: 'ACTIVE' },
    ]
  }
};

// ─── SEED USERS ACCOUNTS ──────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: 'user-arjun',
    name: 'Arjun Reddy',
    email: 'recruiter1@ntrvikasa.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Technical Recruiter',
    designation: 'Director of Talent Acquisition',
    phone: '+91 98765 00112',
    avatar: 'A',
    companyId: 'rec-1',
    status: 'ACTIVE',
    createdAt: '2026-08-01',
  },
  {
    id: 'user-pooja',
    name: 'Pooja Nair',
    email: 'pooja.nair@example.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Technical Recruiter',
    designation: 'Technical Recruiter',
    phone: '+91 98765 00113',
    avatar: 'P',
    companyId: 'rec-1',
    status: 'ACTIVE',
    createdAt: '2026-08-10',
  },
  {
    id: 'user-karthik',
    name: 'Karthik Varma',
    email: 'karthik.varma@example.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Hiring Lead',
    designation: 'Hiring Lead',
    phone: '+91 98765 00114',
    avatar: 'K',
    companyId: 'rec-1',
    status: 'ACTIVE',
    createdAt: '2026-08-12',
  },
  {
    id: 'user-sneha',
    name: 'Sneha Rao',
    email: 'recruiter2@ntrvikasa.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Technical Recruiter',
    designation: 'Head of People & University Talent',
    phone: '+91 91234 88776',
    avatar: 'S',
    companyId: 'rec-2',
    status: 'ACTIVE',
    createdAt: '2026-08-01',
  },
  {
    id: 'user-rohit',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@techsolutions.example.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Technical Recruiter',
    designation: 'Technical Recruiter',
    phone: '+91 91234 88777',
    avatar: 'R',
    companyId: 'rec-2',
    status: 'ACTIVE',
    createdAt: '2026-08-15',
  },
  {
    id: 'user-priya',
    name: 'Priya Nair',
    email: 'priya.nair@techsolutions.example.com',
    password: 'password123',
    role: 'recruiter',
    teamRole: 'Hiring Manager',
    designation: 'Hiring Manager',
    phone: '+91 91234 88778',
    avatar: 'P',
    companyId: 'rec-2',
    status: 'ACTIVE',
    createdAt: '2026-08-18',
  }
];

// ─── SEED INVITATIONS ──────────────────────────────────────────────────────
const SEED_INVITATIONS = [
  {
    token: 'inv_demo_ravi_101',
    name: 'Ravi Kumar',
    email: 'ravi@abctech.com',
    role: 'Interview Panelist',
    companyId: 'rec-1',
    companyName: 'ABC Technologies Pvt Ltd',
    inviterId: 'user-arjun',
    inviterName: 'Arjun Reddy',
    status: 'INVITED',
    invitedAt: '2026-08-28',
    expiresAt: '2026-09-30',
  }
];

const RecruiterContext = createContext(null);

export function RecruiterProvider({ children }) {
  const { addNotification } = useNotifications();

  // 1. Companies Dataset
  const [companiesData, setCompaniesData] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_companies_data_v5') || localStorage.getItem('ntr_recruiter_data_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed['rec-1'] && parsed['rec-2']) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return {
      'rec-1': RECRUITER_1_DATA,
      'rec-2': RECRUITER_2_DATA,
    };
  });

  // 2. User Accounts Dataset (Separate user accounts for recruiters in each company)
  const [userAccounts, setUserAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_recruiter_users_v5');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_USERS;
  });

  // 3. Invitations Dataset
  const [invitations, setInvitations] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_invitations_v5');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return SEED_INVITATIONS;
  });

  // 4. Current Active User ID (Default 'user-arjun')
  const [activeUserId, setActiveUserId] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_active_user_id_v5');
      if (stored) return stored;
    } catch (e) {
      // ignore
    }
    return 'user-arjun';
  });

  // 5. Is Recruiter Logged In
  const [isRecruiterLoggedIn, setIsRecruiterLoggedIn] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_recruiter_logged_in');
      return stored === 'true';
    } catch (e) {
      return false;
    }
  });

  // Persist all state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ntr_companies_data_v5', JSON.stringify(companiesData));
      localStorage.setItem('ntr_recruiter_users_v5', JSON.stringify(userAccounts));
      localStorage.setItem('ntr_invitations_v5', JSON.stringify(invitations));
      localStorage.setItem('ntr_active_user_id_v5', activeUserId);
      localStorage.setItem('ntr_recruiter_logged_in', String(isRecruiterLoggedIn));
    } catch (e) {
      // ignore
    }
  }, [companiesData, userAccounts, invitations, activeUserId, isRecruiterLoggedIn]);

  // Derive Current User and Current Company
  const currentUser = userAccounts.find(u => u.id === activeUserId) || userAccounts[0] || SEED_USERS[0];
  const activeCompanyId = currentUser.companyId || 'rec-1';
  const currentCompany = companiesData[activeCompanyId] || RECRUITER_1_DATA;

  // Composite Recruiter object for backward-compatibility across all recruiter pages
  const currentRecruiter = {
    ...currentCompany,
    id: currentUser.id,
    userId: currentUser.id,
    companyId: activeCompanyId,
    name: currentUser.name,
    email: currentUser.email,
    role: 'recruiter',
    teamRole: currentUser.teamRole || 'Technical Recruiter',
    designation: currentUser.designation || currentUser.teamRole || 'Recruiter',
    phone: currentUser.phone || currentCompany.phone || '+91 98765 00112',
    avatar: currentUser.avatar || currentUser.name?.[0]?.toUpperCase() || 'R',
    company: currentCompany.company,
    jobs: currentCompany.jobs || [],
    applications: currentCompany.applications || [],
    applicants: currentCompany.applications || [],
    candidates: currentCompany.candidates || [],
    interviews: currentCompany.interviews || [],
    internships: currentCompany.internships || [],
    jobMelas: currentCompany.jobMelas || [],
    analytics: currentCompany.analytics || {},
    settings: currentCompany.settings || {},
  };

  // Helper to update current company dataset
  const updateRecruiter = (updater) => {
    setCompaniesData((prev) => {
      const comp = prev[activeCompanyId] || RECRUITER_1_DATA;
      const updated = typeof updater === 'function' ? updater(comp) : { ...comp, ...updater };
      return {
        ...prev,
        [activeCompanyId]: updated
      };
    });
  };

  // Login handler with support for individual user accounts
  const loginRecruiter = (email, enteredPassword) => {
    const cleanEmail = email?.trim().toLowerCase();
    
    // Find matching user account
    const matchedUser = userAccounts.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (matchedUser) {
      setActiveUserId(matchedUser.id);
      setIsRecruiterLoggedIn(true);
      return {
        success: true,
        user: matchedUser,
        company: companiesData[matchedUser.companyId]?.company
      };
    }

    // Fallback based on email substring (e.g. recruiter2 -> Sneha, recruiter1 -> Arjun)
    if (cleanEmail?.includes('recruiter2') || cleanEmail?.includes('sneha') || cleanEmail?.includes('tech')) {
      const snehaUser = userAccounts.find(u => u.id === 'user-sneha') || SEED_USERS[3];
      setActiveUserId(snehaUser.id);
      setIsRecruiterLoggedIn(true);
      return { success: true, user: snehaUser, company: companiesData['rec-2']?.company };
    }

    const arjunUser = userAccounts.find(u => u.id === 'user-arjun') || SEED_USERS[0];
    setActiveUserId(arjunUser.id);
    setIsRecruiterLoggedIn(true);
    return { success: true, user: arjunUser, company: companiesData['rec-1']?.company };
  };

  // Logout handler
  const logoutRecruiter = () => {
    setIsRecruiterLoggedIn(false);
  };

  // Switch Recruiter Demo helper
  const switchRecruiter = (identifier) => {
    if (identifier === 'rec-1' || identifier === 'user-arjun') {
      setActiveUserId('user-arjun');
      setIsRecruiterLoggedIn(true);
    } else if (identifier === 'rec-2' || identifier === 'user-sneha') {
      setActiveUserId('user-sneha');
      setIsRecruiterLoggedIn(true);
    } else if (identifier === 'user-pooja') {
      setActiveUserId('user-pooja');
      setIsRecruiterLoggedIn(true);
    } else {
      const target = userAccounts.find(u => u.id === identifier || u.email.toLowerCase() === identifier.toLowerCase());
      if (target) {
        setActiveUserId(target.id);
        setIsRecruiterLoggedIn(true);
      }
    }
  };

  // ── INVITATION SYSTEM METHODS ──────────────────────────────────────────────

  // 1. Invite a Team Member
  const inviteTeamMember = (memberData) => {
    const emailToInvite = memberData.email?.trim().toLowerCase();
    const companyTeam = currentCompany.settings?.teamMembers || [];

    // Check duplicate email in the current company's team
    const isDuplicateTeam = companyTeam.some(
      (m) => m.email?.trim().toLowerCase() === emailToInvite
    );
    const isDuplicateUser = userAccounts.some(
      (u) => u.companyId === activeCompanyId && u.email.toLowerCase() === emailToInvite
    );

    if (isDuplicateTeam || isDuplicateUser) {
      return { success: false, error: 'This email is already a member of your hiring team.' };
    }

    // Generate secure unique token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create invitation record
    const newInvitation = {
      token,
      name: memberData.name.trim(),
      email: memberData.email.trim(),
      role: memberData.role || 'Technical Recruiter',
      companyId: activeCompanyId,
      companyName: currentCompany.company?.name || 'Company',
      inviterId: currentUser.id,
      inviterName: currentUser.name,
      status: 'INVITED',
      invitedAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    // New Team Member record in Company Settings
    const newTeamMember = {
      id: `tm-${Date.now()}`,
      name: memberData.name.trim(),
      email: memberData.email.trim(),
      role: memberData.role || 'Technical Recruiter',
      status: 'INVITED',
      invitationToken: token,
      invitedAt: new Date().toISOString().split('T')[0],
      companyId: activeCompanyId,
      companyName: currentCompany.company?.name || 'Company',
    };

    // Update invitations store
    setInvitations((prev) => [newInvitation, ...prev]);

    // Update company team members
    updateRecruiter((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        teamMembers: [newTeamMember, ...(prev.settings?.teamMembers || [])],
      },
    }));

    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_TEAM_MEMBER_ADDED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'TEAM',
        title: `Team Invitation Sent: ${memberData.name}`,
        message: `Invitation sent to ${memberData.name} (${memberData.email}) for role: ${memberData.role || 'Technical Recruiter'}.`,
        link: '/recruiter/settings',
        meta: { memberName: memberData.name, email: memberData.email, role: memberData.role }
      },
      meta: { memberName: memberData.name, email: memberData.email, role: memberData.role }
    });

    return {
      success: true,
      invitationToken: token,
      invitation: newInvitation,
      member: newTeamMember
    };
  };

  // 2. Get Invitation by Token
  const getInvitationByToken = (token) => {
    if (!token) return { valid: false, reason: 'Invalid token.' };

    const inv = invitations.find((i) => i.token === token);
    if (!inv) {
      return { valid: false, reason: 'Invitation not found or link has expired.' };
    }

    if (inv.status === 'ACCEPTED') {
      return { valid: false, invitation: inv, reason: 'This invitation has already been accepted.' };
    }

    if (inv.status === 'EXPIRED') {
      return { valid: false, invitation: inv, reason: 'This invitation has expired. Please ask your team administrator to send a new invitation.' };
    }

    return { valid: true, invitation: inv };
  };

  // 3. Accept Invitation & Create Individual User Account
  const acceptInvitation = ({ token, password }) => {
    const check = getInvitationByToken(token);
    if (!check.valid || !check.invitation) {
      return { success: false, error: check.reason || 'Invalid invitation.' };
    }

    const inv = check.invitation;
    const cleanEmail = inv.email.trim().toLowerCase();

    // Create new separate User Account
    const newUserId = `user-${Date.now()}`;
    const newUser = {
      id: newUserId,
      name: inv.name,
      email: inv.email,
      password: password || 'password123',
      role: 'recruiter',
      teamRole: inv.role,
      designation: inv.role,
      phone: '+91 98000 00000',
      avatar: inv.name[0]?.toUpperCase() || 'U',
      companyId: inv.companyId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 1. Add to User Accounts
    setUserAccounts((prev) => [...prev, newUser]);

    // 2. Update Invitation status
    setInvitations((prev) =>
      prev.map((i) => (i.token === token ? { ...i, status: 'ACCEPTED', acceptedAt: new Date().toISOString() } : i))
    );

    // 3. Update Company Team Member status to ACTIVE
    setCompaniesData((prev) => {
      const targetCompany = prev[inv.companyId] || RECRUITER_1_DATA;
      const updatedMembers = (targetCompany.settings?.teamMembers || []).map((m) => {
        if (m.invitationToken === token || m.email?.toLowerCase() === cleanEmail) {
          return { ...m, status: 'ACTIVE', role: inv.role, acceptedAt: new Date().toISOString() };
        }
        return m;
      });

      return {
        ...prev,
        [inv.companyId]: {
          ...targetCompany,
          settings: {
            ...targetCompany.settings,
            teamMembers: updatedMembers,
          }
        }
      };
    });

    // 4. Set Active User to this new user and log them in
    setActiveUserId(newUserId);
    setIsRecruiterLoggedIn(true);

    return {
      success: true,
      user: newUser,
      company: companiesData[inv.companyId]?.company
    };
  };

  // 4. Remove Team Member
  const removeTeamMember = (memberId) => {
    updateRecruiter((prev) => {
      const removedMember = (prev.settings?.teamMembers || []).find((m) => m.id === memberId);
      const updatedMembers = (prev.settings?.teamMembers || []).filter((m) => m.id !== memberId);

      // Also clean up pending invitations if any
      if (removedMember?.email) {
        setInvitations((invPrev) =>
          invPrev.filter((i) => i.email.toLowerCase() !== removedMember.email.toLowerCase())
        );
      }

      return {
        ...prev,
        settings: {
          ...prev.settings,
          teamMembers: updatedMembers,
        },
      };
    });
  };

  // ── RECRUITMENT OPERATIONS ─────────────────────────────────────────────────

  // Create Job (tagged with creator ID)
  const createJob = (jobData) => {
    const newJob = {
      id: `job-${Date.now()}`,
      applicantsCount: 0,
      shortlistedCount: 0,
      interviewsCount: 0,
      hiredCount: 0,
      status: jobData.status || 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      ...jobData
    };
    updateRecruiter((prev) => ({
      ...prev,
      jobs: [newJob, ...prev.jobs],
      company: {
        ...prev.company,
        activeJobsCount: prev.company.activeJobsCount + 1
      }
    }));
    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_JOB_SUBMITTED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'JOB_APPROVAL',
        title: `Job Submitted: ${newJob.title}`,
        message: `"${newJob.title}" was submitted for review. It will be live once approved by NTR Vikasa Admin.`,
        link: '/recruiter/jobs',
        meta: { jobId: newJob.id, title: newJob.title, status: newJob.status }
      },
      meta: { jobId: newJob.id, title: newJob.title }
    });
    return newJob;
  };

  // Update Job
  const updateJob = (jobId, updatedFields) => {
    updateRecruiter((prev) => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === jobId ? { ...j, ...updatedFields } : j)
    }));
  };

  // Close Job
  const closeJob = (jobId) => {
    updateRecruiter((prev) => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === jobId ? { ...j, status: 'CLOSED' } : j)
    }));
  };

  // Create Internship
  const createInternship = (internshipData) => {
    const newIntern = {
      id: `intern-${Date.now()}`,
      applicantsCount: 0,
      status: 'PENDING',
      postedOn: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      ...internshipData
    };
    updateRecruiter((prev) => ({
      ...prev,
      internships: [newIntern, ...prev.internships],
      company: {
        ...prev.company,
        internshipsCount: prev.company.internshipsCount + 1
      }
    }));
    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_INTERNSHIP_SUBMITTED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'JOB_APPROVAL',
        title: `Internship Submitted: ${newIntern.title}`,
        message: `"${newIntern.title}" was submitted for admin review.`,
        link: '/recruiter/internships',
        meta: { internshipId: newIntern.id, title: newIntern.title, status: 'PENDING' }
      },
      meta: { internshipId: newIntern.id, title: newIntern.title }
    });
    return newIntern;
  };

  // Shortlist candidate
  const shortlistCandidate = (candidateId, jobId) => {
    let candidateName = 'Candidate';
    updateRecruiter((prev) => {
      const updatedCandidates = prev.candidates.map(c => {
        if (c.id === candidateId) {
          candidateName = c.name || candidateName;
          return { ...c, shortlisted: true, status: 'SHORTLISTED' };
        }
        return c;
      });
      const updatedApps = prev.applications.map(a => {
        if (a.candidateId === candidateId) {
          candidateName = a.candidateName || candidateName;
          return { ...a, status: 'SHORTLISTED' };
        }
        return a;
      });
      return {
        ...prev,
        candidates: updatedCandidates,
        applications: updatedApps
      };
    });
    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_CANDIDATE_SHORTLISTED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'SHORTLIST',
        title: `Candidate Shortlisted: ${candidateName}`,
        message: `${candidateName} was shortlisted for further evaluation and interview scheduling.`,
        link: '/recruiter/candidates',
        meta: { candidateId, candidateName }
      },
      meta: { candidateId, candidateName }
    });
  };

  // Reject candidate
  const rejectCandidate = (candidateId) => {
    updateRecruiter((prev) => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.candidateId === candidateId ? { ...a, status: 'REJECTED' } : a
      )
    }));
  };

  // Schedule Interview
  const scheduleInterview = (interviewData) => {
    const newInterview = {
      id: `int-${Date.now()}`,
      status: 'SCHEDULED',
      scheduledBy: currentUser.id,
      scheduledByName: currentUser.name,
      ...interviewData
    };
    updateRecruiter((prev) => ({
      ...prev,
      interviews: [newInterview, ...prev.interviews],
      applications: prev.applications.map(a =>
        a.candidateId === interviewData.candidateId || a.candidateName === interviewData.candidateName
          ? { ...a, status: 'INTERVIEW' }
          : a
      )
    }));
    dispatchRecruiterEvent({
      eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_INTERVIEW_SCHEDULED,
      recruiterEmail: currentUser.email,
      recipientName: currentUser.name,
      addNotification,
      notification: {
        category: 'INTERVIEW',
        title: `Interview Scheduled: ${interviewData.candidateName || 'Candidate'}`,
        message: `Interview scheduled with ${interviewData.candidateName || 'Candidate'} on ${interviewData.date || 'upcoming date'} at ${interviewData.time || 'scheduled time'}. Format: ${interviewData.type || 'Online'}.`,
        link: '/recruiter/interviews',
        meta: {
          interviewId: newInterview.id,
          candidateName: interviewData.candidateName,
          date: interviewData.date,
          time: interviewData.time,
          format: interviewData.type || 'Online',
        }
      },
      meta: {
        interviewId: newInterview.id,
        candidateName: interviewData.candidateName,
        date: interviewData.date,
        time: interviewData.time,
      }
    });
    return newInterview;
  };

  // Reschedule Interview
  const rescheduleInterview = (interviewId, newSchedule) => {
    updateRecruiter((prev) => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId ? { ...i, ...newSchedule, status: 'RESCHEDULED' } : i
      )
    }));
  };

  // Cancel Interview
  const cancelInterview = (interviewId) => {
    updateRecruiter((prev) => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId ? { ...i, status: 'CANCELLED' } : i
      )
    }));
  };

  // Update Interview Status (e.g. COMPLETED)
  const updateInterviewStatus = (interviewId, newStatus) => {
    updateRecruiter((prev) => ({
      ...prev,
      interviews: prev.interviews.map(i =>
        i.id === interviewId ? { ...i, status: newStatus } : i
      )
    }));
  };

  // Update Company Profile

  const updateCompanyProfile = (companyData) => {
    updateRecruiter((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        ...companyData
      }
    }));
  };

  // Register Job Mela
  const registerJobMela = (melaData) => {
    const newMela = {
      id: `mela-${Date.now()}`,
      participationStatus: 'PENDING',
      boothNumber: 'Awaiting Admin Allocation',
      registeredCandidatesAtBooth: 0,
      spotInterviewsConducted: 0,
      spotOffersGiven: 0,
      candidatesQueue: [],
      registeredBy: currentUser.id,
      ...melaData
    };
    updateRecruiter((prev) => ({
      ...prev,
      jobMelas: [newMela, ...prev.jobMelas]
    }));
  };

  // Update Settings
  const updateSettings = (settingsData) => {
    if (settingsData.profile) {
      // Also update currentUser in userAccounts
      setUserAccounts((prev) =>
        prev.map((u) => (u.id === activeUserId ? { ...u, ...settingsData.profile } : u))
      );
    }
    updateRecruiter((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settingsData
      }
    }));
  };

  // Summary statistics for company dashboard
  const stats = {
    activeJobs: currentRecruiter.jobs.filter(j => j.status === 'PUBLISHED').length,
    pendingJobs: currentRecruiter.jobs.filter(j => j.status === 'PENDING').length,
    totalApplicants: currentRecruiter.applications.length,
    shortlisted: currentRecruiter.applications.filter(a => a.status === 'SHORTLISTED').length,
    interviews: currentRecruiter.interviews.filter(i => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED').length,
    selectedHired: currentRecruiter.applications.filter(a => a.status === 'SELECTED').length || 6,
  };

  return (
    <RecruiterContext.Provider
      value={{
        recruiter: currentRecruiter,
        currentUser,
        currentCompany,
        userAccounts,
        invitations,
        activeRecruiterId: activeCompanyId,
        activeUserId,
        isRecruiterLoggedIn,
        stats,
        loginRecruiter,
        logoutRecruiter,
        switchRecruiter,
        updateRecruiter,
        createJob,
        updateJob,
        closeJob,
        createInternship,
        shortlistCandidate,
        rejectCandidate,
        scheduleInterview,
        rescheduleInterview,
        cancelInterview,
        updateInterviewStatus,
        updateCompanyProfile,

        registerJobMela,
        updateSettings,
        inviteTeamMember,
        removeTeamMember,
        getInvitationByToken,
        acceptInvitation,
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
}

export function useRecruiter() {
  const context = useContext(RecruiterContext);
  if (!context) {
    throw new Error('useRecruiter must be used within a RecruiterProvider');
  }
  return context;
}

