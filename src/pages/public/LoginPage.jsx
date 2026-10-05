import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Briefcase, Mail, Lock, Building2, User, ArrowLeft, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/FormControls';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import { useRecruiter } from '../../context/RecruiterContext';
import { useAdmin } from '../../context/AdminContext';
import authService from '../../services/authService';

export default function LoginPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login: loginCandidate } = useCandidate();
  const { loginRecruiter } = useRecruiter();
  const { loginAdmin } = useAdmin();

  const redirectTarget = location.state?.redirectTo || searchParams.get('redirect') || '/candidate/dashboard';

  const [email, setEmail] = useState(() => {
    try {
      return location.state?.email || localStorage.getItem('ntr_remember_email') || 'candidate1@ntrvikasa.com';
    } catch (e) {
      return 'candidate1@ntrvikasa.com';
    }
  });
  const [password, setPassword] = useState('password123');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (targetEmail, targetPassword) => {
    const loginEmail = (targetEmail || email).trim();
    const loginPassword = targetPassword || password;

    if (!loginEmail || !loginPassword) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);

    // Derive role based on user email / account type
    let role = 'CANDIDATE';
    if (loginEmail.includes('admin')) {
      role = 'ADMIN';
    } else if (
      loginEmail.includes('recruiter') ||
      loginEmail.includes('tech') ||
      loginEmail.includes('abc') ||
      loginEmail.includes('company')
    ) {
      role = 'RECRUITER';
    }

    try {
      const response = await authService.login({
        email: loginEmail,
        password: loginPassword,
        role,
      });

      const user = response.user;
      const userRole = (user.role || role).toUpperCase();

      if (remember) {
        localStorage.setItem('ntr_remember_email', loginEmail);
      } else {
        localStorage.removeItem('ntr_remember_email');
      }

      if (userRole === 'ADMIN') {
        loginAdmin(loginEmail, loginPassword);
        navigate('/admin/dashboard');
        addToast(`Welcome ${user.name || 'Admin'}! Logged into NTR Vikasa Administration.`, 'success');
        return;
      }

      if (userRole === 'RECRUITER') {
        loginRecruiter(loginEmail, loginPassword);
        navigate('/recruiter/dashboard');
        addToast(`Welcome back, ${user.name || 'Recruiter'}! Logged into Recruiter Workspace.`, 'success');
        return;
      }

      // Candidate login fallback
      loginCandidate(loginEmail);
      navigate(redirectTarget);
      addToast(`Welcome back, ${user.name || 'Candidate'}! Logged into Candidate Workspace.`, 'success');
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      // Check if recruiter pending administrative approval
      if (errorMsg.toLowerCase().includes('pending') || errorMsg.toLowerCase().includes('review')) {
        addToast(errorMsg, 'warning');
        navigate('/register/recruiter/pending');
        return;
      }
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignIn(email, password);
  };

  // Quick Demo Buttons
  const handleDemoCandidate1 = () => {
    setEmail('candidate1@ntrvikasa.com');
    setPassword('password123');
    handleSignIn('candidate1@ntrvikasa.com', 'password123');
  };

  const handleDemoCandidate2 = () => {
    setEmail('candidate2@ntrvikasa.com');
    setPassword('password123');
    handleSignIn('candidate2@ntrvikasa.com', 'password123');
  };

  const handleDemoRecruiter1 = () => {
    setEmail('recruiter1@ntrvikasa.com');
    setPassword('password123');
    handleSignIn('recruiter1@ntrvikasa.com', 'password123');
  };

  const handleDemoRecruiter2 = () => {
    setEmail('recruiter2@ntrvikasa.com');
    setPassword('password123');
    handleSignIn('recruiter2@ntrvikasa.com', 'password123');
  };

  const handleDemoAdmin1 = () => {
    setEmail('admin1@ntrvikasa.com');
    setPassword('password123');
    handleSignIn('admin1@ntrvikasa.com', 'password123');
  };

  const handleDemoAdmin2 = () => {
    setEmail('admin2@ntrvikasa.com');
    setPassword('password123');
    handleSignIn('admin2@ntrvikasa.com', 'password123');
  };

  return (
    <div className="auth-layout">
      {/* Left branding panel */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12)',
        color: '#fff',
      }} className="hide-mobile">
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 30px rgba(0,0,0,0.3)', padding: 12 }}>
              <img src="/title_logo.png" alt="NTR Vikasa Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#fff' }}>Welcome To </span>
            <span style={{ color: '#F59E0B' }}>NTR </span>
            <span style={{ color: '#60A5FA' }}>VIKASA </span>
            <span style={{ color: '#fff' }}>Job Portal</span>
          </h2>
          <p style={{ opacity: 0.85, lineHeight: 'var(--leading-relaxed)', fontSize: 'var(--text-base)', color: '#cbd5e1' }}>
            Your all-in-one portal for full-time jobs, paid internships, recruiter talent acquisition, and nationwide Job Melas.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
            {[{ v: '52,000+', l: 'Active Jobs' }, { v: '14,000+', l: 'Verified Companies' }, { v: '2,80,000+', l: 'Candidates' }, { v: '96.4%', l: 'Placement Rate' }].map((s) => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
                <p style={{ fontWeight: 800, fontSize: 'var(--text-2xl)', color: '#e0e7ff' }}>{s.v}</p>
                <p style={{ opacity: 0.8, fontSize: 'var(--text-xs)', marginTop: 2, color: '#94a3b8' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8) var(--space-6)', position: 'relative' }}>
        
        {/* Back to Home Link */}
        <div style={{ position: 'absolute', top: 24, right: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Home
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: 460 }}>
          {/* Mobile Logo */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <Link to="/" className="logo" style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/logo_image.png" alt="NTR Vikasa Logo" style={{ height: '48px', objectFit: 'contain' }} />
            </Link>
          </div>

          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)', textAlign: 'center' }}>
            Sign in to NTR VIKASA
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            Select a demo account below or enter your credentials to access your workspace.
          </p>

          {location.state?.jobTitle && (
            <div style={{
              background: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-300)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)'
            }}>
              <Briefcase size={20} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)', margin: 0, lineHeight: 1.4 }}>
                Sign in to complete your application for <strong>{location.state.jobTitle}</strong>
              </p>
            </div>
          )}

          {/* Quick Demo Credentials Switchers */}
          <div style={{
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)'
          }}>
            {/* Candidate Demos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-1)' }}>
              <Sparkles size={14} style={{ color: 'var(--color-primary-600)' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary-700)' }}>
                Demo Candidate Profiles:
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={handleDemoCandidate1}
                style={{
                  background: '#fff',
                  border: '1.5px solid var(--color-primary-400)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <strong style={{ display: 'block', color: 'var(--color-primary-800)' }}>Candidate 1: Priya</strong>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>Frontend Dev (4 yrs)</span>
              </button>

              <button
                type="button"
                onClick={handleDemoCandidate2}
                style={{
                  background: '#fff',
                  border: '1.5px solid var(--color-primary-400)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <strong style={{ display: 'block', color: 'var(--color-primary-800)' }}>Candidate 2: Rahul</strong>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>Python Backend (3.5 yrs)</span>
              </button>
            </div>

            {/* Recruiter Demos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-1)' }}>
              <Building2 size={14} style={{ color: '#7c3aed' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6d28d9' }}>
                Demo Recruiter Profiles:
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={handleDemoRecruiter1}
                style={{
                  background: '#fff',
                  border: '1.5px solid #a78bfa',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <strong style={{ display: 'block', color: '#5b21b6' }}>Recruiter 1: Arjun</strong>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>ABC Technologies</span>
              </button>

              <button
                type="button"
                onClick={handleDemoRecruiter2}
                style={{
                  background: '#fff',
                  border: '1.5px solid #a78bfa',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <strong style={{ display: 'block', color: '#5b21b6' }}>Recruiter 2: Sneha</strong>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>Tech Solutions</span>
              </button>
            </div>

            {/* Admin Demos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-1)' }}>
              <ShieldCheck size={14} style={{ color: '#0369a1' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0369a1' }}>
                Demo Admin Profiles:
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={handleDemoAdmin1}
                style={{
                  background: '#fff',
                  border: '1.5px solid #7dd3fc',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <strong style={{ display: 'block', color: '#0c4a6e' }}>Admin 1: Admin User</strong>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>admin1@ntrvikasa.com</span>
              </button>

              <button
                type="button"
                onClick={handleDemoAdmin2}
                style={{
                  background: '#fff',
                  border: '1.5px solid #7dd3fc',
                  borderRadius: 'var(--radius-lg)',
                  padding: '6px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <strong style={{ display: 'block', color: '#0c4a6e' }}>Admin 2: Super Admin</strong>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>admin2@ntrvikasa.com</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FormField label="Email Address" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                placeholder="user@ntrvikasa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox
                id="remember"
                label="Remember me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} disabled={loading}>
              Sign In to Workspace
            </Button>
          </form>

          {/* Registration Options Box */}
          <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--color-gray-50)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              New to NTR VIKASA Job Portal? Create an account:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <Link to="/register/candidate" state={location.state} style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" fullWidth leftIcon={<User size={14} />}>
                  Candidate Sign Up
                </Button>
              </Link>
              <Link to="/register/recruiter" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" fullWidth leftIcon={<Building2 size={14} />}>
                  Recruiter Sign Up
                </Button>
              </Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', marginTop: 'var(--space-6)' }}>
            By continuing, you accept our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
