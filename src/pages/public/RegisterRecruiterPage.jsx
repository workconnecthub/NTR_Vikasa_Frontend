import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, User, Mail, Phone, Lock, Globe, MapPin,
  FileText, ShieldCheck, CheckCircle2, ArrowRight, UploadCloud, Briefcase, ArrowLeft, AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import FileUpload from '../../components/ui/FileUpload';
import { useToast } from '../../context/ToastContext';
import { INDUSTRIES, COMPANY_SIZES, LOCATIONS } from '../../data/mockData';
import authService from '../../services/authService';

const SECTIONS = ['Recruiter Contact', 'Company Details', 'Verification Docs'];

export default function RegisterRecruiterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [section, setSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [consentError, setConsentError] = useState(false);

  // File Upload states
  const [coiFile, setCoiFile] = useState(null);
  const [authLetterFile, setAuthLetterFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [form, setForm] = useState({
    // Recruiter info
    recruiterName: '',
    email: '',
    phone: '',
    designation: '',
    password: '',
    confirmPassword: '',

    // Company info
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    website: '',
    industry: '',
    companySize: '',
    description: '',
    location: '',
    address: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    if (section < SECTIONS.length - 1) {
      setSection((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 3 final submission — validate then submit directly to backend
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        toast({
          type: 'error',
          title: 'Password Mismatch',
          message: 'Password and Confirm Password do not match. Please verify.',
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
      if (!coiFile) {
        toast({
          type: 'error',
          title: 'Document Required',
          message: 'Certificate of Incorporation / CIN / GST Registration Proof is required.',
        });
        return;
      }
      if (!authLetterFile) {
        toast({
          type: 'error',
          title: 'Document Required',
          message: 'Authorized Recruiter Official ID Proof / Letter of Authorization is required.',
        });
        return;
      }
      handleSubmitRegistration();
    }
  };

  const handleSubmitRegistration = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      // Step 1 — Recruiter Contact (mapped to backend field names)
      formData.append('recruiter_name', form.recruiterName.trim());
      formData.append('designation', form.designation.trim());
      formData.append('work_email', form.email.trim());
      formData.append('mobile_phone', form.phone.trim());
      formData.append('password', form.password);
      formData.append('confirm_password', form.confirmPassword);

      // Step 2 — Company Details (mapped to backend field names)
      formData.append('company_name', form.companyName.trim());
      formData.append('company_website', form.website.trim());
      if (form.companyEmail && form.companyEmail.trim()) {
        formData.append('corporate_email', form.companyEmail.trim());
      }
      if (form.companyPhone && form.companyPhone.trim()) {
        formData.append('company_phone', form.companyPhone.trim());
      }
      formData.append('primary_industry', form.industry);
      formData.append('company_size', form.companySize);
      formData.append('headquarters_city_state', form.location);
      formData.append('registered_office_address', form.address.trim());
      formData.append('company_description', form.description.trim());

      // Step 3 — Terms & Documents
      formData.append('terms_accepted', 'true');
      formData.append('incorporation_document', coiFile);
      formData.append('recruiter_authorization_document', authLetterFile);
      if (logoFile) {
        formData.append('company_logo', logoFile);
      }

      await authService.registerRecruiter(formData);

      toast({
        type: 'success',
        title: 'Registration Application Submitted!',
        message: 'Your recruiter account application has been submitted for admin verification.',
      });
      navigate('/register/recruiter/pending');
    } catch (err) {
      toast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Could not submit recruiter application. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-10) var(--space-4)', position: 'relative' }}>
      
      {/* Back to Home Link */}
      <div className="back-to-home">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Home
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: 740 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Link to="/" className="logo" style={{ justifyContent: 'center', display: 'inline-flex', marginBottom: 'var(--space-4)', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo_image.png" alt="NTR Vikasa Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </Link>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
            Register Your Company as a Recruiter
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Post jobs, hire interns, and participate in Job Melas across India. All employer accounts are reviewed by Admin for quality & safety.
          </p>
        </div>

        {/* Section Steps Navigation */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          {SECTIONS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{
                height: 4,
                borderRadius: 'var(--radius-full)',
                background: i <= section ? 'var(--color-primary-600)' : 'var(--color-gray-200)',
                transition: 'background var(--transition-slow)',
                marginBottom: 'var(--space-2)'
              }} />
              <p style={{ fontSize: 'var(--text-xs)', color: i <= section ? 'var(--color-primary-600)' : 'var(--color-text-muted)', fontWeight: i === section ? 700 : 500 }}>
                {i + 1}. {s}
              </p>
            </div>
          ))}
        </div>

        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleNext}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', padding: 'var(--space-8)' }}>

              {/* ── SECTION 1: Recruiter Contact Info & Credentials ── */}
              {section === 0 && (
                <>
                  <div className="form-row">
                    <FormField label="Recruiter / HR Name" htmlFor="recruiterName" required>
                      <Input
                        id="recruiterName"
                        placeholder="e.g. Rahul Mehta"
                        value={form.recruiterName}
                        onChange={set('recruiterName')}
                        leftIcon={<User size={16} />}
                        required
                      />
                    </FormField>

                    <FormField label="Official Designation" htmlFor="designation" required>
                      <Input
                        id="designation"
                        placeholder="e.g. Head of Talent Acquisition"
                        value={form.designation}
                        onChange={set('designation')}
                        leftIcon={<Briefcase size={16} />}
                        required
                      />
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label="Work Email Address" htmlFor="email" required hint="Use company domain email">
                      <Input
                        id="email"
                        type="email"
                        placeholder="rahul@company.com"
                        value={form.email}
                        onChange={set('email')}
                        leftIcon={<Mail size={16} />}
                        required
                      />
                    </FormField>

                    <FormField label="Mobile / Direct Phone" htmlFor="phone" required>
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
                    <FormField label="Create Password" htmlFor="password" required hint="Min 8 characters">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create strong password"
                        value={form.password}
                        onChange={set('password')}
                        required
                      />
                    </FormField>

                    <FormField label="Confirm Password" htmlFor="confirmPassword" required>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={set('confirmPassword')}
                        required
                      />
                    </FormField>
                  </div>
                </>
              )}

              {/* ── SECTION 2: Company Profile Information ── */}
              {section === 1 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-4)' }}>
                    <FormField label="Company / Organization Name" htmlFor="companyName" required>
                      <Input
                        id="companyName"
                        placeholder="e.g. TechCorp Technologies Pvt Ltd"
                        value={form.companyName}
                        onChange={set('companyName')}
                        leftIcon={<Building2 size={16} />}
                        required
                      />
                    </FormField>

                    <FormField label="Company Website" htmlFor="website" required>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://company.com"
                        value={form.website}
                        onChange={set('website')}
                        leftIcon={<Globe size={16} />}
                        required
                      />
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label="Corporate Email" htmlFor="companyEmail">
                      <Input
                        id="companyEmail"
                        type="email"
                        placeholder="contact@company.com"
                        value={form.companyEmail}
                        onChange={set('companyEmail')}
                        leftIcon={<Mail size={16} />}
                      />
                    </FormField>

                    <FormField label="Company Landline / Phone" htmlFor="companyPhone">
                      <Input
                        id="companyPhone"
                        type="tel"
                        placeholder="+91 80 4000 0000"
                        value={form.companyPhone}
                        onChange={set('companyPhone')}
                        leftIcon={<Phone size={16} />}
                      />
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label="Primary Industry" htmlFor="industry" required>
                      <Select
                        id="industry"
                        options={INDUSTRIES.filter(i => i !== 'All Industries')}
                        placeholder="Select Industry"
                        value={form.industry}
                        onChange={set('industry')}
                      />
                    </FormField>

                    <FormField label="Company Size" htmlFor="companySize" required>
                      <Select
                        id="companySize"
                        options={COMPANY_SIZES.filter(s => s !== 'All Sizes')}
                        placeholder="Select Employee Count"
                        value={form.companySize}
                        onChange={set('companySize')}
                      />
                    </FormField>
                  </div>

                  <div className="form-row">
                    <FormField label="Headquarters City / State" htmlFor="location" required>
                      <Select
                        id="location"
                        options={LOCATIONS.filter(l => l !== 'All Locations')}
                        placeholder="Select Primary City"
                        value={form.location}
                        onChange={set('location')}
                      />
                    </FormField>

                    <FormField label="Registered Office Address" htmlFor="address" required>
                      <Input
                        id="address"
                        placeholder="Building, Street, Tech Park, Pincode"
                        value={form.address}
                        onChange={set('address')}
                        leftIcon={<MapPin size={16} />}
                        required
                      />
                    </FormField>
                  </div>

                  <FormField label="Company Overview & Description" htmlFor="description" required hint="Briefly describe what your organization does and what you hire for">
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="e.g. We are a digital product studio building enterprise cloud solutions..."
                      value={form.description}
                      onChange={set('description')}
                      required
                    />
                  </FormField>
                </>
              )}

              {/* ── SECTION 3: Verification Document Upload UI ── */}
              {section === 2 && (
                <>
                  <div style={{
                    background: 'var(--color-primary-50)',
                    border: '1px solid var(--color-primary-200)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'flex-start'
                  }}>
                    <ShieldCheck size={24} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary-900)' }}>
                        Mandatory Employer Credential Verification
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                        To prevent recruitment fraud and protect job seekers, NTR VIKASA Job Portal Admin manually verifies each employer's corporate identity before activating job posting privileges.
                      </p>
                    </div>
                  </div>

                  <FormField label="1. Certificate of Incorporation / CIN / GST Registration Proof" required hint="PDF, JPG, PNG up to 5MB">
                    <FileUpload
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize="5 MB"
                      onChange={(files) => setCoiFile(files?.[0] || null)}
                    />
                  </FormField>

                  <FormField label="2. Authorized Recruiter Official ID Proof / Letter of Authorization" required hint="Company ID Card, Official Authorization Letter (PDF/JPG)">
                    <FileUpload
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize="5 MB"
                      onChange={(files) => setAuthLetterFile(files?.[0] || null)}
                    />
                  </FormField>

                  <FormField label="3. Company Official Logo" hint="PNG or SVG format (Square 500x500 recommended)">
                    <FileUpload
                      accept=".png,.svg,.jpg"
                      maxSize="2 MB"
                      onChange={(files) => setLogoFile(files?.[0] || null)}
                    />
                  </FormField>

                  {/* Mandatory Terms & Conditions and Privacy Policy Consent */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                      <input
                        id="recruiter-agree-terms"
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
                        htmlFor="recruiter-agree-terms"
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
                  </div>
                </>
              )}
            </div>

            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-8)' }}>
              {section > 0 ? (
                <Button variant="secondary" type="button" onClick={() => setSection((s) => s - 1)}>
                  ← Previous Step
                </Button>
              ) : <div />}

              <Button variant="primary" type="submit" loading={loading} rightIcon={<ArrowRight size={16} />}>
                {section < SECTIONS.length - 1 ? 'Continue to Next Step' : 'Submit for Admin Approval'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
