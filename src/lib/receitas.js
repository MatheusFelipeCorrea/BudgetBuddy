import { supabase } from './supabaseClient'

export async function getReceitas() {
  const { data, error } = await supabase.from('receitas').select('*')
  if (error) throw error
  return data
}

export async function getReceitaById(id_receita) {
  const { data, error } = await supabase.from('receitas').select('*').eq('id_receita', id_receita).single()
  if (error) throw error
  return data
}

export async function createReceita(receita) {
  const { data, error } = await supabase.from('receitas').insert([receita]).single()
  if (error) throw error
  return data
}

export async function updateReceita(id_receita, updates) {
  const { data, error } = await supabase.from('receitas').update(updates).eq('id_receita', id_receita).single()
  if (error) throw error
  return data
}

export async function deleteReceita(id_receita) {
  const { error } = await supabase.from('receitas').delete().eq('id_receita', id_receita)
  if (error) throw error
} 