import client from "../client";
import type { Product, ProductImage, PaginationMeta } from "../../types";

interface ProductsResponse {
  products: Product[];
  meta: PaginationMeta;
}

interface ProductImagesResponse {
  images: ProductImage[];
}

export interface ProductInput {
  name: string;
  category_id: string;
  price: number;           // send 0 when no price / seasonal
  unit: string;
  active?: boolean;
  old_price?: number;
  display_tag?: string;    // e.g. "Seasonal", "In Stock", "Premium"
  description?: string;
  instructions?: string;   // shown as amber notice on storefront
  requires_inquiry?: boolean; // true = hide price, show Enquire button
  orderable?: boolean;        // false = disable Add to Cart
}

export const fetchProducts = async (
  page: number,
  category?: string,
  limit = 10,
): Promise<ProductsResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (category) params.category = category;
  const response = await client.get("/admin/products", { params });
  return response.data.data;
};

export const createProduct = async (
  payload: ProductInput,
): Promise<Product> => {
  const response = await client.post("/admin/products", payload);
  return response.data.data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await client.get(`/admin/products/${id}`);
  return response.data.data;
};

export const updateProduct = async (
  id: string,
  payload: Partial<ProductInput>,
): Promise<Product> => {
  const response = await client.patch(`/admin/products/${id}`, payload);
  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await client.delete(`/admin/products/${id}`);
};

export const fetchProductImages = async (
  id: string,
): Promise<ProductImagesResponse> => {
  const response = await client.get(`/admin/products/${id}/images`);
  return response.data.data;
};

export const uploadProductImages = async (
  id: string,
  files: File[],
): Promise<ProductImagesResponse> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  const response = await client.post(`/admin/products/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const deleteProductImage = async (
  productId: string,
  imageId: string,
): Promise<void> => {
  await client.delete(`/admin/products/${productId}/images/${imageId}`);
};
