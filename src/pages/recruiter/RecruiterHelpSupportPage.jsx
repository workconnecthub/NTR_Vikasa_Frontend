import { useState } from 'react';
import {
  MessageSquare, Send, Phone, Mail, LifeBuoy, MapPin
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useToast } from '../../context/ToastContext';
import { useRecruiter } from '../../context/RecruiterContext';
import { useNotifications } from '../../context/NotificationContext';
import { dispatchRecruiterEvent, RECRUITER_NOTIFICATION_EVENTS } from '../../services/notificationEventService';
import recruiterSupportService from '../../services/recruiterSupportService';

export default function RecruiterHelpSupportPage() {
  const { recruiter } = useRecruiter();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Contact Support Ticket State
  const [issueType, setIssueType] = useState('Job Posting Approval & Moderation');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const recruiterName = recruiter?.name || 'Recruiter';
  const companyName = recruiter?.company?.name || 'ABC Technologies Pvt Ltd';
  const recruiterEmail = recruiter?.email || 'recruiter@example.com';

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please provide a subject summary for your query.'
      });
      return;
    }
    if (!description.trim()) {
      toast({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please describe your query before submitting.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await recruiterSupportService.submitSupportRequest({
        issue_category: issueType,
        subject: subject.trim(),
        description: description.trim(),
      });

      const ticketNumber = response.ticket_number || 'SUP-000001';
      setSubject('');
      setDescription('');
      toast({
        type: 'success',
        title: 'Support Ticket Submitted',
        message: `Ticket #${ticketNumber} created. Our employer support team will respond within 24 hours.`
      });

      dispatchRecruiterEvent({
        eventType: RECRUITER_NOTIFICATION_EVENTS.RECRUITER_SUPPORT_TICKET_CREATED,
        recruiterEmail,
        recipientName: recruiterName,
        addNotification,
        notification: {
          category: 'SUPPORT',
          title: `Support Ticket #${ticketNumber} Created`,
          message: `Your query regarding "${issueType}" has been logged. Our employer support desk will follow up.`,
          link: '/recruiter/help-support',
          meta: { ticketId: ticketNumber, issueType, subject }
        },
        meta: { ticketId: ticketNumber, issueType, subject }
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message || 'Failed to submit support request. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="recruiter-help-support-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      
      {/* Top Banner */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)', color: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'rgba(255,255,255,0.15)', color: '#c7d2fe', padding: '4px 12px', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-3)' }}>
            <LifeBuoy size={14} /> Recruiter Help Desk & Support
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: '#ffffff', marginBottom: 'var(--space-2)' }}>
            How can we help you today, {recruiterName.split(' ')[0]}?
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: '#cbd5e1', lineHeight: 'var(--leading-relaxed)' }}>
            Have questions or experiencing any issues regarding job postings, candidate pipelines, interview schedules, hiring team management, or Job Mela participation? Submit a ticket below or reach out through our official employer support channels.
          </p>
        </div>
      </div>

      {/* 2-Column Support Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(340px, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* Left Column: Support Channels & Helpful Information */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
            Official Employer Support Channels
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
            Direct contact channels dedicated to verified recruiters and hiring partners.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={18} />
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Employer Email Support</span>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>recruiter-support@ntrvikasa.ap.gov.in</strong>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>Priority response within 2–4 hours during business days</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--color-success-50, #f0fdf4)', color: 'var(--color-success-600, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={18} />
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Toll-Free Recruitment Helpline</span>
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

        {/* Right Column: Contact Support Form */}
        <div>
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <MessageSquare size={20} style={{ color: 'var(--color-primary-600)' }} />
              <div>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800 }}>Need More Help?</h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Submit a ticket to employer support</p>
              </div>
            </div>

            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <FormField label="Recruiter Name">
                <Input value={recruiterName} disabled />
              </FormField>

              <FormField label="Company & Registered Email">
                <Input value={`${companyName} (${recruiterEmail})`} disabled />
              </FormField>

              <FormField label="Issue Category" required>
                <Select
                  options={[
                    'Job Posting Approval & Moderation',
                    'Candidate Applications & Pipeline',
                    'Interview Scheduling & Virtual Links',
                    'Company Verification & Documents',
                    'Hiring Team & Collaborators',
                    'Job Mela Participation & Stalls',
                    'Other Employer Support Query'
                  ]}
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                />
              </FormField>

              <FormField label="Subject / Brief Summary" required>
                <Input
                  placeholder="e.g. Question regarding job approval status"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Description of Problem" required>
                <Textarea
                  rows={4}
                  placeholder="Please describe what assistance your hiring team requires..."
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
