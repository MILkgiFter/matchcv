# Image generation MCP (Together AI + FLUX)

Cheap image generation inside Cursor for MatchCV assets (~$0.002/image).

## 1. Together AI key

1. https://api.together.ai → sign up
2. **Settings → API Keys → Create**
3. Copy key (`together_...`)

## 2. Install MCP server

```powershell
cd c:\Users\NITRO\Downloads\aicvupgrade\tools\image-mcp
npm install
```

## 3. Cursor MCP config

Edit **`.cursor/mcp.json`** — replace `PASTE_YOUR_TOGETHER_API_KEY_HERE` with your key.

Or use Cursor UI: **Settings → Features → MCP → Add** (paste same JSON).

## 4. Restart Cursor

Open **Settings → MCP** — server **matchcv-image-gen** should be green.

## 5. Usage in chat

Examples:

```
Сгенерируй иконку MatchCV 1024x1024, оранжевый #FF7A33, символ CV match, сохрани в assets/icon.png
```

```
Generate Play Store feature graphic 1024x500 for MatchCV, save to assets/generated/feature-graphic.png
```

The agent calls `generate_image` and saves files into the project.

## Tools

| Tool | Purpose |
|------|---------|
| `generate_image` | prompt + filename + optional width/height |
| `list_asset_targets` | recommended paths for MatchCV |

## Troubleshooting

- **Red MCP status** — run `npm install` in `tools/image-mcp`, check Node.js installed
- **TOGETHER_API_KEY error** — key missing in `.cursor/mcp.json` env
- **403/401 from API** — invalid key or no credits on Together account
