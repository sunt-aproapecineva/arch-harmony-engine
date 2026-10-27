# Architecture rules

- Use `src/lib/lessonNumbering.ts` for displayed numbers and exercise headings, including administrator answers and exports: the prefix always comes from the module, video positions exclude exercises and publication state, and explicit workbook exercise suffixes take precedence, so all views agree without changing saved IDs.
- Refresh same-user authentication and live content without unmounting the route tree; consume content versions through CourseContext so window-return updates preserve tabs, drafts, players and scroll while real identity changes still gate access.
- Persist admin student-profile tab and scroll in sessionStorage per student, because mobile browsers may reload backgrounded tabs and in-memory state is lost.
- Use uploaded asset pointers resolved to absolute public HTTPS URLs for email images, because email clients cannot load relative paths or unpublished static files.
- Render material answers through the browser-safe materialsResponse formatter using template field metadata; decode structured values only for presentation so exported worksheets remain readable without changing saved responses.
- Publishing a video lesson unlocks its manually locked module (overlay in LiveContentContext), so admins never need a separate module-open step.
- Reuse LibraryUploads in read-only mode for MaterialsPage documents; keep course-scoped database and storage policies so student downloads use the same files without granting anonymous access.
- Resolve self-paced module access from course tier capabilities in CourseContext using enrollment-scoped module copies; central flow gates honor this override without mutating shared content or bypassing lesson publication and enrollment expiry.
