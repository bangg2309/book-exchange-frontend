export interface Author {
  id: string;
  name: string;
}
export interface AuthorPage {
  content: Author[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuthorType{
    id: string;
    name: string;

}