import { useState, useEffect } from 'react';
import {
  Settings, ShieldCheck, Server, Save
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import { Toggle } from '../../components/ui/FormControls';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';
import adminSettingsService from '../../services/adminSettingsService';

export default function AdminSettingsPage() {
  const toast = useToast();
  const { updateAdminSettings } = useAdmin();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [platformName, setPlatformName] = useState('NTR VIKASA State Job Portal Administration');
  const [supportEmail, setSupportEmail] = useState('support@ntrvikasa.com');
  const [grievanceEmail, setGrievanceEmail] = useState('grievance@ntrvikasa.com');

  // Security Policy Toggles
  const [requireRecruiterVerification, setRequireRecruiterVerification] = useState(true);
  const [requireJobModeration, setRequireJobModeration] = useState(true);
  const [enforceZeroCandidateFee, setEnforceZeroCandidateFee] = useState(true);
  const [enableMaintenanceMode, setEnableMaintenanceMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      setIsLoading(true);
      try {
        const data = await adminSettingsService.getSettings();
        if (isMounted && data) {
          setPlatformName(data.platform_display_name || data.platformName || 'NTR VIKASA State Job Portal Administration');
          setSupportEmail(data.primary_support_email || data.supportEmail || 'support@ntrvikasa.com');
          setGrievanceEmail(data.grievance_redressal_email || data.grievanceEmail || 'grievance@ntrvikasa.com');
          setRequireRecruiterVerification(
            data.mandatory_recruiter_legal_verification ?? data.requireRecruiterVerification ?? true
          );
          setRequireJobModeration(
            data.pre_publish_job_moderation_queue ?? data.requireJobModeration ?? true
          );
          setEnforceZeroCandidateFee(
            data.strict_zero_fee_candidate_rule ?? data.enforceZeroCandidateFee ?? true
          );
          setEnableMaintenanceMode(
            data.platform_maintenance_mode ?? data.enableMaintenanceMode ?? false
          );
        }
      } catch (err) {
        console.warn('Failed to load system settings from backend:', err);
        if (isMounted) {
          toast.error(err.message || 'Failed to load system settings from server.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!platformName || !platformName.trim()) {
      errs.platformName = 'Platform display name is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!supportEmail || !supportEmail.trim()) {
      errs.supportEmail = 'Primary support email is required.';
    } else if (!emailRegex.test(supportEmail.trim())) {
      errs.supportEmail = 'Invalid email address.';
    }
    if (!grievanceEmail || !grievanceEmail.trim()) {
      errs.grievanceEmail = 'Grievance redressal email is required.';
    } else if (!emailRegex.test(grievanceEmail.trim())) {
      errs.grievanceEmail = 'Invalid email address.';
    }
    return errs;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please resolve the validation errors before saving.');
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const payload = {
        platform_display_name: platformName.trim(),
        primary_support_email: supportEmail.trim(),
        grievance_redressal_email: grievanceEmail.trim(),
        mandatory_recruiter_legal_verification: requireRecruiterVerification,
        pre_publish_job_moderation_queue: requireJobModeration,
        strict_zero_fee_candidate_rule: enforceZeroCandidateFee,
        platform_maintenance_mode: enableMaintenanceMode,
      };

      const updated = await adminSettingsService.updateSettings(payload);

      if (typeof updateAdminSettings === 'function') {
        updateAdminSettings({
          platformName: updated.platform_display_name || payload.platform_display_name,
          supportEmail: updated.primary_support_email || payload.primary_support_email,
          grievanceEmail: updated.grievance_redressal_email || payload.grievance_redressal_email,
          requireRecruiterVerification: updated.mandatory_recruiter_legal_verification ?? payload.mandatory_recruiter_legal_verification,
          requireJobModeration: updated.pre_publish_job_moderation_queue ?? payload.pre_publish_job_moderation_queue,
          enforceZeroCandidateFee: updated.strict_zero_fee_candidate_rule ?? payload.strict_zero_fee_candidate_rule,
          enableMaintenanceMode: updated.platform_maintenance_mode ?? payload.platform_maintenance_mode,
        });
      }

      toast.success('System configuration and policy settings updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update system settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-settings-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Settings size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>System & Global Platform Settings</h1>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 2, margin: 0 }}>
          Configure enterprise platform parameters, verification policies, and security guardrails.
        </p>
      </div>

      {/* ── 1. General Platform Configuration ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Server size={18} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="card-title">General Platform Parameters</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 640 }}>
            <FormField label="Platform Display Name" required error={errors.platformName}>
              <Input
                value={platformName}
                onChange={(e) => {
                  setPlatformName(e.target.value);
                  if (errors.platformName) setErrors(prev => ({ ...prev, platformName: '' }));
                }}
                error={!!errors.platformName}
                disabled={isLoading || isSaving}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <FormField label="Primary Support Email" required error={errors.supportEmail}>
                <Input
                  value={supportEmail}
                  onChange={(e) => {
                    setSupportEmail(e.target.value);
                    if (errors.supportEmail) setErrors(prev => ({ ...prev, supportEmail: '' }));
                  }}
                  error={!!errors.supportEmail}
                  disabled={isLoading || isSaving}
                />
              </FormField>
              <FormField label="Grievance Redressal Email" required error={errors.grievanceEmail}>
                <Input
                  value={grievanceEmail}
                  onChange={(e) => {
                    setGrievanceEmail(e.target.value);
                    if (errors.grievanceEmail) setErrors(prev => ({ ...prev, grievanceEmail: '' }));
                  }}
                  error={!!errors.grievanceEmail}
                  disabled={isLoading || isSaving}
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Moderation & Compliance Policies ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ShieldCheck size={18} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="card-title">Moderation & Regulatory Policies</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>Mandatory Recruiter Legal Verification</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>Require Admin COI & GST approval before allowing employers to post vacancies</p>
            </div>
            <Toggle checked={requireRecruiterVerification} onChange={(e) => setRequireRecruiterVerification(e.target.checked)} disabled={isLoading || isSaving} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>Pre-Publish Job Moderation Queue</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>Hold new job and internship postings for administrative wage transparency checks</p>
            </div>
            <Toggle checked={requireJobModeration} onChange={(e) => setRequireJobModeration(e.target.checked)} disabled={isLoading || isSaving} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-gray-100)' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>Strict Zero-Fee Candidate Rule Enforcement</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>Automatically flag any recruiter mentioning registration fees or security deposits</p>
            </div>
            <Toggle checked={enforceZeroCandidateFee} onChange={(e) => setEnforceZeroCandidateFee(e.target.checked)} disabled={isLoading || isSaving} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>Platform Maintenance Mode</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>Restrict public candidate registration during scheduled state-wide database maintenance</p>
            </div>
            <Toggle checked={enableMaintenanceMode} onChange={(e) => setEnableMaintenanceMode(e.target.checked)} disabled={isLoading || isSaving} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Save size={16} />}
          onClick={handleSave}
          loading={isSaving}
          disabled={isSaving || isLoading}
        >
          Save System Settings
        </Button>
      </div>
    </div>
  );
}
