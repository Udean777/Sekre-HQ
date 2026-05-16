package org.sekre_mobile.com.presentation.event

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun EventListScreen(state: EventState, onOpenCreate: () -> Unit, onOpenDetail: (String) -> Unit, onEvent: (EventEvent) -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Events")
        Button(onClick = { onEvent(EventEvent.Load) }) { Text("Refresh") }
        Button(onClick = onOpenCreate) { Text("Create") }
        if (state.isLoading) CircularProgressIndicator()
        if (state.events.isEmpty() && !state.isLoading) Text("No events")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(state.events, key = { it.event.id }) { item ->
                Column(modifier = Modifier.fillMaxWidth().clickable { onOpenDetail(item.event.id) }.padding(8.dp)) {
                    Text(item.event.title)
                    Text(item.event.startTime.toString())
                }
            }
        }
    }
}

@Composable
fun EventCreateScreen(onBack: () -> Unit, onEvent: (EventEvent) -> Unit) {
    val divisionId = remember { mutableStateOf("") }
    val title = remember { mutableStateOf("") }
    val description = remember { mutableStateOf("") }
    val location = remember { mutableStateOf("") }
    val startTime = remember { mutableStateOf("") }
    val endTime = remember { mutableStateOf("") }
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Create Event")
        OutlinedTextField(value = divisionId.value, onValueChange = { divisionId.value = it }, label = { Text("Division ID") })
        OutlinedTextField(value = title.value, onValueChange = { title.value = it }, label = { Text("Title") })
        OutlinedTextField(value = description.value, onValueChange = { description.value = it }, label = { Text("Description") })
        OutlinedTextField(value = location.value, onValueChange = { location.value = it }, label = { Text("Location") })
        OutlinedTextField(value = startTime.value, onValueChange = { startTime.value = it }, label = { Text("Start Time (ms)") })
        OutlinedTextField(value = endTime.value, onValueChange = { endTime.value = it }, label = { Text("End Time (ms)") })
        Button(onClick = {
            val start = startTime.value.toLongOrNull() ?: 0L
            val end = endTime.value.toLongOrNull() ?: 0L
            onEvent(EventEvent.SubmitCreate(divisionId.value, title.value, description.value, start, end, location.value.ifBlank { null }))
            onBack()
        }) { Text("Submit") }
    }
}

@Composable
fun EventDetailScreen(state: EventState, onBack: () -> Unit, onEvent: (EventEvent) -> Unit) {
    val selected = state.selectedEvent
    if (selected == null) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) { Text("No event selected") }
        return
    }
    val title = remember(selected.event.id) { mutableStateOf(selected.event.title) }
    val description = remember(selected.event.id) { mutableStateOf(selected.event.description) }
    val location = remember(selected.event.id) { mutableStateOf(selected.event.location ?: "") }
    val startTime = remember(selected.event.id) { mutableStateOf(selected.event.startTime.toString()) }
    val endTime = remember(selected.event.id) { mutableStateOf(selected.event.endTime.toString()) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Event Detail")
        OutlinedTextField(value = title.value, onValueChange = { title.value = it }, label = { Text("Title") })
        OutlinedTextField(value = description.value, onValueChange = { description.value = it }, label = { Text("Description") })
        OutlinedTextField(value = location.value, onValueChange = { location.value = it }, label = { Text("Location") })
        OutlinedTextField(value = startTime.value, onValueChange = { startTime.value = it }, label = { Text("Start Time (ms)") })
        OutlinedTextField(value = endTime.value, onValueChange = { endTime.value = it }, label = { Text("End Time (ms)") })
        Button(onClick = {
            onEvent(
                EventEvent.SubmitEdit(
                    id = selected.event.id,
                    title = title.value,
                    description = description.value,
                    startTime = startTime.value.toLongOrNull(),
                    endTime = endTime.value.toLongOrNull(),
                    location = location.value.ifBlank { null },
                ),
            )
        }) { Text("Save") }
        Button(onClick = {
            onEvent(EventEvent.SubmitDelete(selected.event.id))
            onBack()
        }) { Text("Delete") }
    }
}
