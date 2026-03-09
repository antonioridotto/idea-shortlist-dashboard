# Reflex Rush (Week 11 Project)

Tiny mobile arcade prototype focused on fast sessions + retention loops.

## 2026-03-09 progress
- Added deterministic core game loop in `game_logic.py`
- Implemented scoring with streak bonus
- Added miss tracking for balancing difficulty

Progress update: wired core logic to a simple SwiftUI prototype in `ReflexRushPrototype.swift`.

Next: run first 10 test sessions and tune speed/miss thresholds.

## How to run (Xcode)
1. Create a new iOS App project in Xcode (SwiftUI lifecycle).
2. Drag `ReflexRushPrototype.swift` into the project target.
3. In your app entry view, set:
   ```swift
   WindowGroup { ReflexRushPrototypeView() }
   ```
4. Build and run on simulator/device.

Notes:
- Deterministic mode is enabled by default (`seed: 42`) for repeatable testing.
- Current game-over threshold is `10` misses.
