# Guía Integraciones Externas  

## Evolution API (WhatsApp)  
### Instalar Local  
1. Docker: `docker run -d -p 8080:8080 atendai/evolution-api:latest`.  
2. Config: POST /instance/create con { instanceName: "mi-bot", authentication: "tu-clave" }.  
3. En app: Agrega vars en .env (ver SETUP.md).  

### Usar en App  
- En PDFPreview: Botón "WhatsApp" envía PDF + texto.  
- Personaliza mensaje en textarea.  
- Número: Auto de cliente, edita si hace falta.  

## Supabase Integración  
Ya configurado:  
- Usuarios: Auth con email.  
- Datos: Tablas quotes, customers, items (ver SQL esquema).  
- Policies: RLS para roles (admin/vendedor/lector).  

## Excel Import/Export  
- Clientes: Sube .xlsx con columnas "Razón Social", "RUC", etc. Valida duplicados.  
- Catálogo: Columnas "Tipo", "Código", "Nombre", etc. Rollback si errores.  
- Export: Botón en listas descarga .xlsx formateado.  

## Mejoras  
- Custom API: Agrega /utils/customApi.js para endpoints extras.  
- Errores: Mira console o Supabase logs para debug.  
- Soporte: Contacta via email si atascas.  

¡Tu app ya integra lo esencial—expándela con estos hooks!