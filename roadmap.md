# Numbering audit

- [x] Unify lesson and exercise numbers in module lists, lesson pages and contents.
- [x] Verify numbering across START and Business, including unpublished content and introduction 0.0; browser checks passed for lesson/exercise 4.2 and Business module 1.
- [x] Correct remaining exercise headings in student pages, administrator answers and exports to include the module number; START 1.4 and 1.5 verified in the browser without runtime errors, and module-prefix/legacy-title tests passed.

# Window return

- [x] Preserve the current page and scroll position when returning from another window; verified same-user sign-in events and changed-content refresh retain the Date brute tab, URL and scroll position (1400 → 1400), without runtime errors.

# Exercise downloads

- [x] Replace serialized answers with readable questions, lists and tables; verified the connected account’s module export and two printed regression pages, including missing cells, wide worksheets and multiline answers, without clipping.

# Module 5 START visibility

- [x] Publishing a lesson with video now opens its manually locked module; START module 5 verified open in preview.

# Library documents in personal materials

- [x] Show course library uploads in Materialele mele → Documente without a package gate; verified 21 START documents and a valid Word download (HTTP 200) using the signed-in administrator. Enrolled-user database/storage policies already allow all packages; student-session check remains unverified.

# START self-paced module access

- [x] Enable all START modules for Singur while preserving other packages and unpublished lessons; verified Digor's Singur enrollment, all ten modules unlocked and direct module 9 access in his student session. Four regression tests pass; unpublished content remains hidden. Production publication is not requested.

# Weekly module release for every flow

- [x] Modules open one per week from the flow's start date, on Monday at 09:00 Chisinau time, computed for every flow instead of a per-flow counter; verified START Ediția 2 opens „Nișa și Ideea" on 09.11.2026 09:00 while Business Flux 1, Business Flux 2 and START Ediția 1 keep their current access. Eight access-rule tests pass. Production publication is not requested.
- [x] Invitations can be resent per student from the access list and always carry the public site link; sent to Eugen, Viorica and Lira (all three logged as sent).
- [x] Invitații Business Flux 3 + Flux 2 fără cont

# Module 6 START exercises

- [ ] Integrate the three financial workbook exercises after lessons 6.1–6.3, verify forms and lesson navigation, and publish to the student site.
