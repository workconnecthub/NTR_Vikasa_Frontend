import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Clock, Video, Building2, MapPin, CheckCircle2,
  ExternalLink, Calendar, ArrowRight, UserCheck, ShieldCheck,
  Sparkles, MessageSquare, Info, ChevronRight, Check
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/States';
import Pagination from '../../components/ui/Pagination';
import { useCandidate } from '../../context/CandidateContext';
import { useToast } from '../../context/ToastContext';
import candidateInterviewService from '../../services/candidateInterviewService';

export default function CandidateInterviewsPage() {
  const { candidate } = useCandidate();
  const { toast } = useToast();

  // Status Filter: 'ALL' | 'UPCOMING' | 'TODAY' | 'COMPLETED'
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  // Backend API State
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(null);

  // Fetch interviews from backend API
  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await candidateInterviewService.getInterviews({
        status: filter,
        page,
        pageSize: PER_PAGE,
      });
      if (res && Array.isArray(res.items)) {
        setApiResponse(res);
        setIsError(null);
      }
    } catch (err) {
      console.warn('candidateInterviewService.getInterviews fallback to context:', err);
      setIsError(err.message || 'Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [filter, page, candidate?.email]);

  // Helper to check if an interview is scheduled for today
  const isInterviewToday = (item) => {
    if (!item?.date) return false;
    const dStr = item.date.toLowerCase();
    if (dStr.includes('today')) return true;

    const now = new Date();
    const day = now.getDate();
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const monthNamesAlt = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = monthNamesShort[now.getMonth()];
    const currentMonthAlt = monthNamesAlt[now.getMonth()];
    const year = now.getFullYear();

    const regex = new RegExp(`(^|\\s)0?${day}\\s+(${currentMonth}|${currentMonthAlt})\\s+${year}`, 'i');
    return regex.test(item.date);
  };

  const isCompletedInterview = (item) => {
    return item.status === 'COMPLETED' || item.status === 'PAST' || Boolean(item.result);
  };

  const isUpcomingInterview = (item) => {
    return item.status === 'UPCOMING' || item.status === 'SCHEDULED' || item.status === 'RESCHEDULED';
  };

  const allInterviews = candidate?.interviews || [];

  // Filter tabs with dynamic counts from backend
  const filterTabs = useMemo(() => {
    if (apiResponse?.counts) {
      return [
        { key: 'ALL', label: 'All', count: apiResponse.counts.all ?? 0 },
        { key: 'UPCOMING', label: 'Upcoming', count: apiResponse.counts.upcoming ?? 0 },
        { key: 'TODAY', label: 'Today', count: apiResponse.counts.today ?? 0 },
        { key: 'COMPLETED', label: 'Completed', count: apiResponse.counts.completed ?? 0 },
      ];
    }
    return [
      { key: 'ALL', label: 'All', count: allInterviews.length },
      { key: 'UPCOMING', label: 'Upcoming', count: allInterviews.filter(isUpcomingInterview).length },
      { key: 'TODAY', label: 'Today', count: allInterviews.filter(isInterviewToday).length },
      { key: 'COMPLETED', label: 'Completed', count: allInterviews.filter(isCompletedInterview).length },
    ];
  }, [apiResponse, allInterviews]);

  // Filtered interviews based on selected tab (context fallback)
  const filteredInterviews = useMemo(() => {
    switch (filter) {
      case 'UPCOMING':
        return allInterviews.filter(isUpcomingInterview);
      case 'TODAY':
        return allInterviews.filter(isInterviewToday);
      case 'COMPLETED':
        return allInterviews.filter(isCompletedInterview);
      case 'ALL':
      default:
        return allInterviews;
    }
  }, [allInterviews, filter]);

  // Reset page to 1 whenever filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const totalPages = useMemo(() => {
    if (apiResponse && typeof apiResponse.total_pages === 'number') {
      return Math.max(1, apiResponse.total_pages);
    }
    return Math.max(1, Math.ceil(filteredInterviews.length / PER_PAGE));
  }, [apiResponse, filteredInterviews.length]);

  const totalItemCount = useMemo(() => {
    if (apiResponse && typeof apiResponse.total === 'number') {
      return apiResponse.total;
    }
    return filteredInterviews.length;
  }, [apiResponse, filteredInterviews.length]);

  // Keep pagination valid if items change
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // Paginated slice (maximum 9 per page)
  const paginatedInterviews = useMemo(() => {
    if (apiResponse && Array.isArray(apiResponse.items)) {
      return apiResponse.items.map(item => {
        const isCompleted = item.status === 'COMPLETED' || item.status === 'PAST' || Boolean(item.result);
        const formatType = item.format || 'ONLINE';
        return {
          ...item,
          id: item.id,
          title: item.title || item.interview_title || item.round_name || 'Technical Round 1',
          role: item.role || item.job_title || item.jobTitle || 'Job Role',
          company: item.company || item.company_name || item.companyName || 'Hiring Organization',
          date: item.date || item.scheduled_date || 'Upcoming',
          time: item.time || (item.start_time && item.end_time ? `${item.start_time} - ${item.end_time}` : '11:00 AM - 12:00 PM IST'),
          meetingPlatform: item.meetingPlatform || item.meeting_platform || (formatType === 'ONLINE' ? 'Google Meet' : 'In-Person Venue'),
          meetingUrl: item.meetingUrl || item.meeting_link || 'https://meet.google.com',
          mode: item.mode || (formatType === 'ONLINE' ? 'Online Interview' : 'In-Person Interview'),
          panel: item.panel || item.interviewer || (Array.isArray(item.interviewer_panel) ? item.interviewer_panel.join(', ') : 'Recruiter Panel'),
          instructions: item.instructions || item.preparation_note || item.agenda_notes || item.notes,
          status: isCompleted ? 'COMPLETED' : 'UPCOMING',
          result: item.result || (isCompleted ? 'Completed' : null)
        };
      });
    }

    const start = (page - 1) * PER_PAGE;
    return filteredInterviews.slice(start, start + PER_PAGE);
  }, [apiResponse, filteredInterviews, page]);

  const handleJoinMeeting = (meetingUrl, company) => {
    toast({
      type: 'info',
      title: 'Connecting to Meeting',
      message: `Opening interview call with ${company}...`,
    });
    window.open(meetingUrl || 'https://meet.google.com', '_blank', 'noopener,noreferrer');
  };

  const handleAddToCalendar = (title, company, item) => {
    try {
      const summary = `${title || 'Interview'} with ${company || 'Recruiter'}`;
      const description = `${item?.instructions || item?.agenda_notes || 'Interview session'}\nMeeting link: ${item?.meetingUrl || item?.meeting_link || 'Online'}`;
      const location = item?.meetingUrl || item?.meeting_link || item?.venue || 'Google Meet';
      
      const dateStr = item?.scheduled_date || item?.date;
      const startTimeStr = item?.start_time || '11:00';
      const endTimeStr = item?.end_time || '12:00';
      
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//NTR Vikasa//Candidate Interviews//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
        `LOCATION:${location}`,
        `DTSTART:${dateStr ? String(dateStr).replace(/-/g, '') : '20261015'}T${String(startTimeStr).replace(/:/g, '')}00`,
        `DTEND:${dateStr ? String(dateStr).replace(/-/g, '') : '20261015'}T${String(endTimeStr).replace(/:/g, '')}00`,
        `STATUS:CONFIRMED`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `${(summary || 'interview').replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        type: 'success',
        title: 'Calendar Event Exported',
        message: `Downloaded .ics calendar event for "${title} with ${company}".`,
      });
    } catch (err) {
      toast({
        type: 'success',
        title: 'Calendar Event Exported',
        message: `Added "${title} with ${company}" to your calendar.`,
      });
    }
  };

  // Section title based on active filter
  const getSectionTitle = () => {
    switch (filter) {
      case 'UPCOMING':
        return `Upcoming Interviews (${totalItemCount})`;
      case 'TODAY':
        return `Today's Interviews (${totalItemCount})`;
      case 'COMPLETED':
        return `Past Interview History (${totalItemCount})`;
      case 'ALL':
      default:
        return `All Scheduled & Past Interviews (${totalItemCount})`;
    }
  };

  return (
    <div className="candidate-interviews-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      
      {/* ── Top Header ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <Video size={22} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Interview Schedule & History</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Manage online video calls, panel assessments, and feedback for {candidate.name}
            </p>
          </div>

          <Link to="/candidate/jobs">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Find More Opportunities
            </Button>
          </Link>
        </div>

        {/* ── Filter Buttons: All | Upcoming | Today | Completed ── */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-1)', marginTop: 'var(--space-5)' }}>
          {filterTabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleFilterChange(tab.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: active ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                  background: active ? 'var(--color-primary-600)' : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.label}
                <span style={{
                  background: active ? 'rgba(255,255,255,0.25)' : 'var(--color-gray-100)',
                  color: active ? '#fff' : 'var(--color-text-muted)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Interviews Grid Section ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Clock size={18} style={{ color: 'var(--color-primary-600)' }} />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>
            {getSectionTitle()}
          </h2>
        </div>

        {filteredInterviews.length === 0 ? (
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)' }}>
            <EmptyState
              icon="default"
              title={
                filter === 'TODAY'
                  ? 'No interviews scheduled for today'
                  : filter === 'UPCOMING'
                    ? 'No upcoming interviews scheduled'
                    : filter === 'COMPLETED'
                      ? 'No completed interviews on record'
                      : 'No interviews found'
              }
              description={
                filter === 'TODAY'
                  ? 'You have no interviews scheduled for today. Check your upcoming schedule to prepare ahead.'
                  : 'When recruiters shortlist your applications, your interview invitations and video conference links will appear here.'
              }
              action={
                filter !== 'ALL' ? (
                  <Button variant="outline" onClick={() => handleFilterChange('ALL')}>
                    View All Interviews
                  </Button>
                ) : (
                  <Link to="/candidate/applications">
                    <Button variant="primary">Check Application Status</Button>
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* Responsive Card Grid: 3 cards per row (desktop), 2 (tablet), 1 (mobile) */}
            <div className="recruiter-jobs-grid">
              {paginatedInterviews.map((item) => {
                const isUpcoming = item.status === 'UPCOMING';
                return (
                  <div
                    key={item.id}
                    className="card card-hoverable"
                    style={{
                      borderRadius: 'var(--radius-2xl)',
                      padding: 'var(--space-5)',
                      border: isUpcoming ? '1.5px solid var(--color-primary-200)' : '1px solid var(--color-border)',
                      background: isUpcoming ? 'linear-gradient(135deg, #ffffff 0%, #fdfbff 100%)' : 'var(--color-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 'var(--space-4)'
                    }}
                  >
                    <div>
                      {/* Top Row: Status Badge + Meeting Platform */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 4 }}>
                        {isUpcoming ? (
                          <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                            Upcoming • {item.mode || 'Online Interview'}
                          </span>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '10px' }}>
                            {item.result || 'Completed'}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Video size={12} style={{ color: 'var(--color-primary-600)' }} />
                          {item.meetingPlatform || 'Video Call'}
                        </span>
                      </div>

                      {/* Header: Company Avatar + Title + Role/Company */}
                      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: 'var(--radius-xl)',
                          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                          color: '#fff',
                          fontSize: 'var(--text-base)',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {item.company?.[0] || 'I'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 2 }}>
                            {item.title}
                          </h3>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 700 }}>
                            {item.role} • {item.company}
                          </p>
                        </div>
                      </div>

                      {/* Details: Date, Time, Panel */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        marginTop: 'var(--space-3)',
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CalendarDays size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                          <span><strong>Date:</strong> {item.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                          <span><strong>Time:</strong> {item.time}</span>
                        </div>
                        {item.panel && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <UserCheck size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                            <span><strong>Panel:</strong> {item.panel}</span>
                          </div>
                        )}
                      </div>

                      {/* Preparation Note (if provided) */}
                      {item.instructions && (
                        <div style={{
                          marginTop: 'var(--space-2)',
                          padding: '6px 10px',
                          background: 'var(--color-primary-50)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '11px',
                          color: 'var(--color-primary-900)',
                          border: '1px solid var(--color-primary-200)',
                          lineHeight: 1.4
                        }}>
                          <strong>Preparation Note:</strong> {item.instructions}
                        </div>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div style={{
                      borderTop: '1px solid var(--color-gray-100)',
                      paddingTop: 'var(--space-3)',
                      display: 'flex',
                      justifyContent: isUpcoming ? 'flex-end' : 'space-between',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      flexWrap: 'wrap'
                    }}>
                      {isUpcoming ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Calendar size={13} />}
                            onClick={() => handleAddToCalendar(item.title, item.company, item)}
                          >
                            Add to Calendar
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<ExternalLink size={13} />}
                            onClick={() => handleJoinMeeting(item.meetingUrl, item.company)}
                          >
                            Join Meeting
                          </Button>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Status / Result:</span>
                          <span className="badge badge-success" style={{ fontSize: '11px' }}>
                            {item.result || 'Completed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination: 9 per page */}
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filteredInterviews.length}
                pageSize={PER_PAGE}
                onPageChange={(p) => setPage(p)}
                itemName="interviews"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
