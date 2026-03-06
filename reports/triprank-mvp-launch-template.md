# TripRank MVP Launch Template (Low/Zero-Cost)

## 1) Product Scope (Week 1 MVP)

### Core Promise
"Drive smarter with instant trip scoring and clear feedback."

### Must-Have Features
1. Trip start/stop (manual + auto-detect basic)
2. GPS speed tracking
3. Trip summary (distance, avg speed, max speed, duration)
4. Safety score (simple rule-based v1)
5. History list (last 30 trips)
6. Basic insights (e.g., overspeed events)
7. Paywall-ready structure (free + pro placeholder)

### Explicitly Out of Scope (v1)
- No paid API integrations
- No server dependency required for core flow
- No social features
- No advanced map rendering pipeline

---

## 2) Tech Plan (iOS Swift/SwiftUI)

### Stack
- SwiftUI
- CoreLocation
- Combine / async-await
- Local persistence: SwiftData or Core Data (choose one)

### Architecture
- `TripManager` (state + session lifecycle)
- `LocationService` (permissions + updates)
- `ScoringEngine` (rule-based scoring)
- `TripStore` (persist/load trips)

### Data Model (v1)
- Trip
  - id
  - startedAt / endedAt
  - distanceMeters
  - avgSpeedKmh
  - maxSpeedKmh
  - overspeedCount
  - score

---

## 3) Scoring Logic (v1 - simple)

Start score: 100
- -2 per overspeed event
- -1 per abrupt speed jump event
- floor at 0

Score bands:
- 90-100 Excellent
- 75-89 Good
- 50-74 Needs Improvement
- <50 Risky

---

## 4) UI Screens

1. Onboarding (permission + value)
2. Home (Start Trip / End Trip + live stats)
3. Trip Summary
4. History List
5. Trip Detail
6. Basic Settings
7. Paywall screen (weekly/yearly placeholder)

---

## 5) ASO Draft

### Name
TripRank - Speed Tracker

### Subtitle
Drive score, speed stats, safer trips

### Keywords draft
speed tracker, driving score, trip log, car speed, route tracker

---

## 6) Monetization (Low-Frictions)

### Free
- Limited trip history
- Basic score

### Pro (placeholder in v1)
- Unlimited history
- Trend analytics
- Export PDF/CSV

Pricing test candidates:
- Weekly + trial
- Yearly discount anchor

---

## 7) QA Checklist

- Permissions denied flow works
- Background/foreground trip continuity
- Airplane mode edge case
- Long trip (>1h) stability
- No crash on location interruptions
- Correct units and rounding

---

## 8) Launch Criteria

Ship if:
- Core tracking stable
- Score calculation deterministic
- Summary + history accurate
- Crash-free smoke test passed

---

## 9) 7-Day Execution Plan

Day 1: Project setup + permissions + location stream
Day 2: Trip lifecycle + metrics aggregation
Day 3: Summary + history persistence
Day 4: Scoring engine + UI polish
Day 5: Paywall placeholder + settings + QA pass 1
Day 6: ASO assets draft + QA pass 2
Day 7: TestFlight build + launch checklist

---

## 10) Risk Notes

- GPS noise -> smooth with simple filters
- Battery drain -> tune update frequency
- Legal/safety wording -> avoid medical/safety claims
