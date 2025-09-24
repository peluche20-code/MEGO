# Despliegue en Producción  

¡Sube tu app a internet para que el mundo la use! Recomendado: Vercel (gratis, fácil).  

## Vercel (Recomendado)  
### 1. Preparar  
- Corre `npm run build` localmente.  
- Crea .env.production con tus claves Supabase (NO subas .env a git).  
- En vercel.json: Config ya incluida para React/SPA.  

### 2. Cuenta Vercel  
- Ve a [vercel.com](https://vercel.com), crea cuenta/gratis.  
- Instala Vercel CLI: `npm i -g vercel`.  
- Login: `vercel login`.  

### 3. Desplegar  
Desde carpeta raíz:  
bash  
vercel  
  
- Elige scope (cuenta personal).  
- Linka directorio (./).  
- Ignora: node_modules, .env, build.  
- Build command: `npm run build`.  
- Output dir: `build`.  
- Env vars: Agrega REACT_APP_SUPABASE_URL y _KEY en el dashboard Vercel.  

### 4. Resultado  
- URL: algo como cotizapro.vercel.app.  
- Custom domain: En Vercel dashboard, agregra tu dominio y configura DNS.  
- Auto-deploys: Conecta GitHub, push = deploy auto.  

## Netlify Alternativa  
1. `npm run build`.  
2. Sube carpeta build a [netlify.com/drop](https://netlify.com/drop).  
3. Config env vars en dashboard Netlify.  

## Heroku (Server-full)  
1. `npm install -g heroku`.  
2. `heroku create tu-app`.  
3. Config vars en dashboard Heroku.  
4. `git push heroku main`.  

## Tips Producción  
- SSL: Auto en Vercel/Netlify.  
- Monitoreo: Revisa logs en dashboard.  
- Escala: Gratis hasta miles visitas; escala auto.  
- Supabase: Límite gratis 500MB DB; sube si creces.  
- WhatsApp: Evolution API en VPS para prod (no local).  

¡Tu app en vivo! Comparte la URL y conquista clientes.