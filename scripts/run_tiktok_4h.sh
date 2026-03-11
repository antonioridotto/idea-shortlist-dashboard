#!/bin/zsh
set -euo pipefail
cd /Users/antonioridotto/.openclaw/workspace

QUEUE_FILE="/Users/antonioridotto/.openclaw/workspace/tiktok-marketing/next-post.json"
if [[ ! -f "$QUEUE_FILE" ]]; then
  echo "[INFO] next-post.json missing; nothing to post" >&2
  exit 0
fi

DIR=$(python3 - <<'PY'
import json
p='/Users/antonioridotto/.openclaw/workspace/tiktok-marketing/next-post.json'
with open(p) as f:j=json.load(f)
print(j.get('dir',''))
PY
)
CAPTION=$(python3 - <<'PY'
import json
p='/Users/antonioridotto/.openclaw/workspace/tiktok-marketing/next-post.json'
with open(p) as f:j=json.load(f)
print(j.get('caption',''))
PY
)
TITLE=$(python3 - <<'PY'
import json
p='/Users/antonioridotto/.openclaw/workspace/tiktok-marketing/next-post.json'
with open(p) as f:j=json.load(f)
print(j.get('title',''))
PY
)

if [[ -z "$DIR" || -z "$CAPTION" ]]; then
  echo "[WARN] next-post.json missing required fields (dir/caption)" >&2
  exit 1
fi

/opt/homebrew/bin/node /Users/antonioridotto/.openclaw/workspace/tmp-skill/antonio-gen-z/scripts/post-to-tiktok.js \
  --config /Users/antonioridotto/.openclaw/workspace/tiktok-marketing/config.json \
  --dir "$DIR" \
  --caption "$CAPTION" \
  --title "$TITLE"
