export const calculateItemTotals = (precio_unitario, cantidad, descuento_tipo, descuento_valor, aplica_impuesto, tasa_impuesto = 0.18) => {  
  let subtotal = precio_unitario * cantidad  
  let descuento = 0  

  if (descuento_tipo === '%') {  
    descuento = subtotal * (descuento_valor / 100)  
  } else if (descuento_tipo === 'M') {  
    descuento = descuento_valor * cantidad  
  }  

  subtotal -= descuento  
  const impuesto = aplica_impuesto ? subtotal * tasa_impuesto : 0  
  const total = subtotal + impuesto  

  return { subtotal, descuento, impuesto, total }  
}  

export const calculateQuoteTotals = (items, tasa_impuesto = 0.18) => {  
  let subtotalTotal = 0  
  let impuestoTotal = 0  
  let totalTotal = 0  

  items.forEach(item => {  
    const { subtotal, impuesto, total } = calculateItemTotals(  
      item.precio_unitario,  
      item.cantidad,  
      item.descuento_tipo,  
      item.descuento_valor,  
      item.aplica_impuesto,  
      tasa_impuesto  
    )  
    subtotalTotal += subtotal  
    impuestoTotal += impuesto  
    totalTotal += total  
  })  

  return { subtotal: subtotalTotal, impuesto: impuestoTotal, total: totalTotal }  
}