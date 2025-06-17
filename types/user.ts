export interface Role {
  name: string;
  description: string;
  permissions: any[];
}

export interface User {
  id: string | null;
  username: string;
  fullName?: string;
  email: string | null;
  avatar: string | null;
  phone: string | null;
  status: number;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface CreateUserRequest extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

export interface UserPage {
  content: User[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
} 