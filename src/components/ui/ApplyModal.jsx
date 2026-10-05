import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle2, Upload, AlertCircle, ArrowRight, X,
  Building2, Briefcase, MapPin, Sparkles, Check
} from 'lucide-react';
import Button from './Button';
import { useToast } from '../../context/ToastContext';
import { useCandidate } from '../../context/CandidateContext';
import authService from '../../services/authService';
import candidateApplicationsService from '../../services/candidateApplicationsService';


export default function ApplyModal({
  isOpen,
  onClose,
  job,
  onAppliedSuccess
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidate, applyJob } = useCandidate();

  const completion = candidate?.profileCompletion ?? 0;
  const isProfileIncomplete = completion < 70;

  const [selectedResume, setSelectedResume] = useState(candidate?.resume?.fileName || 'Vyshnavi_Resume.pdf');
  const [coverLetter, setCoverLetter] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (candidate?.resume?.fileName) {
      setSelectedResume(candidate.resume.fileName);
    }
  }, [candidate]);

  if (!isOpen || !job) return null;

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedResume(file.name);
      toast({
        type: 'success',
        title: 'Resume Attached',
        message: `Attached "${file.name}" for this application.`,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-click duplicate requests
    if (isProfileIncomplete) {
      setValidationError(`Your profile is currently ${completion}% complete. Please complete at least 70% of your profile before applying for jobs.`);
      return;
    }
    if (!confirmed) {
      setValidationError('Please confirm that the information provided is correct.');
      return;
    }
    setValidationError('');
    setIsSubmitting(true);

    try {
      let createdBackendApp = null;
      if (authService.isAuthenticated()) {
        createdBackendApp = await candidateApplicationsService.createApplication({
          job_id: String(job.id),
          job_title: job.title || job.role,
          company_name: job.company || job.company_name,
          location: job.location,
          salary: job.salary,
          employment_type: job.type || job.employment_type,
          work_mode: job.mode || job.work_mode,
          cover_letter: coverLetter,
          additional_info: additionalInfo,
          resume_name: selectedResume,
          mela_id: job.melaId || null,
          mela_title: job.melaTitle || null,
        });
      }

      setIsSuccess(true);

      // Persist in Candidate Context
      applyJob(job, {
        appNumber: createdBackendApp?.appNumber || createdBackendApp?.application_id,
        coverLetter,
        additionalInfo,
        resumeName: selectedResume,
      });

      if (onAppliedSuccess) {
        onAppliedSuccess(job);
      }

      toast({
        type: 'success',
        title: 'Application Submitted!',
        message: `Your application for ${job.title} at ${job.company} was submitted successfully.`,
      });
    } catch (err) {
      const errMsg = err.message || 'Failed to submit application. Please try again.';
      setValidationError(errMsg);
      if (errMsg.toLowerCase().includes('already applied')) {
        toast({
          type: 'warning',
          title: 'Already Applied',
          message: 'You have already applied for this position.',
        });
      } else {
        toast({
          type: 'error',
          title: 'Application Failed',
          message: errMsg,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setCoverLetter('');
    setAdditionalInfo('');
    setConfirmed(false);
    setValidationError('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-2xl)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg)'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Apply
            </span>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
              Apply for {job.title}
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Building2 size={13} /> {job.company} • <MapPin size={13} /> {job.location}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--radius-md)'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 'var(--space-6)', overflowY: 'auto', flex: 1 }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--color-success-50)',
                color: 'var(--color-success-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                ✓ Application Submitted
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 420, margin: '0 auto var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
                Your application has been submitted successfully to <strong style={{ color: 'var(--color-text)' }}>{job.company}</strong>.
              </p>

              <div style={{
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                border: '1px solid var(--color-border)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Status:</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-primary-700)',
                    background: 'var(--color-primary-50)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    Applied
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Attached Resume:</span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)' }}>{selectedResume}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/candidate/applications" onClick={handleClose}>
                  <Button variant="primary" rightIcon={<ArrowRight size={15} />}>
                    Track in My Applications
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleClose}>
                  Browse More Jobs
                </Button>
              </div>
            </div>
          ) : isProfileIncomplete ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)'
              }}>
                <AlertCircle size={36} />
              </div>

              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                Complete your profile to apply
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: 440, margin: '0 auto var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
                Your profile is currently {completion}% complete. Please complete at least 70% of your profile before applying for jobs.
              </p>

              <div style={{
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                border: '1px solid var(--color-border)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    Profile Completion:
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706' }}>
                    {completion}% <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)' }}>/ 70% Required</span>
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(completion, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleClose();
                    navigate('/candidate/profile');
                  }}
                  rightIcon={<ArrowRight size={15} />}
                >
                  Complete Profile
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {/* Resume Selection */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  Resume <span style={{ color: 'var(--color-danger-500)' }}>*</span>
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-primary-50)',
                  border: '1px solid var(--color-primary-200)',
                  gap: 'var(--space-3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-primary-600)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedResume}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--color-primary-700)' }}>
                        Default Profile Resume • {candidate?.resume?.fileSize || '1.4 MB'}
                      </p>
                    </div>
                  </div>

                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-primary-600)',
                    cursor: 'pointer',
                    background: '#fff',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-primary-300)',
                    flexShrink: 0
                  }}>
                    <Upload size={12} /> Replace
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={handleResumeChange}
                    />
                  </label>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  Cover Letter (Optional)
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Briefly describe why you are a great fit for this position..."
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'inherit',
                    color: 'var(--color-text)',
                    background: 'var(--color-surface)',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Additional Information */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  Additional Information (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Notice period, expected CTC, preferred work location, portfolio links..."
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'inherit',
                    color: 'var(--color-text)',
                    background: 'var(--color-surface)',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Confirmation Checkbox */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => {
                      setConfirmed(e.target.checked);
                      if (e.target.checked) setValidationError('');
                    }}
                    style={{ marginTop: 2 }}
                  />
                  <span>
                    I confirm that the information provided is correct.
                  </span>
                </label>
                {validationError && (
                  <p style={{ fontSize: '11px', color: 'var(--color-danger-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {validationError}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-border)'
              }}>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  rightIcon={!isSubmitting && <ArrowRight size={14} />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
