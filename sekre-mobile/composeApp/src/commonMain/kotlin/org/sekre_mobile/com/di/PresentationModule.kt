package org.sekre_mobile.com.di

import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module
import org.sekre_mobile.com.presentation.auth.AuthViewModel
import org.sekre_mobile.com.presentation.dashboard.DashboardViewModel
import org.sekre_mobile.com.presentation.division.DivisionViewModel
import org.sekre_mobile.com.presentation.event.EventViewModel
import org.sekre_mobile.com.presentation.finance.FinanceViewModel
import org.sekre_mobile.com.presentation.foundation.FoundationViewModel
import org.sekre_mobile.com.presentation.more.MoreViewModel
import org.sekre_mobile.com.presentation.member.AddMemberViewModel
import org.sekre_mobile.com.presentation.task.TaskViewModel

val presentationModule = module {
    viewModelOf(::FoundationViewModel)
    viewModelOf(::AuthViewModel)
    viewModelOf(::DashboardViewModel)
    viewModelOf(::TaskViewModel)
    viewModelOf(::EventViewModel)
    viewModelOf(::FinanceViewModel)
    viewModelOf(::MoreViewModel)
    viewModelOf(::DivisionViewModel)
    viewModelOf(::AddMemberViewModel)
}
