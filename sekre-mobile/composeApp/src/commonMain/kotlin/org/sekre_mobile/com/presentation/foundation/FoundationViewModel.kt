package org.sekre_mobile.com.presentation.foundation

import org.sekre_mobile.com.presentation.base.BaseViewModel
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class FoundationState(
    val isReady: Boolean = true,
) : ViewState

sealed interface FoundationEvent : ViewEvent {
    data object Bootstrap : FoundationEvent
}

sealed interface FoundationEffect : ViewEffect

class FoundationViewModel :
    BaseViewModel<FoundationState, FoundationEvent, FoundationEffect>(FoundationState()) {
    override fun onEvent(event: FoundationEvent) = Unit
}
