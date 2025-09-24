import React from 'react'  
import { motion } from 'framer-motion'  

const ProgressBar = ({ progress = 0, stage = '', message = '' }) => {  
  return (  
    <div className="w-full bg-gray-200 rounded-full h-3">  
      <motion.div  
        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full relative overflow-hidden"  
        initial={{ width: 0 }}  
        animate={{ width: `${progress}%` }}  
        transition={{ duration: 0.5, ease: "easeOut" }}  
      >  
        <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse" />  
      </motion.div>  
    </div>  
  )  
}  

export const ExportProgress = ({ progress, stage, message }) => {  
  const stages = [  
    { step: 25, stage: 'Cargando datos...', message: 'Recogiendo info de clientes e ítems como un detective' },  
    { step: 50, stage: 'Diseñando layout...', message: 'Armando el diseño fancy con colores y todo el estilo' },  
    { step: 75, stage: 'Generando PDF...', message: 'Convertidiendo la magia en un archivo descargable' },  
    { step: 100, stage: '¡Listo!', message: 'Tu cotización está lista para impresionar' }  
  ]  

  const currentStage = stages.find(s => progress >= s.step) || stages[stages.length - 1]  

  return (  
    <motion.div  
      className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full"  
      initial={{ scale: 0.8, opacity: 0 }}  
      animate={{ scale: 1, opacity: 1 }}  
      transition={{ type: "spring", stiffness: 300, damping: 20 }}  
    >  
      <div className="text-center mb-4">  
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">  
          <motion.div  
            className="text-white text-2xl font-semibold"  
            key={currentStage.step}  
            initial={{ rotate: 0 }}  
            animate={{ rotate: 360 }}  
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}  
          >  
            {currentStage.step === 100 ? '✓' : Math.round(progress)}  
          </motion.div>  
        </div>  
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStage.stage}</h3>  
        <p className="text-sm text-gray-500">{currentStage.message}</p>  
      </div>  
      <ProgressBar progress={progress} />  
      <div className="mt-4 text-center text-xs text-gray-400">  
        Progreso: {Math.round(progress)}%  
      </div>  
    </motion.div>  
  )  
}  

export default ProgressBar