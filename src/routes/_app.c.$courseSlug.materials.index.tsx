import { createFileRoute } from "@tanstack/react-router";
import { MaterialsPage } from "@/pages/MaterialsPage";

export const Route = createFileRoute("/_app/c/$courseSlug/materials/")({
  head: () => ({ meta: [
    { title: 'Materialele mele · Arhitectura Afacerii' },
    { name: 'description', content: 'Răspunsurile, notițele și documentele programului tău Arhitectura Afacerii.' },
    { property: 'og:title', content: 'Materialele mele · Arhitectura Afacerii' },
    { property: 'og:description', content: 'Documente, șabloane și materiale personale de curs.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: MaterialsPage,
});
