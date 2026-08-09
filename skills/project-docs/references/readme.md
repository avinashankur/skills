# README Reference

## Purpose

The README is the front door of a repository. It is read by strangers who found the repo on GitHub, new team members getting oriented, and potential contributors evaluating whether to use or contribute to the project. It must answer in under 90 seconds: "What is this? Can I use it? How do I get started?"

A README is NOT exhaustive documentation. It is an orientation and a pointer to deeper resources.

## When to choose this doc type

- New repository needs a README
- Existing README is outdated, thin, or confusing
- User wants to open-source a project and needs a professional README
- Project README doesn't match the current state of the codebase

## Clarifying questions to ask

1. What does this project do? (1 sentence — the elevator pitch)
2. Who is the audience? (other developers, end users, internal team only, public open source)
3. What is the primary language/tech stack?
4. Is there a hosted demo or docs site?
5. What are the install and run steps? (dependency manager, env vars, commands)
6. Does it have tests? How do you run them?
7. Is there a contributing guide or code of conduct?
8. What license is it under?
9. What tone? (professional enterprise, friendly open source, terse internal tool)

## README Template

---

# [Project Name]

> [One-sentence tagline — what it does and who it's for.]

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/org/repo/ci.yml)](https://github.com/org/repo/actions)

[Optional: screenshot or demo GIF if it has a UI]

---

## What is this?

[2–4 sentences. Expand on the tagline. What problem does it solve? What makes it different from alternatives?]

## Features

- [Key feature 1 — written from user value perspective]
- [Key feature 2]
- [Key feature 3]

## Quick Start

### Prerequisites

- [Runtime/language version] (e.g., Node.js >= 20, Python >= 3.11)
- [Other required tools]

### Installation

`ash

# Clone the repo

git clone https://github.com/org/repo.git
cd repo

# Install dependencies

npm install # or: pip install -r requirements.txt

# Set up environment

cp .env.example .env

# Edit .env with your values

`

### Run

`ash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
`

App runs at http://localhost:3000

---

## Configuration

| Variable     | Required | Default | Description                  |
| ------------ | -------- | ------- | ---------------------------- |
| DATABASE_URL | Yes      | —       | PostgreSQL connection string |
| PORT         | No       | 3000    | Server port                  |
| LOG_LEVEL    | No       | info    | debug, info, warn, error     |

---

## Running Tests

`ash
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:e2e         # End-to-end tests
`

---

## Project Structure

`src/
  api/        - Route handlers
  services/   - Business logic
  models/     - Database models
  utils/      - Shared utilities
tests/
docs/`

---

## Documentation

- [Full documentation](https://docs.example.com)
- [API Reference](docs/api.md)
- [Architecture](docs/architecture.md)
- [Changelog](CHANGELOG.md)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. PRs are welcome.

---

## License

[MIT](LICENSE) — see the LICENSE file for details.

---

## Variant: Internal Tool README

For internal tooling (not open source), simplify the template:

- Remove badges and license
- Add: "Owner: [team/person]", "Slack: #channel-name"
- Add: "Support: [who to contact when it breaks]"
- Focus on: What it does, how to run it, known gotchas

## Quality Checklist

Before finishing:

- [ ] First sentence passes the "what is this" test with no prior context
- [ ] Install steps are complete and copy-pasteable
- [ ] All required env vars are listed
- [ ] Test command is present
- [ ] Links to deeper docs are included
- [ ] Project structure is explained (if non-obvious)
- [ ] No placeholder text left in the template
