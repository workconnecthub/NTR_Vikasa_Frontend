import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Plus, Search, Users, Eye, Edit2,
  MapPin, DollarSign, Clock, Calendar, CheckCircle2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, getExportFilename } from '../../utils/exportUtils';
import { formatInternshipId } from '../../utils/applicationUtils';
import { useRecruiter } from '../../context/RecruiterContext';
import { useToast } from '../../context/ToastContext';
import recruiterInternshipService from '../../services/recruiterInternshipService';

const PAGE_SIZE = 10;

export default function RecruiterInternshipsPage() {
  const { recruiter, createInternship } = useRecruiter();
  const { addToast } = useToast();

  const [internships, setInternships] = useState(recruiter?.internships || []);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch live internships from backend API
  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await recruiterInternshipService.getInternships({ page: 1, page_size: 100, status: 'ALL' });
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        setInternships(res.items);
      } else if (recruiter?.internships?.length) {
        setInternships(recruiter.internships);
      }
    } catch (err) {
      console.error('Failed to load internships from backend API:', err);
      if (recruiter?.internships) {
        setInternships(recruiter.internships);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatusTab, search]);

  const [newInternship, setNewInternship] = useState({
    title: '',
    stipend: '₹25,000 / month',
    duration: '6 Months',
    workMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    openings: '3',
    description: 'We are looking for passionate student developers and fresh graduates to join our hands-on engineering team.',
  });

  const tabCounts = useMemo(() => ({
    all: internships.length,
    active: internships.filter(i => i.status === 'PUBLISHED').length,
    pending: internships.filter(i => i.status === 'PENDING').length,
    draft: internships.filter(i => i.status === 'DRAFT').length,
    closed: internships.filter(i => i.status === 'CLOSED').length,
  }), [internships]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newInternship.title.trim()) {
      addToast('Please enter an internship title.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await recruiterInternshipService.createInternship({
        title: newInternship.title,
        stipend: newInternship.stipend,
        duration: newInternship.duration,
        workMode: newInternship.workMode,
        location: newInternship.location,
        openings: parseInt(newInternship.openings, 10) || 1,
        description: newInternship.description,
      });

      // Synchronize recruiter context
      createInternship({
        id: created.id,
        internship_number: created.internship_number,
        title: newInternship.title,
        stipend: newInternship.stipend,
        duration: newInternship.duration,
        workMode: newInternship.workMode,
        location: newInternship.location,
        openings: parseInt(newInternship.openings, 10) || 1,
        description: newInternship.description,
        status: 'PENDING',
        applicantsCount: 0,
      });

      setCreateModalOpen(false);
      addToast('Internship submitted successfully. It is now pending admin approval.', 'success');
      setNewInternship({
        title: '',
        stipend: '₹25,000 / month',
        duration: '6 Months',
        workMode: 'Hybrid',
        location: 'Bengaluru, Karnataka',
        openings: '3',
        description: '',
      });

      // Switch to PENDING tab and refresh live list
      setSelectedStatusTab('PENDING');
      await fetchInternships();
    } catch (err) {
      addToast(err.message || 'Failed to submit internship for approval.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return internships.filter((item) => {
      // Status filter
      if (selectedStatusTab === 'ACTIVE' && item.status !== 'PUBLISHED') return false;
      if (selectedStatusTab === 'PENDING' && item.status !== 'PENDING') return false;
      if (selectedStatusTab === 'DRAFT' && item.status !== 'DRAFT') return false;
      if (selectedStatusTab === 'CLOSED' && item.status !== 'CLOSED') return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchDesc) return false;
      }

      return true;
    });
  }, [internships, selectedStatusTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginatedInternships = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting internships list to Excel...', 'info');
    const headers = [
      'Internship ID',
      'Internship Title',
      'Department',
      'Location',
      'Duration',
      'Stipend',
      'Work Mode',
      'Openings',
      'Posted Date',
      'Status',
      'Applicants Count'
    ];
    const rows = filtered.map(i => [
      formatInternshipId(i.id),
      i.title || 'N/A',
      i.department || 'Engineering',
      i.location || 'Bengaluru',
      i.duration || '3 Months',
      i.stipend || '₹25,000 / month',
      i.workMode || 'Hybrid',
      i.openings || 1,
      i.postedOn || i.createdAt || 'Aug 2026',
      i.status || 'PUBLISHED',
      i.applicantsCount || 0
    ]);
    exportToExcel({
      filename: getExportFilename('my_internships', selectedStatusTab.toLowerCase(), 'xlsx'),
      sheetName: 'Internships',
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
    addToast('Exporting internships list to PDF...', 'info');
    const headers = ['Internship ID', 'Internship Title', 'Location', 'Duration', 'Stipend', 'Work Mode', 'Openings', 'Status', 'Applicants'];
    const rows = filtered.map(i => [
      formatInternshipId(i.id),
      i.title || 'N/A',
      i.location || 'Bengaluru',
      i.duration || '3 Months',
      i.stipend || '₹25,000 / month',
      i.workMode || 'Hybrid',
      i.openings || 1,
      i.status || 'PUBLISHED',
      i.applicantsCount || 0
    ]);
    const tabObj = [
      { id: 'ALL', label: 'All Internships' },
      { id: 'ACTIVE', label: 'Active / Published' },
      { id: 'PENDING', label: 'Pending Approval' },
      { id: 'DRAFT', label: 'Drafts' },
      { id: 'CLOSED', label: 'Closed' },
    ].find(t => t.id === selectedStatusTab);
    const statusLabel = tabObj ? tabObj.label : selectedStatusTab;

    exportToPDF({
      filename: getExportFilename('my_internships', selectedStatusTab.toLowerCase(), 'pdf'),
      title: 'Internship Programs Report',
      subtitle: `Employer: ${recruiter?.company?.name || recruiter?.name || 'Recruiter'}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Status Filter': statusLabel,
        'Total Records': filtered.length
      },
      headers,
      rows
    });
    addToast('PDF export downloaded successfully!', 'success');
  };

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="portal-header-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: 0 }}>
            Internship Programs
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Hire fresh student talent and graduate interns across Andhra Pradesh & India.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
          Post New Internship
        </Button>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px', maxWidth: '450px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search internships by title, location, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%', height: '42px', borderRadius: '8px' }}
            />
          </div>

          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            disabled={filtered.length === 0}
          />
        </div>

        {/* Status Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderTop: '1px solid var(--color-gray-100)',
          paddingTop: '0.85rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'ALL', label: 'All Internships', count: tabCounts.all },
            { id: 'ACTIVE', label: 'Active / Published', count: tabCounts.active },
            { id: 'PENDING', label: 'Pending Approval', count: tabCounts.pending },
            { id: 'DRAFT', label: 'Drafts', count: tabCounts.draft },
            { id: 'CLOSED', label: 'Closed', count: tabCounts.closed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              style={{
                background: selectedStatusTab === tab.id ? 'var(--color-primary-50)' : 'transparent',
                color: selectedStatusTab === tab.id ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                fontWeight: selectedStatusTab === tab.id ? 600 : 500,
                border: selectedStatusTab === tab.id ? '1px solid var(--color-primary-200)' : '1px solid transparent',
                borderRadius: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: selectedStatusTab === tab.id ? 'var(--color-primary-600)' : 'var(--color-gray-200)',
                color: selectedStatusTab === tab.id ? '#fff' : 'var(--color-gray-700)',
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                fontWeight: 600
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Internships Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={48} />}
          title="No internships found"
          description="Create and publish your first internship opportunity to recruit student builders."
          action={
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
              Post Internship
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {paginatedInternships.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--color-gray-200)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        color: 'var(--color-primary-700)',
                        background: 'var(--color-primary-50)',
                        border: '1px solid var(--color-primary-200)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px'
                      }}>
                        {formatInternshipId(item.id)}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-gray-600)', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <DollarSign size={14} color="var(--color-primary-600)" />
                      <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{item.stipend}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} color="var(--color-gray-400)" />
                      <span>{item.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="var(--color-gray-400)" />
                      <span>{item.location || 'Bengaluru'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} color="var(--color-gray-400)" />
                      <span>{item.openings || 2} Openings</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-700)', lineHeight: 1.5, margin: 0 }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                    {item.applicantsCount || 0} Candidates Applied
                  </span>
                  <Link to="/recruiter/applications">
                    <Button variant="outline" size="sm">
                      View Applicants
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* Post Internship Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Post New Internship Opportunity"
          size="md"
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Internship Title *" required>
              <Input
                type="text"
                placeholder="e.g. Frontend React Development Intern"
                value={newInternship.title}
                onChange={(e) => setNewInternship({ ...newInternship, title: e.target.value })}
                required
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FormField label="Stipend (Monthly) *" required>
                <Input
                  type="text"
                  placeholder="₹25,000 / month"
                  value={newInternship.stipend}
                  onChange={(e) => setNewInternship({ ...newInternship, stipend: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Duration *" required>
                <Select
                  value={newInternship.duration}
                  onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })}
                >
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                </Select>
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FormField label="Work Mode">
                <Select
                  value={newInternship.workMode}
                  onChange={(e) => setNewInternship({ ...newInternship, workMode: e.target.value })}
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </Select>
              </FormField>

              <FormField label="Number of Interns">
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={newInternship.openings}
                  onChange={(e) => setNewInternship({ ...newInternship, openings: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Internship Description">
              <Textarea
                rows={3}
                placeholder="Describe the projects, learning mentorship, and student responsibilities..."
                value={newInternship.description}
                onChange={(e) => setNewInternship({ ...newInternship, description: e.target.value })}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Submit for Approval
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
