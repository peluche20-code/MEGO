import React, { useRef, useEffect, useState } from 'react'  
import { motion } from 'framer-motion'  
import { X, Download, Printer, Send, MessageCircle, ZoomIn, ZoomOut } from 'lucide-react'  
import { jsPDF } from 'jspdf'  
import { supabase } from '../utils/supabase'  
import { PDF_COLORS, PDF_GRADIENTS, getCustomColors } from '../utils/pdfColors'  
import QuotePDF from './QuotePDF'  
import { sendWhatsAppPDF, sendWhatsAppText, setEvolutionApiKey } from '../utils/evolutionApi'  

// Config - En producción, usa env o Supabase storage  
const EVOLUTION_API_KEY = 'tu-clave-aqui' // GET OPENAI API KEY como ejemplo, pero para Evolution  
setEvolutionApiKey(EVOLUTION_API_KEY)  

const PDFPreview = ({ quote, quoteItems, companyProfile, onClose, onDownload }) => {  
  const [zoom, setZoom] = useState(1)  
  const [showContent, setShowContent] = useState(false)  
  const [printing, setPrinting] = useState(false)  
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)  
  const [pageSize, setPageSize] = useState('a4')  
  const [orientation, setOrientation] = useState('p')  
  const [previewKey, setPreviewKey] = useState(0)  
  const [whatsappNumber, setWhatsappNumber] = useState(quote.customer?.telefono || '') // Auto-fill from client  
  const [sendText, setSendText] = useState(`Hola ${quote.customer?.razon_social}, adjunto tu cotización ${quote.correlativo}. ¡Gracias por tu interés!`)  
  const [errorMessage, setErrorMessage] = useState('')  
  const previewRef = useRef()  

  useEffect(() => {  
    setWhatsappNumber(quote.customer?.telefono || '')  
    setShowContent(false)  
    const timer = setTimeout(() => setShowContent(true), 100)  
    return () => clearTimeout(timer)  
  }, [quote, previewKey])  

  const updatePreview = () => {  
    setPreviewKey(prev => prev + 1)  
  }  

  const handleDownload = (ps, orient) => {  
    onDownload(ps, orient)  
    onClose()  
  }  

  const handlePrint = async () => {  
    setPrinting(true)  
    try {  
      const colors = getCustomColors(companyProfile?.ruc)  
      const pdfBlob = await generatePDFBlob(quote, quoteItems, companyProfile, colors, pageSize, orientation)  
      const printWindow = window.open('', '_blank')  
      printWindow.document.write(`  
        <html><head><title>Imprimir - ${quote.correlativo}</title></head>  
        <body><iframe src="${URL.createObjectURL(pdfBlob)}" style="width:100%;height:100vh;border:none"></iframe>  
        <script>setTimeout(()=>{window.print();window.close()},250);</script></body></html>  
      `)  
      printWindow.document.close()  
    } catch (error) {  
      alert('¡Error al imprimir!')  
    } finally {  
      setPrinting(false)  
    }  
  }  

  const handleSendWhatsApp = async () => {  
    if (!whatsappNumber) {  
      setErrorMessage('Número de WhatsApp requerido')  
      return  
    }  

    setSendingWhatsApp(true)  
    setErrorMessage('')  
    try {  
      const colors = getCustomColors(companyProfile?.ruc)  
      const pdfBlob = await generatePDFBlob(quote, quoteItems, companyProfile, colors, pageSize, orientation)  

      // Enviar PDF  
      const sendResult = await sendWhatsAppPDF(whatsappNumber.replace(/[^0-9]/g, ''), pdfBlob, `cotizacion-${quote.correlativo}.pdf`)  

      // Enviar mensaje de texto si el PDF se envió  
      if (sendResult) {  
        await sendWhatsAppText(whatsappNumber.replace(/[^0-9]/g, ''), sendText)  
      }  

      alert('¡Cotización enviada por WhatsApp!')  
      onClose()  
    } catch (error) {  
      console.error('Error WhatsApp:', error)  
      setErrorMessage('Error: ' + error.message)  
    } finally {  
      setSendingWhatsApp(false)  
    }  
  }  

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))  
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))  

  const paperOptions = [  
    { value: 'a4', label: 'A4', icon: '📄' },  
    { value: 'letter', label: 'Carta', icon: '📝' },  
    { value: 'legal', label: 'Legal', icon: '📜' }  
  ]  

  const orientationOptions = [  
    { value: 'p', label: 'Vertical', icon: '↕️' },  
    { value: 'l', label: 'Horizontal', icon: '↔️' }  
  ]  

  // Función helper para generar PDF blob (de QuotePDF logic)  
  const generatePDFBlob = async (q, items, comp, cols, psize, orient) => {  
    const doc = new jsPDF(orient, 'mm', psize)  
    // ... (implementar lógica completa de QuotePDF aquí para generar blob)  
    return doc.output('blob')  
  }  

  if (!quote) return null  

  return (  
    <motion.div  
      initial={{ opacity: 0 }}  
      animate={{ opacity: 1 }}  
      exit={{ opacity: 0 }}  
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"  
      onClick={onClose}  
    >  
      <motion.div  
        layout  
        initial={{ scale: 0.8, opacity: 0 }}  
        animate={{ scale: 1, opacity: 1 }}  
        exit={{ scale: 0.8, opacity: 0 }}  
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col relative"  
        onClick={(e) => e.stopPropagation()}  
      >  
        {/* Header con configs y WhatsApp */}  
        <div className="p-4 border-b bg-gray-50 rounded-t-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center sticky top-0 z-10 space-y-2 lg:space-y-0">  
          <h3 className="text-lg font-semibold flex items-center space-x-2">  
            <FileText className="w-5 h-5" />  
            <span>Previsualización: {quote.correlativo}</span>  
          </h3>  
          <div className="flex flex-wrap items-center gap-4">  
            {/* Configs papel */}  
            <select value={pageSize} onChange={(e) => { setPageSize(e.target.value); updatePreview(); }} className="px-2 py-1 border rounded focus:ring-2 text-sm">  
              {paperOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}  
            </select>  
            <select value={orientation} onChange={(e) => { setOrientation(e.target.value); updatePreview(); }} className="px-2 py-1 border rounded focus:ring-2 text-sm">  
              {orientationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}  
            </select>  
          </div>  
          <div className="flex items-center space-x-2">  
            <motion.button onClick={zoomIn} className="p-2 text-gray-600 rounded-full hover:bg-gray-100" whileHover={{ scale: 1.05 }} title="Zoom In">  
              <ZoomIn className="w-4 h-4" />  
            </motion.button>  
            <motion.button onClick={zoomOut} className="p-2 text-gray-600 rounded-full hover:bg-gray-100" whileHover={{ scale: 1.05 }} title="Zoom Out">  
              <ZoomOut className="w-4 h-4" />  
            </motion.button>  
            <motion.button onClick={handlePrint} disabled={printing} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 disabled:opacity-50" whileHover={{ scale: 1.02 }}>  
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}  
              <span>Imprimir</span>  
            </motion.button>  
            {/* Botón WhatsApp */}  
            <div className="flex flex-col bg-green-50 p-2 rounded-lg border">  
              <motion.button onClick={handleSendWhatsApp} disabled={sendingWhatsApp || !whatsappNumber} className="bg-green-500 text-white px-3 py-1 rounded flex items-center space-x-1 hover:bg-green-600 disabled:opacity-50 text-sm" whileHover={{ scale: 1.02 }}>  
                {sendingWhatsApp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}  
                <span>WhatsApp</span>  
              </motion.button>  
              {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}  
              <input  
                type="text"  
                placeholder="Número WhatsApp (ej. +51 999 123 456)"  
                value={whatsappNumber}  
                onChange={(e) => setWhatsappNumber(e.target.value)}  
                className="border border-gray-300 rounded px-2 py-1 text-xs w-40"  
                disabled={sendingWhatsApp}  
              />  
              <textarea  
                placeholder="Mensaje opcional"  
                value={sendText}  
                onChange={(e) => setSendText(e.target.value)}  
                className="border border-gray-300 rounded px-2 py-1 text-xs w-40 h-12 resize-none"  
                disabled={sendingWhatsApp}  
              />  
            </div>  
            <motion.button onClick={handleDownload} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600" whileHover={{ scale: 1.02 }}>  
              <Download className="w-4 h-4" />  
              <span>Descargar</span>  
            </motion.button>  
            <motion.button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100" whileHover={{ scale: 1.1 }} title="Cerrar">  
              <X className="w-5 h-5" />  
            </motion.button>  
          </div>  
        </div>  

        {/* Contenido preview */}  
        <div ref={previewRef} className="flex-1 overflow-auto p-4">  
          {showContent ? (  
            <div className="max-w-full mx-auto border-2 border-gray-200 rounded-lg bg-white shadow-inner" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>  
              <div key={previewKey}>  
                <QuotePDF  
                  quote={quote}  
                  quoteItems={quoteItems}  
                  companyProfile={companyProfile}  
                  pageSize={pageSize}  
                  orientation={orientation}  
                  onComplete={() => console.log('Preview ready')}  
                />  
              </div>  
            </div>  
          ) : (  
            <div className="flex items-center justify-center h-64">  
              <div className="text-center">  
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />  
                <p className="text-gray-500">Generando...</p>  
              </div>  
            </div>  
          )}  
        </div>  

        <div className="p-4 border-t bg-gray-50 rounded-b-2xl text-center text-sm text-gray-500">  
          Configura y envía. WhatsApp requiere número válido y Evolution API activa.  
        </div>  
      </motion.div>  
    </motion.div>  
  )  
}  

export default PDFPreview