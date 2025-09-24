import React, { useState, useEffect } from 'react'  
import { motion } from 'framer-motion'  
import { supabase } from '../utils/supabase'  
import { addAuditLog } from '../utils/authHelpers'  

const ClientForm = ({ client, onClose, onSuccess }) => {  
  const [formData, setFormData] = useState({  
    razon_social: '',  
    ruc: '',  
    direccion_fiscal: '',  
    telefono: '',  
    email: ''  
  })  
  const [errors, setErrors] = useState({})  
  const [loading, setLoading] = useState(false)  

  useEffect(() => {  
    if (client) {  
      setFormData(client)  
    } else {  
      setFormData({ razon_social: '', ruc: '', direccion_fiscal: '', telefono: '', email: '' })  
    }  
  }, [client])  

  const validate = () => {  
    const newErrors = {}  
    if (!formData.razon_social.trim()) newErrors.razon_social = 'Requerido'  
    if (!formData.ruc.trim()) newErrors.ruc = 'Requerido'  
    else if (!/^\d{11}$/.test(formData.ruc)) newErrors.ruc = 'RUC inválido (11 dígitos)'  
    if (!formData.direccion_fiscal.trim()) newErrors.direccion_fiscal = 'Requerido'  
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido'  
    if (formData.telefono && !/^\+?\d{10,15}$/.test(formData.telefono.replace(/\s/g, ''))) newErrors.telefono = 'Teléfono inválido'  
    setErrors(newErrors)  
    return Object.keys(newErrors).length === 0  
  }  

  const handleSubmit = async (e) => {  
    e.preventDefault()  
    if (!validate()) return  

    setLoading(true)  
    let result  
    if (client) {  
      // Update  
      const { error } = await supabase  
        .from('customers')  
        .update({ ...formData, updated_at: new Date().toISOString() })  
        .eq('id', client.id)  
      result = !error  
      if (!error) await addAuditLog('UPDATE', 'customers', client.id, formData)  
    } else {  
      // Insert  
      const { data, error } = await supabase.from('customers').insert([formData])  
      result = !error && data  
      if (!error) await addAuditLog('CREATE', 'customers', data[0].id, formData)  
    }  

    if (result) {  
      onSuccess()  
      onClose()  
    } else {  
      // Handle error  
      setErrors({ general: 'Error al guardar' })  
    }  
    setLoading(false)  
  }  

  return (  
    <form onSubmit={handleSubmit} className="space-y-4">  
      <div>  
        <label className="block text-sm font-medium mb-1">Razón Social *</label>  
        <input  
          type="text"  
          value={formData.razon_social}  
          onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}  
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.razon_social ? 'border-red-500' : 'border-gray-300'}`}  
        />  
        {errors.razon_social && <p className="text-red-500 text-sm">{errors.razon_social}</p>}  
      </div>  
      <div>  
        <label className="block text-sm font-medium mb-1">RUC *</label>  
        <input  
          type="text"  
          value={formData.ruc}  
          onChange={(e) => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '') })}  
          maxLength={11}  
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.ruc ? 'border-red-500' : 'border-gray-300'}`}  
        />  
        {errors.ruc && <p className="text-red-500 text-sm">{errors.ruc}</p>}  
      </div>  
      <div>  
        <label className="block text-sm font-medium mb-1">Dirección Fiscal *</label>  
        <textarea  
          value={formData.direccion_fiscal}  
          onChange={(e) => setFormData({ ...formData, direccion_fiscal: e.target.value })}  
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.direccion_fiscal ? 'border-red-500' : 'border-gray-300'}`}  
          rows={3}  
        />  
        {errors.direccion_fiscal && <p className="text-red-500 text-sm">{errors.direccion_fiscal}</p>}  
      </div>  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <div>  
          <label className="block text-sm font-medium mb-1">Teléfono</label>  
          <input  
            type="tel"  
            value={formData.telefono}  
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}  
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}  
          />  
          {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}  
        </div>  
        <div>  
          <label className="block text-sm font-medium mb-1">Email</label>  
          <input  
            type="email"  
            value={formData.email}  
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}  
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}  
          />  
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}  
        </div>  
      </div>  
      {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}  
      <div className="flex space-x-4">  
        <motion.button  
          type="submit"  
          disabled={loading}  
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"  
          whileHover={{ scale: 1.02 }}  
          whileTap={{ scale: 0.98 }}  
        >  
          {loading ? 'Guardando...' : (client ? 'Actualizar' : 'Crear')}  
        </motion.button>  
        <button  
          type="button"  
          onClick={onClose}  
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"  
        >  
          Cancelar  
        </button>  
      </div>  
    </form>  
  )  
}  

export default ClientForm