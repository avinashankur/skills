# API Documentation Reference

## Purpose

API documentation is an exhaustive, precise description of every endpoint, function, or class — what it accepts, what it returns, what it can throw. It is read non-linearly: engineers search for the specific endpoint or method they need. Every entry must be self-contained.

## When to choose this doc type

- User wants to document REST endpoints, GraphQL schema, gRPC services, or library functions
- User is building a public or internal API and needs a reference for consumers
- User has an existing OpenAPI/Swagger spec and wants to improve it

## Clarifying questions to ask before starting

Only ask what you cannot infer from the code/spec already provided:

1. Who are the consumers of this API? (internal teams, external developers, public internet)
2. What format is preferred — Markdown reference, OpenAPI YAML/JSON, or auto-generated (JSDoc / TypeDoc / Sphinx)?
3. Are there authentication schemes? (API key, OAuth, JWT, session — how should auth be documented?)
4. What error format does the API return? (RFC 7807 problem details, custom JSON, HTTP status only?)
5. Are there rate limits, pagination patterns, or versioning schemes to document?
6. Which endpoints/methods should be included? (all, or specific subset?)

## Entry Template

Use this template for EVERY endpoint or function. Do not skip fields — if a value is N/A, say so explicitly.

---

### [HTTP METHOD] /path/to/endpoint — Short description

**Summary:** One sentence. What does this endpoint do for the caller?

**Authentication:** Required / None. Specify scheme (Bearer token, API key header name, etc.)

**Rate limit:** X requests per Y seconds per Z (or None)

---

#### Parameters

| Name      | In                           | Type   | Required | Description      |
| --------- | ---------------------------- | ------ | -------- | ---------------- |
| paramName | path / query / header / body | string | Yes      | What it controls |

#### Request Body

Content-Type: pplication/json

`json
{
  "field": "value"   // description
}
`

Schema:

| Field | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| ield  | string | Yes      | ...         |

#### Response

**200 OK**

`json
{
  "id": "abc123",
  "status": "active"
}
`

| Field  | Type   | Always present | Description         |
| ------ | ------ | -------------- | ------------------- |
| id     | string | Yes            | Resource identifier |
| status | string | Yes            | Current state       |

#### Error Responses

| Status | Code             | When it happens          |
| ------ | ---------------- | ------------------------ |
| 400    | VALIDATION_ERROR | Missing required field   |
| 401    | UNAUTHORIZED     | Invalid or missing token |
| 404    | NOT_FOUND        | Resource does not exist  |
| 429    | RATE_LIMITED     | Too many requests        |
| 500    | INTERNAL_ERROR   | Unexpected server error  |

#### Example

Request:
`ash
curl -X POST https://api.example.com/v1/resource \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
`

Response:
`json
{
  "id": "abc123",
  "status": "active"
}
`

---

## Document-Level Structure

When documenting a full API (not a single endpoint), use this structure:

`

# API Reference — [Service Name]

## Overview

- Base URL
- Authentication
- Versioning policy
- Rate limits
- Pagination (if applicable)
- Common error format

## Resources

- [Resource 1]
  - [Method 1]
  - [Method 2]
- [Resource 2]
  ...

## Changelog

`

## Standards & Tools

- **OpenAPI 3.x** is the industry standard for REST APIs. If the user's codebase can generate it (FastAPI, NestJS, Spring, etc.), recommend and help enable auto-generation.
- **JSDoc / TypeDoc** for JavaScript/TypeScript libraries
- **Sphinx / Google-style docstrings** for Python
- **Javadoc** for Java
- Auto-generated docs never drift out of sync. Manual Markdown docs do. Recommend auto-generation where possible.

## Quality Checklist

Before finishing:

- [ ] Every endpoint has a complete entry (no missing fields)
- [ ] All examples use real-looking values, not "string" or "value"
- [ ] All error codes are enumerated
- [ ] Auth requirements are documented on every endpoint
- [ ] Pagination, filtering, and sorting are documented if applicable
- [ ] A changelog or versioning note is present if this is a public API
