import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2, User, Mail, ShieldCheck, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { useRecruiter } from '../../context/RecruiterContext';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';

export default function AcceptInvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { getInvitationByToken, acceptInvitation } = useRecruiter();

  const [invitationState, setInvitationState] = useState({
    loading: true,
    valid: false,
    invitation: null,
    error: '',
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validate invitation on mount / token change
  useEffect(() => {
    if (!token) {
      setInvitationState({
        loading: false,
        valid: false,
        invitation: null,
        error: 'Missing or invalid invitation token.',
      });
      return;
    }

    const check = getInvitationByToken(token);
    if (check.valid && check.invitation) {
      setInvitationState({
        loading: false,
        valid: true,
        invitation: check.invitation,
        error: '',
      });
    } else {
      setInvitationState({
        loading: false,
        valid: false,
        invitation: check.invitation || null,
        error: check.reason || 'This invitation is invalid, has expired, or has already been accepted.',
      });
    }
  }, [token, getInvitationByToken]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Please create a password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    (async () => {
      try {
        // Attempt backend endpoint first
        await authService.acceptInvitation({
          token,
          name: invitationState.invitation?.name || 'Recruiter Member',
          password,
        });
      } catch (e) {
        // Fallback to local recruiter context
      }

      const result = acceptInvitation({
        token,
        password,
      });

      setSubmitting(false);

      if (result.success) {
        setSuccess(true);
        addToast(`Welcome to ${invitationState.invitation?.companyName || 'the team'}! Your account is now active.`, 'success');
        setTimeout(() => {
          navigate('/recruiter/dashboard');
        }, 1200);
      } else {
        setErrors({ general: result.error || 'Failed to complete invitation acceptance.' });
        addToast(result.error || 'Failed to accept invitation.', 'error');
      }
    })();
  };

  const inv = invitationState.invitation;

  return (
    <div className="auth-layout" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Left branding panel */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-12)',
          color: '#fff',
        }}
        className="hide-mobile"
      >
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 'var(--radius-2xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 30px rgba(0,0,0,0.3)',
                padding: 12,
              }}
            >
              <img src="/title_logo.png" alt="NTR Vikasa Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
            Hiring Team Invitation
          </h2>
          <p style={{ opacity: 0.85, lineHeight: 'var(--leading-relaxed)', fontSize: 'var(--text-base)', color: '#cbd5e1' }}>
            Join your organization’s recruitment workspace on NTR VIKASA to source, screen, and interview candidates collaboratively.
          </p>

          <div style={{
            marginTop: '2rem',
            padding: '1.25rem',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#93c5fd' }}>
              <ShieldCheck size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Secure Company Workspace</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
              Your account will be directly linked to your company’s talent pipeline with role-based access permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8) var(--space-6)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 24, right: 32 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
            <Link to="/" className="logo" style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/logo_image.png" alt="NTR Vikasa Logo" style={{ height: '46px', objectFit: 'contain' }} />
            </Link>
          </div>

          {invitationState.loading ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: 'var(--radius-2xl)' }}>
              <div className="spin" style={{ width: 36, height: 36, border: '3px solid var(--color-primary-200)', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>Validating your invitation...</p>
            </div>
          ) : !invitationState.valid ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-danger-200)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-danger-50)', color: 'var(--color-danger-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <AlertCircle size={28} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '0.5rem' }}>
                Invitation Expired or Invalid
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {invitationState.error}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" fullWidth>
                    Go to Sign In
                  </Button>
                </Link>
                <Link to="/contact" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" fullWidth>
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: 'var(--radius-2xl)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '0.5rem' }}>
                Account Created Successfully!
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)', marginBottom: '1.5rem' }}>
                Welcome to <strong>{inv?.companyName}</strong>. You are now logged in as <strong>{inv?.role}</strong>.
              </p>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => navigate('/recruiter/dashboard')}
                rightIcon={<ArrowRight size={16} />}
              >
                Go to Recruiter Dashboard
              </Button>
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)' }}>
              {/* Header Details */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-700)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  border: '1px solid var(--color-primary-200)'
                }}>
                  <Sparkles size={13} /> Official Hiring Invitation
                </span>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '0.25rem' }}>
                  Join {inv?.companyName}
                </h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', margin: 0 }}>
                  Create your secure password below to activate your account and join the workspace.
                </p>
              </div>

              {/* Invited Profile Summary Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Full Name:</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-gray-900)' }}>{inv?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Work Email:</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-800)', fontWeight: 600 }}>{inv?.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Assigned Role:</span>
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'var(--color-primary-100)',
                    color: 'var(--color-primary-800)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    {inv?.role}
                  </span>
                </div>
              </div>

              {/* Password Creation Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {errors.general && (
                  <div style={{ padding: '0.75rem', background: 'var(--color-danger-50)', color: 'var(--color-danger-700)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {errors.general}
                  </div>
                )}

                <FormField label="Create Password *" error={errors.password} required>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      leftIcon={<Lock size={16} />}
                      error={Boolean(errors.password)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-gray-400)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>

                <FormField label="Confirm Password *" error={errors.confirmPassword} required>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    leftIcon={<Lock size={16} />}
                    error={Boolean(errors.confirmPassword)}
                    required
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={submitting}
                  rightIcon={<ArrowRight size={16} />}
                  style={{ marginTop: '0.5rem' }}
                >
                  {submitting ? 'Creating Account...' : 'Create Account & Join'}
                </Button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '1.25rem', marginBottom: 0 }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>Sign In</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
