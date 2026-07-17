# Runbook / Playbook Reference

## Purpose

A runbook is a step-by-step guide for operating, troubleshooting, or recovering a system during an incident. It is read under pressure, by engineers who may be unfamiliar with the specific system, while things are broken. It must be action-oriented, unambiguous, and fast to scan.

A **runbook** covers a single procedure (e.g., "How to restart the payment worker").
A **playbook** covers a scenario (e.g., "Database is down — what to do").

Both formats follow similar principles. The distinction matters less than the quality.

## When to choose this doc type

- A recurring incident has no written response procedure
- A new service is being launched and the team needs incident response docs
- The team is growing and institutional knowledge needs to be written down
- A post-mortem identified "no runbook" as a contributing factor
- An alert exists but nobody knows what to do when it fires

## Clarifying questions to ask

1. What is the system or service this runbook covers?
2. What scenario or failure mode does it address? (or: what alert fires that triggers this runbook?)
3. What is the blast radius if this goes wrong? (users affected, revenue impact, data loss risk)
4. Who is the primary audience? (on-call engineers, DevOps, SREs, support team)
5. What access and tools does the reader have? (CLI access, Kubernetes, specific dashboards)
6. What does "resolved" look like — how do you know the issue is fixed?
7. Are there escalation paths? (who to page if you can't fix it in 30 minutes)

## Runbook Template

---

# Runbook: [Short name of procedure or scenario]

**Service:** [Name of the affected service]
**Severity:** P1 (customer impact) / P2 (degraded) / P3 (internal only)
**Owner:** [Team or on-call rotation]
**Last reviewed:** YYYY-MM-DD
**Estimated resolution time:** [N] minutes

---

## Trigger

This runbook applies when:
- Alert: [AlertName] fires in [Grafana / PagerDuty / Datadog]
- OR: [Specific observable symptom — e.g., "payment success rate drops below 98%"]
- OR: [Support escalation pattern — e.g., "multiple users report checkout errors"]

---

## Impact Assessment

Before acting, answer these:

- [ ] Are users currently impacted? How many / which segments?
- [ ] Is revenue processing affected?
- [ ] Is data being lost or corrupted?

**If P1 impact confirmed:** Notify #incidents channel and page [escalation contact] immediately before proceeding.

---

## Diagnosis

Run these checks in order to confirm the issue:

### 1. Check service health

`ash
# Check current status
kubectl get pods -n production -l app=myservice

# Look for crash loops or pending state
kubectl describe pod <pod-name> -n production
`

Expected output: [what "normal" looks like]

### 2. Check error logs

`ash
kubectl logs -n production -l app=myservice --since=15m | grep -i error
`

Key errors to look for:
- connection refused → database or downstream service issue
- 	imeout → latency or overload
- OOMKilled → memory limit hit

### 3. Check dashboards

- [Grafana: Service Overview](https://grafana.example.com/d/myservice)
- [Datadog: Error rate](https://app.datadoghq.com/...)

---

## Resolution Steps

Work through these in order. Stop when the issue is resolved.

### Option A: Pod crash loop

`ash
# Restart the deployment
kubectl rollout restart deployment/myservice -n production

# Watch rollout progress
kubectl rollout status deployment/myservice -n production
`

Resolution check: All pods in Running state, error rate back to normal.

### Option B: Database connection failure

`ash
# Verify DB is reachable from inside the cluster
kubectl exec -n production deployment/myservice -- \
  pg_isready -h  -p 5432

# If unreachable, check RDS console for instance status
# [link to RDS console]
`

If DB is down: Escalate to [DBA / Platform team], do not attempt to restart RDS yourself.

### Option C: Memory limit exceeded (OOMKilled)

`ash
# Temporarily increase memory limit (emergency only — not a permanent fix)
kubectl set resources deployment/myservice \
  --limits=memory=2Gi -n production

# File a ticket to investigate root cause after incident
`

---

## Verification

Issue is resolved when:
- [ ] All pods are in Running state with no restarts in the last 5 minutes
- [ ] Error rate is below [X]% on [dashboard link]
- [ ] Manual transaction test passes: [specific test or curl command]
- [ ] No new alerts firing

---

## Escalation

If not resolved within 30 minutes, or if the issue is beyond this runbook's scope:

| Escalate to | When | How |
|-------------|------|-----|
| [Platform team] | DB is down, infra issue | Page via PagerDuty: pd trigger --service platform |
| [Engineering lead] | Suspected code regression | Slack: @engineering-lead |
| [VP Engineering] | P1 not resolved in 60 min | Phone call |

---

## Post-Incident

After resolution:
- [ ] Post in #incidents: "Resolved. Root cause: [brief]. Duration: [N] minutes."
- [ ] Create follow-up ticket for root cause fix
- [ ] If P1/P2: Schedule post-mortem within 48 hours
- [ ] Update this runbook if any steps were wrong or missing

---

## Related Resources

- [Architecture diagram](architecture.md)
- [Deployment guide](deployment.md)
- [Monitoring dashboard](https://grafana.example.com)
- [Alert definitions](alerts/README.md)

---

## Writing Style for Runbooks

- **Imperative voice.** "Run this command", "Check the dashboard", not "You should run" or "It may be necessary to".
- **One action per step.** Don't combine two things in one bullet. Split them.
- **Expected output.** For every command, tell the reader what a good result looks like. This lets them distinguish "working as expected" from "silently broken".
- **Escape hatches.** Every path should end in either "resolved" or "escalate". Never leave the reader with nowhere to go.
- **Short paragraphs.** Someone is reading this while their heart rate is elevated. Dense text creates mistakes.

## Quality Checklist

Before finishing:
- [ ] Trigger condition is specific (what fires, what symptom)
- [ ] Impact assessment is included
- [ ] All commands are copy-pasteable with real values (or clear placeholders)
- [ ] Expected output is shown for key commands
- [ ] Every path leads to either resolution or escalation
- [ ] Escalation contacts are named (not just "the team")
- [ ] Verification criteria are objective (not just "seems to be working")
- [ ] Last reviewed date is set
