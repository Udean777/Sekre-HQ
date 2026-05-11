// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { User, Organization } from '$lib/api/types';

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}

		interface Locals {
			user?: User;
			organization?: Organization;
			token?: string;
		}

		interface PageData {
			user?: User;
			organization?: Organization;
		}

		// interface PageState {}
		// interface Platform {}
	}
}

export {};
