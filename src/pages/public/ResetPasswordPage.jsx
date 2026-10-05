import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!token) {
      setPasswordError('Password reset link is invalid or missing token.');
      return;
    }

    if (!newPassword) {
      setPasswordError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);

    try {
      // Connect to FastAPI Backend POST /api/v1/auth/reset-password
      await authService.resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccess(true);
      toast({
        type: 'success',
        title: 'Password Changed Successfully',
        message: 'Your password has been updated. Please sign in with your new credentials.',
      });
    } catch (err) {
      const msg = err.message || 'Password reset link is invalid or has expired.';
      setPasswordError(msg);
      toast({
        type: 'error',
        title: 'Password Reset Failed',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-6)' }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        
        {/* Logo */}
        <Link to="/" className="logo" style={{ justifyContent: 'center', display: 'inline-flex', marginBottom: 'var(--space-6)', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo_image.png" alt="NTR Vikasa Logo" style={{ height: '48px', objectFit: 'contain' }} />
        </Link>

        {/* ── Case 1: Missing Token in URL ── */}
        {!token && !success && (
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-md)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-8)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--color-danger-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger-600)' }}>
                <AlertCircle size={36} />
              </div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Invalid Reset Link</h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                This password reset link is missing a valid token or has expired. Please request a new link.
              </p>
              <Link to="/forgot-password" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                <Button variant="primary" fullWidth>
                  Request Reset Link
                </Button>
              </Link>
            </div>
            <div className="card-footer" style={{ textAlign: 'center', padding: 'var(--space-4) var(--space-8)' }}>
              <Link to="/login" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* ── Case 2: Valid Token Form ── */}
        {token && !success && (
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-md)' }}>
            <div className="card-body" style={{ padding: 'var(--space-8)' }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-3)'
                }}>
                  <KeyRound size={26} />
                </div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  Create New Password
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Enter and confirm your new secure password.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'left' }}>
                <FormField label="New Password*" htmlFor="newPassword" hint="Min 8 characters" required>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                    leftIcon={<Lock size={16} />}
                    required
                  />
                </FormField>

                <FormField label="Confirm New Password*" htmlFor="confirmPassword" required>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                    leftIcon={<Lock size={16} />}
                    required
                  />
                </FormField>

                {passwordError && (
                  <p className="form-error" role="alert" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={13} />
                    <span>{passwordError}</span>
                  </p>
                )}

                <Button type="submit" variant="primary" fullWidth loading={loading} style={{ marginTop: 'var(--space-2)' }}>
                  Reset Password
                </Button>
              </form>
            </div>

            <div className="card-footer" style={{ textAlign: 'center', padding: 'var(--space-4) var(--space-8)' }}>
              <Link to="/login" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* ── Case 3: Success Screen ── */}
        {success && (
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-md)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-8)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--color-success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success-600)' }}>
                <CheckCircle2 size={36} />
              </div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Password Changed Successfully</h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                Your password has been updated. Please sign in with your new password.
              </p>
              <Link to="/login" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                <Button variant="primary" fullWidth rightIcon={<ArrowRight size={16} />}>
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
