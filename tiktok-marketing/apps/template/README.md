# App-isolated TikTok Marketing Template

Use one folder per app to prevent cross-contamination.

## Structure

- `config.json` -> app-specific config (integrationId, app info)
- `hook-performance.json` -> winner/loser hooks for this app only
- `posts/` -> generated slides + meta for this app only
- `reports/` -> analytics reports for this app only
- `post-index.jsonl` -> durable post index for this app only
- `release-map.json` / `manual-release-map.json` -> matching state per app

## Quick start for new app

1. Copy `template/` to `apps/<app-slug>/`
2. Fill `apps/<app-slug>/config.json`
3. Run scripts with that config + folder paths

Example:

```bash
node tmp-skill/antonio-gen-z/scripts/generate-slides.js \
  --config tiktok-marketing/apps/app2/config.json \
  --output tiktok-marketing/apps/app2/posts/test-1 \
  --prompts tiktok-marketing/apps/app2/prompts-test-1.json

NODE_PATH=node_modules node tmp-skill/antonio-gen-z/scripts/add-text-overlay.js \
  --input tiktok-marketing/apps/app2/posts/test-1 \
  --texts tiktok-marketing/apps/app2/texts-test-1.json

node tmp-skill/antonio-gen-z/scripts/post-to-tiktok.js \
  --config tiktok-marketing/apps/app2/config.json \
  --dir tiktok-marketing/apps/app2/posts/test-1 \
  --caption "..." --title "..."
```
