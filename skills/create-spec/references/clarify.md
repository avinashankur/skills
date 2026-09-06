# Spec Clarification & Gap Analysis Guide

## Purpose

The **Clarification Phase** inspects a drafted `spec.md` for ambiguities, hidden assumptions, and missing edge cases *before* any technical planning or coding occurs.

AI coding agents struggle most when given imprecise instructions. Clarifying the specification upfront prevents hours of debugging and rework.

---

## The 4 Gap Detection Heuristics

When reviewing a `spec.md`, systematically check for these four warning signs:

### 1. Fuzzy Verbs (The Ambiguity Trap)
Flag any requirement that relies on vague verbs without defining the mechanics:
- 🚩 *"The system processes the order."*
  - **Clarification:** What are the exact state transitions? Does "process" mean validate, charge the card, decrement inventory, or all three? Who handles partial failures?
- 🚩 *"The service handles authentication errors."*
  - **Clarification:** Does it redirect to `/login`, return HTTP 401 with a specific JSON body, or refresh the token automatically?
- 🚩 *"The worker syncs data with Stripe."*
  - **Clarification:** Is it one-way or two-way? What is the conflict resolution rule? What happens if Stripe's webhook arrives out of order?

### 2. Under-specified Nouns
Flag generic references that conceal schema complexity:
- 🚩 *"Accepts user data"* → Exactly which fields? Which are required vs. optional? What are the length and character constraints?
- 🚩 *"Returns an error"* → What HTTP status code? What error code enum? What is the message?

### 3. Missing Negative & Edge Branches
Ensure every happy path has corresponding failure scenarios:
- What if the external API returns 500 or times out after 10 seconds?
- What if a user submits the identical request twice within 200ms (idempotency & race conditions)?
- What if the record being updated was already deleted by another user?
- What if the user is authenticated but does not possess tenant-level permissions?

### 4. Unstated Invariants & Boundaries
- Is there a rate limit or payload size ceiling?
- What time zone are timestamps stored and returned in?
- Is soft deletion required, or hard cascade deletion?

---

## Interrogation Protocol

When running `/create-spec clarify <feature>`:

1. **Read `spec.md` and `specs/constitution.md` thoroughly.**
2. **Identify 2 to 4 highest-risk gaps.** Do not overwhelm the user with 15 trivial questions. Focus on decisions that will change the database schema, API signatures, or error handling.
3. **Frame questions with concrete options**, rather than open-ended queries:
   - *Bad:* "How do you want to handle duplicate signups?"
   - *Good:* "If a user attempts signup with an email that already exists:
     - Option A: Return HTTP 409 Conflict with `{ code: 'EMAIL_ALREADY_EXISTS' }`.
     - Option B: Return HTTP 200 with generic 'Verification email sent' to prevent email enumeration attacks.
     - Option C: Send a password reset email to the existing address."
4. **Update `spec.md` with the answers:**
   - Incorporate decisions directly into the Acceptance Criteria and Non-Functional Requirements sections.
   - Remove or resolve the corresponding entries in the Open Questions table.
