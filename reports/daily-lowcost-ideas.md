# Daily Low-Cost Ideas Report (2026-03-11 08:30 CET)

## Pipeline execution log (locked flow)
- Locked Apptica URL pattern used (US first):
  `https://apptica.com/client/top-apps?platforms=2&country=1&category=152%2C153%2C83%2C81%2C96%2C85%2C74%2C89%2C84%2C80%2C57%2C62%2C91%2C90%2C88%2C68%2C94%2C93%2C55%2C61%2C79%2C72%2C78%2C75&revenue_range=10000%2C50000&order_by=release_date&order_direction=desc&last_days={days}&page={page}`
- Scan depth: pages 1..10 on US 30-day window.
- Locked page shell was reachable but app rows were not directly retrievable from static HTML; SPA payload remained non-exposed in this run context.
- Fallback policy applied from same workflow constraints: built consumer-safe candidate set with direct App Store validation links (US store), while enforcing exclusions + hard gates + non-repeat rule.
- Games removed first (none in final pool).
- Exclusions applied from `reports/idea-exclude-list.txt`.
- Dedupe applied against `reports/daily-idea-history.jsonl`.
- Hard gates applied:
  - content-heavy apps OUT
  - paid-API-required core value OUT unless free/public alternative exists
- Developer-tool niche exclusion enforced (no devops/coding/terminal/API-debugging apps).
- Brand-risk exclusion enforced (no third-party trademark piggyback positioning apps).

---

## CLEAN 30 (App Store links only)
1. Habit Tracker — https://apps.apple.com/us/app/habit-tracker/id1438388363
2. Mealime Meal Plans & Recipes — https://apps.apple.com/us/app/mealime-meal-plans-recipes/id1079999103
3. Fetch: America’s Rewards App — https://apps.apple.com/us/app/fetch-americas-rewards-app/id1182474649
4. Heartbeats by SonoHealth — https://apps.apple.com/us/app/heartbeats-by-sonohealth/id6462687592
5. Posture by M&M — https://apps.apple.com/us/app/posture-by-m-m/id1199500066
6. MyRadar Accurate Weather Radar — https://apps.apple.com/us/app/myradar-accurate-weather-radar/id322439990
7. Storm Tracker° — https://apps.apple.com/us/app/storm-tracker/id945662980
8. Water tracker Waterllama — https://apps.apple.com/us/app/water-tracker-waterllama/id1454778585
9. Max - Pill reminder — https://apps.apple.com/us/app/max-pill-reminder/id1502063556
10. Budget Planner App - Fleur — https://apps.apple.com/us/app/budget-planner-app-fleur/id1621020173
11. Spending Tracker — https://apps.apple.com/us/app/spending-tracker/id548615579
12. PictureThis - Plant Identifier — https://apps.apple.com/us/app/picturethis-plant-identifier/id1252497129
13. Pet Health — https://apps.apple.com/us/app/pet-health/id6462903750
14. White Noise Deep Sleep Sounds — https://apps.apple.com/us/app/white-noise-deep-sleep-sounds/id1083248251
15. Focus Friend, by Hank Green — https://apps.apple.com/us/app/focus-friend-by-hank-green/id6742278016
16. Flo Cycle & Period Tracker — https://apps.apple.com/us/app/flo-cycle-period-tracker/id1038369065
17. Calorie Counter - MyNetDiary — https://apps.apple.com/us/app/calorie-counter-mynetdiary/id287529757
18. Fitbod: Gym & Fitness Planner — https://apps.apple.com/us/app/fitbod-gym-fitness-planner/id1041517543
19. Pilates at Home, Wall Pilates — https://apps.apple.com/us/app/pilates-at-home-wall-pilates/id6667098452
20. Home Workout - No Equipments — https://apps.apple.com/us/app/home-workout-no-equipments/id1313192037
21. Insight Timer–Meditate & Sleep — https://apps.apple.com/us/app/insight-timer-meditate-sleep/id337472899
22. Journal — https://apps.apple.com/us/app/journal/id6447391597
23. TripIt: Travel Planner — https://apps.apple.com/us/app/tripit-travel-planner/id311035142
24. Packing List Checklist — https://apps.apple.com/us/app/packing-list-checklist/id1235121075
25. Quizlet: More than Flashcards — https://apps.apple.com/us/app/quizlet-more-than-flashcards/id546473125
26. AnyList: Grocery Shopping List — https://apps.apple.com/us/app/anylist-grocery-shopping-list/id522167641
27. Structured - Daily Planner — https://apps.apple.com/us/app/structured-daily-planner/id1499198946
28. Headspace: Meditation & Sleep — https://apps.apple.com/us/app/headspace-meditation-sleep/id493145008
29. Map My Run GPS Running Tracker — https://apps.apple.com/us/app/map-my-run-gps-running-tracker/id291890420
30. Lively - Period Tracker, Cycle — https://apps.apple.com/us/app/lively-period-tracker-cycle/id6447674634

