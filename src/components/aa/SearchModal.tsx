import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, Dumbbell } from 'lucide-react';
import { MODULES } from '../../lib/data';

interface SearchResult {
  type: 'lesson' | 'exercise';
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  href: string;
}

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];
  for (const mod of MODULES) {
    for (const lesson of mod.lessons) {
      results.push({
        type: 'lesson',
        id: lesson.id,
        moduleId: mod.id,
        moduleTitle: mod.title,
        title: lesson.title,
        description: lesson.description,
        href: `/lesson/${lesson.id}`,
      });
    }
    for (const ex of mod.exercises) {
      results.push({
        type: 'exercise',
        id: ex.id,
        moduleId: mod.id,
        moduleTitle: mod.title,
        title: ex.title,
        description: ex.description,
        href: `/module/${mod.id}`,
      });
    }
  }
  return results;
}

const INDEX = buildIndex();

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(0);

  const results = query.trim().length > 0
    ? INDEX.filter(item => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.moduleTitle.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(v => Math.min(v + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(v => Math.max(v - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[selected]) handleSelect(results[selected]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '80px 16px 16px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.15 }}
            style={{
              width: '100%', maxWidth: 560,
              background: 'var(--bg-3)', border: '1px solid var(--border-hi)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <Search size={16} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Caută lecții, exerciții..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontSize: 15, color: 'var(--fg)',
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 2, display: 'flex' }}
                >
                  <X size={14} />
                </button>
              )}
              <kbd style={{
                fontSize: 10, color: 'var(--fg-3)', background: 'var(--bg-2)',
                border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px',
                fontFamily: 'monospace', flexShrink: 0,
              }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {query.trim().length === 0 ? (
                <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 13, color: 'var(--fg-3)' }}>
                  Scrie pentru a căuta în lecții și exerciții
                </div>
              ) : results.length === 0 ? (
                <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 13, color: 'var(--fg-3)' }}>
                  Niciun rezultat găsit pentru "{query}"
                </div>
              ) : (
                <div style={{ padding: '8px 8px' }}>
                  {results.map((result, idx) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '10px 12px', borderRadius: 10,
                        background: idx === selected ? 'var(--accent-dim)' : 'transparent',
                        border: idx === selected ? '1px solid rgba(196,240,228,0.2)' : '1px solid transparent',
                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                      }}
                      onMouseEnter={() => setSelected(idx)}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: result.type === 'lesson' ? 'rgba(196,240,228,0.1)' : 'rgba(201,169,110,0.1)',
                      }}>
                        {result.type === 'lesson'
                          ? <BookOpen size={13} style={{ color: 'var(--accent)' }} />
                          : <Dumbbell size={13} style={{ color: 'var(--gold)' }} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: result.type === 'lesson' ? 'var(--accent)' : 'var(--gold)',
                            background: result.type === 'lesson' ? 'rgba(196,240,228,0.1)' : 'rgba(201,169,110,0.1)',
                            padding: '1px 6px', borderRadius: 4,
                          }}>
                            {result.type === 'lesson' ? 'Lecție' : 'Exercițiu'}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>{result.moduleTitle}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {result.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                          {result.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div style={{ padding: '8px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 11, color: 'var(--fg-3)' }}>
              <span><kbd style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace' }}>↑↓</kbd> navigare</span>
              <span><kbd style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace' }}>↵</kbd> selectează</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
