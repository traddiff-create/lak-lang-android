package com.traddiff.laklang.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Earthy, natural palette — respectful, grounded
private val EarthBrown = Color(0xFF5D4037)
private val WarmSand = Color(0xFFA67B5B)
private val SageGreen = Color(0xFF6B7F5E)
private val DeepSky = Color(0xFF4A6FA5)
private val SunsetOrange = Color(0xFFCC7832)
private val CreamWhite = Color(0xFFFAF3E8)
private val DarkEarth = Color(0xFF2C1F14)
private val WarmGray = Color(0xFF8D7B68)

private val LightColorScheme = lightColorScheme(
    primary = EarthBrown,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD7C4A7),
    onPrimaryContainer = DarkEarth,
    secondary = SageGreen,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFCDD8C4),
    onSecondaryContainer = Color(0xFF2C3B24),
    tertiary = DeepSky,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFB8CCE4),
    onTertiaryContainer = Color(0xFF1A2E45),
    background = CreamWhite,
    onBackground = DarkEarth,
    surface = CreamWhite,
    onSurface = DarkEarth,
    surfaceVariant = Color(0xFFF0E6D6),
    onSurfaceVariant = WarmGray,
    outline = WarmGray,
)

private val DarkColorScheme = darkColorScheme(
    primary = WarmSand,
    onPrimary = DarkEarth,
    primaryContainer = EarthBrown,
    onPrimaryContainer = Color(0xFFE8D5C0),
    secondary = Color(0xFF9DB88F),
    onSecondary = Color(0xFF1A2B14),
    secondaryContainer = Color(0xFF3D4E36),
    onSecondaryContainer = Color(0xFFCDD8C4),
    tertiary = Color(0xFF8FADD4),
    onTertiary = Color(0xFF0F2036),
    tertiaryContainer = Color(0xFF2A4668),
    onTertiaryContainer = Color(0xFFB8CCE4),
    background = Color(0xFF1A1410),
    onBackground = Color(0xFFE8DDD0),
    surface = Color(0xFF1A1410),
    onSurface = Color(0xFFE8DDD0),
    surfaceVariant = Color(0xFF3A2E24),
    onSurfaceVariant = Color(0xFFBFAF9C),
    outline = WarmGray,
)

@Composable
fun LakLangTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content,
    )
}
