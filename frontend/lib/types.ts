// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export type DietaryTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'spicy'
  | 'chef-special'
  | 'new';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  spice_level: 0 | 1 | 2 | 3; // 0=none, 1=mild, 2=medium, 3=hot
  dietary_tags: DietaryTag[];
  preparation_time: number; // minutes
  calories?: number;
  allergens?: string[];
  created_at: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  image_url?: string;
}

// ─── Tables ──────────────────────────────────────────────────────────────────

export type TableStatus = 'available' | 'booked' | 'waiting' | 'reserved';
export type TableZone = 'indoor' | 'outdoor' | 'private' | 'bar';

export interface Table {
  id: number;
  table_number: string;
  capacity: number;
  status: TableStatus;
  zone: TableZone;
  position_x?: number;
  position_y?: number;
  description?: string;
  is_accessible: boolean;
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Booking {
  id: number;
  booking_ref: string;
  user_id: number;
  user?: User;
  table_id: number;
  table?: Table;
  date: string; // ISO date string
  time_slot: string; // e.g. "19:00"
  party_size: number;
  status: BookingStatus;
  special_requests?: string;
  occasion?: string;
  pre_ordered_items?: PreOrderItem[];
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface PreOrderItem {
  menu_item_id: number;
  menu_item?: MenuItem;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
}

export interface CreateBookingRequest {
  table_id: number;
  date: string;
  time_slot: string;
  party_size: number;
  special_requests?: string;
  occasion?: string;
  pre_ordered_items?: Omit<PreOrderItem, 'menu_item'>[];
}

export interface BookingSlot {
  time: string;
  available: boolean;
  tables_available: number;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface Order {
  id: number;
  booking_id: number;
  booking?: Booking;
  items: OrderItem[];
  status: OrderStatus;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  menu_item?: MenuItem;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions?: string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  user_id: number;
  user?: Pick<User, 'id' | 'name'>;
  booking_id?: number;
  food_rating: number; // 1-5
  service_rating: number; // 1-5
  ambiance_rating: number; // 1-5
  overall_rating: number; // 1-5
  comment?: string;
  is_verified: boolean;
  created_at: string;
}

export interface CreateReviewRequest {
  booking_id?: number;
  food_rating: number;
  service_rating: number;
  ambiance_rating: number;
  overall_rating: number;
  comment?: string;
}

// ─── API responses ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

// ─── Cart (local state) ──────────────────────────────────────────────────────

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  special_instructions?: string;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface TimeSlot {
  time: string;
  label: string;
  period: 'lunch' | 'dinner';
}

export interface DashboardStats {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  today_bookings: number;
  total_revenue: number;
  average_party_size: number;
  popular_items: { item: MenuItem; order_count: number }[];
}
