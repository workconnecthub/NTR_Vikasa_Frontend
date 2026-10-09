import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarDays, MapPin, Clock, Users, Building2,
  UploadCloud, Save, Send, ArrowLeft, CheckCircle2, Image,
  Plus, Trash2, Briefcase, Eye, AlertCircle, Sparkles,
  Download, Maximize2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import JobMelaPosterModal, { downloadPosterImage } from '../../components/ui/JobMelaPosterModal';
import { useToast } from '../../context/ToastContext';
import { useAdmin, NTR_MANDALS } from '../../context/AdminContext';
import adminService from '../../services/adminService';

export default function AdminCreateJobMelaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companies, createJobMela } = useAdmin();

  const [loading, setLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  // Helper to downscale large flyer images so they persist in localStorage without quota errors
  const compressImageToDataUrl = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new window.Image();
        img.onerror = reject;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '2026-11-15',
    startTime: '09:00',
    endTime: '18:00',
    venue: 'State Convention Hall, Vijayawada',
    address: 'Near Benz Circle, MG Road, Vijayawada, NTR District',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    regStartDate: '2026-10-01',
    regEndDate: '2026-11-10',
    maxCapacity: '3500',
    // Client-specific creation (User requirement)
    createdForClient: false,
    client: '',
    clientId: '',
    clientContactPerson: '',
    clientContactPhone: '',
    // Geographic scope (Mandals & Villages)
    eligibleMandals: ['Vijayawada Urban', 'Vijayawada Rural', 'Ibrahimpatnam', 'Mylavaram'],
    eligibleVillages: 'All villages in selected mandals',
    eligibleQualifications: ['10TH', 'INTER', 'UG', 'PG']
  });

  // Participating Companies State
  const [participatingCompanies, setParticipatingCompanies] = useState([
    {
      id: 'comp-init-1',
      companyId: companies?.[0]?.id || '',
      company: companies?.[0]?.name || '',
      position: '',
      vacancies: '25',
      salary: '₹18,000 - ₹28,000 / month',
      qualification: 'B.Tech / B.E / Diploma / Any Graduate',
      experience: '0-2 Years',
      location: 'Stall A-01 (Hall 1)',
      notes: 'Direct walk-in technical assessment on spot.'
    }
  ]);

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ type: 'error', title: 'Invalid File', message: 'Please select an image file (JPG, PNG, WEBP).' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ type: 'error', title: 'File Too Large', message: 'Poster file size must be within 10MB.' });
      return;
    }

    try {
      const res = await adminService.uploadJobMelaPoster(file);
      if (res?.url) {
        setBannerPreview(res.url);
        toast({ type: 'success', title: 'Official Poster Uploaded', message: 'Official Job Mela event flyer saved and ready for display.' });
        return;
      }
    } catch (uploadErr) {
      console.warn('Backend poster upload failed, using local fallback:', uploadErr);
    }

    try {
      const dataUrl = await compressImageToDataUrl(file);
      setBannerPreview(dataUrl);
      toast({ type: 'success', title: 'Official Poster Uploaded', message: 'Official Job Mela event flyer saved and ready for display.' });
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBannerPreview(ev.target.result);
        toast({ type: 'success', title: 'Official Poster Uploaded', message: 'Official Job Mela event flyer saved.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCompany = () => {
    const nextIdx = participatingCompanies.length + 1;
    const defaultCompany = companies?.[(nextIdx - 1) % (companies?.length || 1)] || null;
    setParticipatingCompanies([
      ...participatingCompanies,
      {
        id: `comp-temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        companyId: defaultCompany?.id || '',
        company: defaultCompany?.name || '',
        position: '',
        vacancies: '15',
        salary: '₹20,000 - ₹35,000 / month',
        qualification: 'B.Tech / MCA / Any Graduate',
        experience: '0-2 Years',
        location: `Stall ${String.fromCharCode(64 + Math.min(nextIdx, 26))}-${nextIdx.toString().padStart(2, '0')}`,
        notes: ''
      }
    ]);
  };

  const handleRemoveCompany = (indexToRemove) => {
    if (participatingCompanies.length <= 1) {
      toast({ type: 'info', title: 'Cannot Remove', message: 'At least one company slot should remain, or clear its fields.' });
      return;
    }
    setParticipatingCompanies(participatingCompanies.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCompanyFieldChange = (index, field, value) => {
    setParticipatingCompanies(prev =>
      prev.map((c, idx) => {
        if (idx !== index) return c;
        if (field === 'companyId') {
          if (value === 'CUSTOM') {
            return { ...c, companyId: '', company: '' };
          }
          const matched = companies.find(comp => comp.id === value);
          return {
            ...c,
            companyId: value,
            company: matched ? matched.name : c.company
          };
        }
        return { ...c, [field]: value };
      })
    );
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast({ type: 'error', title: 'Event Name Required', message: 'Please enter an event name before saving draft.' });
      return;
    }

    const cleanCompanies = participatingCompanies
      .filter(c => c.company.trim() || c.position.trim())
      .map((c, idx) => ({
        id: `pmc-${Date.now()}-${idx}`,
        companyId: c.companyId || '',
        company: c.company.trim() || 'Participating Company',
        position: c.position.trim() || 'Various Roles',
        vacancies: Number(c.vacancies) || 10,
        applications: 0,
        salary: c.salary.trim() || 'Best in Industry',
        qualification: c.qualification.trim() || 'Any Degree',
        experience: c.experience.trim() || '0-2 Years',
        location: c.location.trim() || 'On-site Pavilion',
        notes: c.notes.trim() || ''
      }));

    try {
      const newMela = await createJobMela({
        ...formData,
        organizer: formData.createdForClient && formData.client
          ? `${formData.client} (Client Partner)`
          : 'NTR Vikasa State Employment Authority',
        banner: bannerPreview,
        posterImage: bannerPreview,
        image: bannerPreview,
        status: 'UPCOMING',
        participatingCompanies: cleanCompanies,
        companiesCount: cleanCompanies.length,
        registeredCandidatesCount: 0
      });

      toast({
        type: 'info',
        title: 'Draft Saved',
        message: `Job Mela "${formData.title}" saved to drafts with ${cleanCompanies.length} companies.`,
      });
      navigate('/admin/job-melas', { state: { openMelaId: newMela.id } });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not save draft.',
      });
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.venue.trim()) {
      toast({ type: 'error', title: 'Incomplete Details', message: 'Please complete all required event logistics fields.' });
      return;
    }

    // Filter valid companies
    const validCompanies = participatingCompanies.filter(c => c.company.trim() && c.position.trim());
    if (validCompanies.length === 0) {
      toast({ type: 'error', title: 'Participating Company Required', message: 'Please add at least one participating company with hiring position/role before publishing.' });
      return;
    }

    // Check for duplicate company + position
    const seen = new Set();
    for (const c of validCompanies) {
      const key = `${c.company.trim().toLowerCase()}__${c.position.trim().toLowerCase()}`;
      if (seen.has(key)) {
        toast({ type: 'error', title: 'Duplicate Company & Role', message: `Duplicate entry found for "${c.company}" with position "${c.position}".` });
        return;
      }
      seen.add(key);
    }

    setLoading(true);
    try {
      const cleanCompanies = validCompanies.map((c, idx) => ({
        id: `pmc-${Date.now()}-${idx}`,
        companyId: c.companyId || '',
        company: c.company.trim(),
        position: c.position.trim(),
        vacancies: Number(c.vacancies) || 10,
        applications: 0,
        salary: c.salary.trim() || 'Best in Industry',
        qualification: c.qualification.trim() || 'Any Degree',
        experience: c.experience.trim() || '0-2 Years',
        location: c.location.trim() || 'On-site Pavilion',
        notes: c.notes.trim() || 'Direct walk-in screening'
      }));

      const newMela = await createJobMela({
        ...formData,
        organizer: formData.createdForClient && formData.client
          ? `${formData.client} (Client Partner)`
          : 'NTR Vikasa State Employment Authority',
        banner: bannerPreview,
        posterImage: bannerPreview,
        image: bannerPreview,
        status: 'APPROVED',
        participatingCompanies: cleanCompanies,
        companiesCount: cleanCompanies.length,
        registeredCandidatesCount: 0
      });
      setLoading(false);
      toast({
        type: 'success',
        title: 'Job Mela Published',
        message: `Event "${formData.title}" is now published with ${cleanCompanies.length} participating companies!`,
      });
      navigate('/admin/job-melas', { state: { openMelaId: newMela.id } });
    } catch (err) {
      setLoading(false);
      toast({
        type: 'error',
        title: 'Publish Failed',
        message: err.message || 'Could not publish Job Mela.',
      });
    }
  };

  return (
    <div className="admin-create-job-mela-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <Link to="/admin/job-melas" style={{ textDecoration: 'none', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)' }}>
                <ArrowLeft size={14} /> Back to Job Melas
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <CalendarDays size={20} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Create Mega Job Fair / Career Expo</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Setup multi-company walk-in hiring events, assign corporate booth quotas, and publish candidate fast-track passes
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" size="sm" leftIcon={<Save size={14} />} onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Send size={14} />} loading={loading} onClick={handlePublish}>
              Publish Event
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

        {/* ── 1. Event Identification & Description ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="card-header">
            <h2 className="card-title">1. Event Name & Overview</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FormField label="Event Name / Title" required hint="e.g. Mumbai Mega Tech & Banking Job Mela 2026">
              <Input
                placeholder="Enter event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Detailed Description & Candidate Scope" required>
              <Textarea
                rows={3}
                placeholder="Describe participating industries, expected corporate recruiters, spot interview processes, and candidate eligibility..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </FormField>

            {/* Official Job Mela Poster / Flyer Upload */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Image size={15} style={{ color: 'var(--color-primary-600)' }} />
                    Official Event Poster / Flyer (Contains All Event Details) *
                  </label>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                    Upload the complete official event flyer (includes company lists, date, venue, QR codes, and guidelines). This will be displayed totally on all event cards and allow candidates to view and download it.
                  </p>
                </div>
                {bannerPreview && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      leftIcon={<Eye size={13} style={{ color: 'var(--color-primary-600)' }} />}
                      onClick={() => setPosterModalOpen(true)}
                    >
                      View Full Size
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      leftIcon={<Download size={13} />}
                      onClick={() => downloadPosterImage(bannerPreview, formData.title || 'Job_Mela_Flyer')}
                    >
                      Download Test
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      leftIcon={<Trash2 size={13} style={{ color: 'var(--color-danger-600)' }} />}
                      onClick={() => setBannerPreview(null)}
                      style={{ color: 'var(--color-danger-600)' }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div style={{
                border: bannerPreview ? '1.5px solid var(--color-primary-300)' : '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: bannerPreview ? 'var(--space-4)' : 'var(--space-8)',
                textAlign: 'center',
                background: bannerPreview ? 'linear-gradient(135deg, #0b1120 0%, #1e1b4b 100%)' : 'var(--color-gray-50)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-3)',
                transition: 'all 200ms ease'
              }}>
                {bannerPreview ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Image container displaying full poster without weird cropping */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '720px',
                        maxHeight: '380px',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      onClick={() => setPosterModalOpen(true)}
                      title="Click to view full poster flyer"
                    >
                      <img
                        src={bannerPreview}
                        alt="Event official flyer"
                        style={{
                          width: '100%',
                          maxHeight: '380px',
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto',
                          background: '#020617'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <Maximize2 size={13} style={{ color: '#38bdf8' }} /> Click to Preview Full Flyer
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', background: '#ffffff', color: '#0f172a', fontWeight: 700 }}>
                        <UploadCloud size={14} style={{ marginRight: 6 }} /> Replace Flyer Image
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerUpload} />
                      </label>
                      <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
                        ✓ Flyer ready & will display totally on all user cards
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-primary-50)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary-600)'
                    }}>
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'block' }}>
                        Upload Official Job Mela Poster / Event Flyer
                      </strong>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                        Supports JPG, PNG, WEBP (Flyer containing all companies, venue, eligibility & details)
                      </p>
                    </div>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', marginTop: 4 }}>
                      Choose Flyer / Poster File
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerUpload} />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 1.5 Client Sponsorship & Direct Creation (User Requirement) ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', border: formData.createdForClient ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Building2 size={20} style={{ color: 'var(--color-primary-600)' }} />
                2. Client Sponsorship & Direct Creation
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Admin can directly create a dedicated Job Mela on behalf of a corporate client or hiring partner.
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', fontWeight: 800, cursor: 'pointer', color: 'var(--color-primary-600)', background: 'var(--color-primary-50)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-primary-200)' }}>
              <input
                type="checkbox"
                checked={formData.createdForClient}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData(prev => ({
                    ...prev,
                    createdForClient: checked,
                    client: checked && !prev.client ? (companies?.[0]?.name || 'Dr. Reddy’s Laboratories') : prev.client,
                    clientId: checked && !prev.clientId ? (companies?.[0]?.id || '') : prev.clientId
                  }));
                }}
                style={{ accentColor: 'var(--color-primary-600)', width: 16, height: 16 }}
              />
              Directly Create for Client / Employer
            </label>
          </div>

          {formData.createdForClient && (
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', background: '#f8fafc', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <FormField label="Select Client / Company" required hint="Choose an existing verified company or type custom">
                  <select
                    className="form-control"
                    value={formData.clientId || 'CUSTOM'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setFormData(prev => ({ ...prev, clientId: '', client: '' }));
                      } else {
                        const matched = companies.find(c => c.id === val);
                        setFormData(prev => ({
                          ...prev,
                          clientId: val,
                          client: matched ? matched.name : prev.client,
                          clientContactPerson: matched?.recruiter || prev.clientContactPerson,
                          clientContactPhone: matched?.phone || prev.clientContactPhone
                        }));
                      }
                    }}
                    style={{ width: '100%', height: 38, borderRadius: 'var(--radius-lg)' }}
                  >
                    <option value="CUSTOM">-- Custom Client Name --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.industry || 'Corporate'})</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Client Organization Name" required>
                  <Input
                    placeholder="e.g. Dr. Reddy’s Laboratories / Aparna"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    required
                  />
                </FormField>

                <FormField label="Client Nodal / HR Contact">
                  <Input
                    placeholder="e.g. Suresh Varma (Lead Recruiter)"
                    value={formData.clientContactPerson}
                    onChange={(e) => setFormData({ ...formData, clientContactPerson: e.target.value })}
                  />
                </FormField>
              </div>

              {/* Geographic Scope: Eligible Mandals & Villages for this Client Job Mela */}
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-2)' }}>
                  <MapPin size={16} style={{ color: 'var(--color-primary-600)' }} />
                  <strong style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                    Geographic Scope & Mandal/Village Eligibility
                  </strong>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '0 0 10px 0' }}>
                  Specify which mandals and villages students are eligible to attend this client drive.
                </p>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                    Select Eligible Mandals (NTR District):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {NTR_MANDALS.map((mandal) => {
                      const isSelected = formData.eligibleMandals.includes(mandal);
                      return (
                        <button
                          key={mandal}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              eligibleMandals: isSelected
                                ? prev.eligibleMandals.filter(m => m !== mandal)
                                : [...prev.eligibleMandals, mandal]
                            }));
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: isSelected ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                            background: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface)',
                            color: isSelected ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                            transition: 'all 120ms ease'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}{mandal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <FormField label="Eligible Villages / Wards Note" hint="e.g. Gollapudi, Kondapalli, Bhavanipuram, or All Villages">
                    <Input
                      placeholder="e.g. Kondapalli, Ibrahimpatnam, Gollapudi"
                      value={formData.eligibleVillages}
                      onChange={(e) => setFormData({ ...formData, eligibleVillages: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Eligible Qualifications" hint="Eligible student tiers">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                      {[
                        { key: '10TH', label: '10th (SSC)' },
                        { key: 'INTER', label: 'Inter / 10+2' },
                        { key: 'UG', label: 'UG Degree' },
                        { key: 'PG', label: 'PG / Master' }
                      ].map((q) => {
                        const checked = formData.eligibleQualifications.includes(q.key);
                        return (
                          <label key={q.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  eligibleQualifications: e.target.checked
                                    ? [...prev.eligibleQualifications, q.key]
                                    : prev.eligibleQualifications.filter(k => k !== q.key)
                                }));
                              }}
                              style={{ accentColor: 'var(--color-primary-600)' }}
                            />
                            {q.label}
                          </label>
                        );
                      })}
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Schedule & Registration Windows ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="card-header">
            <h2 className="card-title">3. Schedule & Timeline</h2>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <FormField label="Event Date" required>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Start Time (IST)" required>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </FormField>

            <FormField label="End Time (IST)" required>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Candidate Registration Start" required>
              <Input
                type="date"
                value={formData.regStartDate}
                onChange={(e) => setFormData({ ...formData, regStartDate: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Candidate Registration Deadline" required>
              <Input
                type="date"
                value={formData.regEndDate}
                onChange={(e) => setFormData({ ...formData, regEndDate: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Maximum Candidate Capacity (Seats)" required>
              <Input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                required
              />
            </FormField>
          </div>
        </div>

        {/* ── 3. Venue & Logistics ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="card-header">
            <h2 className="card-title">3. Venue & Location Details</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <FormField label="Venue Name / Convention Hall" required>
                <Input
                  placeholder="e.g. Bombay Exhibition Centre (NESCO), Hall 4"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="City" required>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="State" required>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Full Street Address & Landmarks" required>
              <Input
                placeholder="e.g. Western Express Highway, Goregaon East, Mumbai 400063"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </FormField>
          </div>
        </div>

        {/* ── 4. Participating Companies & Job Openings Section ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Building2 size={20} style={{ color: 'var(--color-primary-600)' }} />
                4. Participating Companies & Job Openings
                <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                  {participatingCompanies.length} Added
                </span>
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Add corporate employers, hiring positions, salary ranges, qualifications, and booth allocations.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={handleAddCompany}
            >
              + Add Company
            </Button>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {participatingCompanies.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  background: 'var(--color-gray-50)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-5)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)'
                }}
              >
                {/* Header of Company Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{
                      width: 26,
                      height: 26,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-primary-600)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {idx + 1}
                    </span>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                      {item.company || `Company #${idx + 1}`}
                    </strong>
                    {item.position && (
                      <span className="badge badge-secondary" style={{ fontSize: '10px' }}>
                        {item.position}
                      </span>
                    )}
                  </div>

                  <Button
                    type="button"
                    size="xs"
                    variant="danger"
                    leftIcon={<Trash2 size={12} />}
                    onClick={() => handleRemoveCompany(idx)}
                    title="Remove this company"
                  >
                    Remove Company
                  </Button>
                </div>

                {/* Company Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {/* Company / Employer Selector */}
                  <FormField label="Company / Employer" required hint="Select from verified platform companies or enter custom name">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <select
                        value={item.companyId || (companies?.some(c => c.name === item.company) ? companies.find(c => c.name === item.company)?.id : 'CUSTOM')}
                        onChange={(e) => handleCompanyFieldChange(idx, 'companyId', e.target.value)}
                        className="form-control"
                        style={{ height: 38, borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                      >
                        <option value="">-- Select from Registered Companies --</option>
                        {companies?.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.industry || 'Corporate'})</option>
                        ))}
                        <option value="CUSTOM">+ Other / Custom Employer Name</option>
                      </select>

                      <Input
                        placeholder="Or enter company / organization name..."
                        value={item.company}
                        onChange={(e) => handleCompanyFieldChange(idx, 'company', e.target.value)}
                        required
                      />
                    </div>
                  </FormField>

                  {/* Position & Vacancies */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
                    <FormField label="Job Title / Position" required>
                      <Input
                        placeholder="e.g. Mobile Operator, Graduate Engineer Trainee, Software Dev"
                        value={item.position}
                        onChange={(e) => handleCompanyFieldChange(idx, 'position', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Number of Vacancies" required>
                      <Input
                        type="number"
                        placeholder="e.g. 25"
                        value={item.vacancies}
                        onChange={(e) => handleCompanyFieldChange(idx, 'vacancies', e.target.value)}
                        required
                      />
                    </FormField>
                  </div>

                  {/* Qualification & Experience */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-3)' }}>
                    <FormField label="Eligibility / Qualification" required>
                      <Input
                        placeholder="e.g. ITI / Diploma / B.E / B.Tech / Any Degree"
                        value={item.qualification}
                        onChange={(e) => handleCompanyFieldChange(idx, 'qualification', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Experience Required" required>
                      <Input
                        placeholder="e.g. Fresher (0-1 yr), 1-3 Years"
                        value={item.experience}
                        onChange={(e) => handleCompanyFieldChange(idx, 'experience', e.target.value)}
                        required
                      />
                    </FormField>
                  </div>

                  {/* Salary & Stall Allocation */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-3)' }}>
                    <FormField label="Salary / Salary Range" required>
                      <Input
                        placeholder="e.g. ₹18,000 - ₹28,000 / month or ₹4.5 - ₹7 LPA"
                        value={item.salary}
                        onChange={(e) => handleCompanyFieldChange(idx, 'salary', e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Location / Stall Allocation">
                      <Input
                        placeholder="e.g. Stall B-14 (Hall 3)"
                        value={item.location}
                        onChange={(e) => handleCompanyFieldChange(idx, 'location', e.target.value)}
                      />
                    </FormField>
                  </div>

                  {/* Notes */}
                  <FormField label="Additional Notes / Job Description">
                    <Input
                      placeholder="e.g. Carry 3 printed resumes & ID proof. Spot offer letters upon clearing round 2."
                      value={item.notes}
                      onChange={(e) => handleCompanyFieldChange(idx, 'notes', e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={handleAddCompany}
              >
                + Add Another Company
              </Button>
            </div>
          </div>
        </div>

        {/* ── 5. Job Mela Live Preview / Summary ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', border: '2px solid var(--color-primary-100)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Eye size={18} style={{ color: 'var(--color-primary-600)' }} />
              5. Job Mela Live Preview
            </h2>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>
              Real-time Preview
            </span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Live Event Summary Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
              color: '#ffffff',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-xl)'
            }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                {formData.title || 'Untitled Mega Job Mela 2026'}
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: '#c7d2fe' }}>
                <span>📅 {formData.date ? new Date(formData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Nov 2026'}</span>
                <span>⏰ {formData.startTime || '09:00'} – {formData.endTime || '18:00'} IST</span>
                <span>📍 {formData.city || 'City'}, {formData.state || 'State'}</span>
                <span>🏢 {formData.venue || 'Venue Convention Hall'}</span>
              </div>
            </div>

            {/* Participating Companies Table Preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }}>
                  Participating Companies — {participatingCompanies.filter(c => c.company.trim()).length}
                </h4>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 700 }}>
                  Total Vacancies: {participatingCompanies.reduce((sum, c) => sum + (Number(c.vacancies) || 0), 0)} Positions
                </span>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-border)', textAlign: 'left', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontSize: '10px' }}>
                      <th style={{ padding: '8px 12px' }}>Company</th>
                      <th style={{ padding: '8px 12px' }}>Position</th>
                      <th style={{ padding: '8px 12px' }}>Qualification</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Vacancies</th>
                      <th style={{ padding: '8px 12px' }}>Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participatingCompanies.filter(c => c.company.trim() || c.position.trim()).length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          No participating companies entered yet. Use the section above to add employers.
                        </td>
                      </tr>
                    ) : (
                      participatingCompanies.filter(c => c.company.trim() || c.position.trim()).map((c, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {c.company || 'Unnamed Company'}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                            {c.position || '—'}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>
                            {c.qualification || 'Any Degree'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <span className="badge badge-success" style={{ fontSize: '10px' }}>
                              {c.vacancies || 0}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                            {c.salary || 'Best in Industry'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/admin/job-melas">
              <Button variant="ghost" size="sm">Cancel</Button>
            </Link>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="secondary" type="button" leftIcon={<Save size={14} />} onClick={handleSaveDraft}>
                Save as Draft
              </Button>
              <Button variant="primary" type="submit" leftIcon={<Send size={14} />} loading={loading}>
                Publish Event
              </Button>
            </div>
          </div>
        </div>

      </form>

      {/* Full Resolution Poster Lightbox Modal */}
      {posterModalOpen && bannerPreview && (
        <JobMelaPosterModal
          isOpen={posterModalOpen}
          onClose={() => setPosterModalOpen(false)}
          posterUrl={bannerPreview}
          eventTitle={formData.title || 'Official Job Mela Event Flyer'}
          eventDate={formData.date}
          eventVenue={formData.venue}
        />
      )}

    </div>
  );
}
