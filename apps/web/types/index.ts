export interface User {
  id: string;
  key?: React.Key;
  fullName: string;
  email: string;
  role?: {
    id?: string;
    name?: string;
    permissions?: string[];
  };
  createdAt?: Date | string;
}

export interface Role {
  id: string;
  key?: React.Key;
  name: string;
  permissions?: string[];
}

export interface CheckboxOption {
  label: string;
  value: string;
}
