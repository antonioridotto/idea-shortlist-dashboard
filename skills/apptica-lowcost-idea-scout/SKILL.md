---
name: apptica-lowcost-idea-scout
description: Find low/zero-cost mobile app opportunities from Apptica with strict filtering and ranking. Use when Ibrahim asks for daily app ideas, hidden opportunities, GAP analysis, competitor/saturation review, or weekly idea ranking. Enforce this workflow: build 30 non-game pool first, scan 10-20 pages, rolling release window 30->60->90 days, validate direct App Store link + free-to-install + first release date, exclude prior disliked/repeated apps, and output ranked ideas with GAP/opportunity rationale.
---

# Apptica Low-Cost Idea Scout

Execute exactly:

1. Build a candidate pool of 30 NON-GAME apps from Apptica Top Apps (US first).
2. Scan at least 10 pages, up to 20 pages.
3. Apply rolling first-release window:
   - Start with <=30 days
   - If <3 valid ideas, expand to <=60
   - If still <3, expand to <=90
4. Validate each candidate strictly:
   - Direct `apps.apple.com` link only
   - `price == 0.0` (free-to-install)
   - Use App Store `releaseDate` (never update date)
   - Consumer-friendly only (exclude dev/debug tools)
5. Apply exclusions:
   - `/Users/antonioridotto/.openclaw/workspace/reports/idea-exclude-list.txt`
   - `/Users/antonioridotto/.openclaw/workspace/reports/daily-idea-history.jsonl`
6. Prioritize low/zero-cost feasibility:
   - No paid APIs
   - Free APIs allowed
   - Avoid heavy recurring content requirements
7. Output top ideas with:
   - App name
   - Direct App Store link
   - First release date
   - Revenue signal
   - GAP analysis
   - Competitor/saturation analysis
   - Opportunity level (low/medium/high)
   - Low-cost rationale

If fewer than requested ideas pass strict checks, report exact scanned-page count and elimination reasons.
