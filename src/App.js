import React from 'react'  
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'  
import { StrictMode } from 'react'  
import Layout from './components/Layout'  
import ProtectedRoute from './components/ProtectedRoute'  
import LoginForm from './components/LoginForm'  
import Dashboard from './components/Dashboard'  
import ClientList from './components/ClientList'  
import CatItemList from './components/CatItemList'  
import QuoteList from './components/QuoteList'  
import { useAuth } from './hooks/useAuth'  
import { USER_ROLES } from './types/enums'  

const App = () => {  
  const { user, loading } = useAuth()  

  if (loading) {  
    return (  
      <div className="min-h-screen flex items-center justify-center">  
        <div className="text-center">  
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>  
          <p className="text-gray-600">Cargando...</p>  
        </div>  
      </div>  
    )  
  }  

  return (  
    <Router>  
      <StrictMode>  
        <div className="App">  
          <Routes>  
            <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/" />} />  
            <Route path="/" element={  
              user ? (  
                <ProtectedRoute>  
                  <Layout>  
                    <Routes>  
                      <Route index element={<Dashboard />} />  
                      <Route path="/cotizaciones" element={<QuoteList />} />  
                      <Route path="/clientes" element={  
                        <ProtectedRoute allowedRoles={[USER_ROLES.VENDEDOR, USER_ROLES.ADMIN]}>  
                          <ClientList />  
                        </ProtectedRoute>  
                      } />  
                      <Route path="/catalogo" element={  
                        <ProtectedRoute allowedRoles={[USER_ROLES.VENDEDOR, USER_ROLES.ADMIN]}>  
                          <CatItemList />  
                        </ProtectedRoute>  
                      } />  
                      <Route path="/usuarios" element={  
                        <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>  
                          <div className="p-8">Usuarios - En desarrollo (CRUD users con roles)</div>  
                        </ProtectedRoute>  
                      } />  
                      <Route path="/configuracion" element={  
                        <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>  
                          <div className="p-8">Configuración - En desarrollo (empresa, numeración, impuestos)</div>  
                        </ProtectedRoute>  
                      } />  
                      <Route path="*" element={<Navigate to="/" />} />  
                    </Routes>  
                  </Layout>  
                </ProtectedRoute>  
              ) : <Navigate to="/login" />  
            } />  
          </Routes>  
        </div>  
      </StrictMode>  
    </Router>  
  )  
}  

export default App