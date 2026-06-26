// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Printer, Pencil, Trash2, FolderOpen, ExternalLink, X } from 'lucide-react';
import { PLATFORM_DOCUMENTS, PlatformDocument, openPrintWindow } from '../lib/documentData';
import { useAuthContext } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocColor = 'green' | 'red' | 'gold';
type ActiveTab = 'all' | 'templates' | 'saved';

interface SavedDoc {
  id: string;
  docId: string;
  docNumber: string;
  shortTitle: string;
  title: string;
  topic: string;
  color: DocColor;
  generatedAt: string;
  html: string;
  answers?: Record<string, string>;
  answersPreview: string;
}

// ─── Brand Color Map ──────────────────────────────────────────────────────────

const BRAND_COLOR: Record<DocColor, { border: string; text: string; bg: string; fill: string; fillText: string }> = {
  green: {
    border: '#1A5C38',
    text: '#2a7a4f',
    bg: 'rgba(26,92,56,0.10)',
    fill: '#1A5C38',
    fillText: '#fff',
  },
  red: {
    border: '#8B1A1A',
    text: '#b02222',
    bg: 'rgba(139,26,26,0.09)',
    fill: '#8B1A1A',
    fillText: '#fff',
  },
  gold: {
    border: '#C9A96E',
    text: '#a07840',
    bg: 'rgba(201,169,110,0.10)',
    fill: '#C9A96E',
    fillText: '#1C1410',
  },
};

// Page counts per document (pre-compiled PDFs)
const DOC_PAGE_COUNTS: Record<string, number> = {
  'doc-1': 7,
  'doc-2': 5,
  'doc-3': 4,
  'sop-procedura': 3,
  'doc-fisa-post': 4,
  'doc-instructiune': 4,
};

// ─── Template Card ────────────────────────────────────────────────────────────

const TemplateCard: React.FC<{ doc: PlatformDocument; index: number }> = ({ doc, index }) => {
  const navigate = useNavigate();
  const c = BRAND_COLOR[doc.color];
  const pages = DOC_PAGE_COUNTS[doc.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05, ease: 'easeOut' }}
      style={{
        display: 'flex',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = c.border; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
    >
      {/* Brand accent stripe */}
      <div style={{ width: 4, flexShrink: 0, background: c.border }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'center', minWidth: 0 }}>
        {/* Doc number */}
        <div style={{
          width: 36, height: 36, flexShrink: 0, borderRadius: 8,
          background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="font-aboreto" style={{ fontSize: 10, fontWeight: 700, color: c.text }}>
            {doc.docNumber}
          </span>
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {doc.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.4 }}>
              {doc.description.length > 80 ? doc.description.slice(0, 80) + '…' : doc.description}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
              color: c.text, background: c.bg, borderRadius: 4, padding: '2px 7px',
            }}>
              {pages} Pagini A4
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          <button
            onClick={() => {
              if (doc.downloadUrl) {
                window.open(doc.downloadUrl, '_blank');
              } else {
                openPrintWindow(doc.generate({}));
              }
            }}
            title="Descarcă șablon PDF gol"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
              borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--fg-2)', transition: 'border-color 0.15s, color 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = c.border;
              (e.currentTarget as HTMLButtonElement).style.color = c.text;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-2)';
            }}
          >
            <Printer size={11} />
            Gol (PDF)
          </button>

          <button
            onClick={() => navigate(`/documents/${doc.id}/fill`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
              borderRadius: 8, cursor: 'pointer', border: 'none',
              background: c.fill, color: c.fillText,
              transition: 'filter 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
          >
            Completează
            <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Saved Doc Card ───────────────────────────────────────────────────────────

const SavedDocCard: React.FC<{
  doc: SavedDoc;
  isNew: boolean;
  onDelete: (id: string) => void;
}> = ({ doc, isNew, onDelete }) => {
  const navigate = useNavigate();
  const c = BRAND_COLOR[doc.color];

  const date = new Date(doc.generatedAt).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        display: 'flex',
        background: isNew ? c.bg : 'var(--bg-card)',
        border: `1px solid ${isNew ? c.border : 'var(--border)'}`,
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = c.border; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isNew ? c.border : 'var(--border)'; }}
    >
      {/* Brand stripe */}
      <div style={{ width: 4, flexShrink: 0, background: c.border }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
        {/* Badge */}
        <div style={{
          width: 34, height: 34, flexShrink: 0, borderRadius: 7,
          background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="font-aboreto" style={{ fontSize: 10, fontWeight: 700, color: c.text }}>
            {doc.docNumber}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {doc.shortTitle}
            </span>
            {isNew && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: c.text, background: c.bg, border: `1px solid ${c.border}`,
                padding: '1px 6px', borderRadius: 99,
              }}>
                Nou
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
            {date}
            {doc.answersPreview && <> · <span style={{ color: 'var(--fg-2)' }}>{doc.answersPreview}</span></>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => openPrintWindow(doc.html)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 13px', fontSize: 11, fontWeight: 700, borderRadius: 8,
              cursor: 'pointer', border: 'none',
              background: c.fill, color: c.fillText,
              transition: 'filter 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
          >
            <Printer size={11} /> Deschide PDF
          </button>

          <button
            onClick={() => navigate(`/documents/${doc.docId}/fill?edit=${doc.id}`)}
            title="Editează"
            style={{
              width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--fg-3)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = c.border;
              (e.currentTarget as HTMLButtonElement).style.color = c.text;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-3)';
            }}
          >
            <Pencil size={13} />
          </button>

          <button
            onClick={() => onDelete(doc.id)}
            title="Șterge"
            style={{
              width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--fg-3)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#c0392b';
              (e.currentTarget as HTMLButtonElement).style.color = '#c0392b';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-3)';
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'all', label: 'Toate' },
  { id: 'templates', label: 'Șabloane' },
  { id: 'saved', label: 'Salvate' },
];

