package org.sekre_mobile.com.presentation.ui

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val SekreLightColorScheme: ColorScheme = lightColorScheme(
    primary = Color(0xFF334155), // Muted Slate (Solid & Professional)
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFF1F5F9),
    onPrimaryContainer = Color(0xFF1E293B),
    secondary = Color(0xFF64748B), // Soft Slate Blue
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFF8FAFC),
    onSecondaryContainer = Color(0xFF334155),
    tertiary = Color(0xFF94A3B8), 
    onTertiary = Color(0xFFFFFFFF),
    background = Color(0xFFFFFFFF),
    onBackground = Color(0xFF0F172A),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF0F172A),
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = Color(0xFF475569),
    outline = Color(0xFFE2E8F0),
    outlineVariant = Color(0xFFF1F5F9),
    error = Color(0xFFB91C1C),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFFEF2F2),
    onErrorContainer = Color(0xFF7F1D1D),
)

@Composable
fun SekreTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = SekreLightColorScheme,
        typography = Typography(),
        content = content,
    )
}
