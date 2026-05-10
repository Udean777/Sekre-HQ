package org.sekre_mobile.com

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform