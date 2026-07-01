# SteadySugar — Development Plan

## Source of Truth

- **SPECIFICATION.md** defines what to build. It wins in any disagreement.
- **This file** defines how to build it — milestone by milestone, with acceptance criteria.
- Do not start a milestone until the previous one is accepted by the user.

---

## Milestone Overview

| Milestone | Name | Delivers | Version |
|-----------|------|---------|---------|
| M0 | Foundation | Bootable app skeleton with navigation, theme, and database | v1.0.0 |
| M1 | Blood Sugar Logging | First usable feature: log and view blood sugar readings | v1.0.0 |
| M2 | Food & Drink Logging | Food/drink form and entries in the log list | v1.0.0 |
| M3 | Weight Logging | Weight form and entries in the log list | v1.0.0 |
| M4 | Graph Screen | Blood sugar and weight charts with all visual elements | v1.0.0 |
| M5 | Settings & Onboarding | First-run setup flow and settings screen | v1.0.0 |
| M6 | Polish & Release | End-to-end quality gate, bug fixes, v1.0.0 tag | v1.0.0 |
| M7 | Localization | Norwegian language support, auto-detected from device | v1.1.0 |
| M8 | Food Photos | Optional photo attachment on food entries | v1.1.0 |
| M9 | Data Export / Import | JSON backup and restore via native share sheet | v1.1.0 |
| M10 | Web Support | Async data layer + web UI fallbacks; app runs in macOS browser | v1.2.0 |
| M11 | Contour CSV Import | Import blood sugar readings from a Contour meter's Norwegian CSV export | v1.2.1 |
| M12 | Graph Navigation & Axis Labels | Previous/next period paging on the Graph screen; fixes missing web axis numbers | v1.3.0 |

---

## M0 — Foundation

**Goal:** A bootable app with navigation, theme, and database wired up. No real features yet — but every dependency is installed and every architectural decision is locked in.

### Tasks

1. Initialise Expo managed project with TypeScript (`expo init` or `create-expo-app`)
2. Install and configure all dependencies:
   - `react-navigation` (bottom tabs + native stack)
   - `react-native-paper` (Material 3 UI)
   - `expo-sqlite` + `drizzle-orm` + `drizzle-kit`
   - `zustand`
   - `victory-native` + `react-native-svg`
3. Set up React Native Paper theme (primary `#00897B`, accent `#FF6F00`, background `#FAFAFA`, text `#212121`)
4. Set up React Navigation with two bottom tabs: **Log** (📋) and **Graph** (📈), plus a Settings button in the header
5. Implement the full Drizzle schema (`src/shared/database/schema.ts`) with all four tables
6. Set up database client and run initial migration on app start
7. Set up Zustand store structure (one file per feature, empty for now)
8. Establish project folder structure as defined in SPECIFICATION.md §9

### Acceptance Criteria

- [ ] App boots without errors on iOS simulator and/or Android emulator
- [ ] Two bottom tabs are visible and navigable (Log, Graph)
- [ ] Settings button visible in header on both tabs
- [ ] React Native Paper theme applied (teal primary colour visible)
- [ ] Database initialises on first boot (no crash, all four tables created)
- [ ] `npx drizzle-kit studio` (or equivalent) can inspect the schema
- [ ] TypeScript compiles with no errors (`tsc --noEmit`)

---

## M1 — Blood Sugar Logging

**Goal:** A user can log a blood sugar reading and see it in the log list. The Log screen is fully built (structure, grouping, FAB, swipe-to-delete, edit) even though only blood sugar entries exist yet.

### Tasks

1. **Blood sugar repository** — `insert`, `update`, `delete`, `getAll` (ordered by timestamp desc)
2. **Blood sugar Zustand store** — wraps repository, exposes reactive state
3. **Blood Sugar Form screen:**
   - Numeric input for value (mmol/L, decimal support, no default value)
   - Context selector: segmented control (Fasting / Before meal / After meal 2h / Random)
   - Optional notes text area
   - Timestamp field: shows current date + time, opens date/time picker on tap, rejects future times (device local), editable back ~1 year
   - Save button — validates non-empty value, saves, returns to Log screen
