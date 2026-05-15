package org.sekre_mobile.com.presentation.base

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update

abstract class BaseViewModel<S : ViewState, E : ViewEvent, F : ViewEffect>(
    initialState: S,
) : ViewModel() {
    private val _state = MutableStateFlow(initialState)
    val state: StateFlow<S> = _state.asStateFlow()

    private val effectChannel = Channel<F>(Channel.BUFFERED)
    val effect = effectChannel.receiveAsFlow()

    protected fun setState(reducer: (S) -> S) {
        _state.update(reducer)
    }

    protected suspend fun sendEffect(effect: F) {
        effectChannel.send(effect)
    }

    abstract fun onEvent(event: E)
}
