package org.sekre_mobile.com.presentation.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.savedstate.read
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
import org.sekre_mobile.com.presentation.division.DivisionFormScreen
import org.sekre_mobile.com.presentation.division.DivisionListScreen
import org.sekre_mobile.com.presentation.division.DivisionViewModel
import org.sekre_mobile.com.presentation.event.EventCreateScreen
import org.sekre_mobile.com.presentation.event.EventDetailScreen
import org.sekre_mobile.com.presentation.event.EventEditScreen
import org.sekre_mobile.com.presentation.event.EventEffect
import org.sekre_mobile.com.presentation.event.EventEvent
import org.sekre_mobile.com.presentation.event.EventListScreen
import org.sekre_mobile.com.presentation.event.EventViewModel
import org.sekre_mobile.com.presentation.finance.FinanceCreateScreen
import org.sekre_mobile.com.presentation.finance.FinanceDetailScreen
import org.sekre_mobile.com.presentation.finance.FinanceEditScreen
import org.sekre_mobile.com.presentation.finance.FinanceEffect
import org.sekre_mobile.com.presentation.finance.FinanceEvent
import org.sekre_mobile.com.presentation.finance.FinanceListScreen
import org.sekre_mobile.com.presentation.finance.FinanceViewModel
import org.sekre_mobile.com.presentation.member.AddMemberEffect
import org.sekre_mobile.com.presentation.member.AddMemberScreen
import org.sekre_mobile.com.presentation.member.AddMemberViewModel
import org.sekre_mobile.com.presentation.member.MemberEffect
import org.sekre_mobile.com.presentation.member.MemberEvent
import org.sekre_mobile.com.presentation.member.MemberListScreen
import org.sekre_mobile.com.presentation.member.MemberViewModel
import org.sekre_mobile.com.presentation.more.ChangePasswordScreen
import org.sekre_mobile.com.presentation.more.MoreEffect
import org.sekre_mobile.com.presentation.more.MoreEvent
import org.sekre_mobile.com.presentation.more.MoreListScreen
import org.sekre_mobile.com.presentation.more.MoreViewModel
import org.sekre_mobile.com.presentation.more.ProfileScreen
import org.sekre_mobile.com.presentation.task.TaskCreateScreen
import org.sekre_mobile.com.presentation.task.TaskDetailScreen
import org.sekre_mobile.com.presentation.task.TaskEditScreen
import org.sekre_mobile.com.presentation.task.TaskEffect
import org.sekre_mobile.com.presentation.task.TaskEvent
import org.sekre_mobile.com.presentation.task.TaskListScreen
import org.sekre_mobile.com.presentation.task.TaskViewModel
import org.sekre_mobile.com.presentation.ui.glass.GlassSurface
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

private data class MainTabItem(
    val route: String,
    val label: String,
    val icon: ImageVector,
)

