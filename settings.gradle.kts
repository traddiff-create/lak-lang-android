// settings.gradle.kts
// LakLang — Lakota Language & Cultural Preservation

pluginManagement {
    repositories {
        google()
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "LakLang"

include(":app")