4. **Log screen structure:**
   - Grouped list with section headers: Today / Yesterday / This Week / Last Week / Older
   - "No data yet" centred message when list is empty
   - FAB in bottom-right — opens bottom sheet with three options (Blood Sugar active; Food/Drink and Weight grayed out until M2/M3)
   - Swipe left on any entry → reveals red Delete button → deletes entry → shows "Deleted" snackbar with Undo
   - Tap entry → opens pre-populated form (timestamp editable in edit mode)
5. **Blood sugar entry card** in the list:
   - Value coloured by range: Red `#E53935` (< 3.9 or ≥ 13.3), Green `#4CAF50` (3.9–7.8), Yellow `#FFB300` (7.9–13.2)
   - Context badge alongside value
   - Timestamp: date + time (e.g. "Jun 23, 14:30")
6. **Soft validation:** warn (but allow save) if value < 0 or > 35 mmol/L

### Acceptance Criteria

- [ ] User can open the blood sugar form via the FAB
- [ ] All four context options are selectable
- [ ] Timestamp defaults to now and is editable; future timestamps are rejected
- [ ] Saving a reading adds it to the list immediately
- [ ] Blood sugar values are coloured correctly across all four ranges
- [ ] List groups entries under correct date headings
- [ ] Swipe-to-delete works with Undo snackbar
- [ ] Tapping an entry opens the form pre-populated; saving updates the entry
- [ ] "No data yet" shown when list is empty
- [ ] Soft validation warning shown for out-of-range values
- [ ] Data persists across app restarts

---

## M2 — Food & Drink Logging

**Goal:** A user can log food and drink entries. They appear in the shared log list alongside blood sugar readings.

### Tasks

1. **Food repository** — `insert`, `update`, `delete`, `getAll`
2. **Food Zustand store**
3. **Food/Drink Form screen:**
   - Horizontal scrollable chip selector with all 7 categories, colour-coded per spec §5
   - Free-text name field (large, prominent); must not be empty
   - Timestamp field (same behaviour as blood sugar form)
   - Save button
4. **Food entry card** in the log list:
   - Category chip with correct colour
   - Food name in primary text
   - Timestamp: date + time
5. Enable the Food/Drink option in the FAB bottom sheet

### Acceptance Criteria

- [ ] User can open the food/drink form via the FAB
- [ ] All 7 category chips are shown with correct colours
- [ ] Saving a food entry adds it to the log list in the correct date group
- [ ] Category chip colour is correct on the entry card
- [ ] Empty name field is rejected with an error message
- [ ] Tap to edit works; all fields pre-populated including category and timestamp
- [ ] Swipe-to-delete works with Undo snackbar
- [ ] Food and blood sugar entries coexist correctly in the grouped list

---

## M3 — Weight Logging

**Goal:** A user can log weight entries. They appear in the shared log list alongside the other entry types.

### Tasks

1. **Weight repository** — `insert`, `update`, `delete`, `getAll`
2. **Weight Zustand store**
3. **Weight Form screen:**
   - Numeric input for weight (kg, one decimal place)
   - Date picker (defaults to today, editable back ~1 year, no future dates)
   - Optional notes text area
   - Save button; soft validation warning if < 45 or > 200 kg
4. **Weight entry card** in the log list:
   - Value with unit (e.g. "82.4 kg")
   - Timestamp: date only (e.g. "Jun 23")
5. Enable the Weight option in the FAB bottom sheet
6. FAB bottom sheet now shows all three options active

### Acceptance Criteria

- [ ] User can open the weight form via the FAB
- [ ] Weight value saved with one decimal precision
- [ ] Date defaults to today; future dates rejected; back ~1 year allowed
- [ ] Soft validation warning shown for out-of-range values
- [ ] Weight entry appears in log list with correct date grouping
- [ ] Timestamp shown as date only (no time)
- [ ] Tap to edit works; all fields pre-populated
- [ ] Swipe-to-delete with Undo snackbar
- [ ] All three entry types coexist and are grouped correctly in the log list

---

## M4 — Graph Screen

**Goal:** The Graph screen shows interactive blood sugar and weight charts with all visual elements from the spec.

### Tasks

