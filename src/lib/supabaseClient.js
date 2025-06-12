import { createClient } from '@supabase/supabase-js'

// Lê as variáveis de ambiente configuradas na Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cria e exporta o cliente Supabase para ser usado no resto do seu projeto
export const supabase = createClient(supabaseUrl, supabaseAnonKey)