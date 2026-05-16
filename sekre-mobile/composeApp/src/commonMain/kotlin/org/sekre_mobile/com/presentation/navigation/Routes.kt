package org.sekre_mobile.com.presentation.navigation

object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val MAIN = "main"
    const val DASHBOARD = "dashboard"
    const val TASKS = "tasks"
    const val TASK_CREATE = "task_create"
    const val TASK_DETAIL = "task_detail"
    const val EVENTS = "events"
    const val EVENT_CREATE = "event_create"
    const val EVENT_DETAIL = "event_detail"
    const val FINANCE = "finance"
    const val FINANCE_CREATE = "finance_create"
    const val FINANCE_DETAIL = "finance_detail"
    const val MORE = "more"
    const val PROFILE = "profile"
    const val CHANGE_PASSWORD = "change_password"
    const val DIVISIONS = "divisions"
    const val DIVISION_DETAIL = "division_detail"
    const val DIVISION_CREATE = "division_create"
    const val DIVISION_EDIT = "division_edit/{id}"
    const val MEMBERS = "members"
    const val ADD_MEMBER = "add_member"

    fun divisionEdit(id: String): String = "division_edit/$id"
}
