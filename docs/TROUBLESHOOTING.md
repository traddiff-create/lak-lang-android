# Troubleshooting — LakLang Android

## Build Issues

### "SDK not found"
```bash
# Set ANDROID_HOME
export ANDROID_HOME=~/Library/Android/sdk
```

### "compileSdk 35 not tested"
Already suppressed in `gradle.properties`:
```
android.suppressUnsupportedCompileSdk=35
```

### Gradle sync fails
```bash
./gradlew --stop && ./gradlew clean
```

## Database Issues

### Schema mismatch crash
Room validates the pre-built database schema against entity definitions. If the LakLangLM database schema changes:

1. Compare actual schema: `sqlite3 laklang.db ".schema tablename"`
2. Update Room entities to match every column (name, type, nullability)
3. Clear app data: `adb shell pm clear com.traddiff.laklang`
4. Rebuild

### "Pre-packaged database has an invalid schema"
This means a Room entity doesn't match the actual SQLite table. Common causes:
- Missing columns (e.g., `review_notes`, `reviewed_by`, `reviewed_at`)
- Wrong column types or nullability
- Table was altered after initial creation (column at end of schema)

### Database not loading
```bash
# Clear and reinstall
adb shell pm clear com.traddiff.laklang
./gradlew :app:installDebug
```

## Orthography Issues

### Diacritics not rendering
LLC orthography characters (ą, š, ž, č, ȟ, ġ, ŋ, ʼ) should render on all Android 8+ devices with system fonts. If a specific device has issues:
- Check the device's default font supports Unicode Latin Extended
- Consider bundling Noto Sans as a custom font
- The glottal stop (ʼ) is Unicode U+02BC, not an apostrophe

## Emulator Issues

### Emulator won't start
```bash
# List available AVDs
~/Library/Android/sdk/emulator/emulator -list-avds

# Start without snapshot
~/Library/Android/sdk/emulator/emulator -avd Pixel_7 -no-snapshot-load
```

### App crashes on launch
```bash
# Check logcat for the exception
adb logcat -d | grep -A 20 "FATAL EXCEPTION"
```

### ANR (App Not Responding)
If the database copy takes too long on first launch, Room's `createFromAsset` handles this on a background thread. If ANR persists, check that database operations aren't on the main thread.
