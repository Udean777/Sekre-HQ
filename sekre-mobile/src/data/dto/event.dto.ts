// Backend response shapes (snake_case)

export interface EventDTO {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventListResponseDTO {
  events: EventDTO[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Request shapes
export interface CreateEventRequestDTO {
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
}

export interface UpdateEventRequestDTO {
  title?: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}
