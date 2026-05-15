package org.sekre_mobile.com.presentation.navigation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import org.koin.compose.viewmodel.koinViewModel
import org.sekre_mobile.com.presentation.auth.AuthEffect
import org.sekre_mobile.com.presentation.auth.AuthEvent
import org.sekre_mobile.com.presentation.auth.AuthViewModel
import org.sekre_mobile.com.presentation.auth.LoginScreen
import org.sekre_mobile.com.presentation.auth.RegisterScreen
import org.sekre_mobile.com.presentation.dashboard.DashboardEffect
import org.sekre_mobile.com.presentation.dashboard.DashboardEvent
import org.sekre_mobile.com.presentation.dashboard.DashboardScreen
import org.sekre_mobile.com.presentation.dashboard.DashboardViewModel
import org.sekre_mobile.com.presentation.division.DivisionDetailScreen
import org.sekre_mobile.com.presentation.division.DivisionEffect
import org.sekre_mobile.com.presentation.division.DivisionEvent
import org.sekre_mobile.com.presentation.division.DivisionListScreen
import org.sekre_mobile.com.presentation.division.DivisionViewModel
import org.sekre_mobile.com.presentation.division.MemberListScreen
import org.sekre_mobile.com.presentation.event.EventCreateScreen
import org.sekre_mobile.com.presentation.event.EventDetailScreen
import org.sekre_mobile.com.presentation.event.EventEffect
import org.sekre_mobile.com.presentation.event.EventEvent
import org.sekre_mobile.com.presentation.event.EventListScreen
import org.sekre_mobile.com.presentation.event.EventViewModel
import org.sekre_mobile.com.presentation.finance.FinanceCreateScreen
import org.sekre_mobile.com.presentation.finance.FinanceDetailScreen
import org.sekre_mobile.com.presentation.finance.FinanceEffect
import org.sekre_mobile.com.presentation.finance.FinanceEvent
import org.sekre_mobile.com.presentation.finance.FinanceListScreen
import org.sekre_mobile.com.presentation.finance.FinanceViewModel
import org.sekre_mobile.com.presentation.more.ChangePasswordScreen
import org.sekre_mobile.com.presentation.more.MoreEffect
import org.sekre_mobile.com.presentation.more.MoreScreen
import org.sekre_mobile.com.presentation.more.MoreViewModel
import org.sekre_mobile.com.presentation.more.ProfileScreen
import org.sekre_mobile.com.presentation.member.AddMemberEffect
import org.sekre_mobile.com.presentation.member.AddMemberScreen
import org.sekre_mobile.com.presentation.member.AddMemberViewModel
import org.sekre_mobile.com.presentation.task.TaskCreateScreen
import org.sekre_mobile.com.presentation.task.TaskDetailScreen
import org.sekre_mobile.com.presentation.task.TaskEffect
import org.sekre_mobile.com.presentation.task.TaskEvent
import org.sekre_mobile.com.presentation.task.TaskListScreen
import org.sekre_mobile.com.presentation.task.TaskViewModel

private data class MainTabItem(val route: String, val label: String)

private val mainTabs = listOf(
    MainTabItem(Routes.DASHBOARD, "Dashboard"),
    MainTabItem(Routes.TASKS, "Tasks"),
    MainTabItem(Routes.EVENTS, "Events"),
    MainTabItem(Routes.FINANCE, "Finance"),
    MainTabItem(Routes.MORE, "More"),
)
private val mainTabRoutes = mainTabs.map { it.route }.toSet()

