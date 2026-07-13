import client from "../client";

export interface Category {
  id: string;
  name: string;
  sort_order?: number;
  active: boolean;
}

export interface CategoryInput {
  name: string;
  sort_order?: number;
  active?: boolean;
}

interface CategoriesResponse {
  categories: Category[];
}

const normalizeResponse = (data: unknown): CategoriesResponse => {
  if (data && typeof data === "object" && "data" in data) {
    const inner = (data as { data?: unknown }).data;
    if (inner && typeof inner === "object" && "categories" in inner) {
      return inner as CategoriesResponse;
    }
  }

  if (data && typeof data === "object" && "categories" in data) {
    return data as CategoriesResponse;
  }

  return { categories: [] };
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await client.get("/admin/categories");
  return normalizeResponse(response.data).categories;
};

export const fetchCategoryById = async (id: string): Promise<Category> => {
  const response = await client.get(`/admin/categories/${id}`);
  return (response.data.data?.category ?? response.data.data ?? response.data) as Category;
};

export const createCategory = async (
  payload: CategoryInput,
): Promise<Category> => {
  const response = await client.post("/admin/categories", payload);
  return (response.data.data ?? response.data) as Category;
};

export const updateCategory = async (
  id: string,
  payload: Partial<CategoryInput>,
): Promise<Category> => {
  const response = await client.patch(`/admin/categories/${id}`, payload);
  return (response.data.data ?? response.data) as Category;
};

export const deleteCategory = async (
  id: string,
): Promise<void> => {
  await client.delete(`/admin/categories/${id}`);
};
