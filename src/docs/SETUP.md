# Instalación Local de CotizaPro  

Sigue estos pasitos para tener la app corriendo en tu máquina en menos de 5 minutos.  

## 1. Preparar el Entorno  
- Node.js: Descarga de [nodejs.org](https://nodejs.org) (versión 18+). Verifica con `node -v`.  
- Git: Instala de [git-scm.com](https://git-scm.com) para clonar.  
- Editor: VS Code recomendado (con extensiones React/Tailwind).  

## 2. Clonar y Instalar  
bash  
git clone <url-del-repo> cotizapro  
cd cotizapro  
npm install  
  
Si hay errores:  
- Borra `node_modules` y `package-lock.json`.  
- Corre `npm cache clean --force` y `npm install` de nuevo.  

## 3. Configurar Supabase  
1. Ve a [supabase.com](https://supabase.com) y crea cuenta/proyecto gratis.  
2. En Settings > API: Copia URL y Anon Key.  
3. Crea archivo `.env` en raíz:  
   
   REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co  
   REACT_APP_SUPABASE_ANON_KEY=eyJ...tu-clave  
     
4. Corre las queries SQL del esquema (ve a /docs/SQL_SCHEMA.md si existe).  

## 4. Arranque  
bash  
npm start  
  
- Abre [localhost:3000](http://localhost:3000).  
- Regístrate/login con email/contraseña.  
- Usa Admin credentials de prueba si configuraste.  

## 5. WhatsApp Opcional  
- Instala Evolution API local o server.  
- Agrega a .env:  
  
  REACT_APP_EVOLUTION_API_URL=http://tu-server:8080  
  REACT_APP_EVOLUTION_INSTANCE=mi-instancia  
  REACT_APP_EVOLUTION_API_KEY=mi-clave  
    
- En PDFPreview, el botón WhatsApp volará.  

## Troubleshooting  
- Puerto ocupado: Mata procesos en puerto 3000 o cambia con `PORT=3001 npm start`.  
- Dependencias fallan: Usa `npm install --legacy-peer-deps`.  
- Supabase errores: Checa RLS policies en tu dashboard.  
- PWA no instala: Sirve en HTTPS (usa ngrok para local).  

¡Ya estás cotizando! Prueba crear una cotización y envíala por WhatsApp.