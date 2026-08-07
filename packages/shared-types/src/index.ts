// =============================================================
// @masakapa/shared-types — single source of truth untuk domain types
// Import types ini di apps/user dan apps/admin, JANGAN duplikasi
// =============================================================

// ---------- Region ----------
export interface Province {
  id: number;
  name: string;
}

export interface City {
  id: number;
  province_id: number;
  name: string;
}

// ---------- User ----------
export interface User {
  id: string; // UUID, sync dengan Supabase auth.users.id
  email: string;
  name?: string;
  city_id?: number;
  role: "user" | "admin";
  created_at: string;
}

export interface UserPreferences {
  id: number;
  user_id: string;
  goal: "hemat" | "sehat" | "diet" | "bebas";
  budget_amount: number; // rupiah, integer
  budget_period: "harian" | "mingguan";
  household_size: number;
  restrictions: string[]; // ["udang", "kacang", ...]
  updated_at: string;
}

// ---------- Recipe ----------
export interface Recipe {
  id: number;
  name: string;
  description?: string;
  goal_tags: string[];
  ai_generated: boolean;
  created_at: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_name: string;
  quantity: string;
  unit?: string;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[];
}

// ---------- Price ----------
export interface IngredientPriceLog {
  id: number;
  ingredient_name: string;
  city_id?: number;
  price: number; // rupiah, integer
  source: "ai_estimate" | "crowdsource" | "scrape" | "api";
  confidence_score?: number; // 0.00 - 1.00
  recorded_at: string;
}

// ---------- Meal & Shopping ----------
export interface MealSelection {
  id: number;
  user_id: string;
  recipe_id: number;
  selected_date: string; // "YYYY-MM-DD"
  total_estimated_price: number;
  created_at: string;
}

export interface ShoppingList {
  id: number;
  user_id: string;
  meal_selection_id: number;
  items: ShoppingItem[];
  created_at: string;
}

export interface ShoppingItem {
  name: string;
  qty: string;
  checked: boolean;
}

// ---------- Subscription ----------
export interface SubscriptionPlan {
  id: number;
  name: "free" | "premium";
  price: number;
  billing_period?: "bulanan" | "tahunan";
  features: PlanFeatures;
  is_active: boolean;
  created_at: string;
}

export interface PlanFeatures {
  max_generate_per_day: number;
  history_access: boolean;
  price_watch_submit: boolean;
  [key: string]: unknown;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
}

export interface UserSubscription {
  id: number;
  user_id: string;
  plan_id: number;
  coupon_id?: number;
  status: "active" | "expired" | "canceled";
  started_at: string;
  ends_at?: string;
}

export interface PaymentTransaction {
  id: number;
  user_subscription_id: number;
  amount: number;
  status: "pending" | "success" | "failed";
  payment_gateway: "dummy" | "wuzzpay";
  gateway_ref?: string;
  created_at: string;
}

// ---------- Price Watch (Crowdsource) ----------
export interface PriceWatchCampaign {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PriceWatchItem {
  id: number;
  campaign_id: number;
  ingredient_name: string;
  unit: string;
  icon_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface PriceSubmission {
  id: number;
  watch_item_id: number;
  user_id: string;
  city_id: number;
  submitted_price: number;
  status: "pending" | "validated" | "rejected";
  validated_at?: string;
  created_at: string;
}

// ---------- Credits ----------
export interface UserCredits {
  id: number;
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface CreditTransaction {
  id: number;
  user_id: string;
  amount: number; // positif (earn) / negatif (spend)
  type: "earn_submission" | "spend_generate" | string;
  reference_id?: number;
  created_at: string;
}

// ---------- API Response wrapper ----------
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
}
