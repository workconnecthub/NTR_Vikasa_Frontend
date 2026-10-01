import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Users, Send, Info, CheckCircle2,
  Copy, ExternalLink, Navigation, Clock, Building2,
  Briefcase, GraduationCap, ChevronDown,
  ChevronUp, Check, MessageCircle, X, Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './ContactPage.css';

const OFFICE_ADDRESS = {
  title: 'District Nodal Employment Office',
  org: 'NTR Vikasa Headquarters',
  location: 'Collectorate, Vijayawada, NTR District, Andhra Pradesh',
  fullAddress: 'NTR Vikasa Office, District Collectorate, Bandar Road, Vijayawada, NTR District, Andhra Pradesh - 520002',
  mapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Collectorate+NTR+District+Vijayawada',
  mapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Collectorate+NTR+District+Vijayawada',
  embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7650.744995808477!2d80.61925292015077!3d16.507281758902664!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35f1432507a315%3A0x28feb73c1567f9f0!2sCollectorate%20NTR%20District%20Vijayawada!5e0!3m2!1sen!2sin!4v1790699052056!5m2!1sen!2sin',
};

const SUPPORT_CONTACTS = {
  phones: ['+91-9154557779', '9154667779'],
  cleanPhones: ['+919154557779', '+919154667779'],
  emails: ['info@ntrvikasa.com', 'ntrvikasajobs@gmail.com'],
  workingHours: 'Mon-Sat: 10:00am - 6:00pm',
};

// Unique rich category configurations
const CATEGORIES = [
  {
    id: 'Job Seeker',
    label: 'Job Seeker',
    sub: 'Placements & Melas',
    icon: Users,
    chips: [
      '🎯 Job Mela Registration',
      '💼 Fresh Graduate Openings',
      '📄 Hall Ticket / Entry Pass',
      '💬 Career Counseling'
    ]
  },
  {
    id: 'Employer',
    label: 'Employer',
    sub: 'Hiring & Campus Drives',
    icon: Building2,
    chips: [
      '🏢 Job Mela Stall Booking',
      '👥 Bulk Candidate Hiring',
      '📑 Recruiter Verification',
      '🤝 Campus Placement Drive'
    ]
  },
  {
    id: 'Training',
    label: 'Skill Training',
    sub: 'Courses & Certifications',
    icon: GraduationCap,
    chips: [
      '💻 IT & Software Courses',
      '⚡ Vocational Skill Batches',
      '📜 Certificate Verification',
      '📅 Batch Timings & Centers'
    ]
  },
];

const FAQS = [
  {
    q: 'Are there any registration or placement fees charged by NTR Vikasa?',
    a: 'Absolutely NOT. NTR Vikasa is an initiative of the District Administration of NTR District, Government of Andhra Pradesh. All services including candidate registration, career counseling, Job Melas, and skill development are 100% FREE. Never pay fees or deposits to anyone claiming to represent NTR Vikasa.',
  },
  {
    q: 'Where is the NTR Vikasa office located?',
    a: 'The NTR Vikasa Office is situated inside the District Collectorate Complex in Vijayawada, NTR District, Andhra Pradesh. You can visit in person between 10:00 AM and 6:00 PM, Monday through Saturday.',
  },
  {
    q: 'How do I participate in upcoming Mega Job Melas?',
    a: 'You can register online through this portal under the "Job Melas" tab or visit our helpdesk directly with your resume, Aadhaar card, and educational certificates for on-spot digital entry passes.',
  },
  {
    q: 'How do I report fake recruitment messages or fraud calls?',
    a: 'If you receive suspicious calls demanding money for government job placements, immediately call our official helpline +91-9154557779 or email us at ntrvikasajobs@gmail.com with screenshot evidence or payment requests.',
  },
];

