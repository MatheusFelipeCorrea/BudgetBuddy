import { supabase } from './supabaseClient'

export async function getUsuarios() {
  const { data, error } = await supabase.from('usuario').select('*')
  if (error) throw error
  return data
}

export async function getUsuarioById(id_usuario) {
  const { data, error } = await supabase.from('usuario').select('*').eq('id_usuario', id_usuario).single()
  if (error) throw error
  return data
}

export async function createUsuario(usuario) {
  const { data, error } = await supabase.from('usuario').insert([usuario]).single()
  if (error) throw error
  return data
}

export async function updateUsuario(id_usuario, updates) {
  const { data, error } = await supabase.from('usuario').update(updates).eq('id_usuario', id_usuario).single()
  if (error) throw error
  return data
}

export async function deleteUsuario(id_usuario) {
  const { error } = await supabase.from('usuario').delete().eq('id_usuario', id_usuario)
  if (error) throw error
} 