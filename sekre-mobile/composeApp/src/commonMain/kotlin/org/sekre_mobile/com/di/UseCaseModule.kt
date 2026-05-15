package org.sekre_mobile.com.di

import org.koin.dsl.module
import org.sekre_mobile.com.domain.usecase.auth.GetCurrentUserUseCase
import org.sekre_mobile.com.domain.usecase.auth.LoginUseCase
import org.sekre_mobile.com.domain.usecase.auth.LogoutUseCase
import org.sekre_mobile.com.domain.usecase.event.CreateEventUseCase
import org.sekre_mobile.com.domain.usecase.event.ListEventsUseCase
import org.sekre_mobile.com.domain.usecase.task.CreateTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.DeleteTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.ListTasksUseCase
import org.sekre_mobile.com.domain.usecase.task.UpdateTaskStatusUseCase
import org.sekre_mobile.com.domain.usecase.transaction.CreateTransactionUseCase
import org.sekre_mobile.com.domain.usecase.transaction.GetFinanceSummaryUseCase

/**
 * Use Case Module
 * Provides use case instances
 */
val useCaseModule = module {

    // Auth Use Cases
    factory { LoginUseCase(authRepository = get()) }
    factory { LogoutUseCase(authRepository = get()) }
    factory { GetCurrentUserUseCase(authRepository = get()) }

    // Task Use Cases
    factory { CreateTaskUseCase(taskRepository = get()) }
    factory { ListTasksUseCase(taskRepository = get()) }
    factory { UpdateTaskStatusUseCase(taskRepository = get()) }
    factory { DeleteTaskUseCase(taskRepository = get()) }

    // Event Use Cases
    factory { CreateEventUseCase(eventRepository = get()) }
    factory { ListEventsUseCase(eventRepository = get()) }

    // Transaction Use Cases
    factory { CreateTransactionUseCase(transactionRepository = get()) }
    factory { GetFinanceSummaryUseCase(transactionRepository = get()) }
}
