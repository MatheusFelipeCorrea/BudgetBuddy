import { supabase } from './supabaseClient'

export async function getMetas() {
  const { data, error } = await supabase.from('meta').select('*')
  if (error) throw error
  return data
}

export async function getMetaById(id_meta) {
  const { data, error } = await supabase.from('meta').select('*').eq('id_meta', id_meta).single()
  if (error) throw error
  return data
}

export async function createMeta(meta) {
  const { data, error } = await supabase.from('meta').insert([meta]).single()
  if (error) throw error
  return data
}

export async function updateMeta(id_meta, updates) {
  const { data, error } = await supabase.from('meta').update(updates).eq('id_meta', id_meta).single()
  if (error) throw error
  return data
}

export async function deleteMeta(id_meta) {
  const { error } = await supabase.from('meta').delete().eq('id_meta', id_meta)
  if (error) throw error
} 