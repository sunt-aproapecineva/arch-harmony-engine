// Materials shown in the /library section. Article bodies live in
// src/pages/library/articles/* and are wired via `slug` below.

export type LibraryItemType = 'article' | 'video' | 'tool' | 'caz';
export type LibraryAccent = 'green' | 'gold' | 'red' | 'cream';

export interface LibraryItem {
  slug: string;
  title: string;
  summary: string;
  readingTime?: string;   // e.g. "12 min de lectură"
  type: LibraryItemType;
  accent: LibraryAccent;
  // bento layout — controls grid span. 'wide' = 2 cols, 'tall' = 2 rows, 'feature' = 2x2
  span?: 'wide' | 'tall' | 'feature' | 'normal';
  topic?: string;
  available: boolean;
  eyebrow?: string;
}

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    slug: 'cum-angajam-corect',
    title: 'Cum angajăm corect.',
    summary:
      '5 capcane mentale, 6 greșeli ale angajărilor haotice, 4 criterii de selecție și diferența reală dintre angajat și outsource — notițe esențiale din sesiunea live cu Victor Morar.',
    readingTime: '14 min de lectură',
    type: 'article',
    accent: 'gold',
    span: 'feature',
    topic: 'Angajare & Echipă',
    eyebrow: 'Sesiune Live · Practicum',
    available: true,
  },
  // Placeholders pentru viitoare materiale — își păstrează spațiul în bento
  {
    slug: '__soon-1',
    title: 'Următorul material — în curând',
    summary: 'Lecții suplimentare, studii de caz și instrumente bonus vor apărea aici.',
    type: 'article',
    accent: 'cream',
    span: 'normal',
    available: false,
  },
  {
    slug: 'ghid-miro-fluxuri',
    title: 'Ghid Miro · Fluxuri Vizuale',
    summary:
      'Cum construiești pas cu pas un flux vizual pe coloane per rol în Miro — flux liniar și flux decizional, pregătire, conexiuni, paralele, criteriu de calitate, partajare. Companion pentru Exercițiul 4 al Săptămânii 4.',
    readingTime: '8 min de lectură',
    type: 'article',
    accent: 'green',
    span: 'wide',
    topic: 'Procese & Sisteme',
    eyebrow: 'Săptămâna 4 · Ghid practic',
    available: true,
  },
  {
    slug: '__soon-3',
    title: 'Studii de caz reale',
    summary: 'Cum aplică antreprenorii românilor sistemele AA.',
    type: 'caz',
    accent: 'red',
    span: 'normal',
    available: false,
  },
];

export function getLibraryItem(slug: string): LibraryItem | undefined {
  return LIBRARY_ITEMS.find((i) => i.slug === slug);
}

export const LIBRARY_ACCENT: Record<LibraryAccent, { fg: string; bg: string; border: string }> = {
  green:  { fg: '#7ad6a6', bg: 'rgba(26,92,56,0.10)',  border: 'rgba(122,214,166,0.35)' },
  gold:   { fg: '#d8b97a', bg: 'rgba(201,169,110,0.10)', border: 'rgba(201,169,110,0.40)' },
  red:    { fg: '#e08585', bg: 'rgba(139,26,26,0.10)',  border: 'rgba(224,133,133,0.32)' },
  cream:  { fg: '#EDE8DF', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)' },
};
