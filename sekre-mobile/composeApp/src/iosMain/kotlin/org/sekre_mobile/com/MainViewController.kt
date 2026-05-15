package org.sekre_mobile.com

import androidx.compose.ui.window.ComposeUIViewController
import org.sekre_mobile.com.di.initKoin
import org.sekre_mobile.com.di.iosModule

fun MainViewController() = ComposeUIViewController(
    configure = {
        // Initialize Koin for iOS
        initKoin(iosModule)
    }
) { 
    App() 
}