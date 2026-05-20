package org.sekre_mobile.com.presentation.ui.theme.compositionlocal

import androidx.compose.runtime.staticCompositionLocalOf
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreColors
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreElevation
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreShapes
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreSpacing
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreTypography

/**
 * LocalSekreTheme
 *
 * CompositionLocals for all Sekre design-system token groups.
 *
 * Why `staticCompositionLocalOf`?
 * - Token objects are replaced wholesale when the palette changes (e.g. user
 *   switches theme). `staticCompositionLocalOf` invalidates the entire
 *   subtree on change, which is correct here — every composable that reads
 *   colors/shapes/etc. must recompose anyway.
 * - For values that change frequently at runtime (e.g. scroll offset), use
 *   `compositionLocalOf` instead. Tokens are not that kind of value.
 *
 * All locals default to `error(...)` so a missing `SekreTheme { }` wrapper
 * produces a clear, actionable crash message rather than a silent wrong color.
 *
 * Consumers MUST NOT reference these locals directly. Use the `SekreTheme`
 * object accessors (`SekreTheme.colors`, `SekreTheme.shapes`, etc.) which
 * are the stable public API.
 */

internal val LocalSekreColors = staticCompositionLocalOf<SekreColors> {
    error(
        "LocalSekreColors not provided. " +
                "Ensure your screen is wrapped with SekreTheme { ... }."
    )
}

internal val LocalSekreShapes = staticCompositionLocalOf<SekreShapes> {
    error(
        "LocalSekreShapes not provided. " +
                "Ensure your screen is wrapped with SekreTheme { ... }."
    )
}

internal val LocalSekreSpacing = staticCompositionLocalOf<SekreSpacing> {
    error(
        "LocalSekreSpacing not provided. " +
                "Ensure your screen is wrapped with SekreTheme { ... }."
    )
}

internal val LocalSekreTypography = staticCompositionLocalOf<SekreTypography> {
    error(
        "LocalSekreTypography not provided. " +
                "Ensure your screen is wrapped with SekreTheme { ... }."
    )
}

internal val LocalSekreElevation = staticCompositionLocalOf<SekreElevation> {
    error(
        "LocalSekreElevation not provided. " +
                "Ensure your screen is wrapped with SekreTheme { ... }."
    )
}
