import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Award, CheckCircle2, Clock, MapPin,
  Users, ArrowRight, Sparkles, Code2, Database, Landmark,
  Calculator, Cpu, Activity, Megaphone, Laptop, ShieldCheck,
  TrendingUp, ArrowUpRight, HelpCircle, ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import CardCarousel from '../../components/ui/CardCarousel';
import {
  SKILL_CATEGORIES,
  SKILL_PROGRAMS,
  SKILL_TESTIMONIALS,
  HOW_IT_WORKS_STEPS,
  WHY_CHOOSE_SKILL_PORTAL
} from '../../data/skillData';
import { useAdmin, DEFAULT_SKILL_PAGE_CONTENT } from '../../context/AdminContext';
import publicService from '../../services/publicService';

export default function SkillDevelopmentOverviewPage() {
  const navigate = useNavigate();
  const { skillPageContent } = useAdmin();
  const [liveContent, setLiveContent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    publicService.getPublishedSkillDevelopmentContent().then(res => {
      if (isMounted && res) {
        setLiveContent(res);
      }
    }).catch(err => {
      console.warn('Failed to load published skill content from API:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const currentContent = liveContent || skillPageContent || DEFAULT_SKILL_PAGE_CONTENT;
  const hero = currentContent.hero || currentContent.skills_hero || DEFAULT_SKILL_PAGE_CONTENT.hero;
  const highlights = (currentContent.highlights && currentContent.highlights.length)
    ? currentContent.highlights
    : (currentContent.skills_highlights?.highlights || DEFAULT_SKILL_PAGE_CONTENT.highlights);
  const empoweringSkills = currentContent.empoweringSkills || currentContent.skills_mission || DEFAULT_SKILL_PAGE_CONTENT.empoweringSkills;
  const trainingJourney = currentContent.trainingJourney || currentContent.skills_pathway || DEFAULT_SKILL_PAGE_CONTENT.trainingJourney;
  const programsWeOffer = currentContent.programsWeOffer || currentContent.skills_programs || DEFAULT_SKILL_PAGE_CONTENT.programsWeOffer;
  const whyChoose = currentContent.whyChoose || currentContent.skills_advantages || DEFAULT_SKILL_PAGE_CONTENT.whyChoose;

  // Helper for dynamic category and feature icons
  const renderSkillIcon = (iconName, size = 24) => {
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

  const scrollToPrograms = () => {
    const el = document.getElementById('programs-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="skill-overview-page" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'var(--space-20)' }}>
      {/* ── 1. Modern Premium Hero Section ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)',
        color: '#ffffff',
        padding: 'var(--space-20) var(--space-6)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Ambient Decorations */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 440, height: 440,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(30px)'
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -80, width: 380, height: 380,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,70,239,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(30px)'
        }} />

        <div className="container" style={{ maxWidth: 940, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 18px',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            marginBottom: 'var(--space-5)',
            color: '#e0e7ff',
            letterSpacing: '0.02em'
          }}>
            <Sparkles size={14} style={{ color: '#fbbf24' }} />
            {hero.badge || 'NTR VIKASA • Skill Development & Employment Generation'}
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 'var(--space-5)',
            letterSpacing: '-0.02em',
            color: '#ffffff'
          }}>
            {hero.heading || 'Skill Development & Training Programs'}
          </h1>

          <p style={{
            fontSize: 'var(--text-lg)',
            color: '#cbd5e1',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: 760,
            margin: '0 auto var(--space-8)'
          }}>
            {hero.description || 'Empowering job seekers with government-recognized, industry-aligned training, practical learning, and placement support.'}
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToPrograms}
              rightIcon={<ArrowRight size={18} />}
              style={{ padding: '12px 28px', fontWeight: 700 }}
            >
              {hero.exploreBtnText || 'Explore Programs'}
            </Button>
            <Link to="/skill-development/courses">
              <Button
                variant="outline"
                size="lg"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff', padding: '12px 28px', fontWeight: 600 }}
              >
                {hero.viewCoursesBtnText || 'View Courses'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Trust / Key Benefits Horizontal Strip ── */}
      <section style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-6) 0'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {highlights.map((hl, idx) => {
              const bgColors = ['var(--color-primary-50)', 'var(--color-success-50)', 'var(--color-info-50)', 'var(--color-accent-50)'];
              const textColors = ['var(--color-primary-600)', 'var(--color-success-600)', 'var(--color-info-600)', 'var(--color-accent-600)'];
              const bg = bgColors[idx % bgColors.length];
              const clr = textColors[idx % textColors.length];
              return (
                <div key={hl.id || hl.title || idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-xl)',
                    background: bg, color: clr,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {renderSkillIcon(hl.icon, 24)}
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)' }}>{hl.title}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{hl.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. About Skill Development Section ("Empowering Skills") ── */}
      <section className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-3xl)',
          padding: 'var(--space-12) var(--space-8)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
              <ShieldCheck size={14} style={{ marginRight: 6 }} /> {empoweringSkills.badge || 'Institutional Mission'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              {empoweringSkills.heading || 'Empowering Skills. Enabling Careers.'}
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
              {empoweringSkills.description || 'The NTR VIKASA Skill Development initiative bridges the critical divide between academic qualifications and industry hiring standards. By partnering with state government bodies, national sector skill councils, and corporate employers, we deliver employment-focused, hands-on training to youth across Andhra Pradesh.'}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {(empoweringSkills.cards || []).map((card, idx) => {
              const bgColors = ['var(--color-primary-100)', 'var(--color-success-100)', 'var(--color-accent-100)'];
              const textColors = ['var(--color-primary-700)', 'var(--color-success-700)', 'var(--color-accent-700)'];
              const bg = bgColors[idx % bgColors.length];
              const clr = textColors[idx % textColors.length];
              return (
                <div key={card.id || card.title || idx} style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: 'var(--space-6)'
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                    background: bg, color: clr,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)'
                  }}>
                    {renderSkillIcon(card.icon, 22)}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Program Categories ("Programs We Offer") ── */}
      <section className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto var(--space-10)' }}>
          <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
            <BookOpen size={14} style={{ marginRight: 6 }} /> {programsWeOffer.badge || 'Sector Domains'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
            {programsWeOffer.heading || 'Programs We Offer'}
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            {programsWeOffer.description || 'Specialized training pathways spanning modern tech, finance, core engineering, and administrative sectors.'}
          </p>
        </div>

        <CardCarousel
          items={programsWeOffer.categories || SKILL_CATEGORIES}
          desktopItems={4}
          tabletItems={2}
          mobileItems={1}
          gap={20}
          renderItem={(cat) => (
            <div
              key={cat.id}
              className="card card-hoverable"
              style={{
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
                height: '100%',
                transition: 'all var(--transition-base)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-xl)',
                    background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {renderSkillIcon(cat.icon, 24)}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-primary-700)',
                    background: 'var(--color-primary-50)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {cat.count}
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-5)' }}>
                  {cat.desc}
                </p>
              </div>

              <Link
                to={`/skill-development/courses?sector=${encodeURIComponent(cat.name)}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--color-primary-600)',
                  textDecoration: 'none'
                }}
              >
                Explore Courses <ChevronRight size={14} />
              </Link>
            </div>
          )}
        />
      </section>

      {/* ── 5. Featured Programs Section ── */}
      <section id="programs-section" className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto var(--space-10)' }}>
          <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
            <Sparkles size={14} style={{ marginRight: 6 }} /> Flagship Curriculum
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
            Featured Programs
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Government-sponsored, high-impact training programs with dedicated placement fast-tracks.
          </p>
        </div>

        <CardCarousel
          items={SKILL_PROGRAMS}
          desktopItems={4}
          tabletItems={2}
          mobileItems={1}
          gap={20}
          renderItem={(program) => (
            <div
              key={program.id}
              className="card card-hoverable"
              style={{
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
                height: '100%'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <Badge variant="primary">{program.sector}</Badge>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-success-700)',
                    fontWeight: 700,
                    background: 'var(--color-success-50)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {program.seats} Seats / Free
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 'var(--space-2)' }}>
                  {program.title}
                </h3>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                  {program.description}
                </p>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-4)',
                  borderTop: '1px solid var(--color-gray-100)',
                  paddingTop: 'var(--space-3)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    <strong>Duration:</strong> {program.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Laptop size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    <strong>Mode:</strong> {program.mode}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    <strong>Location:</strong> {program.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <GraduationCap size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    <strong>Eligibility:</strong> {program.eligibility}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
                  {program.skills.map((skill) => (
                    <span key={skill} style={{
                      fontSize: '10px',
                      background: 'var(--color-gray-100)',
                      color: 'var(--color-text)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--color-gray-100)',
                paddingTop: 'var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', fontWeight: 700 }}>
                  {program.certification}
                </span>
                <Link to="/skill-development/courses">
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight size={14} />}>
                    View Details & Apply
                  </Button>
                </Link>
              </div>
            </div>
          )}
        />
      </section>

      {/* ── 6. How It Works Section ("From Training to Employment") ── */}
      <section className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto var(--space-10)' }}>
          <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
            <TrendingUp size={14} style={{ marginRight: 6 }} /> {trainingJourney.badge || 'Candidate Pathway'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
            {trainingJourney.heading || 'From Training to Employment'}
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            {trainingJourney.description || 'A structured 6-step journey designed to take you from foundational training to confirmed corporate placement.'}
          </p>
        </div>

        <CardCarousel
          items={trainingJourney.steps || HOW_IT_WORKS_STEPS}
          desktopItems={4}
          tabletItems={2}
          mobileItems={1}
          gap={20}
          renderItem={(item) => (
            <div
              key={item.step}
              className="card"
              style={{
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-6)',
                position: 'relative',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}
            >
              <div style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 900,
                color: 'var(--color-primary-600)',
                background: 'var(--color-primary-50)',
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)',
                flexShrink: 0
              }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                {item.desc}
              </p>
            </div>
          )}
        />
      </section>

      {/* ── 7. Why Choose NTR VIKASA Section ── */}
      <section className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-3xl)',
          padding: 'var(--space-12) var(--space-8)'
        }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto var(--space-10)' }}>
            <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
              <Award size={14} style={{ marginRight: 6 }} /> {whyChoose.badge || 'Institutional Excellence'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
              {whyChoose.heading || 'Why Choose NTR VIKASA'}
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
              {whyChoose.description || 'Outcome-focused advantages designed to give candidates a real competitive edge in modern job markets.'}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {(whyChoose.cards || []).map((item, idx) => (
              <div
                key={item.title || idx}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: 'var(--space-6)'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)'
                }}>
                  {renderSkillIcon(item.icon, 22)}
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Success Stories / Testimonials Section ── */}
      <section className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto var(--space-10)' }}>
          <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
            <Users size={14} style={{ marginRight: 6 }} /> Alumni Impact
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
            Success Stories
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Real outcomes from students who completed NTR VIKASA skill programs and successfully launched their careers.
          </p>
        </div>

        <CardCarousel
          items={SKILL_TESTIMONIALS}
          desktopItems={4}
          tabletItems={2}
          mobileItems={1}
          gap={20}
          renderItem={(t) => (
            <div
              key={t.name}
              className="card"
              style={{
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                width: '100%',
                height: '100%'
              }}
            >
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', lineHeight: 'var(--leading-relaxed)', fontStyle: 'italic', marginBottom: 'var(--space-6)' }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
                  color: '#ffffff', fontWeight: 800, fontSize: 'var(--text-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {t.initials}
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.2 }}>
                    {t.name}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                    {t.outcome}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                    {t.location}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </section>

      {/* ── 9. Final Call to Action (CTA) ── */}
      <section className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 'var(--radius-3xl)',
          padding: 'var(--space-12) var(--space-8)',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: 'var(--space-3)', color: '#ffffff' }}>
              Ready to Upgrade Your Skills?
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: 'var(--text-base)', maxWidth: 640, margin: '0 auto var(--space-8)' }}>
              Explore our skill development programs and find the right learning path for your career.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/skill-development/courses">
                <Button
                  variant="primary"
                  size="lg"
                  style={{ background: '#ffffff', color: '#1e1b4b', fontWeight: 800, padding: '12px 28px' }}
                >
                  Explore Courses
                </Button>
              </Link>
              <Link to="/skill-development/courses">
                <Button
                  variant="outline"
                  size="lg"
                  style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff', fontWeight: 600, padding: '12px 28px' }}
                >
                  Apply / Enroll
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
