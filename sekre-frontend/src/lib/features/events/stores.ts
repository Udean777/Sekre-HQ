import { writable } from 'svelte/store';
import type { Event } from './types';

function createEventsStore() {
	const { subscribe, set, update } = writable<Event[]>([]);

	return {
		subscribe,
		set,
		add(event: Event) {
			update(events => [event, ...events]);
		},
		remove(id: string) {
			update(events => events.filter(e => e.id !== id));
		},
		updateOne(id: string, data: Partial<Event>) {
			update(events =>
				events.map(e => (e.id === id ? { ...e, ...data } : e))
			);
		}
	};
}

export const eventsStore = createEventsStore();
