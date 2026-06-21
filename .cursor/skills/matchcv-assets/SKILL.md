---
name: matchcv-assets
description: Generate MatchCV app graphics (icons, splash, Play Store screenshots) via the matchcv-image-gen MCP tool and Together AI FLUX. Use when creating or updating visual assets for the MatchCV mobile app.
---

# MatchCV asset generation

Use MCP tool **`generate_image`** from server **`matchcv-image-gen`** when the user asks for icons, splash screens, store screenshots, or marketing graphics.

## Brand

- App name: **MatchCV**
- Primary color: **#FF7A33** (orange)
- Style: modern, flat/minimal, professional career & resume app
- Avoid: cluttered UI, stock photo look, tiny unreadable text

## Prompt rules

- Write prompts in **English**
- Specify: subject, style, colors, background, no text unless requested
- For app icons: "flat vector app icon, centered symbol, solid or soft gradient background, no rounded device frame"

## Default save paths

| Asset | Path | Size |
|-------|------|------|
| App icon | `assets/icon.png` | 1024×1024 |
| Adaptive icon | `assets/adaptive-icon.png` | 1024×1024 |
| Splash | `assets/splash.png` | 1284×2778 |
| Play feature graphic | `assets/generated/feature-graphic.png` | 1024×500 |
| Screenshots | `assets/generated/play-screenshot-1.png` etc. | 1080×1920 |

Call **`list_asset_targets`** if unsure which file to generate.

## After generation

1. Confirm file exists in `assets/`
2. For store release, user may run `npm run generate:icons` for size variants
3. Rebuild app: `npx expo start` or EAS build to see new assets

## API cost

Together AI FLUX.1-schnell ≈ $0.002–0.003 per image. Free credits on signup cover thousands of images.

## If MCP is unavailable

Tell the user to:
1. Set `TOGETHER_API_KEY` in `.cursor/mcp.json`
2. Run `npm install` in `tools/image-mcp`
3. Restart Cursor → Settings → MCP → enable **matchcv-image-gen** (green status)
