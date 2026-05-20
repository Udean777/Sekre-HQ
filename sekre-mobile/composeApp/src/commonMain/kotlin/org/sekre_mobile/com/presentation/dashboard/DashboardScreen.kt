package org.sekre_mobile.com.presentation.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.dashboard.components.DashboardErrorState
import org.sekre_mobile.com.presentation.dashboard.components.DashboardHeader
import org.sekre_mobile.com.presentation.dashboard.components.DashboardHeroCard
import org.sekre_mobile.com.presentation.dashboard.components.DashboardInfoSection
import org.sekre_mobile.com.presentation.dashboard.components.DashboardInlineError
import org.sekre_mobile.com.presentation.dashboard.components.DashboardLoadingState
import org.sekre_mobile.com.presentation.dashboard.components.DashboardMetrics
import org.sekre_mobile.com.presentation.foundation.SafeArea

@Composable
fun DashboardScreen(
    state: DashboardState,
    onEvent: (DashboardEvent) -> Unit,
) {
    SafeArea {
        BoxWithConstraints(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            val isWide = maxWidth >= 760.dp
            val horizontalPadding = if (isWide) 24.dp else 16.dp

            when {
                state.isLoading && state.user == null && state.financeSummary == null -> {
                    DashboardLoadingState()
                }

                state.errorMessage != null && state.user == null && state.financeSummary == null -> {
                    DashboardErrorState(
                        message = state.errorMessage,
                        onRetry = { onEvent(DashboardEvent.Retry) }
                    )
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(
                            start = horizontalPadding,
                            end = horizontalPadding,
                            bottom = 32.dp
                        ),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        item {
                            Column(
                                modifier = Modifier.widthIn(max = 860.dp),
                                verticalArrangement = Arrangement.spacedBy(24.dp)
                            ) {
                                DashboardHeader(
                                    user = state.user,
                                    onLogoutClick = { onEvent(DashboardEvent.Logout) }
                                )

                                DashboardHeroCard(
                                    user = state.user,
                                    summary = state.financeSummary
                                )

                                DashboardMetrics(
                                    summary = state.financeSummary,
                                    isWide = isWide
                                )

                                DashboardInfoSection(
                                    user = state.user,
                                    summary = state.financeSummary,
                                    isWide = isWide
                                )

                                state.errorMessage?.let { msg ->
                                    DashboardInlineError(
                                        message = msg,
                                        onRetry = { onEvent(DashboardEvent.Retry) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
