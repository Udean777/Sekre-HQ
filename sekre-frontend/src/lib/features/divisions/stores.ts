import { writable } from 'svelte/store';
import type { Division, DivisionWithMembers } from './types';

function createDivisionsStore() {
	const { subscribe, set, update } = writable<Division[]>([]);

	return {
		subscribe,
		set,
		add(division: Division) {
			update(divisions => [division, ...divisions]);
		},
		remove(id: string) {
			update(divisions => divisions.filter(d => d.id !== id));
		},
		updateOne(id: string, data: Partial<Division>) {
			update(divisions =>
				divisions.map(d => (d.id === id ? { ...d, ...data } : d))
			);
		}
	};
}

function createCurrentDivisionStore() {
	const { subscribe, set } = writable<DivisionWithMembers | null>(null);

	return {
		subscribe,
		set,
		clear() {
			set(null);
		}
	};
}

export const divisionsStore = createDivisionsStore();
export const currentDivision = createCurrentDivisionStore();
