# Idea Workflow Lock (Ibrahim)

## Mandatory execution order (daily)
1. Use Ibrahim locked Apptica URL pattern only:
   `https://apptica.com/client/top-apps?platforms=2&country=1&category=152%2C153%2C83%2C81%2C96%2C85%2C74%2C89%2C84%2C80%2C57%2C62%2C91%2C90%2C88%2C68%2C94%2C93%2C55%2C61%2C79%2C72%2C78%2C75&revenue_range=10000%2C50000&order_by=release_date&order_direction=desc&last_days={days}&page={page}`
2. Build raw pool via page scan depth 10..20 (US first, then WW fallback if needed).
3. Remove games first.
4. Apply exclusions from `reports/idea-exclude-list.txt`.
5. Apply dedupe from `reports/daily-idea-history.jsonl`.
6. Build/share CLEAN non-game pool (target 30).
7. Pick top 3 ONLY from that same clean pool.
8. Include App Store links + GAP + saturation + opportunity + low-cost rationale.
9. Third-party API gate (mandatory): if core feature needs an external API, verify a usable public/free API exists first; if only paid/expensive APIs can enable the core value, exclude that app from the 30-list.

## Never do
- Never send raw first-30 as final pool.
- Never pick top-3 outside the clean pool.
- Never output insufficient before completing 30->60->90 expansion and required page depth.


## Ranking policy update (from Ibrahim feedback)
- Do not reject a candidate only because market is crowded if momentum/velocity is clearly strong.
- Ranking priority: Momentum > Build speed > Monetization clarity > Saturation risk.
- Final 3 must explain momentum explicitly.
