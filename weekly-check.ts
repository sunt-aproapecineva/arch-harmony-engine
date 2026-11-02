import { getCourseModules } from './src/lib/content/index';
import { isModuleUnlocked, moduleUnlockDate } from './src/lib/flows';

const flows = [
  { id: 'business-f1', course_id: 'business', name: 'Business Fluxul 1', starts_on: '2026-05-18', open_modules: null },
  { id: 'business-f2', course_id: 'business', name: 'Business Fluxul 2', starts_on: '2026-09-01', open_modules: null },
  { id: 'start-f1', course_id: 'start', name: 'START Ediția 1', starts_on: '2026-09-01', open_modules: null },
  { id: 'start-f2', course_id: 'start', name: 'START Ediția 2', starts_on: '2026-11-02', open_modules: null },
];

const now = new Date();
console.log('now (UTC):', now.toISOString(), '\n');

for (const flow of flows) {
  const mods = getCourseModules(flow.course_id);
  const open = mods.filter(m => isModuleUnlocked(m, flow, now));
  const locked = mods.filter(m => !isModuleUnlocked(m, flow, now));
  const next = locked
    .map(m => ({ m, at: moduleUnlockDate(m, flow) }))
    .filter(x => !!x.at)
    .sort((a, b) => a.at!.getTime() - b.at!.getTime())[0];
  console.log(`${flow.name} (start ${flow.starts_on}) — deschise: ${open.length}/${mods.length}`);
  console.log('  deschise:', open.map(m => m.title).join(' | ') || 'niciunul');
  if (next) {
    console.log('  următorul:', next.m.title, '→', next.at!.toISOString(),
      '(ora Moldovei:', next.at!.toLocaleString('ro-RO', { timeZone: 'Europe/Chisinau' }), ')');
  } else {
    console.log('  următorul: niciunul cu dată (rămâne doar blocaj manual)');
  }
  console.log('');
}