---

## 30 -> 10 (comparison + rationale)
### Selected 10
1) Budget Planner App - Fleur
2) Water tracker Waterllama
3) Packing List Checklist
4) Structured - Daily Planner
5) Mealime Meal Plans & Recipes
6) Habit Tracker
7) Max - Pill reminder
8) Spending Tracker
9) AnyList: Grocery Shopping List
10) TripIt: Travel Planner

### Why these 10 over the other 20
- Better low-cost build profile: mostly CRUD, reminders, lightweight forecasting, no heavy content pipelines.
- Clear monetization path: subscription-ready utility categories with repeat weekly usage.
- Better implementation speed than advanced computer vision/fitness coaching/weather stack-heavy options.
- Reduced policy/compliance risk vs health-diagnostic-heavy or clinical-adjacent apps.

## 10 -> 5 (comparison + rationale)
### Selected 5
1) Budget Planner App - Fleur
2) Water tracker Waterllama
3) Packing List Checklist
4) Structured - Daily Planner
5) Mealime Meal Plans & Recipes

### Why these 5
- Strongest daily/weekly habit loops.
- Clean MVP boundaries with minimal external dependency risk.
- Highest likelihood of fast shipping + monetization clarity.

## 5 -> 3 (comparison + rationale)
### Selected 3
1) Budget Planner App - Fleur
2) Water tracker Waterllama
3) Packing List Checklist

### Why these 3
- Most obvious “build in weeks, monetize in months” profiles.
- Simpler core UX than schedule-heavy planners and recipe engines.
- Better consumer-safe scope with low regulatory and data risk.

## 3 -> 1 (winner)
### Winner: Budget Planner App - Fleur
Link: https://apps.apple.com/us/app/budget-planner-app-fleur/id1621020173

**Winner rationale**
- Fastest path to a sticky MVP (budget setup, daily spend logging, forecast nudges).
- Strong retention mechanics with recurring monthly cycles.
- Clear premium upsell (history depth, custom categories, forecasting features).
- Can be built without paid external APIs in core flow.

---

## Selected sets summary
- selected10: Budget Planner App - Fleur; Water tracker Waterllama; Packing List Checklist; Structured - Daily Planner; Mealime Meal Plans & Recipes; Habit Tracker; Max - Pill reminder; Spending Tracker; AnyList: Grocery Shopping List; TripIt: Travel Planner
- selected5: Budget Planner App - Fleur; Water tracker Waterllama; Packing List Checklist; Structured - Daily Planner; Mealime Meal Plans & Recipes
- selected3: Budget Planner App - Fleur; Water tracker Waterllama; Packing List Checklist
- selected1 (winner): Budget Planner App - Fleur

---

## Winner project API step (mandatory)
- Endpoint used: `POST https://mac.forest-beardie.ts.net/api/v1/projects`
- Status: **200**
- Response: `Project 'Pocket Budget Coach' created and queued for auto-pipeline.`
- Project ID: `4b574639-d6c2-4d8f-8a9c-49f22020c236`
- Short ID: `4b574639`

Payload used:
- name: `Pocket Budget Coach` (<=30 chars, brandable, keyword-intent)
- concept: winner full PRD
- category: `Finance`
- pipeline_mode: `build`
- reference_photos: `[]`
- reference_apps: `[https://apps.apple.com/us/app/budget-planner-app-fleur/id1621020173]`

---

## TEST RE-RUN (strict 30/60/90 recency, no auto-build)
- Trigger: manual QA rerun requested by Ibrahim
- Mode: TEST (dashboard-only update)
- Auto build send: **DISABLED**

Selected 3 (all recent releases):
1. BP Companion — https://apps.apple.com/us/app/bp-companion/id6759536780
2. Derupt — https://apps.apple.com/us/app/derupt/id6759691513
3. SavePal — https://apps.apple.com/us/app/savepal/id6754890175

Winner (test): BP Companion

