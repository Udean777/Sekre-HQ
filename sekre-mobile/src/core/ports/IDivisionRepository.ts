import type {
  Division,
  DivisionId,
  DivisionDetail,
  DivisionFilter,
  DivisionPage,
  DivisionRole,
} from '@core/domain/entities/Division';

export interface CreateDivisionParams {
  name: string;
  description?: string;
}

export interface UpdateDivisionParams {
  name: string;
  description?: string;
}

export interface AddDivisionMemberParams {
  userId: string;
  role: DivisionRole;
}

export interface UpdateDivisionMemberParams {
  role: DivisionRole;
}

export interface IDivisionRepository {
  getDivisions(filter?: DivisionFilter): Promise<DivisionPage>;
  getDivisionById(id: DivisionId): Promise<DivisionDetail>;
  createDivision(params: CreateDivisionParams): Promise<Division>;
  updateDivision(id: DivisionId, params: UpdateDivisionParams): Promise<Division>;
  deleteDivision(id: DivisionId): Promise<void>;
  addMember(id: DivisionId, params: AddDivisionMemberParams): Promise<void>;
  updateMember(id: DivisionId, userId: string, params: UpdateDivisionMemberParams): Promise<void>;
  removeMember(id: DivisionId, userId: string): Promise<void>;
}
