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

- [x] Integrated the three financial workbook exercises after lessons 6.1–6.3; 10 tests passed, signed-in browser verified all forms, saved answer readback and Next navigation without runtime errors; publication requested for aa.morarvictor.com.

# Module 7 START exercises

- [x] Integrated workbook exercises 7.1–7.2 beside their published lessons and opened Module 7 for both AA START editions, including an immediate Edition 2 override. Thirteen regression tests passed; signed-in browser checks confirmed both forms, scorecard/review fields and saved-answer readback without runtime errors.

# ClickUp student mentoring sync

- [x] Create one student task with one subtask per course module and readable exercise answers in each subtask.
- [x] Sync exercise submissions automatically and publish/update the student's briefing as a task comment; the targeted server path updated only the affected module, and a separate student-session test was not run because the temporary-user request was declined.
- [x] Add per-student ClickUp sync controls in Admin → Utilizatori.
- [x] Respect the full selected course/flow/tariff filter when regenerating briefings in bulk, including visible students in Înainte de apel.
- [x] Verified the existing test student's real ClickUp task: 10 module subtasks, readable test answers, stable task/comment IDs after repeated sync, and no duplicate briefing comment.

# ClickUp existing-student merge

- [x] Inventory START Flux 2 and Business Flux 3 Q&A tasks, student tasks, duplicates, tags and comments: 14 Business duplicate pairs, Andrei without an old Q&A task, Eugeniu with three copies of each module.
- [x] Reuse the Q&A student tasks and merge platform context without removing mentor notes; all 15 Business students are active under Q&A, and Eugeniu's retained START task includes his original description.
- [x] Preserve tariff/access/issue tags and copy the nine existing comments for Melega, Elena and Triboi with original author/date in the text. Closed and labelled 34 duplicates without deleting content: 15 student tasks and 19 START module tasks; canonical module answers and all comments were checked first.
- [x] Update automatic sync so it reuses existing student/module tasks, preserves mentor descriptions and places START Flux 2/Business Flux 3 students under Q&A; regression tests pass and real ClickUp results were read back.

# Business notification review

- [x] The screenshot showed the START Edition 2 live announcement on Business Flux 3. The announcement itself was correctly targeted to `start-f2`; the unscoped query returned it because admins may read every flow's announcements.
- [x] Scope both the student banner and Admin notification preview to the selected flow plus global announcements, clear stale banners on flow change and retain a defensive flow check. Verified Business Flux 3 no longer shows the START banner in the signed-in preview; nine targeted tests pass and the preview build is OK.
