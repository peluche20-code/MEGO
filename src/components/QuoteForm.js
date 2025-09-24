import React, { useState, useEffect } from 'react'  
import { motion } from 'framer-motion'  
import { FileText, Users, Plus, Trash2, Check } from 'lucide-react'  
import { supabase } from '../utils/supabase'  
import { calculateQuoteTotals, calculateItemTotals } from '../utils/calculations'  
import { QUOTE_STATUS } from '../types/enums'  
import { calculateCorrelative, addAuditLog } from '../utils/authHelpers'  

const QuoteForm = ({ quote, onClose, onSuccess }) => {  
  const [clients, setClients] = useState([])  
  const [items, setItems] = useState([])  
  const [formData, setFormData] = useState({  
    customer_id: '',  
    estado: QUOTE_STATUS.BORRADOR,  
    fecha_emision: new Date().toISOString().split('T')[0],  
    validez_dias: 15,  
    moneda: 'PEN',  
    subtotal: 0,  
    impuesto: 0,  
    total: 0,  
    notas: '',  
    condiciones: ''  
  })  
  const [quoteItems, setQuoteItems] = useState([])  
  const [errors, setErrors] = useState({})  
  const [loading, setLoading] = useState(false)  
  const [selectedClient, setSelectedClient] = useState(null)  

  useEffect(() => {  
    fetchInitialData()  
  }, [])  

  useEffect(() => {  
    if (quote) {  
      setFormData({  
        customer_id: quote.customer_id,  
        estado: quote.estado,  
        fecha_emision: quote.fecha_emision || new Date().toISOString().split('T')[0],  
        validez_dias: quote.validez_dias,  
        moneda: quote.moneda,  
        subtotal: quote.subtotal,  
        impuesto: quote.impuesto,  
        total: quote.total,  
        notas: quote.notas || '',  
        condiciones: quote.condiciones || ''  
      })  
      setQuoteItems(quote.quote_items || [])  
      setSelectedClient(quote.customer)  
    } else {  
      setFormData({  
        customer_id: '',  
        estado: QUOTE_STATUS.BORRADOR,  
        fecha_emision: new Date().toISOString().split('T')[0],  
        validez_dias: 15,  
        moneda: 'PEN',  
        subtotal: 0,  
        impuesto: 0,  
        total: 0,  
        notas: '',  
        condiciones: ''  
      })  
      setQuoteItems([])  
      setSelectedClient(null)  
    }  
  }, [quote])  

  const fetchInitialData = async () => {  
    const [clientsRes, itemsRes] = await Promise.all([  
      supabase.from('customers').select('*').order('razon_social'),  
      supabase.from('items').select('*').eq('activo', true).order('nombre')  
    ])  
    setClients(clientsRes.data || [])  
    setItems(itemsRes.data || [])  
  }  

  const addQuoteItem = (item) => {  
    const newItem = {  
      ...item,  
      id: Date.now() + Math.random(),  
      cantidad: 1,  
      descuento_tipo: '%',  
      descuento_valor: 0,  
      subtotal: item.precio,  
      impuesto: item.aplica_impuesto ? item.precio * 0.18 : 0,  
      total: item.aplica_impuesto ? item.precio * 1.18 : item.precio,  
      orden: quoteItems.length  
    }  
    setQuoteItems(prev => [...prev, newItem])  
    updateTotals()  
  }  

  const updateQuoteItem = (id, updates) => {  
    setQuoteItems(prev => {  
      const newItems = prev.map(item =>  
        item.id === id ? { ...item, ...updates } : item  
      )  
      updateTotals(newItems)  
      return newItems  
    })  
  }  

  const removeQuoteItem = (id) => {  
    setQuoteItems(prev => {  
      const newItems = prev.filter(item => item.id !== id)  
      updateTotals(newItems)  
      return newItems  
    })  
  }  

  const updateTotals = (items = quoteItems) => {  
    const { subtotal, impuesto, total } = calculateQuoteTotals(items)  
    setFormData(prev => ({ ...prev, subtotal, impuesto, total }))  
  }  

  const handleSubmit = async (e) => {  
    e.preventDefault()  
    setErrors({})  
    if (!formData.customer_id || quoteItems.length === 0) {  
      setErrors({ general: 'Cliente y al menos 1 ítem requeridos' })  
      return  
    }  

    setLoading(true)  
    try {  
      let result  
      if (quote) {  
        if (formData.estado === QUOTE_STATUS.GENERADA) {  
          // No editar items en generada  
          const { error } = await supabase  
            .from('quotes')  
            .update({  
              notas: formData.notas,  
              condiciones: formData.condiciones,  
              updated_at: new Date().toISOString()  
            })  
            .eq('id', quote.id)  
          result = !error  
        } else {  
          // Actualizar completo  
          const { error } = await supabase  
            .from('quotes')  
            .update({ ...formData, updated_at: new Date().toISOString() })  
            .eq('id', quote.id)  
          result = !error  
          if (!error) {  
            await supabase.from('quote_items').delete().eq('quote_id', quote.id)  
            await supabase.from('quote_items').insert(quoteItems)  
          }  
        }  
      } else {  
        // Crear nuevo  
        const insertData = { ...formData, user_id: (await supabase.auth.getUser()).data.user?.id }  
        const { data: newQuote, error: insertError } = await supabase.from('quotes').insert([insertData]).select()  
        result = !insertError && newQuote  
        if (!insertError) {  
          const itemsToInsert = quoteItems.map(item => ({ ...item, quote_id: newQuote[0].id }))  
          await supabase.from('quote_items').insert(itemsToInsert)  
        }  
      }  

      if (result) {  
        if (formData.estado === QUOTE_STATUS.GENERADA && !quote) {  
          const correlativo = await calculateCorrelative()  
          await supabase.from('quotes').update({ correlativo }).eq('id', result.id)  
          await addAuditLog('CONFIRM', 'quotes', result.id, { correlativo })  
        } else {  
          await addAuditLog(formData.estado === QUOTE_STATUS.GENERADA ? 'CONFIRM' : 'UPDATE', 'quotes', result.id || quote.id, formData)  
        }  
        onSuccess()  
        onClose()  
      } else {  
        setErrors({ general: 'Error al guardar' })  
      }  
    } catch (error) {  
      setErrors({ general: error.message })  
    } finally {  
      setLoading(false)  
    }  
  }  

  const handleConfirm = async () => {  
    if (quoteItems.length === 0) {  
      setErrors({ general: 'Agrega al menos un ítem' })  
      return  
    }  
    const totals = calculateQuoteTotals(quoteItems)  
    const confirmData = { ...formData, estado: QUOTE_STATUS.GENERADA, ...totals }  
    setFormData(confirmData)  
    // Trigger submit  
    handleSubmit({ preventDefault: () => {} })  
  }  

  return (  
    <form onSubmit={handleSubmit} className="space-y-6">  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
        <div>  
          <label className="block text-sm font-medium mb-2">Cliente *</label>  
          <select  
            value={formData.customer_id}  
            onChange={(e) => {  
              const client = clients.find(c => c.id === e.target.value)  
              setSelectedClient(client)  
              setFormData({ ...formData, customer_id: e.target.value })  
            }}  
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
            required  
          >  
            <option value="">Seleccionar cliente</option>  
            {clients.map(client => (  
              <option key={client.id} value={client.id}>{client.razon_social}</option>  
            ))}  
          </select>  
          {selectedClient && <p className="text-sm text-gray-500 mt-1">{selectedClient.email} - {selectedClient.telefono}</p>}  
        </div>  
        <div className="grid grid-cols-2 gap-4">  
          <div>  
            <label className="block text-sm font-medium mb-1">Fecha Emisión</label>  
            <input  
              type="date"  
              value={formData.fecha_emision}  
              onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}  
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
            />  
          </div>  
          <div>  
            <label className="block text-sm font-medium mb-1">Validez (días)</label>  
            <input  
              type="number"  
              min="1"  
              value={formData.validez_dias}  
              onChange={(e) => setFormData({ ...formData, validez_dias: parseInt(e.target.value) })}  
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
            />  
          </div>  
        </div>  
      </div>  

      <div className="border-t pt-6">  
        <h3 className="text-lg font-semibold mb-4">Ítems de Cotización</h3>  
        {quoteItems.length === 0 ? (  
          <div className="bg-gray-50 p-6 rounded-lg text-center">  
            <p className="text-gray-500 mb-4">Agrega ítems del catálogo</p>  
            <div className="space-y-2">  
              {items.slice(0, 6).map(item => (  
                <motion.button  
                  key={item.id}  
                  onClick={() => addQuoteItem(item)}  
                  className="w-full p-3 bg-white border rounded-lg hover:bg-gray-50 flex items-center space-x-3 text-left"  
                  whileHover={{ scale: 1.02 }}  
                >  
                  <Package className="w-4 h-4 text-gray-400" />  
                  <span className="font-medium">{item.nombre}</span>  
                  <span className="text-sm text-green-600">{item.moneda} {item.precio}</span>  
                </motion.button>  
              ))}  
            </div>  
          </div>  
        ) : (  
          <div className="space-y-3">  
            {quoteItems.map((item) => (  
              <motion.div  
                key={item.id}  
                className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0"  
                whileHover={{ scale: 1.02 }}  
              >  
                <div className="flex-1">  
                  <h4 className="font-medium">{item.nombre}</h4>  
                  <p className="text-sm text-gray-600">{item.descripcion}</p>  
                </div>  
                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-right">  
                  <div>  
                    <label className="text-xs">Cant.</label>  
                    <input  
                      type="number"  
                      min="1"  
                      value={item.cantidad}  
                      onChange={(e) => updateQuoteItem(item.id, { cantidad: parseInt(e.target.value) })}  
                      className="w-12 px-1 py-1 border rounded text-right"  
                    />  
                  </div>  
                  <div className="text-sm">  
                    {formData.moneda} {item.precio_unitario.toFixed(2)}  
                  </div>  
                  <div className="text-sm font-semibold text-green-600">  
                    {formData.moneda} {item.total.toFixed(2)}  
                  </div>  
                  <button  
                    onClick={() => removeQuoteItem(item.id)}  
                    className="p-1 text-red-500 hover:text-red-700"  
                  >  
                    <Trash2 className="w-4 h-4" />  
                  </button>  
                </div>  
              </motion.div>  
            ))}  
            <div className="bg-gray-50 p-4 rounded-lg">  
              <h4 className="font-semibold mb-2">Agregar nuevo ítem</h4>  
              <div className="space-y-2">  
                {items.slice(0, 6).filter(item => !quoteItems.some(qi => qi.item_id === item.id)).map(item => (  
                  <motion.button  
                    key={item.id}  
                    onClick={() => addQuoteItem(item)}  
                    className="w-full p-3 bg-white border rounded-lg hover:bg-gray-50 flex items-center space-x-3 text-left"  
                    whileHover={{ scale: 1.02 }}  
                  >  
                    <Package className="w-4 h-4 text-gray-400" />  
                    <span className="font-medium">{item.nombre}</span>  
                    <span className="text-sm text-green-600">{item.moneda} {item.precio}</span>  
                  </motion.button>  
                ))}  
                <p className="text-sm text-gray-500">Mostrando primeros 6. Usa el catálogo completo para más.</p>  
              </div>  
            </div>  
          </div>  
        )}  
      </div>  

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
        <div>  
          <label className="block text-sm font-medium mb-2">Moneda</label>  
          <select  
            value={formData.moneda}  
            onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}  
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
          >  
            <option value="PEN">PEN (S/)</option>  
            <option value="USD">USD ($)</option>  
          </select>  
        </div>  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
          <div className="col-span-1 md:col-span-2">  
            <label className="block text-sm font-medium mb-2">Notas</label>  
            <textarea  
              value={formData.notas}  
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}  
              rows={3}  
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
              placeholder="Notas adicionales..."  
            />  
          </div>  
          <div className="col-span-1">  
            <label className="block text-sm font-medium mb-2">Condiciones</label>  
            <textarea  
              value={formData.condiciones}  
              onChange={(e) => setFormData({ ...formData, condiciones: e.target.value })}  
              rows={3}  
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"  
              placeholder="Términos y condiciones..."  
            />  
          </div>  
        </div>  
      </div>  

      {formData.subtotal > 0 && (  
        <div className="bg-gray-50 p-4 rounded-lg">  
          <div className="flex justify-between text-sm">  
            <span>Subtotal:</span>  
            <span>{formData.moneda} {formData.subtotal.toFixed(2)}</span>  
          </div>  
          <div className="flex justify-between text-sm">  
            <span>Impuesto (18%):</span>  
            <span>{formData.moneda} {formData.impuesto.toFixed(2)}</span>  
          </div>  
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">  
            <span>Total:</span>  
            <span className="text-green-600">{formData.moneda} {formData.total.toFixed(2)}</span>  
          </div>  
        </div>  
      )}  

      {errors.general && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">  
        {errors.general}  
      </div>}  

      <div className="flex flex-col sm:flex-row gap-4">  
        <motion.button  
          type="button"  
          onClick={onClose}  
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"  
          whileHover={{ scale: 1.02 }}  
        >  
          Cancelar  
        </motion.button>  
        {quote && formData.estado === QUOTE_STATUS.BORRADOR ? (  
          <motion.button  
            type="button"  
            onClick={handleConfirm}  
            className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"  
            whileHover={{ scale: 1.02 }}  
          >  
            <Check className="w-4 h-4 inline mr-2" />  
            Confirmar Cotización  
          </motion.button>  
        ) : (  
          <motion.button  
            type={loading ? 'button' : 'submit'}  
            disabled={loading}  
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"  
            whileHover={{ scale: 1.02 }}  
          >  
            {loading ? 'Guardando...' : (quote ? 'Actualizar' : 'Crear Cotización')}  
          </motion.button>  
        )}  
      </div>  
    </form>  
  )  
}  

export default QuoteForm