# Linear backend

Read `Team`, `Default project`, `Default labels`, and `Status map` from `docs/agents/issue-tracker.md`.

## Transport: MCP first, GraphQL fallback

1. **Linear MCP** — if this session has Linear MCP tools (names containing `linear`, e.g. `list_issues`, `get_issue`, `create_issue`/`save_issue`, `update_issue`, `create_comment`, `list_teams`, `list_issue_statuses`, `list_issue_labels`, `list_users`, `list_projects`), use them. Inspect their schemas rather than assuming parameter names; tool sets differ between server versions.
2. **GraphQL API** — for anything the MCP tools can't do (commonly: delete, issue relations), or if no MCP is connected, call the API directly:
   ```bash
   curl -s https://api.linear.app/graphql \
     -H "Content-Type: application/json" \
     -H "Authorization: $LINEAR_API_KEY" \
     --data @query.json
   ```
   Build `query.json` (`{"query": "...", "variables": {...}}`) in the scratchpad rather than inlining JSON in the shell. Personal API keys go in `Authorization` with no `Bearer` prefix.
3. **Neither available** → tell the user to connect the Linear MCP server (`claude mcp add --transport http linear https://mcp.linear.app/mcp`) or export `LINEAR_API_KEY` (Linear → Settings → Security & access → Personal API keys). Stop.

Never print the API key or echo it into files.

## Preflight
MCP: list teams. API: `{ viewer { id name } teams { nodes { id key name } } }`. Confirm the configured team key exists; cache its `id` for this session.

## Resolving names → ids
Linear mutations need ids. Look them up once per session and reuse:
- Team: `teams(filter:{key:{eq:"ENG"}}) { nodes { id } }`
- States: `team(id:$t) { states { nodes { id name type } } }` — map via config `Status map`.
- Labels: `team(id:$t) { labels { nodes { id name } } }` (+ workspace labels: `issueLabels { nodes { id name } }`). Create missing ones only if the user asked for that label.
- Users: `users(filter:{displayName:{eq:"x"}})`; "me" → `viewer { id }`.
- Projects: `projects(filter:{name:{eq:"x"}}) { nodes { id } }`.
- An issue identifier like `ENG-123` works directly as `issue(id:"ENG-123")`.

## Operations (GraphQL; MCP equivalents are named the same way)

| Op | GraphQL |
|---|---|
| Create | `mutation($i:IssueCreateInput!){ issueCreate(input:$i){ success issue{ identifier url } } }` with `{teamId,title,description,labelIds,assigneeId,priority,projectId,parentId,stateId}` |
| View | `issue(id:"ENG-1"){ identifier title description url priorityLabel state{name} assignee{name} labels{nodes{name}} parent{identifier} relations{nodes{type relatedIssue{identifier}}} inverseRelations{nodes{type issue{identifier}}} comments(last:5){nodes{body user{name} createdAt}} }` |
| List | `issues(first:20, orderBy:updatedAt, filter:{ team:{key:{eq:"ENG"}}, state:{type:{nin:["completed","canceled"]}}, assignee:{isMe:{eq:true}}, labels:{name:{eq:"bug"}} }){ nodes{ identifier title state{name} assignee{name} labels{nodes{name}} } }` — include only the filters requested |
| Search | `searchIssues(term:"<terms>", first:10){ nodes{ identifier title state{name} } }` |
| Edit | `issueUpdate(id:"ENG-1", input:{title,description,labelIds,addedLabelIds,removedLabelIds,assigneeId,priority,stateId,parentId,projectId}){ success }` |
| Comment | `commentCreate(input:{issueId:"<uuid or ENG-1>", body:"..."}){ success }` |
| Close / reopen / move | `issueUpdate` with the `stateId` for `done` / `cancelled` / `open` / `in-progress` from the status map |
| Archive | `issueArchive(id:"ENG-1"){ success }` — the soft alternative to delete |
| Delete | `issueDelete(id:"ENG-1"){ success }` — moves to trash (restorable ~30 days). Confirm first |

**Priority:** `0` none · `1` urgent · `2` high · `3` medium · `4` low.

## Linking
- **Blocked by** (X blocked by Y): `issueRelationCreate(input:{issueId:"<Y>", relatedIssueId:"<X>", type:blocks}){ success }` — Y *blocks* X.
- **Sub-issue**: set `parentId` on the child (`issueUpdate` or at create time).
- **Related / duplicate**: `type: related` / `type: duplicate`.
- **PR / branch**: Linear auto-links when the identifier appears in the branch name, PR title, or body. "Start work" → fetch the issue's `branchName`, `git checkout -b <branchName>`, move to in-progress. "Close when PR merges" → put `Fixes ENG-123` in the PR body (Linear's GitHub integration closes it on merge).
