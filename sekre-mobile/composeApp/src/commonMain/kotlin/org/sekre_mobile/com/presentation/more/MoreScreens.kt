package org.sekre_mobile.com.presentation.more

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun MoreScreen(
    onOpenProfile: () -> Unit,
    onOpenChangePassword: () -> Unit,
    onOpenDivisions: () -> Unit,
    onOpenMembers: () -> Unit,
    onOpenAddMember: () -> Unit,
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("More")
        Text("Organization")
        Button(onClick = onOpenDivisions) { Text("Divisions") }
        Button(onClick = onOpenMembers) { Text("Members") }
        Button(onClick = onOpenAddMember) { Text("Add Member") }
        Text("Account")
        Button(onClick = onOpenProfile) { Text("Profile") }
        Button(onClick = onOpenChangePassword) { Text("Change Password") }
        Text("Avatar upload: UI ready, backend pending")
    }
}

@Composable
fun ProfileScreen(state: MoreState, onEvent: (MoreEvent) -> Unit) {
    val fullName = remember { mutableStateOf(state.profile?.fullName ?: "") }
    val email = remember { mutableStateOf(state.profile?.email ?: "") }
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Profile")
        OutlinedTextField(value = fullName.value, onValueChange = { fullName.value = it }, label = { Text("Full Name") })
        OutlinedTextField(value = email.value, onValueChange = { email.value = it }, label = { Text("Email") })
        Button(onClick = { onEvent(MoreEvent.SubmitProfile(fullName.value, email.value)) }) { Text("Save") }
    }
}

@Composable
fun ChangePasswordScreen(onEvent: (MoreEvent) -> Unit) {
    val currentPassword = remember { mutableStateOf("") }
    val newPassword = remember { mutableStateOf("") }
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Change Password")
        OutlinedTextField(value = currentPassword.value, onValueChange = { currentPassword.value = it }, label = { Text("Current Password") })
        OutlinedTextField(value = newPassword.value, onValueChange = { newPassword.value = it }, label = { Text("New Password") })
        Button(onClick = { onEvent(MoreEvent.SubmitPassword(currentPassword.value, newPassword.value)) }) { Text("Update Password") }
    }
}
