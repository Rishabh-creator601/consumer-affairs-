export type UserRole = 'field_inspector' | 'senior_inspector' | 'controller' | 'legal_officer' | 'auditor';

export interface User {
  _id: string;
  email: string;
  displayName: string;
  role: UserRole;
  jurisdiction: string;
  isActive: boolean;
  lastLogin: string;
}
