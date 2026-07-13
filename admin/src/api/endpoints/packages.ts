import client from "../client";

export type PackageType = "fixed" | "provisions" | "detergents";

export interface PackageItem {
  product_id?: string;
  qty: number;
  label: string;
  emoji?: string;
  image_url?: string;
  product?: {
    id: string;
    name: string;
    image_url: string;
    unit: string;
    active: boolean;
  };
}

interface PackageBase {
  id: string;
  name: string;
  price: string | number;
  active?: boolean;
  type: PackageType;
}

export interface FixedPackage extends PackageBase {
  type: "fixed";
  monthly: string | number;
  popular?: boolean;
  tag?: string;
  tagline?: string;
  rice_options?: string;
  items: PackageItem[];
}

export interface SimplePackage extends PackageBase {
  type: "provisions" | "detergents";
  items: string;
}

export type Package = FixedPackage | SimplePackage;

export interface PackageFormInput {
  id: string;
  name: string;
  price: string | number;
  monthly?: string | number;
  items: PackageItem[] | string;
  popular?: boolean;
  tag?: string;
  tagline?: string;
  rice_options?: string;
}

const packagePathMap: Record<PackageType, string> = {
  fixed: "fixed",
  provisions: "provisions",
  detergents: "detergents",
};

const parseAmount = (value: unknown) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }

  return 0;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toStringValue = (value: unknown) =>
  value == null ? "" : String(value);

const toOptionalString = (value: unknown) =>
  value == null ? undefined : String(value);

const toOptionalBoolean = (value: unknown) =>
  typeof value === "boolean" ? value : undefined;

const toDisplayAmount = (value: unknown) =>
  typeof value === "number" || typeof value === "string" ? value : "";

const normalizePackageItem = (value: unknown): PackageItem => {
  const item = asRecord(value);
  const product = item.product ? asRecord(item.product) : null;

  return {
    product_id: toOptionalString(item.product_id),
    qty: Number(item.qty ?? 1),
    label: toStringValue(item.label ?? item.name),
    emoji: toOptionalString(item.emoji),
    image_url: toOptionalString(item.image_url),
    product: product
      ? {
          id: toStringValue(product.id),
          name: toStringValue(product.name),
          image_url: toStringValue(product.image_url),
          unit: toStringValue(product.unit),
          active: Boolean(product.active),
        }
      : undefined,
  };
};

const normalizePackage = (type: PackageType, source: unknown): Package => {
  const value = asRecord(source);

  if (type === "fixed") {
    return {
      id: toStringValue(value.id),
      name: toStringValue(value.name),
      price: toDisplayAmount(value.price),
      monthly: toDisplayAmount(value.monthly),
      items: Array.isArray(value.items)
        ? value.items.map((item) => normalizePackageItem(item))
        : [],
      active: toOptionalBoolean(value.active),
      type,
      popular: Boolean(value.popular),
      tag: toOptionalString(value.tag),
      tagline: toOptionalString(value.tagline),
      rice_options: toOptionalString(value.rice_options),
    };
  }

  return {
    id: toStringValue(value.id),
    name: toStringValue(value.name),
    price: parseAmount(value.price),
    items:
      typeof value.items === "string"
        ? value.items
        : Array.isArray(value.items)
          ? value.items
              .map((item) => {
                const row = asRecord(item);
                return toStringValue(row.label ?? row.name);
              })
              .join(" · ")
          : "",
    active: toOptionalBoolean(value.active),
    type,
  };
};

export const fetchAllPackages = async (): Promise<Package[]> => {
  const response = await client.get("/admin/packages");
  const data = response.data.data as unknown;

  if (Array.isArray(data)) {
    return data as Package[];
  }

  const grouped = asRecord(data);

  const fixed = Array.isArray(grouped.fixed_packages)
    ? grouped.fixed_packages.map((pkg) => normalizePackage("fixed", pkg))
    : [];
  const provisions = Array.isArray(grouped.provisions_packages)
    ? grouped.provisions_packages.map((pkg) =>
        normalizePackage("provisions", pkg),
      )
    : [];
  const detergents = Array.isArray(grouped.detergent_packages)
    ? grouped.detergent_packages.map((pkg) =>
        normalizePackage("detergents", pkg),
      )
    : [];

  return [...fixed, ...provisions, ...detergents];
};

export const fetchPackageById = async (
  type: PackageType,
  id: string,
): Promise<Package> => {
  const response = await client.get(`/admin/packages/${type}/${id}`);
  return normalizePackage(type, response.data.data);
};

export const createPackage = async (
  type: PackageType,
  payload: PackageFormInput,
): Promise<Package> => {
  const response = await client.post(
    `/admin/packages/${packagePathMap[type]}`,
    payload,
  );
  return normalizePackage(type, response.data.data);
};

export const updatePackage = async (
  type: PackageType,
  id: string,
  payload: Partial<PackageFormInput>,
): Promise<Package> => {
  const response = await client.patch(
    `/admin/packages/${packagePathMap[type]}/${id}`,
    payload,
  );
  return normalizePackage(type, response.data.data);
};

export const deletePackage = async (
  type: PackageType,
  id: string,
): Promise<void> => {
  await client.delete(`/admin/packages/${packagePathMap[type]}/${id}`);
};

export const reactivatePackage = async (
  type: PackageType,
  id: string,
): Promise<Package> => {
  const response = await client.patch(
    `/admin/packages/${packagePathMap[type]}/${id}/reactivate`,
  );
  return normalizePackage(type, response.data.data);
};

export const fetchDashboardStats = async (): Promise<{
  totalUsers: number;
  totalProducts: number;
  totalApplications: number;
  pendingApplications: number;
  totalConversations: number;
}> => {
  const [usersRes, productsRes, appsRes, convosRes] = await Promise.all([
    client.get("/admin/users?limit=1"),
    client.get("/admin/products?limit=1"),
    client.get("/admin/applications?limit=1"),
    client.get("/admin/conversations?limit=1"),
  ]);

  const pendingRes = await client.get(
    "/admin/applications?status=pending&limit=1",
  );

  return {
    totalUsers: usersRes.data.meta?.total ?? 0,
    totalProducts: productsRes.data.meta?.total ?? 0,
    totalApplications: appsRes.data.meta?.total ?? 0,
    pendingApplications: pendingRes.data.meta?.total ?? 0,
    totalConversations: convosRes.data.meta?.total ?? 0,
  };
};
