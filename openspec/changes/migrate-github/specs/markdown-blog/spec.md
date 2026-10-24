## Purpose
Allow authors to maintain readable Markdown articles in GitHub and publish a complete static blog with stable article URLs and automatic deployment.

## ADDED Requirements
### Requirement: Markdown publication
The blog SHALL publish non-draft Markdown articles with titles, categories and dates while preserving homepage search and categories.

#### Scenario: Published article
- WHEN an author builds a valid article with draft false
- THEN its standalone page and homepage entry are generated

#### Scenario: Draft article
- WHEN draft is true
- THEN the article is excluded from build output

### Requirement: Automatic deployment
The repository SHALL build and deploy main branch changes to the approved public Pages hostname.

#### Scenario: Successful main push
- WHEN a valid content update is pushed to main
- THEN Actions builds and deploys the site to ai-sea.github.io
