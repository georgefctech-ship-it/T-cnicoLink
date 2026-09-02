export type UserRole = 'admin' | 'technician' | 'visitor';
export type UserPlan = 'free' | 'pro' | 'enterprise';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface Profile {
  id: string;
  user_id?: string;
  full_name: string;
  username: string; // slug for /p/[username]
  profession: string;
  specialties: string[];
  whatsapp_number: string;
  phone_number?: string;
  bio_short: string;
  avatar_url: string;
  cover_url?: string;
  city_state: string;
  years_experience?: number;
  accepts_pix?: boolean;
  accepts_cards?: boolean;
  offers_warranty?: boolean;
  rating?: number;
  review_count?: number;
  role?: UserRole;
  status?: UserStatus;
  plan?: UserPlan;
  is_verified?: boolean;
  max_photos?: number;
  views_count?: number;
  monthly_views_limit?: number;
  current_month_views?: number;
  whatsapp_clicks?: number;
  plan_price?: number;
  subscription_status?: 'active' | 'past_due' | 'canceled' | 'trialing';
  pix_key?: string;
  created_at: string;
  updated_at?: string;
}

export interface ServicePhoto {
  id: string;
  profile_id: string;
  image_url: string;
  title?: string;
  description: string;
  tag?: 'Antes e Depois' | 'Instalação' | 'Manutenção' | 'Acabamento' | 'Geral';
  is_approved?: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  profile_id: string;
  client_name: string;
  client_neighborhood: string;
  comment: string;
  rating: number;
  service_type: string;
  date: string;
}

export interface SystemSettings {
  allow_self_registration: boolean;
  require_profile_approval: boolean;
  free_plan_photo_limit: number;
  pro_plan_photo_limit: number;
  free_plan_monthly_views: number;
  pro_plan_monthly_views: number;
  price_pro_monthly: number;
  price_pro_yearly: number;
  admin_pix_key: string;
  admin_pix_name: string;
  admin_whatsapp_billing: string;
  enable_access_paywall: boolean;
  enable_verified_badges: boolean;
  maintenance_mode: boolean;
  enable_watermark: boolean;
}

export type AppView = 
  | 'home' 
  | 'login' 
  | 'register' 
  | 'panel' 
  | 'public_profile' 
  | 'admin_control'
  | 'sql_schema' 
  | 'deploy_docs';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

