import React, { useState, useEffect } from 'react'  
import { motion } from 'framer-motion'  
import { Package, Search, Plus, Edit, Trash2 } from 'lucide-react'  
import { supabase } from '../utils/supabase'  
import { ITEM_TYPES } from '../types/enums'  
import ItemForm from './ItemForm'  

const CatItemList = () => {  
  const [items, setItems] = useState([])  
  const [loading, setLoading] = useState(true)  
  const [showForm, setShowForm] = useState(false)  
  const [editingItem, setEditingItem] = useState(null)  
  const [search, setSearch] = useState('')  
  const [filterType, setFilterType] = useState('all')  

  useEffect(() => {  
    fetchItems()  
  }, [])  

  const fetchItems = async () => {  
    let query = supabase  
      .from('items')  
      .select('*')  
      .eq('activo', true)  
      .order('nombre', { ascending: true })  

    if (filterType !== 'all') {  
      query = query.eq('tipo', filterType)  
    }  

    if (search) {  
      query = query.or(`nombre.ilike.%${search}%,codigo.ilike.%${search}%`)  
    }  

    const { data, error } = await query  
    if (error) console.error(error)  
    else setItems(data || [])  
    setLoading(false)  
  }  

  useEffect(() => {  
    fetchItems()  
  }, [search, filterType])  

  const handleDelete = async (id) => {  
    if (window.confirm('¿Seguro que quieres eliminar este ítem?')) {  
      const { error } = await supabase  
        .from('items')  
        .update({ activo: false })  
        .eq('id', id)  
      if (error) console.error(error)  
      else fetchItems()  
    }  
  }  

  if (loading) return <div className="text-center py-8">Cargando catálogo...</div>  

  const filteredItems = items.filter(item =>  
    (filterType === 'all' || item.tipo === filterType) &&  
    (item.nombre.toLowerCase().includes(search.toLowerCase()) ||  
     item.codigo.toLowerCase().includes(search.toLowerCase()))  
  )  

  return (  
    <div>  
      <div className="flex justify-between items-center mb-6">  
        <h2 className="text-2xl font-bold flex items-center space-x-2">  
          <Package className="w-6 h-6" />  
          <span>Catálogo</span>  
        </h2>  
        <div className="flex space-x-4 items-center">  
          <select  
            value={filterType}  
            onChange={(e) => setFilterType(e.target.value)}  
            className="px-4 py-2 border border-gray-300 rounded-lg"  
          >  
            <option value="all">Todos</option>  
            <option value="articulo">Artículos</option>  
            <option value="servicio">Servicios</option>  
          </select>  
          <div className="relative">  
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />  
            <input  
              type="text"  
              placeholder="Buscar ítem o código..."  
              value={search}  
              onChange={(e) => setSearch(e.target.value)}  
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"  
            />  
          </div>  
          <motion.button  
            onClick={() => { setShowForm(!showForm); setEditingItem(null) }}  
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"  
            whileHover={{ scale: 1.05 }}  
            whileTap={{ scale: 0.95 }}  
          >  
            <Plus className="w-4 h-4" />  
            <span>Nuevo Ítem</span>  
          </motion.button>  
        </div>  
      </div>  

      {showForm && (  
        <motion.div  
          initial={{ opacity: 0, y: -20 }}  
          animate={{ opacity: 1, y: 0 }}  
          className="bg-white p-6 rounded-xl shadow-md mb-6"  
        >  
          <ItemForm  
            item={editingItem}  
            onClose={() => setShowForm(false)}  
            onSuccess={fetchItems}  
          />  
        </motion.div>  
      )}  

      <div className="bg-white rounded-xl shadow-md overflow-hidden">  
        <table className="w-full">  
          <thead className="bg-gray-50">  
            <tr>  
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Código</th>  
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>  
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>  
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Precio</th>  
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unidad</th>  
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>  
            </tr>  
          </thead>  
          <tbody className="divide-y divide-gray-200">  
            {filteredItems.map((item) => (  
              <motion.tr  
                key={item.id}  
                initial={{ opacity: 0 }}  
                animate={{ opacity: 1 }}  
                className="hover:bg-gray-50"  
              >  
                <td className="px-6 py-4 whitespace-nowrap font-mono">{item.codigo}</td>  
                <td className="px-6 py-4">{item.nombre}</td>  
                <td className="px-6 py-4">  
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${  
                    item.tipo === 'articulo' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'  
                  }`}>  
                    {item.tipo}  
                  </span>  
                </td>  
                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">S/ {item.precio.toFixed(2)}</td>  
                <td className="px-6 py-4 whitespace-nowrap">{item.unidad}</td>  
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">  
                  <button  
                    onClick={() => { setEditingItem(item); setShowForm(true) }}  
                    className="text-blue-600 hover:text-blue-900"  
                  >  
                    <Edit className="w-4 h-4 inline" />  
                  </button>  
                  <button  
                    onClick={() => handleDelete(item.id)}  
                    className="text-red-600 hover:text-red-900"  
                  >  
                    <Trash2 className="w-4 h-4 inline" />  
                  </button>  
                </td>  
              </motion.tr>  
            ))}  
          </tbody>  
        </table>  
        {filteredItems.length === 0 && (  
          <div className="text-center py-8 text-gray-500">No hay ítems que mostrar</div>  
        )}  
      </div>  
    </div>  
  )  
}  

export default CatItemList