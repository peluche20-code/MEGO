import React, { useState } from 'react'  
import { motion } from 'framer-motion'  
import { Link, Outlet, useLocation } from 'react-router-dom'  
import { Menu, User, Settings, Home, FileText, Users, Package, Shield, X } from 'lucide-react'  
import { useAuth } from '../hooks/useAuth'  

const Layout = () => {  
  const { user, role, signOut } = useAuth()  
  const location = useLocation()  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)  

  const navItems = [  
    { path: '/', icon: Home, label: 'Dashboard', roles: ['admin', 'vendedor', 'lector'] },  
    { path: '/cotizaciones', icon: FileText, label: 'Cotizaciones', roles: ['admin', 'vendedor', 'lector'] },  
    { path: '/clientes', icon: Users, label: 'Clientes', roles: ['admin', 'vendedor'] },  
    { path: '/catalogo', icon: Package, label: 'Catálogo', roles: ['admin', 'vendedor'] },  
    ...(role === 'admin' ? [  
      { path: '/usuarios', icon: Shield, label: 'Usuarios', roles: ['admin'] },  
      { path: '/configuracion', icon: Settings, label: 'Configuración', roles: ['admin'] }  
    ] : [])  
  ]  

  return (  
    <div className="min-h-screen bg-gray-50">  
      <motion.nav  
        className="bg-white shadow-lg"  
        initial={{ y: -100 }}  
        animate={{ y: 0 }}  
        transition={{ duration: 0.5 }}  
      >  
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
          <div className="flex justify-between items-center h-16">  
            <div className="flex items-center space-x-4">  
              <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-gray-800">  
                <FileText className="w-6 h-6 text-blue-600" />  
                <span>CotizaPro</span>  
              </Link>  
              {/* Mobile menu button */}  
              <button  
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}  
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"  
              >  
                <Menu className="w-6 h-6" />  
              </button>  
            </div>  
            {user && (  
              <div className="flex items-center space-x-4">  
                <span className="hidden sm:block text-sm text-gray-600">Hola, {user.email}</span>  
                <button  
                  onClick={signOut}  
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition md:px-4 md:py-2"  
                >  
                  Salir  
                </button>  
              </div>  
            )}  
          </div>  
        </div>  
      </motion.nav>  

      {/* Mobile Menu Overlay */}  
      {isMobileMenuOpen && (  
        <motion.div  
          initial={{ opacity: 0 }}  
          animate={{ opacity: 1 }}  
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"  
          onClick={() => setIsMobileMenuOpen(false)}  
        />  
      )}  

      <div className="flex">  
        {/* Sidebar - Hidden on mobile, shown on md+ */}  
        <motion.aside  
          className="hidden md:block w-64 bg-white shadow-lg fixed h-full z-30 overflow-y-auto"  
          initial={{ x: -300 }}  
          animate={{ x: 0 }}  
          transition={{ duration: 0.5, delay: 0.1 }}  
        >  
          <nav className="mt-8 space-y-2 px-4">  
            {navItems.map((item) =>  
              role && item.roles.includes(role) ? (  
                <Link  
                  key={item.path}  
                  to={item.path}  
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${  
                    location.pathname === item.path  
                      ? 'bg-blue-100 text-blue-700'  
                      : 'text-gray-600 hover:bg-gray-100'  
                  }`}  
                  onClick={() => setIsMobileMenuOpen(false)}  
                >  
                  <item.icon className="w-5 h-5" />  
                  <span>{item.label}</span>  
                </Link>  
              ) : null  
            )}  
          </nav>  
        </motion.aside>  

        {/* Mobile Menu Drawer */}  
        <motion.div  
          initial={{ x: '-100%' }}  
          animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}  
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}  
          className="md:hidden fixed left-0 top-16 h-full w-64 bg-white shadow-lg z-50 overflow-y-auto"  
        >  
          <div className="p-4 border-b">  
            <h4 className="font-semibold text-gray-800">Menú</h4>  
            <button  
              onClick={() => setIsMobileMenuOpen(false)}  
              className="absolute right-2 top-2 p-1 rounded-full text-gray-500 hover:text-gray-900"  
            >  
              <X className="w-5 h-5" />  
            </button>  
          </div>  
          <nav className="mt-2 space-y-2 px-4 pb-4">  
            {navItems.map((item) =>  
              role && item.roles.includes(role) ? (  
                <Link  
                  key={item.path}  
                  to={item.path}  
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 block w-full text-left ${  
                    location.pathname === item.path  
                      ? 'bg-blue-100 text-blue-700'  
                      : 'text-gray-600 hover:bg-gray-100'  
                  }`}  
                  onClick={() => setIsMobileMenuOpen(false)}  
                >  
                  <item.icon className="w-5 h-5 flex-shrink-0" />  
                  <span className="ml-3">{item.label}</span>  
                </Link>  
              ) : null  
            )}  
          </nav>  
        </motion.div>  

        {/* Main Content - With offset for sidebar on desktop */}  
        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 overflow-auto">  
          <Outlet />  
        </main>  
      </div>  
    </div>  
  )  
}  

export default Layout