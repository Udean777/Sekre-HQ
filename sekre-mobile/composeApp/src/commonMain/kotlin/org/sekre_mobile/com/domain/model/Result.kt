package org.sekre_mobile.com.domain.model

/** Result type for operations that can fail Sealed class for type-safe error handling */
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()

    /** Check if result is success */
    fun isSuccess(): Boolean = this is Success

    /** Check if result is error */
    fun isError(): Boolean = this is Error

    /** Get data or null */
    fun getOrNull(): T? =
        when (this) {
            is Success -> data
            is Error -> null
        }

    /** Get data or throw exception */
    fun getOrThrow(): T =
        when (this) {
            is Success -> data
            is Error -> throw exception
        }

    /** Map success value */
    fun <R> map(transform: (T) -> R): Result<R> =
        when (this) {
            is Success -> Success(transform(data))
            is Error -> this
        }

    /** Flat map success value */
    fun <R> flatMap(transform: (T) -> Result<R>): Result<R> =
        when (this) {
            is Success -> transform(data)
            is Error -> this
        }

    /** Handle result with callbacks */
    inline fun onSuccess(action: (T) -> Unit): Result<T> {
        if (this is Success) action(data)
        return this
    }

    inline fun onError(action: (Exception) -> Unit): Result<T> {
        if (this is Error) action(exception)
        return this
    }
}

/** Extension function to create success result */
fun <T> T.asSuccess(): Result<T> = Result.Success(this)

/** Extension function to create error result */
fun Exception.asError(): Result<Nothing> = Result.Error(this)
