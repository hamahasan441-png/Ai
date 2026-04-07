# REST API Reference

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

| Method | Header | Example |
|--------|--------|---------|
| API Key | `X-Api-Key` | `X-Api-Key: ai_key_abc123...` |
| Session Token | `Authorization` | `Authorization: Bearer session-uuid` |

## Endpoints

### Health & System

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (returns `{ status: 'ok' }`) |
| GET | `/ready` | Readiness probe |
| GET | `/api/v1/version` | Version info |
| GET | `/api/v1/openapi.json` | OpenAPI 3.0.3 spec |
| GET | `/api/v1/docs` | Swagger UI |

### Chat

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/chat` | Get chat status/history |
| POST | `/api/v1/chat` | Send a message |
| POST | `/api/v1/chat/stream` | Stream a response (SSE) |

**POST /api/v1/chat** request:
```json
{ "message": "What is TypeScript?", "context": {} }
```

**Response:**
```json
{ "response": "TypeScript is...", "metadata": { "model": "claude-sonnet", "tokens": 150 } }
```

### Brain

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/brain/status` | Brain status and stats |

### Knowledge

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/knowledge/search?q=term` | Search knowledge base |

### Plugins

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/plugins` | List installed plugins |

### Config

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/config` | Get configuration (safe values only) |

### Streaming (SSE)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/stream` | SSE event stream |

**SSE Event Format:**
```
event: chat:stream
data: {"content":"Hello","done":false}
id: msg-123

event: chat:stream
data: {"content":"","done":true,"usage":{"tokens":50}}
id: msg-124
```

## Error Responses

```json
{
  "error": {
    "code": 1001,
    "message": "Description of what went wrong",
    "details": {}
  }
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Bad request / validation error |
| 401 | Authentication required |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Rate Limiting

Response headers when rate limited:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests per window |
| `X-RateLimit-Remaining` | Remaining requests |
| `X-RateLimit-Reset` | Window reset timestamp (Unix) |
| `Retry-After` | Seconds to wait (on 429) |
