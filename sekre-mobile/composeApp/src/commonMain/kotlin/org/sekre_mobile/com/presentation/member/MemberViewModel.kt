package org.sekre_mobile.com.presentation.member

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.division.ListDivisionMembersUseCase
import org.sekre_mobile.com.domain.usecase.division.ListDivisionsUseCase
import org.sekre_mobile.com.domain.usecase.member.ListMembersUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class MemberViewModel(
    private val listMembersUseCase: ListMembersUseCase,
    private val listDivisionsUseCase: ListDivisionsUseCase,
    private val listDivisionMembersUseCase: ListDivisionMembersUseCase,
) : BaseViewModel<MemberState, MemberEvent, MemberEffect>(MemberState()) {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][MemberViewModel][$tag] $msg")
    }

    override fun onEvent(event: MemberEvent) {
        log("onEvent", "event=$event")
        when (event) {
            MemberEvent.Load -> load()
            is MemberEvent.FilterByDivision -> applyFilter(event.divisionId)
        }
    }

    private fun load() = viewModelScope.launch {
        log("load", "start")
        setState { it.copy(isLoading = true, errorMessage = null) }

        val membersDeferred = async { listMembersUseCase() }
        val divisionsDeferred = async { listDivisionsUseCase() }

        val membersResult = membersDeferred.await()
        val divisionsResult = divisionsDeferred.await()

        val members = (membersResult as? Result.Success)?.data.orEmpty()
        val divisions = (divisionsResult as? Result.Success)?.data.orEmpty()
        val membersError = (membersResult as? Result.Error)?.exception?.message
        val divisionsError = (divisionsResult as? Result.Error)?.exception?.message
        val error = membersError ?: divisionsError

        log(
            "load",
            "members=${members.size} divisions=${divisions.size} error=$error",
        )

        setState {
            it.copy(
                isLoading = false,
                allMembers = members,
                divisions = divisions,
                members = members,
                selectedDivisionFilter = null,
                errorMessage = error,
            )
        }

        if (error != null) {
            sendEffect(MemberEffect.ShowError(error))
        }
    }

    private fun applyFilter(divisionId: String?) = viewModelScope.launch {
        log("applyFilter", "divisionId=$divisionId")
        if (divisionId == null) {
            setState {
                it.copy(
                    members = it.allMembers,
                    selectedDivisionFilter = null,
                    isLoading = false,
                )
            }
            return@launch
        }

        setState { it.copy(isLoading = true, selectedDivisionFilter = divisionId) }
        when (val result = listDivisionMembersUseCase(divisionId)) {
            is Result.Success -> {
                log("applyFilter", "OK count=${result.data.size}")
                val mapped = result.data.map { dm ->
                    Profile(id = dm.id, fullName = dm.fullName, email = dm.email)
                }
                setState { it.copy(isLoading = false, members = mapped) }
            }

            is Result.Error -> {
                log("applyFilter", "FAIL message=${result.exception.message}")
                setState { it.copy(isLoading = false) }
                sendEffect(
                    MemberEffect.ShowError(
                        result.exception.message ?: "Gagal memuat anggota divisi",
                    ),
                )
            }
        }
    }
}
