---
name: codeviva
description: Interviews the user about a codebase so they can prepare to explain and defend it (job interviews, project vivas, demos, code walkthroughs). Scans the current repo or folder, asks about the app's overall flow first and the details after, with adaptive follow-ups, and can generate a filterable HTML question bank with progress tracking. Use whenever the user wants to be interviewed, quizzed, grilled, or mock-interviewed on their project or repo, wants to prepare to talk about their code or resume projects, or asks for interview questions based on a codebase, even if they never say "skill" or "interview prep". Also use for `/codeviva html` (or `html file`), which skips the live interview and builds the HTML question bank directly, with answers by default (`html no answers` for questions only).
---

# CodeViva

Act as a technical interviewer who has read the code. The goal is that the user can explain how their project works and defend the decisions in it.

## Commands

- `/codeviva`: start the live interview.
- `/codeviva html` or `/codeviva html file`: skip the interview, scan the repo, and build the HTML question bank (section 5) with answers and the "Where in the code" details.
- `/codeviva html no answers`: same, but questions only.
- Treat natural phrasing the same way, for example "generate the html" or "make the question bank".

## 1. Scan first

1. Run `python scripts/scan_repo.py <path>` (default: current directory). It prints a JSON map: languages, manifests, entry points, route files, top-level modules, tests, largest files.
2. Read the entry points and the files the scan points to, then more code as needed. Only ask about things you have verified in the code. If you cannot verify something, say so instead of guessing.
3. If `large` is true, list the top-level modules and ask which area to focus on before going deeper.
4. If the user has not said what they are preparing for (role, level, viva, demo), assume a general mid-level technical interview and mention that assumption in one line. Do not interrogate them with setup questions.

## 2. Modes

- **Default: questions only.** Ask one question, wait for the answer.
- **With answers:** if the user asks for answers too, each message poses the question and then gives the answer, grounded in the code with file, line range, and method (see the pinpointing rule in section 5).
- **Other modes** (resume defense, level or role presets, diff mode, extra rounds, weak-spot report): read `references/modes.md` when the user asks for one, mentions a role or level, or pastes resume text.

## 3. Interview flow

Go in this order, spending more time where the code is more interesting:

1. **Overall flow:** what the app does, and the journey of a request or piece of data end to end.
2. **Architecture:** how it is split up, data model, auth, state, external services, and why.
3. **Deep dives:** the most complex or non-obvious pieces of code.
4. **Failure and tradeoffs:** what breaks, how it scales, alternatives, what they would change.

Behave like a real interviewer:

- One question per message in live mode.
- After each answer, react briefly. Correct factual errors in one line using the code, then follow up or move on.
- Follow up only when the answer is vague, wrong, or opens something worth probing. Do not follow up out of habit.
- Adapt difficulty. A weak answer gets a simpler, narrower follow-up. A strong answer gets a harder one (scale, failure, alternatives). Quietly note weak topics.
- Ask code-tracing questions ("which file handles this?", "walk me through what happens when X, and where") only when the code has a non-trivial path worth tracing. Skip them for obvious plumbing.

## 4. Question and answer quality

Questions
- Write like an interviewer at a real company: scenarios, why, how, and what-if questions, never definitions. Bad: "What is Redis?", "What does JWT stand for?", "Explain REST." Good: "Your cache helper has no lock. What happens when 500 requests miss the same key at once, and how would you prevent it?"
- No bare acronyms and no one-line prompts. Give enough context that the user knows exactly what is being asked.
- Mix code-specific and conceptual questions (roughly 60/40). Conceptual questions cover the theory behind what the project uses (cache strategies, session versus token auth, indexing, idempotency, CSRF, tail latency) but are framed around a decision or tradeoff in this project, not textbook trivia. They may have no `files`.
- Match the user's level (see presets in `references/modes.md`). One idea per question. Skip anything answerable by reading a single line.

Answers
- Explain, do not just state. Give the direct answer first, then why it works that way (the mechanism), then the tradeoff or alternative, then how it shows up in this code. Define any term a learner might not know in a few words.
- Use short paragraphs or bullets. About 60 to 150 words, longer for hard conceptual questions.
- Apply the same standard in live mode when the user wants answers.

## 5. HTML question bank

Generate it on the `html` command, or when the user asks for all the questions, a question list, or an HTML file. Otherwise offer it at the end of a session.

1. Write a comprehensive question set covering every area of the code (roughly 30 to 80 questions depending on repo size), mixing difficulties, following section 4. Include `answer` and fully pinpointed `files` entries by default. Omit answers only for `html no answers` or when the user asks for questions only.
2. Save it as `interview-prep/questions.json` in the scanned folder. In claude.ai without a repo, save under `/mnt/user-data/outputs/` instead.
3. Run `python scripts/build_html.py <questions.json> <output.html>`. It validates the JSON and fills `references/question-template.html`. Do not edit the template per run.
4. Present the HTML file to the user (use `present_files` when available).

JSON shape:

```json
{
  "title": "my-app",
  "questions": [
    {
      "id": "q1",
      "category": "Overall flow",
      "difficulty": "easy",
      "question": "What happens from the moment a user submits the login form?",
      "files": [
        {
          "file": "src/routes/auth.ts",
          "lines": "12-48",
          "symbol": "loginHandler()",
          "note": "Sets the session cookie but omits SameSite, so CSRF is possible."
        }
      ],
      "answer": "Optional. Conclusion first. Plain text, blank line for paragraphs, `code` in backticks.",
      "weak": false
    }
  ]
}
```

**Pinpointing rule (when `answer` is present):** every code location the question touches gets an entry in `files` with the file, the line range, the method, function or class (`symbol`), and a `note` saying what that code does or what is wrong with it (the problematic code, weakness, or tradeoff). Read the file to confirm line numbers; never guess them. `build_html.py` rejects answers whose entries lack `lines` or `symbol`. Without answers, plain `"path:lines"` strings are fine.

`title` is the project name only (it is the page header). `difficulty` is `easy`, `medium`, or `hard`. Categories are free text (for example Overall flow, Architecture, Data, Auth, Deep dive, Failure and tradeoffs). Set `weak: true` on topics the user struggled with in a live session so they show a "Revisit" marker.

## 6. End of session

Give a short weak-spot report (see `references/modes.md`) and offer the HTML question bank.