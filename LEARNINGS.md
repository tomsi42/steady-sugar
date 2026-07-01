# LEARNINGS — Building a cross-platform Expo/React Native app

Practices worth carrying into the next project of this shape: a local-first
Expo/React Native app (SQLite storage, Skia-based charts, native date/time
pickers) targeting iOS, Android, and web from one codebase. Update this file
when something costs real time to figure out — the goal is to not pay for
the same lesson twice.

---

## Cross-platform means test on every platform you claim to support

"Works on native" is not evidence it works on web, and vice versa — the
underlying widget models are genuinely different, not just re-skinned.
Concretely, on this project: the Graph screen's Y/X axis numbers silently
failed to render on web for an entire milestone before anyone noticed,
because only the *forms* had been manually tested on web, not the chart
screen. The chart itself (line, points, band) rendered fine, which made it
easy to assume the screen "worked." A missing font just meant the text layer
quietly drew nothing — no error, no warning, no crash.

**Practice:** when a milestone adds or touches a UI surface, manually
exercise that specific surface on every platform the app targets before
calling it done — not just "the app boots and the form I changed works."
Silent, no-error failures are the dangerous ones; they don't show up in a
crash log or a red screen.

## Don't assume a shared component API means shared behavior

`@react-native-community/datetimepicker` exports one component with one
prop interface across platforms, but the actual implementations are
unrelated: iOS renders a real persistent inline view; Android mounts
nothing visible and imperatively pops a dialog via a `useEffect`. Treating
it as "one inline widget, three platforms" (i.e. always-mounted, no
show/hide state) worked by accident on iOS and silently broke on Android —
the dialog reopened on every unrelated re-render because the effect's
dependency array included the `onChange` callback, and that callback was a
fresh closure every render.

**Practice:** before wiring up a "cross-platform" native component, check
whether it's actually one unified implementation or three per-platform ones
wearing the same TypeScript interface. If per-platform, read the actual
native-facing source (not just the `.d.ts`) for the platform you're about
to ship to, especially anything involving a dialog, a modal, or an
imperative `open()`/`show()` call.

## Web ports of native primitives need explicit initialization, and it fails silently

Two separate examples from this project, same shape of bug: `matchFont()`
(Skia) and the synchronous `expo-sqlite` API both work fine on native and
both fail on web with **no error surfacing anywhere near the failure** —
one just returns `null` (no font → no text), the other blocks the main
thread on `Atomics.wait()` (browsers refuse this, and the failure mode is a
generic timeout error far from the actual cause). Anything that wraps a
native OS capability (system fonts, synchronous I/O, hardware APIs) is worth
treating as "probably needs a web-specific substitute" by default, not "probably works, I'll deal with it if it doesn't."

**Practice:** when adding a dependency that wraps a native platform capability
and the project targets web, check the library's web-support docs *before*
writing code against it, not after something silently doesn't render. If it
needs an explicit init step (loading a WASM binary, a bundled font, a polyfill),
wire that up as part of adding the dependency, not as a follow-up bug fix.

## Static imports can defeat your own initialization order

Even with an explicit web-init step in place (`initSkiaWeb()` called before
`initDatabase()` in `App.tsx`), a chart screen crashed on web because
`victory-native`/`@shopify/react-native-skia` construct a Skia singleton
**at module-evaluation time** — i.e. the moment the module is imported, which
for a static top-level `import` happens during initial bundle evaluation,
before any of your app's own async startup code has run. The fix wasn't
"call the init function earlier" (impossible — nothing runs before static
imports resolve); it was deferring the *import itself* via `React.lazy()`,
so the module isn't evaluated until the component actually renders (by
which point your init effect has long since completed).

**Practice:** for any module whose top-level code depends on an async
runtime initialization step, a static `import` at the top of a file is a
liability, not a convenience. Lazy-load it, even if that means restructuring
a component into its own file just to make the import boundary lazy.

## Local Gradle/AGP versions aren't automatically compatible

A freshly-generated `android/` project's Gradle wrapper pinned a Gradle
version (9.3.1) that didn't work with the Android Gradle Plugin version
this Expo SDK bundles — a real toolchain incompatibility
(`JvmVendorSpec.IBM_SEMERU` missing), reproducible identically regardless of
which local JDK ran Gradle. "Just installed, must be the officially
supported combination" is not a safe assumption for fast-moving native
toolchains. Pinning Gradle to `8.13` fixed it outright.

