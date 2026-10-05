import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase, Building2, MapPin, DollarSign, Calendar,
  CheckCircle2, ArrowRight, Save, Send, Plus, X, AlertCircle, Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useRecruiter } from '../../context/RecruiterContext';
import { useToast } from '../../context/ToastContext';
import recruiterJobService from '../../services/recruiterJobService';

export default function RecruiterCreateJobPage() {
  const navigate = useNavigate();
  const { recruiter, createJob } = useRecruiter();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    openings: '2',
    deadline: '2026-10-30',
    location: 'Bengaluru, Karnataka',
    experience: '3-5 years',
    salary: '₹16,00,000 - ₹24,00,000 / year',
    description: 'We are seeking an exceptional engineer to design and scale next-generation applications.',
    responsibilities: '• Architect and implement robust, scalable user features.\n• Collaborate with cross-functional product and engineering teams.\n• Write automated unit, integration, and end-to-end tests.\n• Participate in technical design discussions and mentor junior teammates.',
    requirements: '• 3+ years of professional software development experience.\n• Deep proficiency in modern web architecture, state management, and cloud APIs.\n• Strong problem solving and system design aptitude.',
    qualifications: "Bachelor's or Master's degree in Computer Science, IT, or equivalent experience.",
    skills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  });

  const [newSkillInput, setNewSkillInput] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !formData.skills.includes(newSkillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkillInput.trim()] });
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      addToast('Please enter a job title before saving draft.', 'error');
      return;
    }
    setLoading(true);
    try {
      await recruiterJobService.saveJobDraft(formData);
      addToast(`Job "${formData.title}" saved as Draft.`, 'info');
      navigate('/recruiter/jobs');
    } catch (err) {
      addToast(err.message || 'Failed to save job draft.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      addToast('Please fill in all required job fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      await recruiterJobService.createJob(formData);
      addToast(`Job posting "${formData.title}" submitted for Admin review. Status: PENDING.`, 'success');
      navigate('/recruiter/jobs');
    } catch (err) {
      addToast(err.message || 'Failed to submit job for approval.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recruiter-create-job-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>

      {/* Header Bar */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <Briefcase size={20} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Post New Job Opening</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
              Publishing for: <strong>{recruiter?.company?.name || 'ABC Technologies'}</strong>. New requisitions are reviewed by Admin for quality compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Job Form */}
      <form onSubmit={handleSubmitForApproval} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Section 1: Basic Job Info */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-2xl)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-gray-900)' }}>
            1. Role & Basic Requisition Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <FormField label="Job Title *" required>
              <Input
                type="text"
                placeholder="e.g. Senior Frontend Engineer (React / TypeScript)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Department / Functional Area *" required>
              <Select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Core Engineering">Core Engineering</option>
                <option value="Platform Core">Platform Core</option>
                <option value="Infra & SecOps">Infra & SecOps</option>
                <option value="AI Innovation Lab">AI Innovation Lab</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Human Resources">Human Resources</option>
              </Select>
            </FormField>

            <FormField label="Employment Type *" required>
              <Select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </Select>
            </FormField>

            <FormField label="Workplace Policy *" required>
              <Select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
              >
                <option value="Hybrid">Hybrid (2-3 days office)</option>
                <option value="Remote">100% Remote</option>
                <option value="On-site">On-site (Office based)</option>
              </Select>
            </FormField>

            <FormField label="Location / Base Office *" required>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bengaluru, Karnataka"
                required
              />
            </FormField>

            <FormField label="Experience Level *" required>
              <Select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              >
                <option value="0-1 years (Entry / Fresher)">0-1 years (Entry / Fresher)</option>
                <option value="1-3 years (Junior)">1-3 years (Junior)</option>
                <option value="3-5 years (Mid-Level)">3-5 years (Mid-Level)</option>
                <option value="5-8 years (Senior)">5-8 years (Senior)</option>
                <option value="8+ years (Lead / Staff)">8+ years (Lead / Staff)</option>
              </Select>
            </FormField>

            <FormField label="Salary / CTC Range *" required>
              <Input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g. ₹16,00,000 - ₹24,00,000 / year"
                required
              />
            </FormField>

            <FormField label="Number of Openings">
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
              />
            </FormField>

            <FormField label="Application Deadline *" required>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Description & Requirements */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-2xl)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-gray-900)' }}>
            2. Detailed Job Description & Requirements
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <FormField label="Job Summary / Overview *" required>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of the role, the team mission, and impact..."
                required
              />
            </FormField>

            <FormField label="Key Responsibilities">
              <Textarea
                rows={4}
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                placeholder="List main daily duties and core deliverables..."
              />
            </FormField>

            <FormField label="Technical Requirements & Skills">
              <Textarea
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List technical stack, architecture experience, and competencies..."
              />
            </FormField>

            <FormField label="Educational Qualifications">
              <Input
                type="text"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder="e.g. Bachelor's in CS / IT or relevant practical experience"
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Required Skills Tagging */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-2xl)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-gray-900)' }}>
            3. Required Skills & Candidate Matching Tags
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', marginBottom: '1rem' }}>
            These tags power the Candidate Match Score algorithm for applicant scoring.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Input
              type="text"
              placeholder="Type skill and press Add (e.g. Docker, GraphQL, Kubernetes)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleAddSkill(e); } }}
              style={{ maxWidth: '400px' }}
            />
            <Button variant="secondary" type="button" icon={<Plus size={16} />} onClick={handleAddSkill}>
              Add Skill
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {formData.skills.map((skill) => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-800)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: '1px solid var(--color-primary-200)'
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-primary-600)', display: 'flex' }}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <Button variant="outline" type="button" onClick={() => navigate('/recruiter/jobs')}>
            Cancel
          </Button>
          <Button variant="secondary" type="button" icon={<Save size={16} />} onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button variant="primary" type="submit" icon={<Send size={16} />} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Admin Approval'}
          </Button>
        </div>
      </form>
    </div>
  );
}
