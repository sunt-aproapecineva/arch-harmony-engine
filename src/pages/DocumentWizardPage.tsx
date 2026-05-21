// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText, ArrowLeft, Printer } from 'lucide-react';
import { PLATFORM_DOCUMENTS, openPrintWindow } from '../lib/documentData';
import { useAuthContext } from '../context/AuthContext';

export function DocumentWizardPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editId) {
      const userId = user?.id ?? 'anon';
      const storageKey = `aa_my_docs_${userId}`;
      try {
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const docToEdit = existing.find((item: any) => item.id === editId);
        if (docToEdit && docToEdit.answers) {
          setAnswers(docToEdit.answers);
        }
      } catch (e) {
        console.error('Failed to load doc for editing', e);
      }
    }
  }, [editId, user?.id]);

  const doc = PLATFORM_DOCUMENTS.find(d => d.id === docId);

  if (!doc) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        <Link
          to="/documents"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fg-3)', fontSize: 13, textDecoration: 'none', marginBottom: 24 }}
        >
          <ArrowLeft size={14} />
          Documente
        </Link>
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--fg-3)' }}>
          <FileText size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>
            Document negăsit
          </div>
          <div style={{ fontSize: 13 }}>
            Documentul cu ID-ul <strong>{docId}</strong> nu există.
          </div>
        </div>
      </div>
    );
  }

  const totalSteps = doc.steps.length;
  const isLastStep = step === totalSteps - 1;
  const currentStep = doc.steps[step];

  const accentColor =
    doc.color === 'green'
      ? 'var(--accent)'
      : doc.color === 'red'
      ? '#C0392B'
      : 'var(--gold)';

  const buttonTextColor = doc.color === 'gold' ? '#0D0907' : '#fff';

  const handleChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleGenerate = () => {
    const html = doc.generate(answers);

    // Save to localStorage (per user)
    const userId = user?.id ?? 'anon';
    const storageKey = `aa_my_docs_${userId}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const targetId = editId || Date.now().toString();
    const newEntry = {
      id: targetId,
      docId: doc.id,
      docNumber: doc.docNumber,
      shortTitle: doc.shortTitle,
      title: doc.title,
      topic: doc.topic,
      color: doc.color,
      generatedAt: new Date().toISOString(),
      html,
      answers, // Save raw answers for editing later
      answersPreview: Object.values(answers).filter(Boolean).slice(0, 2).join(' · '),
    };

    if (editId) {
      const existingIndex = existing.findIndex((item: any) => item.id === editId);
      if (existingIndex > -1) {
        existing[existingIndex] = newEntry;
      } else {
        existing.unshift(newEntry);
      }
    } else {
      existing.unshift(newEntry);
    }
    localStorage.setItem(storageKey, JSON.stringify(existing));

    // Open print window (PDF via browser Save as PDF)
    openPrintWindow(html);

    // Navigate to documents page — highlight the new doc
    navigate(`/documents?saved=${newEntry.id}`);
  };

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--fg)',
    fontSize: 13,
    fontFamily: 'Arimo, Arial, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 13, color: 'var(--fg-3)' }}>
        <Link
          to="/documents"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--fg-3)', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} />
          Documente
        </Link>
        <span style={{ opacity: 0.5 }}>/</span>
        <span style={{ color: 'var(--fg-2)' }}>{doc.shortTitle}</span>
      </div>

      {/* Progress bar section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 10 }}>
          Pasul {step + 1} din {totalSteps} · {currentStep.title}
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((step + 1) / totalSteps) * 100}%`,
              background: accentColor,
              borderRadius: 3,
              transition: 'width 0.35s ease',
            }}
          />
        </div>
      </div>

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 20,
          }}
        >
          {/* Step header */}
          <div style={{ marginBottom: 22 }}>
            <div
              className="font-aboreto"
              style={{ fontSize: 18, color: 'var(--fg)', marginBottom: 4 }}
            >
              {currentStep.title}
            </div>
            {currentStep.subtitle && (
              <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                {currentStep.subtitle}
              </div>
            )}
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {currentStep.questions.map(q => (
              <div key={q.id}>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--fg-3)',
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  {q.label}
                </div>
                {q.hint && (
                  <div
                    style={{
                      fontSize: 10,
                      fontStyle: 'italic',
                      color: 'rgba(var(--fg-3-raw, 120, 110, 100), 0.6)',
                      opacity: 0.7,
                      marginBottom: 6,
                    }}
                  >
                    {q.hint}
                  </div>
                )}
                {q.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                    style={{ ...inputBaseStyle, resize: 'vertical' }}
                    onFocus={e => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                ) : q.type === 'date' ? (
                  <input
                    type="date"
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                    style={inputBaseStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                    style={inputBaseStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        {/* Left nav */}
        {step > 0 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--fg-2)',
            }}
          >
            <ChevronLeft size={15} />
            Înapoi
          </button>
        ) : (
          <Link
            to="/documents"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--fg-2)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={15} />
            Documente
          </Link>
        )}

        {/* Right nav */}
        {!isLastStep ? (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              background: accentColor,
              border: 'none',
              color: buttonTextColor,
            }}
          >
            Continuă
            <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              background: accentColor,
              border: 'none',
              color: buttonTextColor,
            }}
          >
            <Printer size={15} />
            Generează PDF
          </button>
        )}
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 4 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: i === step ? 18 : 7,
              height: 7,
              borderRadius: 4,
              background: i === step ? accentColor : i < step ? `${accentColor}55` : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
