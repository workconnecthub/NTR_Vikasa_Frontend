import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Search, Filter, Eye, ShieldAlert, ShieldCheck,
  Mail, Phone, MapPin, GraduationCap, Briefcase, FileText,
  CheckCircle2, XCircle, AlertTriangle, Sparkles, Calendar, Ticket,
  Download, FileSpreadsheet, Plus, Award, Building2, UserPlus, Check, X,
  Layers, School, CheckCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, exportToCSV, generatePDFBlob, getExportFilename, exportCandidateDossierPDF } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import { useAdmin, REFERENCE_ADMINS, NTR_MANDALS } from '../../context/AdminContext';
import { useCandidate } from '../../context/CandidateContext';
import {
  isJobMelaApplication,
  getApplicationNumber,
  getApplicationType,
  getJobMelaDetails,
  normalizeApplication
} from '../../utils/applicationUtils';

// Consolidated Pages
import AdminApplicationsPage from './ApplicationsPage';
import AdminRegistrationsPage from './RegistrationsPage';

export default function AdminCandidatesPage() {
  const { addToast } = useToast();
  const {
    candidates,
    companies = [],
    suspendCandidate,
    activateCandidate,
    addCandidate,
    updateCandidatePlacement
  } = useAdmin();
  const { allCandidateApplications = [] } = useCandidate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const validTabs = ['candidates', 'applications', 'registrations'];
  const currentTab = validTabs.includes(tabParam) ? tabParam : 'candidates';

  const [activeSection, setActiveSection] = useState(currentTab);

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveSection(tabParam);
    } else if (!tabParam) {
      setActiveSection('candidates');
    }
  }, [tabParam]);

  const handleTabChange = (tabKey) => {
    setActiveSection(tabKey);
    if (tabKey === 'candidates') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabKey });
    }
  };

  const [search, setSearch] = useState('');
  // MAIN FILTER: Placement Status (ALL, PLACED, NOT_PLACED)
  const [placementFilter, setPlacementFilter] = useState('ALL');
  // QUALIFICATION FILTER: ALL, 10TH (separate), INTER (separate), UG_PG (combined in one filter)
  const [qualificationFilter, setQualificationFilter] = useState('ALL');
  // ADDRESS / MANDAL FILTER: NTR Mandals
  const [mandalFilter, setMandalFilter] = useState('ALL');
  // REFERENCE DROPDOWN FILTER: Reference Admin
  const [referenceFilter, setReferenceFilter] = useState('ALL');
  // ACCOUNT STATUS: ALL, ACTIVE, SUSPENDED
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Candidate Profile Modal
  const [selectedCand, setSelectedCand] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Suspend Dialog
  const [suspendTarget, setSuspendTarget] = useState(null);

  // Add Candidate Modal State - Streamlined to KYC & Basic Registration as requested
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    aadhaarNumber: '',
    referenceAdmin: REFERENCE_ADMINS[0] || 'Admin User (State Operations)',
    customReferrer: '',
    placementStatus: 'NOT_PLACED',
    selectedCompanyKey: '',
    customCompany: '',
    placedRole: '',
    placedSalary: ''
  });

  // Update Placement Modal State
  const [placementModalOpen, setPlacementModalOpen] = useState(false);
  const [placementTarget, setPlacementTarget] = useState(null);
  const [placementForm, setPlacementForm] = useState({
    placementStatus: 'PLACED',
    placedCompany: '',
    placedRole: '',
    placedSalary: '',
    placedDate: new Date().toISOString().slice(0, 10)
  });

  // Helper matching qualification
  const matchesQualification = (c, filter) => {
    if (filter === 'ALL') return true;
    const level = (c.qualificationLevel || '').toUpperCase();
    const edu = (c.education || '').toLowerCase();

    if (filter === '10TH') {
      return level === '10TH' || edu.includes('10th') || edu.includes('ssc') || edu.includes('secondary school');
    }
    if (filter === 'INTER') {
      return level === 'INTER' || edu.includes('inter') || edu.includes('10+2') || edu.includes('diploma') || edu.includes('intermediate');
    }
    if (filter === 'UG_PG') {
      return level === 'UG' || level === 'PG' || level === 'UG_PG' ||
        edu.includes('b.tech') || edu.includes('b.e') || edu.includes('b.sc') || edu.includes('b.com') || edu.includes('ba') || edu.includes('bba') || edu.includes('bca') ||
        edu.includes('m.tech') || edu.includes('mba') || edu.includes('mca') || edu.includes('m.sc') || edu.includes('m.com') || edu.includes('degree') || edu.includes('graduate') || edu.includes('master');
    }
    return true;
  };

  // Helper matching placement status
  const matchesPlacement = (c, filter) => {
    if (filter === 'ALL') return true;
    const isPlaced = c.placementStatus === 'PLACED' || Boolean(c.placedCompany);
    if (filter === 'PLACED') return isPlaced;
    if (filter === 'NOT_PLACED') return !isPlaced;
    return true;
  };

  // Statistical summary computed dynamically
  const stats = useMemo(() => {
    const total = candidates.length;
    const placed = candidates.filter(c => c.placementStatus === 'PLACED' || Boolean(c.placedCompany)).length;
    const sscList = candidates.filter(c => matchesQualification(c, '10TH'));
    const sscPlaced = sscList.filter(c => c.placementStatus === 'PLACED' || Boolean(c.placedCompany)).length;
    const interList = candidates.filter(c => matchesQualification(c, 'INTER'));
    const interPlaced = interList.filter(c => c.placementStatus === 'PLACED' || Boolean(c.placedCompany)).length;
    const ugPgList = candidates.filter(c => matchesQualification(c, 'UG_PG'));
    const ugPgPlaced = ugPgList.filter(c => c.placementStatus === 'PLACED' || Boolean(c.placedCompany)).length;

    return {
      total,
      placed,
      placedPct: total > 0 ? Math.round((placed / total) * 100) : 0,
      sscTotal: sscList.length,
      sscPlaced,
      interTotal: interList.length,
      interPlaced,
      ugPgTotal: ugPgList.length,
      ugPgPlaced
    };
  }, [candidates]);

  // Derive all submitted applications for the selected candidate
  const candidateAppsList = useMemo(() => {
    if (!selectedCand) return [];
    const matches = allCandidateApplications.filter(ca =>
      (ca.candidateId && ca.candidateId === selectedCand.id) ||
      (ca.candidateEmail && ca.candidateEmail.toLowerCase() === selectedCand.email?.toLowerCase()) ||
      (ca.candidateName && ca.candidateName.toLowerCase() === selectedCand.name?.toLowerCase())
    );

    if (matches.length > 0) {
      return matches.map(app => normalizeApplication(app));
    }

    if (Array.isArray(selectedCand.applications)) {
      return selectedCand.applications.map(app => normalizeApplication(app, selectedCand));
    }

    return [];
  }, [selectedCand, allCandidateApplications]);

  // Comprehensive Filtering
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      // 1. Comprehensive Search query across all fields (Name, Phone, Village, Mandal, Email, Aadhaar, ID, Company, Reference)
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesEmail = c.email?.toLowerCase().includes(q);
        const matchesHeadline = c.headline?.toLowerCase().includes(q);
        const matchesPhone = c.phone?.replace(/[\s\-\+]/g, '').includes(q.replace(/[\s\-\+]/g, '')) || c.phone?.toLowerCase().includes(q);
        const matchesMandal = c.mandal?.toLowerCase().includes(q);
        const matchesVillage = c.village?.toLowerCase().includes(q);
        const matchesDistrict = c.district?.toLowerCase().includes(q);
        const matchesLocation = c.location?.toLowerCase().includes(q);
        const matchesCompany = c.placedCompany?.toLowerCase().includes(q);
        const matchesRole = c.placedRole?.toLowerCase().includes(q);
        const matchesReference = c.referenceAdmin?.toLowerCase().includes(q);
        const matchesEdu = c.education?.toLowerCase().includes(q);
        const matchesAadhaar = c.aadhaarNumber?.replace(/[\s\-]/g, '').includes(q.replace(/[\s\-]/g, ''));
        const matchesId = c.id?.toLowerCase().includes(q) || c.studentId?.toLowerCase().includes(q);
        const matchesSkills = c.skills?.some((s) => s.toLowerCase().includes(q));

        if (!matchesName && !matchesEmail && !matchesHeadline && !matchesPhone &&
            !matchesMandal && !matchesVillage && !matchesDistrict && !matchesLocation &&
            !matchesCompany && !matchesRole && !matchesReference &&
            !matchesEdu && !matchesAadhaar && !matchesId && !matchesSkills) {
          return false;
        }
      }

      // 2. Main Placement Filter (User requirement: main filter should be for placed students)
      if (!matchesPlacement(c, placementFilter)) return false;

      // 3. Qualification Filter (User requirement: 10th separate, inter separate, UG & PG combined in one filter)
      if (!matchesQualification(c, qualificationFilter)) return false;

      // 4. Mandal Filter (User requirement: address of student / village / mandal eligibility)
      if (mandalFilter !== 'ALL') {
        const cMandal = (c.mandal || '').trim().toLowerCase();
        const cLoc = (c.location || '').trim().toLowerCase();
        const targetMandal = mandalFilter.trim().toLowerCase();
        if (cMandal !== targetMandal && !cLoc.includes(targetMandal)) {
          return false;
        }
      }

      // 5. Reference Dropdown Filter (User requirement: students can manually add admin with reference dropdown)
      if (referenceFilter !== 'ALL') {
        if ((c.referenceAdmin || '').trim().toLowerCase() !== referenceFilter.trim().toLowerCase()) {
          return false;
        }
      }

      // 6. Account Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE' && c.accountStatus !== 'ACTIVE') return false;
        if (statusFilter === 'SUSPENDED' && c.accountStatus !== 'SUSPENDED') return false;
      }

      return true;
    });
  }, [candidates, search, placementFilter, qualificationFilter, mandalFilter, referenceFilter, statusFilter]);

  // Pagination State with selectable rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, placementFilter, qualificationFilter, mandalFilter, referenceFilter, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleActivate = async (c) => {
    try {
      await activateCandidate(c.id);
      addToast(`${c.name}'s account is now ACTIVE.`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to activate candidate', 'error');
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await suspendCandidate(suspendTarget.id);
      addToast(`Candidate account for ${suspendTarget.name} has been SUSPENDED.`, 'error');
      setSuspendTarget(null);
    } catch (err) {
      addToast(err.message || 'Failed to suspend candidate', 'error');
    }
  };

  // Add Candidate Submit Handler (Streamlined KYC & Identity - fast registration)
  const handleAddCandidateSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.phone.trim()) {
      addToast('Please enter Candidate Full Name, Email, and Mobile Phone Number.', 'error');
      return;
    }

    // Clean and validate Aadhaar Number
    const rawAadhaar = addForm.aadhaarNumber.replace(/[\s\-]/g, '');
    if (!rawAadhaar) {
      addToast('Please enter Candidate 12-digit Aadhaar Card Number.', 'error');
      return;
    }
    if (rawAadhaar.length !== 12 || !/^\d{12}$/.test(rawAadhaar)) {
      addToast('Aadhaar Number must be exactly 12 numeric digits (e.g. 1234 5678 9012).', 'error');
      return;
    }
    const formattedAadhaar = rawAadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');

    // Handle Reference Admin ("Other" support)
    const finalReference = addForm.referenceAdmin === 'Other'
      ? (addForm.customReferrer.trim() || 'Other Reference')
      : addForm.referenceAdmin;

    // Handle Placement Company (Database check)
    let finalPlacedCompany = '';
    let isCompanyInDatabase = false;
    if (addForm.placementStatus === 'PLACED') {
      if (addForm.selectedCompanyKey === 'OTHER') {
        finalPlacedCompany = addForm.customCompany.trim() || 'External Company';
        isCompanyInDatabase = false;
      } else {
        const found = companies.find(comp => comp.id === addForm.selectedCompanyKey || comp.name === addForm.selectedCompanyKey);
        finalPlacedCompany = found ? found.name : (addForm.selectedCompanyKey || companies[0]?.name || 'NTR Vikasa Partner');
        isCompanyInDatabase = Boolean(found);
      }
    }

    try {
      setIsSubmitting(true);
      const newCandidate = await addCandidate({
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        gender: addForm.gender,
        aadhaarNumber: formattedAadhaar,
        referenceAdmin: finalReference,
        customReferrer: addForm.referenceAdmin === 'Other' ? addForm.customReferrer.trim() : null,
        placementStatus: addForm.placementStatus,
        placedCompany: finalPlacedCompany,
        isCompanyInDatabase,
        placedRole: addForm.placementStatus === 'PLACED' ? addForm.placedRole.trim() : '',
        placedSalary: addForm.placementStatus === 'PLACED' ? addForm.placedSalary.trim() : '',
        profileStatus: 'BASIC_REGISTERED',
        profileCompletion: 35
      });

      addToast(`Candidate ${newCandidate.name} successfully registered! Student can log in to complete 100% profile.`, 'success');
      setAddModalOpen(false);

      // Reset Form
      setAddForm({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        aadhaarNumber: '',
        referenceAdmin: REFERENCE_ADMINS[0] || 'Admin User (State Operations)',
        customReferrer: '',
        placementStatus: 'NOT_PLACED',
        selectedCompanyKey: '',
        customCompany: '',
        placedRole: '',
        placedSalary: ''
      });
    } catch (err) {
      addToast(err.message || 'Failed to register candidate', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Placement Modal
  const handleOpenPlacementModal = (cand) => {
    setPlacementTarget(cand);
    const existingCompany = cand.placedCompany || '';
    const matchInDb = companies.find(c => c.name?.toLowerCase() === existingCompany.toLowerCase());
    setPlacementForm({
      placementStatus: cand.placementStatus || (cand.placedCompany ? 'PLACED' : 'NOT_PLACED'),
      selectedCompanyKey: matchInDb ? matchInDb.name : (existingCompany ? 'OTHER' : (companies[0]?.name || '')),
      placedCompany: matchInDb ? matchInDb.name : existingCompany,
      customCompany: matchInDb ? '' : existingCompany,
      placedRole: cand.placedRole || '',
      placedSalary: cand.placedSalary || '',
      placedDate: cand.placedDate || new Date().toISOString().slice(0, 10)
    });
    setPlacementModalOpen(true);
  };

  // Save Placement Submit Handler
  const handleSavePlacement = async (e) => {
    e.preventDefault();
    if (!placementTarget) return;

    let finalCompany = '';
    let isCompanyInDatabase = false;
    if (placementForm.placementStatus === 'PLACED') {
      if (placementForm.selectedCompanyKey === 'OTHER') {
        finalCompany = placementForm.customCompany.trim();
        isCompanyInDatabase = false;
      } else {
        const found = companies.find(c => c.name === placementForm.selectedCompanyKey);
        finalCompany = found ? found.name : (placementForm.selectedCompanyKey || placementForm.placedCompany);
        isCompanyInDatabase = Boolean(found);
      }

      if (!finalCompany) {
        addToast('Please select or enter the Placed Company Name.', 'error');
        return;
      }
    }

    try {
      await updateCandidatePlacement(placementTarget.id, {
        placementStatus: placementForm.placementStatus,
        placedCompany: placementForm.placementStatus === 'PLACED' ? finalCompany : '',
        isCompanyInDatabase,
        placedRole: placementForm.placementStatus === 'PLACED' ? placementForm.placedRole.trim() : '',
        placedSalary: placementForm.placementStatus === 'PLACED' ? placementForm.placedSalary.trim() : '',
        placedDate: placementForm.placementStatus === 'PLACED' ? placementForm.placedDate : null
      });

      addToast(`Placement details updated for ${placementTarget.name}.`, 'success');
      setPlacementModalOpen(false);
      if (selectedCand?.id === placementTarget.id) {
        setSelectedCand({
          ...selectedCand,
          placementStatus: placementForm.placementStatus,
          placedCompany: placementForm.placementStatus === 'PLACED' ? finalCompany : '',
          isCompanyInDatabase,
          placedRole: placementForm.placementStatus === 'PLACED' ? placementForm.placedRole.trim() : '',
          placedSalary: placementForm.placementStatus === 'PLACED' ? placementForm.placedSalary.trim() : '',
        });
      }
      setPlacementTarget(null);
    } catch (err) {
      addToast(err.message || 'Failed to update placement details', 'error');
    }
  };

  // Exports
  const handleExportExcel = () => {
    if (filtered.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting candidate list to Excel...', 'info');
    const headers = [
      'Candidate Name',
      'Qualification Level',
      'Education',
      'District',
      'Mandal',
      'Village',
      'Placement Status',
      'Placed Company',
      'Placed Role',
      'Salary / Package',
      'Reference Admin',
      'Email',
      'Phone',
      'Account Status'
    ];
    const rows = filtered.map(c => [
      c.name || 'N/A',
      c.qualificationLevel || 'N/A',
      c.education || 'N/A',
      c.district || 'NTR District',
      c.mandal || 'N/A',
      c.village || 'N/A',
      c.placementStatus || (c.placedCompany ? 'PLACED' : 'NOT_PLACED'),
      c.placedCompany || 'Seeking',
      c.placedRole || 'N/A',
      c.placedSalary || 'N/A',
      c.referenceAdmin || 'Direct',
      c.email || 'N/A',
      c.phone || 'N/A',
      c.accountStatus || 'ACTIVE'
    ]);
    exportToExcel({
      filename: getExportFilename('candidates', `${placementFilter}_${qualificationFilter}`.toLowerCase(), 'xlsx'),
      sheetName: 'Candidates',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportPdf = () => {
    if (filtered.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting candidate list to PDF...', 'info');
    const headers = ['Candidate', 'Qual.', 'Mandal & Village', 'Placement', 'Reference Admin', 'Phone'];
    const rows = filtered.map(c => [
      c.name || 'N/A',
      c.qualificationLevel || 'N/A',
      `${c.village ? c.village + ', ' : ''}${c.mandal || 'Vijayawada'}`,
      c.placementStatus === 'PLACED' || c.placedCompany ? `Placed: ${c.placedCompany || 'Yes'}` : 'Seeking',
      c.referenceAdmin || 'Admin Direct',
      c.phone || 'N/A'
    ]);
    exportToPDF({
      filename: getExportFilename('candidates', `${placementFilter}_${qualificationFilter}`.toLowerCase(), 'pdf'),
      title: 'Platform Candidates Directory & Placement Report',
      subtitle: `NTR Vikasa Admin Report - Placement: ${placementFilter} • Qualification: ${qualificationFilter}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Placement Filter': placementFilter,
        'Qualification Filter': qualificationFilter,
        'Mandal Filter': mandalFilter,
        'Total Records': filtered.length
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  // View Resume
  const handleViewResume = () => {
    if (!selectedCand) return;
    const resumeFileName = selectedCand.resumeName || selectedCand.resume?.fileName || (selectedCand.name ? `${selectedCand.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Candidate_Resume.pdf');
    if (selectedCand.resumeUrl) {
      window.open(selectedCand.resumeUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const headers = ['Resume Section', 'Candidate Details'];
    const rows = [
      ['Candidate Name', selectedCand.name || 'N/A'],
      ['Headline / Role', selectedCand.headline || 'Job Seeker'],
      ['Email Address', selectedCand.email || 'N/A'],
      ['Phone Number', selectedCand.phone || 'N/A'],
      ['District & Mandal', `${selectedCand.mandal || 'Vijayawada'}, ${selectedCand.district || 'NTR District'}`],
      ['Village / Ward', selectedCand.village || 'N/A'],
      ['Qualification Level', selectedCand.qualificationLevel || 'N/A'],
      ['Education Background', selectedCand.education || 'N/A'],
      ['Placement Status', selectedCand.placementStatus === 'PLACED' ? `Placed at ${selectedCand.placedCompany} (${selectedCand.placedSalary || 'Best in Industry'})` : 'Seeking Employment'],
      ['Referred By Admin', selectedCand.referenceAdmin || 'Direct Registration'],
      ['Skills & Competencies', Array.isArray(selectedCand.skills) ? selectedCand.skills.join(', ') : (selectedCand.skills || 'N/A')],
      ['Applications Submitted', `${selectedCand.applicationsCount || 0} applications submitted`],
      ['Account Status', selectedCand.accountStatus || 'ACTIVE']
    ];

    const blob = generatePDFBlob({
      filename: resumeFileName,
      title: `Candidate Curriculum Vitae: ${selectedCand.name}`,
      subtitle: `NTR Vikasa Verified Student Profile — ${selectedCand.headline || 'Candidate'}`,
      metadata: {
        'Candidate Name': selectedCand.name || 'N/A',
        'Document': resumeFileName,
        'Mandal': selectedCand.mandal || 'N/A',
        'Placement Status': selectedCand.placementStatus || 'SEEKING'
      },
      headers,
      rows
    });

    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  const handleDownloadResume = () => {
    if (!selectedCand) return;
    const resumeFileName = selectedCand.resumeName || selectedCand.resume?.fileName || (selectedCand.name ? `${selectedCand.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Candidate_Resume.pdf');
    if (selectedCand.resumeUrl) {
      const a = document.createElement('a');
      a.href = selectedCand.resumeUrl;
      a.download = resumeFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const headers = ['Resume Section', 'Candidate Details'];
    const rows = [
      ['Candidate Name', selectedCand.name || 'N/A'],
      ['Headline / Role', selectedCand.headline || 'Job Seeker'],
      ['Email Address', selectedCand.email || 'N/A'],
      ['Phone Number', selectedCand.phone || 'N/A'],
      ['District & Mandal', `${selectedCand.mandal || 'Vijayawada'}, ${selectedCand.district || 'NTR District'}`],
      ['Village / Ward', selectedCand.village || 'N/A'],
      ['Qualification Level', selectedCand.qualificationLevel || 'N/A'],
      ['Education Background', selectedCand.education || 'N/A'],
      ['Placement Status', selectedCand.placementStatus === 'PLACED' ? `Placed at ${selectedCand.placedCompany} (${selectedCand.placedSalary || 'Best in Industry'})` : 'Seeking Employment'],
      ['Referred By Admin', selectedCand.referenceAdmin || 'Direct Registration'],
      ['Skills & Competencies', Array.isArray(selectedCand.skills) ? selectedCand.skills.join(', ') : (selectedCand.skills || 'N/A')],
      ['Applications Submitted', `${selectedCand.applicationsCount || 0} applications submitted`],
      ['Account Status', selectedCand.accountStatus || 'ACTIVE']
    ];

    exportToPDF({
      filename: resumeFileName,
      title: `Candidate Curriculum Vitae: ${selectedCand.name}`,
      subtitle: `NTR Vikasa Verified Student Profile — ${selectedCand.headline || 'Candidate'}`,
      metadata: {
        'Candidate Name': selectedCand.name || 'N/A',
        'Document': resumeFileName,
        'Mandal': selectedCand.mandal || 'N/A',
        'Placement Status': selectedCand.placementStatus || 'SEEKING'
      },
      headers,
      rows
    });
    addToast(`Downloading candidate resume: ${resumeFileName}`, 'success');
  };

  // Columns definition
  const columns = [
    {
      key: 'name',
      label: 'Candidate / Student',
      sortable: true,
      render: (_, row) => {
        const isProfileComplete = row.profileCompletion === 100 || row.profileStatus === 'COMPLETE';
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-full)',
              background: row.placementStatus === 'PLACED' || row.placedCompany
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, var(--color-primary-600), #7c3aed)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 'var(--text-sm)',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              {row.name?.[0] || 'C'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{row.name}</strong>
                {isProfileComplete ? (
                  <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 7px', borderRadius: 9999, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={10} color="#059669" /> 100% Complete
                  </span>
                ) : (
                  <span style={{ fontSize: '10px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '1px 7px', borderRadius: 9999, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }} title="Student needs to log in and complete degree, skills & resume to 100%">
                    <Sparkles size={10} color="#d97706" /> Basic KYC (35%)
                  </span>
                )}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>{row.headline || 'Student / Candidate'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Mail size={11} /> {row.email}</span>
                {row.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Phone size={11} /> {row.phone}</span>}
              </div>
              {row.aadhaarNumber && (
                <div style={{ marginTop: 2 }}>
                  <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: 4, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    🆔 Aadhaar: {row.aadhaarNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'qualificationLevel',
      label: 'Qualification',
      sortable: true,
      render: (v, row) => {
        const is10th = v === '10TH' || row.education?.toLowerCase().includes('10th') || row.education?.toLowerCase().includes('ssc');
        const isInter = v === 'INTER' || row.education?.toLowerCase().includes('inter') || row.education?.toLowerCase().includes('10+2') || row.education?.toLowerCase().includes('diploma');
        const isUgPg = v === 'UG' || v === 'PG' || v === 'UG_PG' || (!is10th && !isInter);

        const badgeLabel = is10th ? '10th Class (SSC)' : isInter ? 'Intermediate / 10+2' : v === 'PG' ? 'PG / Master Degree' : 'UG / Degree';
        const badgeColor = is10th ? '#f59e0b' : isInter ? '#3b82f6' : '#8b5cf6';
        const badgeBg = is10th ? '#fffbeb' : isInter ? '#eff6ff' : '#f5f3ff';
        const badgeBorder = is10th ? '#fde68a' : isInter ? '#bfdbfe' : '#ddd6fe';

        return (
          <div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-md)',
              background: badgeBg,
              color: badgeColor,
              border: `1px solid ${badgeBorder}`
            }}>
              <GraduationCap size={12} /> {badgeLabel}
            </span>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 3, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.education}>
              {row.education || 'Pending candidate profile update'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'address',
      label: 'Address Origin (Mandal & Village)',
      render: (_, row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--color-text)' }}>
            <MapPin size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
            <span>{row.mandal || 'Vijayawada Urban'}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginTop: 1 }}>
            Village / Ward: <strong>{row.village || 'Central'}</strong>
          </span>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
            {row.district || 'NTR District'}, AP
          </span>
        </div>
      )
    },
    {
      key: 'placementStatus',
      label: 'Placement Status',
      sortable: true,
      render: (v, row) => {
        const isPlaced = v === 'PLACED' || Boolean(row.placedCompany);
        // Check if placed company exists in our database
        const isDbPartner = row.isCompanyInDatabase || companies.some(comp => comp.name?.toLowerCase() === row.placedCompany?.toLowerCase());

        return (
          <div>
            {isPlaced ? (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-block',
                maxWidth: 220
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: '11px' }}>
                    <Award size={13} style={{ color: '#059669' }} /> PLACED
                  </span>
                  {isDbPartner ? (
                    <span style={{ fontSize: '9px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                      DB Partner
                    </span>
                  ) : (
                    <span style={{ fontSize: '9px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                      External
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, marginTop: 3, color: '#0f172a' }}>
                  🏢 {row.placedCompany}
                </div>
                {row.placedRole && (
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: 1 }}>
                    💼 {row.placedRole}
                  </div>
                )}
                {row.placedSalary && (
                  <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, marginTop: 1 }}>
                    💰 {row.placedSalary}
                  </div>
                )}
              </div>
            ) : (
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <Briefcase size={12} /> Seeking Employment
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'referenceAdmin',
      label: 'Admin Reference',
      render: (v) => (
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          background: '#f8fafc',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          padding: '4px 9px',
          borderRadius: 'var(--radius-md)',
          display: 'inline-block',
          maxWidth: 180,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }} title={v || 'Direct Registration'}>
          👤 {v || 'Direct Registration'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            size="xs"
            variant="outline"
            leftIcon={<Eye size={12} />}
            onClick={() => {
              setSelectedCand(row);
              setProfileModalOpen(true);
            }}
          >
            View
          </Button>

          <Button
            size="xs"
            variant="secondary"
            leftIcon={<Award size={12} />}
            onClick={() => handleOpenPlacementModal(row)}
            title="Update placement status and company"
          >
            Placement
          </Button>

          <Button
            size="xs"
            variant="outline"
            leftIcon={<Download size={12} />}
            onClick={() => {
              exportCandidateDossierPDF(row);
              addToast(`Downloading verified candidate dossier for ${row.name}...`, 'success');
            }}
            title="Download Candidate Dossier (PDF)"
          >
            PDF
          </Button>

          {row.accountStatus === 'ACTIVE' ? (
            <Button
              size="xs"
              variant="danger"
              onClick={() => setSuspendTarget(row)}
            >
              Suspend
            </Button>
          ) : (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => handleActivate(row)}
            >
              Activate
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="admin-candidates-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* ── 0. Consolidated Navigation Tabs (Candidates | Applications | Job Mela Registrations) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        background: 'var(--color-surface)',
        padding: '6px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        width: 'fit-content',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => handleTabChange('candidates')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeSection === 'candidates' ? 'var(--color-primary-600)' : 'transparent',
            color: activeSection === 'candidates' ? '#fff' : 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSection === 'candidates' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 150ms ease'
          }}
        >
          <Users size={16} /> Candidates / Students
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('applications')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeSection === 'applications' ? 'var(--color-primary-600)' : 'transparent',
            color: activeSection === 'applications' ? '#fff' : 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSection === 'applications' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 150ms ease'
          }}
        >
          <FileText size={16} /> Applications
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('registrations')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeSection === 'registrations' ? 'var(--color-primary-600)' : 'transparent',
            color: activeSection === 'registrations' ? '#fff' : 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: activeSection === 'registrations' ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 150ms ease'
          }}
        >
          <Ticket size={16} /> Job Mela Registrations
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeSection === 'applications' ? (
        <AdminApplicationsPage />
      ) : activeSection === 'registrations' ? (
        <AdminRegistrationsPage />
      ) : (
        <>
          {/* Header Bar */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                  <Users size={22} style={{ color: 'var(--color-primary-600)' }} />
                  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Student & Candidate Management</h1>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                  Manage students, record admin references, track 10th/Inter/UG/PG qualifications, and monitor student placements across NTR District.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<UserPlus size={16} />}
                  onClick={() => setAddModalOpen(true)}
                >
                  + Add Student / Candidate
                </Button>

                <ExportDropdown
                  onExportExcel={handleExportExcel}
                  onExportPdf={handleExportPdf}
                  disabled={filtered.length === 0}
                />
              </div>
            </div>
          </div>

          {/* ── Statistics / KPI Cards (Total, Placed %, 10th, Inter, UG & PG) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'var(--space-4)' }}>
            {/* Card 1: Total Candidates */}
            <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--color-primary-600)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>Total Registered</span>
                <Users size={16} style={{ color: 'var(--color-primary-600)' }} />
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)', marginTop: 'var(--space-1)' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Students in NTR District
              </div>
            </div>

            {/* Card 2: Main Filter Metric - Placed Students */}
            <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid #059669', background: '#f0fdf4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#065f46', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase' }}>
                <span>Placed Students</span>
                <Award size={16} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#065f46', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                {stats.placed} <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#059669' }}>({stats.placedPct}% Success)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#047857', marginTop: 2 }}>
                Verified by Employers
              </div>
            </div>

            {/* Card 3: 10th Class (SSC) */}
            <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>10th Class (SSC)</span>
                <School size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)', marginTop: 'var(--space-1)' }}>
                {stats.sscTotal}
              </div>
              <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, marginTop: 2 }}>
                🎉 {stats.sscPlaced} Placed in Logistics/Retail
              </div>
            </div>

            {/* Card 4: Intermediate */}
            <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>Intermediate / 10+2</span>
                <Layers size={16} style={{ color: '#3b82f6' }} />
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)', marginTop: 'var(--space-1)' }}>
                {stats.interTotal}
              </div>
              <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600, marginTop: 2 }}>
                🎉 {stats.interPlaced} Placed in Support/Services
              </div>
            </div>

            {/* Card 5: UG & PG (Combined in one filter) */}
            <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                <span>UG & PG Graduates</span>
                <GraduationCap size={16} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-text)', marginTop: 'var(--space-1)' }}>
                {stats.ugPgTotal}
              </div>
              <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600, marginTop: 2 }}>
                🎉 {stats.ugPgPlaced} Placed in IT/Finance/Mfg
              </div>
            </div>
          </div>

          {/* ── Advanced Search & Precise Filter Panel ── */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

              {/* Row 1: Search & Primary Placement Tabs (MAIN FILTER) */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Multi-Field Search Bar */}
                <div style={{ position: 'relative', flex: '1 1 360px', maxWidth: 520 }}>
                  <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search name, phone, village, mandal, email, Aadhaar, company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', paddingLeft: 38, paddingRight: search ? 36 : 14, height: 42, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)' }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}
                      title="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* MAIN FILTER: Placement Status Buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginRight: 4 }}>
                    Main Filter:
                  </span>
                  {[
                    { key: 'ALL', label: `All Candidates (${stats.total})` },
                    { key: 'PLACED', label: `🎉 Placed Only (${stats.placed})` },
                    { key: 'NOT_PLACED', label: `Seeking Employment (${stats.total - stats.placed})` }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setPlacementFilter(tab.key)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: placementFilter === tab.key ? '1px solid #059669' : '1px solid var(--color-border)',
                        background: placementFilter === tab.key ? '#059669' : 'var(--color-surface)',
                        color: placementFilter === tab.key ? '#fff' : 'var(--color-text)',
                        boxShadow: placementFilter === tab.key ? '0 2px 6px rgba(5, 150, 105, 0.25)' : 'none',
                        transition: 'all 150ms ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Secondary Exact Filters (Qualification, Mandal, Reference Admin, Status) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)'
              }}>
                {/* 1. Qualification Filter: 10th separate, Inter separate, UG & PG combined in one filter */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                    <GraduationCap size={13} style={{ color: '#8b5cf6' }} /> Qualification Tier
                  </label>
                  <select
                    className="form-control"
                    value={qualificationFilter}
                    onChange={(e) => setQualificationFilter(e.target.value)}
                    style={{ width: '100%', height: 38, fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="ALL">All Qualifications</option>
                    <option value="10TH">10th Class (SSC Only)</option>
                    <option value="INTER">Intermediate / 10+2 / Diploma Only</option>
                    <option value="UG_PG">UG & PG Degree / Master's (Combined)</option>
                  </select>
                </div>

                {/* 2. Mandal Filter (Address student where students are from) */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                    <MapPin size={13} style={{ color: 'var(--color-primary-600)' }} /> Address Mandal (NTR District)
                  </label>
                  <select
                    className="form-control"
                    value={mandalFilter}
                    onChange={(e) => setMandalFilter(e.target.value)}
                    style={{ width: '100%', height: 38, fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="ALL">All 17 Mandals</option>
                    {NTR_MANDALS.map((m) => (
                      <option key={m} value={m}>{m} Mandal</option>
                    ))}
                  </select>
                </div>

                {/* 3. Reference Admin Dropdown Filter */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                    <Users size={13} style={{ color: '#059669' }} /> Referred Admin / Officer
                  </label>
                  <select
                    className="form-control"
                    value={referenceFilter}
                    onChange={(e) => setReferenceFilter(e.target.value)}
                    style={{ width: '100%', height: 38, fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="ALL">All Admin References</option>
                    {REFERENCE_ADMINS.map((ref) => (
                      <option key={ref} value={ref}>{ref}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Account Status Filter */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                    <ShieldCheck size={13} style={{ color: '#2563eb' }} /> Account Status
                  </label>
                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '100%', height: 38, fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="SUSPENDED">Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Summary Pills */}
              {(placementFilter !== 'ALL' || qualificationFilter !== 'ALL' || mandalFilter !== 'ALL' || referenceFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', paddingTop: 2 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Active Filters:</span>
                  {placementFilter !== 'ALL' && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                      Placement: {placementFilter === 'PLACED' ? 'Placed Only' : 'Seeking'}
                    </span>
                  )}
                  {qualificationFilter !== 'ALL' && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      Qualification: {qualificationFilter === '10TH' ? '10th Class' : qualificationFilter === 'INTER' ? 'Intermediate' : 'UG & PG Combined'}
                    </span>
                  )}
                  {mandalFilter !== 'ALL' && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
                      Mandal: {mandalFilter}
                    </span>
                  )}
                  {referenceFilter !== 'ALL' && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#f8fafc', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                      Admin: {referenceFilter}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPlacementFilter('ALL');
                      setQualificationFilter('ALL');
                      setMandalFilter('ALL');
                      setReferenceFilter('ALL');
                      setStatusFilter('ALL');
                      setSearch('');
                    }}
                    style={{ fontSize: '11px', color: 'var(--color-primary-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    Reset All Filters
                  </button>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    Showing {filtered.length} of {candidates.length} candidates
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Users size={40} />}
                title="No Candidates Found"
                description="No candidate records match your current placement, qualification, and mandal filter criteria."
              />
            ) : (
              <>
                <Table columns={columns} data={paginatedCandidates} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSize={pageSize}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  itemName="candidates"
                />
              </>
            )}
          </div>

          {/* ── 1. Candidate Full Profile Modal ── */}
          {profileModalOpen && selectedCand && (
            <Modal
              isOpen={profileModalOpen}
              onClose={() => setProfileModalOpen(false)}
              title={`Candidate Profile: ${selectedCand.name}`}
              size="lg"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Header Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  background: selectedCand.placementStatus === 'PLACED' || selectedCand.placedCompany
                    ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
                    : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                  color: '#fff',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)'
                }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 800
                  }}>
                    {selectedCand.name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#fff' }}>{selectedCand.name}</h3>
                      {selectedCand.placementStatus === 'PLACED' || selectedCand.placedCompany ? (
                        <span style={{ fontSize: '11px', background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                          ✓ PLACED at {selectedCand.placedCompany}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', color: '#e0e7ff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          Seeking Employment
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: '#c7d2fe', margin: '2px 0 0 0' }}>{selectedCand.headline}</p>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: '11px', color: '#e0e7ff', flexWrap: 'wrap' }}>
                      <span>📍 Mandal: {selectedCand.mandal || 'Vijayawada'} (Village: {selectedCand.village || 'Central'})</span>
                      <span>🎓 Level: {selectedCand.qualificationLevel || 'Degree'}</span>
                      <span>👤 Referred by: {selectedCand.referenceAdmin || 'Admin Direct'}</span>
                    </div>
                  </div>
                </div>

                {/* Candidate Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                      Contact & Origin Address
                    </h4>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Email:</strong> {selectedCand.email}</p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Phone:</strong> {selectedCand.phone || '+91 98765 43210'}</p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>District:</strong> {selectedCand.district || 'NTR District'}</p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Mandal:</strong> {selectedCand.mandal || 'Vijayawada'}</p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0 }}><strong>Village / Ward:</strong> {selectedCand.village || 'Central'}</p>
                  </div>

                  <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                      Education & Placement
                    </h4>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                      <strong>Tier:</strong> {selectedCand.qualificationLevel === '10TH' ? '10th Class (SSC)' : selectedCand.qualificationLevel === 'INTER' ? 'Intermediate / 10+2' : 'UG & PG Degree'}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Education:</strong> {selectedCand.education}</p>
                    <p style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}><strong>Reference Admin:</strong> {selectedCand.referenceAdmin || 'Direct'}</p>
                    {selectedCand.placementStatus === 'PLACED' || selectedCand.placedCompany ? (
                      <div style={{ marginTop: 6, background: '#ecfdf5', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                        <p style={{ fontSize: 'var(--text-xs)', color: '#065f46', margin: '0 0 2px 0', fontWeight: 700 }}>
                          Placed at: {selectedCand.placedCompany}
                        </p>
                        <p style={{ fontSize: '11px', color: '#047857', margin: 0 }}>
                          Role: {selectedCand.placedRole || 'Specialist'} • Salary: {selectedCand.placedSalary || 'Standard'}
                        </p>
                      </div>
                    ) : (
                      <p style={{ fontSize: 'var(--text-xs)', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                        <strong>Status:</strong> Seeking Placement
                      </p>
                    )}
                  </div>
                </div>

                {/* Resume Section */}
                {(() => {
                  const resumeFileName = selectedCand.resumeName || selectedCand.resume?.fileName || (selectedCand.name ? `${selectedCand.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Candidate_Resume.pdf');

                  return (
                    <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                        Candidate Resume / CV
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 'var(--space-3)',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3) var(--space-4)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 200 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--radius-md)',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'block' }}>
                              {resumeFileName}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              Verified Candidate Document
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<Eye size={13} />}
                            onClick={handleViewResume}
                          >
                            View Resume
                          </Button>
                          <Button
                            size="xs"
                            variant="secondary"
                            leftIcon={<Download size={13} />}
                            onClick={handleDownloadResume}
                          >
                            Download Resume
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Skills */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                    Skills & Competencies
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {selectedCand.skills?.map((skill) => (
                      <span key={skill} style={{
                        background: 'var(--color-primary-50)',
                        color: 'var(--color-primary-700)',
                        border: '1px solid var(--color-primary-200)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submitted Applications History */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }}>
                      Submitted Applications ({candidateAppsList.length})
                    </h4>
                  </div>

                  {candidateAppsList.length === 0 ? (
                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                      No active job applications found for this candidate.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {candidateAppsList.map((app) => (
                        <div
                          key={app.id || app.appNumber}
                          style={{
                            background: app.isMela ? '#fbf8ff' : 'var(--color-surface)',
                            border: `1px solid ${app.isMela ? '#e9d5ff' : 'var(--color-border)'}`,
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 'var(--space-2)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                fontSize: 'var(--text-xs)',
                                background: app.isMela ? '#f5f3ff' : '#eff6ff',
                                color: app.isMela ? '#6d28d9' : '#1d4ed8',
                                border: `1px solid ${app.isMela ? '#ddd6fe' : '#bfdbfe'}`,
                                padding: '2px 7px',
                                borderRadius: '4px',
                                letterSpacing: '0.03em'
                              }}>
                                {app.appNumber || getApplicationNumber(app)}
                              </span>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '10px',
                                background: app.isMela ? '#ecfdf5' : '#f1f5f9',
                                color: app.isMela ? '#047857' : 'var(--color-text-muted)',
                                border: `1px solid ${app.isMela ? '#a7f3d0' : '#e2e8f0'}`
                              }}>
                                {app.applicationType || (app.isMela ? 'Job Mela Application' : 'Direct Job Application')}
                              </span>
                            </div>
                            <div style={{ marginTop: 4 }}>
                              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                                {app.jobTitle || app.title || app.job || 'Position'}
                              </strong>
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 6 }}>
                                at <strong style={{ color: 'var(--color-text)' }}>{app.company}</strong>
                              </span>
                            </div>
                          </div>
                          <div>
                            <StatusBadge status={app.status || 'APPLIED'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 'var(--space-4)'
                }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="primary"
                      leftIcon={<Download size={14} />}
                      onClick={() => {
                        exportCandidateDossierPDF(selectedCand);
                        addToast(`Downloading verified candidate dossier for ${selectedCand.name}...`, 'success');
                      }}
                    >
                      Download Dossier (PDF)
                    </Button>
                    <Button
                      variant="secondary"
                      leftIcon={<Award size={14} />}
                      onClick={() => {
                        setProfileModalOpen(false);
                        handleOpenPlacementModal(selectedCand);
                      }}
                    >
                      Update Placement
                    </Button>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <Button variant="outline" onClick={() => setProfileModalOpen(false)}>
                      Close
                    </Button>
                    {selectedCand.accountStatus === 'ACTIVE' ? (
                      <Button
                        variant="danger"
                        onClick={() => {
                          setProfileModalOpen(false);
                          setSuspendTarget(selectedCand);
                        }}
                      >
                        Suspend Account
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleActivate(selectedCand);
                          setSelectedCand({ ...selectedCand, accountStatus: 'ACTIVE' });
                        }}
                      >
                        Activate Account
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {/* ── 2. Add Student / Candidate Modal (Streamlined KYC & Identity Registration) ── */}
          {addModalOpen && (
            <Modal
              isOpen={addModalOpen}
              onClose={() => setAddModalOpen(false)}
              title="Manually Add Student / Candidate"
              size="lg"
            >
              <form onSubmit={handleAddCandidateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Onboarding Guidance Strip */}
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-3) var(--space-4)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)'
                }}>
                  <Sparkles size={18} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 'var(--text-xs)', color: '#334155', lineHeight: 1.5 }}>
                    <strong style={{ color: '#1e3a8a', display: 'block', marginBottom: 2 }}>
                      Streamlined Admin Onboarding (KYC & Identity)
                    </strong>
                    Enter the student's essential identity details (Name, Email, Mobile, Gender, and 12-digit Aadhaar). Once registered, the candidate can log in using their credentials to complete their profile (degree, skills & resume) to 100%.
                  </div>
                </div>

                {/* Row 1: Student Full Name & Email Address */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <FormField label="Student Full Name" required>
                    <Input
                      placeholder="e.g. Ramesh Babu"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      required
                    />
                  </FormField>

                  <FormField label="Email Address" required>
                    <Input
                      type="email"
                      placeholder="e.g. ramesh.babu@example.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                {/* Row 2: Mobile Phone Number & Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <FormField label="Mobile Phone Number" required>
                    <Input
                      type="tel"
                      placeholder="+91 98480 12345"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      required
                    />
                  </FormField>

                  <FormField label="Gender" required>
                    <Select
                      options={['Male', 'Female', 'Other']}
                      value={addForm.gender}
                      onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                    />
                  </FormField>
                </div>

                {/* Row 3: 12-digit Aadhaar Card Number */}
                <FormField
                  label="Aadhaar Card Number (12 Digits)"
                  required
                  hint="UIDAI verified 12-digit national identity (e.g. 9848 1234 5678)"
                >
                  <Input
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={14}
                    value={addForm.aadhaarNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setAddForm({ ...addForm, aadhaarNumber: formatted });
                    }}
                    required
                  />
                </FormField>

                {/* Row 4: Referring Admin / Officer (Reference Dropdown + 'Other') */}
                <div style={{ background: '#f5f3ff', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid #ddd6fe' }}>
                  <FormField
                    label="Referring Admin / Officer (Reference Dropdown)"
                    required
                    hint="Select the Admin, Super Admin, Mandal Nodal Officer, or choose 'Other' to specify custom referrer"
                  >
                    <Select
                      options={[
                        ...REFERENCE_ADMINS,
                        'Other'
                      ]}
                      value={addForm.referenceAdmin}
                      onChange={(e) => setAddForm({ ...addForm, referenceAdmin: e.target.value })}
                    />
                  </FormField>

                  {addForm.referenceAdmin === 'Other' && (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <FormField
                        label="Specify Referrer / Officer Name & Designation"
                        required
                        hint="Enter custom referring official, organization, or nodal desk"
                      >
                        <Input
                          placeholder="e.g. Kondapalli Village Nodal In-Charge / District Counselor"
                          value={addForm.customReferrer}
                          onChange={(e) => setAddForm({ ...addForm, customReferrer: e.target.value })}
                          required
                        />
                      </FormField>
                    </div>
                  )}
                </div>

                {/* Row 5: Student Placement Status */}
                <div style={{ background: '#f0fdf4', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Award size={14} /> Student Placement Status
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer', color: '#047857' }}>
                      <input
                        type="checkbox"
                        checked={addForm.placementStatus === 'PLACED'}
                        onChange={(e) => {
                          const isPlaced = e.target.checked;
                          setAddForm({
                            ...addForm,
                            placementStatus: isPlaced ? 'PLACED' : 'NOT_PLACED',
                            selectedCompanyKey: isPlaced ? (addForm.selectedCompanyKey || companies[0]?.name || '') : ''
                          });
                        }}
                        style={{ accentColor: '#059669', width: 16, height: 16 }}
                      />
                      Mark as Placed / Hired
                    </label>
                  </div>

                  {addForm.placementStatus === 'PLACED' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 4 }}>
                      <FormField
                        label="Hired Company (Select from Database or Custom)"
                        required
                        hint="Check if company exists in our verified database or enter external company"
                      >
                        <Select
                          options={[
                            ...companies.map(comp => ({
                              value: comp.name,
                              label: `🏢 ${comp.name} (${comp.industry || 'Registered Partner'})`
                            })),
                            { value: 'OTHER', label: '➕ Other Company (Not in Portal Database)' }
                          ]}
                          value={addForm.selectedCompanyKey || companies[0]?.name}
                          onChange={(e) => setAddForm({ ...addForm, selectedCompanyKey: e.target.value })}
                        />
                      </FormField>

                      {/* Dynamic Database Verification Badge */}
                      {addForm.selectedCompanyKey && addForm.selectedCompanyKey !== 'OTHER' ? (
                        <div style={{
                          background: '#ecfdf5',
                          border: '1px solid #86efac',
                          borderRadius: 'var(--radius-lg)',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: '11px',
                          color: '#166534'
                        }}>
                          <CheckCircle2 size={15} color="#16a34a" />
                          <div>
                            <strong>✅ Verified Registered Partner Company (In NTR Vikasa Database)</strong>
                            {(() => {
                              const found = companies.find(c => c.name === addForm.selectedCompanyKey);
                              return found ? (
                                <div style={{ fontSize: '10px', color: '#15803d', marginTop: 1 }}>
                                  CIN: {found.cin || 'Verified'} • {found.industry} • {found.location || 'NTR District'}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      ) : addForm.selectedCompanyKey === 'OTHER' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          <FormField label="External Company Name" required hint="Company not in portal database">
                            <Input
                              placeholder="Enter company name (e.g. Hyderabad Tech Hub Ltd)"
                              value={addForm.customCompany}
                              onChange={(e) => setAddForm({ ...addForm, customCompany: e.target.value })}
                              required
                            />
                          </FormField>
                          <div style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 'var(--radius-lg)',
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '11px',
                            color: '#b45309'
                          }}>
                            <AlertTriangle size={13} color="#d97706" />
                            <span>ℹ️ Unregistered / External Company (Not in NTR Vikasa Database)</span>
                          </div>
                        </div>
                      ) : null}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <FormField label="Job Role / Designation">
                          <Input
                            placeholder="e.g. Operations Trainee / Jr. Associate"
                            value={addForm.placedRole}
                            onChange={(e) => setAddForm({ ...addForm, placedRole: e.target.value })}
                          />
                        </FormField>

                        <FormField label="Annual Package / Salary">
                          <Input
                            placeholder="e.g. ₹2,40,000 / year"
                            value={addForm.placedSalary}
                            onChange={(e) => setAddForm({ ...addForm, placedSalary: e.target.value })}
                          />
                        </FormField>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" leftIcon={<UserPlus size={16} />} disabled={isSubmitting}>
                    {isSubmitting ? 'Registering Student...' : 'Save & Register Student'}
                  </Button>
                </div>
              </form>
            </Modal>
          )}

          {/* ── 3. Quick Placement Modal ── */}
          {placementModalOpen && placementTarget && (
            <Modal
              isOpen={placementModalOpen}
              onClose={() => setPlacementModalOpen(false)}
              title={`Update Placement Status: ${placementTarget.name}`}
              size="md"
            >
              <form onSubmit={handleSavePlacement} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                  Update employment status and record placed company, salary package, and designation.
                </p>

                <FormField label="Employment Status" required>
                  <Select
                    options={[
                      { value: 'PLACED', label: '🎉 Placed / Employed' },
                      { value: 'NOT_PLACED', label: 'Seeking Employment' }
                    ]}
                    value={placementForm.placementStatus}
                    onChange={(e) => setPlacementForm({ ...placementForm, placementStatus: e.target.value })}
                  />
                </FormField>

                {placementForm.placementStatus === 'PLACED' && (
                  <>
                    <FormField label="Hired Company" required hint="Select verified database partner or specify external enterprise">
                      <Select
                        options={[
                          ...companies.map(c => ({
                            value: c.name,
                            label: `🏢 ${c.name} (${c.industry || 'Registered Partner'})`
                          })),
                          { value: 'OTHER', label: '➕ Other Company (Not in Portal Database)' }
                        ]}
                        value={placementForm.selectedCompanyKey || companies[0]?.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlacementForm({
                            ...placementForm,
                            selectedCompanyKey: val,
                            placedCompany: val !== 'OTHER' ? val : placementForm.customCompany
                          });
                        }}
                      />
                    </FormField>

                    {placementForm.selectedCompanyKey === 'OTHER' ? (
                      <FormField label="External Company Name" required hint="Enter enterprise name not registered in portal">
                        <Input
                          placeholder="e.g. Hyderabad Global Solutions Ltd"
                          value={placementForm.customCompany}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPlacementForm({
                              ...placementForm,
                              customCompany: val,
                              placedCompany: val
                            });
                          }}
                          required
                        />
                      </FormField>
                    ) : (
                      <div style={{
                        background: '#ecfdf5',
                        border: '1px solid #86efac',
                        borderRadius: 'var(--radius-lg)',
                        padding: '6px 10px',
                        fontSize: '11px',
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span>✅ Verified Registered Partner Company in NTR Vikasa Database</span>
                      </div>
                    )}

                    <FormField label="Designation / Role">
                      <Input
                        placeholder="e.g. Graduate Trainee / Store Associate"
                        value={placementForm.placedRole}
                        onChange={(e) => setPlacementForm({ ...placementForm, placedRole: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Compensation / Salary Package">
                      <Input
                        placeholder="e.g. ₹3,60,000 / year or ₹22,000 / month"
                        value={placementForm.placedSalary}
                        onChange={(e) => setPlacementForm({ ...placementForm, placedSalary: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Placement Date">
                      <Input
                        type="date"
                        value={placementForm.placedDate}
                        onChange={(e) => setPlacementForm({ ...placementForm, placedDate: e.target.value })}
                      />
                    </FormField>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                  <Button variant="outline" type="button" onClick={() => setPlacementModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Placement Details
                  </Button>
                </div>
              </form>
            </Modal>
          )}

          {/* ── 4. Confirm Suspend Dialog ── */}
          {suspendTarget && (
            <ConfirmDialog
              isOpen={Boolean(suspendTarget)}
              title="Suspend Candidate Account?"
              message={`Are you sure you want to suspend candidate ${suspendTarget.name} (${suspendTarget.email})? The candidate will no longer be able to submit job applications.`}
              confirmLabel="Confirm Suspension"
              confirmVariant="danger"
              onConfirm={handleConfirmSuspend}
              onCancel={() => setSuspendTarget(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
