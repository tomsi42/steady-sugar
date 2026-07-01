# SteadySugar — Detailed Specification

## 1. Overview

**SteadySugar** is a mobile health application for logging blood sugar measurements, food/drink intake, and weight tracking. The app helps users monitor their diabetes type 2 management through data visualization and pattern recognition, supporting lifestyle changes.

**Core value proposition:** Simple, fast logging with clear visual feedback on blood sugar trends and their relationship to meals.

---

## 2. Technical Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | React Native + Expo (TypeScript) | Single codebase for iOS, Android, and web, large ecosystem, excellent DX |
| **State Management** | Zustand | Lightweight, TypeScript-first, scales well for data-heavy apps |
| **Database** | expo-sqlite + Drizzle ORM | Type-safe SQL, generates TypeScript types from schema, excellent Expo integration |
| **Charting** | Victory Native | Composable, interactive line charts with flexible axis support |
| **UI Framework** | React Native Paper (Material 3 theme) | Works on both platforms, warm lifestyle feel (not clinical) |
| **Navigation** | React Navigation (bottom tabs + stack) | De-facto standard for React Native, flexible and well-maintained |
| **Local Storage** | SQLite via expo-sqlite | Fast, private, works offline always |
| **Web renderer** | react-native-web + expo web | Enables running the app in a browser (macOS via Safari/Chrome) |

### Target Platforms

| Platform | Status |
|----------|--------|
| iOS | Supported (v1.0.0+) |
| Android | Supported (v1.0.0+) |
| Web (macOS browser) | Planned (v1.2.0) |

---

## 3. Data Model

### 3.1 Blood Sugar Measurement (`blood_sugar_readings`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer (PK) | Yes | Auto-increment primary key |
| `value_mmol` | Double | Yes | Blood sugar value in mmol/L (0–35 range) |
| `timestamp` | DateTime | Yes | When the measurement was taken (auto-set to now, editable) |
| `context` | Enum | Yes | One of: `fasting`, `before_meal`, `after_meal_2h`, `random` |
| `notes` | Text | No | Optional free-text notes |

**Context options:**
- Fasting (morning, before any food)
- Before meal (prior to eating)
- After meal 2h (two hours after eating)
- Random (any other time)

### 3.2 Food/Drink Log (`food_entries`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer (PK) | Yes | Auto-increment primary key |
| `name` | Text | Yes | What was eaten/drank (free text) |
| `category` | Enum | Yes | One of: `breakfast`, `lunch`, `dinner`, `snack`, `treat`, `drink`, `alcohol` |
| `timestamp` | DateTime | Yes | When it was consumed (auto-set to now, editable) |
| `photo_uri` | Text | No | Local file URI of an optional photo (added v1.1.0) |

**Categories (fixed):** Breakfast, Lunch, Dinner, Snack, Treat, Drink, Alcohol

### 3.3 Weight Entry (`weight_entries`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer (PK) | Yes | Auto-increment primary key |
| `value_kg` | Double | Yes | Weight in kilograms (45–200 range) |
| `timestamp` | DateTime | Yes | Date of measurement (auto-set to today, editable) |
| `notes` | Text | No | Optional notes (e.g., "after weekend", "started new routine") |

### 3.4 App Settings (`app_settings`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer (PK) | Yes | Single row (always id = 1) |
| `user_name` | Text | Yes | User's name (from onboarding) |
| `target_min_mmol` | Double | Yes | Lower bound of target range (default: 3.9) |
| `target_max_mmol` | Double | Yes | Upper bound of target range (default: 7.8) |

---

## 4. Screen Specifications

### 4.1 Log Screen (Primary Entry Point)

**Navigation:** Bottom navigation bar, first tab (📋 icon — labeled "Log")

**Layout:**
- Full list of all entries (blood sugar, food/drink, weight) grouped by date period with headings: **Today**, **Yesterday**, **This Week**, **Last Week**, **Older**
- If no entries exist, show a centered "No data yet" message
- Floating action button (FAB) in the bottom-right corner with `+` icon
- FAB opens a modal/bottom sheet with three options:
  - 🩸 **Blood Sugar** — opens blood sugar form
  - 🍽️ **Food/Drink** — opens food/drink form
  - ⚖️ **Weight** — opens weight form