private val mainTabs = listOf(
    MainTabItem(Routes.DASHBOARD, "Dashboard", Icons.Default.Home),
    MainTabItem(Routes.TASKS, "Tasks", Icons.Default.FilterList),
    MainTabItem(Routes.EVENTS, "Events", Icons.Default.Event),
    MainTabItem(Routes.FINANCE, "Finance", Icons.Default.AccountBalanceWallet),
    MainTabItem(Routes.MORE, "More", Icons.Default.MoreHoriz),
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
    val memberViewModel = koinViewModel<MemberViewModel>()
    val addMemberViewModel = koinViewModel<AddMemberViewModel>()

    val authState by authViewModel.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        authViewModel.onEvent(AuthEvent.Bootstrap)
    }

    LaunchedEffect(Unit) {
        authViewModel.effect.collect { effect ->
            when (effect) {
                is AuthEffect.ShowError -> snackbarHostState.showSnackbar(effect.message)
                AuthEffect.OpenLogin -> {
                    rootNav.navigate(Routes.LOGIN) {
                        popUpTo(rootNav.graph.findStartDestination().id) { inclusive = true }
                        launchSingleTop = true
                    }
                }

                AuthEffect.OpenRegister -> {
                    rootNav.navigate(Routes.REGISTER) {
                        launchSingleTop = true
                    }
                }

                AuthEffect.OpenMain -> {
                    rootNav.navigate(Routes.MAIN) {
                        popUpTo(rootNav.graph.findStartDestination().id) { inclusive = true }
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
            memberViewModel.onEvent(MemberEvent.Load)
            moreViewModel.onEvent(MoreEvent.LoadProfile)
        }
    }

    if (authState.isBootstrapping) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            CircularProgressIndicator(color = SekreTheme.colors.accentPrimary)
        }
        return
    }

    val startDestination = if (authState.isAuthenticated) Routes.MAIN else Routes.LOGIN

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
    ) { paddingValues ->
        NavHost(
            modifier = Modifier.fillMaxSize().padding(paddingValues),
            navController = rootNav,
            startDestination = startDestination,
        ) {
            composable(Routes.LOGIN) {
                LoginScreen(
                    state = authState,
                    onEvent = authViewModel::onEvent,
                    onNavigateToRegister = {
                        rootNav.navigate(Routes.REGISTER) {
                            launchSingleTop = true
                        }
                    }
                )
            }
            composable(Routes.REGISTER) {
                RegisterScreen(
                    state = authState,
                    onEvent = authViewModel::onEvent,
                    onNavigateToLogin = {
                        rootNav.popBackStack()
                    }
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
                    memberViewModel = memberViewModel,
                    addMemberViewModel = addMemberViewModel,
                    snackbarHostState = snackbarHostState,
                    onLogout = {
                        authViewModel.onEvent(AuthEvent.SignedOut)
                    }
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
    memberViewModel: MemberViewModel,
    addMemberViewModel: AddMemberViewModel,
    snackbarHostState: SnackbarHostState,
    onLogout: () -> Unit
) {
    val mainNav = rememberNavController()
    val dashboardState by dashboardViewModel.state.collectAsState()
    val taskState by taskViewModel.state.collectAsState()
    val eventState by eventViewModel.state.collectAsState()
    val financeState by financeViewModel.state.collectAsState()
    val moreState by moreViewModel.state.collectAsState()
    val divisionState by divisionViewModel.state.collectAsState()
    val memberState by memberViewModel.state.collectAsState()
    val addMemberState by addMemberViewModel.state.collectAsState()

    val canManageOrganization = moreState.authenticatedUser?.hasAdminPrivileges() ?: false

    LaunchedEffect(Unit) {
        dashboardViewModel.effect.collect { effect ->
            when (effect) {
                is DashboardEffect.ShowError -> snackbarHostState.showSnackbar(effect.message)
                is DashboardEffect.NavigateToLogin -> onLogout()
            }
        }
    }
    LaunchedEffect(Unit) {
        taskViewModel.effect.collect {
            when (it) {
                is TaskEffect.ShowError -> snackbarHostState.showSnackbar(it.message)
                TaskEffect.UpdatedSuccessfully -> snackbarHostState.showSnackbar("Tugas berhasil diperbarui")
                TaskEffect.DeletedSuccessfully -> snackbarHostState.showSnackbar("Tugas berhasil dihapus")
            }
        }
    }
    LaunchedEffect(Unit) {
        eventViewModel.effect.collect {
            when (it) {
                is EventEffect.ShowError -> snackbarHostState.showSnackbar(it.message)
                EventEffect.DeletedSuccessfully -> snackbarHostState.showSnackbar("Acara berhasil dihapus")
                EventEffect.UpdatedSuccessfully -> snackbarHostState.showSnackbar("Acara berhasil diperbarui")
            }
        }
    }
    LaunchedEffect(Unit) {
        financeViewModel.effect.collect {
            if (it is FinanceEffect.ShowError) snackbarHostState.showSnackbar(it.message)
        }
    }
    LaunchedEffect(Unit) {
        moreViewModel.effect.collect { effect ->
            when (effect) {
                is MoreEffect.ShowError -> snackbarHostState.showSnackbar(effect.message)
                MoreEffect.PasswordChanged -> {
                    snackbarHostState.showSnackbar("Password berhasil diubah")
                    mainNav.popBackStack()
                }
                MoreEffect.ProfileUpdated -> {
                    snackbarHostState.showSnackbar("Profil berhasil diperbarui")
                    mainNav.popBackStack()
                }
                MoreEffect.NavigateToLogin -> onLogout()
            }
        }
    }
    LaunchedEffect(Unit) {
        divisionViewModel.effect.collect { effect ->
            when (effect) {
                is DivisionEffect.ShowError -> snackbarHostState.showSnackbar(effect.message)
                DivisionEffect.CreatedSuccessfully -> {
                    snackbarHostState.showSnackbar("Divisi berhasil dibuat")
                    mainNav.popBackStack()
                }
                DivisionEffect.UpdatedSuccessfully -> {
                    snackbarHostState.showSnackbar("Divisi berhasil diperbarui")
                    mainNav.popBackStack()
                }
                DivisionEffect.DeletedSuccessfully -> {
                    snackbarHostState.showSnackbar("Divisi berhasil dihapus")
                    mainNav.popBackStack()
                }
            }
        }
    }
    LaunchedEffect(Unit) {
        memberViewModel.effect.collect {
            if (it is MemberEffect.ShowError) snackbarHostState.showSnackbar(it.message)
        }
    }
    LaunchedEffect(Unit) {
        addMemberViewModel.effect.collect {
            when (it) {
                is AddMemberEffect.ShowError -> snackbarHostState.showSnackbar(it.message)
                AddMemberEffect.CreatedSuccessfully -> {
                    snackbarHostState.showSnackbar("Anggota berhasil ditambahkan")
                    memberViewModel.onEvent(MemberEvent.Load)
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
            if (showBottomBar) {
                GlassSurface(
                    intensity = GlassIntensity.High,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    NavigationBar(
                        containerColor = Color.Transparent,
                        tonalElevation = 0.dp,
                    ) {
                        mainTabs.forEach { tab ->
                            val isSelected = selectedTab == tab.route
                            NavigationBarItem(
                                selected = isSelected,
                                onClick = {
                                    mainNav.navigate(tab.route) {
                                        popUpTo(mainNav.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                },
                                icon = {
                                    Icon(
                                        imageVector = tab.icon,
                                        contentDescription = tab.label
                                    )
                                },
                                label = {
                                    Text(
                                        text = tab.label,
                                        style = SekreTheme.typography.labelMedium,
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = SekreTheme.colors.accentPrimary,
                                    selectedTextColor = SekreTheme.colors.accentPrimary,
                                    unselectedIconColor = SekreTheme.colors.onGlassSecondary,
                                    unselectedTextColor = SekreTheme.colors.onGlassSecondary,
                                    indicatorColor = SekreTheme.colors.accentPrimary.copy(alpha = 0.15f),
                                ),
                            )
                        }
                    }
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
                    onOpenCreate = {
                        mainNav.navigate(Routes.TASK_CREATE)
                    },
                    onOpenDetail = { taskId ->
                        taskViewModel.onEvent(TaskEvent.OpenDetail(taskId))
                        mainNav.navigate(Routes.TASK_DETAIL)
                    },
                    onEvent = taskViewModel::onEvent
                )
            }
            composable(Routes.TASK_CREATE) {
                TaskCreateScreen(
                    state = taskState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = taskViewModel::onEvent
                )
            }
            composable(Routes.TASK_DETAIL) {
                TaskDetailScreen(
                    state = taskState,
                    onBack = { mainNav.popBackStack() },
                    onOpenEdit = { mainNav.navigate(Routes.TASK_EDIT) },
                    onEvent = taskViewModel::onEvent,
                )
            }
            composable(Routes.TASK_EDIT) {
                TaskEditScreen(
                    state = taskState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = taskViewModel::onEvent,
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
                    state = eventState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = eventViewModel::onEvent
                )
            }
            composable(Routes.EVENT_DETAIL) {
                EventDetailScreen(
                    state = eventState,
                    onBack = { mainNav.popBackStack() },
                    onOpenEdit = { mainNav.navigate(Routes.EVENT_EDIT) },
                    onEvent = eventViewModel::onEvent,
                )
            }
            composable(Routes.EVENT_EDIT) {
                EventEditScreen(
                    state = eventState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = eventViewModel::onEvent,
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
                    state = financeState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = financeViewModel::onEvent
                )
            }
        composable(Routes.FINANCE_DETAIL) {
            FinanceDetailScreen(
                state = financeState,
                onBack = { mainNav.popBackStack() },
                onOpenEdit = { id ->
                    mainNav.navigate(Routes.financeEdit(id))
                },
                onEvent = financeViewModel::onEvent
            )
        }
        composable(
            route = Routes.FINANCE_EDIT,
            arguments = listOf(navArgument("id") { type = NavType.StringType }),
        ) { backStack ->
            val id = backStack.arguments?.read { getStringOrNull("id") }.orEmpty()
            LaunchedEffect(id) {
                if (id.isNotBlank() && financeState.selectedTransaction?.transaction?.id != id) {
                    financeViewModel.onEvent(FinanceEvent.OpenDetail(id))
                }
            }
            FinanceEditScreen(
                state = financeState,
                transactionId = id,
                onBack = { mainNav.popBackStack() },
                onEvent = financeViewModel::onEvent,
            )
        }
            composable(Routes.MORE) {
                LaunchedEffect(Unit) { moreViewModel.onEvent(MoreEvent.LoadProfile) }
                MoreListScreen(
                    state = moreState,
                    onOpenProfile = { mainNav.navigate(Routes.PROFILE) },
                    onOpenChangePassword = { mainNav.navigate(Routes.CHANGE_PASSWORD) },
                    onOpenDivisions = { mainNav.navigate(Routes.DIVISIONS) },
                    onOpenMembers = { mainNav.navigate(Routes.MEMBERS) },
                    onOpenAddMember = { mainNav.navigate(Routes.ADD_MEMBER) },
                    onLogout = { moreViewModel.onEvent(MoreEvent.Logout) },
                )
            }
            composable(Routes.PROFILE) {
                ProfileScreen(
                    state = moreState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = moreViewModel::onEvent,
                )
            }
            composable(Routes.CHANGE_PASSWORD) {
                ChangePasswordScreen(
                    state = moreState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = moreViewModel::onEvent,
                )
            }
            composable(Routes.DIVISIONS) {
                DivisionListScreen(
                    state = divisionState,
                    canManage = canManageOrganization,
                    onBack = { mainNav.popBackStack() },
                    onOpenDetail = {
                        divisionViewModel.onEvent(DivisionEvent.OpenDivisionDetail(it))
                        mainNav.navigate(Routes.DIVISION_DETAIL)
                    },
                    onOpenCreate = { mainNav.navigate(Routes.DIVISION_CREATE) },
                    onEvent = divisionViewModel::onEvent,
                )
            }
            composable(Routes.DIVISION_DETAIL) {
                DivisionDetailScreen(
                    state = divisionState,
                    canManage = canManageOrganization,
                    onBack = { mainNav.popBackStack() },
                    onOpenEdit = { id ->
                        mainNav.navigate(Routes.divisionEdit(id))
                    },
                    onEvent = divisionViewModel::onEvent,
                )
            }
            composable(Routes.DIVISION_CREATE) {
                DivisionFormScreen(
                    state = divisionState,
                    divisionId = null,
                    onBack = { mainNav.popBackStack() },
                    onEvent = divisionViewModel::onEvent,
                )
            }
            composable(
                route = Routes.DIVISION_EDIT,
                arguments = listOf(navArgument("id") { type = NavType.StringType }),
            ) { backStack ->
                val id = backStack.arguments?.read { getStringOrNull("id") }.orEmpty()
                LaunchedEffect(id) {
                    if (id.isNotBlank() && divisionState.selectedDivision?.id != id) {
                        divisionViewModel.onEvent(DivisionEvent.OpenDivisionDetail(id))
                    }
                }
                DivisionFormScreen(
                    state = divisionState,
                    divisionId = id,
                    onBack = { mainNav.popBackStack() },
                    onEvent = divisionViewModel::onEvent,
                )
            }
            composable(Routes.MEMBERS) {
                MemberListScreen(
                    state = memberState,
                    canAdd = canManageOrganization,
                    onBack = { mainNav.popBackStack() },
                    onOpenAddMember = { mainNav.navigate(Routes.ADD_MEMBER) },
                    onEvent = memberViewModel::onEvent,
                )
            }
            composable(Routes.ADD_MEMBER) {
                AddMemberScreen(
                    state = addMemberState,
                    onBack = { mainNav.popBackStack() },
                    onEvent = addMemberViewModel::onEvent,
                )
            }
        }
    }
}

private fun NavDestination?.isInHierarchy(route: String): Boolean {
    return this?.hierarchy?.any { it.route == route } == true
}
