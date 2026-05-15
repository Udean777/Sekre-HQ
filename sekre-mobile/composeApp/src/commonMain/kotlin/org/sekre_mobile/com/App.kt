package org.sekre_mobile.com

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import org.sekre_mobile.com.presentation.navigation.RootNavHost

@Composable
@Preview
fun App() {
    MaterialTheme {
        RootNavHost()
    }
}