**Blood Sugar Form:**
- Large numeric input for value (mmol/L) with decimal support
- Context selector: segmented button or dropdown with 4 options (Fasting, Before meal, After meal 2h, Random)
- Optional notes field (text area)
- Timestamp display (editable via date/time picker, defaults to now)
- Large "Save" button at bottom

**Food/Drink Form:**
- Category selector: horizontal scrollable chips (Breakfast, Lunch, Dinner, Snack, Treat, Drink, Alcohol)
- Free-text field for food/drink description (large, prominent)
- Optional photo picker: "Take photo" (camera) and "Choose from library" (gallery) buttons; thumbnail preview with "Remove" option once selected (v1.1.0)
- Timestamp display (editable via date/time picker, defaults to now)
- Large "Save" button at bottom

**Weight Form:**
- Numeric input for weight (kg) with one decimal place
- Date picker (defaults to today, editable back ~1 year)
- Optional notes field
- Large "Save" button at bottom

**Validation (Soft):**
- Blood sugar: warning if < 0 or > 35 mmol/L, but allow save
- Weight: warning if < 45 or > 200 kg, but allow save
- Food name: must not be empty

**Note:** The History screen's functionality (grouped list, swipe-to-delete, tap-to-edit) has been merged into the Log screen. There is no separate History tab — the Log screen serves as both the entry point and the full history view.

**Blood sugar entries:**
- Value colored by range:
  - 🔴 Red if < 3.9 mmol/L (hypoglycemia)
  - 🟢 Green if 3.9–7.8 mmol/L (in target range)
  - 🟡 Yellow if 7.9–13.2 mmol/L (elevated)
  - 🔴 Red if ≥ 13.3 mmol/L (dangerously high)
- Context badge shown alongside value
- Timestamp shown as date + time (e.g., "Jun 23, 14:30")

**Food entries:**
- Category chip (color-coded by meal type)
- Food name in primary text
- Small photo thumbnail on the left of the card, if a photo was attached (v1.1.0)
- Timestamp shown as date + time (e.g., "Jun 23, 14:30")

**Weight entries:**
- Value with unit (e.g., "82.4 kg")
- Timestamp shown as date only (e.g., "Jun 23")

**Interactions:**
- Swipe left to reveal a red **Delete** button; tapping it deletes the entry and shows a brief "Deleted" snackbar with an **Undo** action (standard React Native swipeable convention)
- Tap entry to edit — opens the same form pre-populated with existing values, including the timestamp (timestamp is editable in edit mode)

### 4.2 Graph Screen

**Navigation:** Bottom navigation bar, second tab (📈 icon)

**Layout:**
- Dropdown selector at top: "Blood Sugar" (default) | "Weight"
- Selected chart fills the screen below
- If no data exists for the selected type and time range, show a centered "No data yet" message

**Blood Sugar Chart:**
- **Time range selector:** Horizontal segmented control (Today, 7 days, 30 days)
- **Target range band:** Shaded green area between `target_min_mmol` and `target_max_mmol` (default 3.9–7.8)
- **Data points:** Colored dots connected by a line — same colors as Log screen:
  - 🔴 Red if < 3.9 mmol/L (hypoglycemia)
  - 🟢 Green if 3.9–7.8 mmol/L (in target range)
  - 🟡 Yellow if 7.9–13.2 mmol/L (elevated)
  - 🔴 Red if ≥ 13.3 mmol/L (dangerously high)
- **Meal markers:** Small 🍽️ icons overlaid on the chart at timestamps where food was logged. When two or more meal entries fall within a 30-minute window, collapse them into a single icon with a badge count (e.g., 🍽️ ×3)
- **X-axis:** Time (hours midnight–midnight for "Today", dates for 7/30 days)
- **Y-axis:** Blood sugar value (mmol/L), auto-scaled to fit data

