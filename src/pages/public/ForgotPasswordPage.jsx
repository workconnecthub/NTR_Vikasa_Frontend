import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';

export default function ForgotPasswordPage() {
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast({
        type: 'error',
        title: 'Valid Email Required',
        message: 'Please enter a valid registered email address.',
      });
      return;
    }

    setLoading(true);

    try {
      // Connect to FastAPI Backend POST /api/v1/auth/forgot-password
      const response = await authService.forgotPassword(email);

      setSubmitted(true);
      toast({
        type: 'info',
        title: 'Reset Link Sent',
        message: response.message || 'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (err) {
      // Security rule: Never expose whether the email exists
      setSubmitted(true);
      toast({
        type: 'info',
        title: 'Reset Link Sent',
        message: 'If an account exists with this email, a password reset link has been sent.',
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

        {/* ── Form Card ── */}
        {!submitted ? (
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-md)' }}>
            <div className="card-body" style={{ padding: 'var(--space-8)' }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                  Reset Your Password
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Enter your registered email address to receive a secure password reset link.
                </p>
              </div>

              <form onSubmit={handleSendResetLink} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'left' }}>
                <FormField label="Email Address" htmlFor="email" required>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail size={16} />}
                    required
                  />
                </FormField>

                <Button type="submit" variant="primary" fullWidth loading={loading} style={{ marginTop: 'var(--space-2)' }}>
                  Send Reset Link
                </Button>
              </form>
            </div>

            <div className="card-footer" style={{ textAlign: 'center', padding: 'var(--space-4) var(--space-8)' }}>
              <Link to="/login" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* ── Confirmation Card ── */
          <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-md)' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-8)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--color-success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success-600)' }}>
                <CheckCircle2 size={36} />
              </div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Check Your Email</h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                If an account exists with <strong>{email}</strong>, a secure password reset link has been sent. Please check your inbox and click the link to reset your password.
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'var(--color-gray-50)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', width: '100%' }}>
                The link will expire in 30 minutes.
              </p>
              <Link to="/login" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                <Button variant="primary" fullWidth>
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