1. **Blood sugar chart:**
   - Dropdown at top: Blood Sugar (default) / Weight
   - Time range segmented control: Today / 7 days / 30 days
   - "Today" = midnight to midnight (device local time)
   - Line chart with coloured data points (same four-range colours as log list)
   - Target range band: shaded green `#4CAF50` at 30% opacity between `target_min_mmol` and `target_max_mmol`
   - Meal markers: 🍽️ icons at food entry timestamps; entries within 30-minute window collapsed to single icon with badge count (e.g. ×3)
   - X-axis: hours (Today) or dates (7/30 days)
   - Y-axis: mmol/L, auto-scaled
   - "No data yet" message when no readings in range
2. **Weight chart:**
   - Single-colour line chart
   - Same time range selector
   - Y-axis: kg, auto-scaled
   - "No data yet" message when no data in range
3. Wire charts to live Zustand store data (updates when new entries are logged)

### Acceptance Criteria

- [ ] Blood Sugar chart is the default selection on the Graph tab
- [ ] Switching between Blood Sugar and Weight works
- [ ] Time range selector changes the data shown
- [ ] "Today" shows only data from midnight to midnight local time
- [ ] Data points are coloured correctly across all four ranges
- [ ] Target range band is visible as a shaded green area
- [ ] Meal markers appear at correct timestamps
- [ ] Two or more meals within 30 minutes collapse to a single badged icon
- [ ] Weight chart shows a single-colour line
- [ ] "No data yet" shown when no data exists for the selected range
- [ ] Charts update immediately when new entries are logged

---

## M5 — Settings & Onboarding

**Goal:** First-run onboarding collects the user's name and target range. The Settings screen allows editing all user-configurable values.

### Tasks

1. **First-run detection:** check `app_settings` on boot; if `user_name` is empty, navigate to onboarding instead of Log screen
2. **Onboarding flow (3 screens, standard stack back navigation):**
   - Screen 1: Welcome — app description, "Get Started" button
   - Screen 2: Name input — "What should we call you?" (required); Next button
   - Screen 3: Target range — two numeric inputs (min default 3.9, max default 7.8) with brief explanation; Done button saves and navigates to Log screen
3. **Settings screen** (accessed via header button on Log and Graph tabs):
   - **Profile:** editable user name field
   - **Blood Sugar Targets:** editable min and max mmol/L inputs
   - **Food Categories:** read-only list of the 7 fixed categories
   - **Data Management:** "Clear all data" button with confirmation dialog; Export/Import shown as "Coming in v2" (disabled)
   - **About:** app version and credits
4. Settings changes persist immediately to `app_settings`

### Acceptance Criteria

- [ ] Fresh install shows onboarding, not the Log screen
- [ ] Back navigation within onboarding returns to the previous screen
- [ ] Completing onboarding saves name and target range; navigates to Log screen
- [ ] Subsequent launches skip onboarding and go directly to Log screen
- [ ] Settings button in header opens Settings screen from both tabs
- [ ] User name change in Settings persists across restarts
- [ ] Target range changes are reflected immediately in the blood sugar chart band
- [ ] "Clear all data" deletes all entries and resets settings; requires confirmation
- [ ] Food categories list is visible but non-editable

---

## M6 — Polish & Release

**Goal:** All success criteria from SPECIFICATION.md §12 pass. App is stable, tested, and tagged v1.0.0.

### Tasks

1. End-to-end walkthrough of all user flows (§11 in spec)
2. Verify all §12 success criteria
3. Review test coverage across all features; fill gaps
4. Fix any remaining bugs found during walkthrough
5. Check TypeScript strict mode — no errors
6. Ensure no console warnings or errors in production build
7. Tag `v1.0.0`

### Acceptance Criteria

- [ ] User can log blood sugar, food, and weight in under 10 seconds each
- [ ] Blood sugar chart shows trends with target range band and meal markers
- [ ] Weight chart shows trend line
- [ ] Log screen groups entries logically and is easy to scan
- [ ] Data persists across app restarts
- [ ] Onboarding completes in under 30 seconds
- [ ] App works fully offline
- [ ] No TypeScript errors
- [ ] `v1.0.0` tag created

---

---

## M7 — Localization

