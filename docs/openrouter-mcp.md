# OpenRouter MCP (Cursor)

Remote MCP for live model catalog, credits, docs, and light test generation.

## Connect

Already added to `~/.cursor/mcp.json`:

```json
"openrouter": {
  "url": "https://mcp.openrouter.ai/mcp"
}
```

1. Open **Cursor Settings → MCP**.
2. Find **openrouter** and click **Connect** / **Authenticate** (OAuth in browser).
3. Approve a dedicated key (default ~7-day expiry, editable spend cap).

Server URL: `https://mcp.openrouter.ai/mcp`

## Useful tools

| Tool | Use |
|---|---|
| `list-models` | Find SVG/vector image models (e.g. Recraft) |
| `get-model` | Full details for one slug |
| `get-credits` | Remaining balance |
| `generate-image` | One-off test image (billable) |
| `search-docs` | OpenRouter API docs |

## Batch drafts (this repo)

MCP is for discovery. Reproducible Structured Phi drafts use the Image API:

```bash
cp .env.example .env   # set OPENROUTER_API_KEY
npm run generate:drafts
```

Batch drafts: OpenRouter Pro Vector remains optional for experiments. The smoke set is **hand-authored** Structured Phi SVG under `drafts/oola-structured-phi/recraft-v4.1-pro-vector/`.
