# Architecture rules

- Use `src/lib/lessonNumbering.ts` for displayed numbers and exercise headings, including administrator answers and exports: the prefix always comes from the module, video positions exclude exercises and publication state, and explicit workbook exercise suffixes take precedence, so all views agree without changing saved IDs.
- Refresh same-user authentication and live content without unmounting the route tree; consume content versions through CourseContext so window-return updates preserve tabs, drafts, players and scroll while real identity changes still gate access.