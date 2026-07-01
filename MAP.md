# SteadySugar — Codebase Map

Quick-reference for navigating the project without scanning every file. Keep this file up to date when adding files, changing patterns, or learning new gotchas.

---

## Tech Stack (pinned versions)

| Layer | Library | Version |
|---|---|---|
| Framework | React Native + Expo (managed), targets iOS/Android/web | SDK 56 / RN 0.85.3 |
| Language | TypeScript | ~6.0.3 |
| UI | React Native Paper (Material 3) | ^5.15.3 |
| Navigation | React Navigation (native stack + bottom tabs) | ^7.x |
| State | Zustand | ^5.0.14 |
| Database | expo-sqlite + Drizzle ORM | sqlite ~56.0.5 / drizzle ^0.45.2 |
| Charting | Victory Native + @shopify/react-native-skia | ^41.26.0 / 2.6.2 |
| Chart font | @expo-google-fonts/inter (bundled `.ttf`, loaded via `useFont`) | ^0.4.2 |
| Date/time picker | @react-native-community/datetimepicker | 9.1.0 |
| Icons | @expo/vector-icons (MaterialCommunityIcons) | ^15.0.2 |
| Gestures | react-native-gesture-handler | ~2.31.1 |
| Localisation | i18next + react-i18next + expo-localization | ^26.3.2 / ^17.0.8 |
| Web | react-dom + react-native-web (async SQLite via wa-sqlite/WASM) | 19.2.3 / ^0.21.2 |
| Testing | jest-expo + @testing-library/react-native | ^56.0.5 / 14.0.1 |

---

## Root Files

