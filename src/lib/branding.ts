// Logo-urile oficiale AA, pe program. Victor a furnizat variantele START și
// BUSINESS; aceeași imagine trebuie să apară peste tot unde programul e
// identificat vizual (sidebar, hub, emailuri), nu monograma CSS generică.
import logoStart from '@/assets/aa-logo-start.jpg.asset.json';
import logoBusiness from '@/assets/aa-logo-business.jpg.asset.json';

const LOGOS: Record<string, string> = {
  start: logoStart.url,
  business: logoBusiness.url,
};

// URL relativ (pentru UI). Pentru emailuri folosește courseLogoAbsolute.
export function courseLogo(courseId?: string | null): string | null {
  if (!courseId) return null;
  return LOGOS[courseId] ?? null;
}

// Emailurile au nevoie de URL absolut public; asset-urile sunt servite de pe
// domeniul platformei.
export function courseLogoAbsolute(courseId?: string | null): string | null {
  const rel = courseLogo(courseId);
  return rel ? new URL(rel, 'https://aa.morarvictor.com').href : null;
}
