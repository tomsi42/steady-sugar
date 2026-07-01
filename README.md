# SteadySugar

A personal health tracking app for iOS, Android, and web. Log blood sugar readings, food and drink, and weight — all in one place. Built with Expo and React Native.

## Features

- **Blood sugar** — log readings with context (fasting, before/after meal, random); colour-coded against your target range
- **Food & drink** — log meals by category; optional photo attachment
- **Weight** — log daily weight with notes
- **Graph** — visualise blood sugar and weight over time (today / 7 days / 30 days), with previous/next paging and swipe navigation
- **Contour CSV import** — import blood sugar readings from a Contour glucose meter's CSV export (Norwegian locale)
- **Export / Import** — back up all data to a JSON file; restore on any device
- **Localisation** — English and Norwegian Bokmål; auto-detected from device language
- **Web support** — runs in a browser (Safari, Chrome) via async SQLite (wa-sqlite/WebAssembly)

## Tech stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 56 / React Native 0.85 |
| Language | TypeScript |
| Navigation | React Navigation (native stack + bottom tabs) |
| UI | React Native Paper (Material Design 3) |
| Database | expo-sqlite + Drizzle ORM (async API) |
| State | Zustand v5 |
| Charts | Victory Native + React Native Skia (font: @expo-google-fonts/inter) |
| Date/time picker | @react-native-community/datetimepicker |
| Localisation | i18next + react-i18next + expo-localization |
| Testing | Jest + jest-expo + Testing Library |

## Getting started

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode), or Android SDK + NDK (for local Android builds), or just a browser (web)

### Install

```bash
git clone <repo-url>
cd steady-sugar
npm install
```

### Run

```bash
# Start the dev server
npx expo start

# iOS simulator
npm run ios

# Android — builds and installs locally via the Android SDK/NDK (no Expo Go needed)
npm run android

# Web — runs in a browser
npx expo start --web
```

Android builds need `ANDROID_HOME`/`ANDROID_SDK_ROOT` set and a JDK the Android Gradle Plugin supports (JDK 21 is known-good for this project; very new JDKs can trip a Gradle/AGP incompatibility — see `android/gradle/wrapper/gradle-wrapper.properties` if a fresh `expo prebuild` ever resets the pinned Gradle version).

### Test

```bash
# Run all tests once
npm run test:ci

# Run in watch mode
npm test

# Type-check without emitting
npm run typecheck
```

## Project structure

```
src/
  app/              # Navigation and theme
  features/
    blood_sugar/    # Readings — store, repository, form, card, log screen
    food_log/       # Food entries — store, repository, form, card
    weight/         # Weight entries — store, repository, form, card
    graph/          # Chart screen (with paging/navigation) and utilities
    settings/       # Settings, onboarding, export/import, Contour CSV import
  shared/
    components/     # DateTimeInput (platform-split: default/android/web)
    database/       # SQLite client, Drizzle schema
    i18n/           # Translation files (en, nb)
    skia/           # initSkiaWeb — loads CanvasKit font/WASM on web only
    utils/          # Date/time helpers, grouping utilities
```

For a detailed reference (navigation tree, DB schema, state patterns, boot sequence) see [MAP.md](MAP.md).

## Data & privacy

All data is stored locally on the device in an SQLite database. Nothing is sent to any server. The export feature writes a JSON file that you save yourself — no cloud sync.

## Version history

| Version | What changed |
|---|---|
| v1.3.0 | Graph previous/next navigation + swipe; fixed missing chart axis labels on web; fixed Android date/time picker reopen loop |
| v1.2.1 | Contour glucose meter CSV import |
| v1.2.0 | Web support (async SQLite via wa-sqlite/WebAssembly) |
| v1.1.1 | Native date/time pickers; weight logging fix |
| v1.1.0 | Norwegian localisation, food photos, data export/import |
| v1.0.0 | Initial release — blood sugar, food, weight, graph, settings, onboarding |
