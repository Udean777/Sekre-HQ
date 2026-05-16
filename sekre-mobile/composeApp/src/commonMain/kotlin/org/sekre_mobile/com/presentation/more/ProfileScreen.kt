package org.sekre_mobile.com.presentation.more

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.more.components.ProfileHeaderCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    state: MoreState,
    onBack: () -> Unit,
    onEvent: (MoreEvent) -> Unit,
) {
    var fullName by remember(state.profile?.fullName) {
        mutableStateOf(state.profile?.fullName.orEmpty())
    }
    var email by remember(state.profile?.email) {
        mutableStateOf(state.profile?.email.orEmpty())
    }

    LaunchedEffect(Unit) {
        if (state.profile == null) onEvent(MoreEvent.LoadProfile)
    }

    val nameChanged = fullName.trim() != state.profile?.fullName.orEmpty()
    val emailChanged = email.trim() != state.profile?.email.orEmpty()
    val emailValid = email.isBlank() || (email.contains("@") && email.contains("."))
    val canSubmit = !state.isSubmittingProfile
        && (nameChanged || emailChanged)
        && fullName.trim().isNotBlank()
        && emailValid

    SafeArea(applyImePadding = true) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Profil Saya", fontWeight = FontWeight.SemiBold) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Kembali",
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background,
                    ),
                )
            },
            containerColor = MaterialTheme.colorScheme.background,
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    ProfileHeaderCard(
                        user = state.authenticatedUser,
                        profile = state.profile,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = fullName,
                        onValueChange = { fullName = it },
                        label = { Text("Nama Lengkap *") },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email *") },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        isError = !emailValid,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        supportingText = {
                            if (!emailValid) {
                                Text(
                                    "Format email tidak valid",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.error,
                                )
                            }
                        },
                    )
                }

                Button(
                    onClick = {
                        onEvent(
                            MoreEvent.SubmitProfile(
                                fullName = fullName.trim(),
                                email = email.trim(),
                            ),
                        )
                    },
                    enabled = canSubmit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Text(
                        text = if (state.isSubmittingProfile) "Menyimpan..." else "Simpan Perubahan",
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}
