import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Users, CalendarCheck, CheckCircle2, Clock, Award,
  Briefcase, BarChart3, Filter, Download, ArrowUpRight, ArrowDownRight,
  Sparkles, Target, Zap
} from 'lucide-react';
import { useRecruiter } from '../../context/RecruiterContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import recruiterAnalyticsService from '../../services/recruiterAnalyticsService';

export default function AnalyticsPage() {
  const { recruiter } = useRecruiter();
  const { addToast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [customFrom, setCustomFrom] = useState('2026-08-01');
  const [customTo, setCustomTo] = useState('2026-10-05');
  const [appliedCustomRange, setAppliedCustomRange] = useState(null);
  const [dateError, setDateError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Active date boundary calculation for display label
  const activeDateRange = useMemo(() => {
    const now = new Date('2026-10-05T23:59:59.999Z');
    if (timeRange === '7d') {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { from, to: now, label: '7 Days' };
    }
    if (timeRange === '30d') {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return { from, to: now, label: '30 Days' };
    }
    if (timeRange === '90d') {
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      return { from, to: now, label: '90 Days' };
    }
    if (timeRange === '1y') {
      const from = new Date(now);
      from.setFullYear(from.getFullYear() - 1);
      return { from, to: now, label: '1 Year' };
    }
    if (timeRange === 'custom' && appliedCustomRange) {
      const from = new Date(appliedCustomRange.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(appliedCustomRange.to);
      to.setHours(23, 59, 59, 999);
      const label = `${from.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} – ${to.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      return { from, to, label };
    }
    return null;
  }, [timeRange, appliedCustomRange]);

  // Fetch real analytics from backend
  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      if (timeRange === 'custom' && !appliedCustomRange) {
        return;
      }
      setLoading(true);
      try {
        const params = {};
        if (timeRange === 'custom' && appliedCustomRange) {
          params.start_date = appliedCustomRange.from;
          params.end_date = appliedCustomRange.to;
          params.date_range = 'custom';
        } else {
          params.date_range = timeRange;
        }

        const data = await recruiterAnalyticsService.getAnalytics(params);
        if (isMounted) {
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Failed to load hiring analytics:', err);
        if (isMounted) {
          addToast(err.message || 'Unable to load hiring analytics.', 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [timeRange, appliedCustomRange, addToast]);

  const handleTimeRangeChange = (e) => {
    const val = e.target.value;
    setTimeRange(val);
    setDateError('');
    if (val !== 'custom') {
      setAppliedCustomRange(null);
    }
  };

  const handleFromChange = (e) => {
    const val = e.target.value;
    setCustomFrom(val);
    if (customTo && val && val > customTo) {
      setDateError('From Date cannot be later than To Date.');
    } else {
      setDateError('');
    }
  };

  const handleToChange = (e) => {
    const val = e.target.value;
    setCustomTo(val);
    if (customFrom && val && customFrom > val) {
      setDateError('From Date cannot be later than To Date.');
    } else {
      setDateError('');
    }
  };

  const handleApplyCustomDate = (e) => {
    if (e) e.preventDefault();
    if (!customFrom || !customTo) {
      setDateError('Both From Date and To Date are required.');
      addToast('Both From Date and To Date are required.', 'error');
      return;
    }

    const fromDate = new Date(customFrom);
    const toDate = new Date(customTo);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      setDateError('Please enter a valid date range.');
      addToast('Please enter a valid date range.', 'error');
      return;
    }

    if (customFrom > customTo) {
      setDateError('From Date cannot be later than To Date.');
      addToast('From Date cannot be later than To Date.', 'error');
      return;
    }

    setDateError('');
    setAppliedCustomRange({ from: customFrom, to: customTo });
    addToast(
      `Applied custom date range: ${new Date(customFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to ${new Date(customTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      'success'
    );
  };

  const handleExport = async () => {
    setExporting(true);
    const label = activeDateRange?.label || (timeRange === 'custom' ? 'Custom Date Range' : timeRange);
    addToast(`Exporting recruitment report (${label})...`, 'info');
    try {
      const params = {};
      if (timeRange === 'custom' && appliedCustomRange) {
        params.start_date = appliedCustomRange.from;
        params.end_date = appliedCustomRange.to;
        params.date_range = 'custom';
      } else {
        params.date_range = timeRange;
      }
      await recruiterAnalyticsService.exportReport(params);
      addToast('Recruitment report exported successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to export recruitment report.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const isApplyDisabled = !customFrom || !customTo || Boolean(dateError) || (customFrom > customTo);

  // Derive metrics from backend response
  const totalApplicants = analyticsData?.summary?.total_applications ?? 0;
  const shortlistRate = analyticsData?.summary?.shortlist_conversion ?? 0;
  const totalInterviews = analyticsData?.summary?.interviews_conducted ?? 0;
  const avgTimeToHire = analyticsData?.summary?.average_time_to_hire_days ?? 0;

  const funnelReceived = analyticsData?.recruitment_funnel?.applications_received ?? totalApplicants;
  const funnelShortlisted = analyticsData?.recruitment_funnel?.profile_shortlisted ?? 0;
  const funnelInterviews = analyticsData?.recruitment_funnel?.technical_interviews ?? totalInterviews;
  const funnelOffers = analyticsData?.recruitment_funnel?.final_offers_hires ?? 0;

  const interviewRate = funnelShortlisted > 0 ? Math.round((funnelInterviews / funnelShortlisted) * 100) : 0;
  const offerRate = funnelInterviews > 0 ? Math.round((funnelOffers / funnelInterviews) * 100) : 0;

  // Monthly trends from backend velocity
  const monthlyTrends = useMemo(() => {
    if (analyticsData?.application_velocity && analyticsData.application_velocity.length > 0) {
      return analyticsData.application_velocity;
    }
    return [
      { period: 'Apr', month: 'Apr', applicants: 0, hired: 0 },
      { period: 'May', month: 'May', applicants: 0, hired: 0 },
      { period: 'Jun', month: 'Jun', applicants: 0, hired: 0 },
      { period: 'Jul', month: 'Jul', applicants: 0, hired: 0 },
      { period: 'Aug', month: 'Aug', applicants: 0, hired: 0 },
      { period: 'Sep', month: 'Sep', applicants: 0, hired: 0 },
    ];
  }, [analyticsData]);

  const maxAppCount = Math.max(1, ...monthlyTrends.map(m => m.applicants ?? m.total_applicants ?? 0));

  // Sources breakdown from backend
  const candidateSources = useMemo(() => {
    if (analyticsData?.candidate_sourcing && analyticsData.candidate_sourcing.length > 0) {
      return analyticsData.candidate_sourcing.map((s, idx) => ({
        ...s,
        count: s.applicants,
        color: s.color || ['var(--color-primary-600)', '#8b5cf6', '#10b981', '#f59e0b'][idx % 4],
      }));
    }
    return [
      { source: 'NTR Vikasa Job Portal Direct', count: 0, percentage: 0, color: 'var(--color-primary-600)' },
      { source: 'NTR Vikasa Mega Job Melas', count: 0, percentage: 0, color: '#8b5cf6' },
      { source: 'Skill Training Direct Pool', count: 0, percentage: 0, color: '#10b981' },
      { source: 'Employee Referrals', count: 0, percentage: 0, color: '#f59e0b' },
    ];
  }, [analyticsData]);

  // Jobs performance from backend
  const performanceJobs = analyticsData?.job_posting_performance || [];


  return (
    <div className="portal-page">
      {/* Header */}
      <div className="portal-header-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: 0 }}>
            Hiring & Recruitment Analytics
          </h1>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Comprehensive performance metrics, pipeline health, and hiring velocity for {recruiter?.company?.name}.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gray-700)', whiteSpace: 'nowrap' }}>
                Date Range:
              </span>
              <select
                className="form-control"
                value={timeRange}
                onChange={handleTimeRangeChange}
                style={{ height: '38px', borderRadius: '6px', fontSize: '0.85rem', minWidth: '130px' }}
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="1y">1 Year</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>

            {timeRange === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-600)', whiteSpace: 'nowrap' }}>From:</span>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={handleFromChange}
                    className="form-control"
                    style={{ height: '38px', borderRadius: '6px', fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-600)', whiteSpace: 'nowrap' }}>To:</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={handleToChange}
                    className="form-control"
                    style={{ height: '38px', borderRadius: '6px', fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                    required
                  />
                </div>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleApplyCustomDate}
                  disabled={isApplyDisabled}
                  style={{ height: '38px', padding: '0 0.85rem', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  Apply
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              icon={<Download size={14} />}
              loading={exporting}
              disabled={exporting}
              onClick={handleExport}
            >
              Export Report
            </Button>
          </div>

          {/* Validation error or active filter indicator */}
          {timeRange === 'custom' && dateError && (
            <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
              ⚠️ {dateError}
            </div>
          )}
          {timeRange === 'custom' && appliedCustomRange && !dateError && (
            <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
              Showing data from {new Date(appliedCustomRange.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to {new Date(appliedCustomRange.to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Total Applications</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-gray-900)', marginTop: '0.35rem' }}>
                {totalApplicants}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
            <ArrowUpRight size={14} /> Active period applications
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Shortlist Conversion</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary-600)', marginTop: '0.35rem' }}>
                {shortlistRate}%
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-600)' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
            <ArrowUpRight size={14} /> Pipeline pass conversion
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Interviews Conducted</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8b5cf6', marginTop: '0.35rem' }}>
                {totalInterviews}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <CalendarCheck size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>
            <span>Interview-to-Offer: <strong>{offerRate}%</strong></span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Avg Time-to-Hire</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981', marginTop: '0.35rem' }}>
                {avgTimeToHire > 0 ? `${avgTimeToHire} Days` : 'N/A'}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
            <Zap size={14} /> Real time-to-hire metric
          </div>
        </div>
      </div>

      {/* Middle Grid: Hiring Funnel & Monthly Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Visual Funnel */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: '0 0 0.5rem 0' }}>
            Full Recruitment Funnel
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>
            Stage-by-stage progression from talent discovery to final onboarding.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { stage: '1. Applications Received', count: funnelReceived, percent: 100, color: 'var(--color-primary-600)', sub: 'Top of funnel' },
              { stage: '2. Profile Shortlisted', count: funnelShortlisted, percent: shortlistRate, color: '#6366f1', sub: `${shortlistRate}% pass rate` },
              { stage: '3. Technical Interviews', count: funnelInterviews, percent: Math.round((funnelInterviews / (funnelReceived || 1)) * 100), color: '#8b5cf6', sub: `${interviewRate}% interview conversion` },
              { stage: '4. Final Offers & Hires', count: funnelOffers, percent: Math.round((funnelOffers / (funnelReceived || 1)) * 100), color: '#10b981', sub: 'Final selections' },
            ].map((st, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-gray-800)' }}>{st.stage}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: st.color }}>{st.count} candidates</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>({st.sub})</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--color-gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(st.percent, 8)}%`, height: '100%', background: st.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Volume Graph */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: '0 0 0.5rem 0' }}>
            Application Velocity & Hires Trend
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>
            Candidate volume and selections across your posted jobs.
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '1rem', gap: '0.75rem' }}>
            {monthlyTrends.map((item, idx) => {
              const appCount = item.total_applicants ?? item.applicants ?? 0;
              const hiredCount = item.hired_candidates ?? item.hired ?? 0;
              const heightPct = Math.round((appCount / maxAppCount) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-700)', marginBottom: '0.35rem' }}>
                    {appCount}
                  </div>
                  <div style={{
                    width: '100%',
                    maxWidth: '42px',
                    height: `${Math.max(heightPct, 4)}%`,
                    background: 'linear-gradient(180deg, var(--color-primary-600) 0%, #818cf8 100%)',
                    borderRadius: '6px 6px 0 0',
                    position: 'relative'
                  }}>
                    {/* Hired mini badge */}
                    {hiredCount > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.65rem',
                        color: '#fff',
                        fontWeight: 700
                      }}>
                        {hiredCount}h
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-600)', marginTop: '0.5rem', fontWeight: 500 }}>
                    {item.period || item.month}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--color-gray-600)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--color-primary-600)', borderRadius: '3px' }} />
              Total Applicants
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }} />
              Hired Candidates
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Job Performance Table & Sourcing Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Job Performance breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: 0 }}>
              Job Posting Performance
            </h3>
            <Link to="/recruiter/jobs" style={{ fontSize: '0.85rem', color: 'var(--color-primary-600)', fontWeight: 600, textDecoration: 'none' }}>
              Manage Jobs →
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-500)' }}>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Job Position</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Applicants</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Shortlisted</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Interviews</th>
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {performanceJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                      No job postings found in the selected date range.
                    </td>
                  </tr>
                ) : (
                  performanceJobs.map((job) => (
                    <tr key={job.job_id || job.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                        {job.job_title || job.title}
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', fontWeight: 400 }}>{job.department} • {job.work_mode || job.workMode}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>
                        {job.applicants ?? job.applicantsCount ?? 0}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                        {job.shortlisted ?? job.shortlistedCount ?? 0}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#8b5cf6', fontWeight: 600 }}>
                        {job.interviews ?? job.interviewsCount ?? 0}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: (job.status || '').toUpperCase() === 'PUBLISHED' ? '#ecfdf5' : '#fffbeb',
                          color: (job.status || '').toUpperCase() === 'PUBLISHED' ? '#059669' : '#d97706'
                        }}>
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Sourcing Channels */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: '0 0 0.5rem 0' }}>
            Candidate Sourcing Breakdown
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', marginBottom: '1.25rem' }}>
            Where your best applicants and successful hires are originating from.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {candidateSources.map((ch, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{ch.source}</span>
                  <span style={{ color: 'var(--color-gray-600)', fontWeight: 500 }}>{ch.applicants ?? ch.count ?? 0} applicants ({ch.percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--color-gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(ch.percentage, 0)}%`, height: '100%', background: ch.color || 'var(--color-primary-600)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Target size={24} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--color-primary-900)' }}>
              <strong>Job Mela Participation Boost:</strong> {analyticsData?.job_mela_insight?.message || 'Registering for upcoming NTR Vikasa Job Melas increases qualified applicant influx by +38%.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

