import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For development purposes, if we don't have environment variables, use these values
const fallbackUrl = 'https://hsjijihieivrqvatakmf.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzamlqaWhpZWl2cnF2YXRha21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwOTcwMTUsImV4cCI6MjA1ODY3MzAxNX0.VvUmR3PGc77ll7uc15hG7C12kaMiuM_9HhrQlJQjOZk'

// Check if we have the required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase URL or key is missing. Using fallback values for development. In production, please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  )
}

// Create the Supabase client
export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseKey || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)