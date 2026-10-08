import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, ShieldCheck, Camera, Trash2, UploadCloud,
  CheckCircle2, AlertCircle, Info, Building2, BadgeCheck,
  Edit2, Save, X, Phone, Loader2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import adminProfileService from '../../services/adminProfileService';

const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${BACKEND_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function AdminProfilePage() {
  const { currentAdmin } = useAdmin();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Local state for profile data
  const [profileData, setProfileData] = useState(() => {
    try {
      const stored = localStorage.getItem('ntr_admin_custom_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return {
      name: currentAdmin?.name || 'Admin User',
      role: currentAdmin?.title || 'Platform Administrator',
      email: currentAdmin?.email || 'admin1@ntrvikasa.com',
      designation: currentAdmin?.designation || 'State Operations Lead',
      phone: '+91 98765 43210',
      department: 'State Employment & Skill Development Authority',
      status: 'ACTIVE',
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [formErrors, setFormErrors] = useState({});

  // Local state for profile avatar
  const [avatarImage, setAvatarImage] = useState(() => {
    try {
      return localStorage.getItem('ntr_admin_custom_avatar') || null;
    } catch (e) {
      return null;
    }
  });

  const [imageError, setImageError] = useState('');

  // ── Fetch Profile from Real Backend on Mount ──
  useEffect(() => {
    let isMounted = true;
    const fetchAdminProfile = async () => {
      try {
        setIsLoading(true);
        const data = await adminProfileService.getProfile();
        if (!isMounted) return;

        const resolved = {
          name: data.full_name || 'Admin User',
          role: data.role || 'Platform Administrator',
          email: data.email || 'admin1@ntrvikasa.com',
          designation: data.designation || 'State Operations Lead',
          phone: data.contact_phone || '+91 98765 43210',
          department: data.department || 'State Employment & Skill Development Authority',
          status: data.status || 'ACTIVE',
        };

        setProfileData(resolved);
        setFormData(resolved);

        try {
          localStorage.setItem('ntr_admin_custom_profile', JSON.stringify(resolved));
          window.dispatchEvent(new Event('admin_profile_updated'));
        } catch (e) {}

        if (data.profile_image_url) {
          const fullImgUrl = resolveImageUrl(data.profile_image_url);
          setAvatarImage(fullImgUrl);
          try {
            localStorage.setItem('ntr_admin_custom_avatar', fullImgUrl);
            window.dispatchEvent(new Event('admin_avatar_updated'));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Failed to load admin profile from backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAdminProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const adminName = profileData.name;
  const adminRole = profileData.role;
  const adminEmail = profileData.email;
  const adminDesignation = profileData.designation;
  const initialLetter = currentAdmin?.avatar || adminName[0]?.toUpperCase() || 'A';

  // Handle image file selection & upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      addToast('Invalid file format. Allowed formats: PNG, JPG, WEBP.', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size exceeds 2MB limit. Please choose a smaller file.');
      addToast('Image size should be less than 2MB.', 'error');
      return;
    }

    setImageError('');
    setIsUploadingImage(true);

    try {
      const resp = await adminProfileService.uploadProfileImage(file);
      const fullUrl = resolveImageUrl(resp.profile_image_url);
      setAvatarImage(fullUrl);

      try {
        localStorage.setItem('ntr_admin_custom_avatar', fullUrl);
        window.dispatchEvent(new Event('admin_avatar_updated'));
      } catch (err) {
        // Handle localStorage quota
      }

      addToast(resp.message || 'Profile image updated successfully.', 'success');
    } catch (err) {
      setImageError(err.message || 'Failed to upload profile image.');
      addToast(err.message || 'Failed to upload profile image.', 'error');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle remove photo
  const handleRemoveImage = () => {
    setAvatarImage(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    try {
      localStorage.removeItem('ntr_admin_custom_avatar');
      window.dispatchEvent(new Event('admin_avatar_updated'));
    } catch (err) {
      // Ignore
    }
    addToast('Profile image removed. Displaying default avatar.', 'info');
  };

  const handleStartEdit = () => {
    setFormData(profileData);
    setFormErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(profileData);
    setFormErrors({});
    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!formData.email || !formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        designation: formData.designation ? formData.designation.trim() : null,
        contact_phone: formData.phone ? formData.phone.trim() : null,
      };

      const updated = await adminProfileService.updateProfile(payload);

      const resolved = {
        name: updated.full_name,
        role: updated.role,
        email: updated.email,
        designation: updated.designation || '',
        phone: updated.contact_phone || '',
        department: updated.department || profileData.department,
        status: updated.status || 'ACTIVE',
      };

      setProfileData(resolved);
      setFormData(resolved);

      try {
        localStorage.setItem('ntr_admin_custom_profile', JSON.stringify(resolved));
        window.dispatchEvent(new Event('admin_profile_updated'));
      } catch (err) {
        // Ignore
      }

      setIsEditing(false);
      setFormErrors({});
      addToast('Profile updated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update administrator profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-profile-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
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
            <User size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--color-gray-900)' }}>
              Admin Profile
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Personal administrator account details and profile photo management
            </p>
          </div>
        </div>
      </div>

      <div className="admin-profile-grid">
        {/* ── 1. Profile Information ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
          <div className="card-header admin-profile-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-primary-600)' }} />
              <h2 className="card-title" style={{ margin: 0 }}>Profile Information</h2>
            </div>
            <div className="admin-profile-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 size={14} />}
                  onClick={handleStartEdit}
                  className="admin-edit-profile-btn"
                >
                  Edit Profile
                </Button>
              )}
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <BadgeCheck size={12} /> Active Administrator
              </span>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Identity Summary Card */}
            <div className="admin-identity-card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-gray-200)',
              flexWrap: 'wrap'
            }}>
              <div
                className="sidebar-user-avatar"
                style={{
                  width: 64,
                  height: 64,
                  fontSize: 'var(--text-xl)',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-sm)',
                  border: '2px solid #fff'
                }}
              >
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt={adminName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  initialLetter
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0, color: 'var(--color-gray-900)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                    {adminName}
                  </h3>
                  <span className="badge badge-primary" style={{ fontSize: '11px', padding: '2px 8px', flexShrink: 0 }}>
                    {adminRole}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  {adminDesignation}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  <Mail size={12} style={{ flexShrink: 0 }} /> {adminEmail}
                </span>
              </div>
            </div>

            {/* Profile Form Fields */}
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="admin-form-row">
                <FormField label="Full Name" required={isEditing} error={formErrors.name}>
                  <Input
                    value={isEditing ? formData.name : adminName}
                    disabled={!isEditing || isSaving}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ backgroundColor: isEditing ? '#fff' : 'var(--color-gray-50)' }}
                  />
                </FormField>
                <FormField label="Role / Control Level">
                  <Input
                    value={isEditing ? formData.role : adminRole}
                    disabled={true}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    style={{ backgroundColor: 'var(--color-gray-50)' }}
                  />
                </FormField>
              </div>

              <div className="admin-form-row">
                <FormField label="Official Email Address" required={isEditing} error={formErrors.email}>
                  <Input
                    value={isEditing ? formData.email : adminEmail}
                    disabled={!isEditing || isSaving}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    style={{ backgroundColor: isEditing ? '#fff' : 'var(--color-gray-50)' }}
                  />
                </FormField>
                <FormField label="Designation">
                  <Input
                    value={isEditing ? formData.designation : adminDesignation}
                    disabled={!isEditing || isSaving}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    style={{ backgroundColor: isEditing ? '#fff' : 'var(--color-gray-50)' }}
                  />
                </FormField>
              </div>

              <div className="admin-form-row">
                <FormField label="Contact Phone">
                  <Input
                    value={isEditing ? formData.phone : profileData.phone}
                    disabled={!isEditing || isSaving}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ backgroundColor: isEditing ? '#fff' : 'var(--color-gray-50)' }}
                  />
                </FormField>
                <FormField label="Department / Authority">
                  <Input
                    value={isEditing ? formData.department : profileData.department}
                    disabled={true}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    style={{ backgroundColor: 'var(--color-gray-50)' }}
                  />
                </FormField>
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<X size={14} />}
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    leftIcon={isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--color-primary-50)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-primary-100)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-primary-800)'
                }}>
                  <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Click <strong>Edit Profile</strong> to modify your administrator display name, designation, official email, or contact details.
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ── 2. Change Profile Image ── */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Camera size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="card-title">Change Profile Image</h2>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', flex: 1 }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Upload or update your administrator avatar image. Changes are previewed immediately across the header and profile menu.
            </p>

            {/* Avatar Preview Canvas */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-6)',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-xl)',
              border: '2px dashed var(--color-gray-200)',
              gap: 'var(--space-4)'
            }}>
              <div
                className="sidebar-user-avatar"
                style={{
                  width: 96,
                  height: 96,
                  fontSize: 'var(--text-3xl)',
                  boxShadow: 'var(--shadow-md)',
                  border: '3px solid #fff'
                }}
              >
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  initialLetter
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-gray-800)', margin: 0 }}>
                  {avatarImage ? 'Custom Photo Active' : 'Default Initial Avatar'}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  {avatarImage ? 'Click Change Photo to replace or Remove Photo to reset' : 'Upload an image to personalize your profile'}
                </p>
              </div>

              {imageError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: 'var(--color-danger-600)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500
                }}>
                  <AlertCircle size={14} />
                  <span>{imageError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="admin-profile-photo-input"
              />

              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', width: '100%' }}>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  style={{ flex: '1 1 140px' }}
                  leftIcon={isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? 'Uploading...' : avatarImage ? 'Change Photo' : 'Upload Photo'}
                </Button>

                {avatarImage && (
                  <Button
                    type="button"
                    variant="outline-danger"
                    size="md"
                    style={{ flex: '1 1 120px' }}
                    leftIcon={<Trash2 size={16} />}
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>

              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                PNG, JPG, or WEBP up to 2MB.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