**Goal:** The app displays in Norwegian when the device language is set to Norwegian (Bokmål), and in English otherwise. All user-visible strings are translation-ready from this point forward.

### Tasks

1. Install `i18next`, `react-i18next`, and `expo-localization`
2. Create translation files `src/shared/i18n/en.json` and `src/shared/i18n/nb.json`
3. Configure i18next to auto-detect locale from `expo-localization`; fall back to English
4. Wrap all user-visible strings across every screen in `t()` calls
5. Translate all strings into Norwegian Bokmål (`nb.json`)
6. Update all new UI added in M8 and M9 with `t()` calls from day one

### Acceptance Criteria

- [ ] Device set to English shows the app in English
- [ ] Device set to Norwegian (Bokmål) shows the app in Norwegian
- [ ] All screens, buttons, labels, error messages, and snackbars are translated
- [ ] No hardcoded English strings remain in any screen component
- [ ] Switching device language and restarting the app picks up the change

---

## M8 — Food Photos

**Goal:** Users can optionally attach a photo to a food/drink entry, taken from the camera or chosen from the gallery. Photos are stored locally on the device.

### Tasks

1. **Schema migration:** add nullable `photo_uri TEXT` column to `food_entries`; run `ALTER TABLE food_entries ADD COLUMN photo_uri TEXT` on first boot after upgrade
2. Install `expo-image-picker`
3. **FoodFormScreen:** add photo picker below the name field
   - Two buttons: "Take photo" (camera) and "Choose from library" (gallery)
   - Preview thumbnail shown once a photo is selected, with a "Remove" option
   - Photo picker only shown; no upload — URI is saved as a local file path
4. **FoodCard:** show a small thumbnail (left side of card) when `photo_uri` is present
5. Update food repository `add` and `update` to persist `photo_uri`
6. Update food store types to include optional `photoUri` field

### Acceptance Criteria

- [ ] Existing food entries without photos display normally (no regression)
- [ ] New food entry can be saved without a photo (optional)
- [ ] Tapping "Take photo" opens the camera; captured image appears as a preview
- [ ] Tapping "Choose from library" opens the gallery; selected image appears as a preview
- [ ] "Remove" clears the selected photo before saving
- [ ] Saved entry shows a thumbnail in the log list
- [ ] Editing an entry pre-populates the existing photo; user can replace or remove it
- [ ] Photo URI persists across app restarts

---

## M9 — Data Export / Import

**Goal:** Users can back up all their data to a JSON file and restore it on another device or after reinstalling. Photos are not included in the export.

### Tasks

1. Install `expo-file-system`, `expo-sharing`, and `expo-document-picker`
2. **Export:**
   - Serialise all four tables (`blood_sugar_readings`, `food_entries`, `weight_entries`, `app_settings`) to a single JSON object
   - `photo_uri` fields are excluded from the export
   - Write JSON to a temporary file (`SteadySugar-backup-YYYY-MM-DD.json`)
   - Trigger native share sheet so the user can save to Files, send via AirDrop, etc.
3. **Import:**
   - Open document picker filtered to `.json` files
   - Validate the file structure (correct keys, expected field types)
   - Merge strategy: insert records whose `id` does not already exist in the database; skip duplicates silently
   - Show a summary snackbar: "Imported X entries" (or error if file is invalid)
4. **Settings screen:** replace the two disabled "Coming in v2" items with active Export and Import buttons

### Acceptance Criteria

- [ ] Tapping Export produces a valid JSON file and opens the share sheet
- [ ] Exported file contains all blood sugar, food, weight, and settings records
- [ ] `photo_uri` is not present in the exported JSON
- [ ] Tapping Import opens the document picker
- [ ] Importing a valid backup file adds new records without overwriting existing ones
- [ ] Importing a malformed file shows a clear error message without corrupting data
- [ ] Importing the same file twice does not create duplicate records
- [ ] Import summary snackbar shows the count of records added

---

---

## M10 — Web Support

**Goal:** The app runs fully in a macOS browser tab (Safari, Chrome). All data is persisted locally via SQLite (wa-sqlite/WebAssembly). The blocking issue from v1.1.1 exploratory work — `Sync operation timeout` from `Atomics.wait()` — is resolved by migrating the entire data layer to the async `expo-sqlite` API.