@Composable
fun RootNavHost() {
    val rootNav = rememberNavController()
    val authViewModel = koinViewModel<AuthViewModel>()
    val dashboardViewModel = koinViewModel<DashboardViewModel>()
    val taskViewModel = koinViewModel<TaskViewModel>()
    val eventViewModel = koinViewModel<EventViewModel>()
    val financeViewModel = koinViewModel<FinanceViewModel>()
    val moreViewModel = koinViewModel<MoreViewModel>()
    val divisionViewModel = koinViewModel<DivisionViewModel>()
    val addMemberViewModel = koinViewModel<AddMemberViewModel>()

    val authState by authViewModel.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        authViewModel.onEvent(AuthEvent.Bootstrap)
        authViewModel.effect.collect { effect ->
            when (effect) {
                is AuthEffect.ShowError -> snackbarHostState.showSnackbar(effect.message)
                AuthEffect.OpenMain -> {
                    rootNav.navigate(Routes.MAIN) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            }
        }
    }

    LaunchedEffect(authState.isAuthenticated) {
        if (authState.isAuthenticated) {
            dashboardViewModel.onEvent(DashboardEvent.Load)
            taskViewModel.onEvent(TaskEvent.LoadFirstPage)
            eventViewModel.onEvent(EventEvent.Load)
            financeViewModel.onEvent(FinanceEvent.Load)
            divisionViewModel.onEvent(DivisionEvent.LoadDivisions)
            divisionViewModel.onEvent(DivisionEvent.LoadMembers)
        }
    }

    Scaffold(snackbarHost = { SnackbarHost(hostState = snackbarHostState) }) { paddingValues ->
        NavHost(
            modifier = Modifier.fillMaxSize().padding(paddingValues),
            navController = rootNav,
            startDestination = Routes.LOGIN,
        ) {
            composable(Routes.LOGIN) {
                LoginScreen(
                    state = authState,
                    onEvent = authViewModel::onEvent
                )
            }
            composable(Routes.REGISTER) {
                RegisterScreen(
                    state = authState,
                    onEvent = authViewModel::onEvent
                )
            }
            composable(Routes.MAIN) {
                MainScaffold(
                    dashboardViewModel = dashboardViewModel,
                    taskViewModel = taskViewModel,
                    eventViewModel = eventViewModel,
                    financeViewModel = financeViewModel,
                    moreViewModel = moreViewModel,
                    divisionViewModel = divisionViewModel,
                    addMemberViewModel = addMemberViewModel,
                    snackbarHostState = snackbarHostState,
                )
            }
        }
    }
}

