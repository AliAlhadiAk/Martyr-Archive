import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  AUDIO: 'audio', 
  VIDEOS: 'videos',
  FONTS: 'fonts',
  DOCUMENTS: 'documents'
} as const

// Type for storage buckets
export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

// Client for browser usage (limited permissions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (full permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
