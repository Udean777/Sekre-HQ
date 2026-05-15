package org.sekre_mobile.com.domain.model

/** Pagination parameters aligned with backend contract (limit/offset). */
data class PaginationParams(
    val limit: Int = 50,
    val offset: Int = 0,
) {
    val page: Int
        get() = (offset / limit) + 1

    val pageSize: Int
        get() = limit
}

/** Paginated result */
data class PaginatedResult<T>(
    val items: List<T>,
    val total: Int,
    val limit: Int,
    val offset: Int,
) {
    val page: Int
        get() = (offset / limit) + 1

    val pageSize: Int
        get() = limit

    val totalPages: Int
        get() = if (limit > 0) (total + limit - 1) / limit else 0

    val hasNextPage: Boolean
        get() = (offset + limit) < total

    val hasPreviousPage: Boolean
        get() = offset > 0
}
