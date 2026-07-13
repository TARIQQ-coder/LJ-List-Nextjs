export type UUID = string

export type ApiMeta = {
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// Location fields — shared between ApiUser (profile defaults) and Application (snapshot)
export type LocationFields = {
  address?: string
  landmark?: string
  region?: string
  city?: string
}

export type ApiUser = {
  id: UUID
  display_name: string
  phone_number: string
  role: 'customer' | 'admin'
  staff_number?: string
  institution?: string
  ghana_card_number?: string
  created_at?: string
  updated_at?: string
} & LocationFields

export type AuthResponse = {
  user: ApiUser
  verification?: {
    phone_number: string
    expires_in_minutes: number
  }
}

export type ProductImage = {
  id: UUID
  product_id: UUID
  image_url: string
  created_at: string
}

export type ApiProduct = {
  id: UUID
  legacy_id?: number
  category_id?: UUID
  name: string
  category: string
  price: number | null
  old_price?: number | null
  display_tag?: string
  description?: string
  instructions?: string
  requires_inquiry: boolean
  orderable: boolean
  image_url?: string
  images?: ProductImage[]
  unit: string
  active: boolean
}

export type ApiCategory = {
  id: UUID
  name: string
  description?: string
  instructions?: string
  tag?: string
  requires_inquiry?: boolean
  orderable?: boolean
  active?: boolean
}

export type ProductListResponse = {
  products: ApiProduct[]
  meta: ApiMeta
}

export type CategoryListResponse = {
  categories: ApiCategory[]
}

export type FixedPackageItem = {
  product_id: UUID | string
  qty: number
  label: string
  emoji?: string
  image_url?: string
  product?: ApiProduct
}

export type FixedPackage = {
  id: string
  name: string
  tagline: string
  price: string
  monthly: string
  tag: string
  popular: boolean
  rice_options?: string
  items: FixedPackageItem[]
}

export type DepartmentPackage = {
  id: string
  name: string
  price: number
  items: string
}

export type PackageCatalogResponse = {
  min_order: number
  package_options: string[]
  fixed_packages: FixedPackage[]
  provisions_packages: DepartmentPackage[]
  detergent_packages: DepartmentPackage[]
}

export type ApplicationCartItem = {
  product_id: string
  name?: string
  image_url?: string
  price?: number
  quantity: number
  subtotal?: number
}

export type Application = {
  id: UUID
  user_id: UUID
  package_type: 'fixed' | 'custom'
  package_name?: string
  cart_items?: ApplicationCartItem[]
  total_amount?: number
  monthly_amount?: number
  status: 'pending' | 'reviewed' | 'approved' | 'declined'
  staff_number?: string
  mandate_number: string
  institution?: string
  ghana_card_number?: string
  preferred_date?: string
  notes?: string
  created_at: string
  updated_at: string
} & LocationFields   // address, landmark, region, city — snapshotted at submission time

export type Conversation = {
  id: UUID
  other_user: ApiUser
  last_message?: string
  unread_count: number
  created_at: string
}

export type ConversationMessage = {
  id: UUID
  conversation_id: UUID
  sender_id: UUID
  content: string
  read_at?: string | null
  created_at: string
}
