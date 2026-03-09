# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

### SwiftUI / iPhone fullscreen fix (important)

- Symptom: black bars at top/bottom on iPhone simulator.
- Fix:
  1. Ensure `Info.plist` contains `UILaunchScreen` as an empty Dictionary (`<key>UILaunchScreen</key><dict/>`).
  2. Rebuild app.
  3. Reset simulator cache when needed: `Erase All Content and Settings`.
- Note: This should be applied by default for new SwiftUI app prototypes to avoid compatibility/letterboxing issues.
