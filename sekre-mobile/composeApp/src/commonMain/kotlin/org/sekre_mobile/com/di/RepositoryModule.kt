package org.sekre_mobile.com.di

import org.koin.core.qualifier.named
import org.koin.dsl.module
import org.sekre_mobile.com.data.repository.AuthRepositoryImpl
import org.sekre_mobile.com.data.repository.DivisionRepositoryImpl
import org.sekre_mobile.com.data.repository.EventRepositoryImpl
import org.sekre_mobile.com.data.repository.TaskRepositoryImpl
import org.sekre_mobile.com.data.repository.TransactionRepositoryImpl
import org.sekre_mobile.com.domain.repository.AuthRepository
import org.sekre_mobile.com.domain.repository.DivisionRepository
import org.sekre_mobile.com.domain.repository.EventRepository
import org.sekre_mobile.com.domain.repository.TaskRepository
import org.sekre_mobile.com.domain.repository.TransactionRepository

/**
 * Repository Module
 * Provides repository implementations
 */
val repositoryModule = module {

    // Auth Repository
    single<AuthRepository> {
        AuthRepositoryImpl(
            httpClient = get(named("authenticated")),
            unauthenticatedClient = get(named("unauthenticated")),
            tokenManager = get()
        )
    }

    // Task Repository
    single<TaskRepository> {
        TaskRepositoryImpl(
            httpClient = get(named("authenticated"))
        )
    }

    // Event Repository
    single<EventRepository> {
        EventRepositoryImpl(
            httpClient = get(named("authenticated"))
        )
    }

    // Transaction Repository
    single<TransactionRepository> {
        TransactionRepositoryImpl(
            httpClient = get(named("authenticated"))
        )
    }

    // Division Repository
    single<DivisionRepository> {
        DivisionRepositoryImpl(
            httpClient = get(named("authenticated"))
        )
    }
}
