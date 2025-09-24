import React, { useState } from 'react'  
import { motion } from 'framer-motion'  
import { Package, DollarSign } from 'lucide-react'  
import { supabase } from '../utils/supabase'  
import { ITEM_TYPES, DISCOUNT_TYPES } from '../types/enums'  
import { addAuditLog } from '../utils/authHelpers'  

const ItemForm = ({ item, onClose, onSuccess }) => {  
  const [formData, setFormData] = useState({  
    tipo: 'articulo',  
    codigo: '',  
    nombre: '',  
    descripcion: '',  
    unidad: '',  
    precio: 0,  
    moneda: 'PEN',  
    aplica_impuesto: true,  
    activo: true  
  })  
  const [errors, setErrors] = useState({})  
  const [loading, setLoading] = useState(false)  

  React.useEffect(() => {  
    if (item) setFormData(item)  
  }, [item])  

  const validate = () => {  
    const newErrors = {}  
    if (!formData.codigo.trim()) newErrors.codigo = 'Requerido'  
    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido'  
    if (!formData.unidad.trim()) newErrors.unidad = 'Requerido'  
    if (formData.precio < 0) newErrors.precio = 'Debe ser >= 0'  
    setErrors(newErrors)  
    return Object.keys(newErrors).length === 0  
  }  

  const isUniqueCode = async (code, excludeId = null) => {  
    const { count } = await supabase  
      .from('items')  
      .select('*', { count: 'exact', head: true })  
      .eq('codigo', code)  
      .neq('id', excludeId)  
    return count === 0  
  }  

  const handleSubmit = async (e) => {  
    e.preventDefault()  
    if (!validate()) return  

    // Check unique code  
    if (!(await isUniqueCode(formData.codigo, item?.id))) {  
      setErrors({ codigo: 'Código ya existe' })  
      return  
    }  

    setLoading(true)  
    let result  
    const dataToSave = { ...formData, updated_at: new Date().toISOString() }  

    if (item) {  
      const { error } = await supabase.from('items').update(dataToSave).eq('id', item.id)  
      result = !error  
      if (!error) await addAuditLog('UPDATE', 'items', item.id, dataToSave)  
    } else {  
      const { data, error } = await supabase.from('items').insert([dataToSave])  
      result = !error && data  
      if (!error) await addAuditLog('CREATE', 'items', data[0].id, dataToSave)  
    }  

    if (result) {  
      onSuccess()  
      onClose()  
    } else {  
      setErrors({ general: 'Error al guardar' })  
    }  
    setLoading(false)  
  }  

  return (  
    <form onSubmit={handleSubmit} className="space-y-4">  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <div>  
          <label className="block text-sm font-medium mb-1">Tipo *</label>  
          <select  
            value={formData.tipo}  
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}  
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
          >  
            {Object.values(ITEM_TYPES).map(type => (  
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>  
            ))}  
          </select>  
        </div>  
        <div>  
          <label className="block text-sm font-medium mb-1">Código *</label>  
          <input  
            type="text"  
            value={formData.codigo}  
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}  
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.codigo ? 'border-red-500' : 'border-gray-300'}`}  
          />  
          {errors.codigo && <p className="text-red-500 text-sm">{errors.codigo}</p>}  
        </div>  
      </div>  
      <div>  
        <label className="block text-sm font-medium mb-1">Nombre *</label>  
        <input  
          type="text"  
          value={formData.nombre}  
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}  
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}  
        />  
        {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}  
      </div>  
      <div>  
        <label className="block text-sm font-medium mb-1">Descripción</label>  
        <textarea  
          value={formData.descripcion}  
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}  
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
          rows={3}  
        />  
      </div>  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <div>  
          <label className="block text-sm font-medium mb-1">Unidad *</label>  
          <input  
            type="text"  
            value={formData.unidad}  
            onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}  
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.unidad ? 'border-red-500' : 'border-gray-300'}`}  
          />  
          {errors.unidad && <p className="text-red-500 text-sm">{errors.unidad}</p>}  
        </div>  
        <div className="relative">  
          <label className="block text-sm font-medium mb-1">Precio *</label>  
          <div className="flex">  
            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">S/</span>  
            <input  
              type="number"  
              step="0.01"  
              value={formData.precio}  
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}  
              className={`flex-1 px-3 py-2 border border-gray-300 rounded-none rounded-r-lg focus:ring-2 focus:ring-blue-500 ${errors.precio ? 'border-red-500' : ''}`}  
            />  
          </div>  
          {errors.precio && <p className="text-red-500 text-sm">{errors.precio}</p>}  
        </div>  
      </div>  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <div>  
          <label className="block text-sm font-medium mb-1">Moneda</label>  
          <select  
            value={formData.moneda}  
            onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}  
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
          >  
            <option value="PEN">PEN</option>  
            <option value="USD">USD</option>  
          </select>  
        </div>  
        <div className="flex items-center space-x-2">  
          <input  
            type="checkbox"  
            id="aplica_impuesto"  
            checked={formData.aplica_impuesto}  
            onChange={(e) => setFormData({ ...formData, aplica_impuesto: e.target.checked })}  
            className="rounded"  
          />  
          <label htmlFor="aplica_impuesto" className="text-sm">Aplica Impuesto (18%)</label>  
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
          {loading ? 'Guardando...' : (item ? 'Actualizar' : 'Crear')}  
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

export default ItemForm