package org.sekre_mobile.com.presentation.ui

import androidx.compose.runtime.Composable
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme
import org.sekre_mobile.com.presentation.ui.theme.palette.AuroraIndigoPalette
import org.sekre_mobile.com.presentation.ui.theme.palette.SekrePalette

/**
 * AppTheme
 *
 * Thin delegation wrapper kept for backward compatibility.
 *
 * All theme logic now lives in `SekreTheme` (presentation/ui/theme/SekreTheme.kt).
 * This file re-exports `SekreTheme` under the old name so that any call sites
 * that haven't been migrated yet continue to compile without changes.
 *
 * Migration: replace `SekreTheme { ... }` call sites that import from this
 * package with the canonical import:
 *   `import org.sekre_mobile.com.presentation.ui.theme.SekreTheme`
 *
 * This file can be deleted once all call sites are migrated.
 */
@Composable
@Deprecated(
    message = "Import SekreTheme from presentation.ui.theme instead.",
    replaceWith = ReplaceWith(
        expression = "SekreTheme(palette, content)",
        imports = ["org.sekre_mobile.com.presentation.ui.theme.SekreTheme"],
    ),
    level = DeprecationLevel.WARNING,
)
fun SekreTheme(
    palette: SekrePalette = AuroraIndigoPalette,
    content: @Composable () -> Unit,
) {
    SekreTheme(palette = palette, content = content)
}
