import { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Building2, Briefcase, FileText,
  GraduationCap, CalendarDays, BarChart3, Download, Loader2
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import adminAnalyticsService from '../../services/adminAnalyticsService';

export default function AdminAnalyticsPage() {
  const { addToast } = useToast();

  const [timeRange, setTimeRange] = useState('30D');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [appliedCustomRange, setAppliedCustomRange] = useState(null);
  const [dateError, setDateError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    period: {
      type: '30d',
      start_date: '',
      end_date: '',
      label: 'Last 30 Days',
    },
    kpis: {
      total_platform_users: 0,
      active_candidates: 0,
      verified_recruiters: 0,
      registered_companies: 0,
      live_posted_jobs: 0,
      submitted_applications: 0,
      active_internships: 0,
      mela_registrations: 0,
    },
    hiring_demand_by_sector: [],
    monthly_placement_trajectory: [],
  });

  // Fetch analytics from API on timeRange or custom date change
  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const params = {};
        if (timeRange === 'CUSTOM') {
          if (!appliedCustomRange) {
            setIsLoading(false);
            return;
          }
          params.period = 'custom';
          params.start_date = appliedCustomRange.from;
          params.end_date = appliedCustomRange.to;
        } else {
          params.period = timeRange.toLowerCase();
        }

        const data = await adminAnalyticsService.getAnalytics(params);
        if (isMounted && data) {
          setAnalyticsData(data);
        }
      } catch (err) {
        console.warn('Failed to load platform analytics:', err);
        if (isMounted) {
          addToast(err.message || 'Failed to load platform analytics from server.', 'error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [timeRange, appliedCustomRange]);

  const handleApplyCustomDate = (e) => {
    if (e) e.preventDefault();
    if (!customFrom || !customTo) {
      setDateError('Please select both From Date and To Date.');
      addToast('Please select both From Date and To Date.', 'error');
      return;
    }

    const fromDate = new Date(customFrom);
    const toDate = new Date(customTo);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      setDateError('Please enter a valid date range.');
      addToast('Please enter a valid date range.', 'error');
      return;
    }

    if (fromDate > toDate) {
      setDateError('From Date cannot be after To Date.');
      addToast('From Date cannot be after To Date.', 'error');
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
    setIsExporting(true);
    try {
      const params = {};
      if (timeRange === 'CUSTOM' && appliedCustomRange) {
        params.period = 'custom';
        params.start_date = appliedCustomRange.from;
        params.end_date = appliedCustomRange.to;
      } else {
        params.period = timeRange.toLowerCase();
      }

      await adminAnalyticsService.exportAnalyticsCsv(params);
      addToast(`Platform analytics report (${analyticsData.period?.label || timeRange}) exported to CSV successfully.`, 'success');
    } catch (err) {
      console.warn('Failed to export analytics report:', err);
      addToast(err.message || 'Failed to export analytics report CSV.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = analyticsData.kpis || {};
  const isCustomRange = timeRange === 'CUSTOM';

  const CORE_METRICS = [
    { label: 'Total Platform Users',  value: `${(kpis.total_platform_users || 0).toLocaleString()}`, change: isCustomRange ? 'in selected range' : '+320 this week', positive: true, icon: <Users size={20} />, iconBg: '#eef2ff', iconColor: '#4f46e5' },
    { label: 'Active Candidates',     value: `${(kpis.active_candidates || 0).toLocaleString()}`, change: isCustomRange ? 'in selected range' : '+240 today', positive: true, icon: <Users size={20} />, iconBg: '#f0fdf4', iconColor: '#16a34a' },
    { label: 'Verified Recruiters',   value: `${(kpis.verified_recruiters || 0).toLocaleString()}`, change: isCustomRange ? 'in selected range' : '+18 this week', positive: true, icon: <Building2 size={20} />, iconBg: '#fdf4ff', iconColor: '#c026d3' },
    { label: 'Registered Companies',  value: `${(kpis.registered_companies || 0).toLocaleString()}`, change: isCustomRange ? 'in selected range' : '+14 this month', positive: true, icon: <Building2 size={20} />, iconBg: '#eff6ff', iconColor: '#2563eb' },
    { label: 'Live Posted Jobs',      value: `${(kpis.live_posted_jobs || 0).toLocaleString()}`, change: isCustomRange ? 'in selected range' : '+85 new', positive: true, icon: <Briefcase size={20} />, iconBg: '#fffbeb', iconColor: '#d97706' },
    { label: 'Submitted Applications',value: `${(kpis.submitted_applications || 0).toLocaleString()}`, change: isCustomRange ? 'in selected range' : '+1.4k this week', positive: true, icon: <FileText size={20} />, iconBg: '#f8fafc', iconColor: '#475569' },
    { label: 'Active Internships',    value: `${(kpis.active_internships || 0).toLocaleString()}`, change: isCustomRange ? 'in selected range' : '+32 campus', positive: true, icon: <GraduationCap size={20} />, iconBg: '#ecfdf5', iconColor: '#059669' },
    { label: 'Mela Registrations',    value: `${(kpis.mela_registrations || 0).toLocaleString()}`, change: isCustomRange ? 'in selected range' : '+850 recent', positive: true, icon: <CalendarDays size={20} />, iconBg: '#fff1f2', iconColor: '#e11d48' },
  ];

  const SECTOR_DISTRIBUTION = analyticsData.hiring_demand_by_sector?.length > 0
    ? analyticsData.hiring_demand_by_sector
    : [
        { name: 'Information Technology & Software', share: '0%', count: '0 Jobs', color: '#3b82f6' },
        { name: 'Banking, Financial Services & Insurance', share: '0%', count: '0 Jobs', color: '#10b981' },
        { name: 'Healthcare Diagnostics & Pharma', share: '0%', count: '0 Jobs', color: '#8b5cf6' },
        { name: 'E-Commerce, Logistics & Retail', share: '0%', count: '0 Jobs', color: '#f59e0b' },
        { name: 'Core Engineering & Manufacturing', share: '0%', count: '0 Jobs', color: '#ec4899' },
      ];

  const displayedMonthlyGrowth = analyticsData.monthly_placement_trajectory || [];

  return (
    <div className="portal-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <TrendingUp size={22} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Platform-Wide Hiring Analytics</h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)', margin: 0 }}>
              Real-time platform metrics, user adoption trends, sector demand distribution, and placement funnel performance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'var(--color-gray-100)', padding: '3px', borderRadius: '8px', flexWrap: 'wrap', gap: 2 }}>
              {['7D', '30D', '90D', '1Y', 'Custom Date'].map((range) => {
                const isCustom = range === 'Custom Date';
                const isSelected = isCustom ? timeRange === 'CUSTOM' : timeRange === range;
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      if (isCustom) {
                        setTimeRange('CUSTOM');
                      } else {
                        setTimeRange(range);
                        setAppliedCustomRange(null);
                        setDateError('');
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isSelected ? '#fff' : 'transparent',
                      color: isSelected ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {range}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              onClick={handleExport}
              disabled={isExporting || isLoading}
            >
              {isExporting ? 'Exporting...' : 'Export Report'}
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Selector (shown when Custom Date tab is selected) */}
      {timeRange === 'CUSTOM' && (
        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-primary-200, #bfdbfe)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CalendarDays size={18} style={{ color: 'var(--color-primary-600)' }} />
              <div>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', display: 'block' }}>
                  Custom Date Range Filter
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Select From Date and To Date to filter analytics metrics and placement trends.
                </span>
              </div>
            </div>

            {appliedCustomRange && (
              <span style={{
                fontSize: '11px',
                background: 'var(--color-primary-50, #eff6ff)',
                color: 'var(--color-primary-700, #1d4ed8)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                border: '1px solid var(--color-primary-200, #bfdbfe)'
              }}>
                Active Range: {new Date(appliedCustomRange.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} – {new Date(appliedCustomRange.to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          <form
            onSubmit={handleApplyCustomDate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                From Date:
              </label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => {
                  setCustomFrom(e.target.value);
                  setDateError('');
                }}
                className="form-control"
                style={{ height: 36, padding: '4px 10px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                To Date:
              </label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setDateError('');
                }}
                className="form-control"
                style={{ height: 36, padding: '4px 10px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-md)' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <Button type="submit" variant="primary" size="sm">
                Apply
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setTimeRange('30D');
                  setAppliedCustomRange(null);
                  setDateError('');
                  setCustomFrom('');
                  setCustomTo('');
                }}
              >
                Reset to 30D
              </Button>
            </div>
          </form>

          {dateError && (
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
              ⚠️ {dateError}
            </div>
          )}
        </div>
      )}

      {/* ── 1. Platform Key Metrics Grid (8 KPI Cards) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-500)', margin: 0, letterSpacing: '0.05em' }}>
            Platform Scale KPIs
          </h2>
          {analyticsData.period?.label && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Period: {analyticsData.period.label}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {CORE_METRICS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* ── 2. Visual Distribution & Funnel Analysis ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>

        {/* Industry Sector Demand */}
        <Card style={{ borderRadius: 'var(--radius-2xl)' }}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--color-primary-600)' }} />
              <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Hiring Demand by Industry Sector
              </h2>
            </div>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {SECTOR_DISTRIBUTION.map((sector) => (
              <div key={sector.name || sector.sector}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{sector.name || sector.sector}</span>
                  <span style={{ color: 'var(--color-gray-500)', fontWeight: 500 }}>{sector.count || `${sector.job_count || 0} Jobs`} ({sector.share || `${sector.percentage || 0}%`})</span>
                </div>
                <div style={{ height: '8px', background: 'var(--color-gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: sector.share || `${sector.percentage || 0}%`,
                      height: '100%',
                      background: sector.color || '#3b82f6',
                      borderRadius: '4px',
                      transition: 'width 300ms ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Monthly Platform Trajectory */}
        <Card style={{ borderRadius: 'var(--radius-2xl)' }}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: '#16a34a' }} />
              <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Monthly Platform Placement Trajectory
              </h2>
            </div>
          </CardHeader>
          <CardBody style={{ padding: 0 }}>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-gray-200)', color: 'var(--color-gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Month</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Candidates</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Active Jobs</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Placements</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMonthlyGrowth.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No monthly placement records available for this period.
                      </td>
                    </tr>
                  ) : (
                    displayedMonthlyGrowth.map((row) => (
                      <tr key={row.month} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>{row.month}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-gray-700)' }}>{(row.candidates || 0).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-gray-700)' }}>{(row.active_jobs || 0).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 700 }}>{(row.placements || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
