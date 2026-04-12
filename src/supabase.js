import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uwmmihhiijmtycbbebjc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bW1paGhpaWptdHljYmJlYmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTcwMDMsImV4cCI6MjA5MTU5MzAwM30.9oHXsmUeARafJcj7KOejrSA4xUXqpim7kImhSWXAwr8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})