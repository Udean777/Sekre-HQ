export * from "./task.types";

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
}

export interface AuthResponse {
  user: User;
  organization: Organization;
  role: string;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}
