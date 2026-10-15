# JD Matcher API contract (v1)

Public-safe: this file may be copied into the public frontend repo. It describes only the
Gateway endpoints and event shapes — no infrastructure, hostnames of internal services, or keys.

- Base URL: `https://jd-api.cuongle.technet.software` (dev: `http://localhost:8787`)
- Allowed origins (CORS): `https://cuongle.technet.software`, `http://localhost:5173`
- Frontend configuration: only `VITE_API_BASE` and `VITE_TURNSTILE_SITEKEY` (both public).
- All JSON uses camelCase.

## GET /quota

```json
{ "allowed": true, "retryAfterSec": 0, "dailyLeft": 42, "paused": false }
```

Two limit tiers:

| Tier | Applies when | Default limits (server-configurable) |
|---|---|---|
| Local | the run is served by the owner's self-hosted model | per IP: 3 / 15 min and 20 / day; global: 300 / day |
| OpenAI (strict) | any model call of the run falls back to OpenAI | per IP: 1 / 15 min and 3 / day; global: 20 / day and 300 / month |

`/quota` reports the **local** tier (the gateway cannot know in advance which provider will serve
the next run). `allowed=false` when any of these hold:
- `retryAfterSec > 0`: the caller's IP is cooling down on the local tier;
- `dailyLeft = 0`: the global local-tier daily cap is reached;
- `paused = true`: the demo is switched off (kill switch). The frontend shows a friendly
  "demo is resting" message with links to the CV/contact instead of the upload form.

If the self-hosted model is unavailable and the caller has no OpenAI-tier quota left, the stream ends
with `event: error` `{ "code": "FALLBACK_LIMITED", "retryable": true, "retryAfterSec": N }` right after
the `route` stage; nothing is consumed.

## POST /analyze

Request body:

```json
{
  "text": "plain JD text extracted in the browser (50..15000 chars)",
  "lang": "vi",
  "source": "paste",
  "turnstileToken": "..."
}
```

- `lang`: `"vi" | "en"` — UI language; the summary and notes are written in this language.
- `source`: `"paste" | "file"`.

Non-stream errors (JSON body `{ "error": CODE, ... }`):

| Status | `error` | Extra fields |
|---|---|---|
| 400 | `INVALID_INPUT` | — |
| 403 | `BOT_CHECK_FAILED` | — |
| 413 | `PAYLOAD_TOO_LARGE` | — |
| 429 | `RATE_LIMITED` | `retryAfterSec` (per-IP cooldown, or a short retry when the server is busy) |
| 503 | `DAILY_CAP_REACHED` | — |
| 503 | `DEMO_PAUSED` | — (kill switch on) |
| 502 | `UPSTREAM_UNAVAILABLE` | — |

Success: `200`, `Content-Type: text/event-stream`. A cache hit (same JD within 24h) replays all
events quickly and does not consume the caller's quota.

## SSE events

```
event: stage
data: StageEvent

event: section
data: SectionEvent

event: result
data: MatchResult

event: error
data: ErrorEvent

: ping            (comment, every 10s)
```

### StageEvent

```ts
type StageId =
  | "accepted" | "route" | "normalize" | "extract" | "retrieve"
  | "evaluate" | "score" | "write" | "done";

interface StageEvent {
  stage: StageId;
  status: "running" | "done" | "failed" | "skipped";
  ms?: number;                         // duration, on "done"
  provider?: "self" | "openai";        // on stages that call a model, and on "route"
  model?: string;                      // display name, e.g. "Qwen3-4B (fine-tuned)"
  meta?: Record<string, string | number | boolean>;
}
```

Stages arrive in the order listed. Labels are rendered by the frontend (i18n), not sent.

- `route` done: `provider` is the provider chosen for this run; when it is `"openai"`,
  `meta.reason` is `"offline" | "busy" | "not_configured"`.
- `extract` done: `meta.title` (job title), `meta.requirements` (count).
- A single model call may fall back mid-run; the stage's `provider`/`model` reflect what actually ran.

#### Stream shape (as implemented — additive clarifications)

- `accepted` done carries `meta.jobId` (on a cache replay also `meta.cached: true`).
- Every stage sends `running` then `done` (`accepted` and `score` send only `done`).
  Other `done` meta: `normalize` → `lang` (JD language), `chars`; `retrieve` → `chunks`;
  `score` → `overall`, `tier`, `verdicts`.
- Success ends with stage `done` (`ms` = total) followed by exactly one `result`; then the stream closes.
- Failure ends with the current stage as `failed`, then exactly one `error`; then the stream closes.
  When no model is available (or OpenAI is not allowed), that is `route` `failed` with `meta.reason`.
- If the connection to the AI service breaks mid-stream, the gateway appends
  `error` `{ "code": "INTERNAL", "retryable": true }` (quota refunded).
- Cache replay: same events, `result.cached = true`, a new `jobId`.

### SectionEvent

Emitted during `evaluate`, exactly once per group (all five). Groups that have requirements come
first, as their evaluation lands; groups the JD does not mention come last with all counts `0` and
`score` equal to `overall`.

```ts
type GroupId = "skills" | "experience" | "responsibilities" | "domain" | "extras";

interface SectionEvent {
  group: GroupId;
  score: number;        // 0..100
  strong: number;
  partial: number;
  transferable: number;
  gap: number;
}
```

### MatchResult

```ts
interface Highlight {
  id: string;                                  // stable evidence id, e.g. "exp-afforai"
  label: string;                               // human label, e.g. "Afforai (Logically)"
  section: "exp" | "projects" | "skills" | "awards";
  key: string;                                 // portfolio item key: exp org name or project name
}

interface Verdict {
  reqId: string;
  requirement: string;
  kind: "must" | "nice" | "responsibility";
  group: GroupId;
  level: "strong" | "partial" | "transferable" | "gap";
  note: string;
  evidence: Highlight[];
}

interface MatchResult {
  jobId: string;
  cached: boolean;
  provider: "self" | "openai";
  model: string;
  overall: number;                              // 45..97, lenient
  tier: "strong" | "good" | "partial" | "stretch";
  sections: Record<GroupId, number>;
  job: { title: string; seniority: string };
  matched: Verdict[];                           // level != "gap"
  gaps: Verdict[];                              // level == "gap"
  highlights: Highlight[];                      // up to 5, most relevant first
  summary: string;
}
```

### ErrorEvent

```ts
interface ErrorEvent {
  code: "LLM_UNAVAILABLE" | "TIMEOUT" | "INTERNAL" | "FALLBACK_LIMITED";
  retryable: boolean;      // when true the caller's quota was refunded
  retryAfterSec?: number;  // set for FALLBACK_LIMITED
}
```

`FALLBACK_LIMITED`: the self-hosted model is offline/busy and the OpenAI fallback is not allowed for
this caller right now (strict tier exhausted). Show "the personal model server is offline — try again
in N minutes"; the local-tier quota was not consumed.
