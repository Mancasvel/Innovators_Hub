# 📖 Guía de Configuración Completa

## Paso 1: MongoDB Atlas

### Crear Cuenta y Cluster

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto: "Innovators Hub"
4. Click en "Build a Database"
5. Selecciona el plan FREE (M0)
6. Elige la región más cercana (Europe - Frankfurt)
7. Nombra el cluster: "innovators-cluster"

### Configurar Acceso

1. **Database Access:**
   - Ve a "Database Access" en el menú
   - Click "Add New Database User"
   - Username: `innovators_admin`
   - Password: Genera una contraseña segura
   - Built-in Role: "Read and write to any database"
   - Guarda el usuario

2. **Network Access:**
   - Ve a "Network Access"
   - Click "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
   - Para producción, restringe a IPs específicas

3. **Obtener Connection String:**
   - Ve a "Database" → "Connect"
   - Selecciona "Connect your application"
   - Copia el connection string
   - Reemplaza `<password>` con tu contraseña
   - Formato: `mongodb+srv://innovators_admin:PASSWORD@innovators-cluster.xxxxx.mongodb.net/innovators-hub?retryWrites=true&w=majority`

## Paso 2: Stripe

### Crear Cuenta

1. Ve a https://stripe.com
2. Crea una cuenta
3. Completa el proceso de verificación

### Obtener API Keys

1. Ve al Dashboard de Stripe
2. Click en "Developers" → "API keys"
3. Copia las keys del modo TEST:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### Crear Producto de Membresía

1. Ve a "Products" en el dashboard
2. Click "Add product"
3. Configuración:
   - Name: "Innovators Hub - Membresía Anual"
   - Description: "Acceso premium anual con eventos gratuitos"
   - Pricing model: "Standard pricing"
   - Price: €99.00 EUR
   - Billing period: "Yearly"
4. Guarda el producto
5. Copia el Price ID (formato: `price_xxxxxxxxxx`)

### Configurar Webhooks

1. Ve a "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Endpoint URL:
   - Desarrollo: Usa Stripe CLI (ver abajo)
   - Producción: `https://tu-dominio.vercel.app/api/stripe/webhook`
4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copia el "Signing secret" (formato: `whsec_xxxxx`)

### Testing Local con Stripe CLI

```bash
# Instalar Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows (con Scoop)
scoop install stripe

# Linux
# Descarga desde: https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Forward webhooks a tu localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# El CLI te dará un webhook signing secret temporal
```

## Paso 3: Resend

### Crear Cuenta

1. Ve a https://resend.com
2. Crea una cuenta gratuita
3. Plan FREE incluye 3,000 emails/mes

### Verificar Dominio (Opcional para Desarrollo)

Para desarrollo, puedes usar el dominio onboarding de Resend:

- From: `onboarding@resend.dev`

Para producción:

1. Ve a "Domains"
2. Click "Add Domain"
3. Ingresa tu dominio: `innovatorshub.com`
4. Añade los registros DNS proporcionados:
   - SPF
   - DKIM
   - DMARC
5. Espera la verificación (puede tardar hasta 48h)

### Obtener API Key

1. Ve a "API Keys"
2. Click "Create API Key"
3. Name: "Innovators Hub - Production"
4. Permission: "Full access"
5. Copia la API key (formato: `re_xxxxx`)

## Paso 4: NextAuth

### Generar Secret

En tu terminal:

```bash
# Generar un secret aleatorio
openssl rand -base64 32
```

Copia el resultado y úsalo como `NEXTAUTH_SECRET`

### Google OAuth (Opcional)

Si quieres añadir login con Google:

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto
3. Habilita "Google+ API"
4. Ve a "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://tu-dominio.vercel.app/api/auth/callback/google`
7. Copia Client ID y Client Secret

## Paso 5: Archivo .env

Crea un archivo `.env` en la raíz del proyecto:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://innovators_admin:TU_PASSWORD@innovators-cluster.xxxxx.mongodb.net/innovators-hub?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-generado-con-openssl

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_publishable_key
STRIPE_MEMBERSHIP_PRICE_ID=price_tu_price_id

# Resend Email
RESEND_API_KEY=re_tu_resend_api_key
RESEND_FROM_EMAIL=noreply@innovatorshub.com

# Security
SECRET_TICKET_KEY=genera-una-clave-aleatoria-minimo-32-caracteres-para-hmac
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## Paso 6: Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre http://localhost:3000

## Paso 7: Crear Primer Usuario Organizador

1. Regístrate en la aplicación como usuario normal
2. Accede a MongoDB Atlas
3. Ve a tu cluster → "Browse Collections"
4. Selecciona la base de datos `innovators-hub`
5. Abre la colección `users`
6. Encuentra tu usuario por email
7. Click en editar
8. Cambia el campo `role` de `"user"` a `"organizer"`
9. Guarda los cambios
10. Cierra sesión y vuelve a iniciar sesión
11. Ahora verás el menú "Organizer"

## Paso 8: Crear Primer Evento

1. Inicia sesión como organizador
2. Ve a "Organizer" → "Create Event"
3. Completa el formulario
4. El evento aparecerá en la página pública de eventos

## Paso 9: Testing del Flujo Completo

### Test 1: Compra de Ticket

1. Crea un evento (como organizador)
2. Cierra sesión
3. Regístrate como nuevo usuario
4. Compra un ticket del evento
5. Usa tarjeta de prueba de Stripe:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
   - ZIP: Cualquier código
6. Completa el pago
7. Verifica que recibes el email con el ticket
8. Ve a "My Tickets" y verifica que aparece el QR

### Test 2: Validación de Ticket

1. Inicia sesión como organizador
2. Ve a "Organizer" → "Scan Tickets"
3. Click "Manual Entry"
4. Pega el código UUID del ticket
5. Verifica que se valida correctamente

### Test 3: Membresía

1. Como usuario, ve a "Membership"
2. Click "Subscribe Now"
3. Completa el pago con tarjeta de prueba
4. Verifica que tu perfil muestra "⭐ Member"
5. Ve a un evento marcado como "Free for Members"
6. Verifica que puedes obtenerlo gratis

## Troubleshooting

### Error: "Please define MONGODB_URI"

- Verifica que el archivo .env existe en la raíz
- Asegura que la variable está correctamente escrita
- Reinicia el servidor de desarrollo

### Error: "Failed to connect to MongoDB"

- Verifica tu IP en Network Access de MongoDB
- Comprueba usuario y contraseña
- Asegura que el cluster está activo

### Webhook no recibe eventos

- En desarrollo, usa Stripe CLI
- En producción, verifica que la URL es accesible
- Comprueba el signing secret

### QR Scanner no funciona

- Permite permisos de cámara en el navegador
- En desarrollo, usa HTTPS o localhost
- Prueba con "Manual Entry" como alternativa

## Despliegue en Vercel

1. Push tu código a GitHub
2. Importa el proyecto en Vercel
3. Añade todas las variables de entorno
4. Actualiza `NEXT_PUBLIC_APP_URL` a tu dominio de Vercel
5. Actualiza `NEXTAUTH_URL` también
6. Despliega
7. Actualiza el webhook de Stripe con la nueva URL
8. ¡Listo!

## Soporte

¿Problemas? Revisa:

- Logs en la terminal
- Console del navegador
- Dashboard de Stripe para eventos de webhook
- MongoDB Atlas para datos

---

¡Buena suerte con tu Innovators Hub! 🚀
