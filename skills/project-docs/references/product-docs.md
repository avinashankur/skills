# Product Documentation (User-Facing) Reference

## Purpose

Product documentation helps users accomplish their goals with the product. It is written for non-technical or semi-technical users who are trying to use the product, not build it. The goal is task completion, not technical completeness.

Product docs cover:

- Feature guides (how to use a specific feature)
- Getting started / onboarding guides
- How-to articles ("how do I...?" questions)
- Concept explanations (what is X, how does Y work)
- Troubleshooting guides
- Changelogs / release notes
- FAQs

## Distinction from Technical Docs

| Product Docs                 | Technical Docs          |
| ---------------------------- | ----------------------- |
| User-facing                  | Developer-facing        |
| Task-oriented                | Reference-oriented      |
| Friendly, approachable tone  | Precise, neutral tone   |
| "Click the Settings button"  | "POST /api/v1/settings" |
| Screenshots and walkthroughs | Code examples           |

## When to choose this doc type

- User wants to document how to use a feature, workflow, or product area
- Creating help center / knowledge base content
- Writing onboarding documentation for new users
- Creating a FAQ or troubleshooting guide
- Writing a changelog or release notes

## Clarifying questions to ask

1. Who is the user? (technical sophistication, role, goal)
2. What are they trying to accomplish with this doc?
3. Which product area or feature does this cover?
4. What platform/format will this live in? (help center like Intercom/Notion/Confluence, docs site, in-app tooltip, PDF)
5. Do you have screenshots or UI elements to reference?
6. What does the user look like at the START of this doc (what's their state/context)?
7. What does success look like at the END of this doc (what can they do after reading)?

---

## Doc Type Subtemplates

### Getting Started Guide

The most important product doc. Must get a user from zero to first value as fast as possible.

Structure:
`

# Getting Started with [Product Name]

## What you'll set up

[1-2 sentences. What will the user have working by the end?]

## Before you begin

[Prerequisites — things they need to have, accounts to create, access required]

## Step 1: [First concrete action]

[Screenshot if helpful]
[What happens after this step — confirmation, what they see]

## Step 2: [Next action]

...

## You're set up!

[Confirm what they've accomplished. Link to what's next.]
`

### Feature Guide

Explains how a specific feature works and how to use it.

Structure:
`

# [Feature Name]

## What it does

[1-2 sentences. User value, not technical description.]

## When to use it

[Use cases — real examples of when a user would reach for this]

## How to use it

### [Task 1]

[Steps, screenshot]

### [Task 2]

[Steps, screenshot]

## Tips

[Non-obvious things that make it work better]

## Limitations

[What it cannot do — set expectations proactively]

## Related features

[Links to related docs]
`

### How-To Article

Answers a specific "how do I...?" question.

Structure:
`

# How to [Accomplish X]

[One sentence: what this guide covers and who it's for]

## Steps

1. [Action]
   [Screenshot if helpful]
2. [Action]

3. [Action]
   [Expected result]

## Done

[What they've accomplished. What to do next.]

## Troubleshooting

[2-3 most common problems and fixes]
`

### Troubleshooting Guide

`

# Troubleshooting: [Topic]

## [Error message or symptom]

**What's happening:** [Plain-language explanation of why this happens]
**Fix:** [Step-by-step]
**Still stuck?** [Contact support / next escalation]

---

## [Next issue]

...
`

### Changelog / Release Notes

`

# [Version or Date] — [Short theme of this release, e.g., "Performance and Bulk Actions"]

## New

- **[Feature name]:** [What it does, why it matters to users]
- **[Feature name]:** [...]

## Improved

- [What was improved and how it affects users]

## Fixed

- [Bug that was fixed, with user-facing description — not internal ticket IDs]

## Breaking changes

- [If applicable: what changed, what users need to do]
  `

---

## Writing Style for Product Docs

### Voice and tone

- **Friendly but efficient.** Not casual to the point of imprecision.
- **Direct.** "Click Save" not "You will want to click on the Save button".
- **Present tense.** "The page shows..." not "The page will show..."
- **Active voice.** "Select the file" not "The file should be selected."

### Action words for steps

Use these consistently:

- Click / Select (UI elements)
- Type / Enter (text input)
- Toggle / Enable / Disable (switches)
- Navigate to / Go to (routing)
- Open / Close (panels, modals)

### Screenshots

- Annotate with arrows or callouts — don't make users hunt for what to click
- Capture the exact UI state the user will see (not your dev environment)
- Use alt text for accessibility

### Formatting rules

- Number steps (1, 2, 3) for sequential procedures
- Use bullet points for non-sequential information
- Bold UI element names: **Save**, **Settings**, **Add Member**
- Use code formatting for: values to type, keyboard shortcuts, file names

---

## Quality Checklist

Before finishing:

- [ ] Written from user's goal perspective, not feature inventory perspective
- [ ] Assumes minimal prior knowledge about the product (or states clearly what's assumed)
- [ ] Steps are numbered and each step has exactly one action
- [ ] Expected results are shown after key steps
- [ ] Screenshots planned for key UI interactions
- [ ] Troubleshooting section covers the 2-3 most common failure modes
- [ ] Links to related docs at the end
- [ ] No unexplained jargon or product-internal names
