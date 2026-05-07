# Future Idea: Native App (iOS / Android)

**Status:** Deferred — web app first
**Last updated:** 2026-05-07

---

## Current Platform

PWA (Progressive Web App) via a React/Vite build. Mobile web accessed via browser. No app store listing.

---

## Why Native Matters (Eventually)

1. **HealthKit access** — required for Apple Health integration (HRV, sleep, workouts). HealthKit is iOS-only and requires a native app.
2. **Background processing** — push notifications for the Sunday SIGNAL report, daily logging reminders. PWA push notifications are limited on iOS.
3. **Barcode scanner** — camera access for food barcode scanning is technically possible in a PWA but noticeably less reliable than a native implementation.
4. **App Store discoverability** — non-trivial for the target audience (Apple ecosystem, fitness-focused).
5. **Offline logging** — service workers can handle offline for reading, but syncing offline logs reliably is a native-level concern.

---

## Why Deferred

- Native development requires maintaining two codebases (iOS + Android) or adopting React Native / Expo — a significant scope increase
- The web app can reach early users and validate the core loop without app store review cycles
- PWA on iOS Safari is functional for the v1.0 feature set
- First, prove product-market fit on web before investing in native

---

## Migration Path (when the time comes)

**Preferred:** React Native (Expo) — allows sharing business logic and component logic with the existing React codebase. The design tokens, API client, and hooks are portable.

**Not preferred:** Swift/Kotlin native — correct choice technically but doubles the engineering surface area for a small team.

**Phased approach:**
1. Web PWA (current)
2. Capacitor wrapper (native shell around the existing web app) — unlocks HealthKit and push notifications with minimal code changes
3. True React Native rewrite when the product is stable and growth justifies it

---

## Design Considerations for Native

The visual language is already designed for mobile-first. Specific native considerations:
- Safe area insets (notch / Dynamic Island on iPhone)
- Haptic feedback on key interactions (entry logged, state transition)
- Keyboard avoidance for the command bar (web handles this adequately; native would be smoother)
- Swipe-back gesture must not conflict with card expand/collapse swipe