**Pre-existing groundwork (already done in v1.1.1):**
- `metro.config.js` — wasm asset extension for wa-sqlite
- `react-dom` and `react-native-web` installed
- `dist/serve.json` — COOP/COEP headers for `SharedArrayBuffer`
- `npx expo export --platform web` already produces a valid bundle

### Root Cause

`expo-sqlite`'s synchronous API (`openDatabaseSync`, `execSync`, `.all()`, `.get()`) internally calls `Atomics.wait()`. Browsers block `Atomics.wait()` on the main thread. The async API (`openDatabaseAsync`, `execAsync`) uses `Atomics.waitAsync()` instead, which is permitted on the main thread and works in wa-sqlite.

### Tasks

1. **Database client (`src/shared/database/client.ts`)**
   - Replace `SQLite.openDatabaseSync` with `SQLite.openDatabaseAsync`
   - Make `initDatabase()` fully async using `execAsync` for all `CREATE TABLE` and `CREATE INDEX` statements
   - Replace `drizzle(sqlite, ...)` with the async Drizzle driver (`drizzle(sqlite, { schema })` — check if `drizzle-orm/expo-sqlite` exports an async variant or if a raw `ExpoSQLiteDatabase` wrapper is needed)
   - Ensure `initDatabase()` is `await`-ed before any store action runs (wire into app startup in `App.tsx`)

2. **Blood sugar repository (`src/features/blood_sugar/repository.ts`)**
   - Change all methods to `async`: `getAll()`, `add()`, `update()`, `delete()`
   - Replace synchronous Drizzle calls (`.all()`, `.get()`) with their async equivalents (`.then()` / `await`)

3. **Food log repository (`src/features/food_log/repository.ts`)**
   - Same async migration as blood sugar repository

4. **Weight repository (`src/features/weight/repository.ts`)**
   - Same async migration

5. **Settings repository (`src/features/settings/repository.ts`)**
   - Same async migration; `getSettings()` and `saveSettings()` become `async`

6. **All Zustand stores**
   - `src/features/blood_sugar/store.ts` — `await` all repository calls in `add`, `update`, `delete`, `fetchAll`
   - `src/features/food_log/store.ts` — same
   - `src/features/weight/store.ts` — same
   - `src/features/settings/store.ts` — same

7. **Web fallbacks for native-only UI**
   - `@react-native-community/datetimepicker` has no web support; wrap usage in all three form screens with `Platform.OS === 'web'` guard:
     - Web: render `<input type="date">` / `<input type="time">` HTML inputs styled with `StyleSheet`
     - Native: render existing `DateTimePicker` (unchanged)
   - Create a shared `DateTimeInput` component at `src/shared/components/DateTimeInput.tsx` to avoid duplicating the Platform branch in every form
   - `expo-image-picker` — camera and gallery are unavailable on web; hide the photo picker section when `Platform.OS === 'web'` (food form only)
   - `expo-sharing` — not available on web; replace with a browser download (`<a download>` via `Linking.openURL` with a `data:` URI) when `Platform.OS === 'web'`
   - `expo-document-picker` — not available on web; replace with `<input type="file" accept=".json">` for the import flow

8. **App startup wiring (`App.tsx` or `index.ts`)**
   - `initDatabase()` must be `await`-ed before the navigation tree renders
   - Add a loading state: show a splash/spinner while the DB is initialising; navigate to the app once ready

9. **Test updates**
   - Repository mocks in existing tests: all mock functions (`mockAdd`, `mockUpdate`, etc.) must return `Promise.resolve()` rather than `undefined` so `await store.add(...)` resolves correctly
   - Add a smoke test for `initDatabase()` (async call completes without error)

10. **Web build and serving**
    - Build: `npx expo export --platform web` → `dist/`
    - Serve with COOP/COEP headers: `npx serve dist --config serve.json` (or any static server that injects the headers)
    - Verify the app loads and data persists in the browser's IndexedDB (wa-sqlite backend)

### Acceptance Criteria

