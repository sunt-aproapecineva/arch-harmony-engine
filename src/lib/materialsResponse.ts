// Browser-safe presentation only: saved responses are never modified.
type Field = { id?: string; label?: string; text?: string; title?: string; type?: string; columns?: string[] };
type Template = { fields?: Field[]; items?: Field[]; questions?: Field[]; situations?: Field[]; dmReflection?: Field[] };

export function escapeMaterial(value: unknown): string {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fieldFor(template: Template | undefined, key: string): Field | undefined {
  return [template?.fields, template?.items, template?.questions, template?.situations, template?.dmReflection]
    .flatMap(fields => fields ?? []).find(field => field.id === key);
}

function labelFor(template: Template | undefined, key: string): string {
  const field = fieldFor(template, key);
  return field?.label || field?.text || field?.title || key.replace(/[_-]+/g, ' ').replace(/^./, c => c.toUpperCase());
}

function structuredValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  // Only decode objects/arrays. Ordinary text, dates and numeric strings stay intact.
  if (!((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}')))) return value;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return parsed !== null && typeof parsed === 'object' ? parsed : value;
  } catch { return value; }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function renderMaterialResponse(raw: unknown, template?: Template, field?: Field): string {
  const value = structuredValue(raw);
  const empty = '<span class="mat-empty">Fără răspuns</span>';
  if (value == null || value === '') return empty;
  if (typeof value === 'boolean') return value ? 'Da' : 'Nu';
  if (typeof value === 'number') return escapeMaterial(value);
  if (typeof value === 'string') {
    if (/^https?:\/\//.test(value)) return `<a href="${escapeMaterial(value)}">${escapeMaterial(value)}</a>`;
    return escapeMaterial(value).replace(/\n/g, '<br/>');
  }
  if (Array.isArray(value)) {
    if (!value.length) return empty;
    if (value.every(isRecord)) {
      // Rândurile goale ale foii (ex. {} necompletate) nu se afișează.
      value = value.filter(row => Object.values(row).some(v => v != null && String(v).trim() !== ''));
      if (!value.length) return empty;
      const savedKeys = [...new Set(value.flatMap(row => Object.keys(row)))];
      const columns = [...(field?.columns ?? []), ...savedKeys.filter(key => !field?.columns?.includes(key))];
      if (!columns.length) return empty;
      // Wide worksheets become numbered records instead of cramped A4 columns.
      if (columns.length > 4) return `<div class="mat-records">${value.map((row, index) => `<div class="mat-record"><div class="mat-record-number">${index + 1}.</div>${columns.map(key => `<div class="mat-field"><div class="mat-field-label">${escapeMaterial(labelFor(template, key))}</div><div class="mat-field-value">${renderMaterialResponse(row[key], template)}</div></div>`).join('')}</div>`).join('')}</div>`;
      const header = columns.map(key => `<th scope="col">${escapeMaterial(labelFor(template, key))}</th>`).join('');
      const rows = value.map(row => `<tr>${columns.map(key => `<td>${renderMaterialResponse(row[key], template)}</td>`).join('')}</tr>`).join('');
      return `<table class="mat-table"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`;
    }
    return `<ul class="mat-list">${value.map(item => `<li>${renderMaterialResponse(item, template)}</li>`).join('')}</ul>`;
  }
  if (isRecord(value)) {
    const entries = Object.entries(value).filter(([, answer]) => answer !== undefined);
    const order = (template?.fields ?? []).map(item => item.id);
    entries.sort(([a], [b]) => {
      const ai = order.indexOf(a), bi = order.indexOf(b);
      return (ai < 0 ? order.length : ai) - (bi < 0 ? order.length : bi);
    });
    if (!entries.length) return empty;
    return entries.map(([key, answer]) => `<div class="mat-field"><div class="mat-field-label">${escapeMaterial(labelFor(template, key))}</div><div class="mat-field-value">${renderMaterialResponse(answer, template, fieldFor(template, key))}</div></div>`).join('');
  }
  return escapeMaterial(value);
}