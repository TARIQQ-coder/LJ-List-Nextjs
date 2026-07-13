export interface User {
  id: string;
  display_name: string;
  phone_number: string;
  role: "customer" | "admin";
  institution?: string;
  staff_number?: string;
  ghana_card_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  category_id?: string;
  price: number;
  old_price?: number;
  unit: string;
  tag?: string;
  display_tag?: string;
  description?: string;
  instructions?: string;
  requires_inquiry: boolean;
  orderable: boolean;
  active: boolean;
  image_url: string;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

export interface Application {
  id: string;
  user_id: string;
  package_type: "fixed" | "custom";
  package_name?: string;
  status: "pending" | "reviewed" | "approved" | "declined";
  total_amount: number;
  monthly_amount: number;
  mandate_number: string;
  staff_number: string;
  institution: string;
  ghana_card_number: string;
  address?: string;
  landmark?: string;
  city?: string;
  region?: string;
  preferred_date?: string;
  notes?: string;
  cart_items: CartItem[];
  customer?: Pick<User, "id" | "display_name" | "phone_number" | "role">;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  last_message: string;
  unread_count: number;
  other_user: Pick<User, "id" | "display_name" | "phone_number" | "role">;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  code: string;
  request_id: string;
  metadata: {
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  [key: string]: T[] | PaginationMeta;
}

export interface AuthUser {
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalApplications: number;
  pendingApplications: number;
  totalConversations: number;
}
