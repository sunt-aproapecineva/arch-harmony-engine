import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/pages/ModulePage";

export const Route = createFileRoute("/_app/c/$courseSlug/module/$id")({
  head: ({ params }) => ({ meta: [
    { title: `Arhitectura Afacerii · ${params.courseSlug} · Modul ${params.id}` },
    { name: 'description', content: 'Conținutul modulului: lecții, exerciții practice și progresul tău.' },
    { property: 'og:title', content: `Arhitectura Afacerii · ${params.courseSlug} · Modul ${params.id}` },
    { property: 'og:description', content: 'Conținutul modulului: lecții, exerciții practice și progresul tău.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ModulePage,
});
