package org.sekre_mobile.com.di

import org.koin.dsl.module
import org.sekre_mobile.com.domain.usecase.auth.GetCurrentUserUseCase
import org.sekre_mobile.com.domain.usecase.auth.LoginUseCase
import org.sekre_mobile.com.domain.usecase.auth.LogoutUseCase
import org.sekre_mobile.com.domain.usecase.auth.RegisterUseCase
import org.sekre_mobile.com.domain.usecase.division.CreateDivisionUseCase
import org.sekre_mobile.com.domain.usecase.division.DeleteDivisionUseCase
import org.sekre_mobile.com.domain.usecase.division.GetDivisionByIdUseCase
import org.sekre_mobile.com.domain.usecase.division.ListDivisionMembersUseCase
import org.sekre_mobile.com.domain.usecase.division.ListDivisionsUseCase
import org.sekre_mobile.com.domain.usecase.division.UpdateDivisionUseCase
import org.sekre_mobile.com.domain.usecase.event.CreateEventUseCase
import org.sekre_mobile.com.domain.usecase.event.DeleteEventUseCase
import org.sekre_mobile.com.domain.usecase.event.GetEventByIdUseCase
import org.sekre_mobile.com.domain.usecase.event.ListEventsUseCase
import org.sekre_mobile.com.domain.usecase.event.UpdateEventUseCase
import org.sekre_mobile.com.domain.usecase.task.CreateTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.DeleteTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.GetTaskByIdUseCase
import org.sekre_mobile.com.domain.usecase.task.ListTasksUseCase
import org.sekre_mobile.com.domain.usecase.task.UpdateTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.UpdateTaskStatusUseCase
import org.sekre_mobile.com.domain.usecase.transaction.CreateTransactionUseCase
import org.sekre_mobile.com.domain.usecase.transaction.DeleteTransactionUseCase
import org.sekre_mobile.com.domain.usecase.transaction.GetFinanceSummaryUseCase
import org.sekre_mobile.com.domain.usecase.transaction.GetTransactionByIdUseCase
import org.sekre_mobile.com.domain.usecase.transaction.ListTransactionsUseCase
import org.sekre_mobile.com.domain.usecase.transaction.UpdateTransactionUseCase
import org.sekre_mobile.com.domain.usecase.member.ListMembersUseCase
import org.sekre_mobile.com.domain.usecase.member.CreateMemberUseCase
import org.sekre_mobile.com.domain.usecase.user.ChangePasswordUseCase
import org.sekre_mobile.com.domain.usecase.user.UpdateProfileUseCase

/**
 * Use Case Module
 * Provides use case instances
 */
val useCaseModule = module {

    // Auth Use Cases
    factory { LoginUseCase(authRepository = get()) }
    factory { RegisterUseCase(authRepository = get()) }
    factory { LogoutUseCase(authRepository = get()) }
    factory { GetCurrentUserUseCase(authRepository = get()) }

    // Task Use Cases
    factory { CreateTaskUseCase(taskRepository = get()) }
    factory { ListTasksUseCase(taskRepository = get()) }
    factory { GetTaskByIdUseCase(taskRepository = get()) }
    factory { UpdateTaskUseCase(taskRepository = get()) }
    factory { UpdateTaskStatusUseCase(taskRepository = get()) }
    factory { DeleteTaskUseCase(taskRepository = get()) }

    // Event Use Cases
    factory { CreateEventUseCase(eventRepository = get()) }
    factory { ListEventsUseCase(eventRepository = get()) }
    factory { GetEventByIdUseCase(eventRepository = get()) }
    factory { UpdateEventUseCase(eventRepository = get()) }
    factory { DeleteEventUseCase(eventRepository = get()) }

    // Transaction Use Cases
    factory { CreateTransactionUseCase(transactionRepository = get()) }
    factory { ListTransactionsUseCase(transactionRepository = get()) }
    factory { GetTransactionByIdUseCase(transactionRepository = get()) }
    factory { UpdateTransactionUseCase(transactionRepository = get()) }
    factory { DeleteTransactionUseCase(transactionRepository = get()) }
    factory { GetFinanceSummaryUseCase(transactionRepository = get()) }

    // User Use Cases
    factory { UpdateProfileUseCase(userRepository = get()) }
    factory { ChangePasswordUseCase(userRepository = get()) }

    // Division & Member Use Cases
    factory { ListDivisionsUseCase(divisionRepository = get()) }
    factory { GetDivisionByIdUseCase(divisionRepository = get()) }
    factory { CreateDivisionUseCase(divisionRepository = get()) }
    factory { UpdateDivisionUseCase(divisionRepository = get()) }
    factory { DeleteDivisionUseCase(divisionRepository = get()) }
    factory { ListDivisionMembersUseCase(divisionRepository = get()) }
    factory { ListMembersUseCase(userRepository = get()) }
    factory { CreateMemberUseCase(userRepository = get()) }
}
