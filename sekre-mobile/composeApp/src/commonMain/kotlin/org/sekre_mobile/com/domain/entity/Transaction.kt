package org.sekre_mobile.com.domain.entity

/** Transaction Domain Entity Pure business object - no framework dependencies */
enum class TransactionType {
    INCOME,
    EXPENSE
}

enum class TransactionStatus {
    PENDING,
    APPROVED,
    REJECTED
}

data class Transaction(
    val id: String,
    val divisionId: String,
    val eventId: String?,
    val type: TransactionType,
    val amountCents: Long,
    val currency: String,
    val description: String,
    val status: TransactionStatus,
    val requestedBy: String,
    val approvedBy: String?,
    val receiptUrl: String?,
    val createdAt: Long,
    val updatedAt: Long?
) {
    /** Check if transaction is pending approval */
    fun isPending(): Boolean = status == TransactionStatus.PENDING

    /** Check if transaction is approved */
    fun isApproved(): Boolean = status == TransactionStatus.APPROVED

    /** Check if transaction is rejected */
    fun isRejected(): Boolean = status == TransactionStatus.REJECTED

    /** Check if transaction is income */
    fun isIncome(): Boolean = type == TransactionType.INCOME

    /** Check if transaction is expense */
    fun isExpense(): Boolean = type == TransactionType.EXPENSE

    /** Get signed amount (positive for income, negative for expense) */
    fun getSignedAmountCents(): Long = if (isIncome()) amountCents else -amountCents

    /** Check if transaction can be approved */
    fun canBeApproved(): Boolean = isPending()

    /** Check if transaction can be rejected */
    fun canBeRejected(): Boolean = isPending()

    /** Check if transaction can be edited */
    fun canBeEdited(): Boolean = isPending()

    /** Check if transaction can be deleted */
    fun canBeDeleted(): Boolean = isPending()
}

data class TransactionRequester(val id: String, val email: String, val fullName: String)

data class TransactionApprover(val id: String, val email: String, val fullName: String)

data class TransactionWithDetails(
    val transaction: Transaction,
    val requester: TransactionRequester?,
    val approver: TransactionApprover?
)

/** Finance Summary Value Object */
data class FinanceSummary(
    val totalIncomeCents: Long,
    val totalExpenseCents: Long,
    val balanceCents: Long,
    val currency: String,
    val transactionCount: Int
) {
    /** Check if balance is positive */
    fun hasPositiveBalance(): Boolean = balanceCents > 0

    /** Check if balance is negative */
    fun hasNegativeBalance(): Boolean = balanceCents < 0

    /** Get balance percentage (income vs expense) */
    fun getBalancePercentage(): Double {
        if (totalIncomeCents == 0L) return 0.0
        return (balanceCents.toDouble() / totalIncomeCents.toDouble()) * 100
    }
}
