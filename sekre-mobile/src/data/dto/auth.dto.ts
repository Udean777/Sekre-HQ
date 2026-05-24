// Backend response shapes (snake_case)

export interface UserDTO {
  id: string;
  email: string;
  full_name: string;
  must_reset_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  subdomain: string;
  subscription_plan: 'FREE' | 'LITE' | 'PRO';
  created_at: string;
  updated_at: string;
}

export interface AuthSessionDTO {
  success: boolean;
  message: string;
  data: {
    user: UserDTO;
    organization: OrganizationDTO;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export interface GetMeResponseDTO {
  success: boolean;
  message: string;
  data: {
    user: UserDTO;
    organization: OrganizationDTO;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
  };
}

export interface RefreshResponseDTO {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

// Request shapes
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  organization_name: string;
  subdomain: string;
  full_name: string;
  email: string;
  password: string;
}

// Settings request DTOs
export interface UpdateProfileRequestDTO {
  full_name: string;
  email: string;
}

export interface ChangePasswordRequestDTO {
  current_password: string;
  new_password: string;
}

export interface UpdateOrganizationRequestDTO {
  name: string;
}
