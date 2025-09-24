import React, { useState, useEffect } from 'react'  
import { motion } from 'framer-motion'  
import { Users, Search, Plus, Edit, Trash2, FileText, Upload, AlertCircle } from 'lucide-react'  
import { supabase } from '../utils/supabase'  
import ClientForm from './ClientForm'  
import { readExcelFile, importClients, handleImportErrors } from '../utils/excelImport'  

const ClientList = () => {  
  const [clients, setClients] = useState([])  
  const [loading, setLoading] = useState(true)  
  const [showForm, setShowForm] = useState(false)  
  const [editingClient, setEditingClient] = useState(null)  
  const [search, setSearch] = useState('')  
  const [importing, setImporting] = useState(false)  
  const [importError, setImportError] = useState('')  
  const [importFile, setImportFile] = useState(null)  
  const [importResult, setImportResult] = useState(null)  

  useEffect(() => {  
    fetchClients()  
  }, [])  

  const fetchClients = async () => {  
    let query = supabase.from('customers').select('*').order('razon_social', { ascending: true })  
    if (search) {  
      query = query.ilike('razon_social', `%${search}%`)  
    }  
    const { data, error } = await query  
    if (error) console.error(error)  
    else setClients(data || [])  
    setLoading(false)  
  }  

  useEffect(() => {  
    fetchClients()  
  }, [search])  

  const handleFileChange = (e) => {  
    const file = e.target.files[0]  
    if (file && file.name.toLowerCase().endsWith('.xlsx')) {  
      setImportFile(file)  
      setImportError('')  
      setImportResult(null)  
    } else {  
      setImportError('Solo archivos .xlsx permitidos')  
      setImportFile(null)  
      setImportResult(null)  
    }  
  }  

  const handleImport = async () => {  
    if (!importFile) {  
      setImportError('Selecciona un archivo')  
      return  
    }  
    setImporting(true)  
    setImportError('')  
    setImportResult(null)  
    try {  
      const { data } = await readExcelFile(importFile)  
      const result = await importClients(data)  
      setImportResult(result)  
      if (result.rollback) {  
        handleImportErrors(result, 'Clientes')  
      } else {  
        alert(`¡Éxito! ${result.success} clientes importados de ${result.total}.`)  
        fetchClients()  
      }  
      setImportFile(null) // Reset file  
    } catch (error) {  
      setImportError(error.message)  
      setImportResult(null)  
    } finally {  
      setImporting(false)  
    }  
  }  

  const handleDelete = async (id) => {  
    if (window.confirm('¿Seguro que quieres eliminar este cliente?')) {  
      const { error } = await supabase.from('customers').delete().eq('id', id)  
      if (error) console.error(error)  
      else fetchClients()  
    }  
  }  

  const filteredClients = clients.filter(client =>  
    client.razon_social.toLowerCase().includes(search.toLowerCase())  
  )  

  if (loading) return <div className="text-center py-8">Cargando clientes...</div>  

  return (  
    <div className="space-y-6">  
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">  
        <h2 className="text-2xl font-bold flex items-center space-x-2">  
          <Users className="w-6 h-6" />  
          <span>Clientes</span>  
        </h2>  
        <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">  
          <div className="relative flex-1 sm:w-64">  
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />  
            <input  
              type="text"  
              placeholder="Buscar cliente..."  
              value={search}  
              onChange={(e) => setSearch(e.target.value)}  
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"  
            />  
          </div>  
          <div className="flex flex-col sm:flex-row gap-2">  
            <motion.button  
              onClick={() => { setShowForm(!showForm); setEditingClient(null) }}  
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2 w-full sm:w-auto justify-center"  
              whileHover={{ scale: 1.05 }}  
              whileTap={{ scale: 0.95 }}  
            >  
              <Plus className="w-4 h-4" />  
              <span>Nuevo Cliente</span>  
            </motion.button>  
            {/* Import Excel Button con rollback feedback */}  
            <div className="relative flex-1 sm:flex-none">  
              <label className="bg-purple-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-600 flex items-center justify-center w-full sm:w-auto">  
                <Upload className="w-4 h-4 mr-2" />  
                Importar Excel  
                <input  
                  type="file"  
                  accept=".xlsx"  
                  onChange={handleFileChange}  
                  className="hidden"  
                />  
              </label>  
              {importFile && !importing && (  
                <div className="bg-indigo-50 p-2 rounded-lg mt-1">  
                  <motion.button  
                    onClick={handleImport}  
                    className="w-full bg-indigo-500 text-white px-3 py-1 rounded text-sm flex items-center justify-center space-x-2 hover:bg-indigo-600"  
                    whileHover={{ scale: 1.02 }}  
                  >  
                    <FileText className="w-3 h-3" />  
                    <span>Procesar {importFile.name.split('.')[0]}</span>  
                  </motion.button>  
                </div>  
              )}  
              {importing && (  
                <div className="bg-blue-50 p-2 rounded-lg mt-1 animate-pulse">  
                  <div className="flex items-center justify-center space-x-2 text-blue-600">  
                    <Loader2 className="w-4 h-4 animate-spin" />  
                    <span className="text-sm">Procesando...</span>  
                  </div>  
                </div>  
              )}  
              {importError && (  
                <div className="bg-red-50 p-2 rounded-lg mt-1">  
                  <div className="flex items-center text-red-600 text-sm">  
                    <AlertCircle className="w-4 h-4 mr-2" />  
                    <span>{importError}</span>  
                  </div>  
                </div>  
              )}  
              {importResult && (  
                <div className={`p-2 rounded-lg mt-1 ${importResult.success > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>  
                  <p className="text-sm text-gray-700">{importResult.success}/{importResult.total} importados. {importResult.errors.length > 0 ? `${importResult.errors.length} errores (rollback aplicado)` : '¡Éxito!'}</p>  
                  {importResult.errors.length > 0 && (  
                    <details className="mt-1 text-xs text-gray-600">  
                      <summary>Ver errores</summary>  
                      <ul className="list-disc list-inside mt-1">  
                        {importResult.errors.map((e, idx) => (  
                          <li key={idx}>{`Fila ${e.row}: ${e.errors.join(', ')}`}</li>  
                        ))}  
                      </ul>  
                    </details>  
                  )}  
                </div>  
              )}  
            </div>  
          </div>  
        </div>  
      </div>  

      {showForm && (  
        <motion.div  
          initial={{ opacity: 0, y: -20 }}  
          animate={{ opacity: 1, y: 0 }}  
          className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6"  
        >  
          <ClientForm  
            client={editingClient}  
            onClose={() => setShowForm(false)}  
            onSuccess={fetchClients}  
          />  
        </motion.div>  
      )}  

      {filteredClients.length > 0 ? (  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">  
          {filteredClients.map((client) => (  
            <motion.div  
              key={client.id}  
              initial={{ opacity: 0, y: 20 }}  
              animate={{ opacity: 1, y: 0 }}  
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border"  
            >  
              <div className="space-y-2">  
                <h3 className="font-semibold text-gray-900">{client.razon_social}</h3>  
                <p className="text-sm text-gray-600"><span className="font-medium">RUC:</span> {client.ruc}</p>  
                <p className="text-sm text-gray-600"><span className="font-medium">Dirección:</span> {client.direccion_fiscal}</p>  
                <div className="flex flex-wrap gap-2 mt-3">  
                  {client.telefono && (  
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{client.telefono}</span>  
                  )}  
                  {client.email && (  
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs truncate max-w-32">{client.email}</span>  
                  )}  
                </div>  
                <div className="flex justify-end space-x-2 mt-4">  
                  <button  
                    onClick={() => { setEditingClient(client); setShowForm(true) }}  
                    className="p-2 text-blue-600 hover:text-blue-900 rounded hover:bg-blue-50 transition"  
                  >  
                    <Edit className="w-4 h-4" />  
                  </button>  
                  <button  
                    onClick={() => handleDelete(client.id)}  
                    className="p-2 text-red-600 hover:text-red-900 rounded hover:bg-red-50 transition"  
                  >  
                    <Trash2 className="w-4 h-4" />  
                  </button>  
                </div>  
              </div>  
            </motion.div>  
          ))}  
        </div>  
      ) : (  
        <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">  
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />  
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay clientes aún</h3>  
          <p className="text-gray-500">¡Importa desde Excel o agrega uno nuevo!</p>  
        </div>  
      )}  
    </div>  
  )  
}  

export default ClientList