- [ ] `npx expo export --platform web` produces a clean build with no errors
- [ ] App loads in Safari and Chrome on macOS without a blank screen
- [ ] `initDatabase()` completes and all four tables are created on first load
- [ ] User can log a blood sugar reading, food entry, and weight entry via the browser
- [ ] Entries persist across page reloads (IndexedDB via wa-sqlite)
- [ ] Date/time pickers work on web (HTML `<input>` fallback)
- [ ] Food photo section is hidden on web (no crash, no broken UI)
- [ ] Export produces a downloadable JSON file (browser download, not share sheet)
- [ ] Import accepts a `.json` file via `<input type="file">`
- [ ] All existing iOS/Android tests still pass (no regressions from async migration)
- [ ] TypeScript compiles with no errors after async migration
- [ ] `v1.2.0` tag created

---

## M11 — Contour CSV Import

**Goal:** Users can import blood sugar readings directly from a CSV report exported by the Contour glucose meter app (Norwegian locale), without hand-entering historical readings.

**Scope:** Norwegian-language Contour exports only for this milestone. English-language exports use different header/value strings and are out of scope until a real sample is available.

**Sample format** (`ContourCSVReport_2026_01_07.csv`):
```
#,Dato og klokkeslett,BGValue[mmol/L],Måltidsmarkering,Datakilde,Notater,Aktivitet,Måltid[g],Medisin,Sted
1,"08.06.2026 13:47:35","4,3","Ingen markering","Måler","","","","",""
```
- UTF-8 with BOM; fields comma-delimited, quoted where needed (the value field itself uses a comma decimal separator, e.g. `"4,3"` → 4.3)
- Date/time format: `DD.MM.YYYY HH:MM:SS`, treated as local time (consistent with how the rest of the app constructs timestamps)

### Design Decisions

1. **Entry point:** A dedicated "Import from Contour" button on the Settings screen, separate from the existing JSON Import button.
2. **Meal marking → context mapping:**
   - `Ingen markering` (no marking) → `random`
   - `Før måltid` (before meal) → `before_meal`
   - `Etter måltid` (after meal) → `after_meal_2h`
   - Any other/unrecognized marking → falls back to `random`, and the raw marking string is appended to the reading's `notes` so nothing is silently lost. These fallback rows are counted separately in the import summary.
3. **Dedup on re-import:** A CSV row is treated as already-imported (and skipped) only if a reading with the exact same timestamp **and** value already exists — avoids re-importing the same file twice while not being so strict that two genuinely distinct readings could suppress each other.
4. **Notes mapping:** The `Notater` (notes) and `Sted` (place) columns are both folded into the reading's `notes` field (place prefixed, e.g. `Sted: Husarveien`), along with the unknown-marking note when applicable. `Aktivitet`, `Måltid[g]`, `Medisin`, and `Datakilde` are not imported — no diagnostic value for this table.
5. **Malformed rows:** A row with an unparseable date or value is skipped individually (counted as invalid) rather than failing the whole import. A file whose header doesn't match the expected Contour column names is rejected outright with an error.

### Tasks

1. `src/features/settings/utils/importContourCsv.ts` — CSV parser (quote-aware, BOM-stripping) + mapping logic + `importContourCsv()` entry point using `expo-document-picker` and `expo-file-system`
2. `src/features/settings/dataRepository.ts` — add `bloodSugarExistsByTimestampValue(timestamp, valueMmol)` for the timestamp+value dedup check
3. **Settings screen:** add "Import from Contour" button below the existing Import button, wired to `importContourCsv()`, with a snackbar summary (imported count, plus a note if any rows used the unknown-marking fallback)
4. i18n strings for the new button/description/result messages in `en.json` and `nb.json`

### Acceptance Criteria

- [ ] Tapping "Import from Contour" opens the document picker
- [ ] Importing the sample Contour CSV adds a blood sugar reading for every valid row, with correct value, timestamp, and mapped context
- [ ] `Ingen markering` rows import as `random`, `Før måltid` rows as `before_meal`, `Etter måltid` rows as `after_meal_2h`
- [ ] An unrecognized marking value imports as `random` and appends the raw marking to `notes`
- [ ] `Notater` and `Sted` values appear in the imported reading's `notes`
- [ ] Importing the same CSV file twice does not create duplicate readings
- [ ] A file with a non-matching header shows a clear error without corrupting existing data
- [ ] Rows with an unparseable date or value are skipped without aborting the rest of the import
- [ ] Import summary snackbar shows the count of readings added