@Composable
private fun MainScaffold(
    dashboardViewModel: DashboardViewModel,
    taskViewModel: TaskViewModel,
    eventViewModel: EventViewModel,
    financeViewModel: FinanceViewModel,
    moreViewModel: MoreViewModel,
    divisionViewModel: DivisionViewModel,
    addMemberViewModel: AddMemberViewModel,
    snackbarHostState: SnackbarHostState,
) {
    val mainNav = rememberNavController()
    val dashboardState by dashboardViewModel.state.collectAsState()
    val taskState by taskViewModel.state.collectAsState()
    val eventState by eventViewModel.state.collectAsState()
    val financeState by financeViewModel.state.collectAsState()
    val moreState by moreViewModel.state.collectAsState()
    val divisionState by divisionViewModel.state.collectAsState()
    val addMemberState by addMemberViewModel.state.collectAsState()

    LaunchedEffect(Unit) {
        dashboardViewModel.effect.collect {
            if (it is DashboardEffect.ShowError) snackbarHostState.showSnackbar(
                it.message
            )
        }
    }
    LaunchedEffect(Unit) {
        taskViewModel.effect.collect {
            if (it is TaskEffect.ShowError) snackbarHostState.showSnackbar(
                it.message
            )
        }
    }
    LaunchedEffect(Unit) {
        eventViewModel.effect.collect {
            if (it is EventEffect.ShowError) snackbarHostState.showSnackbar(
                it.message
            )
        }
    }
    LaunchedEffect(Unit) {
        financeViewModel.effect.collect {
            if (it is FinanceEffect.ShowError) snackbarHostState.showSnackbar(
                it.message
            )
        }
    }
    LaunchedEffect(Unit) {
        moreViewModel.effect.collect {
            when (it) {
                is MoreEffect.ShowError -> snackbarHostState.showSnackbar(it.message)
                MoreEffect.PasswordChanged -> snackbarHostState.showSnackbar("Password changed")
            }
        }
    }
    LaunchedEffect(Unit) {
        divisionViewModel.effect.collect {
            if (it is DivisionEffect.ShowError) snackbarHostState.showSnackbar(
                it.message
            )
        }
    }
    LaunchedEffect(Unit) {
        addMemberViewModel.effect.collect {
            when (it) {
                is AddMemberEffect.ShowError -> snackbarHostState.showSnackbar(it.message)
                AddMemberEffect.CreatedSuccessfully -> {
                    snackbarHostState.showSnackbar("Member created")
                    divisionViewModel.onEvent(DivisionEvent.LoadMembers)
                    mainNav.popBackStack()
                }
            }
        }
    }

    val backStackEntry by mainNav.currentBackStackEntryAsState()
    val destination = backStackEntry?.destination
    val currentRoute = destination?.route
    val selectedTab =
        mainTabs.firstOrNull { destination.isInHierarchy(it.route) }?.route ?: Routes.DASHBOARD
    val showBottomBar = currentRoute in mainTabRoutes

    Scaffold(
        bottomBar = {
            if (showBottomBar) NavigationBar {
                mainTabs.forEach { tab ->
                    NavigationBarItem(
                        selected = selectedTab == tab.route,
                        onClick = {
                            mainNav.navigate(tab.route) {
                                popUpTo(mainNav.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Text(tab.label.take(1)) },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { paddingValues ->
        NavHost(
            modifier = Modifier.fillMaxSize().padding(paddingValues),
            navController = mainNav,
            startDestination = Routes.DASHBOARD,
        ) {
            composable(Routes.DASHBOARD) {
                DashboardScreen(
                    state = dashboardState,
                    onEvent = dashboardViewModel::onEvent
                )
            }
            composable(Routes.TASKS) {
                TaskListScreen(
                    state = taskState,
                    onEvent = taskViewModel::onEvent
                )
            }
            composable(Routes.TASK_CREATE) { TaskCreateScreen(onEvent = taskViewModel::onEvent) }
            composable(Routes.TASK_DETAIL) {
                TaskDetailScreen(
                    state = taskState,
                    onEvent = taskViewModel::onEvent
                )
            }
            composable(Routes.EVENTS) {
                EventListScreen(
                    state = eventState,
                    onOpenCreate = { mainNav.navigate(Routes.EVENT_CREATE) },
                    onOpenDetail = {
                        eventViewModel.onEvent(EventEvent.OpenDetail(it))
                        mainNav.navigate(Routes.EVENT_DETAIL)
                    },
                    onEvent = eventViewModel::onEvent,
                )
            }
            composable(Routes.EVENT_CREATE) {
                EventCreateScreen(
                    onBack = { mainNav.popBackStack() },
                    onEvent = eventViewModel::onEvent
                )
            }
            composable(Routes.EVENT_DETAIL) {
                EventDetailScreen(
                    state = eventState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = eventViewModel::onEvent
                )
            }
            composable(Routes.FINANCE) {
                FinanceListScreen(
                    state = financeState,
                    onOpenCreate = { mainNav.navigate(Routes.FINANCE_CREATE) },
                    onOpenDetail = {
                        financeViewModel.onEvent(FinanceEvent.OpenDetail(it))
                        mainNav.navigate(Routes.FINANCE_DETAIL)
                    },
                    onEvent = financeViewModel::onEvent,
                )
            }
            composable(Routes.FINANCE_CREATE) {
                FinanceCreateScreen(
                    onBack = { mainNav.popBackStack() },
                    onEvent = financeViewModel::onEvent
                )
            }
            composable(Routes.FINANCE_DETAIL) {
                FinanceDetailScreen(
                    state = financeState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = financeViewModel::onEvent
                )
            }
            composable(Routes.MORE) {
                MoreScreen(
                    onOpenProfile = { mainNav.navigate(Routes.PROFILE) },
                    onOpenChangePassword = { mainNav.navigate(Routes.CHANGE_PASSWORD) },
                    onOpenDivisions = { mainNav.navigate(Routes.DIVISIONS) },
                    onOpenMembers = { mainNav.navigate(Routes.MEMBERS) },
                    onOpenAddMember = { mainNav.navigate(Routes.ADD_MEMBER) },
                )
            }
            composable(Routes.PROFILE) {
                ProfileScreen(
                    state = moreState,
                    onEvent = moreViewModel::onEvent
                )
            }
            composable(Routes.CHANGE_PASSWORD) { ChangePasswordScreen(onEvent = moreViewModel::onEvent) }
            composable(Routes.DIVISIONS) {
                DivisionListScreen(
                    state = divisionState,
                    onOpenDetail = {
                        divisionViewModel.onEvent(DivisionEvent.OpenDivisionDetail(it))
                        mainNav.navigate(Routes.DIVISION_DETAIL)
                    },
                    onEvent = divisionViewModel::onEvent,
                )
            }
            composable(Routes.DIVISION_DETAIL) { DivisionDetailScreen(state = divisionState) }
            composable(Routes.MEMBERS) {
                MemberListScreen(
                    state = divisionState,
                    onOpenAddMember = { mainNav.navigate(Routes.ADD_MEMBER) },
                    onEvent = divisionViewModel::onEvent
                )
            }
            composable(Routes.ADD_MEMBER) {
                AddMemberScreen(state = addMemberState, onEvent = addMemberViewModel::onEvent)
            }
        }
    }
}

private fun NavDestination?.isInHierarchy(route: String): Boolean {
    return this?.hierarchy?.any { it.route == route } == true
}
