# App Store Publishing — SteadySugar

## Prerequisites

- Apple Developer account ($99/year) enrolled at https://developer.apple.com
- Expo account: `npx expo login`
- EAS CLI: `npm install -g eas-cli`

## One-time setup

### 1. Configure EAS

```bash
eas build:configure
```

Links the project to EAS and updates `eas.json`.

### 2. Register the bundle ID

App Store Connect → Certificates, Identifiers & Profiles → Identifiers → register `net.pinglebo.steadysugar`.

### 3. Create the app record in App Store Connect

New App → iOS → name "SteadySugar", select the bundle ID, set primary language and SKU.

## Each release

### 4. Increment the build number

In `app.json`, increment `ios.buildNumber` before every submission — even if the version stays the same.

### 5. Build for production

```bash
eas build --platform ios --profile production
```

EAS handles signing and provisioning automatically. It will prompt you to log in to Apple on the first run.

### 6. Submit to App Store Connect

```bash
eas submit --platform ios --profile production
```

### 7. Complete the App Store listing

Required fields in App Store Connect:

- Screenshots (required: iPhone 6.7"; optional but recommended: 5.5")
- App description and keywords
- Support URL
- Privacy policy URL (required — covers camera/photo access even though all data stays on-device)
- Age rating questionnaire
- Review notes (optional, but useful for explaining the health context)

### 8. Submit for review

Apple typically reviews in 24–48 hours.

## SteadySugar-specific notes

- Camera and photo library permissions are declared — the privacy policy must explain that photos stay on-device and are not uploaded or shared.
- No backend server, so the privacy story is straightforward: all data is stored locally on the user's device.
- Bundle identifier: `net.pinglebo.steadysugar`
- Current version: `1.0.0`, build number: `1` (see `app.json`)
