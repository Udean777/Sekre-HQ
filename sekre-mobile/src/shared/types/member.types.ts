export interface BulkImportError {
  row: number;
  email: string;
  message: string;
}

export interface CreatedMemberInfo {
  email: string;
  full_name: string;
  temporary_password: string;
  division?: string;
}

export interface BulkImportResult {
  total_rows: number;
  success_count: number;
  failure_count: number;
  errors?: BulkImportError[];
  created_members: CreatedMemberInfo[];
}

export interface ImportPreviewRow {
  row: number;
  email: string;
  full_name: string;
  role: string;
  division: string;
  division_role: string;
  division_valid: boolean;
}

export interface ImportPreviewResult {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  rows: ImportPreviewRow[];
}