**Weight Chart:**
- **Time range selector:** Same as blood sugar (Today, 7 days, 30 days)
- **Line chart:** Weight values connected by a line (single color, no range coloring needed)
- **X-axis:** Time
- **Y-axis:** Weight (kg), auto-scaled to fit data

**Future enhancement (v2):** Dual-axis chart showing blood sugar and weight on the same graph with separate Y-axes.

### 4.3 Settings Screen

**Navigation:** Accessed via a **Settings button in the top navigation bar** (header right), present on both the Log and Graph screens

**Sections:**
1. **Profile**
   - User name (editable)
2. **Blood Sugar Targets**
   - Target minimum: numeric input (default 3.9 mmol/L)
   - Target maximum: numeric input (default 7.8 mmol/L)
3. **Food Categories**
   - Fixed list (non-editable): Breakfast, Lunch, Dinner, Snack, Treat, Drink, Alcohol
4. **Data Management**
   - Export data — serialises all entries to a JSON file, shared via native share sheet; photos not included (v1.1.0)
   - Import data — picks a JSON backup file, merges records without overwriting existing data (v1.1.0)
   - Clear all data (with confirmation dialog)
5. **About**
   - App version
   - Credits

---

## 5. Color Scheme

### Blood Sugar Data Point Colors

| Range | Hex Code | Meaning |
|-------|----------|---------|
| < 3.9 mmol/L | `#E53935` (Red) | Hypoglycemia — urgent, dangerous |
| 3.9–7.8 mmol/L | `#4CAF50` (Green) | In target range — good |
| 7.9–13.2 mmol/L | `#FFB300` (Amber/Yellow) | Elevated — caution, not immediately dangerous |
| ≥ 13.3 mmol/L | `#E53935` (Red) | Dangerously high — urgent, needs attention |

### Target Range Band
- Shaded area: `#4CAF50` (Green) at 30% opacity
- Represents the user's target range (default 3.9–7.8 mmol/L)

### Food Category Chip Colors

| Category | Hex Code | Rationale |
|----------|----------|-----------|
| Breakfast | `#42A5F5` (Light blue) | Morning, fresh |
| Lunch | `#26A69A` (Teal) | Ties to app primary color |
| Dinner | `#5C6BC0` (Indigo) | Evening, substantial meal |
| Snack | `#FFCA28` (Amber) | Light, between-meal |
| Drink | `#26C6DA` (Cyan) | Refreshing, beverage feel |
| Treat | `#FF7043` (Deep orange) | Indulgent, mild warning |
| Alcohol | `#EF5350` (Soft red) | Stronger warning — distinct from blood sugar danger red (`#E53935`) |

### UI Theme
- **Primary color:** Deep teal (`#00897B`) — health, trust
- **Accent color:** Warm orange (`#FF6F00`) — energy, vitality
- **Background:** Clean white/light gray (`#FAFAFA`)
- **Text:** Dark gray (`#212121`) for readability
- **Overall feel:** Warm, approachable lifestyle app (not clinical or corporate)

---

## 6. Validation Rules

### Blood Sugar
- **Valid range:** 0–35 mmol/L (physiological limits)
- **Soft validation:** Show warning if outside range, but allow save
- **Rationale:** Legitimate readings may fall outside "normal" (e.g., hypo at 2.1 mmol/L)

### Weight
- **Valid range:** 45–200 kg (adult human limits)
- **Soft validation:** Show warning if outside range, but allow save

### Food/Drink
- **Name:** Must not be empty (required field)
- **Category:** Must select one of the seven fixed categories (Breakfast, Lunch, Dinner, Snack, Treat, Drink, Alcohol)

### Timestamps
- **Editable range:** Back to approximately 1 year ago
- **No future dates allowed** — checked against device local time

---

## 7. Onboarding Flow

### First Run
1. **Welcome screen:** Brief description of SteadySugar purpose ("Track your blood sugar, food, and weight to support your health journey")
2. **Name input:** "What should we call you?" (text field, required)
3. **Target range setup:** 
   - "What's your target blood sugar range?"
   - Two numeric inputs: minimum (default 3.9) and maximum (default 7.8)
   - Brief explanation: "This range will be shown as a green band on your charts"
