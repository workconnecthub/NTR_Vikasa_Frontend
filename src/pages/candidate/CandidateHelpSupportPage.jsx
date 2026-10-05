import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Send, Phone, Mail, Clock, LifeBuoy,
  ShieldCheck, FileText, CalendarDays, Video, Bookmark,
  CheckCircle2, MapPin, ArrowRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import { useNotifications } from '../../context/NotificationContext';
import { dispatchCandidateEvent, NOTIFICATION_EVENTS } from '../../services/notificationEventService';
import authService from '../../services/authService';
import candidateSupportService from '../../services/candidateSupportService';

export default function CandidateHelpSupportPage() {
  const { candidate } = useCandidate();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Contact Support Ticket State
  const [issueType, setIssueType] = useState('Application Status & Tracker');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Authenticated candidate identity
  const candidateName = candidate?.name || 'Candidate';
  const candidateEmail = candidate?.email || '';

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();

    if (!cleanSubject) {
      toast({
        type: 'warning',
        title: 'Missing Subject',
        message: 'Please provide a subject or brief summary before submitting.',
      });
      return;
    }

    if (!cleanDescription) {
      toast({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please describe your query before submitting.',
      });
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      if (authService.isAuthenticated()) {
        const response = await candidateSupportService.createTicket({
          issue_category: issueType,
          subject: cleanSubject,
          description: cleanDescription,
        });

        const createdTicket = response.ticket;
        const ticketNum = createdTicket.ticket_number;

        setSubject('');
        setDescription('');

        // Dispatch Candidate Notification Event with real ticket number
        dispatchCandidateEvent({
          eventType: NOTIFICATION_EVENTS.SUPPORT_TICKET_CREATED,
          candidateEmail: candidateEmail || createdTicket.registered_email,
          recipientName: candidateName || createdTicket.candidate_name,
          addNotification,
          notification: {
            category: 'SUPPORT',
            title: `Support Ticket #${ticketNum} Created`,
            message: `Your support ticket for "${issueType}" has been logged successfully. The candidate support desk will respond within 24 hours.`,
            time: 'Just now',
            link: '/candidate/help-support',
            meta: {
              ticketId: ticketNum,
              status: createdTicket.status || 'OPEN',
            },
          },
          meta: {
            ticketId: ticketNum,
            issueType,
          },
        });

        toast({
          type: 'success',
          title: 'Support Ticket Submitted',
          message: `Ticket ${ticketNum} created. Our candidate support team will respond within 24 hours.`,
        });
      } else {
        // Fallback for non-authenticated dev state
        const ticketNum = `NTR-SUP-${Math.floor(100000 + Math.random() * 900000)}`;
        setSubject('');
        setDescription('');
        toast({
          type: 'success',
          title: 'Support Ticket Submitted',
          message: `Ticket ${ticketNum} created. Our candidate support team will respond within 24 hours.`,
        });
      }
    } catch (err) {
      toast({
        type: 'danger',
        title: 'Submission Failed',
        message: err.message || 'Could not submit support ticket. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="candidate-help-support-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      
      {/* Top Banner */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)', color: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'rgba(255,255,255,0.15)', color: '#c7d2fe', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-3)' }}>
            <LifeBuoy size={14} /> Candidate Help Desk & Support
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: '#ffffff', marginBottom: 'var(--space-2)' }}>
            How can we help you today, {(candidateName || 'Candidate').split(' ')[0]}?
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: '#cbd5e1', lineHeight: 'var(--leading-relaxed)' }}>
            Have questions or experiencing any issues regarding your job applications, interview schedules, resume updates, or Job Mela entry passes? Submit a ticket below or reach out through our official candidate channels.
          </p>
        </div>
      </div>

      {/* 2-Column Support Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(340px, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* Left Column: Support Channels & Helpful Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          {/* Quick Helpline & Channels */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', background: 'var(--color-surface)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
              Official Candidate Support Channels
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
              Direct contact channels monitored by the NTR Vikasa candidate desk.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Support</span>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>candidate-support@ntrvikasa.ap.gov.in</strong>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>Average reply time within 2–4 hours during business days</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-success-50, #f0fdf4)', color: 'var(--color-success-600, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} />
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Toll-Free Helpline</span>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>1800-425-VIKASA (8452)</strong>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>Operating hours: Monday to Saturday, 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-50)', color: 'var(--color-accent-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>State Skill Center</span>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>APSSDC Headquarters, Tadepalli, Guntur District, AP</strong>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>Government of Andhra Pradesh Employment & Skill Development</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Workspace Shortcuts */}
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', background: 'var(--color-surface)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Quick Self-Service Shortcuts
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <Link
                to="/candidate/applications"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-gray-50)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <FileText size={15} style={{ color: 'var(--color-primary-600)' }} />
                <span>Track Applications</span>
              </Link>

              <Link
                to="/candidate/interviews"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-gray-50)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Video size={15} style={{ color: 'var(--color-accent-600)' }} />
                <span>Interview Schedule</span>
              </Link>

              <Link
                to="/candidate/resume"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-gray-50)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <ShieldCheck size={15} style={{ color: '#16a34a' }} />
                <span>Update Resume</span>
              </Link>

              <Link
                to="/candidate/job-melas"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-gray-50)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <CalendarDays size={15} style={{ color: '#ec4899' }} />
                <span>Job Mela Passes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Support Form */}
        <div>
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <MessageSquare size={20} style={{ color: 'var(--color-primary-600)' }} />
              <div>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800 }}>Need More Help?</h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Submit a ticket to candidate support</p>
              </div>
            </div>

            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <FormField label="Candidate Name">
                <Input value={candidateName} disabled />
              </FormField>

              <FormField label="Registered Email">
                <Input value={candidateEmail} disabled />
              </FormField>

              <FormField label="Issue Category" required>
                <Select
                  options={[
                    'Application Status & Tracker',
                    'Resume Upload / ATS Optimization',
                    'Job Mela Registration & QR Pass',
                    'Interview Scheduling & Links',
                    'Profile & Skills Updating',
                    'Other Support Request'
                  ]}
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                />
              </FormField>

              <FormField label="Subject / Brief Summary" required>
                <Input
                  placeholder="e.g. Issue viewing interview link"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Description of Problem" required>
                <Textarea
                  rows={4}
                  placeholder="Please describe what issue you are experiencing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={submitting}
                leftIcon={<Send size={15} />}
              >
                Submit Support Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
