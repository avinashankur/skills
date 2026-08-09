# How-To Guide Reference

## Purpose

A how-to guide walks a developer through a specific, repeatable task. It is procedural and goal-oriented: the reader arrives with a specific thing they want to accomplish and leaves having done it. How-tos are written calmly, at a desk, for everyday work — not under incident pressure.

How-tos are NOT:

- Explanations of why (that's an ADR or concept doc)
- Emergency procedures (that's a runbook)
- User-facing instructions (that's product docs)
- Reference material (that's API docs)

A how-to answers: "How do I do X?" — and nothing else.

## When to write one

- A task is done repeatedly by multiple team members (setup, migration, configuration)
- A new engineer would need to ask someone how to do it
- The procedure has more than 3 steps and at least one non-obvious step
- The team has tribal knowledge that should be written down
- A post-mortem identified "nobody knew how to do X" as a problem

Do NOT write a how-to for:

- One-time operations (just do it and document the result in an ADR)
- Tasks that are trivial and obvious from the code
- Emergency response (use a runbook)
- Conceptual explanations that aren't procedural (use a concept doc)

## Clarifying questions to ask

1. What task does this guide cover?
2. Who is the audience? (new engineer, DevOps, any developer)
3. What does the reader need before starting? (access, tools, prior knowledge)
4. What does "done" look like?
5. Are there common mistakes or gotchas?
6. How often is this task performed? (daily, weekly, per-feature, once per project)

## File naming convention

Kebab-case, descriptive, prefixed with `how-to-`:

- `how-to-setup-local-ssl.md`
- `how-to-run-database-migrations.md`
- `how-to-add-a-new-api-endpoint.md`
- `how-to-configure-feature-flags.md`
- `how-to-onboard-a-new-service.md`

No numbering — how-tos are independent and don't need sequential ordering.

## How-To Template

---

# How to [Do the Thing]

> **Audience:** [Who this is for]
> **Time required:** [Estimate]
> **Last verified:** YYYY-MM-DD

## Prerequisites

- [Tool or access required]
- [Prior knowledge assumed]
- [Environment setup needed]

## Steps

### 1. [First action]

[Exact command or instruction]

```bash
# command here
```

Expected result: [What the reader should see after this step]

### 2. [Next action]

[Instruction]

### 3. [Next action]

[Instruction]

## Verify it worked

[How to confirm the task is complete — a command, a URL to check, an expected output]

```bash
# verification command
```

## Troubleshooting

| Problem   | Cause            | Fix          |
| --------- | ---------------- | ------------ |
| [Symptom] | [Why it happens] | [What to do] |
| [Symptom] | [Why it happens] | [What to do] |

## Related

- [Link to related how-to, runbook, or architecture doc]

---

## Distinction from Other Doc Types

| How-To                       | Runbook                             | Concept            | ADR                    |
| ---------------------------- | ----------------------------------- | ------------------ | ---------------------- |
| Everyday task                | Emergency response                  | Deep explanation   | Decision record        |
| "How do I set up X?"         | "The system is down, what do I do?" | "How does X work?" | "Why did we choose X?" |
| Calm, at your desk           | Under pressure, something is broken | Learning, studying | Decision time, once    |
| Updated when process changes | Updated after incidents             | Rarely changes     | Immutable              |

## Writing Style for How-Tos

- **Imperative, second person.** "Run this command", "Open the file", not "One should run" or "The developer will need to".
- **One action per step.** Don't combine two things. If step 3 has two commands, make it step 3 and step 4.
- **Show the command AND the result.** For every command, show what success looks like. This prevents "I ran it but I don't know if it worked."
- **No background theory.** If the reader needs to understand WHY before they can do the task, link to a concept doc. The how-to is purely procedural.
- **Keep it current.** A how-to with stale commands is worse than no how-to. Include a "Last verified" date.
- **Troubleshooting is mandatory.** Every how-to must have at least 2 common failure modes and their fixes.

## Quality Checklist

Before finishing:

- [ ] Title starts with "How to" and is specific
- [ ] Prerequisites are complete — nothing assumed
- [ ] Every step has exactly one action
- [ ] Commands are copy-pasteable (no unexplained placeholders)
- [ ] Expected results are shown after key steps
- [ ] Verification section confirms the task is done
- [ ] Troubleshooting covers at least 2 common failures
- [ ] "Last verified" date is set
- [ ] No background theory — only links to concept docs if needed
