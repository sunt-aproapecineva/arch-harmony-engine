# Architecture rules

- Use `src/lib/lessonNumbering.ts` for displayed lesson and exercise numbers: video positions exclude exercises and publication state, while explicit workbook exercise numbers take precedence, so lists, pages and exports agree without changing saved IDs.