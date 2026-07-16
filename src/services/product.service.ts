import api from "./api";

import type {
  PaginatedProducts,
  Product,
  ProductPayload,
  ProductListQuery,
  ProductStatus,
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

  async getSellerProducts(status?: ProductStatus) {
    const { data } = await api.get<ApiResponse<Product[]>>("/products/my-products", {
      params: status ? { status } : undefined,
    });

    return data.data;
  },

  async createProduct(payload: ProductPayload) {
    const { data } = await api.post<ApiResponse<Product>>("/products", payload);
    return data.data;
  },

  async updateProduct(productId: string, payload: ProductPayload) {
    const { data } = await api.patch<ApiResponse<Product>>(
      `/products/${productId}`,
      payload
    );

    return data.data;
  },

  async deleteProduct(productId: string) {
    await api.delete(`/products/${productId}`);
  },
};

export default productService;
