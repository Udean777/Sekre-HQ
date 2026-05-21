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
