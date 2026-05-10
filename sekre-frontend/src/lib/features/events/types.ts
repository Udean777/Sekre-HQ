export interface Event {
	id: string;
	organization_id: string;
	division_id: string;
	title: string;
	description: string;
	start_time: string;
	end_time: string;
	location: string;
	created_at: string;
	updated_at: string;
}

export interface CreateEventRequest {
	division_id: string;
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	location?: string;
}

export interface UpdateEventRequest {
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	location?: string;
}
