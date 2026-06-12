export interface OrganizationEntity {
  id: string;
  name: string;
  code?: string;
  createdAt?: string;
}

export interface UserEntity {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  organizationId?: string;
  organization?: OrganizationEntity;
  createdAt?: string;
}
