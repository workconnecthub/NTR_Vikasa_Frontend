/**
 * Shared NotificationsPage — used by candidate, recruiter, and admin portals.
 * Driven by NotificationContext. Supports: filter tabs, category filter,
 * bulk mark-read, dismiss, empty state, and detail expansion.
 *
 * Usage:
 *   <PortalNotificationsPage portal="candidate" />
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Check, Trash2, ArrowRight, Briefcase, CalendarDays,
  User, Info, Building2, CheckCircle2, X, LifeBuoy,
  Search, ShieldCheck, Users, AlertTriangle,
} from 'lucide-react';
import { useNotifications, NOTIF_CATEGORY } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../ui/States';
import Button from '../ui/Button';

// Category icon map
const CAT_ICONS = {
  APPLICATION:  <Briefcase size={20} />,
  SHORTLIST:    <CheckCircle2 size={20} />,
  INTERVIEW:    <CalendarDays size={20} />,
  OFFER:        <CheckCircle2 size={20} />,
  REJECTION:    <X size={20} />,
  JOB_MELA:     <CalendarDays size={20} />,
  JOB_APPROVAL: <CheckCircle2 size={20} />,
  ACCOUNT:      <User size={20} />,
  SYSTEM:       <Info size={20} />,
  SUPPORT:      <LifeBuoy size={20} />,
  RECRUITER:    <Building2 size={20} />,
  COMPANY:      <Building2 size={20} />,
  VERIFICATION: <ShieldCheck size={20} />,
  TEAM:         <Users size={20} />,
  REPORT:       <AlertTriangle size={20} />,
  SECURITY:     <ShieldCheck size={20} />,
};

function NotifIcon({ category }) {
  const cat = NOTIF_CATEGORY[category] || NOTIF_CATEGORY.SYSTEM;
  return (
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-xl)',
      background: cat.bg,
      color: cat.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {CAT_ICONS[category] || <Bell size={20} />}
    </div>
  );
}

function FilterPill({ label, active, onClick, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 14px',
        borderRadius: 'var(--radius-full)',
        border: active ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-border)',
        background: active ? 'var(--color-primary-600)' : 'var(--color-surface)',
        color: active ? '#fff' : 'var(--color-text-muted)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          background: active ? 'rgba(255,255,255,0.25)' : 'var(--color-gray-100)',
          color: active ? '#fff' : 'var(--color-text-muted)',
          padding: '0 5px',
          borderRadius: 'var(--radius-full)',
          fontSize: '10px',
          fontWeight: 700,
          minWidth: 18,
          textAlign: 'center',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

const CANDIDATE_CATEGORIES = [
  'ALL',
  'SHORTLIST',
  'INTERVIEW',
  'APPLICATION',
  'JOB_MELA',
  'OFFER',
  'REJECTION',
  'ACCOUNT',
  'SUPPORT',
];

export default function PortalNotificationsPage({ portal = 'candidate' }) {
  const {
    getNotifs,
    getUnreadCount,
    markRead,
    markAllRead,
    dismiss,
    bulkMarkRead,
    bulkDismiss,
    fetchCandidateNotifications,
  } = useNotifications();
  const toast = useToast();

  const [readFilter, setReadFilter]   = useState('all');       // 'all' | 'unread'
  const [catFilter, setCatFilter]     = useState('ALL');        // category key or 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded]       = useState(null);         // id of expanded item
  const [selected, setSelected]       = useState(new Set());    // bulk selection

  // Sync candidate notifications with backend using debounced filters
  useEffect(() => {
    if (portal !== 'candidate' || !fetchCandidateNotifications) return;

    const timer = setTimeout(() => {
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (catFilter !== 'ALL') {
        params.category = catFilter.toLowerCase();
      }
      if (readFilter === 'unread') {
        params.is_read = false;
      }
      fetchCandidateNotifications(params);
    }, 250);

    return () => clearTimeout(timer);
  }, [portal, searchQuery, catFilter, readFilter, fetchCandidateNotifications]);

  const notifications = getNotifs(portal);
  const unreadCount   = getUnreadCount(portal);

  // Categories present in the list (fixed candidate categories or derived)
  const presentCategories = portal === 'candidate'
    ? CANDIDATE_CATEGORIES
    : ['ALL', ...new Set(notifications.map(n => n.category))];

  // Filter chain
  const filtered = notifications.filter(n => {
    if (readFilter === 'unread' && n.read)    return false;
    if (catFilter !== 'ALL' && n.category !== catFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Actions
  function handleMarkRead(id) {
    markRead(portal, id);
  }

  function handleMarkAllRead() {
    markAllRead(portal);
    toast.success('All notifications marked as read.');
  }

  function handleDismiss(id) {
    dismiss(portal, id);
    toast.info('Notification dismissed.');
    if (expanded === id) setExpanded(null);
  }

  function handleBulkMarkRead() {
    const ids = Array.from(selected);
    if (portal === 'candidate' && bulkMarkRead) {
      bulkMarkRead(portal, ids);
    } else {
      ids.forEach(id => markRead(portal, id));
    }
    toast.success(`${selected.size} notification${selected.size > 1 ? 's' : ''} marked as read.`);
    setSelected(new Set());
  }

  function handleBulkDismiss() {
    const ids = Array.from(selected);
    if (portal === 'candidate' && bulkDismiss) {
      bulkDismiss(portal, ids);
    } else {
      ids.forEach(id => dismiss(portal, id));
    }
    toast.info(`${selected.size} notification${selected.size > 1 ? 's' : ''} dismissed.`);
    setSelected(new Set());
    setExpanded(null);
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpand(id) {
    setExpanded(prev => prev === id ? null : id);
    // Auto mark as read when expanded
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) markRead(portal, id);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', paddingBottom: 'var(--space-16)' }}>

      {/* ── Header Card ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
              <Bell size={22} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Notification Centre</h1>
              {unreadCount > 0 && (
                <span style={{
                  background: 'var(--color-primary-600)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 9px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {unreadCount} New
                </span>
              )}
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Real-time alerts about your account activity, jobs, and applications
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {selected.size > 0 ? (
              <>
                <Button size="sm" variant="outline" onClick={handleBulkMarkRead}
                  leftIcon={<Check size={13} />}>
                  Mark {selected.size} Read
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkDismiss}
                  leftIcon={<Trash2 size={13} />}>
                  Dismiss {selected.size}
                </Button>
              </>
            ) : (
              unreadCount > 0 && (
                <Button size="sm" variant="outline" onClick={handleMarkAllRead}
                  leftIcon={<Check size={13} />}>
                  Mark All Read
                </Button>
              )
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <input
            type="search"
            placeholder="Search notifications…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              background: 'var(--color-gray-50)',
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter tabs: all / unread */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterPill label="All" active={readFilter === 'all'} onClick={() => setReadFilter('all')}
            count={notifications.length} />
          <FilterPill label="Unread" active={readFilter === 'unread'} onClick={() => setReadFilter('unread')}
            count={unreadCount} />

          <span style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 var(--space-1)' }} />

          {/* Category filters */}
          {presentCategories.map(cat => (
            <FilterPill
              key={cat}
              label={cat === 'ALL' ? 'All Categories' : (NOTIF_CATEGORY[cat]?.label || cat)}
              active={catFilter === cat}
              onClick={() => setCatFilter(cat)}
            />
          ))}
        </div>
      </div>

      {/* ── Notification List ── */}
      {filtered.length === 0 ? (
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-12)' }}>
          <EmptyState
            icon={<Bell size={40} style={{ opacity: 0.3 }} />}
            title={readFilter === 'unread' ? 'All caught up!' : (searchQuery ? 'No results found' : 'No Notifications')}
            description={
              readFilter === 'unread'
                ? "You've read everything. New alerts will appear here in real-time."
                : searchQuery
                ? `No notifications matching "${searchQuery}". Try a different keyword.`
                : "You haven't received any notifications yet. We'll alert you as soon as something happens."
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtered.map((notif) => {
            const cat = NOTIF_CATEGORY[notif.category] || NOTIF_CATEGORY.SYSTEM;
            const isExpanded = expanded === notif.id;
            const isSelected = selected.has(notif.id);

            return (
              <div
                key={notif.id}
                className="card"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-5)',
                  background: notif.read
                    ? (isSelected ? 'var(--color-gray-50)' : 'var(--color-surface)')
                    : 'var(--color-primary-50)',
                  border: isSelected
                    ? '1.5px solid var(--color-primary-400)'
                    : notif.read
                    ? '1px solid var(--color-border)'
                    : '1px solid var(--color-primary-200)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onClick={() => toggleExpand(notif.id)}
              >
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  {/* Selection checkbox */}
                  <div
                    onClick={e => { e.stopPropagation(); toggleSelect(notif.id); }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--color-primary-600)' : '1.5px solid var(--color-border)',
                      background: isSelected ? 'var(--color-primary-600)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected && <Check size={11} color="#fff" />}
                  </div>

                  <NotifIcon category={notif.category} />

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {/* Category pill */}
                        <span style={{
                          background: cat.bg,
                          color: cat.color,
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                          whiteSpace: 'nowrap',
                        }}>
                          {cat.label}
                        </span>
                        {notif.priority && notif.priority !== 'NORMAL' && (
                          <span style={{
                            background: notif.priority === 'HIGH' ? '#fef2f2' : '#fffbeb',
                            color: notif.priority === 'HIGH' ? '#dc2626' : '#d97706',
                            border: notif.priority === 'HIGH' ? '1px solid #fecaca' : '1px solid #fef3c7',
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            {notif.priority}
                          </span>
                        )}
                        {!notif.read && (
                          <span style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: 'var(--color-primary-600)',
                            display: 'inline-block',
                            flexShrink: 0,
                          }} />
                        )}
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                        {notif.time}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: notif.read ? 600 : 700,
                      color: 'var(--color-text)',
                      marginTop: 'var(--space-1)',
                      lineHeight: 1.4,
                    }}>
                      {notif.title}
                    </h3>

                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      lineHeight: 'var(--leading-relaxed)',
                      marginTop: 'var(--space-1)',
                      ...(isExpanded ? {} : {
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }),
                    }}>
                      {notif.message}
                    </p>

                    {/* Metadata Badges */}
                    {notif.meta && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'var(--space-2)' }}>
                        {notif.meta.appNumber && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: notif.meta.appNumber.startsWith('NTR-') ? '#fdf2f8' : '#eff6ff',
                            color: notif.meta.appNumber.startsWith('NTR-') ? '#be185d' : '#1d4ed8',
                            border: `1px solid ${notif.meta.appNumber.startsWith('NTR-') ? '#fbcfe8' : '#bfdbfe'}`,
                            fontFamily: 'var(--font-mono, monospace)'
                          }}>
                            {notif.meta.appNumber.startsWith('NTR-') ? 'Mela App: ' : 'App No: '}{notif.meta.appNumber}
                          </span>
                        )}
                        {notif.meta.company && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-gray-100)',
                            color: 'var(--color-text-muted)'
                          }}>
                            {notif.meta.company}
                          </span>
                        )}
                        {notif.meta.status && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #bbf7d0'
                          }}>
                            {notif.meta.status}
                          </span>
                        )}
                        {notif.meta.passId && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: '#fdf2f8',
                            color: '#be185d',
                            border: '1px solid #fbcfe8'
                          }}>
                            Pass: {notif.meta.passId}
                          </span>
                        )}
                        {notif.meta.format && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: '#f5f3ff',
                            color: '#6d28d9',
                            border: '1px solid #ddd6fe'
                          }}>
                            {notif.meta.format}
                          </span>
                        )}
                        {notif.meta.ticketId && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            border: '1px solid #bae6fd'
                          }}>
                            Ticket #{notif.meta.ticketId}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions row */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {notif.link && (
                        <Link
                          to={notif.link}
                          onClick={() => markRead(portal, notif.id)}
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            color: 'var(--color-primary-600)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          View Details <ArrowRight size={11} />
                        </Link>
                      )}

                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notif.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: 0,
                          }}
                        >
                          <Check size={11} /> Mark read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDismiss(notif.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--text-xs)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: 0,
                        }}
                        title="Dismiss notification"
                      >
                        <Trash2 size={11} /> Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Showing count */}
      {filtered.length > 0 && (
        <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}
    </div>
  );
}
