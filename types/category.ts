export interface Category {
  id: string;
  name: string;
  icon?: string;
  description: string;
  image_url: string;
}

export interface CategoryPage {
  content: Category[];  // Danh sách các thể loại trong trang hiện tại
  pageable: {
    pageNumber: number;  // Số trang hiện tại
    pageSize: number;    // Kích thước trang
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;      // Dịch chuyển trang
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;        // Liệu đây có phải là trang cuối không
  totalElements: number; // Tổng số thể loại
  totalPages: number;   // Tổng số trang
  size: number;         // Số lượng mục trên mỗi trang
  number: number;       // Số trang hiện tại
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;       // Liệu đây có phải là trang đầu không
  numberOfElements: number; // Số mục hiện tại trong trang
  empty: boolean;       // Liệu trang có trống không
}