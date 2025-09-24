import { supabase } from './supabase'  
import { user_role } from '../types/enums' // Nota: En Supabase, roles vienen del DB  

export const getUserRole = async () => {  
  const { data: { user }, error } = await supabase.auth.getUser()  
  if (error || !user) return null  
  const { data: profile } = await supabase  
    .from('users')  
    .select('rol')  
    .eq('email', user.email)  
    .single()  
  return profile?.rol || 'lector'  
}  

export const requireRole = (allowedRoles) => {  
  return async () => {  
    const role = await getUserRole()  
    if (!allowedRoles.includes(role)) {  
      window.location.href = '/login'  
    }  
  }  
}  

export const calculateCorrelative = async () => {  
  const { data: settings } = await supabase  
    .from('numbering_settings')  
    .select('*')  
    .single()  
  if (!settings) return null  

  const now = new Date()  
  const year = now.getFullYear()  
  let counter = settings.contador_actual  

  if (settings.reiniciar_anual && settings.ultimo_anio !== year) {  
    counter = 1  
    await supabase  
      .from('numbering_settings')  
      .update({ contador_actual: 1, ultimo_anio: year })  
      .eq('id', settings.id)  
  }  

  const paddedCounter = counter.toString().padStart(3, '0')  
  const correlative = `${settings.prefijo}${year}${paddedCounter}${settings.sufijo}`  

  // Actualizar contador  
  await supabase  
    .from('numbering_settings')  
    .update({ contador_actual: counter + 1 })  
    .eq('id', settings.id)  

  return correlative  
}  

export const addAuditLog = async (accion, entidad, entidad_id, detalles = {}) => {  
  const { data: { user } } = await supabase.auth.getUser()  
  if (user) {  
    await supabase  
      .from('audit_logs')  
      .insert({  
        user_id: user.id, // Asumiendo user.id de auth, mapear si necesario  
        accion,  
        entidad,  
        entidad_id,  
        detalles  
      })  
  }  
}