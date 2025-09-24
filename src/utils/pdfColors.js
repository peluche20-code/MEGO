export const PDF_COLORS = {  
  primary: '#1e40af', // Azul profundo para títulos y acentos  
  secondary: '#3b82f6', // Azul claro para headers  
  success: '#059669', // Verde para totales positivos  
  warning: '#d97706', // Naranja para descuentos  
  danger: '#dc2626', // Rojo para errores o highlights  
  background: '#f9fafb', // Fondo suave  
  border: '#d1d5db', // Bordes neutros  
  text: '#111827', // Texto principal  
  textSecondary: '#6b7280', // Texto secundario  
  white: '#ffffff' // Blanco puro  
}  

// Gradientes como strings CSS para inline styles  
export const PDF_GRADIENTS = {  
  headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Morado-azul para header  
  tableHeader: 'linear-gradient(to right, #f8fafc 0%, #e2e8f0 100%)', // Gris sutil para cabeceras  
  totalGradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', // Verde para totales  
  noteGradient: 'linear-gradient(to right, #fef3c7 0%, #fde68a 100%)', // Amarillo suave para notas  
  footerGradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', // Azul-gris para pie  
}  

// Para personalizar, cambia estos valores o haz un editor después  
export const getCustomColors = (companyRuc = 'default') => {  
  // En el futuro, cargar desde DB por RUC de empresa  
  switch (companyRuc) {  
    case '20123456789': // Ejemplo para tu empresa  
      return {  
        ...PDF_COLORS,  
        primary: '#8b4513', // Marrón cálido para un toque terrenal  
        secondary: '#a0522d', // Sienna para headers  
        success: '#228b22', // Verde bosque para totales  
        warning: '#ff8c00', // Naranja oscuro para descuentos  
        background: '#fdf6f0', // Crema suave  
        // Gradientes personalizados para esta empresa  
        gradients: {  
          headerGradient: 'linear-gradient(135deg, #cd853f 0%, #8b4513 100%)', // Marrón degradado  
          tableHeader: 'linear-gradient(to right, #fdf6f0 0%, #f5f5dc 100%)', // Beige sutil  
          totalGradient: 'linear-gradient(90deg, #228b22 0%, #32cd32 100%)', // Verde lima  
          noteGradient: 'linear-gradient(to right, #f4a460 0%, #ff8c00 100%)', // Naranja suave  
          footerGradient: 'linear-gradient(135deg, #fdf6f0 0%, #f5f5dc 100%)', // Beige-gris  
        }  
      }  
    default:  
      return { ...PDF_COLORS, gradients: PDF_GRADIENTS }  
  }  
}