export default function ContactPage() {
  const { toast } = useToast();
  const mapSectionRef = useRef(null);

  // Form State (Country completely removed as requested)
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    category: 'Job Seeker',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);
  const [submittedData, setSubmittedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Field change handler
  const handleInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Quick-topic chip handler (interactive topic selection)
  const handleChipClick = (chipText) => {
    setForm((prev) => {
      const current = prev.message.trim();
      const newMsg = current ? `${current}\n• ${chipText}` : `Inquiry regarding: ${chipText}. `;
      return { ...prev, message: newMsg };
    });
    toast({
      type: 'info',
      title: 'Topic Added',
      message: `"${chipText}" added to your message details.`,
    });
  };

  // Copy to clipboard helper
  const handleCopy = (text, keyName, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(keyName);
    toast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: `${label || text} copied successfully!`,
    });
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Scroll smoothly to embedded map
  const scrollToMap = () => {
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Form validation (Strict for Indian 10-digit number)
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Please enter your full name';
    }
    const cleanMobile = form.mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (cleanMobile.length !== 10) {
      newErrors.mobile = 'Please enter a valid 10-digit Indian mobile number';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.message.trim()) {
      newErrors.message = 'Please provide your message or query details';
    } else if (form.message.trim().length < 8) {
      newErrors.message = 'Message should be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build Email Payload
  const buildEmailPayload = (formData) => {
    const subject = `[NTR Vikasa - ${formData.category} Query] from ${formData.name}`;
    const body = `NTR VIKASA INQUIRY / REGISTRATION DETAILS
==================================================
Category: ${formData.category}
Full Name: ${formData.name}
Mobile Number: +91 ${formData.mobile.replace(/\D/g, '')}
Email Address: ${formData.email}
Submission Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Query / Message:
--------------------------------------------------
${formData.message}
--------------------------------------------------

Official Routing: ntrvikasajobs@gmail.com, info@ntrvikasa.com
Submitted via NTR Vikasa Job Portal`;

    return { subject, body };
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        type: 'error',
        title: 'Missing Required Information',
        message: 'Please fill in all required fields accurately.',
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const { subject, body } = buildEmailPayload(form);

      // Save submission record to localStorage
      try {
        const history = JSON.parse(localStorage.getItem('ntrvikasa_contact_submissions') || '[]');
        history.unshift({
          id: 'REQ-' + Date.now(),
          ...form,
          mobile: `+91 ${form.mobile}`,
          timestamp: new Date().toISOString(),
          status: 'Dispatched to Email',
        });
        localStorage.setItem('ntrvikasa_contact_submissions', JSON.stringify(history.slice(0, 30)));
      } catch (err) {
        console.error('Failed to save to local storage', err);
      }

      // Prepare target email links (both emails mentioned by user)
      const primaryMail = 'ntrvikasajobs@gmail.com';
      const ccMail = 'info@ntrvikasa.com';
      const mailtoUrl = `mailto:${primaryMail}?cc=${encodeURIComponent(ccMail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(primaryMail)}&cc=${encodeURIComponent(ccMail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      setSubmittedData({
        ...form,
        subject,
        body,
        primaryMail,
        ccMail,
        mailtoUrl,
        gmailWebUrl,
      });

      setIsModalOpen(true);

      // Trigger mailto client automatically
      window.location.href = mailtoUrl;

      toast({
        type: 'success',
        title: 'Query Prepared & Email Dispatched',
        message: 'Your query has been routed to ntrvikasajobs@gmail.com and info@ntrvikasa.com.',
      });
    }, 600);
  };

  // Close modal and reset form
  const handleModalClose = () => {
    setIsModalOpen(false);
    setForm({
      name: '',
      mobile: '',
      email: '',
      category: 'Job Seeker',
      message: '',
    });
    setErrors({});
  };

  const activeCategoryConfig = CATEGORIES.find((c) => c.id === form.category) || CATEGORIES[0];

  return (
    <div className="contact-page">
      {/* ─── Hero Header ─── */}
      <section className="contact-hero">
        <div className="contact-hero-container">
          <div className="contact-hero-badge">
            <Building2 size={14} /> District Employment Helpdesk • NTR District
          </div>
          <h1 className="contact-hero-title">Contact NTR Vikasa</h1>
          <p className="contact-hero-subtitle">
            Directly connect with our District Placement Officers, recruiter verification specialists,
            and skill development counselors at Vijayawada Collectorate.
          </p>
        </div>
      </section>

      {/* ─── Main Content Container ─── */}
      <div className="contact-container">
        <div className="contact-layout-grid">

          {/* ══════════════════════════════════════════════════════════════
              UNIQUE LEFT SIDE: CONNECT COMMAND HUB
              ══════════════════════════════════════════════════════════════ */}
          <div className="contact-hub-wrapper">

            {/* 1. Primary Featured Card: District Nodal Headquarters */}
            <div className="contact-hq-card">
              <div className="contact-hq-header">
                <span className="contact-hq-badge">
                  <ShieldCheck size={13} /> Official District Desk
                </span>
                <span className="contact-live-status">
                  <span className="contact-live-dot" /> Open: Mon-Sat 10 AM - 6 PM
                </span>
              </div>

              <div className="contact-hq-main">
                <div className="contact-hq-icon-box">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="contact-hq-title">NTR Vikasa Headquarters</h3>
                  <p className="contact-hq-address">
                    District Collectorate Complex, Bandar Road, Vijayawada, NTR District, Andhra Pradesh - 520002
                  </p>
                </div>
              </div>

              <div className="contact-hq-actions">
                <button
                  type="button"
                  className="contact-hq-btn gold"
                  onClick={scrollToMap}
                >
                  <Navigation size={13} /> Navigate on Map
                </button>
                <button
                  type="button"
                  className="contact-hq-btn ghost"
                  onClick={() => handleCopy(OFFICE_ADDRESS.fullAddress, 'address', 'Office address')}
                >
                  {copiedKey === 'address' ? <Check size={13} color="#86efac" /> : <Copy size={13} />}
                  {copiedKey === 'address' ? 'Copied' : 'Copy Official Address'}
                </button>
              </div>
            </div>

            {/* 2. Three Specialized Interactive Channel Tiles */}
            <div className="contact-channels-grid">

              {/* Channel 1: Telephonic Support */}
              <div className="contact-channel-card phone-channel">
                <div>
                  <div className="contact-channel-top">
                    <div className="contact-channel-icon blue">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="contact-channel-title">Call Support</h4>
                      <p className="contact-channel-subtitle">Mon-Sat: 10am - 6pm</p>
                    </div>
                  </div>

                  <div className="contact-channel-body">
                    <div className="contact-interactive-item">
                      <a href={`tel:${SUPPORT_CONTACTS.cleanPhones[0]}`} className="contact-item-link">
                        {SUPPORT_CONTACTS.phones[0]}
                      </a>
                      <button
                        type="button"
                        className="contact-mini-copy"
                        onClick={() => handleCopy(SUPPORT_CONTACTS.phones[0], 'p1', 'Primary phone')}
                        title="Copy number"
                      >
                        {copiedKey === 'p1' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="contact-interactive-item">
                      <a href={`tel:${SUPPORT_CONTACTS.cleanPhones[1]}`} className="contact-item-link">
                        +91 {SUPPORT_CONTACTS.phones[1]}
                      </a>
                      <button
                        type="button"
                        className="contact-mini-copy"
                        onClick={() => handleCopy(SUPPORT_CONTACTS.phones[1], 'p2', 'Secondary phone')}
                        title="Copy number"
                      >
                        {copiedKey === 'p2' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/919154557779?text=${encodeURIComponent('Hello NTR Vikasa Team, I would like to inquire about...')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-channel-footer-action whatsapp"
                >
                  <MessageCircle size={13} /> Chat on WhatsApp
                </a>
              </div>

              {/* Channel 2: Email & Redressal Desk */}
              <div className="contact-channel-card email-channel">
                <div>
                  <div className="contact-channel-top">
                    <div className="contact-channel-icon purple">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="contact-channel-title">Email Support</h4>
                      <p className="contact-channel-subtitle">24-hr query turnaround</p>
                    </div>
                  </div>

                  <div className="contact-channel-body">
                    <div className="contact-interactive-item">
                      <a href={`mailto:${SUPPORT_CONTACTS.emails[0]}`} className="contact-item-link">
                        {SUPPORT_CONTACTS.emails[0]}
                      </a>
                      <button
                        type="button"
                        className="contact-mini-copy"
                        onClick={() => handleCopy(SUPPORT_CONTACTS.emails[0], 'e1', 'General email')}
                        title="Copy email"
                      >
                        {copiedKey === 'e1' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="contact-interactive-item">
                      <a href={`mailto:${SUPPORT_CONTACTS.emails[1]}`} className="contact-item-link">
                        {SUPPORT_CONTACTS.emails[1]}
                      </a>
                      <button
                        type="button"
                        className="contact-mini-copy"
                        onClick={() => handleCopy(SUPPORT_CONTACTS.emails[1], 'e2', 'Jobs email')}
                        title="Copy email"
                      >
                        {copiedKey === 'e2' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <a
                  href={`mailto:${SUPPORT_CONTACTS.emails[1]}`}
                  className="contact-channel-footer-action"
                >
                  <Send size={13} /> Direct Compose
                </a>
              </div>

              {/* Channel 3: Job Seeker & Skill Training */}
              <div className="contact-channel-card career-channel">
                <div>
                  <div className="contact-channel-top">
                    <div className="contact-channel-icon orange">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="contact-channel-title">Job Seeker Hub</h4>
                      <p className="contact-channel-subtitle">Early career training</p>
                    </div>
                  </div>

                  <div className="contact-channel-body">
                    <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45, margin: '0 0 0.5rem 0' }}>
                      Skill training and placement support across Vijayawada & NTR District mandals.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                  <Link
                    to="/jobs"
                    className="contact-channel-footer-action"
                    style={{ flex: 1 }}
                  >
                    <Briefcase size={12} /> Jobs
                  </Link>
                  <Link
                    to="/skill-development/courses"
                    className="contact-channel-footer-action"
                    style={{ flex: 1 }}
                  >
                    <GraduationCap size={12} /> Courses
                  </Link>
                </div>
              </div>

            </div>

            {/* 3. Inline Interactive Google Map: Fills the free space beside the query form */}
            <div className="contact-hub-map-card" ref={mapSectionRef}>
              <div className="contact-hub-map-header">
                <div className="contact-hub-map-info">
                  <div className="contact-hub-map-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="contact-hub-map-title">District Collectorate Location Map</h4>
                    <p className="contact-hub-map-address">Collectorate NTR District, Vijayawada</p>
                  </div>
                </div>

                <div className="contact-hub-map-actions">
                  <a
                    href={OFFICE_ADDRESS.mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-hub-map-btn primary"
                    title="Get directions in Google Maps"
                  >
                    <Navigation size={12} /> Directions
                  </a>
                  <a
                    href={OFFICE_ADDRESS.mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-hub-map-btn"
                    title="Open in Google Maps"
                  >
                    <ExternalLink size={12} /> Open Map
                  </a>
                  <button
                    type="button"
                    className="contact-hub-map-btn"
                    onClick={() => handleCopy(OFFICE_ADDRESS.fullAddress, 'map-addr', 'Collectorate address')}
                    title="Copy full address"
                  >
                    {copiedKey === 'map-addr' ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    {copiedKey === 'map-addr' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Exact Google Maps Embed Iframe */}
              <div className="contact-hub-map-frame-wrapper">
                <iframe
                  title="Collectorate NTR District Vijayawada Google Maps Location"
                  src={OFFICE_ADDRESS.embedUrl}
                  className="contact-hub-map-frame"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              {/* Map Footer Information Strip */}
              <div className="contact-hub-map-footer">
                <div className="contact-hub-map-badge-item">
                  <Building2 size={13} className="contact-hub-map-badge-icon" />
                  <span>NTR District Collectorate, Bandar Road, Vijayawada</span>
                </div>
                <div className="contact-hub-map-badge-item">
                  <Clock size={13} className="contact-hub-map-badge-icon" />
                  <span>Mon-Sat: 10:00 AM – 6:00 PM</span>
                </div>
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════
              UNIQUE RIGHT SIDE: QUERY & REGISTRATION CONSOLE
              ══════════════════════════════════════════════════════════════ */}
          <div className="contact-form-card">
            <div className="contact-form-header">
              <div className="contact-form-title-wrap">
                <h2 className="contact-form-title">Register / Send Your Query</h2>
                <span className="contact-form-badge">
                  <Sparkles size={11} color="#eab308" /> AP District Desk
                </span>
              </div>
              <div className="contact-gold-bar" />
              <p className="contact-form-desc">
                Select your category and submit your details. Your inquiry is directly routed to{' '}
                <strong>ntrvikasajobs@gmail.com</strong> and <strong>info@ntrvikasa.com</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form" noValidate>

              {/* ── UNIQUE CATEGORY SELECTION: Rich Interactive Cards ── */}
              <div className="category-section-wrapper">
                <label className="category-section-label">
                  <span>Select Inquiry Category <span className="req">*</span></span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                    {form.category} Active
                  </span>
                </label>

                <div className="category-selection-grid" role="radiogroup" aria-label="Inquiry Category">
                  {CATEGORIES.map((cat) => {
                    const isActive = form.category === cat.id;
                    const IconComp = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        role="radio"
                        aria-checked={isActive}
                        tabIndex={0}
                        className={`category-rich-card ${isActive ? 'active' : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, category: cat.id }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setForm((prev) => ({ ...prev, category: cat.id }));
                          }
                        }}
                      >
                        <div className="category-card-icon">
                          <IconComp size={16} />
                        </div>
                        <span className="category-card-name">{cat.label}</span>
                        <span className="category-card-sub">{cat.sub}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Quick Inquiry Topics for Selected Category */}
                <div className="topic-chips-wrapper">
                  <div className="topic-chips-header">
                    <Sparkles size={12} color="#2563eb" />
                    <span>Quick Topics for {activeCategoryConfig.label} (click to append):</span>
                  </div>
                  <div className="topic-chips-list">
                    {activeCategoryConfig.chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="topic-chip-btn"
                        onClick={() => handleChipClick(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="contact-field-group">
                <label className="contact-field-label" htmlFor="fullName">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  className={`contact-input ${errors.name ? 'is-error' : ''}`}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleInputChange('name')}
                />
                {errors.name && <span className="contact-error-hint">{errors.name}</span>}
              </div>

              {/* Dedicated Indian Mobile Number Field (Country removed completely) */}
              <div className="contact-field-group">
                <label className="contact-field-label" htmlFor="mobileNumber">
                  Mobile Number <span className="req">*</span>
                </label>
                <div className={`indian-mobile-input-wrap ${errors.mobile ? 'is-error' : ''}`}>
                  <div className="indian-flag-badge">
                    <span role="img" aria-label="India Flag">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    id="mobileNumber"
                    type="tel"
                    maxLength={10}
                    className="indian-mobile-input"
                    placeholder="Enter 10-digit mobile number"
                    value={form.mobile}
                    onChange={handleInputChange('mobile')}
                  />
                </div>
                {errors.mobile && <span className="contact-error-hint">{errors.mobile}</span>}
              </div>

              {/* Email Address */}
              <div className="contact-field-group">
                <label className="contact-field-label" htmlFor="emailAddress">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  id="emailAddress"
                  type="email"
                  className={`contact-input ${errors.email ? 'is-error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleInputChange('email')}
                />
                {errors.email && <span className="contact-error-hint">{errors.email}</span>}
              </div>

              {/* Message */}
              <div className="contact-field-group">
                <label className="contact-field-label" htmlFor="queryMessage">
                  Message / Query Details <span className="req">*</span>
                </label>
                <textarea
                  id="queryMessage"
                  className={`contact-textarea ${errors.message ? 'is-error' : ''}`}
                  rows={4}
                  placeholder={`Describe your ${form.category} query in detail...`}
                  value={form.message}
                  onChange={handleInputChange('message')}
                />
                {errors.message && <span className="contact-error-hint">{errors.message}</span>}
              </div>

              {/* Submit Application Button */}
              <button
                type="submit"
                className="contact-submit-btn"
                disabled={loading}
              >
                <Send size={16} />
                <span>{loading ? 'Submitting Application...' : 'Submit Application'}</span>
              </button>

              {/* Fraud Warning Disclaimer */}
              <div className="contact-disclaimer">
                <Info size={14} className="contact-disclaimer-icon" />
                <span>No fees required. Beware of fraud calls.</span>
              </div>

            </form>
          </div>

        </div>
      </div>

      {/* ─── Frequently Asked Questions Accordion ─── */}
      <section className="contact-faq-section">
        <div className="contact-faq-header">
          <h2 className="contact-faq-title">Frequently Asked Questions</h2>
          <p className="contact-faq-subtitle">
            Quick answers regarding candidate registrations, employer recruitment, and fraud prevention.
          </p>
        </div>

        <div className="contact-faq-grid">
          {FAQS.map((faq, idx) => {
            const isOpen = faqOpenIndex === idx;
            return (
              <div
                key={faq.q}
                className="contact-faq-card"
                onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
              >
                <div className="contact-faq-q">
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="#2563eb" /> : <ChevronDown size={18} color="#64748b" />}
                </div>
                {isOpen && <p className="contact-faq-a">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Submission Confirmation Modal with Direct Email Options ─── */}
      {isModalOpen && submittedData && (
        <div className="contact-modal-backdrop" onClick={handleModalClose}>
          <div
            className="contact-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
          >
            <button
              type="button"
              className="contact-modal-close"
              onClick={handleModalClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="contact-modal-header">
              <div className="contact-modal-check">
                <CheckCircle2 size={32} />
              </div>
              <h3 id="modalTitle" className="contact-modal-title">Query Prepared for Email</h3>
              <p className="contact-modal-desc">
                Your inquiry has been compiled to be sent to our official helpdesk at{' '}
                <strong>{submittedData.primaryMail}</strong> and <strong>{submittedData.ccMail}</strong>.
              </p>
            </div>

            <div className="contact-modal-summary">
              <div className="contact-modal-summary-row">
                <span className="contact-modal-label">Applicant:</span>
                <span className="contact-modal-val">{submittedData.name}</span>
              </div>
              <div className="contact-modal-summary-row">
                <span className="contact-modal-label">Category:</span>
                <span className="contact-modal-val">{submittedData.category}</span>
              </div>
              <div className="contact-modal-summary-row">
                <span className="contact-modal-label">Mobile:</span>
                <span className="contact-modal-val">+91 {submittedData.mobile}</span>
              </div>
              <div className="contact-modal-summary-row">
                <span className="contact-modal-label">Email:</span>
                <span className="contact-modal-val">{submittedData.email}</span>
              </div>
            </div>

            <div className="contact-modal-actions">
              {/* Web Gmail 1-click compose */}
              <a
                href={submittedData.gmailWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-modal-btn gmail"
              >
                <Mail size={16} /> Open & Send in Web Gmail
              </a>

              {/* Default OS Mail client */}
              <a
                href={submittedData.mailtoUrl}
                className="contact-modal-btn default-mail"
              >
                <Send size={16} /> Open in Default Mail App
              </a>

              {/* Direct WhatsApp Helpdesk */}
              <a
                href={`https://wa.me/919154557779?text=${encodeURIComponent(`Hello NTR Vikasa Helpdesk, my name is ${submittedData.name}. I submitted a ${submittedData.category} query: ${submittedData.message}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-modal-btn"
                style={{ background: '#25D366', color: '#ffffff' }}
              >
                <MessageCircle size={16} /> Send via WhatsApp Support
              </a>

              {/* Copy query text */}
              <button
                type="button"
                className="contact-modal-btn outline"
                onClick={() => handleCopy(submittedData.body, 'modal-body', 'Email summary')}
              >
                {copiedKey === 'modal-body' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                {copiedKey === 'modal-body' ? 'Copied to Clipboard' : 'Copy Query Summary'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
