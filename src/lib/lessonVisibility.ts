/**
 * Regula unică de vizibilitate a lecțiilor unui modul.
 *
 * O lecție video nepublicată (`is_published === false`) se ascunde din listă
 * împreună cu exercițiul care îi urmează — elevul vede doar ce poate parcurge
 * efectiv. Aceeași regulă trebuie aplicată peste tot: lista modulului,
 * navigarea Înapoi/Înainte dintre lecții și calculul progresului. Altfel
 * exercițiile ascunse rămân accesibile din butonul „Înainte" și blochează
 * progresul modulului sub 100%.
 */
export function getVisibleLessons(module: any): any[] {
  const visible: any[] = [];
  let lastVideoPublished = true;
  (module?.lessons || []).forEach((l: any) => {
    if (l.type === 'exercise') {
      if (lastVideoPublished) visible.push(l);
    } else {
      lastVideoPublished = l.is_published !== false;
      if (lastVideoPublished) visible.push(l);
    }
  });
  return visible;
}
