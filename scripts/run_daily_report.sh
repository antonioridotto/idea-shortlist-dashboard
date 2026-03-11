#!/bin/zsh
set -euo pipefail
cd /Users/antonioridotto/.openclaw/workspace
/opt/homebrew/bin/node /Users/antonioridotto/.openclaw/workspace/tmp-skill/antonio-gen-z/scripts/daily-report.js --config /Users/antonioridotto/.openclaw/workspace/tiktok-marketing/config.json --days 3
