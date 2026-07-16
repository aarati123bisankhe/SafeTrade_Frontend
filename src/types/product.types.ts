export const ProductCategory = {
  ALL: "ALL",
  BOOKS: "BOOKS",
  ELECTRONICS: "ELECTRONICS",
  CLOTHING: "CLOTHING",
  FURNITURE: "FURNITURE",
  HANDMADE: "HANDMADE",
  OTHER: "OTHER",
} as const;

export type ProductCategory =
  (typeof ProductCategory)[keyof typeof ProductCategory];

export const ProductCondition = {
  ALL: "ALL",
  NEW: "NEW",
  LIKE_NEW: "LIKE_NEW",
  GOOD: "GOOD",
  FAIR: "FAIR",
} as const;

export type ProductCondition =
  (typeof ProductCondition)[keyof typeof ProductCondition];

export const ProductStatus = {
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED",
  SOLD: "SOLD",
  REMOVED: "REMOVED",
} as const;

export type ProductStatus =
  (typeof ProductStatus)[keyof typeof ProductStatus];

export type ProductSeller = {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  rating?: number | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  price: number;
  category: Exclude<ProductCategory, "ALL">;
  condition: Exclude<ProductCondition, "ALL">;
  status: ProductStatus;
  location: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  seller?: ProductSeller;
};

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  category: Exclude<ProductCategory, "ALL">;
  condition: Exclude<ProductCondition, "ALL">;
  location: string;
  imageUrl?: string | null;
};

export type ProductPayload = {
  name: string;
  description: string;
  price: number;
  category: Exclude<ProductCategory, "ALL">;
  condition: Exclude<ProductCondition, "ALL">;
  location: string;
  imageFile?: File | null;
};

export type ProductSortBy =
  | "NEWEST"
  | "PRICE_LOW_HIGH"
  | "PRICE_HIGH_LOW";

export type ProductListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: Exclude<ProductCategory, "ALL">;
  condition?: Exclude<ProductCondition, "ALL">;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
};

export type PaginatedProducts = {
  items: Product[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};
