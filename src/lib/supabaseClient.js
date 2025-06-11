import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jnefeyoctnuqpnogzeqz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZWZleW9jdG51cXBub2d6ZXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzM3MTQsImV4cCI6MjA2NDgwOTcxNH0._RwW9ZoDWmmxDyx9VumVhXmBAxyMpCskVeyUx6kn54w'
export const supabase = createClient(supabaseUrl, supabaseKey)