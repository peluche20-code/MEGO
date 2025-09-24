import React, { useState } from 'react'  
import { motion } from 'framer-motion'  
import { Mail, Lock, UserPlus } from 'lucide-react'  
import { Link } from 'react-router-dom'  
import { useAuth } from '../hooks/useAuth'  

const LoginForm = () => {  
  const [email, setEmail] = useState('')  
  const [password, setPassword] = useState('')  
  const [isSignUp, setIsSignUp] = useState(false)  
  const [nombre, setNombre] = useState('')  
  const [error, setError] = useState('')  
  const { signIn, signUp } = useAuth()  

  const handleSubmit = async (e) => {  
    e.preventDefault()  
    setError('')  
    try {  
      if (isSignUp) {  
        await signUp(email, password, nombre)  
      } else {  
        await signIn(email, password)  
      }  
    } catch (err) {  
      setError(err.message)  
    }  
  }  

  return (  
    <motion.div  
      className="max-w-md mx-auto bg-white rounded-xl shadow-xl p-8"  
      initial={{ opacity: 0, y: 50 }}  
      animate={{ opacity: 1, y: 0 }}  
      transition={{ duration: 0.5 }}  
    >  
      <h2 className="text-2xl font-bold text-center mb-6">  
        {isSignUp ? 'Únete' : 'Entra'} a CotizaPro  
      </h2>  
      <form onSubmit={handleSubmit} className="space-y-4">  
        {isSignUp && (  
          <div>  
            <label className="block text-sm font-medium mb-1">Nombre</label>  
            <div className="relative">  
              <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />  
              <input  
                type="text"  
                value={nombre}  
                onChange={(e) => setNombre(e.target.value)}  
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
                required  
              />  
            </div>  
          </div>  
        )}  
        <div>  
          <label className="block text-sm font-medium mb-1">Email</label>  
          <div className="relative">  
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />  
            <input  
              type="email"  
              value={email}  
              onChange={(e) => setEmail(e.target.value)}  
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
              required  
            />  
          </div>  
        </div>  
        <div>  
          <label className="block text-sm font-medium mb-1">Contraseña</label>  
          <div className="relative">  
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />  
            <input  
              type="password"  
              value={password}  
              onChange={(e) => setPassword(e.target.value)}  
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
              required  
            />  
          </div>  
        </div>  
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}  
        <motion.button  
          type="submit"  
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"  
          whileHover={{ scale: 1.02 }}  
          whileTap={{ scale: 0.98 }}  
        >  
          {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}  
        </motion.button>  
      </form>  
      <p className="text-center mt-4 text-sm">  
        {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}  
        <button  
          onClick={() => setIsSignUp(!isSignUp)}  
          className="text-blue-600 hover:underline ml-1"  
        >  
          {isSignUp ? 'Inicia sesión' : 'Regístrate'}  
        </button>  
      </p>  
    </motion.div>  
  )  
}  

export default LoginForm