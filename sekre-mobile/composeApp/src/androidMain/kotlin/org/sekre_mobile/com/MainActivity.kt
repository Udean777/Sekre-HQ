package org.sekre_mobile.com

import android.app.Application
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.logger.Level
import org.sekre_mobile.com.di.androidModule
import org.sekre_mobile.com.di.initKoin

class SekreApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // Initialize Koin
        initKoin(androidModule) {
            androidLogger(Level.DEBUG)
            androidContext(this@SekreApplication)
        }
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            App()
        }
    }
}