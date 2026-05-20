package org.sekre_mobile.com

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import org.sekre_mobile.com.presentation.navigation.RootNavHost
import org.sekre_mobile.com.presentation.ui.system.SystemBarsController
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme
import org.sekre_mobile.com.presentation.ui.theme.palette.CleanLightPalette

@Composable
@Preview
fun App() {
    val palette = CleanLightPalette

    // Light theme: dark icons on light status/nav bar.
    SystemBarsController(isDark = palette.colors.isDark)

    SekreTheme(palette = palette) {
        RootNavHost()
    }
}
