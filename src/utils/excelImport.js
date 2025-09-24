import * as XLSX from 'xlsx'  
import { supabase } from './supabase'  

// Leer y parsear Excel  
export const readExcelFile = (file) => {  
  return new Promise((resolve, reject) => {  
    const reader = new FileReader()  
    reader.onload = (e) => {  
      try {  
        const data = new Uint8Array(e.target.result)  
        const workbook = XLSX.read(data, { type: 'array' })  
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]  
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)  
        resolve({ data: jsonData, filename: file.name, sheet: workbook.SheetNames[0] })  
      } catch (error) {  
        reject(new Error('Archivo Excel inválido'))  
      }  
    }  
    reader.onerror = () => reject(new Error('Error al leer archivo'))  
    reader.readAsArrayBuffer(file)  
  })  
}  

// Validar datos en batch  
const validateImportData = (data, type) => {  
  const errors = []  
  const validData = []  

  data.forEach((row, index) => {  
    const rowErrors = []  
    const newRow = {}  

    if (type === 'clients') {  
      newRow.razon_social = row['Razón Social'] || row['razon_social']  
      newRow.ruc = (row['RUC'] || row['ruc'])?.toString().trim()  
      newRow.direccion_fiscal = row['Dirección Fiscal'] || row['direccion_fiscal']  
      newRow.telefono = row['Teléfono'] || row['telefono']  
      newRow.email = row['Email'] || row['email']  

      if (!newRow.razon_social?.trim()) rowErrors.push('Razón social requerida')  
      if (!newRow.ruc || !/^\d{11}$/.test(newRow.ruc)) rowErrors.push('RUC inválido (11 dígitos)')  
      if (newRow.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRow.email)) rowErrors.push('Email inválido')  

    } else if (type === 'catalog') {  
      newRow.tipo = (row['Tipo'] || row['tipo'])?.toLowerCase().trim()  
      newRow.codigo = (row['Código'] || row['codigo'])?.toString().trim().toUpperCase()  
      newRow.nombre = row['Nombre'] || row['nombre']  
      newRow.descripcion = row['Descripción'] || row['descripcion']  
      newRow.unidad = row['Unidad'] || row['unidad']  
      newRow.precio = parseFloat(row['Precio'] || row['precio']) || 0  
      newRow.moneda = row['Moneda'] || row['moneda'] || 'PEN'  
      const impStr = row['Aplica Impuesto'] || row['aplica_impuesto']  
      newRow.aplica_impuesto = impStr?.toString().toLowerCase() === 'sí' || impStr === true || impStr === 'true' ? true : false  
      newRow.activo = true  

      if (!newRow.tipo || !['articulo', 'servicio'].includes(newRow.tipo)) rowErrors.push('Tipo inválido (articulo/servicio)')  
      if (!newRow.codigo?.trim()) rowErrors.push('Código requerido')  
      if (!newRow.nombre?.trim()) rowErrors.push('Nombre requerido')  
      if (newRow.precio < 0) rowErrors.push('Precio debe ser >= 0')  
    }  

    if (rowErrors.length > 0) {  
      errors.push({ row: index + 1, errors: rowErrors, data: row })  
    } else {  
      validData.push(newRow)  
    }  
  })  

  return { validData, errors }  
}  

// Importar clientes con rollback  
export const importClients = async (data) => {  
  const { validData, errors } = validateImportData(data, 'clients')  
  if (errors.length > 0) {  
    return { success: 0, errors, rollback: true }  
  }  

  // Batch upsert con Supabase (simula transacción)  
  const batches = []  
  for (let i = 0; i < validData.length; i += 100) {  
    batches.push(validData.slice(i, i + 100))  
  }  

  let inserted = []  
  let hasError = false  
  for (const batch of batches) {  
    const { data: newInserted, error } = await supabase.from('customers').insert(batch)  
    if (error) {  
      hasError = true  
      // Rollback: delete todo lo insertado en este batch  
      const rucsToDelete = batch.map(d => d.ruc)  
      await supabase.from('customers').delete().in('ruc', rucsToDelete)  
      break  
    }  
    inserted = inserted.concat(newInserted)  
  }  

  if (hasError) {  
    // Rollback completo si algo falló  
    const allRucs = validData.map(d => d.ruc)  
    await supabase.from('customers').delete().in('ruc', allRucs)  
    return { success: 0, errors: [{ row: 'Batch', errors: ['Error general en inserción'] }], rollback: true }  
  }  

  return { success: inserted.length, errors: [], total: validData.length, rollback: false }  
}  

// Importar catálogo con rollback  
export const importCatalog = async (data) => {  
  const { validData, errors } = validateImportData(data, 'catalog')  
  if (errors.length > 0) {  
    return { success: 0, errors, rollback: true }  
  }  

  const batches = []  
  for (let i = 0; i < validData.length; i += 100) {  
    batches.push(validData.slice(i, i + 100))  
  }  

  let inserted = []  
  let hasError = false  
  for (const batch of batches) {  
    const { data: newInserted, error } = await supabase.from('items').insert(batch)  
    if (error) {  
      hasError = true  
      // Rollback batch  
      const codigosToDelete = batch.map(d => d.codigo)  
      await supabase.from('items').delete().in('codigo', codigosToDelete)  
      break  
    }  
    inserted = inserted.concat(newInserted)  
  }  

  if (hasError) {  
    // Rollback total  
    const allCodigos = validData.map(d => d.codigo)  
    await supabase.from('items').delete().in('codigo', allCodigos)  
    return { success: 0, errors: [{ row: 'Batch', errors: ['Error general en inserción'] }], rollback: true }  
  }  

  return { success: inserted.length, errors: [], total: validData.length, rollback: false }  
}  

// Función helper para mostrar errores  
export const handleImportErrors = (result, type) => {  
  if (result.errors.length > 0) {  
    let errorMsg = `Errores encontrados:\n`  
    result.errors.forEach(e => {  
      errorMsg += `Fila ${e.row}: ${e.errors.join(', ')}\n`  
    })  
    alert(`${type} importado parcialmente. ${result.success}/${result.total} exitosos. Rollback aplicado.\n${errorMsg}`)  
  } else {  
    alert(`¡Éxito! ${result.success} ${type}s importados.`)  
  }  
}