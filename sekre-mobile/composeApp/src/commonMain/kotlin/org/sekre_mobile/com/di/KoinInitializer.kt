package org.sekre_mobile.com.di

import org.koin.core.context.startKoin
import org.koin.core.module.Module
import org.koin.dsl.KoinAppDeclaration

/** Koin Initializer Common initialization for all platforms */
fun initKoin(platformModule: Module, appDeclaration: KoinAppDeclaration = {}) {
    startKoin {
        appDeclaration()
        modules(platformModule, networkModule, repositoryModule, useCaseModule, presentationModule)
    }
}
