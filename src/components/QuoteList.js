import React, { useState, useEffect } from 'react'  
import { motion } from 'framer-motion'  
import { FileText, Search, Plus, Edit, Trash2, Download, Eye, FileText as ExcelIcon } from 'lucide-react'  
import { supabase } from '../utils/supabase'  
import { QUOTE_STATUS } from '../types/enums'  
import QuoteForm from './QuoteForm'  
import PDFPreview from './PDFPreview'  
import { ExportProgress } from './ProgressBar'  
import { exportQuotes } from '../utils/excelExport'  

const QuoteList = () => {  
  const [quotes, setQuotes] = useState([])  
  const [loading, setLoading] = useState(true)  
  const [showForm, setShowForm] = useState(false)  
  const [editingQuote, setEditingQuote] = useState(null)  
  const [search, setSearch] = useState('')  
  const [filterStatus, setFilterStatus] = useState('all')  
  const [selectedQuote, setSelectedQuote] = useState(null)  
  const [showPreview, setShowPreview] = useState(false)  
  const [exporting, setExporting] = useState(false)  
  const [progress, setProgress] = useState(0)  
  const [currentStage, setCurrentStage] = useState(0)  

  useEffect(() => {  
    fetchQuotes()  
  }, [])  

  const fetchQuotes = async () => {  
    let query = supabase  
      .from('quotes')  
      .select(`*, customer:customers(razon_social, ruc, direccion_fiscal, telefono, email)`)  
      .order('created_at', { ascending: false })  

    if (filterStatus !== 'all') {  
      query = query.eq('estado', filterStatus)  
    }  

    if (search) {  
      query = query.or(`correlativo.ilike.%${search}%,customer.razon_social.ilike.%${search}%`)  
    }  

    const { data, error } = await query  
    if (error) console.error(error)  
    else setQuotes(data || [])  
    setLoading(false)  
  }  

  useEffect(() => {  
    fetchQuotes()  
  }, [search, filterStatus])  

  const handleDelete = async (id) => {  
    if (window.confirm('¿Seguro que quieres eliminar esta cotización?')) {  
      const { error } = await supabase.from('quotes').delete().eq('id', id)  
      if (error) console.error(error)  
      else fetchQuotes()  
    }  
  }  

  const handleExportExcel = () => {  
    exportQuotes(quotes)  
  }  

  const simulateProgress = (targetProgress, delay = 1000) => {  
    return new Promise(resolve => {  
      const interval = setInterval(() => {  
        setProgress(prev => {  
          const next = Math.min(prev + 10, targetProgress)  
          if (next >= targetProgress) {  
            clearInterval(interval)  
            resolve()  
          }  
          return next  
        })  
      }, 100)  
      setTimeout(resolve, delay)  
    })  
  }  

  const fetchQuoteDetails = async (quoteId) => {  
    setExporting(true)  
    setProgress(0)  
    setCurrentStage(0)  

    await simulateProgress(25, 800)  
    setCurrentStage(1)  

    const { data: quoteData } = await supabase  
      .from('quotes')  
      .select('*, customer:customers(*)')  
      .eq('id', quoteId)  
      .single()  

    const { data: itemsData } = await supabase  
      .from('quote_items')  
      .select('*')  
      .eq('quote_id', quoteId)  
      .order('orden')  

    await simulateProgress(50, 600)  
    setCurrentStage(2)  

    const { data: companyData } = await supabase  
      .from('company_profile')  
      .select('*')  
      .single()  

    setSelectedQuote({ ...quoteData, quoteItems: itemsData || [], companyProfile: companyData })  

    await simulateProgress(75, 1200)  
    setCurrentStage(3)  

    await simulateProgress(100, 500)  
    setCurrentStage(4)  
    setExporting(false)  
  }  

  const handlePreview = async (quoteId) => {  
    await fetchQuoteDetails(quoteId)  
    setShowPreview(true)  
  }  

  const handleDownloadFromPreview = (pageSize, orientation) => {  
    if (selectedQuote) {  
      // Trigger download  
      const tempDiv = document.createElement('div')  
      document.body.appendChild(tempDiv)  
      ReactDOM.render(  
        <QuotePDF  
          quote={selectedQuote}  
          quoteItems={selectedQuote.quoteItems}  
          companyProfile={selectedQuote.companyProfile}  
          pageSize={pageSize}  
          orientation={orientation}  
          onComplete={() => {  
            ReactDOM.unmountComponentAtNode(tempDiv)  
            document.body.removeChild(tempDiv)  
          }}  
        />,  
        tempDiv  
      )  
    }  
  }  

  const exportOverlay = exporting && (  
    <motion.div  
      initial={{ opacity: 0 }}  
      animate={{ opacity: 1 }}  
      exit={{ opacity: 0 }}  
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"  
    >  
      <ExportProgress progress={progress} stage={currentStage} />  
    </motion.div>  
  )  

  if (loading) return <div className="text-center py-8">Cargando cotizaciones...</div>  

  return (  
    <>  
      <div className="space-y-6">  
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">  
          <h2 className="text-2xl font-bold flex items-center space-x-2">  
            <FileText className="w-6 h-6" />  
            <span>Cotizaciones</span>  
          </h2>  
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">  
            <div className="relative flex-1 sm:w-64">  
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />  
              <input  
                type="text"  
                placeholder="Buscar por correlativo o cliente..."  
                value={search}  
                onChange={(e) => setSearch(e.target.value)}  
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"  
              />  
            </div>  
            <div className="flex flex-col sm:flex-row gap-2">  
              <select  
                value={filterStatus}  
                onChange={(e) => setFilterStatus(e.target.value)}  
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"  
              >  
                <option value="all">Todos</option>  
                <option value="borrador">Borradores</option>  
                <option value="generada">Generadas</option>  
              </select>  
              <motion.button  
                onClick={() => { setShowForm(!showForm); setEditingQuote(null) }}  
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2 w-full sm:w-auto justify-center"  
                whileHover={{ scale: 1.05 }}  
                whileTap={{ scale: 0.95 }}  
              >  
                <Plus className="w-4 h-4" />  
                <span>Nueva Cotización</span>  
              </motion.button>  
              {/* Botón Export Excel */}  
              <motion.button  
                onClick={handleExportExcel}  
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center space-x-2 w-full sm:w-auto justify-center"  
                whileHover={{ scale: 1.05 }}  
                whileTap={{ scale: 0.95 }}  
                disabled={quotes.length === 0}  
              >  
                <ExcelIcon className="w-4 h-4" />  
                <span>Excel</span>  
              </motion.button>  
            </div>  
          </div>  
        </div>  

        {showForm && (  
          <motion.div  
            initial={{ opacity: 0, y: -20 }}  
            animate={{ opacity: 1, y: 0 }}  
            className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6"  
          >  
            <QuoteForm  
              quote={editingQuote}  
              onClose={() => setShowForm(false)}  
              onSuccess={fetchQuotes}  
            />  
          </motion.div>  
        )}  

        {quotes.length > 0 ? (  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">  
            {quotes.map((quote) => (  
              <motion.div  
                key={quote.id}  
                initial={{ opacity: 0, y: 20 }}  
                animate={{ opacity: 1, y: 0 }}  
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border"  
              >  
                <div className="space-y-3">  
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{quote.correlativo || 'Borrador'}</h3>  
                  <p className="text-sm text-gray-600">{quote.customer.razon_social}</p>  
                  <div className="flex items-center justify-between">  
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${  
                      quote.estado === 'generada'  
                        ? 'bg-green-100 text-green-800'  
                        : 'bg-yellow-100 text-yellow-800'  
                    }`}>  
                      {quote.estado === 'generada' ? 'Generada' : 'Borrador'}  
                    </span>  
                    <span className="text-right font-semibold text-green-600 text-sm">S/ {quote.total.toFixed(2)}</span>  
                  </div>  
                  <p className="text-xs text-gray-500">{new Date(quote.created_at).toLocaleDateString()}</p>  
                  <div className="flex justify-end space-x-2 pt-2">  
                    {quote.estado === 'generada' && (  
                      <motion.button  
                        onClick={() => handlePreview(quote.id)}  
                        disabled={exporting}  
                        className="p-2 text-blue-600 hover:text-blue-900 rounded hover:bg-blue-50 transition disabled:opacity-50"  
                        whileHover={exporting ? {} : { scale: 1.05 }}  
                        title="Previsualizar PDF"  
                      >  
                        <Eye className="w-4 h-4" />  
                      </motion.button>  
                    )}  
                    {quote.estado === 'borrador' && (  
                      <button  
                        onClick={() => { setEditingQuote(quote); setShowForm(true) }}  
                        className="p-2 text-blue-600 hover:text-blue-900 rounded hover:bg-blue-50 transition"  
                      >  
                        <Edit className="w-4 h-4" />  
                      </button>  
                    )}  
                    <button  
                      onClick={() => handleDelete(quote.id)}  
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
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />  
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay cotizaciones aún</h3>  
            <p className="text-gray-500">Crea tu primera para ver acción.</p>  
          </div>  
        )}  
      </div>  

      {showPreview && selectedQuote && (  
        <PDFPreview  
          quote={selectedQuote}  
          quoteItems={selectedQuote.quoteItems}  
          companyProfile={selectedQuote.companyProfile}  
          onClose={() => setShowPreview(false)}  
          onDownload={handleDownloadFromPreview}  
        />  
      )}  

      {exportOverlay}  
    </>  
  )  
}  

export default QuoteList