export interface Role {
  name: string;
  description: string;
  permissions: any[];
}

export interface User {
  id: string | null;
  username: string;
  email: string | null;
  roles: Role[];
}

export interface CreateUserRequest extends Omit<User, 'id'> {
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