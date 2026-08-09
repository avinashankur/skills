# Runbook / Playbook Reference

## Purpose

A runbook is a step-by-step guide for operating, troubleshooting, or recovering a system during an incident or unexpected failure. It is read under pressure, by engineers who may be unfamiliar with the specific system, while things are broken. It must be action-oriented, unambiguous, and fast to scan.

A **runbook** covers a single procedure (e.g., "How to recover from a Redis crash").
A **playbook** covers a scenario (e.g., "The background worker is down — what to do").

Both formats follow similar principles. The distinction matters less than the quality.

---

## When to choose this doc type

- A recurring incident (in dev or prod) has no written response procedure
- A new service is being launched and the team needs incident response docs
- The team is growing and institutional knowledge needs to be written down
- A post-mortem identified "no runbook" as a contributing factor
- An alert exists but nobody knows what to do when it fires
- A developer keeps asking "what do I do when X breaks locally?"

---

## Audience & Phase Priority

> [!IMPORTANT]
> **Runbooks cover both development and production.** When writing a runbook, always document the **development phase first and in most detail**. Development is where most day-to-day troubleshooting happens, the infrastructure setup is known, and the steps are concrete. Production infrastructure varies by deployment target — document it at a higher level unless the deployment target is known.

Structure every runbook with two distinct sections:

1. **Local Development** — Primary, detailed, opinionated. Assumes `docker-compose`, `.env`, and `npm` scripts. This is what a developer will hit first and what should get the most attention.
2. **Production** — Secondary, more generic. Covers the logical steps to diagnose/resolve the issue in a deployed environment. Use placeholders where the exact infrastructure (Kubernetes, ECS, Fly.io, etc.) is unknown.

---

## Clarifying questions to ask

