import { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays, MapPin, Clock, Building2, Users, CheckCircle2,
  XCircle, Clock3, Plus, ArrowRight, UserCheck, Briefcase, Sparkles, Search
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
import { formatMelaId } from '../../utils/applicationUtils';
import { useRecruiter } from '../../context/RecruiterContext';
import { useToast } from '../../context/ToastContext';
import recruiterJobMelaService from '../../services/recruiterJobMelaService';

const PAGE_SIZE = 9;

export default function RecruiterJobMelaPage() {
  const { recruiter, registerJobMela } = useRecruiter();
  const { addToast } = useToast();

  const [events, setEvents] = useState(recruiter?.jobMelas || []);
  const [loading, setLoading] = useState(true);
  const [availableMelas, setAvailableMelas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch live Job Melas for this recruiter
  const fetchJobMelas = async () => {
    try {
      setLoading(true);
      const data = await recruiterJobMelaService.getJobMelas();
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
      } else if (recruiter?.jobMelas?.length) {
        setEvents(recruiter.jobMelas);
      }
    } catch (err) {
      console.error('Failed to fetch recruiter Job Melas from API, using cached data:', err);
      if (recruiter?.jobMelas) {
        setEvents(recruiter.jobMelas);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobMelas();
  }, []);

  // Fetch available melas for modal dropdown
  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const melas = await recruiterJobMelaService.getAvailableJobMelas();
        if (Array.isArray(melas) && melas.length > 0) {
          setAvailableMelas(melas);
        }
      } catch (err) {
        console.error('Failed to load available Job Melas:', err);
      }
    };
    fetchAvailable();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatusTab, search]);

  // Request Participation Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    job_mela_id: '',
    title: 'Visakhapatnam IT & FinTech Job Fair 2026',
    date: '2026-10-18',
    venue: 'Andhra University Convention Hall, Vizag',
    positions: 'React Engineers, Cloud Specialists, Python Devs',
    expectedHires: '20',
  });

  const tabCounts = useMemo(() => {
    return {
      all: events.length,
      approved: events.filter(e => (e.status || e.participationStatus) === 'APPROVED').length,
      pending: events.filter(e => (e.status || e.participationStatus) === 'PENDING').length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const status = event.status || event.participationStatus || 'APPROVED';
      if (selectedStatusTab === 'APPROVED' && status !== 'APPROVED') return false;
      if (selectedStatusTab === 'PENDING' && status !== 'PENDING') return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = event.title?.toLowerCase().includes(q);
        const matchVenue = event.venue?.toLowerCase().includes(q);
        const matchCity = event.city?.toLowerCase().includes(q);
        const matchBooth = event.boothNumber?.toLowerCase().includes(q);
        const matchPositions = Array.isArray(event.showcasedPositions)
          ? event.showcasedPositions.some(p => p.toLowerCase().includes(q))
          : event.positions?.toLowerCase().includes(q);

        if (!matchTitle && !matchVenue && !matchCity && !matchBooth && !matchPositions) return false;
      }

      return true;
    });
  }, [events, selectedStatusTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredEvents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredEvents, currentPage]);

  const handleExportExcel = () => {
    if (filteredEvents.length === 0) return;
    const headers = [
      'Job Mela Title',
      'Event Date',
      'Time',
      'Venue',
      'Location / City',
      'Participating Company',
      'Booth Allocation',
      'Participation Status',
      'Registered at Booth',
      'Spot Interviews Conducted',
      'Spot Offers Given',
      'Showcased Positions',
    ];
    const rows = filteredEvents.map(event => [
      event.title || '',
      event.date || '',
      event.time || '09:00 AM - 05:30 PM',
      event.venue || '',
      event.city ? `${event.city}${event.state ? `, ${event.state}` : ''}` : (event.venue || ''),
      recruiter?.company?.name || recruiter?.name || 'Recruiter Company',
      event.boothNumber || 'N/A',
      event.participationStatus || event.status || 'PENDING',
      event.registeredCandidatesAtBooth ?? event.candidatesCount ?? 0,
      event.spotInterviewsConducted ?? event.interviewsCount ?? 0,
      event.spotOffersGiven ?? event.spotOffers ?? 0,
      Array.isArray(event.showcasedPositions) ? event.showcasedPositions.join(', ') : (event.positions || 'N/A'),
    ]);
    const filename = getExportFilename('job_mela_registrations', selectedStatusTab !== 'ALL' ? selectedStatusTab.toLowerCase() : null, 'xlsx');
    exportToExcel({ filename, sheetName: 'Job Melas', headers, rows });
    addToast(`Exported ${filteredEvents.length} Job Mela event(s) to Excel`, 'success');
  };

  const handleExportPdf = () => {
    if (filteredEvents.length === 0) return;
    const headers = ['Job Mela', 'Date', 'Venue', 'Booth', 'Status', 'Registered', 'Interviews', 'Offers'];
    const rows = filteredEvents.map(event => [
      event.title || '',
      event.date || '',
      event.venue ? (event.venue.length > 30 ? event.venue.substring(0, 27) + '...' : event.venue) : '',
      event.boothNumber ? (event.boothNumber.length > 20 ? event.boothNumber.substring(0, 17) + '...' : event.boothNumber) : 'N/A',
      event.participationStatus || event.status || 'PENDING',
      event.registeredCandidatesAtBooth ?? event.candidatesCount ?? 0,
      event.spotInterviewsConducted ?? event.interviewsCount ?? 0,
      event.spotOffersGiven ?? event.spotOffers ?? 0,
    ]);
    const filename = getExportFilename('job_mela_registrations', selectedStatusTab !== 'ALL' ? selectedStatusTab.toLowerCase() : null, 'pdf');
    exportToPDF({
      filename,
      title: 'Job Mela Participation & Booth Registrations',
      subtitle: `${recruiter?.company?.name || 'Recruiter'} - Filter: ${selectedStatusTab === 'ALL' ? 'All Events' : selectedStatusTab}${search ? ` | Search: "${search}"` : ''}`,
      metadata: {
        'Company': recruiter?.company?.name || 'Recruiter Company',
        'Total Events': filteredEvents.length,
        'Status Filter': selectedStatusTab,
        'Search': search || 'None',
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
      headers,
      rows,
    });
    addToast(`Exported ${filteredEvents.length} Job Mela event(s) to PDF`, 'success');
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await recruiterJobMelaService.registerJobMela({
        job_mela_id: requestForm.job_mela_id,
        title: requestForm.title,
        openings: requestForm.positions,
        positions: requestForm.positions,
        target_hires: parseInt(requestForm.expectedHires || 1, 10),
        expectedHires: parseInt(requestForm.expectedHires || 1, 10),
      });

      registerJobMela({
        id: res.id || `mela-${Date.now()}`,
        job_mela_id: res.job_mela_id,
        title: requestForm.title,
        date: requestForm.date,
        venue: requestForm.venue,
        status: 'PENDING',
        participationStatus: 'PENDING',
        boothNumber: 'Awaiting Admin Allocation',
        candidatesCount: 0,
        interviewsCount: 0,
        positions: requestForm.positions,
        expectedHires: requestForm.expectedHires,
      });

      setRequestModalOpen(false);
      addToast(`Registration requested for "${requestForm.title}". Status: PENDING.`, 'success');
      await fetchJobMelas();
    } catch (err) {
      addToast(err.message || 'Failed to submit registration request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="portal-header-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: 0 }}>
            NTR Vikasa Job Melas Participation
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Participate in government & district mega career drives, allocate corporate booths, and conduct spot hiring.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setRequestModalOpen(true)}>
          Register for Job Mela
        </Button>
      </div>

      {/* Filter Bar & Status Tabs */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px', maxWidth: '450px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by event title, venue, city, or booth..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%', height: '42px', borderRadius: '8px' }}
            />
          </div>
          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            disabled={filteredEvents.length === 0}
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
            { id: 'ALL', label: 'All Events', count: tabCounts.all },
            { id: 'APPROVED', label: 'Registered & Approved', count: tabCounts.approved },
            { id: 'PENDING', label: 'Pending Approval', count: tabCounts.pending },
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

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Building2 size={48} />}
          title="No Job Mela events found"
          description="No participating Job Mela events match your active search and filter criteria."
          action={
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setRequestModalOpen(true)}>
              Register for Job Mela
            </Button>
          }
        />
      ) : (
        <div>
          <div className="recruiter-jobs-grid">
            {paginatedEvents.map((event) => {
              const isApproved = (event.status || event.participationStatus) === 'APPROVED';
              return (
                <div
                  key={event.id}
                  className={`card recruiter-job-card ${isApproved ? 'is-published' : ''}`}
                >
                  {/* Top: Status & Booth */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          color: '#7c3aed',
                          background: '#f5f3ff',
                          border: '1px solid #ddd6fe',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}>
                          {formatMelaId(event.id)}
                        </span>
                        <StatusBadge status={isApproved ? 'APPROVED' : 'PENDING'} />
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isApproved ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                        background: isApproved ? 'var(--color-primary-50)' : 'var(--color-gray-100)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '150px'
                      }}>
                        <Building2 size={11} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.boothNumber || 'Awaiting Booth'}
                        </span>
                      </span>
                    </div>

                    {/* Event Title */}
                    <h3
                      title={event.title}
                      style={{
                        margin: '0 0 0.45rem 0',
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: 'var(--color-gray-900)',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.5em'
                      }}
                    >
                      {event.title}
                    </h3>

                    {/* Event Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.76rem', color: 'var(--color-gray-600)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <CalendarDays size={12} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                        <span>{event.date} • {event.time || '09:00 AM - 05:30 PM'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <MapPin size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                        <span title={event.venue}>{event.venue}</span>
                      </div>
                      {event.positions && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-gray-500)', fontSize: '0.72rem' }}>
                          <Briefcase size={11} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                          <span title={event.positions}>Roles: {event.positions}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Metrics / Pipeline Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    background: 'var(--color-gray-50)',
                    padding: '0.45rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-gray-200)',
                    textAlign: 'center',
                    gap: '2px',
                    marginTop: 'auto'
                  }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                        {event.registeredCandidatesAtBooth ?? event.candidatesCount ?? 0}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Registered</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--color-gray-200)' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                        {event.spotInterviewsConducted ?? event.interviewsCount ?? 0}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Spot Interviews</div>
                    </div>
                  </div>

                  {/* Footer Status / Live Queue Info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-gray-100)',
                    paddingTop: '0.65rem',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-gray-600)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isApproved ? (
                        <>
                          <CheckCircle2 size={13} color="#10b981" />
                          <span style={{ color: '#059669', fontWeight: 600 }}>Booth Active</span>
                        </>
                      ) : (
                        <>
                          <Clock3 size={13} color="#d97706" />
                          <span style={{ color: '#d97706', fontWeight: 600 }}>Pending Allocation</span>
                        </>
                      )}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-gray-400)' }}>
                      NTR Vikasa Event
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div style={{ marginTop: 'var(--space-6)' }}>
             <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               totalItems={filteredEvents.length}
               pageSize={PAGE_SIZE}
               itemName="Job Melas"
               onPageChange={(p) => {
                 setCurrentPage(p);
                 window.scrollTo({ top: 120, behavior: 'smooth' });
               }}
             />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {requestModalOpen && (
        <Modal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          title="Register for Upcoming NTR Vikasa Job Mela"
          size="md"
        >
          <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Job Mela Event *" required>
              <Select
                value={requestForm.title}
                onChange={(e) => {
                  const selectedTitle = e.target.value;
                  const matched = availableMelas.find((m) => m.title === selectedTitle);
                  setRequestForm({
                    ...requestForm,
                    title: selectedTitle,
                    job_mela_id: matched ? matched.id : '',
                    date: matched?.event_date || requestForm.date,
                    venue: matched?.venue || requestForm.venue,
                  });
                }}
              >
                {availableMelas.length > 0 ? (
                  availableMelas.map((m) => (
                    <option key={m.id} value={m.title}>
                      {m.title} ({m.city})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Visakhapatnam IT & FinTech Job Fair 2026">Visakhapatnam IT & FinTech Job Fair 2026</option>
                    <option value="Tirupati Rayalaseema Mega Employment Drive">Tirupati Rayalaseema Mega Employment Drive</option>
                    <option value="Guntur & Amaravati Skills & Tech Expo">Guntur & Amaravati Skills & Tech Expo</option>
                  </>
                )}
              </Select>
            </FormField>

            <FormField label="Openings / Positions for Hiring">
              <Input
                type="text"
                placeholder="e.g. React Engineers, Cloud Specialists, Python Devs"
                value={requestForm.positions}
                onChange={(e) => setRequestForm({ ...requestForm, positions: e.target.value })}
              />
            </FormField>

            <FormField label="Target Hires Count">
              <Input
                type="number"
                min="1"
                max="200"
                value={requestForm.expectedHires}
                onChange={(e) => setRequestForm({ ...requestForm, expectedHires: e.target.value })}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Participation Request'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
