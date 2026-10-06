import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, Clock, Video, Phone, Building2, User,
  Plus, Search, CheckCircle2, XCircle, RefreshCw, Calendar,
  MoreVertical, ArrowRight, Eye, AlertCircle, Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToExcel, exportToPDF, getExportFilename } from '../../utils/exportUtils';
import { useRecruiter } from '../../context/RecruiterContext';
import { useToast } from '../../context/ToastContext';
import recruiterInterviewService from '../../services/recruiterInterviewService';

const PAGE_SIZE = 9;

export default function RecruiterInterviewsPage() {
  const {
    recruiter,
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    updateInterviewStatus
  } = useRecruiter();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Backend API Integration States
  const [apiInterviews, setApiInterviews] = useState([]);
  const [apiTabCounts, setApiTabCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Fetch interviews from backend API
  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await recruiterInterviewService.getInterviews({
        status: statusFilter,
        search: search,
      });
      if (res && res.items) {
        setApiInterviews(res.items);
        if (res.tab_counts) {
          setApiTabCounts(res.tab_counts);
        }
      }
    } catch (err) {
      console.warn('Backend interview fetch failed, using context data:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Reschedule Modal
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '', notes: '' });

  // Cancel Dialog
  const [cancelTarget, setCancelTarget] = useState(null);

  // New Interview Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    candidateName: '',
    candidateEmail: '',
    jobTitle: '',
    date: '2026-09-10',
    time: '14:00',
    type: 'Online (Google Meet)',
    interviewer: recruiter?.name || 'Recruiter Lead',
    meetingLink: 'https://meet.google.com/ntr-round',
    notes: 'Technical discussion & evaluation.',
  });

  const jobs = recruiter?.jobs || [];

  // Use backend data if available, with resilient fallback to recruiter context
  const interviews = useMemo(() => {
    if (apiInterviews.length > 0 || !loading) {
      return apiInterviews;
    }
    return recruiter?.interviews || [];
  }, [apiInterviews, loading, recruiter?.interviews]);

  const tabCounts = useMemo(() => {
    if (apiTabCounts) {
      return {
        all: apiTabCounts.all ?? 0,
        scheduled: apiTabCounts.scheduled ?? 0,
        completed: apiTabCounts.completed ?? 0,
        rescheduled: apiTabCounts.rescheduled ?? 0,
        cancelled: apiTabCounts.cancelled ?? 0,
      };
    }
    const list = interviews;
    return {
      all: list.length,
      scheduled: list.filter(i => i.status === 'SCHEDULED').length,
      completed: list.filter(i => i.status === 'COMPLETED').length,
      rescheduled: list.filter(i => i.status === 'RESCHEDULED').length,
      cancelled: list.filter(i => i.status === 'CANCELLED').length,
    };
  }, [apiTabCounts, interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (item.candidateName || item.candidate_name)?.toLowerCase().includes(q);
        const matchJob = (item.jobTitle || item.job_title)?.toLowerCase().includes(q);
        const matchInterviewer = (item.interviewer || '')?.toLowerCase().includes(q);
        if (!matchName && !matchJob && !matchInterviewer) return false;
      }
      return true;
    });
  }, [interviews, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / PAGE_SIZE));

  const paginatedInterviews = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInterviews.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInterviews, currentPage]);

  const handleOpenReschedule = (item) => {
    setRescheduleTarget(item);
    setRescheduleForm({
      date: item.scheduled_date || item.date || '',
      time: item.start_time || item.time || '',
      notes: item.agenda_notes || item.notes || ''
    });
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    try {
      setSubmitting(true);
      await recruiterInterviewService.rescheduleInterview(rescheduleTarget.id, {
        scheduled_date: rescheduleForm.date,
        start_time: rescheduleForm.time,
        agenda_notes: rescheduleForm.notes,
        date: rescheduleForm.date,
        time: rescheduleForm.time,
        notes: rescheduleForm.notes,
      });

      // Also notify local context if available
      if (typeof rescheduleInterview === 'function') {
        rescheduleInterview(rescheduleTarget.id, rescheduleForm.date, rescheduleForm.time, rescheduleForm.notes);
      }

      addToast(`Interview with ${rescheduleTarget.candidateName || rescheduleTarget.candidate_name} rescheduled to ${rescheduleForm.date} at ${rescheduleForm.time}.`, 'success');
      setRescheduleTarget(null);
      await fetchInterviews();
    } catch (err) {
      addToast(err.message || 'Failed to reschedule interview.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setSubmitting(true);
      await recruiterInterviewService.cancelInterview(cancelTarget.id, 'Candidate requested cancellation');

      if (typeof cancelInterview === 'function') {
        cancelInterview(cancelTarget.id);
      }

      addToast(`Interview with ${cancelTarget.candidateName || cancelTarget.candidate_name} has been cancelled.`, 'info');
      setCancelTarget(null);
      await fetchInterviews();
    } catch (err) {
      addToast(err.message || 'Failed to cancel interview.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async (item) => {
    try {
      await recruiterInterviewService.completeInterview(item.id, 'Interview completed with positive assessment.');

      if (typeof updateInterviewStatus === 'function') {
        updateInterviewStatus(item.id, 'COMPLETED');
      }

      addToast(`Interview with ${item.candidateName || item.candidate_name} marked as Completed.`, 'success');
      await fetchInterviews();
    } catch (err) {
      addToast(err.message || 'Failed to complete interview.', 'error');
    }
  };

  const handleCreateNewInterview = async (e) => {
    e.preventDefault();
    if (!newForm.candidateName.trim() || !newForm.jobTitle.trim()) {
      addToast('Please fill all required interview details.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Locate matching application from recruiter's applications
      const matchingApp = recruiter?.applications?.find(
        a => (a.candidateName?.toLowerCase() === newForm.candidateName.toLowerCase() ||
              a.candidateEmail?.toLowerCase() === newForm.candidateEmail?.toLowerCase()) &&
             (a.jobTitle === newForm.jobTitle || a.jobId === newForm.jobId)
      );

      const payload = {
        application_id: matchingApp?.id || 'NTR-APP-501',
        candidate_name: newForm.candidateName.trim(),
        candidate_email: newForm.candidateEmail?.trim() || undefined,
        job_title: newForm.jobTitle.trim(),
        scheduled_date: newForm.date,
        date: newForm.date,
        start_time: newForm.time,
        time: newForm.time,
        format: newForm.type?.includes('Online') ? 'ONLINE' : 'OFFLINE',
        type: newForm.type,
        meeting_link: newForm.meetingLink || undefined,
        interviewer: newForm.interviewer || undefined,
        interviewer_panel: newForm.interviewer ? [newForm.interviewer] : undefined,
        agenda_notes: newForm.notes || undefined,
        notes: newForm.notes || undefined,
      };

      await recruiterInterviewService.scheduleInterview(payload);

      // Also notify context if available
      if (typeof scheduleInterview === 'function') {
        scheduleInterview({
          ...newForm,
          jobId: jobs.find(j => j.title === newForm.jobTitle)?.id || 'job-custom',
        });
      }

      addToast(`Interview scheduled with ${newForm.candidateName}!`, 'success');
      setIsNewModalOpen(false);
      setNewForm({
        candidateName: '',
        candidateEmail: '',
        jobTitle: '',
        date: '2026-09-10',
        time: '14:00',
        type: 'Online (Google Meet)',
        interviewer: recruiter?.name || 'Recruiter Lead',
        meetingLink: 'https://meet.google.com/ntr-round',
        notes: 'Technical evaluation round.',
      });
      await fetchInterviews();
    } catch (err) {
      addToast(err.message || 'Failed to schedule interview.', 'error');
    } finally {
      setSubmitting(false);
    }
  };


  const handleExportExcel = () => {
    if (filteredInterviews.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting interview schedule to Excel...', 'info');
    const headers = [
      'Candidate Name',
      'Candidate Email',
      'Job Title',
      'Interview Date',
      'Interview Time',
      'Interview Type',
      'Interviewer',
      'Interview Status',
      'Meeting Link / Venue',
      'Notes'
    ];
    const rows = filteredInterviews.map(i => [
      i.candidateName || 'N/A',
      i.candidateEmail || 'N/A',
      i.jobTitle || 'Role',
      i.date || 'N/A',
      i.time || 'N/A',
      i.type || i.mode || 'Video Call',
      i.interviewer || 'Recruiter Lead',
      i.status || 'SCHEDULED',
      i.meetingLink || 'N/A',
      i.notes || 'N/A'
    ]);
    exportToExcel({
      filename: getExportFilename('interviews', statusFilter.toLowerCase(), 'xlsx'),
      sheetName: 'Interviews',
      headers,
      rows
    });
    addToast('Excel export downloaded successfully!', 'success');
  };

  const handleExportPdf = () => {
    if (filteredInterviews.length === 0) {
      addToast('No records available to export for the selected filters.', 'info');
      return;
    }
    addToast('Exporting interview schedule to PDF...', 'info');
    const headers = ['Candidate Name', 'Job Title', 'Date', 'Time', 'Type', 'Interviewer', 'Status'];
    const rows = filteredInterviews.map(i => [
      i.candidateName || 'N/A',
      i.jobTitle || 'Role',
      i.date || 'N/A',
      i.time || 'N/A',
      i.type || i.mode || 'Video Call',
      i.interviewer || 'Recruiter Lead',
      i.status || 'SCHEDULED'
    ]);
    const tabObj = [
      { id: 'ALL', label: 'All Interviews' },
      { id: 'SCHEDULED', label: 'Upcoming / Scheduled' },
      { id: 'COMPLETED', label: 'Completed' },
      { id: 'RESCHEDULED', label: 'Rescheduled' },
      { id: 'CANCELLED', label: 'Cancelled' },
    ].find(t => t.id === statusFilter);
    const statusLabel = tabObj ? tabObj.label : statusFilter;

    exportToPDF({
      filename: getExportFilename('interviews', statusFilter.toLowerCase(), 'pdf'),
      title: 'Recruiter Interview Schedules & Logs',
      subtitle: `Company: ${recruiter?.company?.name || recruiter?.name || 'Recruiter'}`,
      metadata: {
        'Export Date': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        'Status Filter': statusLabel,
        'Total Records': filteredInterviews.length
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
            Interview Schedule & Calendar
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Coordinate candidate rounds, join meeting links, and manage interview schedules.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsNewModalOpen(true)} className="schedule-interview-btn">
          Schedule New Interview
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 240px', position: 'relative', minWidth: 0, width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by candidate name, job title, or interviewer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%', height: '42px', borderRadius: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ flexShrink: 0 }}>
            <ExportDropdown
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
              disabled={filteredInterviews.length === 0}
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderTop: '1px solid var(--color-gray-100)',
          paddingTop: '0.85rem',
          overflowX: 'auto',
          maxWidth: '100%',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin'
        }}>
          {[
            { id: 'ALL', label: 'All Interviews', count: tabCounts.all },
            { id: 'SCHEDULED', label: 'Upcoming / Scheduled', count: tabCounts.scheduled },
            { id: 'COMPLETED', label: 'Completed', count: tabCounts.completed },
            { id: 'RESCHEDULED', label: 'Rescheduled', count: tabCounts.rescheduled },
            { id: 'CANCELLED', label: 'Cancelled', count: tabCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                background: statusFilter === tab.id ? 'var(--color-primary-50)' : 'transparent',
                color: statusFilter === tab.id ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                fontWeight: statusFilter === tab.id ? 600 : 500,
                border: statusFilter === tab.id ? '1px solid var(--color-primary-200)' : '1px solid transparent',
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
                background: statusFilter === tab.id ? 'var(--color-primary-600)' : 'var(--color-gray-200)',
                color: statusFilter === tab.id ? '#fff' : 'var(--color-gray-700)',
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

      {/* Interviews List */}
      {filteredInterviews.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck size={48} />}
          title="No interviews found"
          description="Schedule interviews directly from Shortlisted candidates or click the button above."
          action={
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsNewModalOpen(true)}>
              Schedule New Interview
            </Button>
          }
        />
      ) : (
        <div>
          <div className="recruiter-jobs-grid">
            {paginatedInterviews.map((item) => {
              const isUpcoming = item.status === 'SCHEDULED' || item.status === 'RESCHEDULED';
              const isCompleted = item.status === 'COMPLETED';
              const isCancelled = item.status === 'CANCELLED';

              return (
                <div
                  key={item.id}
                  className={`card recruiter-job-card ${isUpcoming ? 'is-published' : ''}`}
                  style={{ minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
                >
                  {/* Top: Candidate Avatar, Name, Email, Status */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.45rem', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--color-primary-600), #7c3aed)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {item.candidateName?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h3
                            title={item.candidateName}
                            style={{
                              margin: 0,
                              fontSize: '0.98rem',
                              fontWeight: 700,
                              color: 'var(--color-gray-900)',
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                              lineHeight: 1.3
                            }}
                          >
                            {item.candidateName}
                          </h3>
                          <span style={{
                            fontSize: '0.74rem',
                            color: 'var(--color-gray-500)',
                            display: 'block',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                            lineHeight: 1.3,
                            marginTop: '2px'
                          }}>
                            {item.candidateEmail || 'Candidate'}
                          </span>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    {/* Applied Job Role Box */}
                    <div style={{
                      background: 'var(--color-gray-50)',
                      padding: '0.4rem 0.55rem',
                      borderRadius: '6px',
                      border: '1px solid var(--color-gray-200)',
                      marginBottom: '0.45rem',
                      minWidth: 0
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', minWidth: 0 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-600)', overflowWrap: 'anywhere', wordBreak: 'break-word', minWidth: 0 }}>
                          Role: <strong style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>{item.jobTitle}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Interview Schedule Details: Date, Time, Mode, Interviewer */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.76rem', color: 'var(--color-gray-600)', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', flexWrap: 'wrap', minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: 'var(--color-gray-900)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                          <Calendar size={12} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                          <span>{item.date} • {item.time}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflowWrap: 'anywhere', wordBreak: 'break-word', flexShrink: 0 }}>
                          <Video size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                          <span>{item.type || item.mode || 'Video Call'}</span>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-gray-600)', overflowWrap: 'anywhere', wordBreak: 'break-word', minWidth: 0 }}>
                        <User size={12} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                        <span>Panel: {item.interviewer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Preview (if any) */}
                  {item.notes && (
                    <div style={{
                      fontSize: '0.74rem',
                      color: 'var(--color-gray-600)',
                      background: '#f8fafc',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '4px',
                      borderLeft: '2px solid var(--color-primary-400)',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      lineHeight: 1.35,
                      minWidth: 0
                    }}>
                      <strong>Notes:</strong> {item.notes}
                    </div>
                  )}

                  {/* Action Buttons Footer */}
                  <div className="interview-card-actions" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', borderTop: '1px solid var(--color-gray-100)', paddingTop: '0.65rem', marginTop: 'auto', flexWrap: 'wrap', minWidth: 0 }}>
                    {item.meetingLink && isUpcoming && (
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="interview-join-link"
                        style={{ textDecoration: 'none', flex: '1 1 auto', minWidth: '70px' }}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                          icon={<Video size={13} />}
                        >
                          Join
                        </Button>
                      </a>
                    )}

                    {isUpcoming && (
                      <div className="interview-actions-group" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                          icon={<CheckCircle2 size={13} />}
                          onClick={() => handleMarkCompleted(item)}
                          title="Mark Completed"
                        >
                          Done
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                          icon={<RefreshCw size={13} />}
                          onClick={() => handleOpenReschedule(item)}
                          title="Reschedule Interview"
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: 'var(--color-danger-600)', padding: '0.35rem 0.45rem' }}
                          icon={<XCircle size={13} />}
                          onClick={() => setCancelTarget(item)}
                          title="Cancel Interview"
                        />
                      </div>
                    )}

                    {isCompleted && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0' }}>
                        <CheckCircle2 size={13} /> Interview Completed
                      </span>
                    )}

                    {isCancelled && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-danger-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0' }}>
                        <XCircle size={13} /> Interview Cancelled
                      </span>
                    )}
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
              totalItems={filteredInterviews.length}
              pageSize={PAGE_SIZE}
              itemName="interviews"
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <Modal
          isOpen={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          title={`Reschedule Interview: ${rescheduleTarget.candidateName}`}
          size="md"
        >
          <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--color-primary-50)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong>Role:</strong> {rescheduleTarget.jobTitle}
              <br />
              <strong>Candidate:</strong> {rescheduleTarget.candidateName}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FormField label="New Date *" required>
                <Input
                  type="date"
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="New Time *" required>
                <Input
                  type="time"
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Reschedule Reason / Updated Agenda">
              <Textarea
                rows={3}
                value={rescheduleForm.notes}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, notes: e.target.value })}
                placeholder="Reason for changing the slot..."
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setRescheduleTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel Confirm Dialog */}
      {cancelTarget && (
        <ConfirmDialog
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancel}
          title="Cancel Interview?"
          message={`Are you sure you want to cancel the interview with ${cancelTarget.candidateName || cancelTarget.candidate_name} for the ${cancelTarget.jobTitle || cancelTarget.job_title} role?`}
          confirmText={submitting ? "Cancelling..." : "Yes, Cancel Interview"}
          variant="danger"
        />
      )}

      {/* New Interview Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Schedule New Interview"
          size="md"
        >
          <form onSubmit={handleCreateNewInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Candidate Full Name *" required>
              <Input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={newForm.candidateName}
                onChange={(e) => setNewForm({ ...newForm, candidateName: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Candidate Email">
              <Input
                type="email"
                placeholder="candidate@example.com"
                value={newForm.candidateEmail}
                onChange={(e) => setNewForm({ ...newForm, candidateEmail: e.target.value })}
              />
            </FormField>

            <FormField label="Select Job Role *" required>
              <Select
                value={newForm.jobTitle}
                onChange={(e) => setNewForm({ ...newForm, jobTitle: e.target.value })}
                required
              >
                <option value="">Select a job position...</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.title}>{j.title}</option>
                ))}
              </Select>
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FormField label="Date *" required>
                <Input
                  type="date"
                  value={newForm.date}
                  onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Time *" required>
                <Input
                  type="time"
                  value={newForm.time}
                  onChange={(e) => setNewForm({ ...newForm, time: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Format / Medium">
              <Select
                value={newForm.type}
                onChange={(e) => setNewForm({ ...newForm, type: e.target.value })}
              >
                <option value="Online (Google Meet)">Online (Google Meet)</option>
                <option value="Online (Microsoft Teams)">Online (Microsoft Teams)</option>
                <option value="Online (Zoom)">Online (Zoom)</option>
                <option value="In-Person (Office Round)">In-Person (Office Round)</option>
                <option value="Telephonic Screening">Telephonic Screening</option>
              </Select>
            </FormField>

            <FormField label="Meeting Link / Venue">
              <Input
                type="text"
                value={newForm.meetingLink}
                onChange={(e) => setNewForm({ ...newForm, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/xyz"
              />
            </FormField>

            <FormField label="Interviewer Panel">
              <Input
                type="text"
                value={newForm.interviewer}
                onChange={(e) => setNewForm({ ...newForm, interviewer: e.target.value })}
              />
            </FormField>

            <FormField label="Agenda / Notes">
              <Textarea
                rows={2}
                value={newForm.notes}
                onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<CalendarCheck size={16} />} disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Confirm & Send Invite'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
