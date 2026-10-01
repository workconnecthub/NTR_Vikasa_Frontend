import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, ArrowRight, ArrowLeft, CreditCard, CheckCircle2, AlertCircle, GraduationCap, MapPin, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import OtpVerificationModal from '../../components/ui/OtpVerificationModal';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import { REFERENCE_ADMINS, NTR_MANDALS } from '../../context/AdminContext';
import { LOCATIONS } from '../../data/mockData';
import { isDailyOtpLimitReached, recordOtpAttempt } from '../../utils/otpUtils';

export default function RegisterCandidatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { registerCandidate } = useCandidate();
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    location: 'NTR District (Vijayawada)',
    mandal: 'Vijayawada Urban',
    village: '',
    qualificationLevel: '10TH',
    referenceAdmin: 'Direct Student Self-Registration',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.location) {
      toast({
        type: 'error',
        title: 'Location Required',
        message: 'Please select your current city / district location.',
      });
      return;
    }
    if (!agreedToTerms) {
      setConsentError(true);
      toast({
        type: 'error',
        title: 'Consent Required',
        message: 'Please agree to the Terms & Conditions and Privacy Policy to continue.',
      });
      return;
    }

    if (isDailyOtpLimitReached('candidate_reg')) {
      toast({
        type: 'error',
        title: 'Daily OTP Limit Reached',
        message: 'You have reached the maximum allowed 3 OTP requests for today. Please try again tomorrow.',
      });
      return;
    }

    // Record OTP request attempt
    recordOtpAttempt('candidate_reg');

    // Trigger email OTP verification
    setOtpModalOpen(true);
    toast({
      type: 'info',
      title: 'Verification Code Sent',
      message: `A verification OTP has been sent to ${form.email}. (Demo code: 123456)`,
    });
  };

  const handleOtpVerified = () => {
    setOtpModalOpen(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      registerCandidate({ ...form, emailVerified: true });
      toast({
        type: 'success',
        title: 'Account Created Successfully!',
        message: 'Welcome to NTR VIKASA Job Portal! You can now explore jobs and complete your profile.',
      });
      navigate(location.state?.redirectTo || '/candidate/dashboard');
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-8) var(--space-4)', position: 'relative' }}>
      
      {/* Back to Home Link */}
      <div className="back-to-home">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Home
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: 620 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Link to="/" className="logo" style={{ justifyContent: 'center', display: 'inline-flex', marginBottom: 'var(--space-4)', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo_image.png" alt="NTR Vikasa Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </Link>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
            Create Your Candidate Account
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Already have an account? <Link to="/login" state={location.state} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-8)' }}>
              
              <div className="form-row">
                <FormField label="Full Name" htmlFor="fullName" required>
                  <Input
                    id="fullName"
                    placeholder="e.g. Priya Sharma"
                    value={form.fullName}
                    onChange={set('fullName')}
                    leftIcon={<User size={16} />}
                    required
                  />
                </FormField>

                <FormField label="Email Address" htmlFor="email" required>
                  <Input
                    id="email"
                    type="email"
                    placeholder="priya@example.com"
                    value={form.email}
                    onChange={set('email')}
                    leftIcon={<Mail size={16} />}
                    required
                  />
                </FormField>
              </div>

              <div className="form-row">
                <FormField label="Aadhaar Number" htmlFor="aadhaarNumber" required>
                  <Input
                    id="aadhaarNumber"
                    type="text"
                    placeholder="e.g. 1234 5678 9012"
                    value={form.aadhaarNumber}
                    onChange={set('aadhaarNumber')}
                    leftIcon={<CreditCard size={16} />}
                    pattern="[0-9\s]{12,14}"
                    required
                  />
                </FormField>

                <FormField label="Mobile Phone Number" htmlFor="phone" required>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={set('phone')}
                    leftIcon={<Phone size={16} />}
                    required
                  />
                </FormField>
              </div>

              <div className="form-row">
                <FormField label="Qualification Category" htmlFor="qualificationLevel" required hint="Your highest completed tier">
                  <Select
                    id="qualificationLevel"
                    options={[
                      { value: '10TH', label: '10th Class (SSC)' },
                      { value: 'INTER', label: 'Intermediate / 10+2 / Diploma' },
                      { value: 'UG', label: 'Undergraduate Degree (B.Tech, B.Sc, B.Com, etc.)' },
                      { value: 'PG', label: 'Postgraduate / Master Degree (MBA, MCA, M.Tech, etc.)' }
                    ]}
                    value={form.qualificationLevel}
                    onChange={set('qualificationLevel')}
                    required
                  />
                </FormField>

                <FormField label="Mandal (NTR District)" htmlFor="mandal" required hint="Select your mandal">
                  <Select
                    id="mandal"
                    options={NTR_MANDALS}
                    value={form.mandal}
                    onChange={set('mandal')}
                    required
                  />
                </FormField>
              </div>

              <div className="form-row">
                <FormField label="Village / Locality / Ward" htmlFor="village" required hint="e.g. Gollapudi / Kondapalli">
                  <Input
                    id="village"
                    placeholder="Enter your village or locality"
                    value={form.village}
                    onChange={set('village')}
                    leftIcon={<MapPin size={16} />}
                    required
                  />
                </FormField>

                <FormField label="Referred by Admin / Officer (Reference Dropdown)" htmlFor="referenceAdmin" required hint="Select the referring authority">
                  <Select
                    id="referenceAdmin"
                    options={REFERENCE_ADMINS}
                    value={form.referenceAdmin}
                    onChange={set('referenceAdmin')}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Current District / City Location" htmlFor="location" required>
                <Select
                  id="location"
                  options={LOCATIONS.filter(l => l !== 'All Locations')}
                  placeholder="Select your district"
                  value={form.location}
                  onChange={set('location')}
                  required
                />
              </FormField>

              <div style={{ background: 'var(--color-success-50)', border: '1px solid var(--color-success-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--color-success-600)', flexShrink: 0 }} />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', lineHeight: 'var(--leading-normal)' }}>
                  Free registration. NTR VIKASA Job Portal never charges job seekers for applications or interviews.
                </p>
              </div>
            </div>

            <div className="card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-8) var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', width: '100%' }}>
                <input
                  id="candidate-agree-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setConsentError(false);
                  }}
                  aria-required="true"
                  style={{
                    width: '18px',
                    height: '18px',
                    marginTop: '2px',
                    accentColor: 'var(--color-primary-600)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <label
                  htmlFor="candidate-agree-terms"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 'var(--leading-relaxed)', cursor: 'pointer', userSelect: 'none' }}
                >
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--color-primary-600)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--color-primary-600)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Privacy Policy
                  </Link>
                  .<span style={{ color: 'var(--color-danger-500)', marginLeft: '2px' }}>*</span>
                </label>
              </div>

              {consentError && (
                <p className="form-error" role="alert" style={{ marginTop: '-4px', marginLeft: '30px' }}>
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>Please agree to the Terms & Conditions and Privacy Policy to continue.</span>
                </p>
              )}

              <Button variant="primary" type="submit" loading={loading} fullWidth rightIcon={<ArrowRight size={16} />} style={{ marginTop: 'var(--space-2)' }}>
                Create Candidate Account
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Email OTP Verification Modal */}
      <OtpVerificationModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        email={form.email}
        flowId="candidate_reg"
        onVerified={handleOtpVerified}
        onChangeEmail={() => setOtpModalOpen(false)}
      />
    </div>
  );
}
