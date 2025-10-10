# 🚀 Guía de Despliegue

## Despliegue en Vercel (Recomendado)

Vercel es la plataforma oficial de Next.js y ofrece la mejor experiencia de despliegue.

### Preparación

1. **Push tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Innovators Hub"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/innovators-hub.git
   git push -u origin main
   ```

2. **Asegura que tu .env local funciona**
   ```bash
   npm run build
   npm start
   ```

### Despliegue en Vercel

1. **Crear cuenta en Vercel**
   - Ve a https://vercel.com
   - Inicia sesión con GitHub

2. **Importar proyecto**
   - Click en "Add New..." → "Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

3. **Configurar variables de entorno**
   
   En la sección "Environment Variables", añade:

   ```
   MONGODB_URI
   NEXTAUTH_SECRET
   NEXTAUTH_URL (será https://tu-app.vercel.app)
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_MEMBERSHIP_PRICE_ID
   RESEND_API_KEY
   RESEND_FROM_EMAIL
   SECRET_TICKET_KEY
   NEXT_PUBLIC_APP_URL (será https://tu-app.vercel.app)
   ```

   **IMPORTANTE:** No incluyas comillas en los valores.

4. **Deploy**
   - Click en "Deploy"
   - Espera a que termine el build (~2-3 minutos)
   - Obtendrás una URL: `https://tu-app.vercel.app`

### Post-Despliegue

1. **Actualizar Stripe Webhook**
   - Ve al Dashboard de Stripe
   - Webhooks → Edita tu endpoint
   - URL: `https://tu-app.vercel.app/api/stripe/webhook`
   - Guarda y obtén el nuevo signing secret
   - Actualiza `STRIPE_WEBHOOK_SECRET` en Vercel
   - Redeploy: `Settings` → `Redeploy`

2. **Actualizar URLs de OAuth (si usas Google)**
   - Ve a Google Cloud Console
   - Credentials → Edita tu OAuth Client
   - Añade: `https://tu-app.vercel.app/api/auth/callback/google`

3. **Configurar dominio personalizado (opcional)**
   - En Vercel: `Settings` → `Domains`
   - Añade tu dominio: `innovatorshub.com`
   - Configura los registros DNS según las instrucciones
   - Actualiza todas las URLs en variables de entorno

### Continuous Deployment

Vercel automáticamente despliega cuando haces push a GitHub:
- Push a `main` → Producción
- Push a otras ramas → Preview deployments

```bash
git add .
git commit -m "Update feature"
git push
# Vercel desplegará automáticamente
```

## Despliegue Manual (VPS/Servidor Propio)

Si prefieres un VPS como DigitalOcean o AWS EC2:

### Requisitos
- Ubuntu 22.04 LTS
- Node.js 18+
- PM2 para process management
- Nginx como reverse proxy
- Certbot para SSL

### Instalación

1. **Conectar al servidor**
   ```bash
   ssh root@tu-servidor-ip
   ```

2. **Instalar Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Instalar PM2**
   ```bash
   npm install -g pm2
   ```

4. **Clonar repositorio**
   ```bash
   cd /var/www
   git clone https://github.com/tu-usuario/innovators-hub.git
   cd innovators-hub
   npm install
   ```

5. **Configurar variables de entorno**
   ```bash
   nano .env
   # Pega todas tus variables de entorno
   # Ctrl+X → Y → Enter para guardar
   ```

6. **Build y start**
   ```bash
   npm run build
   pm2 start npm --name "innovators-hub" -- start
   pm2 save
   pm2 startup
   ```

7. **Configurar Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/innovatorshub
   ```

   Pega esta configuración:
   ```nginx
   server {
       listen 80;
       server_name innovatorshub.com www.innovatorshub.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Habilita el sitio:
   ```bash
   sudo ln -s /etc/nginx/sites-available/innovatorshub /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Configurar SSL con Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d innovatorshub.com -d www.innovatorshub.com
   ```

9. **Configurar firewall**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

### Actualizar la aplicación

```bash
cd /var/www/innovators-hub
git pull
npm install
npm run build
pm2 restart innovators-hub
```

## Monitorización

### Vercel
- Dashboard automático con logs y analytics
- Error tracking integrado
- Performance metrics

### VPS con PM2
```bash
# Ver logs
pm2 logs innovators-hub

# Ver status
pm2 status

# Monitorear recursos
pm2 monit

# Restart si hay problemas
pm2 restart innovators-hub
```

## Backup

### MongoDB Atlas
- Backups automáticos incluidos en el plan gratuito
- Se guardan durante 7 días
- Puedes restaurar desde el dashboard

### Manual Backup
```bash
# Exportar colección de usuarios
mongodump --uri="tu-mongodb-uri" --collection=users --out=./backup

# Restaurar
mongorestore --uri="tu-mongodb-uri" --drop ./backup
```

## Troubleshooting

### Error: "Application error"
1. Vercel: Revisa los logs en Dashboard → Deployments → View Function Logs
2. VPS: `pm2 logs innovators-hub`

### Webhook no funciona
1. Verifica que la URL es accesible públicamente
2. Comprueba el signing secret en variables de entorno
3. Revisa logs del webhook en Stripe Dashboard

### Build falla
1. Verifica que todas las dependencias están en package.json
2. Asegura que no hay errores de TypeScript: `npm run build` localmente
3. Revisa que todas las variables de entorno estén configuradas

### Base de datos no conecta
1. Verifica IP whitelist en MongoDB Atlas (0.0.0.0/0 para permitir todo)
2. Comprueba que MONGODB_URI está correctamente configurado
3. Verifica que el cluster está activo

## Optimizaciones de Producción

1. **Habilitar ISR (Incremental Static Regeneration)**
   - Páginas de eventos pueden ser estáticas
   - Se regeneran cada X segundos

2. **Añadir CDN**
   - Vercel incluye CDN global automáticamente
   - Para VPS: Considera Cloudflare

3. **Optimizar imágenes**
   - Next.js Image component optimiza automáticamente
   - Considera usar un CDN de imágenes

4. **Rate Limiting en producción**
   - Implementa Redis en lugar del rate limiter en memoria
   - Considera Upstash Redis (serverless)

5. **Monitoreo de errores**
   - Integra Sentry para tracking de errores
   - Configura alerts para problemas críticos

## Seguridad en Producción

- ✅ HTTPS habilitado (Vercel automático)
- ✅ Variables de entorno protegidas
- ✅ CORS configurado
- ✅ Rate limiting activo
- ✅ Input validation con Zod
- ✅ CSRF tokens en formularios
- ✅ Secure cookies (httpOnly, secure)

## Costos Estimados

### Setup Gratuito (para empezar)
- **Vercel:** Free tier (100 GB bandwidth, 100 deploys/day)
- **MongoDB Atlas:** Free tier (512 MB storage)
- **Stripe:** Gratis (comisión solo por transacción)
- **Resend:** Free tier (3,000 emails/mes)
- **Total:** €0/mes

### Producción Pequeña (~1000 usuarios)
- **Vercel Pro:** $20/mes
- **MongoDB M10:** $10/mes
- **Resend Pro:** $20/mes (50,000 emails)
- **Stripe fees:** 1.5% + €0.25 por transacción
- **Total:** ~€50/mes + comisiones

### Escalado (10,000+ usuarios)
- Considera VPS dedicado
- MongoDB M30 o superior
- Redis para caché y rate limiting
- CDN dedicado

---

¿Necesitas ayuda con el despliegue? Contacta: hello@innovatorshub.com



