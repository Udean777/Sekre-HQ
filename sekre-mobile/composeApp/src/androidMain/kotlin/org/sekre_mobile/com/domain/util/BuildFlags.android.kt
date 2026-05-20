package org.sekre_mobile.com.domain.util

import org.sekre_mobile.com.BuildConfig

actual object BuildFlags {
    actual val isDebug: Boolean = BuildConfig.DEBUG
}
