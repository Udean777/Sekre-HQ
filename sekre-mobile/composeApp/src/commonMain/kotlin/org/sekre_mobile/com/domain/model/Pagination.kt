package org.sekre_mobile.com.domain.model

/** Pagination parameters */
data class PaginationParams(val page: Int, val pageSize: Int)

/** Paginated result */
data class PaginatedResult<T>(
    val items: List<T>,
    val total: Int,
    val page: Int,
    val pageSize: Int
) {
    val totalPages: Int
        get() = if (pageSize > 0) (total + pageSize - 1) / pageSize else 0

    val hasNextPage: Boolean
        get() = page < totalPages

    val hasPreviousPage: Boolean
        get() = page > 1
}
