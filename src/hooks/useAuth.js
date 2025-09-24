import { useState, useEffect } from 'react'  
import { supabase } from '../utils/supabase'  
import { getUserRole } from '../utils/authHelpers'  

export const useAuth = () => {  
  const [user, setUser] = useState(null)  
  const [role, setRole] = useState(null)  
  const [loading, setLoading] = useState(true)  

  useEffect(() => {  
    // Get initial session  
    supabase.auth.getSession().then(({ data: { session } }) => {  
      setUser(session?.user ?? null)  
      if (session?.user) {  
        getUserRole().then(setRole)  
      }  
      setLoading(false)  
    })  

    // Listen for auth changes  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(  
      (event, session) => {  
        setUser(session?.user ?? null)  
        if (session?.user) {  
          getUserRole().then(setRole)  
        } else {  
          setRole(null)  
        }  
      }  
    )  

    return () => subscription.unsubscribe()  
  }, [])  

  const signIn = async (email, password) => {  
    const { data, error } = await supabase.auth.signInWithPassword({  
      email,  
      password  
    })  
    if (error) throw error  
    return data  
  }  

  const signUp = async (email, password, nombre) => {  
    const { data, error } = await supabase.auth.signUp({  
      email,  
      password,  
      options: {  
        data: { nombre }  
      }  
    })  
    if (error) throw error  

    // Insertar en tabla users  
    if (data.user) {  
      await supabase.from('users').insert({  
        email,  
        password_hash: await supabase.auth.mfa.enroll({ factorType: 'totp' }), // Usar hash real en prod  
        nombre,  
        rol: 'vendedor' // Default  
      })  
    }  
    return data  
  }  

  const signOut = async () => {  
    await supabase.auth.signOut()  
  }  

  return { user, role, loading, signIn, signUp, signOut }  
}