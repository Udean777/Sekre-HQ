package org.sekre_mobile.com.presentation.task

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
import org.sekre_mobile.com.domain.entity.TaskStatus

@Composable
fun TaskListScreen(state: TaskState, onEvent: (TaskEvent) -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Tasks")
        Button(onClick = { onEvent(TaskEvent.LoadFirstPage) }) { Text("Refresh") }
        Button(onClick = { onEvent(TaskEvent.OpenCreateForm) }) { Text("Create") }

        if (state.isLoading) CircularProgressIndicator()
        if (state.tasks.isEmpty() && !state.isLoading) Text("No tasks")

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(state.tasks, key = { it.task.id }) { item ->
                Column(
                    modifier = Modifier.fillMaxWidth()
                        .clickable { onEvent(TaskEvent.OpenDetail(item.task.id)) }.padding(8.dp),
                ) {
                    Text(item.task.title)
                    Text("Status: ${item.task.status}")
                }
            }
        }

        if (state.isLoadingMore) CircularProgressIndicator()
        if (state.hasMore && !state.isLoadingMore) {
            Button(onClick = { onEvent(TaskEvent.LoadNextPage) }) { Text("Load more") }
        }
    }
}

@Composable
fun TaskCreateScreen(onEvent: (TaskEvent) -> Unit) {
    val divisionId = remember { mutableStateOf("") }
    val title = remember { mutableStateOf("") }
    val description = remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Create Task")
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = divisionId.value,
            onValueChange = { divisionId.value = it },
            label = { Text("Division ID") })
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = title.value,
            onValueChange = { title.value = it },
            label = { Text("Title") })
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = description.value,
            onValueChange = { description.value = it },
            label = { Text("Description") })
        Button(onClick = {
            onEvent(
                TaskEvent.SubmitCreate(
                    divisionId.value,
                    title.value,
                    description.value
                )
            )
        }) { Text("Submit") }
    }
}

@Composable
fun TaskDetailScreen(state: TaskState, onEvent: (TaskEvent) -> Unit) {
    val selected = state.selectedTask
    if (selected == null) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text("No task selected")
        }
        return
    }

    val editTitle = remember(selected.task.id) { mutableStateOf(selected.task.title) }
    val editDescription = remember(selected.task.id) { mutableStateOf(selected.task.description) }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Task Detail")
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = editTitle.value,
            onValueChange = { editTitle.value = it },
            label = { Text("Title") })
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = editDescription.value,
            onValueChange = { editDescription.value = it },
            label = { Text("Description") })
        Button(onClick = {
            onEvent(
                TaskEvent.SubmitEdit(
                    selected.task.id,
                    editTitle.value,
                    editDescription.value
                )
            )
        }) { Text("Save") }
        Button(onClick = {
            onEvent(
                TaskEvent.SubmitStatus(
                    selected.task.id,
                    TaskStatus.DONE
                )
            )
        }) { Text("Mark DONE") }
    }
}
