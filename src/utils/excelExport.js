import * as XLSX from 'xlsx'  

export const exportToExcel = (data, sheetName, fileName) => {  
  // Crear workbook  
  const wb = XLSX.utils.book_new()  
  const ws = XLSX.utils.json_to_sheet(data)  

  // Estilos básicos (headers bold)  
  const headerStyle = {  
    font: { bold: true },  
    alignment: { horizontal: 'center' }  
  }  

  // Aplicar estilos si hay headers  
  if (data.length > 0) {  
    const range = XLSX.utils.decode_range(ws['!ref'])  
    for (let C = 0; C <= range.e.c; ++C) {  
      const address = XLSX.utils.encode_col(C) + '1'  
      if (!ws[address]) continue  
      ws[address].s = headerStyle  
    }  
  }  

  // Ajustar ancho de columnas  
  const colWidths = []  
  Object.keys(ws).forEach(key => {  
    if (key[0] === '!') return  
    const col = key.charCodeAt(0) - 65  
    colWidths[col] = Math.max(colWidths[col] || 10, (key.length * 8))  
  })  
  ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 50) }))  

  XLSX.utils.book_append_sheet(wb, ws, sheetName)  
  XLSX.writeFile(wb, `${fileName}.xlsx`)  
}  

// Exportar cotizaciones específicas  
export const exportQuotes = (quotes) => {  
  const exportData = quotes.map(q => ({  
    'Correlativo': q.correlativo || 'Borrador',  
    'Cliente': q.customer?.razon_social,  
    'Estado': q.estado === 'generada' ? 'Generada' : 'Borrador',  
    'Total': q.total,  
    'Fecha': new Date(q.created_at).toLocaleDateString('es-PE'),  
    'Validez': `${q.validez_dias} días`,  
    'Moneda': q.moneda  
  }))  

  exportToExcel(exportData, 'Cotizaciones', `cotizaciones-${new Date().toISOString().split('T')[0]}`)  
}  

// Exportar clientes  
export const exportClients = (clients) => {  
  const exportData = clients.map(c => ({  
    'Razón Social': c.razon_social,  
    'RUC': c.ruc,  
    'Dirección Fiscal': c.direccion_fiscal,  
    'Teléfono': c.telefono,  
    'Email': c.email,  
    'Creado': new Date(c.created_at).toLocaleDateString('es-PE')  
  }))  

  exportToExcel(exportData, 'Clientes', `clientes-${new Date().toISOString().split('T')[0]}`)  
}  

// Exportar catálogo  
export const exportCatalog = (items) => {  
  const exportData = items.map(i => ({  
    'Tipo': i.tipo,  
    'Código': i.codigo,  
    'Nombre': i.nombre,  
    'Descripción': i.descripcion,  
    'Unidad': i.unidad,  
    'Precio': i.precio,  
    'Moneda': i.moneda,  
    'Aplica Impuesto': i.aplica_impuesto ? 'Sí' : 'No',  
    'Activo': i.activo ? 'Sí' : 'No'  
  }))  

  exportToExcel(exportData, 'Catálogo', `catalogo-${new Date().toISOString().split('T')[0]}`)  
}