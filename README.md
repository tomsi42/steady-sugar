# SteadySugar

A personal health tracking app for iOS. Log blood sugar readings, food and drink, and weight — all in one place. Built with Expo and React Native.

## Features

- **Blood sugar** — log readings with context (fasting, before/after meal, random); colour-coded against your target range
- **Food & drink** — log meals by category; optional photo attachment
- **Weight** — log daily weight with notes
- **Graph** — visualise blood sugar and weight over time (today / 7 days / 30 days)
- **Export / Import** — back up all data to a JSON file; restore on any device
- **Localisation** — English and Norwegian Bokmål; auto-detected from device language

## Tech stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 56 / React Native 0.85 |
| Language | TypeScript |
| Navigation | React Navigation (native stack + bottom tabs) |
| UI | React Native Paper (Material Design 3) |
| Database | expo-sqlite + Drizzle ORM (sync API) |
| State | Zustand v5 |
| Charts | Victory Native + React Native Skia |
| Localisation | i18next + react-i18next + expo-localization |
| Testing | Jest + jest-expo + Testing Library |

## Getting started

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or the [Expo Go](https://expo.dev/go) app on a physical iPhone

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

# Open on iOS simulator
npx expo start --ios
```

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
    graph/          # Chart screen and utilities
    settings/       # Settings, onboarding, export/import
  shared/
    database/       # SQLite client, Drizzle schema
    i18n/           # Translation files (en, nb)
    utils/          # Date/time helpers, grouping utilities
```

For a detailed reference (navigation tree, DB schema, state patterns, boot sequence) see [MAP.md](MAP.md).

## Data & privacy

All data is stored locally on the device in an SQLite database. Nothing is sent to any server. The export feature writes a JSON file that you save yourself — no cloud sync.

## Version history

| Version | What changed |
|---|---|
| v1.1.0 | Norwegian localisation, food photos, data export/import |
| v1.0.0 | Initial release — blood sugar, food, weight, graph, settings, onboarding |
