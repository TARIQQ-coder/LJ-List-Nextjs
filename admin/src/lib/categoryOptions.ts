import type { Category } from "../api/endpoints/categories";
import type { SelectOption } from "../components/shared/SelectDropdown";

const INACTIVE_CATEGORY_TOOLTIP =
  "This category is inactive. Activate it before adding it to a product.";

export const toCategoryOption = (category: Category): SelectOption => ({
  value: category.id,
  label: category.name,
  description: category.active
    ? category.sort_order !== undefined
      ? `Sort order: ${category.sort_order}`
      : undefined
    : "Inactive category",
  disabled: !category.active,
  badge: category.active ? undefined : "Inactive",
  tooltip: category.active ? undefined : INACTIVE_CATEGORY_TOOLTIP,
});
