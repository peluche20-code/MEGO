import React from 'react'  
import { Navigate } from 'react-router-dom'  
import { useAuth } from '../hooks/useAuth'  

const ProtectedRoute = ({ children, allowedRoles = [] }) => {  
  const { user, role, loading } = useAuth()  

  if (loading) {  
    return <div className="flex justify-center items-center h-64">Cargando...</div>  
  }  

  if (!user) {  
    return <Navigate to="/login" replace />  
  }  

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {  
    return <Navigate to="/" replace />  
  }  

  return children  
}  

export default ProtectedRoute