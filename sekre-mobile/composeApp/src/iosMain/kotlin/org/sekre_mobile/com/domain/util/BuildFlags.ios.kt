package org.sekre_mobile.com.domain.util

@OptIn(kotlin.experimental.ExperimentalNativeApi::class)
actual object BuildFlags {
    actual val isDebug: Boolean = kotlin.native.Platform.isDebugBinary
}
