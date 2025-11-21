import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Dish = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_spicy: boolean
  tags: string[]
  category_id?: string
  created_at: string
}

export type Category = {
  id: string
  name: string
  description: string
  is_veg: boolean
  cuisine_type: string
  created_at: string
}

export type Event = {
  id: string
  title: string
  description: string
  event_date: string
  is_active: boolean
  created_at: string
}

export type Order = {
  id: string
  table_id: string
  customer_phone: string
  items: { dish_id: string; quantity: number; dish_name?: string; dish_price?: number }[]
  total_amount: number
  bill_amount?: number
  tax_amount: number
  final_amount?: number
  status: 'pending' | 'approved' | 'completed'
  created_at: string
}

export type TaxConfig = {
  id: string
  name: string
  percentage: number
  is_active: boolean
}

export type SystemConfig = {
  id: string
  key: string
  value: string
}

export type Table = {
  id: string
  number: string
  qr_code: string
  created_at: string
}