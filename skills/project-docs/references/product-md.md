# PRODUCT.md Reference

## Purpose

PRODUCT.md is a strategic document placed at the root of a repository that describes the product — what it is, who it's for, what problems it solves, and what success looks like. It is primarily for the internal team: engineers, designers, PMs, and AI agents working on the product.

Unlike a README (which is technical orientation) or product docs (which are user-facing), PRODUCT.md captures the **why and the what** of the product from a product strategy perspective.

## When to choose this doc type

- The team needs a shared understanding of what they are building and for whom
- Engineers are making technical decisions without clear product context
- A new team member needs to understand the product's purpose and direction
- AI agents need product context to make better code and design suggestions
- There is no single document capturing the product's vision, users, and strategy

## Clarifying questions to ask

1. What is the product? (name, one-liner)
2. Who are the users? Be specific — job title, company size, industry, level of technical sophistication
3. What problem does it solve? What does life look like for users before this product exists?
4. What is the core value proposition — what is the ONE thing users get from this that they cannot easily get elsewhere?
5. What does the product NOT do? (what is deliberately out of scope)
6. What does success look like? (key metrics, business goals, user outcomes)
7. What is the current stage? (idea, pre-launch, early users, growth, mature)
8. What are the top 3 priorities for the next quarter?
9. Who are the competitors, and how is this product differentiated?

## PRODUCT.md Template

---

# PRODUCT.md

> Product context for the [Product Name] team. Updated [YYYY-MM].

---

## What is [Product Name]?

[2–4 sentences. Name, what it does, and who it's for. Be specific and concrete. Avoid corporate-speak.]

**Example:** "Acme is a shipment tracking platform for mid-market logistics companies (50–500 employees). It consolidates tracking data from 30+ carriers into a single dashboard and auto-generates customs documentation for cross-border shipments. Our users are logistics coordinators who currently spend 3+ hours/day copying data between carrier websites and spreadsheets."

---

## Users

### Primary User

**Who:** [Job title, company type, company size]
**Sophistication:** [Technical / non-technical / mixed]
**Core job:** [What they're trying to accomplish]
**Current pain:** [What their life looks like without this product — be specific]
**What they get:** [The concrete outcome this product delivers]

### Secondary Users

| User type | Their role | What they need from this product |
| --------- | ---------- | -------------------------------- |
| [Type]    | [Role]     | [Need]                           |

---

## Problem Statement

[The problem this product solves, stated from the user's perspective. Not from our perspective. 3–5 sentences.]

**Example:** "Logistics coordinators at mid-sized companies track shipments across multiple carriers — UPS, FedEx, DHL, regional carriers — each with their own portal. When a shipment is delayed, they have to check each portal individually. When a shipment crosses a border, customs docs have to be generated manually from tracking data. This takes hours and is error-prone. For international shipments, errors cause clearance delays that cost thousands of dollars per incident."

---

## Value Proposition

**Core value:** [1 sentence — the single most important thing we deliver]

We are the only solution that [differentiator] because [reason we can do it / competitors cannot].

---

## What This Product Does NOT Do

[Explicit scope exclusions prevent scope creep and help engineers make the right trade-offs.]

- Does NOT handle freight/LTL — only parcel shipping
- Does NOT manage carrier contracts or rates
- Does NOT replace the user's TMS (we integrate with it)
- Does NOT provide predictive ETAs (on the roadmap, but not in scope yet)

---

## Success Metrics

### North Star Metric

**[Metric name]:** [What it measures and why it matters]

Example: "Shipments tracked per active user per week" — measures core engagement with the product's primary value.

### Key Metrics

| Metric                               | Target   | Current | Trend      |
| ------------------------------------ | -------- | ------- | ---------- |
| Monthly active users                 | 500      | 320     | Up 15% MoM |
| Shipments tracked/day                | 10,000   | 6,200   | Up 8% MoM  |
| Time-to-value (first tracking event) | < 5 min  | 8 min   | Improving  |
| Churn rate                           | < 3% MoM | 4.1%    | Flat       |

---

## Current Stage and Priorities

**Stage:** [Idea / Pre-launch / Early traction / Growth / Mature]

**Top 3 priorities this quarter:**

1. **[Priority 1]** — [Why this, what success looks like]
2. **[Priority 2]** — [Why this, what success looks like]
3. **[Priority 3]** — [Why this, what success looks like]

---

## Competitive Landscape

| Competitor | Their strength         | Our advantage | Who they win with      |
| ---------- | ---------------------- | ------------- | ---------------------- |
| [Name]     | [What they're good at] | [Why we win]  | [Their ideal customer] |

---

## Product Principles

[3–5 principles that guide design and engineering trade-offs. These should be opinionated — things that differentiate us from alternatives.]

1. **[Principle name]:** [What it means in practice]
2. **[Principle name]:** [What it means in practice]
3. **[Principle name]:** [What it means in practice]

---

## Key Decisions Made

[Brief log of major product decisions. Not as detailed as ADRs — just enough to understand direction.]

- **[Decision]:** [Why, date]
- **[Decision]:** [Why, date]

---

## Related Documents

- [README](README.md) — Technical orientation
- [Architecture](docs/architecture.md) — System design
- [Roadmap](docs/roadmap.md) — Upcoming features
- [User Research](docs/research/) — User interviews and insights

---

## Quality Checklist

Before finishing:

- [ ] Users are described with specificity (not just "enterprises" or "developers")
- [ ] Problem statement is written from user's perspective, not company's
- [ ] Out-of-scope items are explicit
- [ ] Success metrics are measurable (not "improve user satisfaction")
- [ ] Current stage is named
- [ ] Top priorities are listed with rationale
- [ ] Competitive differentiation is specific (not "we're faster and cheaper")
