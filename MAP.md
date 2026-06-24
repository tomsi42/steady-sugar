# SugarWise — Codebase Map

Quick-reference for navigating the project without scanning every file. Keep this file up to date when adding files, changing patterns, or learning new gotchas.

---

## Tech Stack (pinned versions)

| Layer | Library | Version |
|---|---|---|
| Framework | React Native + Expo (managed) | SDK 56 / RN 0.85.3 |
| Language | TypeScript | ~6.0.3 |
| UI | React Native Paper (Material 3) | ^5.15.3 |
| Navigation | React Navigation (native stack + bottom tabs) | ^7.x |
| State | Zustand | ^5.0.14 |
| Database | expo-sqlite + Drizzle ORM | sqlite ~56.0.5 / drizzle ^0.45.2 |
| Charting | Victory Native + @shopify/react-native-skia | ^41.26.0 / ^2.6.6 |
| Icons | @expo/vector-icons (MaterialCommunityIcons) | ^15.0.2 |
| Gestures | react-native-gesture-handler | ~2.31.1 |
| Testing | jest-expo + @testing-library/react-native | ^56.0.5 / ^14.0.1 |

---

## Root Files

| File | Purpose |
|---|---|
| `App.tsx` | Entry point. Initialises DB, loads settings, decides onboarding vs main nav. |
| `index.ts` | Expo entry — just registers App. |
| `app.json` | Expo config: name "SugarWise", slug "sugar-wise", version "1.0.0", plugins: ["expo-sqlite"]. |
| `PLAN.md` | Milestone plan. Source of truth for what to build and in what order. |
| `SPECIFICATION.md` | Full product spec. Wins in any disagreement with code or PLAN.md. |
| `MAP.md` | This file. |
| `drizzle.config.ts` | Drizzle Kit config (for schema generation/migration tooling). |
| `tsconfig.json` | TypeScript config. |

---

## Source Tree

```
src/
├── app/
│   ├── navigation.tsx          # Full nav tree (stack + tabs)
│   └── theme.ts                # React Native Paper theme overrides
│
├── features/
│   ├── blood_sugar/
│   │   ├── __tests__/
│   │   │   ├── BloodSugarCard.test.tsx
│   │   │   ├── colorForBloodSugar.test.ts
│   │   │   ├── groupReadingsByDate.test.ts
│   │   │   └── store.test.ts
│   │   ├── components/
│   │   │   └── BloodSugarCard.tsx   # List card for a single reading
│   │   ├── screens/
│   │   │   ├── BloodSugarFormScreen.tsx  # Add / edit reading
│   │   │   └── LogScreen.tsx             # Combined log list (all entry types)
│   │   ├── utils/
│   │   │   ├── colorForBloodSugar.ts    # mmol/L → hex colour
│   │   │   └── groupReadingsByDate.ts   # Bucket readings into date groups
│   │   ├── repository.ts   # Drizzle queries for blood_sugar_readings
│   │   └── store.ts        # Zustand store (readings[])
│   │
│   ├── food_log/
│   │   ├── __tests__/
│   │   │   ├── FoodCard.test.tsx
│   │   │   ├── categoryColors.test.ts
│   │   │   └── store.test.ts
│   │   ├── components/
│   │   │   └── FoodCard.tsx          # List card for a food entry
│   │   ├── screens/
│   │   │   └── FoodFormScreen.tsx    # Add / edit food entry
│   │   ├── utils/
│   │   │   └── categoryColors.ts     # CATEGORY_COLORS + CATEGORY_LABELS maps
│   │   ├── repository.ts
│   │   └── store.ts                  # Zustand store (entries[])
│   │
│   ├── weight/
│   │   ├── __tests__/
│   │   │   ├── WeightCard.test.tsx
│   │   │   └── store.test.ts
│   │   ├── components/
│   │   │   └── WeightCard.tsx
│   │   ├── screens/
│   │   │   └── WeightFormScreen.tsx  # Add / edit weight entry (date only, no time)
│   │   ├── repository.ts
│   │   └── store.ts
│   │
│   ├── graph/
│   │   ├── __tests__/
│   │   │   ├── filterByTimeRange.test.ts
│   │   │   └── groupMealMarkers.test.ts
│   │   ├── screens/
│   │   │   └── GraphScreen.tsx       # Blood sugar + weight charts
│   │   └── utils/
│   │       ├── filterByTimeRange.ts  # Filter any timestamped array by range
│   │       └── groupMealMarkers.ts   # Collapse food entries within 30-min windows
│   │
│   └── settings/
│       ├── __tests__/
│       │   └── store.test.ts
│       ├── screens/
│       │   ├── OnboardingWelcomeScreen.tsx      # Screen 1 of onboarding
│       │   ├── OnboardingNameScreen.tsx         # Screen 2 — user name input
│       │   ├── OnboardingTargetRangeScreen.tsx  # Screen 3 — target range + Done
│       │   └── SettingsScreen.tsx               # Main settings (name, targets, export, clear)
│       ├── repository.ts   # get / upsert / clearAll for app_settings
│       └── store.ts        # Zustand store (settings, targetMinMmol, targetMaxMmol)
│
└── shared/
    ├── database/
    │   ├── client.ts    # db singleton (drizzle), initDatabase()
    │   └── schema.ts    # All four Drizzle table definitions + inferred types
    ├── types/
    │   └── logEntry.ts  # LogEntry discriminated union + entryTimestamp()
    └── utils/
        ├── __tests__/
        │   ├── dateTimeText.test.ts
        │   └── groupEntriesByDate.test.ts
        ├── dateTimeText.ts       # parse/format DD/MM/YYYY and HH:MM helpers
        └── groupEntriesByDate.ts # Bucket LogEntry[] into date group sections
```

