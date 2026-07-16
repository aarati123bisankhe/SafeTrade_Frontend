import api from "./api";

import type {
  PaginatedProducts,
  Product,
  ProductListQuery,
} from "../types/product.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const productService = { 
  async getAllProducts(query: ProductListQuery = {}) {
    const { data } = await api.get<ApiResponse<PaginatedProducts>>("/products", {
      params: query,
    });

    return data.data;
  },

  async getProductById(productId: string) {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${productId}`);

    return data.data;
  },
};

export default productService;
