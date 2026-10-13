# Technical Writing Standards

Documentation should sound like an experienced engineer explaining a system to a teammate at a whiteboard: clear, practical, direct, and focused on real system behavior.

## 1. Zero Em Dashes

Never use em dashes (`—`). Em dashes are the most obvious signature of AI slop.

- Replace them with commas, periods, colons, or parentheses.
- If a sentence requires multiple dashes to feel complete, rewrite it into simpler sentences.

**Bad (AI slop):**
> The ingest service processes incoming events—parsing payload metadata—before writing to Kafka.

**Good (Engineer):**
> The ingest service parses payload metadata from incoming events, then writes them to Kafka.

## 2. Sound Like an Engineer

Write directly and simply. Do not inflate language or perform fake enthusiasm.

- **Ban AI vocabulary:** Never use `delve`, `testament`, `pivotal`, `seamless`, `tapestry`, `underscores`, `leverage`, `foster`, `vital`, `vibrant`, `holistic`, `furthermore`, or `game-changer`.
- **Use simple copulas:** Use `is`, `are`, and `has`. Avoid copula avoidance phrasing like `serves as`, `stands as`, `boasts`, or `features`.
- **Cut introductory throat-clearing:** Skip lines like "In this document, we will explore..." or "Let's dive into the details." Start immediately with the architecture, command, or explanation.
- **No superficial `-ing` participle clauses:** Do not glue vague participle phrases to the ends of sentences (e.g., "...highlighting its scalability", "...ensuring optimal alignment"). State the concrete mechanism or stop the sentence.
- **Avoid negative parallelisms:** Cut phrases like "It's not just about speed, it's about reliability." State the fact: "The service prioritizes reliability over speed."

## 3. Always Stop on Ambiguity (Doc is the Source of Truth)

The documentation is the source of truth: it defines the system's specification, intended contract, and architecture. The codebase is an implementation that may have bugs, omissions, or drift.

This rule is **always on** across all documentation modes.

- **Doc vs. code conflict:** When the doc or specification says one thing and the code says something else, **STOP immediately**.
- **The doc is the source of truth:** Never assume code is correct and silently overwrite doc specifications to match buggy or drifting code. The doc defines what the system is supposed to do.
- **Do not compromise silently:** Never paper over the gap, guess user intent, or write vague compromise text.
- **Surface the discrepancy:** State the exact document specification and where the code diverges, then ask for a decision:
  > "The documentation specifies that expired tokens return HTTP 403 Forbidden, but `src/auth/jwt.ts:45` currently returns HTTP 401 Unauthorized. Is the code lagging or buggy, or should the document specification be updated?"
- **Zero phantom guessing:** If there is ambiguity between what the documentation prescribes and what the code does, pause and resolve it with the user before writing.

## 4. Pre-Flight Quality Checklist

Run this quick check before outputting any document:

- [ ] Zero em dashes anywhere in the document.
- [ ] Language is plain, direct, and free of AI buzzwords.
- [ ] No throat-clearing intros or tacked-on `-ing` participle clauses.
- [ ] Headings follow a strict hierarchy and essentials are front-loaded.
- [ ] Stopped and flagged any ambiguity between doc specifications and code implementations.
