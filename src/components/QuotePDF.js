import React from 'react'  
import { jsPDF } from 'jspdf'  
import { supabase } from '../utils/supabase'  
import { PDF_COLORS, PDF_GRADIENTS, getCustomColors } from '../utils/pdfColors'  

const QuotePDF = ({ quote, quoteItems, companyProfile, onComplete, pageSize = 'a4', orientation = 'p' }) => {  
  const colors = getCustomColors(companyProfile?.ruc)  
  const gradients = colors.gradients || PDF_GRADIENTS  

  // Márgenes responsive basados en tamaño/orientación y contenido  
  const getResponsiveMargins = (isFirstPage = false, contentDensity = 'normal') => {  
    const sizeConfigs = {  
      'a4': { width: 210, height: 297, baseLeft: 15, baseRight: 15, baseTop: 20, baseBottom: 20 },  
      'letter': { width: 216, height: 279, baseLeft: 16, baseRight: 16, baseTop: 19, baseBottom: 19 },  
      'legal': { width: 216, height: 356, baseLeft: 16, baseRight: 16, baseTop: 19, baseBottom: 25 }  
    }  

    const config = sizeConfigs[pageSize] || sizeConfigs['a4']  
    let { baseLeft, baseRight, baseTop, baseBottom } = config  

    // Ajustes por orientación  
    if (orientation === 'l') {  
      baseLeft = 20  
      baseRight = 20  
      baseTop = 15  
      baseBottom = 15  
    }  

    // Ajustes por página primera (más top para header)  
    if (isFirstPage) {  
      baseTop += 20  
      baseBottom += 5  
    }  

    // Responsive por densidad de contenido (si hay mucho, reduce márgenes ligeramente)  
    if (contentDensity === 'dense' && quoteItems.length > 20) {  
      baseLeft *= 0.8  
      baseRight *= 0.8  
      baseTop *= 0.9  
      baseBottom *= 0.9  
    }  

    return {  
      left: Math.max(baseLeft, 10), // Mínimo 10mm  
      right: Math.max(baseRight, 10),  
      top: Math.max(baseTop, 15),  
      bottom: Math.max(baseBottom, 15)  
    }  
  }  

  const generatePDF = () => {  
    const doc = new jsPDF(orientation, 'mm', pageSize)  
    const pageWidth = doc.internal.pageSize.getWidth()  
    const pageHeight = doc.internal.pageSize.getHeight()  
    let yPosition = 0  
    let currentPage = 1  
    let isFirstPage = true  
    let contentDensity = quoteItems.length > 15 ? 'dense' : 'normal' // Detectar densidad  

    const marginsFirst = getResponsiveMargins(true, contentDensity)  
    const marginsNormal = getResponsiveMargins(false, contentDensity)  
    const contentWidthFirst = pageWidth - marginsFirst.left - marginsFirst.right  
    const contentWidthNormal = pageWidth - marginsNormal.left - marginsNormal.right  

    const currentContentWidth = isFirstPage ? contentWidthFirst : contentWidthNormal  
    const currentMargins = isFirstPage ? marginsFirst : marginsNormal  

    const formattedDate = new Date(quote.fecha_emision).toLocaleDateString('es-PE')  
    const validUntil = new Date(quote.fecha_emision)  
    validUntil.setDate(validUntil.getDate() + quote.validez_dias)  
    const formattedValid = validUntil.toLocaleDateString('es-PE')  

    // Función para agregar gradiente background (ajustado a márgenes)  
    const addGradientRect = (x, y, w, h, gradientType) => {  
      const gradientSteps = 10  
      x += currentMargins.left  
      y += currentMargins.top  
      w = Math.min(w, currentContentWidth)  
      switch (gradientType) {  
        case 'header':  
          for (let i = 0; i < gradientSteps; i++) {  
            const ratio = i / gradientSteps  
            const color1 = [102, 126, 234] // #667eea rgb  
            const color2 = [118, 75, 162] // #764ba2 rgb  
            const r = Math.floor(color1[0] + (color2[0] - color1[0]) * ratio)  
            const g = Math.floor(color1[1] + (color2[1] - color1[1]) * ratio)  
            const b = Math.floor(color1[2] + (color2[2] - color1[2]) * ratio)  
            doc.setFillColor(r, g, b)  
            doc.rect(x, y + (h / gradientSteps) * i, w, h / gradientSteps, 'F')  
          }  
          break  
        case 'tableHeader':  
          for (let i = 0; i < gradientSteps; i++) {  
            const ratio = i / gradientSteps  
            const color1 = [248, 250, 252] // #f8fafc rgb  
            const color2 = [226, 232, 240] // #e2e8f0 rgb  
            const r = Math.floor(color1[0] + (color2[0] - color1[0]) * ratio)  
            const g = Math.floor(color1[1] + (color2[1] - color1[1]) * ratio)  
            const b = Math.floor(color1[2] + (color2[2] - color1[2]) * ratio)  
            doc.setFillColor(r, g, b)  
            doc.rect(x, y + (h / gradientSteps) * i, w, h / gradientSteps, 'F')  
          }  
          break  
        case 'footer':  
          for (let i = 0; i < gradientSteps; i++) {  
            const ratio = i / gradientSteps  
            const color1 = [241, 245, 249] // #f1f5f9 rgb  
            const color2 = [226, 232, 240] // #e2e8f0 rgb  
            const r = Math.floor(color1[0] + (color2[0] - color1[0]) * ratio)  
            const g = Math.floor(color1[1] + (color2[1] - color1[1]) * ratio)  
            const b = Math.floor(color1[2] + (color2[2] - color1[2]) * ratio)  
            doc.setFillColor(r, g, b)  
            doc.rect(x, y + (h / gradientSteps) * i, w, h / gradientSteps, 'F')  
          }  
          break  
        default:  
          doc.setFillColor(248, 250, 252) // Gris claro fallback  
          doc.rect(x, y, w, h, 'F')  
      }  
    }  

    // Nueva página si es necesario (responsive a márgenes)  
    const newPageIfNeeded = (requiredHeight) => {  
      const availableSpace = pageHeight - currentMargins.top - currentMargins.bottom - yPosition  
      if (availableSpace < requiredHeight) {  
        addPageFooter(currentPage)  
        currentPage++  
        doc.addPage()  
        isFirstPage = false  
        currentMargins = getResponsiveMargins(false, contentDensity)  
        currentContentWidth = pageWidth - currentMargins.left - currentMargins.right  
        yPosition = currentMargins.top  
        addPageHeader(false)  
      }  
    }  

    // Funciones header y footer actualizadas (con márgenes responsive)  
    const addPageHeader = (firstPage = false) => {  
      yPosition = currentMargins.top  

      if (firstPage) {  
        const headerHeight = 60  
        addGradientRect(0, 0, pageWidth, currentMargins.top + headerHeight, 'header')  
        doc.setTextColor(colors.white)  
        doc.setFontSize(22)  
        doc.setFont(undefined, 'bold')  
        doc.text(`COTIZACIÓN - ${quote.correlativo || 'Borrador'}`, pageWidth / 2, currentMargins.top + 20, { align: 'center' })  

        // Logo centrado en márgenes  
        if (companyProfile?.logo_url) {  
          try {  
            const logoX = currentMargins.left + (currentContentWidth - 70) / 2  
            doc.addImage(companyProfile.logo_url, 'PNG', logoX, currentMargins.top + 25, 70, 40)  
          } catch (e) {  
            console.warn('Logo no cargado:', e)  
          }  
        }  
        yPosition += headerHeight + 10  
      } else {  
        doc.setTextColor(colors.primary)  
        doc.setFontSize(10)  
        doc.setFont(undefined, 'bold')  
        doc.text(`${quote.correlativo || 'Borrador'} - Continúa...`, currentMargins.left, yPosition + 5)  
        doc.text(formattedDate, pageWidth - currentMargins.right, yPosition + 5, { align: 'right' })  
        yPosition += 15  
      }  
    }  

    const addPageFooter = (pageNum) => {  
      const footerY = pageHeight - currentMargins.bottom  
      addGradientRect(0, footerY, pageWidth, currentMargins.bottom, 'footer')  
      doc.setTextColor(colors.textSecondary)  
      doc.setFontSize(10)  
      doc.setFont(undefined, 'normal')  

      doc.text(companyProfile?.eslogan || 'Calidad y compromiso en cada cotización', pageWidth / 2, footerY + 8, { align: 'center' })  

      doc.setFont(undefined, 'bold')  
      doc.setFontSize(12)  
      doc.setTextColor(colors.primary)  
      doc.text(`Página ${pageNum} de ${currentPage}`, pageWidth / 2, footerY + 18, { align: 'center' })  

      doc.setTextColor(colors.textSecondary)  
      doc.setFontSize(8)  
      doc.setFont(undefined, 'normal')  
      doc.text('Generado por CotizaPro', pageWidth / 2, footerY + 23, { align: 'center' })  
    }  

    // Primera página: Header completo  
    addPageHeader(true)  

    // Info empresa y cliente (responsive)  
    newPageIfNeeded(40)  
    doc.setTextColor(colors.text)  
    doc.setFontSize(10)  
    doc.setFont(undefined, 'normal')  

    const infoLeft = [  
      `Empresa: ${companyProfile?.razon_social || 'Mi Empresa SAC'}`,  
      `RUC: ${companyProfile?.ruc || '20123456789'}`,  
      companyProfile?.direccion_fiscal || '',  
      `Tel: ${companyProfile?.telefono || ''}`,  
      `Email: ${companyProfile?.email || ''}`  
    ].filter(Boolean)  

    const infoRight = [  
      `Cliente: ${quote.customer?.razon_social || 'Cliente'}`,  
      `RUC: ${quote.customer?.ruc || ''}`,  
      quote.customer?.direccion_fiscal || '',  
      `Tel: ${quote.customer?.telefono || ''}`,  
      `Email: ${quote.customer?.email || ''}`  
    ].filter(Boolean)  

    infoLeft.forEach((line, i) => {  
      doc.text(line, currentMargins.left, yPosition + (i * 5), { maxWidth: currentContentWidth / 2 - 10 })  
    })  

    infoRight.forEach((line, i) => {  
      doc.text(line, pageWidth - currentMargins.right, yPosition + (i * 5), { maxWidth: currentContentWidth / 2 - 10, align: 'right' })  
    })  

    yPosition += 50  

    // Info cotización  
    newPageIfNeeded(15)  
    doc.setFont(undefined, 'bold')  
    doc.text('Fecha de Emisión:', currentMargins.left, yPosition)  
    doc.setFont(undefined, 'normal')  
    doc.text(formattedDate, currentMargins.left + 50, yPosition)  
    yPosition += 7  

    doc.setFont(undefined, 'bold')  
    doc.text('Válida hasta:', currentMargins.left, yPosition)  
    doc.setFont(undefined, 'normal')  
    doc.text(formattedValid, currentMargins.left + 50, yPosition)  
    yPosition += 7  

    doc.setFont(undefined, 'bold')  
    doc.text('Moneda:', currentMargins.left, yPosition)  
    doc.setFont(undefined, 'normal')  
    doc.text(quote.moneda, currentMargins.left + 50, yPosition)  
    yPosition += 15  

    // Tabla de ítems (responsive widths)  
    const itemsPerPage = Math.floor((pageHeight - yPosition - currentMargins.bottom - 50) / 8)  
    let itemIndex = 0  

    while (itemIndex < quoteItems.length) {  
      newPageIfNeeded(100)  
      if (itemIndex > 0) {  
        addPageHeader(false)  
        isFirstPage = false  
        currentMargins = getResponsiveMargins(false, contentDensity)  
        currentContentWidth = pageWidth - currentMargins.left - currentMargins.right  
      }  

      // Headers de tabla (ancho responsive)  
      addGradientRect(0, yPosition, pageWidth, 12, 'tableHeader')  
      doc.setTextColor(colors.text)  
      doc.setFont(undefined, 'bold')  
      doc.setFontSize(9)  

      const baseHeaders = ['Ítem', 'Descripción', 'Cant.', 'Unidad', 'P.Unitario', 'Desc.', 'Subtotal', 'Impuesto', 'Total']  
      const baseWidths = [15, 45, 12, 15, 20, 15, 20, 20, 23]  
      const totalBaseWidth = baseWidths.reduce((a, b) => a + b, 0)  
      const responsiveWidths = baseWidths.map(w => (w / totalBaseWidth) * currentContentWidth)  
      let headerX = currentMargins.left  

      baseHeaders.forEach((header, i) => {  
        doc.text(header, headerX + 2, yPosition + 8, { maxWidth: responsiveWidths[i] - 4, align: i > 3 ? 'right' : 'left' })  
        headerX += responsiveWidths[i]  
      })  

      yPosition += 12  

      // Ítems  
      let pageItems = 0  
      while (itemIndex < quoteItems.length && pageItems < itemsPerPage) {  
        const item = quoteItems[itemIndex]  
        newPageIfNeeded(8)  

        doc.setFont(undefined, 'normal')  
        doc.setFontSize(8)  

        let rowX = currentMargins.left  
        doc.text((itemIndex + 1).toString(), rowX + 2, yPosition + 5, { align: 'center', maxWidth: responsiveWidths[0] })  
        rowX += responsiveWidths[0]  

        doc.text(item.nombre || '', rowX + 2, yPosition + 5, { maxWidth: responsiveWidths[1] - 4 })  
        rowX += responsiveWidths[1]  

        doc.text(item.cantidad.toString(), rowX + 2, yPosition + 5, { align: 'center', maxWidth: responsiveWidths[2] })  
        rowX += responsiveWidths[2]  

        doc.text(item.unidad, rowX + 2, yPosition + 5, { align: 'center', maxWidth: responsiveWidths[3] })  
        rowX += responsiveWidths[3]  

        doc.text(`${quote.moneda} ${item.precio_unitario.toFixed(2)}`, rowX + 2, yPosition + 5, { align: 'right', maxWidth: responsiveWidths[4] - 4 })  
        rowX += responsiveWidths[4]  

        const descText = item.descuento_tipo === '%' ? `${item.descuento_valor}%` : `${quote.moneda} ${item.descuento_valor}`  
        doc.setTextColor(colors.warning)  
        doc.text(descText, rowX + 2, yPosition + 5, { align: 'right', maxWidth: responsiveWidths[5] - 4 })  
        rowX += responsiveWidths[5]  
        doc.setTextColor(colors.text)  

        doc.text(`${quote.moneda} ${item.subtotal.toFixed(2)}`, rowX + 2, yPosition + 5, { align: 'right', maxWidth: responsiveWidths[6] - 4 })  
        rowX += responsiveWidths[6]  

        doc.setTextColor(colors.secondary)  
        doc.text(`${quote.moneda} ${item.impuesto.toFixed(2)}`, rowX + 2, yPosition + 5, { align: 'right', maxWidth: responsiveWidths[7] - 4 })  
        rowX += responsiveWidths[7]  
        doc.setTextColor(colors.text)  

        doc.setTextColor(colors.success)  
        doc.text(`${quote.moneda} ${item.total.toFixed(2)}`, rowX + 2, yPosition + 5, { align: 'right', maxWidth: responsiveWidths[8] - 4 })  
        doc.setTextColor(colors.text)  

        yPosition += 8  
        itemIndex++  
        pageItems++  
      }  

      if (itemIndex < quoteItems.length) {  
        doc.setDrawColor(colors.border)  
        doc.setLineWidth(0.5)  
        doc.line(currentMargins.left, yPosition, pageWidth - currentMargins.right, yPosition)  
        yPosition += 10  
      }  
    }  

    // Totales  
    newPageIfNeeded(50)  
    if (itemIndex > 0) {  
      addPageHeader(false)  
      isFirstPage = false  
      currentMargins = getResponsiveMargins(false, contentDensity)  
      currentContentWidth = pageWidth - currentMargins.left - currentMargins.right  
    }  
    doc.setFont(undefined, 'bold')  
    doc.setFontSize(12)  
    doc.text('Subtotal:', pageWidth - currentMargins.right - 60, yPosition, { align: 'right' })  
    doc.text(`${quote.moneda} ${quote.subtotal.toFixed(2)}`, pageWidth - currentMargins.right - 20, yPosition, { align: 'right' })  
    yPosition += 8  

    doc.text('Impuesto (18%):', pageWidth - currentMargins.right - 60, yPosition, { align: 'right' })  
    doc.text(`${quote.moneda} ${quote.impuesto.toFixed(2)}`, pageWidth - currentMargins.right - 20, yPosition, { align: 'right' })  
    yPosition += 8  

    doc.setDrawColor(colors.primary)  
    doc.setLineWidth(2)  
    doc.line(pageWidth - currentMargins.right - 70, yPosition, pageWidth - currentMargins.right - 10, yPosition)  
    yPosition += 5  

    doc.setFontSize(14)  
    doc.setTextColor(colors.success)  
    doc.text('TOTAL:', pageWidth - currentMargins.right - 60, yPosition, { align: 'right' })  
    doc.text(`${quote.moneda} ${quote.total.toFixed(2)}`, pageWidth - currentMargins.right - 20, yPosition, { align: 'right' })  
    yPosition += 20  

    // Notas y condiciones  
    if (quote.notas) {  
      newPageIfNeeded(30)  
      if (itemIndex > 0) addPageHeader(false)  
      doc.setFont(undefined, 'bold')  
      doc.setTextColor(colors.primary)  
      doc.text('Notas:', currentMargins.left, yPosition)  
      doc.setFont(undefined, 'normal')  
      doc.setTextColor(colors.text)  
      doc.setFontSize(10)  
      const splitNotas = doc.splitTextToSize(quote.notas, currentContentWidth - 10)  
      splitNotas.forEach((line) => {  
        newPageIfNeeded(5)  
        doc.text(line, currentMargins.left, yPosition)  
        yPosition += 5  
      })  
      yPosition += 10  
    }  

    if (quote.condiciones) {  
      newPageIfNeeded(30)  
      if (itemIndex > 0) addPageHeader(false)  
      doc.setFont(undefined, 'bold')  
      doc.setTextColor(colors.primary)  
      doc.text('Condiciones:', currentMargins.left, yPosition)  
      doc.setFont(undefined, 'normal')  
      doc.setTextColor(colors.text)  
      doc.setFontSize(10)  
      const splitCond = doc.splitTextToSize(quote.condiciones, currentContentWidth - 10)  
      splitCond.forEach((line) => {  
        newPageIfNeeded(5)  
        doc.text(line, currentMargins.left, yPosition)  
        yPosition += 5  
      })  
      yPosition += 10  
    }  

    addPageFooter(currentPage)  
    const totalPages = doc.getNumberOfPages()  
    currentPage = totalPages  
    for (let i = 1; i <= totalPages; i++) {  
      doc.setPage(i)  
      addPageFooter(i, totalPages)  
    }  

    const pdfOutput = doc.output('blob')  
    const url = URL.createObjectURL(pdfOutput)  
    const a = document.createElement('a')  
    a.href = url  
    a.download = `Cotizacion-${quote.correlativo || 'Borrador'}.pdf`  
    a.click()  
    URL.revokeObjectURL(url)  

    if (onComplete) onComplete()  
  }  

  React.useEffect(() => {  
    generatePDF()  
  }, [quote, quoteItems, companyProfile, pageSize, orientation])  

  if (!quote) return null  

  return <div style={{ display: 'none' }} />  
}  

export default QuotePDF