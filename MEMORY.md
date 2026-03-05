# MEMORY

## App idea scouting workflow (locked)

- Source: Apptica Top Apps with Ibrahim-provided filter link pattern.
- Build candidate pool by removing games first, then collect **30 non-game apps**.
- Scan depth: minimum 10 pages, extend up to 20 pages if needed.
- Rolling first-release window: 30 days; if <3 valid, expand to 60, then 90.
- Strict validation per idea:
  - Direct App Store link (`apps.apple.com`) only
  - Free-to-install only (`price == 0.0`)
  - First release date from App Store `releaseDate` (never update date)
  - Consumer-friendly (exclude developer/debug tools)
  - No paid APIs required (free APIs allowed)
  - Avoid heavy recurring content requirements
- Analysis required for each final idea:
  - GAP analysis
  - Competitor intensity / market saturation
  - Opportunity level (low/medium/high)
  - Low-cost rationale
- Deduping:
  - Do not repeat prior daily ideas (`reports/daily-idea-history.jsonl`)
  - Respect explicit exclusions (`reports/idea-exclude-list.txt`)
- Excluded ideas currently:
  - Wayk: Alarm Clock to Wake Up
  - ApiCatcher - Capture HTTPS
  - MoneyPilot: Class Action
  - ADB Connect & Debugger for ATV
  - Open Road: Drive Tracker
