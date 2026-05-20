package org.sekre_mobile.com

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import org.sekre_mobile.com.presentation.navigation.RootNavHost
import org.sekre_mobile.com.presentation.ui.SekreTheme

@Composable
@Preview
fun App() {
    SekreTheme {
        RootNavHost()
    }
}
