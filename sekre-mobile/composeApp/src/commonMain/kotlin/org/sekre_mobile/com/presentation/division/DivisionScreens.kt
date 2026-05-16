package org.sekre_mobile.com.presentation.division

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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun DivisionListScreen(state: DivisionState, onOpenDetail: (String) -> Unit, onEvent: (DivisionEvent) -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Divisions")
        Button(onClick = { onEvent(DivisionEvent.LoadDivisions) }) { Text("Refresh") }
        if (state.isLoading) CircularProgressIndicator()
        if (state.errorMessage != null && !state.isLoading) Text("Failed to load divisions: ${state.errorMessage}")
        if (state.divisions.isEmpty() && !state.isLoading) Text("No divisions found yet")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(state.divisions, key = { it.id }) { item ->
                Column(modifier = Modifier.fillMaxWidth().clickable { onOpenDetail(item.id) }.padding(8.dp)) {
                    Text(item.name)
                }
            }
        }
    }
}

@Composable
fun DivisionDetailScreen(state: DivisionState) {
    val division = state.selectedDivision
    if (division == null) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) { Text("Division detail is not available") }
        return
    }
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Division Detail")
        Text("Name: ${division.name}")
        Text("Organization: ${division.organizationId}")
    }
}

@Composable
fun MemberListScreen(state: DivisionState, onOpenAddMember: () -> Unit, onEvent: (DivisionEvent) -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Members")
        Button(onClick = { onEvent(DivisionEvent.LoadMembers) }) { Text("Refresh") }
        Button(onClick = onOpenAddMember) { Text("Add Member") }
        if (state.isLoading) CircularProgressIndicator()
        if (state.errorMessage != null && !state.isLoading) Text("Failed to load members: ${state.errorMessage}")
        if (state.members.isEmpty() && !state.isLoading) Text("No members yet. Add your first member.")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(state.members, key = { it.id }) { item ->
                Column(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
                    Text(item.fullName)
                    Text(item.email)
                }
            }
        }
    }
}
