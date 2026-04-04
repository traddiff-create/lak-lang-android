// build.gradle.kts (Root)
// LakLang — Lakota Language & Cultural Preservation

plugins {
    kotlin("android") version "1.9.24" apply false
    id("com.android.application") version "8.3.0" apply false
    id("com.google.devtools.ksp") version "1.9.24-1.0.20" apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}
