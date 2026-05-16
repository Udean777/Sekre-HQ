package org.sekre_mobile.com.presentation.event.components

import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import org.sekre_mobile.com.presentation.foundation.combineDateAndTime
import org.sekre_mobile.com.presentation.foundation.extractHourMinute

/**
 * Sequenced date + time picker. Opens a DatePickerDialog first, then a
 * TimePicker dialog, finally invokes [onConfirm] with the combined Unix epoch
 * millis (system time zone).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DateTimePickerDialog(
    initialEpochMillis: Long?,
    onDismiss: () -> Unit,
    onConfirm: (Long) -> Unit,
) {
    var step by remember { mutableStateOf(Step.Date) }
    var pickedDateMillis by remember { mutableStateOf(initialEpochMillis) }

    val (initHour, initMinute) = remember(initialEpochMillis) {
        if (initialEpochMillis != null) extractHourMinute(initialEpochMillis) else 9 to 0
    }

    when (step) {
        Step.Date -> {
            val datePickerState = rememberDatePickerState(
                initialSelectedDateMillis = pickedDateMillis,
            )
            DatePickerDialog(
                onDismissRequest = onDismiss,
                confirmButton = {
                    TextButton(
                        enabled = datePickerState.selectedDateMillis != null,
                        onClick = {
                            pickedDateMillis = datePickerState.selectedDateMillis
                            step = Step.Time
                        },
                    ) { Text("Lanjut") }
                },
                dismissButton = {
                    TextButton(onClick = onDismiss) { Text("Batal") }
                },
            ) {
                DatePicker(state = datePickerState)
            }
        }

        Step.Time -> {
            val timePickerState = rememberTimePickerState(
                initialHour = initHour,
                initialMinute = initMinute,
                is24Hour = true,
            )
            Dialog(onDismissRequest = onDismiss) {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.surface,
                    tonalElevation = 6.dp,
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(
                            text = "Pilih Jam",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                        )

                        TimePicker(state = timePickerState)

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End,
                        ) {
                            TextButton(onClick = { step = Step.Date }) { Text("Kembali") }
                            TextButton(onClick = onDismiss) { Text("Batal") }
                            TextButton(onClick = {
                                val date = pickedDateMillis ?: return@TextButton
                                val combined = combineDateAndTime(
                                    dateUtcMillis = date,
                                    hour = timePickerState.hour,
                                    minute = timePickerState.minute,
                                )
                                onConfirm(combined)
                            }) { Text("Simpan") }
                        }
                    }
                }
            }
        }
    }
}

private enum class Step { Date, Time }
