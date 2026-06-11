package org.sekre.app

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform