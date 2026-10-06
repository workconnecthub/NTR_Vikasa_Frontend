import { useState, useRef, useEffect } from 'react';
import {
  Building2, Globe, Mail, Phone, MapPin,
  Edit2, Save, ShieldCheck, UploadCloud, Trash2, Loader2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { useRecruiter } from '../../context/RecruiterContext';
import { useToast } from '../../context/ToastContext';
import recruiterCompanyService from '../../services/recruiterCompanyService';

const getFullLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function RecruiterCompanyPage() {
  const { recruiter, updateCompanyProfile } = useRecruiter();
  const { addToast } = useToast();

  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const defaultCompany = {
    name: 'ABC Technologies Pvt Ltd',
    tagline: 'Leading enterprise cloud modernization, DevOps & digital transformation engineering.',
    description: 'ABC Technologies is a premier enterprise IT software solutions provider. With global delivery centers across Bengaluru, Hyderabad, and Vijayawada, ABC Technologies powers digital platforms for Fortune 500 enterprises across Fintech, E-Commerce, and Supply Chain.',
    industry: 'Information Technology',
    size: '1000-5000 employees',
    employeesCount: '2,400+',
    foundedYear: '2015',
    website: 'https://abctechnologies.example.com',
    email: 'careers@abctechnologies.example.com',
    phone: '+91 80 4920 1000',
    location: 'Bengaluru, Karnataka',
    address: 'Block B, RMZ Ecospace, Outer Ring Road, Bellandur, Bengaluru 560103',
    cinNumber: 'U72200KA2015PTC078912',
    gstNumber: '29ABCDE1234F1Z5',
    verified: true,
    logo: null
  };

  const company = companyData || recruiter?.company || defaultCompany;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...company });
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef(null);

  // Fetch real company profile from backend API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await recruiterCompanyService.getCompanyProfile();
        if (isMounted && data) {
          setCompanyData(data);
          setEditForm(data);
        }
      } catch (err) {
        console.warn('Failed to load company profile from backend, using current context:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setLogoError('Please upload an image file (PNG, JPG, SVG, WebP).');
      addToast('Please upload a valid image file.', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Image size exceeds 2MB limit. Please choose a smaller file.');
      addToast('Image size should be less than 2MB.', 'error');
      return;
    }

    setLogoError('');
    try {
      setUploadingLogo(true);
      const res = await recruiterCompanyService.uploadCompanyLogo(file);
      if (res?.logo_url) {
        setEditForm((prev) => ({ ...prev, logo: res.logo_url, logo_url: res.logo_url }));
        setCompanyData((prev) => ({ ...(prev || company), logo: res.logo_url, logo_url: res.logo_url }));
        addToast('Company logo uploaded and saved successfully.', 'success');
      }
    } catch (err) {
      setLogoError(err.message || 'Failed to upload logo.');
      addToast(err.message || 'Failed to upload logo.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setEditForm((prev) => ({ ...prev, logo: null, logo_url: null }));
    setLogoError('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
    addToast('Company logo removed from form.', 'info');
  };

  const handleStartEdit = () => {
    setEditForm({ ...company });
    setLogoError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...company });
    setLogoError('');
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const legalName = (editForm.name || editForm.company_name || '').trim();
    if (!legalName) {
      addToast('Company Legal Name is required.', 'error');
      return;
    }
    const industrySector = (editForm.industry || editForm.primary_industry || '').trim();
    if (!industrySector) {
      addToast('Industry / Sector is required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        company_name: legalName,
        industry: industrySector,
        tagline: (editForm.tagline || '').trim(),
        official_website: (editForm.website || editForm.official_website || '').trim(),
        careers_email: (editForm.email || editForm.careers_email || '').trim(),
        contact_phone: (editForm.phone || editForm.contact_phone || '').trim(),
        company_size: (editForm.size || editForm.company_size || '').trim(),
        registered_office_address: (editForm.address || editForm.registered_office_address || '').trim(),
        about_company: (editForm.description || editForm.about_company || '').trim(),
        cin_number: (editForm.cinNumber || editForm.cin_number || '').trim(),
        gst_number: (editForm.gstNumber || editForm.gst_number || '').trim(),
      };

      const updated = await recruiterCompanyService.updateCompanyProfile(payload);
      setCompanyData(updated);
      setEditForm(updated);
      if (updateCompanyProfile) {
        updateCompanyProfile(updated);
      }
      setIsEditing(false);
      addToast('Company Profile updated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update company profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portal-page">
      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Building2 size={22} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Company Profile & Verification</h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)', margin: 0 }}>
              Manage public brand details, verified registration data, and hiring information for <strong>{company.name}</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={saving}>Cancel</Button>
                <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" icon={<Edit2 size={14} />} onClick={handleStartEdit}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Drawer / Card when isEditing is true */}
      {isEditing && (
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-2xl)', border: '2px solid var(--color-primary-400)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-gray-900)' }}>
            Edit Company Details
          </h2>

          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* 1. Company Logo */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--color-primary-600), #7c3aed)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid var(--color-primary-200)'
              }}>
                {editForm.logo ? (
                  <img src={getFullLogoUrl(editForm.logo)} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (editForm.name || editForm.company_name)?.[0]?.toUpperCase() || 'C'
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                  Company Logo
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-500)' }}>
                  Supported formats: PNG, JPG, JPEG, WebP, SVG (Max 2MB).
                </span>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    style={{ display: 'none' }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={uploadingLogo ? <Loader2 size={14} className="spin" /> : <UploadCloud size={14} />}
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                  </Button>

                  {editForm.logo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={handleRemoveLogo}
                      style={{ color: 'var(--color-danger-600)' }}
                    >
                      Remove Logo
                    </Button>
                  )}
                </div>

                {logoError && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-danger-600)', fontWeight: 600 }}>
                    ⚠️ {logoError}
                  </span>
                )}
              </div>
            </div>

            {/* 2. Company Legal Name */}
            <FormField label="Company Legal Name" required>
              <Input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </FormField>

            {/* 3. Industry / Sector */}
            <FormField label="Industry / Sector" required>
              <Input
                type="text"
                value={editForm.industry}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                required
              />
            </FormField>

            {/* 4. Tagline */}
            <FormField label="Tagline">
              <Input
                type="text"
                value={editForm.tagline || ''}
                onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                placeholder="e.g. Leading enterprise cloud modernization"
              />
            </FormField>

            {/* 5. Official Website */}
            <FormField label="Official Website">
              <Input
                type="url"
                value={editForm.website || ''}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                placeholder="https://example.com"
              />
            </FormField>

            {/* 6. Official Careers Email */}
            <FormField label="Official Careers Email">
              <Input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="careers@example.com"
              />
            </FormField>

            {/* 7. Contact Phone */}
            <FormField label="Contact Phone">
              <Input
                type="text"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+91 80 4920 1000"
              />
            </FormField>

            {/* 8. Company Size */}
            <FormField label="Company Size">
              <Input
                type="text"
                value={editForm.size || ''}
                onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                placeholder="e.g. 1000-5000 employees"
              />
            </FormField>

            {/* 9. Registered Office Address */}
            <FormField label="Registered Office Address" style={{ gridColumn: '1 / -1' }}>
              <Input
                type="text"
                value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="Full official office postal address"
              />
            </FormField>

            {/* 10. About Company (Overview) */}
            <FormField label="About Company (Overview)" style={{ gridColumn: '1 / -1' }}>
              <Textarea
                rows={4}
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Comprehensive description of your company, mission, engineering culture, and service offerings..."
              />
            </FormField>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={handleCancelEdit} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<Save size={16} />} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Main Company Identity & Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Company Identity & Verification Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-primary-600), #7c3aed)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {company.logo ? (
                <img src={getFullLogoUrl(company.logo)} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                company.name?.[0]?.toUpperCase() || 'C'
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-gray-900)' }}>
                  {company.name}
                </h2>
                {company.verified && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: '#ecfdf5',
                    color: '#059669',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    border: '1px solid #a7f3d0'
                  }}>
                    <ShieldCheck size={14} /> Verified Employer
                  </span>
                )}
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-gray-600)' }}>
                {company.industry} • Founded {company.foundedYear || '2015'}
              </p>
              {company.tagline && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-primary-700)', fontStyle: 'italic' }}>
                  "{company.tagline}"
                </p>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {company.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-gray-200)', fontSize: '0.825rem' }}>
            <div>
              <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Company Size</span>
              <strong>{company.size} {company.employeesCount ? `(${company.employeesCount})` : ''}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Location</span>
              <strong>{company.location || company.address?.split(',')[0] || 'India'}</strong>
            </div>
            {company.cinNumber && (
              <div>
                <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Corporate CIN</span>
                <strong style={{ fontFamily: 'monospace' }}>{company.cinNumber}</strong>
              </div>
            )}
            {company.gstNumber && (
              <div>
                <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>GST Number</span>
                <strong style={{ fontFamily: 'monospace' }}>{company.gstNumber}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Official Channels & Contact Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--color-gray-900)' }}>
              Official Channels & Verification Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-gray-700)' }}>
                <Globe size={18} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Official Website</span>
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600 }}>
                      {company.website}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--color-gray-400)' }}>Not provided</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-gray-700)' }}>
                <Mail size={18} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Careers Email</span>
                  <span style={{ fontWeight: 600 }}>{company.email || 'Not provided'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-gray-700)' }}>
                <Phone size={18} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Contact Phone</span>
                  <span style={{ fontWeight: 600 }}>{company.phone || 'Not provided'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-gray-700)' }}>
                <MapPin size={18} color="var(--color-primary-600)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', display: 'block' }}>Registered Office Address</span>
                  <span style={{ fontWeight: 500 }}>{company.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'var(--color-primary-50)',
            borderRadius: '8px',
            border: '1px solid var(--color-primary-100)',
            fontSize: '0.8rem',
            color: 'var(--color-primary-900)'
          }}>
            ✓ Enterprise verified profile with NTR Vikasa Skill & Placement Mission.
          </div>
        </div>
      </div>
    </div>
  );
}
