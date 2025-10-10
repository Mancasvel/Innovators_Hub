# ⚡ Quickstart - Innovators Hub

Empieza en 5 minutos con esta guía rápida.

## 📋 Pre-requisitos

- Node.js 18+ instalado
- Cuenta en MongoDB Atlas (gratis)
- Cuenta en Stripe (modo test)
- Cuenta en Resend (gratis)

## 🚀 Setup Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar MongoDB

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Crea un usuario de base de datos
4. Añade `0.0.0.0/0` a Network Access
5. Obtén tu connection string

### 3. Configurar Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Obtén tus test API keys (Developers → API keys)
3. Crea un producto de suscripción (€99/año)
4. Copia el Price ID

### 4. Configurar Resend

1. Ve a [Resend](https://resend.com)
2. Crea una cuenta
3. Obtén tu API key

### 5. Crear archivo .env

Copia `.env.example` a `.env` y completa:

```bash
# Copia el archivo ejemplo
cp .env.example .env

# Edita con tus valores
nano .env  # o usa tu editor favorito
```

**Mínimo necesario para desarrollo:**

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (obtén con Stripe CLI)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MEMBERSHIP_PRICE_ID=price_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
SECRET_TICKET_KEY=$(openssl rand -base64 32)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Verificar configuración

```bash
npm run setup-check
```

Si todo está ✅, continúa.

### 7. Iniciar aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 8. Configurar Stripe Webhook (en otra terminal)

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# O descarga desde: https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copia el webhook signing secret que aparece y añádelo a `.env` como `STRIPE_WEBHOOK_SECRET`.

## 🎯 Primeros Pasos

### 1. Registrar primera cuenta

1. Ve a http://localhost:3000/auth/register
2. Completa el formulario
3. Inicia sesión

### 2. Convertir usuario en organizador

```bash
npm run create-organizer tu@email.com
```

Cierra sesión y vuelve a iniciar sesión.

### 3. Crear primer evento

1. Click en "Organizer" en el navbar
2. Click "Create Event"
3. Completa el formulario
4. El evento aparecerá en la página de eventos

### 4. Comprar un ticket (testing)

1. Cierra sesión del organizador
2. Regístrate con otro email
3. Ve a "Events"
4. Click en tu evento → "Buy Ticket"
5. Usa tarjeta de prueba de Stripe:
   - Número: `4242 4242 4242 4242`
   - Fecha: cualquier futura
   - CVC: cualquier 3 dígitos
6. Completa el pago
7. Recibirás email con el ticket
8. Ve a "My Tickets" para ver el QR

### 5. Validar ticket

1. Inicia sesión como organizador
2. Ve a "Organizer" → "Scan Tickets"
3. Click "Manual Entry"
4. Pega el UUID del QR code
5. Verifica que aparece ✅ Valid

## 🎉 ¡Listo!

Tu Innovators Hub está funcionando. Ahora puedes:

- ✅ Crear eventos
- ✅ Vender tickets
- ✅ Validar entradas
- ✅ Gestionar membresías

## 📚 Siguiente Paso

Lee la documentación completa:
- [README.md](README.md) - Overview completo
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Setup detallado
- [DEPLOYMENT.md](DEPLOYMENT.md) - Despliegue a producción

## 🆘 Problemas Comunes

### "Please define MONGODB_URI"
→ Verifica que el archivo `.env` existe y tiene la variable

### "Failed to connect to MongoDB"
→ Verifica que tu IP está en Network Access de MongoDB Atlas

### Webhook no recibe eventos
→ Asegura que Stripe CLI está corriendo: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### QR Scanner no funciona
→ Permite permisos de cámara en el navegador, o usa "Manual Entry"

## 💡 Tips

1. **Usa modo test de Stripe** para todo el desarrollo
2. **Mantén Stripe CLI corriendo** mientras desarrollas
3. **Revisa logs de terminal** para errores de API
4. **Usa MongoDB Compass** para inspeccionar la DB visualmente

## 🔗 Links Útiles

- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Next.js Docs](https://nextjs.org/docs)
- [Resend Docs](https://resend.com/docs)

---

¿Necesitas ayuda? Revisa [SETUP_GUIDE.md](SETUP_GUIDE.md) para instrucciones detalladas.



