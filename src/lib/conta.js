import { supabase } from './supabaseClient'

export async function getContas() {
  const { data, error } = await supabase.from('conta').select('*')
  if (error) throw error
  return data
}

export async function getContaById(id_conta) {
  const { data, error } = await supabase.from('conta').select('*').eq('id_conta', id_conta).single()
  if (error) throw error
  return data
}

export async function createConta(conta) {
  const { data, error } = await supabase.from('conta').insert([conta]).single()
  if (error) throw error
  return data
}

export async function updateConta(id_conta, updates) {
  const { data, error } = await supabase.from('conta').update(updates).eq('id_conta', id_conta).single()
  if (error) throw error
  return data
}

export async function deleteConta(id_conta) {
  const { error } = await supabase.from('conta').delete().eq('id_conta', id_conta)
  if (error) throw error
} 