1. What is the system or service this runbook covers?
2. What scenario or failure mode does it address?
3. What is the blast radius if this goes wrong? (users affected, data loss risk)
4. Who is the primary audience? (developers locally, on-call engineers, DevOps)
5. What does "resolved" look like — how do you know the issue is fixed?
6. Are there escalation paths? (who to contact if you can't fix it)

---

## Runbook Template

---

# Runbook: [Short name of procedure or scenario]

**Service:** [Name of the affected service]
**Severity:** P1 (customer impact) / P2 (degraded) / P3 (internal/dev only)
**Owner:** [Team or person]
**Last reviewed:** YYYY-MM-DD
**Estimated resolution time:** [N] minutes

---

## Trigger

This runbook applies when:

- [Specific observable symptom — e.g., "OTP emails are not arriving"]
- OR: [Log error — e.g., "`Connection refused` in API logs"]
- OR: [Alert that fires — e.g., "`RedisDown` alert fires in Grafana"]

---

## Impact Assessment

Before acting, answer these:

- [ ] Is this happening locally or in production?
- [ ] Are users completely blocked, or is this a partial degradation?
- [ ] Is any data being lost or corrupted?

---

## 🛠 Local Development

> **Start here.** This section is the primary reference for most engineers.

### Checklist

Before diving into specific fixes, run through this checklist:

- [ ] Are all required services running? (`docker ps` / `docker-compose ps`)
- [ ] Is the `.env` file present and complete? (check all required keys with `cat .env`)
- [ ] Is the relevant process running? (API server, worker, etc.)

### Diagnosis

Run these checks in order:

#### 1. Check if the service is running

```bash
# Example for Docker-based services
docker-compose ps

# Expected output: all services should be in "Up" state
```

Expected output: all containers show `Up`.
If any show `Exit`, start the failing service:

```bash
docker-compose up -d <service-name>
```

#### 2. Check the service logs

```bash
docker-compose logs --tail=50 <service-name>
```

Key errors to look for:
- `Connection refused` → A dependency (database, cache, etc.) is not running.
- `ENOENT` or `MODULE_NOT_FOUND` → A file or env variable is missing.
- `Invalid API key` → A secret in `.env` is wrong or missing.

#### 3. Check for missing environment variables

```bash
# Verify all required keys are present
cat .env | grep -E "REQUIRED_KEY_1|REQUIRED_KEY_2"
```

### Resolution Steps

Work through these in order. Stop when the issue is resolved.

#### Option A: Service is not running

```bash
# Start all services
docker-compose up -d

# Or start a single service
docker-compose up -d <service-name>
```

Resolution check: `docker-compose ps` shows all services `Up`.

#### Option B: Wipe and restart local state

If the service has corrupted state and you want a clean slate:

```bash
# Stop and remove containers (preserves volumes)
docker-compose down

# To also wipe volumes (data will be lost):
docker-compose down -v

# Start fresh
docker-compose up -d
```

> [!CAUTION]
> `docker-compose down -v` destroys all local data. Only use this if you need a completely clean slate and are comfortable losing local test data.

#### Option C: Missing or wrong environment variable

1. Check your `.env` against `.env.example`.
2. Add or correct the missing key.
3. Restart the relevant process to pick up the new values:

```bash
# Restart just the API server (not all containers)
# Ctrl+C in the terminal running npm run dev, then:
npm run dev
```

### Verification (Local)

Issue is resolved when:

- [ ] `docker-compose ps` shows all services `Up`.
- [ ] The specific action that was failing (e.g., OTP request, login) now succeeds.
- [ ] No new errors in `docker-compose logs`.

---

## 🚀 Production

> **Secondary section.** The exact commands depend on your deployment target (Kubernetes, ECS, Fly.io, etc.). Adapt the steps below for your infrastructure.

### Trigger Confirmation

- Alert: `[AlertName]` fires in `[Grafana / PagerDuty / Datadog]`
- OR: Support reports `[observable symptom]`

**If P1 impact confirmed:** Notify the `#incidents` channel before proceeding.

### Diagnosis

```bash
# Check service health (Kubernetes example — adapt for your stack)
kubectl get pods -n production -l app=<service-name>

# Check logs
kubectl logs -n production -l app=<service-name> --since=15m | grep -i error
```

### Resolution Steps

#### Option A: Restart the affected service

```bash
kubectl rollout restart deployment/<service-name> -n production
kubectl rollout status deployment/<service-name> -n production
```

#### Option B: Update a secret / environment variable

```bash
kubectl edit secret <secret-name> -n production
kubectl rollout restart deployment/<service-name> -n production
```

#### Option C: Escalate

If the issue is beyond the scope of this runbook or is not resolved within 30 minutes:

| Escalate to        | When                      | How                 |
| ------------------ | ------------------------- | ------------------- |
| [Infrastructure]   | Infrastructure is down    | PagerDuty / Slack   |
| [Engineering Lead] | Suspected code regression | Slack               |

### Verification (Production)

Issue is resolved when:

- [ ] All pods are in `Running` state with no recent restarts.
- [ ] Error rate is below [X]% on [dashboard link].
- [ ] No new alerts firing.

---

## Post-Incident

After resolution (dev or prod):

- [ ] Note the root cause in `#incidents` or your incident tracker.
- [ ] Create a follow-up ticket for the permanent fix if a workaround was applied.
- [ ] Update this runbook if any steps were wrong or missing.

---

## Writing Style for Runbooks

- **Imperative voice.** "Run this command", "Check the dashboard", not "You should run" or "It may be necessary to".
- **One action per step.** Don't combine two things in one bullet. Split them.
- **Expected output.** For every command, tell the reader what a good result looks like. This lets them distinguish "working as expected" from "silently broken".
- **Escape hatches.** Every path should end in either "resolved" or "escalate". Never leave the reader with nowhere to go.
- **Short paragraphs.** Someone is reading this while their heart rate is elevated. Dense text creates mistakes.
- **Dev first.** Always write the local development section first and in most detail. It's the most common context.

---

## Quality Checklist

Before finishing:

- [ ] Local development section comes first and is more detailed than production
- [ ] Trigger condition is specific (what error, what symptom)
- [ ] All commands are copy-pasteable with real values (or clear placeholders)
- [ ] Expected output is shown for key commands
- [ ] Every path leads to either resolution or escalation
- [ ] A caution note is present for any destructive commands (e.g., wiping volumes)
- [ ] Verification criteria are objective (not just "seems to be working")
- [ ] Last reviewed date is set
