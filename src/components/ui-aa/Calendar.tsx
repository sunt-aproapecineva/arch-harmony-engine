import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Download } from 'lucide-react';
import { LiveEvent } from '../../lib/data';

interface ModuleUnlock {
  date: string;
  title: string;
  moduleId: string;
}

interface CalendarProps {
  events: LiveEvent[];
  moduleUnlocks: ModuleUnlock[];
}

const DAYS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];
const MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];

function toGCalUrl(event: LiveEvent): string {
  const start = event.date.replace(/-/g, '') + 'T' + event.time.replace(':', '') + '00';
  const endHour = parseInt(event.time.split(':')[0]) + 1;
  const end = event.date.replace(/-/g, '') + 'T' + String(endHour).padStart(2, '0') + event.time.split(':')[1] + '00';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function downloadAllIcs(events: LiveEvent[]) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arhitectura Afacerii//RO'];
  events.forEach(ev => {
    const dt = ev.date.replace(/-/g, '') + 'T' + ev.time.replace(':', '') + '00';
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART:${dt}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.description}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'arhitectura-afacerii.ics';
  a.click();
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0=Sun..6=Sat → convert to Mon-first (0=Mon..6=Sun)
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

export const Calendar: React.FC<CalendarProps> = ({ events, moduleUnlocks }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Build date → event map
  const eventMap: Record<string, LiveEvent[]> = {};
  events.forEach(ev => {
    if (!eventMap[ev.date]) eventMap[ev.date] = [];
    eventMap[ev.date].push(ev);
  });

  const unlockMap: Record<string, ModuleUnlock[]> = {};
  moduleUnlocks.forEach(u => {
    if (!unlockMap[u.date]) unlockMap[u.date] = [];
    unlockMap[u.date].push(u);
  });

  const toDateStr = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Selected date events
  const selectedEvents = selectedDate ? (eventMap[selectedDate] || []) : [];
  const selectedUnlocks = selectedDate ? (unlockMap[selectedDate] || []) : [];

  // Build grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--fg-2)', padding: '5px 8px', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--fg)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}
        >
          <ChevronLeft size={15} />
        </button>
        <div className="font-aboreto" style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--fg)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </div>
        <button
          onClick={nextMonth}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--fg-2)', padding: '5px 8px', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--fg)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 16px 4px', gap: 2 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid — horizontally scrollable on small screens */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 280, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px 16px', gap: 2 }}>
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} style={{ aspectRatio: '1', minHeight: 44 }} />;
            }
            const dateStr = toDateStr(viewYear, viewMonth, day);
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const hasEvents = !!eventMap[dateStr];
            const hasUnlocks = !!unlockMap[dateStr];
            const isSelected = dateStr === selectedDate;
            const evList = eventMap[dateStr] || [];
            const hasZoom = evList.some(e => e.type === 'zoom');
            const hasWorkshop = evList.some(e => e.type === 'workshop');

            return (
              <button
                key={dateStr}
                onClick={() => {
                  if (hasEvents || hasUnlocks) {
                    setSelectedDate(isSelected ? null : dateStr);
                  }
                }}
                style={{
                  aspectRatio: '1',
                  minHeight: 44,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  borderRadius: 9,
                  border: isToday ? '2px solid var(--accent)' : isSelected ? '2px solid var(--gold)' : '2px solid transparent',
                  background: isSelected ? 'var(--gold-dim)' : isToday ? 'var(--accent-dim)' : 'transparent',
                  cursor: (hasEvents || hasUnlocks) ? 'pointer' : 'default',
                  opacity: isPast && !isToday ? 0.5 : 1,
                  transition: 'all 0.15s',
                  padding: 0,
                }}
                onMouseEnter={e => {
                  if ((hasEvents || hasUnlocks) && !isSelected) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = isToday ? 'var(--accent-dim)' : 'transparent';
                }}
              >
                <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--fg)', lineHeight: 1 }}>
                  {day}
                </span>
                {/* Event dots */}
                {(hasZoom || hasWorkshop || hasUnlocks) && (
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {hasZoom && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                    )}
                    {hasWorkshop && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                    )}
                    {hasUnlocks && (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', border: '1px solid var(--accent)', flexShrink: 0 }} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, padding: '0 20px 14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-3)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} /> Zoom
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-3)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} /> Workshop
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg-3)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} /> Modul nou
        </div>
      </div>

      {/* Event detail popup */}
      {selectedDate && (selectedEvents.length > 0 || selectedUnlocks.length > 0) && (
        <div style={{ margin: '0 16px 16px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, position: 'relative' }}>
          <button
            onClick={() => setSelectedDate(null)}
            style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 2, display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            <X size={14} />
          </button>

          <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 12, fontWeight: 500 }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {selectedEvents.map(ev => (
            <div key={ev.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: ev.type === 'zoom' ? '#4ade80' : 'var(--gold)',
                }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{ev.title}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 8, paddingLeft: 16 }}>
                {ev.time} · {ev.duration}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 10, paddingLeft: 16 }}>
                {ev.description}
              </div>
              {ev.workshopThemes && ev.workshopThemes.length > 0 && (
                <div style={{ paddingLeft: 16, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4 }}>Teme posibile:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ev.workshopThemes.map(theme => (
                      <span key={theme} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 99, color: 'var(--gold)' }}>
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, paddingLeft: 16, flexWrap: 'wrap' }}>
                <a
                  href={toGCalUrl(ev)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.2)',
                    borderRadius: 7, fontSize: 11, color: 'var(--accent)', textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(196,240,228,0.18)'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-dim)'}
                >
                  <ExternalLink size={11} /> Adaugă în Google Calendar
                </a>
              </div>
            </div>
          ))}

          {selectedUnlocks.map(u => (
            <div key={u.moduleId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: selectedEvents.length > 0 ? 10 : 0, padding: '8px 12px', background: 'var(--accent-dim)', border: '1px solid rgba(196,240,228,0.15)', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: 'var(--accent)' }}>
                Se deblochează: <strong>{u.title}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download ICS button */}
      <div style={{ padding: '0 16px 16px' }}>
        <button
          onClick={() => downloadAllIcs(events)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--fg-2)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--fg)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-2)'; }}
        >
          <Download size={13} /> Descarcă .ics (Apple Calendar)
        </button>
      </div>
    </div>
  );
};
