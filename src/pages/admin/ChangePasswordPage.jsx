import { useState } from 'react';
import {
  Lock, Key, ShieldCheck, AlertCircle, Info, CheckCircle2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { useAdmin } from '../../context/AdminContext';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import { dispatchAdminEvent, ADMIN_NOTIFICATION_EVENTS } from '../../services/notificationEventService';

export default function AdminChangePasswordPage() {
  const { currentAdmin } = useAdmin();
  const { addNotification } = useNotifications();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading and feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [submittedMessageType, setSubmittedMessageType] = useState('info'); // 'info' | 'success' | 'error'

  const validateForm = () => {
    const errs = {};

    if (!currentPassword.trim()) {
      errs.currentPassword = 'Current password is required.';
    }

    if (!newPassword.trim()) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters.';
    } else if (!/[0-9]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one number.';
    } else if (!/[a-zA-Z]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one letter.';
    }

    if (!confirmPassword.trim()) {
      errs.confirmPassword = 'Confirm new password is required.';
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errs.confirmPassword = 'New password and confirmation password do not match.';
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      errs.newPassword = 'New password must be different from the current password.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmittedMessage('');
    setSubmittedMessageType('info');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear validation errors
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // Dispatch audit notification event
      dispatchAdminEvent({
        eventType: ADMIN_NOTIFICATION_EVENTS.ADMIN_PASSWORD_CHANGED,
        adminEmail: currentAdmin?.email || 'admin1@ntrvikasa.com',
        recipientName: currentAdmin?.name || 'Platform Administrator',
        addNotification,
        notification: {
          category: 'SECURITY',
          priority: 'HIGH',
          title: 'Security Alert: Admin Password Updated',
          message: 'Your administrator account credentials were updated. If this was not initiated by you, alert cybersecurity operations immediately.',
          link: '/admin/change-password',
          meta: { action: 'Admin Password Change', date: new Date().toISOString() }
        },
        meta: { action: 'Admin Password Change' }
      });

      const successMsg = response?.message || 'Password changed successfully.';
      setSubmittedMessage(successMsg);
      setSubmittedMessageType('success');
      toast.success(successMsg);

      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to change password. Please verify your current credentials.';
      setSubmittedMessage(errorMsg);
      setSubmittedMessageType('error');
      toast.error(errorMsg);

      // Highlight field if relevant
      if (errorMsg.toLowerCase().includes('current password')) {
        setErrors(prev => ({ ...prev, currentPassword: errorMsg }));
      } else if (errorMsg.toLowerCase().includes('match')) {
        setErrors(prev => ({ ...prev, confirmPassword: errorMsg }));
      } else if (errorMsg.toLowerCase().includes('different')) {
        setErrors(prev => ({ ...prev, newPassword: errorMsg }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setSubmittedMessage('');
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="admin-change-password-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      {/* ── Page Header ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Lock size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--color-gray-900)' }}>
              Change Password
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Update your administrator account password to maintain system security
            </p>
          </div>
        </div>
      </div>

      <div className="admin-password-grid">
        {/* ── Password Change Form ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Key size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title">Password Credentials</h2>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 540, width: '100%', boxSizing: 'border-box' }}>
              {submittedMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: submittedMessageType === 'error' ? 'var(--color-danger-50)' : submittedMessageType === 'success' ? 'var(--color-success-50, #f0fdf4)' : 'var(--color-primary-50)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${submittedMessageType === 'error' ? 'var(--color-danger-200)' : submittedMessageType === 'success' ? 'var(--color-success-200, #bbf7d0)' : 'var(--color-primary-200)'}`,
                  fontSize: 'var(--text-xs)',
                  color: submittedMessageType === 'error' ? 'var(--color-danger-800)' : submittedMessageType === 'success' ? 'var(--color-success-800, #166534)' : 'var(--color-primary-800)'
                }}>
                  {submittedMessageType === 'error' ? (
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--color-danger-600)' }} />
                  ) : submittedMessageType === 'success' ? (
                    <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--color-success-600)' }} />
                  ) : (
                    <Info size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--color-primary-600)' }} />
                  )}
                  <span>{submittedMessage}</span>
                </div>
              )}

              {/* Current Password */}
              <FormField
                label="Current Password"
                required
                error={errors.currentPassword}
              >
                <Input
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={handleInputChange(setCurrentPassword, 'currentPassword')}
                  error={!!errors.currentPassword}
                />
              </FormField>

              {/* New Password */}
              <FormField
                label="New Password"
                required
                hint="Minimum 8 characters containing letters and numbers"
                error={errors.newPassword}
              >
                <Input
                  type="password"
                  placeholder="Enter a strong new password"
                  value={newPassword}
                  onChange={handleInputChange(setNewPassword, 'newPassword')}
                  error={!!errors.newPassword}
                />
              </FormField>

              {/* Confirm New Password */}
              <FormField
                label="Confirm New Password"
                required
                error={errors.confirmPassword}
              >
                <Input
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                  error={!!errors.confirmPassword}
                />
              </FormField>

              <div style={{ paddingTop: 'var(--space-2)' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Key size={16} />}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="admin-change-password-btn"
                >
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Security Guidelines / Requirements ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', alignSelf: 'start', width: '100%', boxSizing: 'border-box' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title">Password Security Policy</h2>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              To ensure state governance compliance and prevent unauthorized access, ensure your password meets the following criteria:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                <CheckCircle2 size={14} style={{ color: newPassword.length >= 8 ? 'var(--color-success-600)' : 'var(--color-gray-400)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: newPassword.length >= 8 ? 'var(--color-gray-800)' : 'var(--color-gray-600)' }}>
                  At least 8 characters in length
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                <CheckCircle2 size={14} style={{ color: /[0-9]/.test(newPassword) ? 'var(--color-success-600)' : 'var(--color-gray-400)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: /[0-9]/.test(newPassword) ? 'var(--color-gray-800)' : 'var(--color-gray-600)' }}>
                  Includes at least one numeric digit (0-9)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                <CheckCircle2 size={14} style={{ color: (confirmPassword && newPassword === confirmPassword) ? 'var(--color-success-600)' : 'var(--color-gray-400)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: (confirmPassword && newPassword === confirmPassword) ? 'var(--color-gray-800)' : 'var(--color-gray-600)' }}>
                  Confirm password matches new password exactly
                </span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-gray-200)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-gray-600)',
              marginTop: 'var(--space-2)'
            }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 1, color: 'var(--color-primary-600)' }} />
              <span>
                Administrative session activity and password updates are logged in the audit registry for compliance monitoring.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
