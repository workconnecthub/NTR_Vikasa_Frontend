import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Lock, Bell, Eye, Shield, Trash2, Save,
  CheckCircle2, AlertTriangle, Key, Mail, Smartphone
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { Toggle, Checkbox } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import { useNotifications } from '../../context/NotificationContext';
import { dispatchCandidateEvent, NOTIFICATION_EVENTS } from '../../services/notificationEventService';
import candidateSettingsService from '../../services/candidateSettingsService';
import authService from '../../services/authService';

export default function CandidateSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidate } = useCandidate();
  const { addNotification } = useNotifications();

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Privacy Settings
  const [profileVisible, setProfileVisible] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch initial settings from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const data = await candidateSettingsService.getSettings();
        if (isMounted && data) {
          setEmailAlerts(data.email_job_application_alerts ?? true);
          setSmsAlerts(data.sms_whatsapp_notifications ?? true);
          setInterviewReminders(data.upcoming_interview_reminders ?? true);
          setWeeklyDigest(data.weekly_job_recommendation_digest ?? false);
          setProfileVisible(data.visible_in_recruiter_talent_search ?? true);
          setAllowDirectMessages(data.direct_recruiter_messages ?? true);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter your current password.',
      });
      return;
    }
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        type: 'error',
        title: 'Validation Error',
        message: 'New passwords do not match or are empty.',
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        type: 'error',
        title: 'Validation Error',
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await candidateSettingsService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Dispatch Password Changed Notification & Email event
      dispatchCandidateEvent({
        eventType: NOTIFICATION_EVENTS.AUTH_PASSWORD_CHANGED,
        candidateEmail: candidate?.email || 'candidate@ntrvikasa.com',
        recipientName: candidate?.name || 'Candidate',
        addNotification,
        notification: {
          category: 'ACCOUNT',
          title: 'Security Alert: Password Updated',
          message: 'Your candidate account password was updated securely. If you did not make this change, please contact candidate support immediately.',
          time: 'Just now',
          link: '/candidate/settings',
        },
      });

      toast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your account password has been updated securely.',
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Password Update Failed',
        message: err.message || 'Failed to update password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      await candidateSettingsService.updateNotifications({
        email_job_application_alerts: emailAlerts,
        sms_whatsapp_notifications: smsAlerts,
        upcoming_interview_reminders: interviewReminders,
        weekly_job_recommendation_digest: weeklyDigest,
      });
      await candidateSettingsService.updatePrivacy({
        visible_in_recruiter_talent_search: profileVisible,
        direct_recruiter_messages: allowDirectMessages,
      });

      toast({
        type: 'success',
        title: 'Preferences Saved',
        message: 'Your notification and privacy preferences have been updated.',
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Error Saving Preferences',
        message: err.message || 'Failed to save preferences.',
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleToggleProfileVisible = async (checked) => {
    setProfileVisible(checked);
    try {
      await candidateSettingsService.updatePrivacy({
        visible_in_recruiter_talent_search: checked,
        direct_recruiter_messages: allowDirectMessages,
      });
    } catch (err) {
      setProfileVisible(!checked);
      toast({
        type: 'error',
        title: 'Privacy Update Failed',
        message: err.message || 'Failed to update profile visibility.',
      });
    }
  };

  const handleToggleDirectMessages = async (checked) => {
    setAllowDirectMessages(checked);
    try {
      await candidateSettingsService.updatePrivacy({
        visible_in_recruiter_talent_search: profileVisible,
        direct_recruiter_messages: checked,
      });
    } catch (err) {
      setAllowDirectMessages(!checked);
      toast({
        type: 'error',
        title: 'Privacy Update Failed',
        message: err.message || 'Failed to update direct messages setting.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteModalOpen(false);
    setDeleteLoading(true);
    try {
      await candidateSettingsService.deleteAccount();
      authService.logout();
      toast({
        type: 'info',
        title: 'Account Deactivated',
        message: 'Your candidate account has been permanently deactivated.',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Account Deletion Failed',
        message: err.message || 'Failed to deactivate account.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="candidate-settings-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Settings size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Account & Privacy Settings</h1>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 2 }}>
          Manage your password, email alerts, recruiter visibility, and privacy preferences
        </p>
      </div>

      {/* ── 1. Security & Change Password ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Lock size={18} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="card-title">Security & Password</h2>
        </div>

        <div className="card-body">
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 500 }}>
            <FormField label="Current Password" required>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </FormField>

            <FormField label="New Password" required hint="Minimum 8 characters with letters & numbers">
              <Input
                type="password"
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Confirm New Password" required>
              <Input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </FormField>

            <div>
              <Button type="submit" variant="primary" size="sm" loading={passwordLoading} leftIcon={<Key size={14} />}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── 2. Notification Preferences ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Bell size={18} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="card-title">Alerts & Notification Channels</h2>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Email Job & Application Alerts</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Receive email when your application status changes or when shortlisted</p>
            </div>
            <Toggle checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>SMS & WhatsApp Notifications</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Get urgent interview reminders and Job Mela venue instructions via SMS</p>
            </div>
            <Toggle checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Upcoming Interview Reminders</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Automated calendar reminder 2 hours prior to scheduled interviews</p>
            </div>
            <Toggle checked={interviewReminders} onChange={(e) => setInterviewReminders(e.target.checked)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Weekly Job Recommendation Digest</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Curated list of matching jobs sent once a week</p>
            </div>
            <Toggle checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
          </div>

          <div style={{ marginTop: 'var(--space-2)' }}>
            <Button variant="primary" size="sm" loading={savingPreferences} leftIcon={<Save size={14} />} onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </div>
        </div>
      </div>

      {/* ── 3. Profile Privacy & Recruiter Visibility ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Eye size={18} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="card-title">Profile Visibility & Privacy</h2>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Visible in Recruiter Talent Search</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Allow verified employers to discover your profile and invite you to apply</p>
            </div>
            <Toggle checked={profileVisible} onChange={(e) => handleToggleProfileVisible(e.target.checked)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Direct Recruiter Messages</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Allow hiring managers to contact you regarding relevant career openings</p>
            </div>
            <Toggle checked={allowDirectMessages} onChange={(e) => handleToggleDirectMessages(e.target.checked)} />
          </div>
        </div>
      </div>

      {/* ── 4. Danger Zone: Delete Account ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', borderColor: 'var(--color-danger-200)', background: 'var(--color-danger-50)' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-danger-700)' }}>
              Delete Candidate Account
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-600)', marginTop: 2 }}>
              Permanently delete your profile, resume, and application history. This action cannot be undone.
            </p>
          </div>

          <Button variant="danger" size="sm" loading={deleteLoading} leftIcon={<Trash2 size={14} />} onClick={() => setDeleteModalOpen(true)}>
            Delete My Account
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account?"
        message="Are you sure you want to delete your NTR VIKASA Job Portal Candidate profile? All saved resumes and application histories will be permanently removed."
        confirmText="Yes, Delete Account"
        danger
      />

    </div>
  );
}
