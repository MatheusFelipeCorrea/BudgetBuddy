import { supabase } from './supabaseClient'

export async function getDespesas() {
  const { data, error } = await supabase.from('despesas').select('*')
  if (error) throw error
  return data
}

export async function getDespesaById(id_despesa) {
  const { data, error } = await supabase.from('despesas').select('*').eq('id_despesa', id_despesa).single()
  if (error) throw error
  return data
}

export async function createDespesa(despesa) {
  const { data, error } = await supabase.from('despesas').insert([despesa]).single()
  if (error) throw error
  return data
}

export async function updateDespesa(id_despesa, updates) {
  const { data, error } = await supabase.from('despesas').update(updates).eq('id_despesa', id_despesa).single()
  if (error) throw error
  return data
}

export async function deleteDespesa(id_despesa) {
  const { error } = await supabase.from('despesas').delete().eq('id_despesa', id_despesa)
  if (error) throw error
} 