import api from "./api";

import type { Product } from "../types/product.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const productService = {
  async getAllProducts() {
    const { data } = await api.get<ApiResponse<Product[]>>("/products");

    return data.data;
  },
};

export default productService;
