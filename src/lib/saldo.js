import { supabase } from './supabaseClient'

export async function getSaldos() {
  const { data, error } = await supabase.from('saldo').select('*')
  if (error) throw error
  return data
}

export async function getSaldoById(id_saldo) {
  const { data, error } = await supabase.from('saldo').select('*').eq('id_saldo', id_saldo).single()
  if (error) throw error
  return data
}

export async function createSaldo(saldo) {
  const { data, error } = await supabase.from('saldo').insert([saldo]).single()
  if (error) throw error
  return data
}

export async function updateSaldo(id_saldo, updates) {
  const { data, error } = await supabase.from('saldo').update(updates).eq('id_saldo', id_saldo).single()
  if (error) throw error
  return data
}

export async function deleteSaldo(id_saldo) {
  const { error } = await supabase.from('saldo').delete().eq('id_saldo', id_saldo)
  if (error) throw error
} 