---

## M12 — Graph Navigation & Axis Labels

**Goal:** Users can page backward and forward through past periods on the Graph screen (day/week/30-day), and the chart's axis numbers (mmol/L, kg, dates) actually render — they were silently missing on web since M10.

### Background: the missing axis numbers bug

Investigating the original "legends" request revealed the Graph screen showed **zero axis numbers at all** on web — no mmol/L values on the left, no dates on the bottom, only gridlines, the target band, and the line/points. Root cause: `GraphChart.tsx` used `matchFont()`, which relies on Skia's system `FontMgr` — populated on native (real OS font matching) but always empty on web (`CanvasKit` ships no system fonts), so `matchFont()` silently returned `null` and every axis label was skipped (grid lines don't need a font; text does). Confirmed with the user this was web-only — native (Android) renders labels fine, so this was purely a M10 gap.

**Fix:** replaced `matchFont()` with react-native-skia's `useFont()` hook, loading a bundled font file (`@expo-google-fonts/inter`, `Inter_400Regular.ttf`) instead of relying on system font lookup — works identically on native and web. Applied universally (not just web) per user's choice, removing the platform-specific font code entirely. Added `assets.d.ts` for the `*.ttf` module type Metro/TypeScript needs to resolve the font import.

*(Also flagged by the user: a separate, still-open bug on the Android build unrelated to this — to be investigated later.)*

### Design decisions (from grill-me session)

1. **Navigation UI:** both arrow buttons (with a date-range label) and a swipe gesture on the chart — not just one or the other.
2. **Boundaries:** "next" disables at the current period (no paging into the future); "previous" disables once paging back further would be entirely before the oldest record for the currently selected chart type (blood sugar vs. weight each have their own oldest-record boundary).
3. **State reset:** switching the time-range control (Today/7 days/30 days) or chart type (Blood Sugar/Weight) always resets navigation back to the current period.
4. **Quick return:** a "Today" text link appears next to the date label whenever navigated away from the current period, for one-tap return instead of repeated arrow taps.

### Tasks

1. `src/features/graph/utils/filterByTimeRange.ts` — add `shiftAnchor` (pages the anchor date by one period), `canGoNext`, `canGoPrevious` (oldest-record boundary check), `formatDateRangeLabel` (locale-aware label, e.g. "24 – 30 Jun" or "1. juli")
2. `src/features/graph/screens/GraphScreen.tsx` — anchor state (defaults to `new Date()`), reset-on-range/type-change effect, prev/next/today handlers, navigation row UI (chevron `IconButton`s + label + conditional "Today" link), `Gesture.Pan()` swipe wired to the same handlers via `GestureDetector`
3. `src/features/graph/components/GraphChart.tsx` — replace `matchFont` with `useFont(interRegular, 10)`
4. `assets.d.ts` — ambient `declare module '*.ttf'` so TypeScript resolves the bundled font import
5. i18n: `graph.jump_to_today` key (English + Norwegian)

### Acceptance Criteria

- [ ] Y-axis (mmol/L, kg) and X-axis (dates/hours) numbers render correctly on both web and native
- [ ] Tapping the left/right chevrons pages the chart back/forward by one full period (day/week/30-days depending on the active range)
- [ ] The date-range label above the chart accurately reflects the period shown
- [ ] "Next" is disabled when viewing the current period; "previous" is disabled once further paging would show only guaranteed-empty periods
- [ ] Switching time-range or chart type resets navigation back to the current period
- [ ] The "Today" quick-return link appears only when navigated away from the current period, and returns to it in one tap
- [ ] Swiping left/right on the chart pages forward/backward, matching the arrow buttons
- [ ] Existing chart rendering (line, points, target band, meal markers) is unaffected by the font change

---

## Removed from backlog

The following features have been explicitly dropped and will not be built:

1. Notifications and reminders
2. Dual-axis correlation chart (blood sugar + weight)
3. A1C estimate
4. Time-in-range percentage statistics
