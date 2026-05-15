package org.sekre_mobile.com.di

import org.koin.dsl.module
import org.sekre_mobile.com.data.local.token.IosTokenManager
import org.sekre_mobile.com.data.local.token.TokenManager

/**
 * iOS Platform Module
 * Provides iOS-specific dependencies
 */
val iosModule = module {
    
    // Token Manager - iOS implementation using Keychain
    single<TokenManager> {
        IosTokenManager()
    }
}
