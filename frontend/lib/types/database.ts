export type UserRole = "customer" | "admin"

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export type AddressType = "shipping" | "billing" | "both"

export type DiscountType = "percentage" | "fixed"

export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  short_description?: string
  category_id?: string
  base_price: number
  compare_at_price?: number
  cost_per_item?: number
  sku?: string
  barcode?: string
  track_quantity: boolean
  quantity: number
  weight?: number
  weight_unit: string
  is_featured: boolean
  is_active: boolean
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  tags?: string[]
  created_at: string
  updated_at: string
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text?: string
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku?: string
  price: number
  compare_at_price?: number
  quantity: number
  weight?: number
  weight_unit: string
  attributes?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  address_type: AddressType
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  variant_id?: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  status: OrderStatus
  subtotal: number
  discount_amount: number
  shipping_cost: number
  tax_amount: number
  total_amount: number
  shipping_full_name: string
  shipping_phone: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  billing_full_name?: string
  billing_phone?: string
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_postal_code?: string
  billing_country?: string
  payment_method?: string
  payment_status: PaymentStatus
  payment_id?: string
  tracking_number?: string
  tracking_url?: string
  customer_notes?: string
  admin_notes?: string
  confirmed_at?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  variant_name?: string
  sku?: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: DiscountType
  discount_value: number
  min_purchase_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  usage_count: number
  valid_from?: string
  valid_until?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_id?: string
  rating: number
  title?: string
  comment?: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}
