package org.sekre_mobile.com.data.local.token

import platform.Foundation.NSUserDefaults

/**
 * iOS Token Manager Implementation
 * Uses NSUserDefaults for token storage
 * TODO: Upgrade to Keychain for production
 */
class IosTokenManager : TokenManager {
    
    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
    }
    
    private val userDefaults = NSUserDefaults.standardUserDefaults
    
    override suspend fun saveAccessToken(token: String) {
        userDefaults.setObject(token, KEY_ACCESS_TOKEN)
        userDefaults.synchronize()
    }
    
    override suspend fun getAccessToken(): String? {
        return userDefaults.stringForKey(KEY_ACCESS_TOKEN)
    }
    
    override suspend fun saveRefreshToken(token: String) {
        userDefaults.setObject(token, KEY_REFRESH_TOKEN)
        userDefaults.synchronize()
    }
    
    override suspend fun getRefreshToken(): String? {
        return userDefaults.stringForKey(KEY_REFRESH_TOKEN)
    }
    
    override suspend fun clearTokens() {
        userDefaults.removeObjectForKey(KEY_ACCESS_TOKEN)
        userDefaults.removeObjectForKey(KEY_REFRESH_TOKEN)
        userDefaults.synchronize()
    }
    
    override suspend fun isAuthenticated(): Boolean {
        return getAccessToken() != null
    }
}
