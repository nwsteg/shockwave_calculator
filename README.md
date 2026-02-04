# Shockwave Calculator

This repo contains a simple Expo (React Native) mobile app that will grow into a shockwave-focused gas dynamics calculator. The first tabs cover isentropic flow, normal shock, oblique shock, and condensation plotting.

## Getting started (first-time setup)
1. Install Node.js 18+ (LTS recommended).
2. Install Expo CLI (optional but handy):
   ```bash
   npm install -g expo-cli
   ```
3. Install dependencies in this repo:
   ```bash
   npm install
   ```

## Running the app
- Start the dev server:
  ```bash
  npm run start
  ```
- Open on a device:
  - **iOS**: scan the QR code with the Camera app (requires Expo Go from the App Store).
  - **Android**: scan the QR code with the Expo Go app.
  - **Web** (optional): press `w` in the terminal or run `npm run web`.

## EAS Build (Android release)
1. Authenticate with EAS:
   ```bash
   eas login
   ```
2. Initialize build configuration:
   ```bash
   eas build:configure
   ```
3. Build the production Android App Bundle:
   ```bash
   eas build -p android --profile production
   ```

> **Versioning note:** `expo.android.versionCode` starts at `1` and must be incremented for every Play Store release.

## What’s in the app today
- **Isentropic tab** with inputs for Mach number and gamma.
- Live results for common ratios: `T/T0`, `P/P0`, `ρ/ρ0`, `A/A*`, plus the Mach angle.
- A scratch pad for multiplying a selected ratio by a custom value.
- **Normal Shock tab** with upstream Mach/gamma inputs, key shock ratios, and a scratch pad.
- **Oblique Shock tab** with upstream Mach/gamma/deflection inputs, key shock ratios, and a scratch pad.
- **Condensation tab** with an offline vapor pressure plot, isentropic overlay, and condensation classification.

## Next ideas
- Add units and explanations to each ratio.
- Add a "solve for Mach" toggle for inverse calculations.

## Privacy policy (GitHub Pages)
This repo includes a privacy policy at `docs/privacy/index.md`. To host it on GitHub Pages:
1. Go to **Settings → Pages** in the GitHub repo.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Set **Branch** to your default branch and **/docs** as the folder, then save.

Once enabled, the policy will be available at:
`https://<github-username>.github.io/<repository>/privacy` (for example, `https://nwsteg.github.io/shockwave_calculator/privacy`).
