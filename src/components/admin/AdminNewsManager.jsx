import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Newspaper, Plus, Edit3, Trash2, ExternalLink, Search,
  Calendar, UploadCloud, RotateCcw, Sparkles, BookOpen
} from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useAdmin, DEFAULT_HOME_CONTENT } from '../../context/AdminContext';
import adminService from '../../services/adminService';

const NEWSPAPER_PRESETS = [
  'Sakshi',
  'Eenadu',
  'Suryaa',
  'Andhra Jyothi',
  'Prajasakti',
  'Vaartha',
  'The Hindu',
  'Times of India',
  'Special Press Bulletin',
];

export default function AdminNewsManager() {
  const { addToast } = useToast();
  const {
    homeContent,
    updateHomeContent,
    addNewsArticle,
    updateNewsArticle,
    deleteNewsArticle,
  } = useAdmin();

  const newsContent = (homeContent && homeContent.newsArticles) || DEFAULT_HOME_CONTENT.newsArticles;
  const articles = newsContent.articles || [];

  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'header'
  const [searchQuery, setSearchQuery] = useState('');

  // Async & Loading states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);

  // ── Header Form State ──
  const [headerForm, setHeaderForm] = useState({
    badge: newsContent.badge || '',
    heading1: newsContent.heading1 || '',
    heading2: newsContent.heading2 || '',
    subtitle: newsContent.subtitle || '',
  });

  // ── Load Backend News Data ──
  const loadBackendNews = useCallback(async () => {
    try {
      const [articlesRes, headerRes] = await Promise.allSettled([
        adminService.getPressArticles({ page_size: 100 }),
        adminService.getWebsiteSectionHeader('news'),
      ]);

      const updatedNews = { ...newsContent };

      if (articlesRes.status === 'fulfilled' && Array.isArray(articlesRes.value) && articlesRes.value.length > 0) {
        updatedNews.articles = articlesRes.value.map(a => ({
          id: a.id,
          newspaper: a.newspaper || a.publication_name,
          title: a.title,
          date: a.date || a.publication_date,
          edition: a.edition || '',
          imageUrl: a.imageUrl || a.image_url,
          sourceUrl: a.sourceUrl || a.source_url || a.article_url || '',
          summary: a.summary || a.description || '',
        }));
      }

      if (headerRes.status === 'fulfilled' && headerRes.value) {
        const h = headerRes.value;
        if (h.heading1) {
          updatedNews.badge = h.badge || updatedNews.badge;
          updatedNews.heading1 = h.heading1 || updatedNews.heading1;
          updatedNews.heading2 = h.heading2 || updatedNews.heading2;
          updatedNews.subtitle = h.subtitle || updatedNews.subtitle;
          setHeaderForm({
            badge: updatedNews.badge,
            heading1: updatedNews.heading1,
            heading2: updatedNews.heading2,
            subtitle: updatedNews.subtitle,
          });
        }
      }

      updateHomeContent({ newsArticles: updatedNews });
    } catch (err) {
      console.warn('Failed to load news from backend:', err);
    }
  }, []);

  useEffect(() => {
    loadBackendNews();
  }, [loadBackendNews]);

  const handleSaveHeader = async (e) => {
    e.preventDefault();
    setSavingHeader(true);
    try {
      await adminService.updateWebsiteSectionHeader('news', headerForm);
      updateHomeContent({
        newsArticles: {
          ...newsContent,
          ...headerForm,
        },
      });
      addToast('News section header settings saved successfully!', 'success');
    } catch (err) {
      updateHomeContent({
        newsArticles: {
          ...newsContent,
          ...headerForm,
        },
      });
      addToast('News section header settings saved locally.', 'info');
    } finally {
      setSavingHeader(false);
    }
  };

  const handleResetHeader = async () => {
    const def = DEFAULT_HOME_CONTENT.newsArticles;
    setHeaderForm({
      badge: def.badge,
      heading1: def.heading1,
      heading2: def.heading2,
      subtitle: def.subtitle,
    });
    try {
      await adminService.updateWebsiteSectionHeader('news', {
        badge: def.badge,
        heading1: def.heading1,
        heading2: def.heading2,
        subtitle: def.subtitle,
      });
    } catch {
      // ignore
    }
    updateHomeContent({
      newsArticles: {
        ...newsContent,
        badge: def.badge,
        heading1: def.heading1,
        heading2: def.heading2,
        subtitle: def.subtitle,
      },
    });
    addToast('News header settings reset to default values.', 'info');
  };

  // ── Article Modal State ──
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [articleForm, setArticleForm] = useState({
    newspaper: 'Sakshi',
    title: '',
    date: '',
    edition: '',
    imageUrl: '',
    sourceUrl: '',
    summary: '',
  });

  const handleOpenAddArticle = () => {
    setEditingArticleId(null);
    setArticleForm({
      newspaper: 'Sakshi',
      title: '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      edition: '',
      imageUrl: '',
      sourceUrl: '',
      summary: '',
    });
    setArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art) => {
    setEditingArticleId(art.id);
    setArticleForm({
      newspaper: art.newspaper || 'Sakshi',
      title: art.title || '',
      date: art.date || '',
      edition: art.edition || '',
      imageUrl: art.imageUrl || '',
      sourceUrl: art.sourceUrl || '',
      summary: art.summary || '',
    });
    setArticleModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      addToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const res = await adminService.uploadWebsiteContentMedia(file, 'press');
      const savedUrl = res.url || res;
      setArticleForm(prev => ({ ...prev, imageUrl: savedUrl }));
      addToast('Clipping image uploaded successfully to server storage.', 'success');
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticleForm(prev => ({ ...prev, imageUrl: reader.result }));
        addToast('Clipping image loaded (local preview).', 'info');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title.trim()) {
      addToast('Headline / Title is required', 'error');
      return;
    }
    if (!articleForm.imageUrl.trim()) {
      addToast('Please provide a clipping image URL or upload an image', 'error');
      return;
    }

    setSavingArticle(true);
    try {
      if (editingArticleId) {
        const updated = await adminService.updatePressArticle(editingArticleId, {
          title: articleForm.title,
          newspaper: articleForm.newspaper,
          date: articleForm.date,
          edition: articleForm.edition,
          imageUrl: articleForm.imageUrl,
          sourceUrl: articleForm.sourceUrl,
          summary: articleForm.summary,
        });
        updateNewsArticle(editingArticleId, updated || articleForm);
        addToast('News article clipping updated successfully in database!', 'success');
      } else {
        const created = await adminService.createPressArticle({
          title: articleForm.title,
          newspaper: articleForm.newspaper,
          date: articleForm.date,
          edition: articleForm.edition,
          imageUrl: articleForm.imageUrl,
          sourceUrl: articleForm.sourceUrl,
          summary: articleForm.summary,
        });
        addNewsArticle(created || articleForm);
        addToast('New press clipping added to database!', 'success');
      }
      setArticleModalOpen(false);
      await loadBackendNews();
    } catch (err) {
      addToast(err.message || 'Failed to persist news clipping', 'error');
    } finally {
      setSavingArticle(false);
    }
  };

  const handleDeleteArticle = async (art) => {
    if (window.confirm(`Are you sure you want to delete clipping "${art.title}"?`)) {
      try {
        await adminService.deletePressArticle(art.id);
        deleteNewsArticle(art.id);
        addToast('News clipping deleted from database.', 'info');
        await loadBackendNews();
      } catch (err) {
        deleteNewsArticle(art.id);
        addToast('News clipping removed.', 'info');
      }
    }
  };

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(a =>
      (a.title || '').toLowerCase().includes(q) ||
      (a.newspaper || '').toLowerCase().includes(q) ||
      (a.summary || '').toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Sub Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'inline-flex', gap: 6, background: 'var(--color-bg)', padding: 4, borderRadius: 'var(--radius-lg)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'articles' ? 'var(--color-primary-600)' : 'transparent',
              color: activeTab === 'articles' ? '#ffffff' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: activeTab === 'articles' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <Newspaper size={16} />
            <span>Press Clippings ({articles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('header')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'header' ? 'var(--color-primary-600)' : 'transparent',
              color: activeTab === 'header' ? '#ffffff' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: activeTab === 'header' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <Sparkles size={16} />
            <span>Section Header Settings</span>
          </button>
        </div>

        {activeTab === 'articles' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddArticle}
            leftIcon={<Plus size={16} />}
          >
            Add New Press Clipping
          </Button>
        )}
      </div>

      {/* ── 1. HEADER SETTINGS ── */}
      {activeTab === 'header' && (
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--color-border)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>News & Media Header Settings</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                Controls the badge, title headings, and subtitle displayed above the news articles carousel.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetHeader}
              className="btn btn-secondary btn-xs"
              style={{ gap: 4 }}
            >
              <RotateCcw size={12} /> Reset Defaults
            </button>
          </div>

          <form onSubmit={handleSaveHeader} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="Pill Badge">
              <Input
                value={headerForm.badge}
                onChange={(e) => setHeaderForm({ ...headerForm, badge: e.target.value })}
                placeholder="In The Media & Press"
                required
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <FormField label="Main Heading 1 (Left Part)">
                <Input
                  value={headerForm.heading1}
                  onChange={(e) => setHeaderForm({ ...headerForm, heading1: e.target.value })}
                  placeholder="Official Newspaper &"
                  required
                />
              </FormField>

              <FormField label="Main Heading 2 (Gradient Part)">
                <Input
                  value={headerForm.heading2}
                  onChange={(e) => setHeaderForm({ ...headerForm, heading2: e.target.value })}
                  placeholder="Press Highlights"
                  required
                />
              </FormField>
            </div>

            <FormField label="Subtitle / Description">
              <Textarea
                rows={3}
                value={headerForm.subtitle}
                onChange={(e) => setHeaderForm({ ...headerForm, subtitle: e.target.value })}
                placeholder="Read authentic press coverage, newspaper clippings..."
                required
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button type="submit" variant="primary" disabled={savingHeader}>
                {savingHeader ? 'Saving...' : 'Save Header Settings'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── 2. ARTICLES LIST ── */}
      {activeTab === 'articles' && (
        <>
          <div style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search clippings by newspaper or headline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                fontSize: '13px',
              }}
            />
          </div>

          {filteredArticles.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <Newspaper size={40} style={{ opacity: 0.35, marginBottom: 8 }} />
              <h4 style={{ fontWeight: 600, color: 'var(--color-text)' }}>No news articles found</h4>
              <p style={{ fontSize: '13px', marginTop: 4 }}>Click &quot;Add New Press Clipping&quot; to upload your first clipping.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 16,
              }}
            >
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  style={{
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  {/* Top bar with Newspaper Name */}
                  <div
                    style={{
                      padding: '8px 14px',
                      background: '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <span>{art.newspaper}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{art.date}</span>
                  </div>

                  <div style={{ position: 'relative', paddingTop: '58%', background: '#ffffff', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                      }}
                    />
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
                    {art.edition && (
                      <span style={{ fontSize: '11px', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                        {art.edition}
                      </span>
                    )}

                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--color-text)', lineHeight: 1.3 }}>
                      {art.title}
                    </h4>

                    {art.summary && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {art.summary}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                      {art.sourceUrl && (
                        <a
                          href={art.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-xs"
                          style={{ gap: 4, textDecoration: 'none' }}
                        >
                          <ExternalLink size={11} /> Source
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditArticle(art)}
                        className="btn btn-secondary btn-xs"
                        style={{ gap: 4 }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art)}
                        className="btn btn-danger btn-xs"
                        style={{ gap: 4 }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MODAL: ADD / EDIT ARTICLE ── */}
      <Modal
        isOpen={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        title={editingArticleId ? 'Edit Press Clipping' : 'Add New Newspaper Press Clipping'}
        size="md"
      >
        <form onSubmit={handleSaveArticle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Newspaper / Publication" required>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  list="newspaper-list"
                  value={articleForm.newspaper}
                  onChange={(e) => setArticleForm({ ...articleForm, newspaper: e.target.value })}
                  placeholder="e.g. Sakshi"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: '13px',
                  }}
                  required
                />
                <datalist id="newspaper-list">
                  {NEWSPAPER_PRESETS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
            </FormField>

            <FormField label="Publication Date">
              <Input
                value={articleForm.date}
                onChange={(e) => setArticleForm({ ...articleForm, date: e.target.value })}
                placeholder="e.g. 08 Feb 2026"
              />
            </FormField>
          </div>

          <FormField label="Headline / Article Title" required>
            <Input
              value={articleForm.title}
              onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
              placeholder="e.g. జాబ్‌మేళాలో 68 మందికి ఉద్యోగాలు"
              required
            />
          </FormField>

          <FormField label="Edition / Page Details (Optional)">
            <Input
              value={articleForm.edition}
              onChange={(e) => setArticleForm({ ...articleForm, edition: e.target.value })}
              placeholder="e.g. Tiruvuru Edition | Page 9"
            />
          </FormField>

          <FormField label="Clipping Image (Upload or URL)" required>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  value={articleForm.imageUrl}
                  onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                  placeholder="/news/news-sakshi-job-mela.png or paste image URL"
                  style={{ flex: 1 }}
                  required
                />
                <label
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-gray-100)',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: uploadingImage ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    opacity: uploadingImage ? 0.7 : 1,
                  }}
                >
                  <UploadCloud size={14} /> {uploadingImage ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {articleForm.imageUrl && (
                <div style={{ position: 'relative', height: 160, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#ffffff' }}>
                  <img
                    src={articleForm.imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
          </FormField>

          <FormField label="Official E-Paper Source Link (Optional)">
            <Input
              value={articleForm.sourceUrl}
              onChange={(e) => setArticleForm({ ...articleForm, sourceUrl: e.target.value })}
              placeholder="https://epaper.sakshi.com/"
            />
          </FormField>

          <FormField label="Summary / Highlights (Optional)">
            <Textarea
              rows={2}
              value={articleForm.summary}
              onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
              placeholder="Brief extract from the newspaper report..."
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button type="button" variant="outline" onClick={() => setArticleModalOpen(false)} disabled={savingArticle}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={savingArticle || uploadingImage}>
              {savingArticle ? 'Saving...' : (editingArticleId ? 'Update Clipping' : 'Add Clipping')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
