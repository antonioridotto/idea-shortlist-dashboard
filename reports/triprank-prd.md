# PRD — TripRank (Speed Tracker)

## 1. Document Info
- Product: TripRank
- Platform: iOS (Swift/SwiftUI)
- Version: v1.0 (MVP)
- Date: 2026-03-06
- Owner: Ibrahim + ANTONIO

---

## 2. Product Summary
TripRank is a low-friction driving utility app that tracks trips, computes a simple driving score, and helps users improve driving behavior over time.

Core value:
- Start/finish trip in seconds
- See clear speed and trip metrics
- Get an easy-to-understand score per trip

---

## 3. Problem Statement
Most speed/trip trackers are either:
- too noisy (raw data, no clear interpretation), or
- too complex (feature-heavy, weak onboarding).

Users need:
1) a simple trip tracker,
2) a clear score they can act on,
3) minimal setup and stable daily use.

---

## 4. Goals & Non-Goals

### Goals (MVP)
- Reliable trip tracking (distance, duration, avg/max speed)
- Simple, transparent trip score
- Trip history for behavior feedback
- Fast onboarding and permission flow

### Non-Goals (MVP)
- No paid API dependencies
- No social/community features
- No advanced map stack or server-heavy analytics
- No insurance/telematics integrations

---

## 5. Target Users
1) Daily drivers who want cleaner driving insights
2) Freelancers/field workers who log frequent trips
3) Utility-first users who prefer minimal UI over gamified complexity

---

## 6. User Stories
- As a driver, I want to start a trip quickly so I don’t waste time.
- As a driver, I want to see my max speed and overspeed events so I can improve.
- As a driver, I want a trip score so I can understand performance at a glance.
- As a user, I want history so I can track progress over time.

---

## 7. Functional Requirements

### FR-1 Onboarding & Permissions
- Explain value in 1-2 screens
- Ask location permission with fallback guidance
- Handle denied permission state cleanly

### FR-2 Trip Lifecycle
- Start Trip / End Trip manually (MVP)
- Store start/end timestamps
- Capture location updates during active trip

### FR-3 Metrics Engine
Compute and display:
- distance (km)
- duration
- avg speed
- max speed
- overspeed count (configurable threshold)

### FR-4 Scoring Engine (Rule-based v1)
- Start score: 100
- Penalty per overspeed event: -2
- Penalty per abrupt speed jump event: -1
- Score floor: 0
- Bands:
  - 90–100 Excellent
  - 75–89 Good
  - 50–74 Needs Improvement
  - <50 Risky

### FR-5 History
- Save trips locally
- Show latest trips list
- Show detail per trip

### FR-6 Settings
- Unit preference (km/h default)
- Overspeed threshold
- Basic app/version/privacy entries

### FR-7 Monetization Placeholder
- Free plan active by default
- Paywall shell for future weekly/yearly offers
- No purchase backend mandatory in MVP

---

## 8. UX Requirements
- Native iOS feel, minimal friction
- Primary actions always visible (Start/End)
- Metrics readable in <2 seconds
- Empty states with clear CTA
- No cluttered dashboards

---

## 9. Technical Requirements
- SwiftUI app architecture
- CoreLocation for tracking
- Local persistence (SwiftData/Core Data)
- Offline-first operation
- No paid third-party API requirement

---

## 10. Data Model (MVP)
Trip entity:
- id
- startedAt
- endedAt
- distanceMeters
- durationSeconds
- avgSpeedKmh
- maxSpeedKmh
- overspeedCount
- speedJumpCount
- score

---

## 11. Analytics Events (MVP)
- onboarding_started
- permission_granted / permission_denied
- trip_started
- trip_ended
- trip_scored
- paywall_opened

---

## 12. Success Metrics
Primary:
- D1 retention
- Trips per active user per week
- % trips completed (started -> ended)

Secondary:
- Avg trips/user
- % users with 3+ trips in week 1
- Paywall open rate (future monetization readiness)

---

## 13. Risks & Mitigations
1) GPS noise / inconsistent data
- Mitigation: smoothing, min-speed threshold, outlier discard

2) Battery usage
- Mitigation: tune update interval and desired accuracy

3) Permission drop-off
- Mitigation: better pre-permission education and fallback UI

4) Over-complex scoring perception
- Mitigation: transparent scoring rules in UI

---

## 14. Release Plan
### MVP Scope Lock
- Onboarding + permission
- Start/end trip
- Metrics + score
- History + settings

### QA Gates
- Permission deny/allow flows
- 10+ trip manual tests
- Long-trip stability
- Crash-free smoke test

### Delivery
- Internal build -> TestFlight -> soft feedback loop

---

## 15. Future Roadmap (Post-MVP)
- Auto trip detection
- Trend analytics dashboard
- Export reports (CSV/PDF)
- Weekly driving improvement coaching
- RevenueCat + production paywall experiments
