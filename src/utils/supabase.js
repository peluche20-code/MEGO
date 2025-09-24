import { createClient } from '@supabase/supabase-js'  

const supabaseUrl = 'https://vwevrgkfpkwofkuvortk.supabase.co'  
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXZyZ2tmcGt3b2ZrdXZvcnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTI5ODMsImV4cCI6MjA3NDMyODk4M30.TKwkLbDveOliIAD9umI7S8jETX33nOp1nooNJEWacP0'  

export const supabase = createClient(supabaseUrl, supabaseAnonKey)