4. **Done:** Save settings, navigate to Log screen

**Back navigation during onboarding:** Standard stack back — pressing back returns to the previous onboarding screen so the user can correct earlier input.

### Subsequent Runs
- Skip onboarding, go directly to Log screen
- Settings accessible via the button in the top navigation bar

---

## 8. v1.1.0 Features

The following features are planned for v1.1.0:

1. **Norwegian localization** — Auto-detected from device locale; falls back to English
2. **Food photos** — Optional camera/gallery photo attachment on food entries; stored locally
3. **Data export/import** — JSON backup (photos excluded) via native share sheet; merge-import without overwriting existing records

## 8b. v1.2.0 Features

The following features are planned for v1.2.0:

1. **Web support (macOS browser)** — Run the app in a browser tab on macOS (Safari, Chrome). Requires migrating the entire data layer from the synchronous `expo-sqlite` API (`openDatabaseSync`, `execSync`) to the async API (`openDatabaseAsync`, `execAsync`), which is the only SQLite API available in the browser (wa-sqlite/WebAssembly). Also requires web-compatible fallbacks for native-only UI (date/time pickers).

## 8c. v1.2.1 Features

The following features are planned for v1.2.1:

1. **Contour CSV import** — Import blood sugar readings from a Contour glucose meter's CSV export (Norwegian locale only). Maps the meal-marking column to the app's context enum (`Ingen markering` → `random`, `Før måltid` → `before_meal`, `Etter måltid` → `after_meal_2h`, unrecognized values → `random` with the raw value recorded in notes). Dedups re-imports by exact timestamp + value match. Accessed via a dedicated "Import from Contour" button on the Settings screen, separate from JSON backup import.

   **Why this is non-trivial:** The synchronous SQLite API blocks on `Atomics.wait()`, which browsers prohibit on the main thread. Every repository call, store action, and init routine must become `async`/`await`. The Metro bundler config (`metro.config.js`) and COOP/COEP headers for `SharedArrayBuffer` are already in place from exploratory work in v1.1.1.

## 8a. Removed from backlog

The following features have been dropped and will not be built:

1. **Notifications/reminders** — Scheduled prompts to log blood sugar or weigh-in
2. **Dual-axis correlation chart** — Blood sugar and weight on same graph with separate Y-axes
3. **A1C estimate** — Calculated from blood sugar history
4. **Time-in-range percentage** — Statistics on how much time spent in target range

---

## 9. Project Structure (React Native)

```
src/
├── app/                         # App-level configuration
│   ├── navigation.tsx           # React Navigation setup (bottom tabs + stacks)
│   └── theme.ts                 # React Native Paper theme customization
├── features/                    # Feature modules (separated by domain)
│   ├── blood_sugar/             # Blood sugar feature
│   │   ├── types.ts             # TypeScript types for blood sugar
│   │   ├── repository.ts        # Data access layer (Drizzle queries)
│   │   ├── store.ts             # Zustand slice (CRUD, queries)
│   │   └── screens/             # Screen components
│   ├── food_log/                # Food/drink logging feature
│   │   ├── types.ts
│   │   ├── repository.ts
│   │   ├── store.ts
│   │   └── screens/
│   ├── weight/                  # Weight tracking feature
│   │   ├── types.ts
│   │   ├── repository.ts
│   │   ├── store.ts
│   │   └── screens/
│   ├── graph/                   # Chart visualization feature
│   │   ├── store.ts             # Data fetching for charts
│   │   └── components/          # Chart components (Victory Native wrappers)
│   ├── settings/                # Settings screen
│   │   └── screens/
│   └── onboarding/              # First-run setup flow
│       └── screens/
├── shared/                      # Cross-cutting concerns
│   ├── database/                # Drizzle schema, migrations, and db client
│   ├── utils/                   # Helpers (date formatting, validation)
│   └── components/              # Reusable UI components
└── types/                       # Shared TypeScript types

__tests__/                       # Unit and component tests (Jest + Testing Library)
├── features/                    # Feature-specific tests
└── shared/                      # Shared test utilities

assets/                          # Images, icons, etc.
app.tsx                          # App entry point, navigation root
```

