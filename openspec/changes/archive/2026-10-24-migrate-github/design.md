# Design

## Context
Original blog embeds content in a static HTML file.

## Goals / Non-Goals
Preserve design and enable GitHub editing. No database or visual CMS.

## Decisions
Use a small Node static generator to preserve the existing design without a framework migration. Markdown with JSON front matter makes metadata explicit; sanitize generated HTML. Generate standalone article URLs and inject an escaped search index into the homepage. Use the official Pages workflow with locked npm dependencies.

## Risks / Trade-offs
Public repository exposes drafts as source. README documents this. Existing private Sites deployment remains available; rollback uses Git revert.