**Practice:** if a fresh native build fails with an obscure toolchain error
on the very first build (before you've touched any app code), suspect the
generated tooling versions themselves before suspecting your machine's JDK,
your app code, or your dependencies. A quick "pin the build tool to a known
LTS-ish version and retry" is often faster than chasing the actual error
message.

## Debug builds need a live Metro tether; release builds don't

Debug builds load JS from a running Metro server, which means the physical
device needs a working connection (USB + `adb reverse`, or same-network) for
as long as you're using the app, and picks up whatever port Metro happens to
be using (which can silently collide with another project's dev server on
the same machine). Release builds bundle the JS into the APK — no Metro, no
port, no persistent tether, and (in this project) they share the debug
signing keystore, so switching from a debug install to a release one is a
clean in-place update, not a reinstall.

**Practice:** default to a release build for anything beyond "actively
iterating with hot reload" — device testing, showing someone else the app,
leaving it installed for later. It removes an entire class of environment-
dependent flakiness (port conflicts, USB tether drops, "why did the picker
freeze the whole tablet" scares that turn out to be the dev connection, not
the app).

## EAS cloud builds and local builds are not interchangeable, know both paths

The EAS build queue can stall for 30+ minutes for reasons unrelated to your
code, with no useful diagnostic available from the CLI while it's stuck in
"in queue". Having a working local build path (SDK/NDK/JDK already
configured, a known-good Gradle pin) meant we weren't blocked waiting on it.
Conversely, an EAS-built APK and a locally-built one are signed with
different keystores by default, so switching between them mid-testing means
an uninstall first — which, since this app has no backend, means losing
all locally-stored data. That's a real, easy-to-forget cost of "just
reinstall it."

**Practice:** keep both build paths working, not just whichever one you
used most recently. Before uninstalling an app to switch build sources
during testing, pause and consider whether there's real data on the device
worth exporting first (this project's own JSON export feature exists for
exactly this) — don't uninstall reflexively.

## Version strings belong in one place, read everywhere else

A Settings screen showed a hardcoded `'1.1.0'` string that was correct once
and then silently wrong through three subsequent version bumps, because
nothing ever pointed back at it. The fix was mechanical: read
`packageJson.version` instead of a separately-maintained literal.

**Practice:** any user-visible version/build number should be *read* from
`package.json`/`app.json`, never duplicated as a separate literal anywhere
else in the codebase or in docs. If you must state a version in a doc for
a human's sake (e.g. an App Store publishing checklist), point at the
source-of-truth file by name instead of writing the number down, so the doc
can't silently drift stale.

## Tools that "just install" can rewrite your files without telling you clearly

Running `expo prebuild` (triggered implicitly by the first local
`expo run:android`) silently rewrote `package.json`'s `android`/`ios`
scripts. It wasn't hidden — the CLI printed "Updating package.json" — but
skimming a diff for the one line you expect to have changed (a version bump)
is exactly how an unrelated, unintentional change slips into the same commit
unnoticed.

**Practice:** after running any CLI command that touches project files as a
side effect (prebuild, codegen, autofixers), read the *full* diff of
anything staged for commit, not just the lines relevant to what you meant to
change.

## Ambiguous feature requests are worth one clarifying pass before coding

A request for chart "legends" turned out to mean the axis scale numbers,
not a color-key explaining what the chart's colors mean — two essentially
unrelated features that happened to share a word. Confirming the actual
intent (rather than picking the more common interpretation of "legend" and
building it) avoided building the wrong thing entirely.

**Practice:** when a request uses a term that has more than one plausible,
meaningfully-different interpretation in context, ask before implementing —
especially if the interpretations aren't close variations of each other but
genuinely different features.

## This project's specific test-tooling trap

`@testing-library/react-native` 14.x + React 19 in this project: `render(...)`
returns a Promise. Forgetting to `await` it doesn't throw where you'd
expect — the destructured query functions (`getByTestId`, etc.) are just
`undefined`, and calling one throws a generic "is not a function" with
nothing pointing at the real cause. Same for `fireEvent.press(...)`/
`.changeText(...)`. Losing real debugging time here came from trusting
`Object.keys(result)` (which returns `[]` for a Promise, and *also* returns
`[]` for a normal working result object — testing-library's return value
uses non-enumerable properties, so that specific debugging technique was a
red herring twice over).

**Practice:** in this stack, always `await render(...)` and `await
fireEvent...(...)`. If a testing-library query function comes back
`undefined`/non-callable, check for a missing `await` on the render/event
call before assuming anything else is broken.
