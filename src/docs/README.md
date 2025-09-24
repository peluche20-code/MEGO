# CotizaPro - Sistema de Cotizaciones  

¡Bienvenido a CotizaPro, tu asistente fiel para crear, manejar y enviar cotizaciones profesionales! Esta app te ayuda a organizar clientes, productos y presupuestos en un solo lugar, con PDFs elegantes, envíos por WhatsApp y exportaciones a Excel.  

## ¿Qué hace?  
- Cotizaciones rápidas: Crea presupuestos con items del catálogo, calcula totales automáticos.  
- Gestión clientes: Agrega, busca y edita contactos sin complicaciones.  
- Catálogo organizado: Artículos y servicios con precios, listas para usar.  
- Exporta todo: PDFs fancy, Excel para análisis, e incluso imprimir directo.  
- Envíos mágicos: Manda cotizaciones por WhatsApp al instante.  
- Responsive y móvil: Funciona en celular, tablet o compu grande.  
- Instalable: Como app real en tu escritorio o teléfono (PWA).  

## Requisitos  
- Node.js (versión 18+)  
- Cuenta Supabase (gratis para empezar)  
- (Opcional) Evolution API para WhatsApp  

## Instalación Rápida  
1. Clona el proyecto:  
   bash  
   git clone <tu-repo-url> cotizapro  
   cd cotizapro  
     

2. Instala dependencias:  
   bash  
   npm install  
     

3. Configura Supabase:  
   - Crea proyecto en [supabase.com](https://supabase.com)  
   - Copia URL y Anon Key del dashboard  
   - Crea .env desde .env.example:  
     
     REACT_APP_SUPABASE_URL=tu-url  
     REACT_APP_SUPABASE_ANON_KEY=tu-clave  
       

4. Arranque local:  
   bash  
   npm start  
     
   ¡Abre localhost:3000 y regístrate!  

## Estructura  
- /src: Código React (components, utils).  
- /public: Archivos estáticos (iconos, manifest para PWA).  
- /docs: Esta documentación.  

## Uso Básico  
1. Login: Crea cuenta o entra con email/contraseña.  
2. Dashboard: Ve resúmenes de cotizaciones y clientes.  
3. Cotizaciones: Crea nueva, agrega items, confirma y envía por WhatsApp/PDF.  
4. Clientes: Lista, agrega o importa desde Excel.  
5. Catálogo: Maneja productos/servicios, exporta a Excel.  

## Funciones Avanzadas  
- Import/Export Excel: Botones en listas para subir/bajar datos masivos.  
- PDF Previsualización: Ve antes de imprimir o descargar, con configs de papel.  
- PWA: Instala como app (Chrome: Menú > Instalar).  
- Responsive: Funciona en móvil con menú hamburguesa.  

## Problemas Comunes  
- Supabase conexión: Checa URL/Clave en .env.  
- WhatsApp: Configura Evolution API (ver guía separada).  
- Instalación falla: Borra node_modules y npm install de nuevo.  

¡Listo para cotizar! Si algo patina, revisa logs o contacta soporte.  

---

Para más detalles:  
- [Instalación Local](SETUP.md)  
- [Despliegue Online](DEPLOY.md)  
- [WhatsApp Integración](API_GUIDE.md)