---

## Navigation Tree

```
RootStack (headerShown: false by default)
├── OnboardingWelcome         — headerShown: false
├── OnboardingName            — headerShown: true, title: ''
├── OnboardingTargetRange     — headerShown: true, title: ''
├── Tabs (TabNavigator)       — Settings cog in headerRight on both tabs
│   ├── Log                   — LogScreen
│   └── Graph                 — GraphScreen
├── Settings                  — SettingsScreen, headerShown: true
├── BloodSugarForm            — BloodSugarFormScreen, title set by useLayoutEffect
├── FoodForm                  — FoodFormScreen
└── WeightForm                — WeightFormScreen
```

`AppNavigator` receives `isOnboarded: boolean` from App.tsx and sets `initialRouteName` accordingly.

The Settings cog uses `useNavigation<NavigationProp<RootStackParamList>>()` inside a `SettingsButton` component defined in `TabNavigator` — avoids the `any` type that would come from passing tab navigation as a prop.

---

## Database

### Connection & Initialisation

- **File:** `src/shared/database/client.ts`
- `openDatabaseSync('sugarwise.db')` — synchronous Expo SQLite
- `drizzle(sqlite, { schema })` — Drizzle ORM wrapper
- `initDatabase()` — called once in `App.tsx` before anything else; runs `CREATE TABLE IF NOT EXISTS` for all four tables + default settings row
- All Drizzle queries use the **synchronous API**: `.all()`, `.get()`, `.run()`, `.returning().get()` — no async/await anywhere in repositories

### Timestamp Handling (critical gotcha)

Drizzle `mode: 'timestamp'` stores Unix seconds as an INTEGER. On read, `mapFromDriverValue` returns `new Date(value * 1000)`. So `BloodSugarReading.timestamp` is a `Date` object in TypeScript — but the raw SQLite value is seconds, not milliseconds.

### Schema (`src/shared/database/schema.ts`)

```
blood_sugar_readings  →  BloodSugarReading / NewBloodSugarReading / BloodSugarContext
food_entries          →  FoodEntry / NewFoodEntry / FoodCategory
weight_entries        →  WeightEntry / NewWeightEntry
app_settings          →  AppSettings  (always id = 1, single row)
```

All schema types are inferred via `$inferSelect` / `$inferInsert` — never defined manually.

---

## State Management

Each feature has a Zustand store with the same shape:

```ts
{
  entries/readings: T[],   // in-memory cache, order: timestamp DESC
  load()                   // initial hydration from DB
  add(data)                // insert + prepend to array
  update(id, data)         // update DB + replace in array
  remove(id)               // delete from DB + filter array
  restore(data)            // insert + re-sort DESC (used by Undo snackbar)
}
```

Settings store is different: holds `settings: AppSettings | null` plus convenience fields `targetMinMmol` / `targetMaxMmol` for direct use in GraphScreen without destructuring.

**Loading pattern:** `App.tsx` calls `useSettingsStore.getState().load()` synchronously during DB init. Each screen that needs data calls `store.load()` in a `useEffect` — safe to call multiple times (idempotent overwrite).

**Cross-store mutation** (used only in SettingsScreen "Clear all data"): direct `setState` calls on other stores (`useBloodSugarStore.setState({ readings: [] })`) — avoids circular imports between store files.

---

## Key Patterns

### Repository Pattern

Every feature has a `repository.ts` that only talks to Drizzle. Stores call repositories. Nothing else touches `db` directly except `client.ts` and `settings/repository.ts` (which also handles cross-table deletes in `clearAll`).

### Form Screens

All three form screens follow the same structure:
1. Read `route.params` for optional `entryId` / `readingId`
2. Look up existing entry — if found, it's edit mode
3. `useLayoutEffect` sets the header title based on edit/add mode
4. Date/time entered as text (`DD/MM/YYYY` + `HH:MM`), parsed on save via `dateTimeText.ts`
5. `navigation.goBack()` after save

Weight form is date-only (no time field); uses `dateAtNoon()` to store noon timestamps.

### Date / Time Input

**File:** `src/shared/utils/dateTimeText.ts`

