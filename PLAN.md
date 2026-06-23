# SugarWise — Development Plan

## Source of Truth

- **SPECIFICATION.md** defines what to build. It wins in any disagreement.
- **This file** defines how to build it — milestone by milestone, with acceptance criteria.
- Do not start a milestone until the previous one is accepted by the user.

---

## Milestone Overview

| Milestone | Name | Delivers |
|-----------|------|---------|
| M0 | Foundation | Bootable app skeleton with navigation, theme, and database |
| M1 | Blood Sugar Logging | First usable feature: log and view blood sugar readings |
| M2 | Food & Drink Logging | Food/drink form and entries in the log list |
| M3 | Weight Logging | Weight form and entries in the log list |
| M4 | Graph Screen | Blood sugar and weight charts with all visual elements |
| M5 | Settings & Onboarding | First-run setup flow and settings screen |
| M6 | Polish & Release | End-to-end quality gate, bug fixes, v1.0.0 tag |

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

## Deferred to v2

The following are explicitly out of scope for v1:

1. Food photos (camera/gallery)
2. Notifications and reminders
3. Dual-axis correlation chart (blood sugar + weight)
4. Data export / import (JSON or CSV)
5. A1C estimate
6. Time-in-range percentage statistics
