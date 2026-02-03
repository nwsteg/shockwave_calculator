# Gas Dynamics Mobile App

This repo contains a simple Expo (React Native) mobile app that will grow into a gas dynamics calculator. The first tab covers isentropic flow relations.

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
- **Normal Shock** and **Oblique Shock** tabs are placeholders for the next steps.

## Next ideas
- Add units and explanations to each ratio.
- Add a "solve for Mach" toggle for inverse calculations.
- Implement normal shock relations (pressure, temperature, density ratios, downstream Mach).
- Implement oblique shock calculator (theta-beta-M, shock angle, etc.).
