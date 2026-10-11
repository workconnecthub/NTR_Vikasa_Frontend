import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Award, CheckCircle2, Clock, MapPin,
  Users, ArrowRight, Sparkles, Code2, Database, Landmark,
  Calculator, Cpu, Activity, Megaphone, Laptop, ShieldCheck,
  TrendingUp, Edit3, Save, RotateCcw, ExternalLink, X, Plus,
  Layers, Check
} from 'lucide-react';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useAdmin, DEFAULT_SKILL_PAGE_CONTENT } from '../../context/AdminContext';
import adminService from '../../services/adminService';

const AVAILABLE_ICONS = [
  'Award', 'BookOpen', 'TrendingUp', 'Users', 'Code2', 'Laptop',
  'ShieldCheck', 'Sparkles', 'Database', 'Landmark', 'Calculator',
  'Cpu', 'Activity', 'Megaphone', 'Clock', 'GraduationCap', 'CheckCircle2'
];

export default function AdminSkillContentPage() {
  const { addToast } = useToast();
  const { skillPageContent, updateSkillPageContent, resetSkillPageContent } = useAdmin();

  const currentContent = skillPageContent || DEFAULT_SKILL_PAGE_CONTENT;
  const hero = currentContent.hero || DEFAULT_SKILL_PAGE_CONTENT.hero;
  const highlights = currentContent.highlights?.length ? currentContent.highlights : DEFAULT_SKILL_PAGE_CONTENT.highlights;
  const empoweringSkills = currentContent.empoweringSkills || DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills;
  const trainingJourney = currentContent.trainingJourney || DEFAULT_SKILL_PAGE_CONTENT.trainingJourney;
  const programsWeOffer = currentContent.programsWeOffer || DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer;
  const whyChoose = currentContent.whyChoose || DEFAULT_SKILL_PAGE_CONTENT.whyChoose;

  // Modals state
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [highlightsModalOpen, setHighlightsModalOpen] = useState(false);
  const [empoweringModalOpen, setEmpoweringModalOpen] = useState(false);
  const [journeyModalOpen, setJourneyModalOpen] = useState(false);
  const [programsModalOpen, setProgramsModalOpen] = useState(false);
  const [whyChooseModalOpen, setWhyChooseModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Form states
  const [heroForm, setHeroForm] = useState({
    badge: hero.badge || '',
    heading: hero.heading || '',
    description: hero.description || '',
    exploreBtnText: hero.exploreBtnText || 'Explore Programs',
    viewCoursesBtnText: hero.viewCoursesBtnText || 'View Courses',
  });

  const [highlightsForm, setHighlightsForm] = useState(
    highlights.map(h => ({ ...h }))
  );

  const [empoweringForm, setEmpoweringForm] = useState({
    badge: empoweringSkills.badge || '',
    heading: empoweringSkills.heading || '',
    description: empoweringSkills.description || '',
    cards: (empoweringSkills.cards || []).map(c => ({ ...c })),
  });

  const [journeyForm, setJourneyForm] = useState({
    badge: trainingJourney.badge || '',
    heading: trainingJourney.heading || '',
    description: trainingJourney.description || '',
    steps: (trainingJourney.steps || []).map(s => ({ ...s })),
  });

  const [programsForm, setProgramsForm] = useState({
    badge: programsWeOffer.badge || '',
    heading: programsWeOffer.heading || '',
    description: programsWeOffer.description || '',
    categories: (programsWeOffer.categories || []).map(c => ({ ...c })),
  });

  const [whyChooseForm, setWhyChooseForm] = useState({
    badge: whyChoose.badge || '',
    heading: whyChoose.heading || '',
    description: whyChoose.description || '',
    cards: (whyChoose.cards || []).map(c => ({ ...c })),
  });

  const [saving, setSaving] = useState(false);

  // Icon renderer helper
  const renderIconPreview = (iconName, size = 18) => {
    switch (iconName) {
      case 'Award': return <Award size={size} />;
      case 'BookOpen': return <BookOpen size={size} />;
      case 'TrendingUp': return <TrendingUp size={size} />;
      case 'Users': return <Users size={size} />;
      case 'Code2': return <Code2 size={size} />;
      case 'Laptop': return <Laptop size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'Database': return <Database size={size} />;
      case 'Landmark': return <Landmark size={size} />;
      case 'Calculator': return <Calculator size={size} />;
      case 'Cpu': return <Cpu size={size} />;
      case 'Activity': return <Activity size={size} />;
      case 'Megaphone': return <Megaphone size={size} />;
      case 'Clock': return <Clock size={size} />;
      case 'GraduationCap': return <GraduationCap size={size} />;
      default: return <CheckCircle2 size={size} />;
    }
  };

  // 1. Save Hero
  const handleSaveHero = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSkillDevelopmentSection('skills_hero', heroForm);
      const saved = res.content || heroForm;
      updateSkillPageContent({ hero: saved });
      setHeroModalOpen(false);
      addToast('Skill Development Hero section updated successfully!', 'success');
    } catch (err) {
      console.error('Save skill hero failed:', err);
      addToast(err.message || 'Failed to update hero section', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 2. Save Highlights
  const handleSaveHighlights = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSkillDevelopmentSection('skills_highlights', { highlights: highlightsForm });
      const saved = res.content?.highlights || highlightsForm;
      updateSkillPageContent({ highlights: saved });
      setHighlightsModalOpen(false);
      addToast('Highlights strip updated successfully!', 'success');
    } catch (err) {
      console.error('Save skill highlights failed:', err);
      addToast(err.message || 'Failed to update highlights', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 3. Save Empowering Skills
  const handleSaveEmpowering = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSkillDevelopmentSection('skills_mission', empoweringForm);
      const saved = res.content || empoweringForm;
      updateSkillPageContent({ empoweringSkills: saved });
      setEmpoweringModalOpen(false);
      addToast('Empowering Skills section updated successfully!', 'success');
    } catch (err) {
      console.error('Save skill mission failed:', err);
      addToast(err.message || 'Failed to update mission section', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 4. Save Training Journey
  const handleSaveJourney = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSkillDevelopmentSection('skills_pathway', journeyForm);
      const saved = res.content || journeyForm;
      updateSkillPageContent({ trainingJourney: saved });
      setJourneyModalOpen(false);
      addToast('Training Journey section updated successfully!', 'success');
    } catch (err) {
      console.error('Save skill pathway failed:', err);
      addToast(err.message || 'Failed to update pathway section', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 5. Save Programs We Offer
  const handleSavePrograms = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSkillDevelopmentSection('skills_programs', programsForm);
      const saved = res.content || programsForm;
      updateSkillPageContent({ programsWeOffer: saved });
      setProgramsModalOpen(false);
      addToast('Programs We Offer section updated successfully!', 'success');
    } catch (err) {
      console.error('Save skill programs failed:', err);
      addToast(err.message || 'Failed to update programs section', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 6. Save Why Choose
  const handleSaveWhyChoose = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSkillDevelopmentSection('skills_advantages', whyChooseForm);
      const saved = res.content || whyChooseForm;
      updateSkillPageContent({ whyChoose: saved });
      setWhyChooseModalOpen(false);
      addToast('Why Choose section updated successfully!', 'success');
    } catch (err) {
      console.error('Save skill why choose failed:', err);
      addToast(err.message || 'Failed to update advantages section', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset All to Defaults
  const handleConfirmReset = async () => {
    try {
      await adminService.resetAllSkillDevelopmentContent();
    } catch (err) {
      console.warn('Backend reset all skills failed:', err);
    }
    resetSkillPageContent();
    setHeroForm({ ...DEFAULT_SKILL_PAGE_CONTENT.hero });
    setHighlightsForm(DEFAULT_SKILL_PAGE_CONTENT.highlights.map(h => ({ ...h })));
    setEmpoweringForm({
      ...DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills,
      cards: DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills.cards.map(c => ({ ...c }))
    });
    setJourneyForm({
      ...DEFAULT_SKILL_PAGE_CONTENT.trainingJourney,
      steps: DEFAULT_SKILL_PAGE_CONTENT.trainingJourney.steps.map(s => ({ ...s }))
    });
    setProgramsForm({
      ...DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer,
      categories: DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer.categories.map(c => ({ ...c }))
    });
    setWhyChooseForm({
      ...DEFAULT_SKILL_PAGE_CONTENT.whyChoose,
      cards: DEFAULT_SKILL_PAGE_CONTENT.whyChoose.cards.map(c => ({ ...c }))
    });
    setResetModalOpen(false);
    addToast('Skill Development content reset to default values.', 'info');
  };

  return (
    <div className="admin-skill-content-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-16)' }}>
      {/* ── Page Header Bar ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
              <GraduationCap size={20} style={{ color: 'var(--color-primary-600)' }} />
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>Skill Development Page Content</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Manage copy, highlights, feature cards, training pathway steps, and sector offerings for the public Skill Development portal.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href="/skill-development"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm" leftIcon={<ExternalLink size={14} />}>
                View Public Page
              </Button>
            </a>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={() => setResetModalOpen(true)}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>

      {/* ── Content Sections Grid (6 Main Sections) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>

        {/* 1. Hero Section Card */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-600)', background: 'var(--color-primary-50)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                Section 1
              </span>
              <Button size="xs" variant="primary" leftIcon={<Edit3 size={13} />} onClick={() => setHeroModalOpen(true)}>
                Edit Hero
              </Button>
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: '0 0 var(--space-2) 0', color: 'var(--color-text)' }}>
              Hero Section
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Main introduction banner with gradient theme, badge, primary heading, description, and action buttons.
            </p>

            <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Badge:</strong> {hero.badge}</p>
              <p style={{ margin: '0 0 4px 0' }}><strong>Heading:</strong> {hero.heading}</p>
              <p style={{ margin: '0 0 4px 0', color: 'var(--color-text-muted)' }}><strong>Buttons:</strong> "{hero.exploreBtnText}" • "{hero.viewCoursesBtnText}"</p>
            </div>
          </div>
        </div>

        {/* 2. Highlights Strip Card */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-success-700)', background: 'var(--color-success-50)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                Section 2
              </span>
              <Button size="xs" variant="primary" leftIcon={<Edit3 size={13} />} onClick={() => setHighlightsModalOpen(true)}>
                Edit Highlights
              </Button>
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: '0 0 var(--space-2) 0', color: 'var(--color-text)' }}>
              Highlights Strip
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              The 4 key trust pillars positioned directly underneath the hero banner.
            </p>

            <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-xs)' }}>
              {highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--color-primary-600)' }}>{renderIconPreview(h.icon, 14)}</span>
                  <span><strong>{h.title}:</strong> {h.subtitle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Empowering Skills Section Card */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-info-700)', background: 'var(--color-info-50)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                Section 3
              </span>
              <Button size="xs" variant="primary" leftIcon={<Edit3 size={13} />} onClick={() => setEmpoweringModalOpen(true)}>
                Edit Section
              </Button>
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: '0 0 var(--space-2) 0', color: 'var(--color-text)' }}>
              Empowering Skills Section
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Institutional mission narrative and the 3 core learning methodology feature cards.
            </p>

            <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Heading:</strong> {empoweringSkills.heading}</p>
              <p style={{ margin: '0 0 4px 0', color: 'var(--color-text-muted)' }}><strong>Cards:</strong> {(empoweringSkills.cards || []).map(c => c.title).join(' • ')}</p>
            </div>
          </div>
        </div>

        {/* 4. Training Journey Card */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-accent-700)', background: 'var(--color-accent-50)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                Section 4
              </span>
              <Button size="xs" variant="primary" leftIcon={<Edit3 size={13} />} onClick={() => setJourneyModalOpen(true)}>
                Edit Journey
              </Button>
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: '0 0 var(--space-2) 0', color: 'var(--color-text)' }}>
              From Training to Employment
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              The structured 6-step candidate journey from program enrollment to verified corporate placement.
            </p>

            <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Heading:</strong> {trainingJourney.heading}</p>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                <strong>6 Steps:</strong> {(trainingJourney.steps || []).map(s => `${s.step}. ${s.title}`).slice(0, 3).join(', ')}...
              </p>
            </div>
          </div>
        </div>

        {/* 5. Programs We Offer Card */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#7c3aed', background: '#f5f3ff', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                Section 5
              </span>
              <Button size="xs" variant="primary" leftIcon={<Edit3 size={13} />} onClick={() => setProgramsModalOpen(true)}>
                Edit Programs
              </Button>
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: '0 0 var(--space-2) 0', color: 'var(--color-text)' }}>
              Programs We Offer
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Sector domain cards (IT, Data & AI, Banking, Engineering, Healthcare, etc.) with dynamic course links.
            </p>

            <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Heading:</strong> {programsWeOffer.heading}</p>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                <strong>Domains:</strong> {(programsWeOffer.categories || []).length} Categories Configured
              </p>
            </div>
          </div>
        </div>

        {/* 6. Why Choose NTR Vikasa Card */}
        <div className="card" style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#047857', background: '#ecfdf5', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                Section 6
              </span>
              <Button size="xs" variant="primary" leftIcon={<Edit3 size={13} />} onClick={() => setWhyChooseModalOpen(true)}>
                Edit Why Choose
              </Button>
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: '0 0 var(--space-2) 0', color: 'var(--color-text)' }}>
              Why Choose NTR VIKASA
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Six outcome-focused competitive advantage cards highlighting placement support, practical labs, and mentorship.
            </p>

            <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-xs)' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Heading:</strong> {whyChoose.heading}</p>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                <strong>Cards:</strong> {(whyChoose.cards || []).length} Advantage Cards
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: HERO SECTION ── */}
      {heroModalOpen && (
        <Modal
          isOpen={heroModalOpen}
          onClose={() => setHeroModalOpen(false)}
          title="Edit Skill Development Hero Section"
          size="lg"
        >
          <form onSubmit={handleSaveHero} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FormField label="Hero Badge Text" required>
              <Input
                value={heroForm.badge}
                onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                placeholder="e.g. NTR VIKASA • Skill Development & Employment Generation"
                required
              />
            </FormField>

            <FormField label="Main Heading" required>
              <Input
                value={heroForm.heading}
                onChange={(e) => setHeroForm({ ...heroForm, heading: e.target.value })}
                placeholder="e.g. Skill Development & Training Programs"
                required
              />
            </FormField>

            <FormField label="Description Text" required>
              <Textarea
                rows={3}
                value={heroForm.description}
                onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                placeholder="e.g. Empowering job seekers with government-recognized training..."
                required
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <FormField label="Primary Button Text">
                <Input
                  value={heroForm.exploreBtnText}
                  onChange={(e) => setHeroForm({ ...heroForm, exploreBtnText: e.target.value })}
                  placeholder="e.g. Explore Programs"
                />
              </FormField>
              <FormField label="Secondary Button Text">
                <Input
                  value={heroForm.viewCoursesBtnText}
                  onChange={(e) => setHeroForm({ ...heroForm, viewCoursesBtnText: e.target.value })}
                  placeholder="e.g. View Courses"
                />
              </FormField>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button type="button" variant="outline" onClick={() => setHeroModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save size={14} />} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 2: HIGHLIGHTS STRIP ── */}
      {highlightsModalOpen && (
        <Modal
          isOpen={highlightsModalOpen}
          onClose={() => setHighlightsModalOpen(false)}
          title="Edit 4 Key Highlights"
          size="lg"
        >
          <form onSubmit={handleSaveHighlights} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              Edit the 4 key highlight items rendered in the horizontal strip below the Hero.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {highlightsForm.map((item, idx) => (
                <div key={idx} style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)' }}>Highlight #{idx + 1}</strong>
                    <div style={{ color: 'var(--color-primary-600)' }}>{renderIconPreview(item.icon, 18)}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <FormField label="Icon">
                      <Select
                        value={item.icon}
                        onChange={(e) => {
                          const updated = [...highlightsForm];
                          updated[idx].icon = e.target.value;
                          setHighlightsForm(updated);
                        }}
                      >
                        {AVAILABLE_ICONS.map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField label="Title" required>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...highlightsForm];
                          updated[idx].title = e.target.value;
                          setHighlightsForm(updated);
                        }}
                        placeholder="Title..."
                        required
                      />
                    </FormField>

                    <FormField label="Subtitle" required>
                      <Input
                        value={item.subtitle}
                        onChange={(e) => {
                          const updated = [...highlightsForm];
                          updated[idx].subtitle = e.target.value;
                          setHighlightsForm(updated);
                        }}
                        placeholder="Subtitle..."
                        required
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button type="button" variant="outline" onClick={() => setHighlightsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save size={14} />} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 3: EMPOWERING SKILLS SECTION ── */}
      {empoweringModalOpen && (
        <Modal
          isOpen={empoweringModalOpen}
          onClose={() => setEmpoweringModalOpen(false)}
          title="Edit Empowering Skills Section"
          size="lg"
        >
          <form onSubmit={handleSaveEmpowering} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
              <FormField label="Section Badge" required>
                <Input
                  value={empoweringForm.badge}
                  onChange={(e) => setEmpoweringForm({ ...empoweringForm, badge: e.target.value })}
                  placeholder="e.g. Institutional Mission"
                  required
                />
              </FormField>
              <FormField label="Section Heading" required>
                <Input
                  value={empoweringForm.heading}
                  onChange={(e) => setEmpoweringForm({ ...empoweringForm, heading: e.target.value })}
                  placeholder="e.g. Empowering Skills. Enabling Careers."
                  required
                />
              </FormField>
            </div>

            <FormField label="Section Description" required>
              <Textarea
                rows={2}
                value={empoweringForm.description}
                onChange={(e) => setEmpoweringForm({ ...empoweringForm, description: e.target.value })}
                placeholder="Section overview description..."
                required
              />
            </FormField>

            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0 0' }}>
              Feature Cards (3 Cards)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {empoweringForm.cards.map((card, idx) => (
                <div key={idx} style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <div style={{ width: 140 }}>
                      <Select
                        value={card.icon}
                        onChange={(e) => {
                          const updated = [...empoweringForm.cards];
                          updated[idx].icon = e.target.value;
                          setEmpoweringForm({ ...empoweringForm, cards: updated });
                        }}
                      >
                        {AVAILABLE_ICONS.map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </Select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Input
                        value={card.title}
                        onChange={(e) => {
                          const updated = [...empoweringForm.cards];
                          updated[idx].title = e.target.value;
                          setEmpoweringForm({ ...empoweringForm, cards: updated });
                        }}
                        placeholder="Card Title..."
                        required
                      />
                    </div>
                  </div>
                  <Textarea
                    rows={2}
                    value={card.desc}
                    onChange={(e) => {
                      const updated = [...empoweringForm.cards];
                      updated[idx].desc = e.target.value;
                      setEmpoweringForm({ ...empoweringForm, cards: updated });
                    }}
                    placeholder="Card description text..."
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button type="button" variant="outline" onClick={() => setEmpoweringModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save size={14} />} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 4: TRAINING JOURNEY SECTION ── */}
      {journeyModalOpen && (
        <Modal
          isOpen={journeyModalOpen}
          onClose={() => setJourneyModalOpen(false)}
          title="Edit From Training to Employment (6 Steps)"
          size="lg"
        >
          <form onSubmit={handleSaveJourney} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
              <FormField label="Section Badge" required>
                <Input
                  value={journeyForm.badge}
                  onChange={(e) => setJourneyForm({ ...journeyForm, badge: e.target.value })}
                  placeholder="e.g. Candidate Pathway"
                  required
                />
              </FormField>
              <FormField label="Section Heading" required>
                <Input
                  value={journeyForm.heading}
                  onChange={(e) => setJourneyForm({ ...journeyForm, heading: e.target.value })}
                  placeholder="e.g. From Training to Employment"
                  required
                />
              </FormField>
            </div>

            <FormField label="Section Description" required>
              <Textarea
                rows={2}
                value={journeyForm.description}
                onChange={(e) => setJourneyForm({ ...journeyForm, description: e.target.value })}
                placeholder="Section overview description..."
                required
              />
            </FormField>

            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0 0' }}>
              Journey Steps (6 Steps)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
              {journeyForm.steps.map((step, idx) => (
                <div key={idx} style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <div style={{ width: 60 }}>
                      <Input
                        value={step.step}
                        onChange={(e) => {
                          const updated = [...journeyForm.steps];
                          updated[idx].step = e.target.value;
                          setJourneyForm({ ...journeyForm, steps: updated });
                        }}
                        placeholder="01"
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Input
                        value={step.title}
                        onChange={(e) => {
                          const updated = [...journeyForm.steps];
                          updated[idx].title = e.target.value;
                          setJourneyForm({ ...journeyForm, steps: updated });
                        }}
                        placeholder="Step Title..."
                        required
                      />
                    </div>
                  </div>
                  <Textarea
                    rows={2}
                    value={step.desc}
                    onChange={(e) => {
                      const updated = [...journeyForm.steps];
                      updated[idx].desc = e.target.value;
                      setJourneyForm({ ...journeyForm, steps: updated });
                    }}
                    placeholder="Step details..."
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button type="button" variant="outline" onClick={() => setJourneyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save size={14} />} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 5: PROGRAMS WE OFFER SECTION ── */}
      {programsModalOpen && (
        <Modal
          isOpen={programsModalOpen}
          onClose={() => setProgramsModalOpen(false)}
          title="Edit Programs We Offer (Sector Domains)"
          size="lg"
        >
          <form onSubmit={handleSavePrograms} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
              <FormField label="Section Badge" required>
                <Input
                  value={programsForm.badge}
                  onChange={(e) => setProgramsForm({ ...programsForm, badge: e.target.value })}
                  placeholder="e.g. Sector Domains"
                  required
                />
              </FormField>
              <FormField label="Section Heading" required>
                <Input
                  value={programsForm.heading}
                  onChange={(e) => setProgramsForm({ ...programsForm, heading: e.target.value })}
                  placeholder="e.g. Programs We Offer"
                  required
                />
              </FormField>
            </div>

            <FormField label="Section Description" required>
              <Textarea
                rows={2}
                value={programsForm.description}
                onChange={(e) => setProgramsForm({ ...programsForm, description: e.target.value })}
                placeholder="Section overview description..."
                required
              />
            </FormField>

            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0 0' }}>
              Domain Categories
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
              {programsForm.categories.map((cat, idx) => (
                <div key={cat.id || idx} style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <div style={{ width: 120 }}>
                      <Select
                        value={cat.icon}
                        onChange={(e) => {
                          const updated = [...programsForm.categories];
                          updated[idx].icon = e.target.value;
                          setProgramsForm({ ...programsForm, categories: updated });
                        }}
                      >
                        {AVAILABLE_ICONS.map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </Select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Input
                        value={cat.name}
                        onChange={(e) => {
                          const updated = [...programsForm.categories];
                          updated[idx].name = e.target.value;
                          setProgramsForm({ ...programsForm, categories: updated });
                        }}
                        placeholder="Category Name..."
                        required
                      />
                    </div>
                  </div>
                  <Textarea
                    rows={2}
                    value={cat.desc}
                    onChange={(e) => {
                      const updated = [...programsForm.categories];
                      updated[idx].desc = e.target.value;
                      setProgramsForm({ ...programsForm, categories: updated });
                    }}
                    placeholder="Domain description..."
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button type="button" variant="outline" onClick={() => setProgramsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save size={14} />} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 6: WHY CHOOSE SECTION ── */}
      {whyChooseModalOpen && (
        <Modal
          isOpen={whyChooseModalOpen}
          onClose={() => setWhyChooseModalOpen(false)}
          title="Edit Why Choose NTR VIKASA Section"
          size="lg"
        >
          <form onSubmit={handleSaveWhyChoose} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
              <FormField label="Section Badge" required>
                <Input
                  value={whyChooseForm.badge}
                  onChange={(e) => setWhyChooseForm({ ...whyChooseForm, badge: e.target.value })}
                  placeholder="e.g. Institutional Excellence"
                  required
                />
              </FormField>
              <FormField label="Section Heading" required>
                <Input
                  value={whyChooseForm.heading}
                  onChange={(e) => setWhyChooseForm({ ...whyChooseForm, heading: e.target.value })}
                  placeholder="e.g. Why Choose NTR VIKASA"
                  required
                />
              </FormField>
            </div>

            <FormField label="Section Description" required>
              <Textarea
                rows={2}
                value={whyChooseForm.description}
                onChange={(e) => setWhyChooseForm({ ...whyChooseForm, description: e.target.value })}
                placeholder="Section overview description..."
                required
              />
            </FormField>

            <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0 0' }}>
              Advantage Feature Cards (6 Cards)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
              {whyChooseForm.cards.map((card, idx) => (
                <div key={idx} style={{ background: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <div style={{ width: 120 }}>
                      <Select
                        value={card.icon}
                        onChange={(e) => {
                          const updated = [...whyChooseForm.cards];
                          updated[idx].icon = e.target.value;
                          setWhyChooseForm({ ...whyChooseForm, cards: updated });
                        }}
                      >
                        {AVAILABLE_ICONS.map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </Select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Input
                        value={card.title}
                        onChange={(e) => {
                          const updated = [...whyChooseForm.cards];
                          updated[idx].title = e.target.value;
                          setWhyChooseForm({ ...whyChooseForm, cards: updated });
                        }}
                        placeholder="Card Title..."
                        required
                      />
                    </div>
                  </div>
                  <Textarea
                    rows={2}
                    value={card.desc}
                    onChange={(e) => {
                      const updated = [...whyChooseForm.cards];
                      updated[idx].desc = e.target.value;
                      setWhyChooseForm({ ...whyChooseForm, cards: updated });
                    }}
                    placeholder="Card description..."
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button type="button" variant="outline" onClick={() => setWhyChooseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save size={14} />} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 7: RESET TO DEFAULTS CONFIRMATION ── */}
      {resetModalOpen && (
        <Modal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title="Reset Skill Development Content to Defaults"
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', margin: 0 }}>
              Are you sure you want to reset all Skill Development & Training page content across all 6 sections back to default seed copy?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <Button variant="outline" onClick={() => setResetModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" leftIcon={<RotateCcw size={14} />} onClick={handleConfirmReset}>
                Reset to Defaults
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