- `formatDateInput(raw)` / `formatTimeInput(raw)` — strip non-digits, auto-insert `/` or `:` as user types
- `parseDateText('DD/MM/YYYY')` → `Date | null` — validates calendar validity (Feb 29 on non-leap year, April 31, etc.), rejects years outside 2000–2100
- `parseTimeText('HH:MM')` → `{ hours, minutes } | null`
- `formatDateText(date)` / `formatTimeText(date)` — format a Date for display/initialisation

### LogScreen (combined list)

`LogScreen.tsx` is in `features/blood_sugar/screens/` but renders all three entry types. It:
- Reads from all three stores + settings store
- Merges into `LogEntry[]` (discriminated union), sorts by timestamp DESC
- Groups with `groupEntriesByDate()` → renders via `SectionList`
- Dispatches to `BloodSugarCard`, `FoodCard`, or `WeightCard` by `entry.type`
- FAB opens a bottom sheet with three options

### Graph Screen

`GraphScreen.tsx` uses Victory Native's `CartesianChart` with a render-prop API. Key gotchas:

- **CartesianChart sorts data ascending by xKey internally.** Never use `data[i]` index inside the render prop to look up the original array — use `point.yValue` instead.
- `domainPadding` is in **pixel units**, not data units.
- Meal marker bars use `barH = 8`. Positioned at `chartBounds.bottom - barH`. Data points with `domainPadding.bottom = 8` sit ~23 px above `chartBounds.bottom` (includes ~15 px of natural tick-rounding clearance for typical mmol ranges).
- `point.y` / `point.x` = pixel coords; `point.yValue` / `point.xValue` = original data values.

### Blood Sugar Colours

`colorForBloodSugar(mmol)` in `features/blood_sugar/utils/`:

| Range | Colour |
|---|---|
| < 3.9 | `#E53935` (red — hypo) |
| 3.9 – 7.8 | `#4CAF50` (green — in range) |
| 7.9 – 13.2 | `#FFB300` (amber — elevated) |
| ≥ 13.3 | `#E53935` (red — dangerously high) |

### Category Colours

`CATEGORY_COLORS` / `CATEGORY_LABELS` in `features/food_log/utils/categoryColors.ts`. Used by FoodFormScreen (chip selector) and FoodCard. Also imported by SettingsScreen for the read-only categories list.

---

## Testing

- **Runner:** `jest-expo` preset
- **Test location:** `__tests__/` inside each feature directory; shared utils in `src/shared/utils/__tests__/`
- **What is tested:** Pure logic (repositories, stores via mocked DB, utilities, card rendering)
- **What is not tested:** Screens (integration), navigation
- **DB mocking:** `src/shared/database/client.ts` is auto-mocked by jest-expo; repositories are mocked at the store-test boundary
- **Coverage:** 100% statements/functions/lines; 89.6% branches (trivial gaps: Sunday path in ISO-week grouping, `r.id !== id` arm in store map callbacks)
- **Run:** `npx jest --passWithNoTests` or `npm run test:ci`

---

## App Boot Sequence

```
index.ts
  └── App.tsx
        ├── initDatabase()          # CREATE TABLE IF NOT EXISTS, seed settings row
        ├── useSettingsStore.load() # SELECT from app_settings
        ├── read settings.userName  # determines isOnboarded
        └── setDbReady(true)        # shows ActivityIndicator until this point
              └── AppNavigator({ isOnboarded })
                    └── initialRouteName = 'OnboardingWelcome' | 'Tabs'
```

---

## Theme

**File:** `src/app/theme.ts` — extends `MD3LightTheme`

| Token | Value |
|---|---|
| primary | `#00897B` (deep teal) |
| secondary | `#FF6F00` (warm orange) |
| background | `#FAFAFA` |
| surface | `#FFFFFF` |
| onSurface | `#212121` |

---

## v1.1.0 — Planned Changes

### M7: Localization
- New directory: `src/shared/i18n/` with `en.json` + `nb.json`
- New deps: `i18next`, `react-i18next`, `expo-localization`
- All screen strings wrapped in `t()`
- Auto-detects device locale; falls back to English

### M8: Food Photos
- **Schema migration required:** `ALTER TABLE food_entries ADD COLUMN photo_uri TEXT`
- Add `photoUri?: string` to `foodEntries` Drizzle schema
- `initDatabase()` must run the migration on first boot after upgrade
- New dep: `expo-image-picker`
- `FoodFormScreen` gains optional photo picker
- `FoodCard` gains thumbnail when `photoUri` is set

### M9: Data Export / Import
- New deps: `expo-file-system`, `expo-sharing`, `expo-document-picker`
- Export: serialize all four tables to JSON (photos excluded), write to temp file, share sheet
- Import: pick JSON file, validate, merge-insert (skip existing IDs)
- Settings screen Export/Import buttons become active (replace "Coming in v2" placeholders)

---

## Scripts

| Command | What it does |
|---|---|
| `npm run start` | Start Expo dev server |
| `npm run ios` | Start on iOS simulator |
| `npm run test:ci` | Run all tests once (no watch) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Drizzle Kit: generate migration SQL from schema |
