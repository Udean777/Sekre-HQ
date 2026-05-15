package org.sekre_mobile.com.di

import org.koin.dsl.module
import org.sekre_mobile.com.data.local.token.AndroidTokenManager
import org.sekre_mobile.com.data.local.token.TokenManager

/**
 * Android Platform Module
 * Provides Android-specific dependencies
 */
val androidModule = module {
    
    // Token Manager - Android implementation using EncryptedSharedPreferences
    single<TokenManager> {
        AndroidTokenManager(context = get())
    }
}
