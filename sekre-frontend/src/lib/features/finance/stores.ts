import { writable } from 'svelte/store';
import type { Transaction, FinanceSummary } from './types';

function createTransactionsStore() {
	const { subscribe, set, update } = writable<Transaction[]>([]);

	return {
		subscribe,
		set,
		add(transaction: Transaction) {
			update(transactions => [transaction, ...transactions]);
		},
		remove(id: string) {
			update(transactions => transactions.filter(t => t.id !== id));
		},
		updateOne(id: string, data: Partial<Transaction>) {
			update(transactions =>
				transactions.map(t => (t.id === id ? { ...t, ...data } : t))
			);
		}
	};
}

function createFinanceSummaryStore() {
	const { subscribe, set } = writable<FinanceSummary>({
		total_income: 0,
		total_expense: 0,
		balance: 0
	});

	return {
		subscribe,
		set
	};
}

export const transactionsStore = createTransactionsStore();
export const financeSummaryStore = createFinanceSummaryStore();
