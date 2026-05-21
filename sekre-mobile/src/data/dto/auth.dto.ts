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
  access_token: string;
  refresh_token: string;
  user: UserDTO;
  organization: OrganizationDTO;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface GetMeResponseDTO {
  user: UserDTO;
  organization: OrganizationDTO;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface RefreshResponseDTO {
  access_token: string;
  refresh_token: string;
}

// Request shapes
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  org_name: string;
  subdomain: string;
  full_name: string;
  email: string;
  password: string;
}