// ─── DocumentsPage ────────────────────────────────────────────────────────────

export const DocumentsPage: React.FC = () => {
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const newSavedId = searchParams.get('saved');
  const myDocsRef = useRef<HTMLDivElement>(null);

  const storageKey = `aa_my_docs_${user?.id ?? 'anon'}`;
  const [myDocs, setMyDocs] = useState<SavedDoc[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    newSavedId ? 'saved' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Scroll to saved section when arriving from wizard
  useEffect(() => {
    if (newSavedId && myDocsRef.current) {
      setTimeout(() => myDocsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    }
  }, [newSavedId]);

  const handleDelete = (id: string) => {
    const updated = myDocs.filter(d => d.id !== id);
    setMyDocs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (updated.length === 0 && activeTab === 'saved') setActiveTab('all');
  };

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return PLATFORM_DOCUMENTS;
    const q = searchQuery.toLowerCase();
    return PLATFORM_DOCUMENTS.filter(d =>
      d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered saved docs
  const filteredSaved = useMemo(() => {
    if (!searchQuery.trim()) return myDocs;
    const q = searchQuery.toLowerCase();
    return myDocs.filter(d =>
      d.title.toLowerCase().includes(q) || d.shortTitle.toLowerCase().includes(q)
    );
  }, [searchQuery, myDocs]);

  const showTemplates = activeTab === 'all' || activeTab === 'templates';
  const showSaved = (activeTab === 'all' || activeTab === 'saved') && myDocs.length > 0;

  const noResults =
    (activeTab === 'templates' && filteredTemplates.length === 0) ||
    (activeTab === 'saved' && filteredSaved.length === 0) ||
    (activeTab === 'all' && filteredTemplates.length === 0 && filteredSaved.length === 0);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px' }}>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        style={{ marginBottom: 32 }}
      >
        <div className="font-aboreto" style={{
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em',
          color: 'var(--fg-3)', marginBottom: 10,
        }}>
          Serie Oficială · Arhitectura Afacerii
        </div>

        <h1 className="font-aboreto" style={{
          fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
          color: 'var(--fg)', lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: 10,
        }}>
          Tabloul Documentelor
        </h1>

        <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.65, maxWidth: 500 }}>
          Șabloane oficiale pentru momentele cheie din afacere. Descarcă gol și completezi de mână, sau completezi direct pe platformă.
        </p>

        {/* ── Stats row ── */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 8,
            background: 'var(--bg-3)', border: '1px solid var(--border)',
          }}>
            <FileText size={13} style={{ color: 'var(--fg-3)' }} />
            <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>
              <strong style={{ color: 'var(--fg)' }}>{PLATFORM_DOCUMENTS.length}</strong> șabloane disponibile
            </span>
          </div>
          {myDocs.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 14px', borderRadius: 8,
              background: 'var(--bg-3)', border: '1px solid var(--border)',
            }}>
              <FolderOpen size={13} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>
                <strong style={{ color: 'var(--fg)' }}>{myDocs.length}</strong>{' '}
                {myDocs.length === 1 ? 'document salvat' : 'documente salvate'}
              </span>
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 8,
            background: 'var(--bg-3)', border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              🔒 Date stocate local — securizat
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Filter Bar (Tabs + Search) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08, ease: 'easeOut' }}
        style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap',
        }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
          {TABS.map(tab => {
            // Only show "Salvate" tab if there are saved docs
            if (tab.id === 'saved' && myDocs.length === 0) return null;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: 'relative', padding: '6px 14px',
                  fontSize: 12, fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer', background: 'none', border: 'none',
                  color: isActive ? 'var(--fg)' : 'var(--fg-3)',
                  transition: 'color 0.15s',
                  borderBottom: isActive
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-2)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-3)';
                }}
              >
                {tab.label}
                {tab.id === 'saved' && myDocs.length > 0 && (
                  <span style={{
                    marginLeft: 5, fontSize: 10, fontWeight: 700,
                    background: 'var(--gold-dim)', color: 'var(--gold)',
                    borderRadius: 99, padding: '1px 6px',
                  }}>
                    {myDocs.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 280, marginLeft: 'auto' }}>
          <Search
            size={13}
            style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--fg-3)', pointerEvents: 'none',
            }}
          />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Caută document…"
            style={{
              width: '100%', background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '7px 32px 7px 32px',
              fontSize: 12, color: 'var(--fg)',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-hi)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
              style={{
                position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--fg-3)', padding: 2, display: 'flex', alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-3)'; }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── No results ── */}
      {noResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--fg-3)', fontSize: 13 }}
        >
          Niciun document găsit pentru „{searchQuery}"
        </motion.div>
      )}

      {/* ── Salvate ── */}
      <AnimatePresence>
        {showSaved && filteredSaved.length > 0 && (
          <motion.div
            ref={myDocsRef}
            key="saved-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ marginBottom: 36 }}
          >
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <FolderOpen size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span className="font-aboreto" style={{
                fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--gold)', whiteSpace: 'nowrap',
              }}>
                Documentele Mele
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(201,169,110,0.18)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence mode="popLayout">
                {filteredSaved.map(doc => (
                  <SavedDocCard
                    key={doc.id}
                    doc={doc}
                    isNew={doc.id === newSavedId}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Șabloane ── */}
      {showTemplates && filteredTemplates.length > 0 && (
        <div>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <FileText size={13} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
            <span className="font-aboreto" style={{
              fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--fg-3)', whiteSpace: 'nowrap',
            }}>
              Șabloane Oficiale · Etapa 0
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredTemplates.map((doc, i) => (
              <TemplateCard key={doc.id} doc={doc} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
