import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, Building2, TrendingUp, ShieldCheck,
  Target, Sparkles, Award, Heart, ArrowRight, CheckCircle2,
  MessageSquare, ExternalLink, X, Quote
} from 'lucide-react';
import Button from '../../components/ui/Button';
import CardCarousel from '../../components/ui/CardCarousel';
import { Modal } from '../../components/ui/Modal';
import { MOCK_STATS, WHY_CHOOSE_US } from '../../data/mockData';
import { useAdmin, DEFAULT_ABOUT_CONTENT } from '../../context/AdminContext';
import publicService from '../../services/publicService';

export default function AboutPage() {
  const { aboutContent } = useAdmin();
  const [publishedContent, setPublishedContent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    publicService.getPublishedAboutUsContent().then((res) => {
      if (isMounted && res) {
        setPublishedContent(res);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const currentContent = publishedContent || aboutContent || DEFAULT_ABOUT_CONTENT;
  const hero = currentContent.hero || DEFAULT_ABOUT_CONTENT.hero;
  const stats = currentContent.stats || DEFAULT_ABOUT_CONTENT.stats;
  const whatWeStandFor = currentContent.whatWeStandFor || DEFAULT_ABOUT_CONTENT.whatWeStandFor;
  const team = currentContent.team || DEFAULT_ABOUT_CONTENT.team;
  const leadershipMessages = currentContent.leadershipMessages || DEFAULT_ABOUT_CONTENT.leadershipMessages;
  const partners = currentContent.partners || DEFAULT_ABOUT_CONTENT.partners;

  const teamMembers = team.members?.length ? team.members : DEFAULT_ABOUT_CONTENT.team.members;
  const leaders = leadershipMessages.messages?.length ? leadershipMessages.messages : DEFAULT_ABOUT_CONTENT.leadershipMessages.messages;
  const partnerList = (partners.list?.length ? partners.list : DEFAULT_ABOUT_CONTENT.partners.list).filter(p => p.active !== false);

  // Modal for Viewing Full Leadership Message
  const [selectedLeader, setSelectedLeader] = useState(null);

  // Icon helper for Core Values / What We Stand For
  const renderValueIcon = (iconName, size = 26) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Target': return <Target size={size} />;
      case 'Users': return <Users size={size} />;
      case 'Award': return <Award size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'TrendingUp': return <TrendingUp size={size} />;
      case 'Building2': return <Building2 size={size} />;
      case 'Briefcase': return <Briefcase size={size} />;
      default: return <CheckCircle2 size={size} />;
    }
  };

  // Helper for brand partner styling
  const renderPartnerLogo = (partner) => {
    if (partner.logo) {
      return (
        <img
          src={partner.logo}
          alt={partner.name}
          style={{ maxHeight: 36, maxWidth: 120, objectFit: 'contain' }}
        />
      );
    }

    const name = partner.logoText || partner.name;

    // Customized authentic stylings matching training partner brand identities
    if (name.toLowerCase().includes('hyundai')) {
      return (
        <span style={{ fontFamily: 'sans-serif', fontWeight: 900, letterSpacing: '0.05em', color: '#002c5f', fontSize: '15px' }}>
          HYUNDAI <span style={{ color: '#002c5f', fontWeight: 800 }}>M<span style={{ color: '#e31837' }}>O</span>BIS</span>
        </span>
      );
    }
    if (name.toLowerCase().includes('isuzu')) {
      return (
        <span style={{ fontFamily: 'sans-serif', fontWeight: 900, letterSpacing: '0.08em', color: '#e60012', fontSize: '20px' }}>
          ISUZU
        </span>
      );
    }
    if (name.toLowerCase().includes('medplus')) {
      return (
        <span style={{
          background: '#d9251d',
          color: '#ffffff',
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2
        }}>
          MedPlus<span style={{ color: '#22c55e', fontSize: '16px' }}>+</span>
        </span>
      );
    }
    if (name.toLowerCase().includes('apollo')) {
      return (
        <span style={{ color: '#006272', fontWeight: 800, fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#f58220', fontWeight: 900 }}>✦</span> Apollo <span style={{ fontSize: '11px', color: '#006272', fontWeight: 600 }}>Pharmacy</span>
        </span>
      );
    }
    if (name.toLowerCase().includes('indigo')) {
      return (
        <span style={{ fontFamily: 'sans-serif', fontWeight: 800, color: '#001b94', fontSize: '20px', letterSpacing: '-0.02em' }}>
          IndiGo
        </span>
      );
    }
    if (name.toLowerCase().includes('inzi')) {
      return (
        <span style={{ background: '#000000', color: '#ffd200', fontWeight: 900, padding: '3px 8px', borderRadius: '3px', fontSize: '13px', letterSpacing: '0.06em' }}>
          INZI <span style={{ color: '#ffffff', fontSize: '9px', fontWeight: 700 }}>CONTROLS</span>
        </span>
      );
    }
    if (name.toLowerCase().includes('dixon')) {
      return (
        <span style={{ color: '#003366', fontWeight: 900, fontSize: '17px', letterSpacing: '0.02em' }}>
          Dixon<span style={{ color: '#d97706', fontSize: '14px' }}>®</span>
        </span>
      );
    }
    if (name.toLowerCase().includes('cogent')) {
      return (
        <span style={{ color: '#334155', fontWeight: 800, fontSize: '16px', letterSpacing: '0.05em' }}>
          COGENT
        </span>
      );
    }
    if (name.toLowerCase().includes('indus')) {
      return (
        <span style={{ background: 'linear-gradient(135deg, #1e3a8a, #0284c7)', color: '#ffffff', fontWeight: 800, padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '13px' }}>
          Indus
        </span>
      );
    }
    if (name.toLowerCase().includes('niit')) {
      return (
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 900, color: '#0f2b5c', fontSize: '22px', letterSpacing: '0.04em' }}>
          NIIT
        </span>
      );
    }
    if (name.toLowerCase().includes('ison')) {
      return (
        <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>
          i<span style={{ color: '#2563eb' }}>SON</span>
        </span>
      );
    }
    if (name.toLowerCase().includes('deccan')) {
      return (
        <span style={{ color: '#15803d', fontWeight: 800, fontSize: '15px' }}>
          deccan<span style={{ color: '#eab308' }}>✦</span>
        </span>
      );
    }
    if (name.toLowerCase().includes('icici')) {
      return (
        <span style={{ color: '#991b1b', fontWeight: 800, fontStyle: 'italic', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#ea580c', fontStyle: 'normal' }}>ⓘ</span> ICICI Bank
        </span>
      );
    }

    return (
      <span style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: '14px' }}>
        {name}
      </span>
    );
  };

  return (
    <div className="about-page" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'var(--space-20)' }}>
      {/* ── Hero Section ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: '#ffffff',
        padding: 'var(--space-20) var(--space-6)',
        textAlign: 'center',
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

        <div className="container" style={{ maxWidth: 840, position: 'relative', zIndex: 1 }}>
          <div className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.15)', color: '#c7d2fe', marginBottom: 'var(--space-4)' }}>
            <Sparkles size={12} style={{ marginRight: 4 }} /> {hero.badge || 'Our Mission & Impact'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: 'var(--space-4)', color: '#ffffff' }}>
            {hero.heading || 'Bridging Talent with Opportunity Across India'}
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: '#cbd5e1', lineHeight: 'var(--leading-relaxed)' }}>
            {hero.description || 'NTR VIKASA Job Portal was founded on a simple principle: every candidate deserves fair, direct access to employment opportunities without scam fees, opaque processes, or dead ends.'}
          </p>
        </div>
      </section>

      {/* ── Platform Stats ── */}
      <section style={{ background: 'var(--color-surface)', padding: 'var(--space-12) 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', textAlign: 'center' }}>
            {stats.map((stat, idx) => {
              const defaultColors = ['var(--color-primary-600)', 'var(--color-success-600)', 'var(--color-warning-600)', 'var(--color-info-600)'];
              const clr = stat.color || defaultColors[idx % defaultColors.length];
              return (
                <div key={stat.id || stat.label || idx}>
                  <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: clr }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Our Core Values ("What We Stand For") ── */}
      <section className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
            {whatWeStandFor.heading || 'What We Stand For'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
            {whatWeStandFor.description || 'Guiding principles that power our candidate-first architecture and employer verification policies.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {(whatWeStandFor.cards || []).map((card, idx) => {
            const bgColors = ['var(--color-primary-50)', 'var(--color-success-50)', 'var(--color-warning-50)'];
            const textColors = ['var(--color-primary-600)', 'var(--color-success-600)', 'var(--color-warning-600)'];
            const bg = bgColors[idx % bgColors.length];
            const clr = textColors[idx % textColors.length];
            return (
              <div key={card.id || card.title || idx} className="card" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 'var(--radius-xl)',
                  background: bg, color: clr,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)'
                }}>
                  {renderValueIcon(card.icon, 26)}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── REQUIRED SECTION 1: Our Team (Renamed from Leadership Team) ── */}
      <section className="container" style={{ paddingTop: 'var(--space-20)' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto var(--space-12)' }}>
          <div className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
            <Users size={14} style={{ marginRight: 6 }} /> {team.badge || 'Our Leadership & Team'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
            {team.heading || 'Our Team'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
            {team.description || 'Experienced leaders with backgrounds across technology, public policy, and corporate recruitment.'}
          </p>
        </div>

        <CardCarousel
          items={teamMembers}
          desktopItems={4}
          tabletItems={2}
          mobileItems={1}
          gap={20}
          renderItem={(member) => (
            <div
              key={member.id || member.name}
              className="card card-hoverable"
              style={{
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-2xl)',
                textAlign: 'center',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                transition: 'all var(--transition-base)'
              }}
            >
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-full)',
                    objectFit: 'cover',
                    margin: '0 auto var(--space-4)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                />
              ) : (
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
                  color: '#fff',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4)',
                  flexShrink: 0
                }}>
                  {member.name ? member.name[0] : 'T'}
                </div>
              )}
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>{member.name}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                {member.role}
                {member.organization && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}> • {member.organization}</span>}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>{member.bio}</p>
            </div>
          )}
        />
      </section>

      {/* ── REQUIRED SECTION 2: Leadership Messages (Positioned below Our Team) ── */}
      <section className="container" style={{ paddingTop: 'var(--space-20)' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto var(--space-12)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fef3c7',
            color: '#b45309',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '4px 16px',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-3)'
          }}>
            {leadershipMessages.badge || 'LEADERSHIP'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
            {leadershipMessages.heading || 'Leadership Messages'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
            {leadershipMessages.description || 'Words from our esteemed leaders who guide our mission'}
          </p>
        </div>

        {/* 2-Column Responsive Leadership Message Cards matching user design */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--space-6)',
          maxWidth: 1100,
          margin: '0 auto'
        }}>
          {leaders.map((leader, idx) => {
            const headerColor = leader.headerBg || (idx === 0 ? '#0f2a59' : '#047857');
            return (
              <div
                key={leader.id || leader.name || idx}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-2xl)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Header Strip with photo, name, designation, organization */}
                <div style={{
                  background: headerColor,
                  padding: 'var(--space-5) var(--space-6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)'
                }}>
                  {/* Avatar / Photo */}
                  <div style={{
                    width: 54,
                    height: 54,
                    borderRadius: 'var(--radius-full)',
                    background: '#ffffff',
                    border: '2px solid rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: headerColor,
                    fontWeight: 800,
                    fontSize: 'var(--text-sm)',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {leader.image ? (
                      <img src={leader.image} alt={leader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.04em', color: headerColor }}>
                        {leader.initials || leader.name.split(' ').map(w => w[0]).join('')}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0' }}>
                      {leader.name}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#fbbf24', margin: '0 0 2px 0' }}>
                      {leader.designation}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                      {leader.organization}
                    </p>
                  </div>
                </div>

                {/* Body message */}
                <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--leading-relaxed)',
                    margin: '0 0 var(--space-6) 0'
                  }}>
                    {leader.message}
                  </p>

                  {/* View Message Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                      variant={idx === 1 ? 'success' : 'primary'}
                      size="sm"
                      leftIcon={<MessageSquare size={14} />}
                      onClick={() => setSelectedLeader(leader)}
                    >
                      View Message
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── REQUIRED SECTION 3: Our Industry & Academic Training Partners (Positioned below Leadership Messages) ── */}
      <section style={{
        marginTop: 'var(--space-20)',
        padding: 'var(--space-12) 0',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          {/* Header with horizontal divider lines */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)'
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <h3 style={{
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-primary-700)',
              margin: 0,
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              {partners.heading || 'OUR INDUSTRY & ACADEMIC TRAINING PARTNERS'}
            </h3>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          {/* Partner Brand Logos Grid */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-8) var(--space-10)',
            padding: 'var(--space-2) var(--space-4)'
          }}>
            {partnerList.map((partner) => (
              <div
                key={partner.id || partner.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                  cursor: 'default',
                  minHeight: 40
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                title={partner.name}
              >
                {renderPartnerLogo(partner)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="container" style={{ paddingTop: 'var(--space-20)' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-900))',
          borderRadius: 'var(--radius-3xl)',
          padding: 'var(--space-12) var(--space-8)',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: 'var(--space-3)', color: '#ffffff' }}>
            Join the NTR VIKASA Job Portal Community Today
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: 'var(--text-base)', maxWidth: 600, margin: '0 auto var(--space-8)' }}>
            Whether you are looking for your next career breakthrough or hiring top talent, we are here to support your journey.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register/candidate"><Button variant="primary" size="lg" style={{ background: '#ffffff', color: 'var(--color-primary-900)', fontWeight: 700 }}>Register as Candidate</Button></Link>
            <Link to="/contact"><Button variant="outline" size="lg" style={{ borderColor: '#ffffff', color: '#ffffff', fontWeight: 600 }}>Contact Support</Button></Link>
          </div>
        </div>
      </section>

      {/* ── View Leadership Message Full Modal ── */}
      {selectedLeader && (
        <Modal
          isOpen={Boolean(selectedLeader)}
          onClose={() => setSelectedLeader(null)}
          title={`Message from ${selectedLeader.name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Header info */}
            <div style={{
              background: selectedLeader.headerBg || '#0f2a59',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)'
            }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: 'var(--radius-full)',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: selectedLeader.headerBg || '#0f2a59',
                fontSize: 'var(--text-sm)'
              }}>
                {selectedLeader.initials || selectedLeader.name[0]}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0' }}>
                  {selectedLeader.name}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#fbbf24', margin: '0 0 2px 0' }}>
                  {selectedLeader.designation}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                  {selectedLeader.organization}
                </p>
              </div>
            </div>

            {/* Message Body */}
            <div style={{
              background: 'var(--color-gray-50)',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              position: 'relative'
            }}>
              <Quote size={28} style={{ color: 'var(--color-primary-200)', position: 'absolute', top: 12, right: 12 }} />
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
                lineHeight: 'var(--leading-relaxed)',
                margin: 0,
                position: 'relative',
                zIndex: 1
              }}>
                "{selectedLeader.fullMessage || selectedLeader.message}"
              </p>
            </div>

            {/* Footer action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setSelectedLeader(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

