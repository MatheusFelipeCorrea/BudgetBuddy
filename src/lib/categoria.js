import { supabase } from './supabaseClient'

export async function getCategorias() {
  const { data, error } = await supabase.from('categoria').select('*')
  if (error) throw error
  return data
}

export async function getCategoriaById(id_categoria) {
  const { data, error } = await supabase.from('categoria').select('*').eq('id_categoria', id_categoria).single()
  if (error) throw error
  return data
}

export async function createCategoria(categoria) {
  const { data, error } = await supabase.from('categoria').insert([categoria]).single()
  if (error) throw error
  return data
}

export async function updateCategoria(id_categoria, updates) {
  const { data, error } = await supabase.from('categoria').update(updates).eq('id_categoria', id_categoria).single()
  if (error) throw error
  return data
}

export async function deleteCategoria(id_categoria) {
  const { error } = await supabase.from('categoria').delete().eq('id_categoria', id_categoria)
  if (error) throw error
} 