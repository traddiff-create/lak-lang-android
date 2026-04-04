# Development Guide — LakLang Android

## Prerequisites

- Android Studio (latest stable)
- JDK 17
- Android SDK 35
- Android emulator or physical device (API 26+)

## Setup

```bash
# Clone and open
open -a "Android Studio" /Applications/Apps/LakLangAndroid

# Or build from CLI
cd /Applications/Apps/LakLangAndroid
./gradlew :app:assembleDebug
```

## Build Commands

```bash
# Debug build
./gradlew :app:assembleDebug

# Install on device/emulator
./gradlew :app:installDebug

# Release build (unsigned)
./gradlew :app:assembleRelease

# Clean
./gradlew :app:clean :app:assembleDebug

# Run tests
./gradlew :app:testDebugUnitTest
```

## Project Structure

```
LakLangAndroid/
├── app/src/main/
│   ├── assets/laklang.db          ← Pre-built 5.5MB SQLite
│   ├── java/com/traddiff/laklang/
│   │   ├── LakLangApp.kt          ← Application + DI
│   │   ├── MainActivity.kt
│   │   ├── data/
│   │   │   ├── LakLangDatabase.kt ← Room database
│   │   │   ├── DatabaseHelper.kt   ← createFromAsset
│   │   │   ├── entity/             ← 9 Room entities
│   │   │   └── dao/                ← 6 Room DAOs
│   │   ├── ui/
│   │   │   ├── navigation/         ← Nav graph + bottom tabs
│   │   │   ├── search/             ← Spotlight overlay
│   │   │   ├── explore/            ← Category browse
│   │   │   ├── detail/             ← Word detail
│   │   │   ├── stories/            ← Story list + detail
│   │   │   ├── learn/              ← Pronunciation, culture, dialogues
│   │   │   ├── saved/              ← Bookmarks
│   │   │   └── theme/              ← Material 3 colors
│   │   └── viewmodel/              ← ViewModels
│   └── res/
├── CLAUDE.md                        ← AI assistant context
├── README.md
├── CHANGELOG.md
└── ARCHITECTURE.md
```

## Adding a New Screen

1. Create composable in `ui/<feature>/`
2. Add route to `LakLangNavigation.kt`
3. Create ViewModel in `viewmodel/` if needed
4. Wire navigation from parent screen

## Updating the Database

When new content is ingested into LakLangLM:

1. Run ingestion pipelines in `/Applications/Apps/LakLangLM/`
2. Copy the updated DB: `cp LakLangLM/data/laklang.db LakLangAndroid/app/src/main/assets/laklang.db`
3. If schema changed: update Room entities to match, increment DB version
4. Clear app data on device: `adb shell pm clear com.traddiff.laklang`
5. Rebuild and install

## Emulator Commands

```bash
# List AVDs
~/Library/Android/sdk/emulator/emulator -list-avds

# Start emulator
~/Library/Android/sdk/emulator/emulator -avd Pixel_7 &

# Screenshot
adb exec-out screencap -p > screenshot.png

# View logs
adb logcat | grep -i laklang

# Clear app data
adb shell pm clear com.traddiff.laklang
```