---

## 10. Database Schema (Drizzle ORM + expo-sqlite)

### Drizzle Table Definitions (`src/shared/database/schema.ts`)

```typescript
import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core';

export const bloodSugarReadings = sqliteTable('blood_sugar_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  valueMmol: real('value_mmol').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  context: text('context', { enum: ['fasting', 'before_meal', 'after_meal_2h', 'random'] }).notNull(),
  notes: text('notes').default(''),
});

export const foodEntries = sqliteTable('food_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category', { enum: ['breakfast', 'lunch', 'dinner', 'snack', 'treat', 'drink', 'alcohol'] }).notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const weightEntries = sqliteTable('weight_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  valueKg: real('value_kg').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  notes: text('notes').default(''),
});

export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey(),
  userName: text('user_name').notNull(),
  targetMinMmol: real('target_min_mmol').notNull().default(3.9),
  targetMaxMmol: real('target_max_mmol').notNull().default(7.8),
});
```

### Underlying SQL (for reference)

```sql
CREATE TABLE blood_sugar_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  value_mmol REAL NOT NULL,
  timestamp INTEGER NOT NULL,
  context TEXT NOT NULL CHECK(context IN ('fasting', 'before_meal', 'after_meal_2h', 'random')),
  notes TEXT DEFAULT ''
);
CREATE INDEX idx_blood_sugar_timestamp ON blood_sugar_readings(timestamp);

CREATE TABLE food_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('breakfast', 'lunch', 'dinner', 'snack', 'treat', 'drink', 'alcohol')),
  timestamp INTEGER NOT NULL
);
CREATE INDEX idx_food_timestamp ON food_entries(timestamp);

CREATE TABLE weight_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  value_kg REAL NOT NULL,
  timestamp INTEGER NOT NULL,
  notes TEXT DEFAULT ''
);
CREATE INDEX idx_weight_timestamp ON weight_entries(timestamp);

CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  user_name TEXT NOT NULL,
  target_min_mmol REAL NOT NULL DEFAULT 3.9,
  target_max_mmol REAL NOT NULL DEFAULT 7.8
);
INSERT INTO app_settings (id, user_name, target_min_mmol, target_max_mmol)
VALUES (1, '', 3.9, 7.8);
```

---

## 11. Key User Flows

### Flow 1: Log Blood Sugar
1. User opens app → lands on Log screen (full entry list)
2. Taps FAB → selects "Blood Sugar"
3. Enters value (e.g., 5.2)
4. Selects context (e.g., "Before meal")
5. Optionally adds notes
6. Taps Save → entry saved to SQLite, confirmation shown
7. Returns to Log screen with new entry visible at top

### Flow 2: View Blood Sugar Trend
1. User navigates to Graph tab (📈)
2. Selects "Blood Sugar" from dropdown
3. Selects time range (e.g., "7 days")
4. Sees line chart with colored data points and target range band
5. Meal markers show when food was logged

### Flow 3: Track Weight Loss
1. User navigates to Graph tab (📈)
2. Selects "Weight" from dropdown
3. Sees weight trend line over selected time range
4. Logs new weight via FAB → Weight form

### Flow 4: Review History
1. User is already on Log screen (the list view)
2. Sees entries grouped by Today, Yesterday, Last Week, etc.
3. Blood sugar values colored by range (red/green/yellow)
4. Swipes to delete or taps to edit an entry
5. To add a new entry, tap the FAB in the bottom-right corner

---

## 12. Success Criteria (v1)

- [ ] User can log blood sugar, food, and weight in under 10 seconds each
- [ ] Blood sugar chart shows trends with target range band and meal markers
- [ ] Weight chart shows trend line for tracking loss progress
- [ ] Log screen (combined list) groups entries logically and is easy to scan
- [ ] Data persists across app restarts (SQLite)
- [ ] Onboarding completes in under 30 seconds
- [ ] App works offline (no network required)
