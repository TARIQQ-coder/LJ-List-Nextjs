import type { SelectOption } from "../components/shared/SelectDropdown";

export const PACKAGE_TYPE_OPTIONS: SelectOption[] = [
  { value: "fixed", label: "Fixed" },
  { value: "provisions", label: "Provisions" },
  { value: "detergents", label: "Detergents" },
];

export const USER_ROLE_OPTIONS: SelectOption[] = [
  { value: "customer", label: "Customer" },
  { value: "admin", label: "Admin" },
];

export const APPLICATION_STATUS_OPTIONS: SelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];
