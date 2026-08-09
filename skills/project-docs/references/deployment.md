# Deployment / Infrastructure Documentation Reference

## Purpose

Deployment docs describe how the software gets from code to running in production. They are a hybrid of "how does this system work" (reference) and "how do I operate it" (procedure). The audience is engineers deploying, scaling, migrating, or debugging the system in a live environment.

## When to choose this doc type

- No deployment docs exist and the process is non-trivial
- Deployment is complex enough that it cannot be reconstructed from memory
- New team members need to be able to deploy independently
- The infrastructure is being redesigned and the docs need to be updated
- There is an upcoming audit or compliance review

## Clarifying questions to ask

1. Where does this system run? (AWS, GCP, Azure, on-prem, Vercel, Railway, Fly.io, bare metal)
2. How is it deployed? (CI/CD pipeline, manual scripts, Terraform, Helm charts, serverless)
3. What environments exist? (local, dev, staging, production, canary)
4. What does a deploy look like step-by-step? (what triggers it, what happens, how long, how to verify)
5. Are there database migrations to run? When and how?
6. Are there zero-downtime requirements? How is that achieved?
7. What are the most common deployment failure modes and how do you recover?
8. What secrets management system is used?
9. What does rollback look like?

## Document Template

---

# Deployment Guide — [System Name]

> **Last updated:** YYYY-MM-DD
> **Owner:** [team / person]
> **Scope:** [which services this covers]

---

## Environments

| Environment | URL                         | Deployed from  | Auto-deploy         | Purpose                  |
| ----------- | --------------------------- | -------------- | ------------------- | ------------------------ |
| Production  | https://app.example.com     | main branch    | No — manual trigger | Live users               |
| Staging     | https://staging.example.com | main branch    | Yes                 | QA + integration testing |
| Dev         | https://dev.example.com     | develop branch | Yes                 | Feature testing          |
| Local       | http://localhost:3000       | local machine  | —                   | Development              |

---

## Architecture Overview

[Brief description of infrastructure. Reference the architecture doc if one exists.]

Key components:

- **App servers:** [e.g., 2x ECS Fargate tasks, auto-scaling 1–10]
- **Database:** [e.g., RDS PostgreSQL 15 — Multi-AZ in prod, single instance in staging]
- **Cache:** [e.g., ElastiCache Redis 7]
- **CDN:** [e.g., CloudFront in front of S3 for static assets]
- **Load balancer:** [e.g., ALB with health checks on /health]

---

## Prerequisites

Before you can deploy, you need:

- [ ] AWS CLI configured with appropriate profile (ws sso login --profile prod)
- [ ] Access to [secrets manager / 1Password / Vault]
- [ ] Docker installed (for local builds)
- [ ] [Other tools]

---

## Standard Deployment

### Automated (CI/CD)

Deployments to staging are triggered automatically on merge to main. Production deployments require a manual approval step in GitHub Actions.

1. Merge PR to main
2. CI runs: lint → test → build → push Docker image to ECR
3. Staging deploys automatically (watch: [link to CI dashboard])
4. Verify on staging: [checklist or link to smoke tests]
5. Approve the production deployment gate in GitHub Actions
6. Monitor deployment progress in [ECS console / Datadog / Grafana]
7. Verify production: [link to health check, key metrics]

### Manual Deployment (emergency only)

`ash

# Set environment

export ENV=production
export IMAGE_TAG=v1.2.3

# Build and push

docker build -t myapp: .
docker tag myapp: 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:

# Deploy

aws ecs update-service --cluster prod --service myapp --force-new-deployment
`

---

## Database Migrations

Migrations run automatically during deployment as an ECS task before the new app version starts.

If a migration fails:
`ash

# Check migration logs

aws logs tail /ecs/myapp-migrate --follow

# Roll back the last migration

npm run db:migrate:undo
`

**Never run migrations manually in production without notifying the team.**

---

## Environment Variables & Secrets

Secrets are stored in AWS Secrets Manager. The application reads them at startup via the ECS task definition.

To update a secret in production:
`ash
aws secretsmanager update-secret \
 --secret-id prod/myapp/database \
 --secret-string '{"password":"newvalue"}'

# Then force a new deployment to pick up the change

aws ecs update-service --cluster prod --service myapp --force-new-deployment
`

Key secrets:
| Secret Name | What it is | Owner |
|-------------|-----------|-------|
| prod/myapp/database | DB connection string | Platform team |
| prod/myapp/stripe | Stripe API keys | Payments team |

---

## Health Checks & Verification

After any deployment, verify:

1. **Health endpoint:** curl https://app.example.com/health → should return {"status":"ok"}
2. **Key user flows:** [link to smoke test suite or manual checklist]
3. **Error rate:** Check Datadog dashboard — error rate should stay below 0.1%
4. **Latency:** P99 should be below 500ms

---

## Rollback

### Automated rollback

ECS will automatically stop the rollout if health checks fail consecutively. Monitor in the ECS console.

### Manual rollback

`ash

# Find the previous task definition revision

aws ecs describe-services --cluster prod --services myapp \
 --query 'services[0].taskDefinition'

# Roll back to previous version (e.g., revision 42)

aws ecs update-service \
 --cluster prod \
 --service myapp \
 --task-definition myapp:42
`

Rollback takes approximately [N] minutes.

---

## Scaling

| Component   | Min | Max | Scale trigger       |
| ----------- | --- | --- | ------------------- |
| API servers | 2   | 10  | CPU > 70% for 3 min |
| Workers     | 1   | 5   | Queue depth > 100   |

Manual scale-out:
`ash
aws ecs update-service --cluster prod --service myapp --desired-count 5
`

---

## Infrastructure as Code

Infrastructure is managed with [Terraform / CDK / Pulumi] in infra/.

`ash

# Preview changes

cd infra
terraform plan -var-file=prod.tfvars

# Apply changes

terraform apply -var-file=prod.tfvars
`

---

## Common Issues

| Symptom               | Likely cause          | Fix                                             |
| --------------------- | --------------------- | ----------------------------------------------- |
| Deploy stuck at 0%    | ECR image push failed | Check CI logs, re-push image                    |
| Health checks failing | Env var missing       | Check ECS task logs, verify secrets             |
| DB migration hanging  | Long-running lock     | Check pg_locks, may need to kill blocking query |

For more failure scenarios, see the [Runbook](runbook.md).

---

## Quality Checklist

Before finishing:

- [ ] All environments documented
- [ ] Step-by-step deploy instructions are copy-pasteable
- [ ] Rollback procedure is documented
- [ ] Secrets management is explained
- [ ] Database migration steps are explicit
- [ ] Health check verification steps are included
- [ ] Known failure modes are listed with remediation
