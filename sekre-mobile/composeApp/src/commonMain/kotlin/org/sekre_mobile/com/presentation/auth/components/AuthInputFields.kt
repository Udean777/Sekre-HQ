package org.sekre_mobile.com.presentation.auth.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import org.sekre_mobile.com.presentation.ui.glass.glassTextFieldColors
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

/**
 * Reusable text field untuk form auth.
 *
 * Field ini punya:
 * - inline `errorMessage` (ditampilkan via `supportingText`)
 * - hard cap karakter via `maxLength` (clamp pada level UI)
 * - `transformInput` untuk normalisasi (mis. lowercase + strip char
 *   non-allowed pada subdomain) sebelum diteruskan ke ViewModel
 *
 * Colors di-override ke glass theme tokens agar field terbaca di atas
 * backdrop gelap tanpa background putih yang merusak efek glassmorphism.
 */
@Composable
fun AuthTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    keyboardOptions: KeyboardOptions = KeyboardOptions(
        keyboardType = KeyboardType.Text,
        imeAction = ImeAction.Next,
    ),
    singleLine: Boolean = true,
    enabled: Boolean = true,
    errorMessage: String? = null,
    maxLength: Int? = null,
    transformInput: (String) -> String = { it },
) {
    val colors = SekreTheme.colors
    val isError = errorMessage != null

    OutlinedTextField(
        value = value,
        onValueChange = { raw ->
            val transformed = transformInput(raw)
            val capped = if (maxLength != null && transformed.length > maxLength) {
                transformed.take(maxLength)
            } else {
                transformed
            }
            onValueChange(capped)
        },
        label = { Text(label) },
        modifier = modifier.fillMaxWidth(),
        singleLine = singleLine,
        keyboardOptions = keyboardOptions,
        enabled = enabled,
        isError = isError,
        supportingText = if (isError) {
            { Text(errorMessage!!) }
        } else {
            null
        },
        shape = SekreTheme.shapes.medium,
        colors = glassTextFieldColors(),
    )
}

@Composable
fun AuthPasswordTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    errorMessage: String? = null,
    imeAction: ImeAction = ImeAction.Done,
    maxLength: Int? = 128,
) {
    val colors = SekreTheme.colors
    var passwordVisible by remember { mutableStateOf(false) }
    val isError = errorMessage != null

    OutlinedTextField(
        value = value,
        onValueChange = { raw ->
            val capped = if (maxLength != null && raw.length > maxLength) {
                raw.take(maxLength)
            } else {
                raw
            }
            onValueChange(capped)
        },
        label = { Text(label) },
        modifier = modifier.fillMaxWidth(),
        singleLine = true,
        enabled = enabled,
        isError = isError,
        supportingText = if (isError) {
            { Text(errorMessage!!) }
        } else {
            null
        },
        visualTransformation = if (passwordVisible) {
            VisualTransformation.None
        } else {
            PasswordVisualTransformation()
        },
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Password,
            imeAction = imeAction,
        ),
        shape = SekreTheme.shapes.medium,
        colors = glassTextFieldColors(),
        trailingIcon = {
            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                Icon(
                    imageVector = if (passwordVisible) {
                        Icons.Default.Visibility
                    } else {
                        Icons.Default.VisibilityOff
                    },
                    contentDescription = if (passwordVisible) {
                        "Sembunyikan password"
                    } else {
                        "Tampilkan password"
                    },
                    tint = colors.onGlassSecondary,
                )
            }
        }
    )
}



/**
 * Filter input untuk subdomain: paksa lowercase dan buang karakter
 * yang tidak masuk `[a-z0-9-]`. Dipakai sebagai `transformInput` di
 * `AuthTextField` agar nilai yang sampai ke ViewModel sudah bersih
 * dari karakter ilegal—mengurangi inline error palsu hanya karena
 * user tidak sengaja menekan shift.
 */
fun sanitizeSubdomainInput(raw: String): String =
    raw.lowercase().filter { it.isLetterOrDigit() && it.code < 128 || it == '-' }
