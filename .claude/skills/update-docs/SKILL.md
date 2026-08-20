---
name: update-docs
description: Regenerate Beechclub's governing-document PDFs (Operating Agreement, Club Rules) from a Google Doc source and keep the club officer roster on about.html in sync. Use when the user shares/updates a Google Doc link for the Operating Agreement or Club Rules, or tells you officer names/roles directly (e.g. "the treasurer is X", "add me as safety officer").
---

# Update Beechclub governing docs

This repo has no build step and no CMS — `documents.html` links to static
PDFs in `assets/documents/`, and the officer roster is hand-written HTML in
`about.html`. This skill is the repeatable procedure for regenerating those
from source instead of re-deriving the approach each time.

## When to use this

- The user pastes/updates a Google Doc link for the **Operating Agreement**
  or **Club Rules**.
- The user tells you officer info directly ("president is X", "add a safety
  officer, me, Shane Torgerson").
- Anything else changes in the source docs (dues, revision number, approved
  instructors, etc.) that should be reflected on the site.

## Source of truth vs. site copy

- The governing-document **PDFs** (`assets/documents/*.pdf`) are re-typeset
  copies of the actual legal documents. Only regenerate them from an actual
  Google Doc the user gives you — never hand-edit their content, and never
  invent numbers/rules that aren't in the source.
- The **officer roster on about.html** is marketing/info copy, not the legal
  record. It's fine to update it directly from what the user tells you in
  chat, even if that hasn't made it into the Club Rules doc yet. If the two
  disagree (e.g. Club Rules PDF still lists an old officer), say so — don't
  silently overwrite the PDF's content to match, since that PDF is supposed
  to mirror the actual signed/shared document.
- Per `CLAUDE.md`: never invent a name for a role you don't have real data
  for. Leave it as "Name TBD" (or whatever the existing placeholder is)
  instead.

## Procedure: regenerating a doc PDF from a Google Doc link

1. **Fetch text, not binary.** Use the Google Drive MCP's
   `read_file_content` (not `download_file_content`) to get the doc's plain
   text/markdown. `download_file_content` returns a base64 blob that has to
   be hand-copied through the Write tool to reach disk — for anything but a
   trivially short file this reliably gets truncated (the base64 length
   ends up not a multiple of 4) and produces a corrupt docx. Don't repeat
   that mistake.
2. **Clean the text.** Google's markdown export leaves artifacts: stray
   `<!-- end list -->` comments, backslash-escaped characters (`\_`, `\*`),
   and list numbering that resets oddly. Rewrite it as tidy Markdown by
   hand — headings (`#`/`##`/`###`), bullet/numbered lists, and pipe tables
   for anything tabular. Preserve the actual legal text verbatim; only the
   markup gets cleaned up.
3. **Convert markdown → HTML.** `pip install markdown` (already available
   in this environment) with the `tables` extension. Wrap the output in a
   small inline `<style>` block matching the site's palette (navy `#0f2d4a`
   / `#163f66`, gold `#e0a527` accents on `<hr>`/headings) so the PDF looks
   intentional, not like raw markdown.
4. **Convert HTML → PDF with weasyprint, not LibreOffice.**
   `pip install weasyprint` then `weasyprint.HTML(path).write_pdf(out)`.
   `soffice --headless --convert-to pdf` was tried first in this sandbox
   and reliably hung/failed (missing profile, no display) — don't spend
   time retrying it, go straight to weasyprint.
5. **Sanity-check the PDF** before wiring it up — e.g. extract text with
   `pdfplumber` and confirm the heading/officer names look right and the
   page count is sane (a multi-article legal doc should be several pages,
   not one).
6. **Save to `assets/documents/<slug>.pdf`** (e.g. `operating-agreement.pdf`,
   `club-rules.pdf` — match the existing filenames if regenerating one that
   already exists, so the link in `documents.html` doesn't need to change).
7. **Update `documents.html`**: point the card's `<a>` at the PDF (remove
   the disabled/"coming soon" state if present), and refresh the one-line
   description and revision date from the doc if they changed.
8. **Sync the officer roster.** Club Rules typically has a "Current Club
   Officers" section — cross-check it against the officer grid in
   `about.html` (`<section>` with `.eyebrow` "Leadership") and update names
   there too, per the source-of-truth rules above.

## Procedure: officer changes from chat alone (no doc link)

1. Find the officer grid in `about.html` (`grid grid-3` under the
   "Leadership" section-head, one `.card.text-center` per officer with an
   `<h3>` role and `<p>` name).
2. Update the existing card's `<p>`, or add a new `.card.text-center` in
   the same pattern if it's a new role. The grid wraps fine with 4+ cards.
3. Don't touch the governing-document PDFs for this — see source-of-truth
   note above.

## After changes

Follow the repo's normal git workflow (see root `CLAUDE.md` / the active
session's branch instructions): commit with a message describing what
changed and why (new revision, new officer, etc.), then push. Don't create
a PR unless asked.
