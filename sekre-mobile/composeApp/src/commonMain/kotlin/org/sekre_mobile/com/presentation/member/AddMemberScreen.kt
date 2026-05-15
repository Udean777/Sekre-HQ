package org.sekre_mobile.com.presentation.member

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AddMemberScreen(state: AddMemberState, onEvent: (AddMemberEvent) -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Add Member")
        OutlinedTextField(value = state.fullName, onValueChange = { onEvent(AddMemberEvent.SetFullName(it)) }, label = { Text("Full Name") })
        OutlinedTextField(value = state.email, onValueChange = { onEvent(AddMemberEvent.SetEmail(it)) }, label = { Text("Email") })
        OutlinedTextField(value = state.role, onValueChange = { onEvent(AddMemberEvent.SetRole(it)) }, label = { Text("Role") })
        if (state.errorMessage != null) Text("Error: ${state.errorMessage}")
        Text("Divisions")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.weight(1f, fill = false)) {
            items(state.availableDivisions, key = { it.id }) { division ->
                androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Checkbox(
                        checked = state.selectedDivisionIds.contains(division.id),
                        onCheckedChange = { onEvent(AddMemberEvent.ToggleDivision(division.id)) },
                    )
                    Text(division.name)
                }
            }
        }
        Button(onClick = { onEvent(AddMemberEvent.Submit) }, enabled = !state.isLoading) { Text("Create Member") }
    }
}
