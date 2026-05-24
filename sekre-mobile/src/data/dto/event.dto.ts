// Backend response shapes (snake_case)

export interface EventDTO {
  id: string;
  organization_id: string;
  division_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventListResponseDTO {
  success: boolean;
  message: string;
  data: {
    data: EventDTO[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  };
}

export interface EventResponseDTO {
  success: boolean;
  message: string;
  data: EventDTO;
}

// Request shapes
export interface CreateEventRequestDTO {
  division_id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;  // RFC3339
  end_time: string;    // RFC3339, required by backend
}

export interface UpdateEventRequestDTO {
  division_id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;  // RFC3339
  end_time: string;    // RFC3339
}