| File | Purpose |
|---|---|
| `App.tsx` | Entry point. Calls `initSkiaWeb()` then `initDatabase()`, loads settings, decides onboarding vs main nav. |
| `index.ts` | Expo entry — just registers App. |
| `app.json` | Expo config: name "SteadySugar", slug "steady-sugar", version tracks `package.json`, plugins: `expo-sqlite`, `expo-localization`, `expo-image-picker`, `expo-sharing`. |
| `eas.json` | EAS Build profiles (`development`, `preview`, `production`) for cloud Android/iOS builds. |
| `assets.d.ts` | Ambient `declare module '*.ttf'` so TypeScript resolves the bundled chart font import. |
| `scripts/copy-canvaskit-wasm.js` | `postinstall` hook — copies `canvaskit-wasm`'s `.wasm` binary into `public/` (gitignored) so web can fetch `/canvaskit.wasm`. Metro doesn't serve `node_modules` directly. |
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
│   │   ├── components/
│   │   │   └── BloodSugarCard.tsx   # List card for a single reading
│   │   ├── screens/
│   │   │   ├── BloodSugarFormScreen.tsx  # Add / edit reading
│   │   │   └── LogScreen.tsx             # Combined log list (all entry types)
│   │   ├── utils/
│   │   │   ├── colorForBloodSugar.ts    # mmol/L → hex colour (fixed clinical thresholds)
│   │   │   └── groupReadingsByDate.ts   # Bucket readings into date groups
│   │   ├── repository.ts   # Drizzle queries for blood_sugar_readings
│   │   └── store.ts        # Zustand store (readings[])
│   │
│   ├── food_log/
│   │   ├── components/FoodCard.tsx
│   │   ├── screens/FoodFormScreen.tsx    # Add / edit food entry, optional photo
│   │   ├── utils/categoryColors.ts       # CATEGORY_COLORS + CATEGORY_LABELS maps
│   │   ├── repository.ts
│   │   └── store.ts
│   │
│   ├── weight/
│   │   ├── components/WeightCard.tsx
│   │   ├── screens/WeightFormScreen.tsx  # Add / edit weight entry (date only, no time)
│   │   ├── repository.ts
│   │   └── store.ts
│   │
│   ├── graph/
│   │   ├── components/
│   │   │   └── GraphChart.tsx        # Lazy-loaded (see Web Support gotcha below); all Skia/victory-native usage lives here
│   │   ├── screens/
│   │   │   └── GraphScreen.tsx       # Chart-type dropdown, time-range selector, prev/next/swipe navigation
│   │   └── utils/
│   │       ├── filterByTimeRange.ts  # Filter by range; shiftAnchor/canGoNext/canGoPrevious/formatDateRangeLabel for paging
│   │       └── groupMealMarkers.ts   # Collapse food entries within 30-min windows
│   │
│   └── settings/
│       ├── __fixtures__/
│       │   └── contourSample.ts      # Real Contour CSV export, embedded as a string (bundled, not read from disk)
│       ├── screens/
│       │   ├── OnboardingWelcomeScreen.tsx      # Screen 1 of onboarding
│       │   ├── OnboardingNameScreen.tsx         # Screen 2 — user name input
│       │   ├── OnboardingTargetRangeScreen.tsx  # Screen 3 — target range + Done
│       │   └── SettingsScreen.tsx               # Name, targets, export/import, Contour import, clear-all, version (reads package.json)
│       ├── utils/
│       │   ├── exportData.ts         # Serialize all tables to JSON, share sheet (native) / download (web)
│       │   ├── importData.ts         # JSON backup import, merge by id
│       │   └── importContourCsv.ts   # Contour meter CSV parser + mapping + import (see below)
│       ├── dataRepository.ts   # Shared read/insert/exists helpers used by export/import (both JSON and Contour)
│       ├── repository.ts       # get / upsert / clearAll for app_settings
│       └── store.ts            # Zustand store (settings, targetMinMmol, targetMaxMmol)
│
└── shared/
    ├── components/
    │   ├── DateTimeInput.tsx          # Default (iOS/fallback) — persistent inline @react-native-community/datetimepicker
    │   ├── DateTimeInput.android.tsx  # Android — tap-to-open button + conditionally-mounted picker (see gotcha below)
    │   └── DateTimeInput.web.tsx      # Web — native <input type="date"/"time">
    ├── database/
    │   ├── client.ts    # db singleton (drizzle), initDatabase() — async API (see Web Support gotcha)
    │   └── schema.ts    # All four Drizzle table definitions + inferred types
    ├── i18n/
    │   └── index.ts     # i18next init; exports `locale` (device language tag) for toLocaleDateString formatting
    ├── skia/
    │   ├── initSkiaWeb.ts       # No-op on native
    │   └── initSkiaWeb.web.ts   # Calls LoadSkiaWeb() — required before any Skia-dependent module is imported
    ├── types/
    │   └── logEntry.ts  # LogEntry discriminated union + entryTimestamp()
    └── utils/
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
- `openDatabaseAsync('steadysugar.db')` — **async** Expo SQLite API (required for web; see Web Support below)
- `drizzle(sqlite, { schema })` — Drizzle ORM wrapper
- `initDatabase()` — called (`await`ed) once in `App.tsx`, after `initSkiaWeb()`, before anything else; runs `CREATE TABLE IF NOT EXISTS` for all four tables + default settings row + the `photo_uri` migration
- All repository methods are `async`/`await` — no synchronous Drizzle calls anywhere

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
  load()                   // initial hydration from DB (async)
  add(data)                // insert + prepend to array (async)
  update(id, data)         // update DB + replace in array (async)
  remove(id)               // delete from DB + filter array (async)
  restore(data)            // insert + re-sort DESC (used by Undo snackbar)
}
```

Settings store is different: holds `settings: AppSettings | null` plus convenience fields `targetMinMmol` / `targetMaxMmol` for direct use in GraphScreen without destructuring.

**Loading pattern:** `App.tsx` awaits `useSettingsStore.getState().load()` during DB init. Each screen that needs data calls `store.load()` in a `useEffect` — safe to call multiple times (idempotent overwrite).

**Cross-store mutation** (used only in SettingsScreen "Clear all data"): direct `setState` calls on other stores (`useBloodSugarStore.setState({ readings: [] })`) — avoids circular imports between store files.

---

## Web Support (M10) — critical gotchas

The app runs in a browser (Safari/Chrome) via `react-native-web` + async SQLite. Two things are easy to silently break on web without any error surfacing in the console until you actually look at the screen:

### 1. Skia needs an explicit web init

`@shopify/react-native-skia`'s web build has no system fonts and no CanvasKit loaded by default. `App.tsx` calls `initSkiaWeb()` (no-op on native, `LoadSkiaWeb()` on web) **before** `initDatabase()`. But that alone isn't enough:

- **Import-order matters.** Any module that does `import { ... } from '@shopify/react-native-skia'` or `'victory-native'` at the top level constructs a Skia singleton **at module-evaluation time** — before `initSkiaWeb()` has a chance to run, if that module is statically imported. This is why `GraphChart.tsx` (all Skia/victory-native usage) is **lazy-loaded** via `React.lazy(() => import('../components/GraphChart'))` in `GraphScreen.tsx`, wrapped in `<Suspense>`. Never convert that back to a static import.
- **Fonts need to be bundled, not system-matched.** `matchFont()` relies on Skia's system `FontMgr`, which is empty on web (populated on native). It silently returns `null` — no error, axis labels just don't render. Use `useFont(fontAsset, size)` with a real bundled `.ttf` (currently `@expo-google-fonts/inter`) instead, on all platforms.
- **The WASM binary needs to be servable.** `LoadSkiaWeb()` fetches `/canvaskit.wasm` from the web root. `scripts/copy-canvaskit-wasm.js` (a `postinstall` hook) copies it from `node_modules/canvaskit-wasm` into `public/` — if that script or the `public/` copy goes missing, web silently gets an HTML 404 page back instead of the WASM binary and Skia fails to load with an unhelpful `WebAssembly.instantiate` error.

### 2. All DB/repository calls must stay async

`openDatabaseAsync`/`execAsync` are required because the synchronous `expo-sqlite` API blocks on `Atomics.wait()`, which browsers refuse on the main thread. If you ever see "Sync operation timeout" on web, something regressed back to a sync call somewhere in the DB layer.

---

## Android Gotchas

### DateTimePicker is a dialog, not a widget

`@react-native-community/datetimepicker`'s **Android** implementation doesn't render an inline UI at all — mounting the declarative `<DateTimePicker>` component runs a `useEffect` that imperatively opens a native dialog. That effect's dependency array includes `onChange`, so **any re-render that recreates the `onChange` prop reference re-opens the dialog** — even for unrelated state changes elsewhere in the same screen (e.g. typing in a nearby text field). iOS is unaffected; its picker is a real persistent inline view.

Fix, implemented in `DateTimeInput.android.tsx`: don't keep the picker permanently mounted. Show a button with the formatted value; only mount `<DateTimePicker>` while the user is actively choosing, and unmount it immediately in `onChange` (whether a value was picked or the dialog was dismissed). `DateTimeInput.tsx` (default/iOS) and `DateTimeInput.web.tsx` don't need this — only Android has the reopen-loop behavior.

### Local builds: Gradle version pin

`android/` is generated by `expo prebuild` (gitignored, not committed) and is NOT tracked — if you ever run a full `expo prebuild --clean` or delete/regenerate it, check `android/gradle/wrapper/gradle-wrapper.properties`. The template currently pins Gradle `9.3.1`, which has a real incompatibility with this project's Android Gradle Plugin version (`Class org.gradle.jvm.toolchain.JvmVendorSpec does not have member field 'IBM_SEMERU'` — happens with any JDK version, not a local-JDK-too-new issue). Local builds need it pinned to `8.13` instead. `npm run android` / `npx expo run:android` do a full local native build via the Android SDK/NDK (no Expo Go needed) — set `ANDROID_HOME`/`ANDROID_SDK_ROOT` and use a JDK the Gradle/AGP combo supports (JDK 21 confirmed working; JDK 25 is fine for running Gradle itself but doesn't fix the 9.3.1 incompatibility).

**Debug vs release builds for device testing:** debug builds need Metro running and reachable from the device (`--port <n>` if 8081 is taken by another project) — the app shows a red error screen without it. Release builds (`--variant release --no-bundler`) bundle the JS directly into the APK, need no Metro/dev-server connection at all, and both build types share the same debug keystore (`android/app/build.gradle`'s `release` build type signs with `signingConfigs.debug`) — so switching between local debug/release builds doesn't require reinstalling. An EAS-built APK uses a *different* keystore though, so swapping between an EAS install and a locally-built one does require an uninstall first (which wipes local app data, since there's no cloud backup).

---

## Key Patterns

### Repository Pattern

Every feature has a `repository.ts` that only talks to Drizzle. Stores call repositories. Nothing else touches `db` directly except `client.ts` and `settings/repository.ts`/`dataRepository.ts` (which also handle cross-table deletes and the export/import/Contour-import read/insert paths).

### Form Screens

All three form screens follow the same structure:
1. Read `route.params` for optional `entryId` / `readingId`
2. Look up existing entry — if found, it's edit mode
3. `useLayoutEffect` sets the header title based on edit/add mode
4. Date/time via `DateTimeInput` (platform-split component, see Android gotcha above)
5. `navigation.goBack()` after save

Weight form is date-only (no time field); uses `dateAtNoon()` to store noon timestamps.

### Contour CSV Import

**File:** `src/features/settings/utils/importContourCsv.ts`

Parses a Contour glucose meter's CSV export (Norwegian locale only — English exports use different header/value strings and aren't supported). Quote-aware CSV line parser (values use a comma decimal separator, e.g. `"4,3"` inside a comma-delimited row), BOM-stripping. Maps `Måltidsmarkering` (meal marking) to the app's context enum; unrecognized markings fall back to `random` with the raw value appended to `notes`. Dedups re-imports by exact timestamp+value match (`dataRepository.bloodSugarExistsByTimestampValue`). `Notater`/`Sted` columns fold into `notes`; other columns are discarded.

### Graph Screen Navigation (M12)

**File:** `src/features/graph/screens/GraphScreen.tsx` + `src/features/graph/utils/filterByTimeRange.ts`

An `anchor` date stands in for "now" — `getTimeRangeBounds(range, anchor)` computes the visible window ending at the anchor. Paging shifts the anchor by one full period (`shiftAnchor`): 1 day for "today", 7 for "7 days", 30 for "30 days". `canGoNext`/`canGoPrevious` gate the chevron buttons and the swipe gesture (`Gesture.Pan()` via `GestureDetector`); switching time-range or chart type resets the anchor back to `new Date()`. `formatDateRangeLabel` produces the locale-aware label shown above the chart.

### Date / Time Input

**Files:** `src/shared/components/DateTimeInput.tsx` / `.android.tsx` / `.web.tsx`, plus `src/shared/utils/dateTimeText.ts` (legacy text-parsing helpers, still used in tests/older code paths)

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

### Graph Screen (chart rendering)

`GraphChart.tsx` uses Victory Native's `CartesianChart` with a render-prop API. Key gotchas:

- **CartesianChart sorts data ascending by xKey internally.** Never use `data[i]` index inside the render prop to look up the original array — use `point.yValue` instead.
- `domainPadding` is in **pixel units**, not data units.
- Meal marker bars use `barH = 8`. Positioned at `chartBounds.bottom - barH`. Data points with `domainPadding.bottom = 8` sit ~23 px above `chartBounds.bottom` (includes ~15 px of natural tick-rounding clearance for typical mmol ranges).
- `point.y` / `point.x` = pixel coords; `point.yValue` / `point.xValue` = original data values.
- See "Web Support" above for the lazy-load + font requirements — this file must never be statically imported.

### Blood Sugar Colours

`colorForBloodSugar(mmol)` in `features/blood_sugar/utils/` — **fixed clinical thresholds**, independent of the user's configurable target range (which only controls the shaded band on the chart):

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

- **Runner:** `jest-expo` preset (Jest 29.7.0 — pin matters, see gotcha below)
- **Test location:** `__tests__/` inside each feature directory; shared utils/components in `src/shared/*/__tests__/`
- **What is tested:** Pure logic (repositories, stores via mocked DB, utilities, card rendering), form screens (via `@testing-library/react-native`), platform-specific components (e.g. `DateTimeInput.android.test.tsx` imports the `.android` file directly by its full name to bypass Jest's default platform resolution, which otherwise picks the base/iOS file)
- **What is not tested:** Navigation, full end-to-end flows (those are verified manually — web browser + physical device)
- **DB mocking:** repositories are mocked at the store-test / screen-test boundary
- **`render()`/`fireEvent` gotcha:** in this project's React 19 + `@testing-library/react-native` 14.x combo, `render(...)` returns a **Promise** — always `await render(...)`, and `await fireEvent.press(...)`/`.changeText(...)` too. Forgetting the `await` doesn't throw where you'd expect — destructuring the unresolved Promise silently gives you `undefined` for every query function, and calling one throws a generic "is not a function" with no hint that the real issue is a missing `await`.
- **Run:** `npx jest --passWithNoTests` or `npm run test:ci` (run from the project root — `npx jest` resolves config relative to cwd, so running it from a different directory fails to find the config)

---

## App Boot Sequence

```
index.ts
  └── App.tsx
        ├── initSkiaWeb()           # no-op on native; LoadSkiaWeb() on web (must run before any Skia-importing module)
        ├── initDatabase()          # async — CREATE TABLE IF NOT EXISTS, seed settings row, run migrations
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

## Scripts

| Command | What it does |
|---|---|
| `npm run start` | Start Expo dev server |
| `npm run android` | Full local native build + install via Android SDK/NDK (`expo run:android`) — see Android Gotchas above |
| `npm run ios` | Full local native build + install via Xcode (`expo run:ios`) |
| `npx expo start --web` | Run in a browser |
| `npm run test:ci` | Run all tests once (no watch) |
| `npm test` | Run tests in watch mode |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Drizzle Kit: generate migration SQL from schema |
| `npm run db:migrate` | Drizzle Kit: apply migrations |
| `postinstall` | Copies `canvaskit-wasm`'s `.wasm` into `public/` for web (see Web Support above) |
