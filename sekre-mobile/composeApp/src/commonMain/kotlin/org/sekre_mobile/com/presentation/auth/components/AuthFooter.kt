package org.sekre_mobile.com.presentation.auth.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun AuthFooter(
    actionButtonText: String,
    onActionClick: () -> Unit,
    switchModeText: String,
    switchModeActionText: String,
    onSwitchModeClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true,
) {
    val colors = SekreTheme.colors

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(
            onClick = onActionClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            enabled = enabled && !isLoading,
            shape = SekreTheme.shapes.medium,
            colors = ButtonDefaults.buttonColors(
                containerColor = colors.accentPrimary,
                contentColor   = colors.backdropDeep,
                disabledContainerColor = colors.accentPrimary.copy(alpha = 0.38f),
                disabledContentColor   = colors.backdropDeep.copy(alpha = 0.38f),
            )
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = colors.backdropDeep,
                    strokeWidth = 2.5.dp
                )
            } else {
                Text(
                    text = actionButtonText,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        TextButton(onClick = onSwitchModeClick) {
            Text(
                text = "$switchModeText ",
                style = MaterialTheme.typography.bodyMedium,
                color = colors.onGlassSecondary,
            )

            Text(
                text = switchModeActionText,
                style = MaterialTheme.typography.bodyMedium,
                color = colors.accentPrimary,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
