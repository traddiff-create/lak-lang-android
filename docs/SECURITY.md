# Security — LakLang Android

## Threat Model

LakLang is an offline-only educational app with no user accounts, no network calls, and no PII collection. The security posture is simple by design.

## What LakLang Does NOT Do

- No network requests (no API calls, no analytics, no telemetry)
- No user accounts or authentication
- No PII collection (no name, email, location)
- No crash reporting services
- No advertising SDKs
- No third-party analytics (Firebase, Amplitude, etc.)
- No camera, microphone, or location permissions
- No background services or workers

## What LakLang Does

- Reads a pre-built SQLite database from app assets
- Stores bookmarks locally in Room (device-only)
- Renders Lakota text with LLC orthography

## Data Protection

### Local Storage Only
All data stays on the device. Bookmarks are stored in Room's SQLite database in the app's private data directory. No cloud sync, no backup to external services.

### Content Access Control
The database contains a 3-tier access system (`public`, `community`, `restricted`). The app only displays `public` + `approved` content. This protects culturally sensitive material from unauthorized display.

### Cultural Data Sovereignty
The Lakota content in this app belongs to the Lakota people. It is not used to train AI models, not shared with third parties, and not uploaded to any server. Community partners can flag content as `restricted` and it will be removed without question.

## Permissions

LakLang requests **zero** Android permissions. The `AndroidManifest.xml` contains no `<uses-permission>` declarations.

## Build Security

- No hardcoded secrets in source code
- No API keys (no APIs to call)
- ProGuard enabled for release builds
- Debug builds are unsigned; release builds require keystore
