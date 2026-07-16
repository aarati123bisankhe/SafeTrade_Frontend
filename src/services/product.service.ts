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
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    formData.append("category", payload.category);
    formData.append("condition", payload.condition);
    formData.append("location", payload.location);

    if (payload.imageFile) {
      formData.append("image", payload.imageFile);
    }

    const { data } = await api.post<ApiResponse<Product>>("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.data;
  },

  async updateProduct(productId: string, payload: ProductPayload) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    formData.append("category", payload.category);
    formData.append("condition", payload.condition);
    formData.append("location", payload.location);

    if (payload.imageFile) {
      formData.append("image", payload.imageFile);
    }

    const { data } = await api.patch<ApiResponse<Product>>(
      `/products/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data.data;
  },

  async deleteProduct(productId: string) {
    await api.delete(`/products/${productId}`);
  },
};

export default productService;
