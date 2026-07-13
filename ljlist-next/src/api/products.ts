import { request } from './client'
import type { ApiProduct, CategoryListResponse, ProductListResponse } from './types'

export const products = {
  list({ category, page = 1, limit = 100 }: { category?: string; page?: number; limit?: number } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (category) q.set('category', category)
    return request<ProductListResponse>(`/api/v1/products?${q}`)
  },
  get(id: string) {
    return request<ApiProduct>(`/api/v1/products/${id}`)
  },
  categories() {
    return request<CategoryListResponse>('/api/v1/products/categories')
  },
}
