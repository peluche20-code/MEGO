import axios from 'axios'  

const EVOLUTION_BASE_URL = 'http://localhost:8080' // Cambia por tu instancia de Evolution API  
const INSTANCE_NAME = 'tu-instancia' // Nombre de tu instancia en Evolution  
let apiKey = null // Placeholder - obtén de config o env  

// Función para setear API key  
export const setEvolutionApiKey = (key) => {  
  apiKey = key  
}  

// Enviar mensaje de texto  
export const sendWhatsAppText = async (phoneNumber, message) => {  
  if (!apiKey || !phoneNumber) {  
    throw new Error('API Key o número requerido')  
  }  

  try {  
    const response = await axios.post(`${EVOLUTION_BASE_URL}/${INSTANCE_NAME}/send-message`, {  
      number: phoneNumber,  
      textMessage: {  
        text: message  
      }  
    }, {  
      headers: {  
        'Content-Type': 'application/json'  
      }  
    })  
    return response.data  
  } catch (error) {  
    console.error('Error Evolution API:', error)  
    throw error  
  }  
}  

// Enviar PDF adjunto  
export const sendWhatsAppPDF = async (phoneNumber, pdfBlob, fileName = 'cotizacion.pdf') => {  
  if (!apiKey || !phoneNumber || !pdfBlob) {  
    throw new Error('API Key, número o PDF requerido')  
  }  

  try {  
    const formData = new FormData()  
    formData.append('number', phoneNumber)  
    formData.append('documentMessage', pdfBlob, fileName)  

    const response = await axios.post(`${EVOLUTION_BASE_URL}/${INSTANCE_NAME}/send-document`, formData, {  
      headers: {  
        'Content-Type': 'multipart/form-data'  
      }  
    })  
    return response.data  
  } catch (error) {  
    console.error('Error enviando PDF:', error)  
    throw error  
  }  
}  

// Obtener estado de instancia  
export const getInstanceStatus = async () => {  
  if (!apiKey) throw new Error('API Key requerida')  
  try {  
    const response = await axios.get(`${EVOLUTION_BASE_URL}/${INSTANCE_NAME}/getInstance`)  
    return response.data  
  } catch (error) {  
    console.error('Error status:', error)  
    throw error  
  }  
}