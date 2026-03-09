# BUILD LOG

## 2026-03-09

### Implemented
- Started **GLP-1 Tracker MVP** in SwiftUI.
- Added a working prototype screen with:
  - Injection logging (date, dose, optional note)
  - History list with delete support
  - Next-shot calculation (7-day cadence from last injection)
  - Days remaining label (`Today`, `Overdue`, `N days`)

### Update (17:49 CET)
- Added an **Adherence** section in the prototype UI.
- Implemented `adherenceStreakWeeks` (counts consecutive weekly injections with a 6-8 day tolerance).
- Implemented `completedThisMonth` metric.

### Changed Files
- `weekly-projects/glp1-tracker/GLP1TrackerPrototype.swift`
- `weekly-projects/glp1-tracker/BUILD_LOG.md`

### Update (Later)
- Added multi-screen app structure with `TabView`:
  - Log
  - History
  - Stats
  - Settings
- Added local persistence for entries using `UserDefaults` + `Codable`.
- Added persisted settings with `@AppStorage`:
  - default dose
  - reminder enabled
  - reminder hour
