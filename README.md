# 🚀 Innovators Hub - Seville

Una plataforma comunitaria moderna para nómadas digitales e innovadores en Sevilla, España.

## 📋 Características Principales

- ✅ **Autenticación segura** con NextAuth (credenciales + OAuth)
- 🎟️ **Sistema de eventos** con compra de tickets vía Stripe
- 💳 **Membresía premium** anual con acceso gratuito a eventos seleccionados
- 📱 **Escáner QR** para validación de tickets por organizadores
- 📧 **Emails transaccionales** automáticos con Resend
- 🔒 **Seguridad robusta** con HMAC, rate limiting y validación de entrada
- 🎨 **UI moderna** con Tailwind CSS y Framer Motion
- 📊 **Dashboard de organizadores** con estadísticas en tiempo real

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Base de datos:** MongoDB Atlas (Mongoose)
- **Autenticación:** NextAuth v4
- **Pagos:** Stripe (Checkout + Webhooks)
- **Email:** Resend API
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Validación:** Zod
- **QR Codes:** qrcode + @zxing/browser

## 📁 Estructura del Proyecto

```
innovators-hub/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Autenticación y registro
│   │   ├── events/       # CRUD de eventos
│   │   ├── stripe/       # Checkout, webhooks, portal
│   │   ├── tickets/      # Validación y reclamación
│   │   ├── qr/           # Generación de QR
│   │   └── organizer/    # Estadísticas de organizador
│   ├── auth/             # Páginas de login/register
│   ├── events/           # Listado y detalle de eventos
│   ├── user/             # Dashboard de usuario
│   ├── organizer/        # Dashboard de organizador
│   ├── layout.tsx        # Layout raíz
│   ├── page.tsx          # Homepage
│   └── globals.css       # Estilos globales
├── components/           # Componentes reutilizables
├── lib/                  # Utilidades y configuración
│   ├── db.ts            # Conexión MongoDB
│   ├── auth.ts          # Config NextAuth
│   ├── stripe.ts        # Config Stripe
│   ├── email.ts         # Servicio de email
│   └── verifyTicket.ts  # Utilidades de seguridad
├── models/              # Modelos Mongoose
│   ├── User.ts
│   ├── Event.ts
│   └── Ticket.ts
├── types/               # Definiciones TypeScript
├── middleware.ts        # Protección de rutas
└── package.json
```

## 🚀 Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura las siguientes variables:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/innovators-hub

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-super-seguro-cambia-esto

# Stripe (modo test)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MEMBERSHIP_PRICE_ID=price_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@innovatorshub.com

# Security
SECRET_TICKET_KEY=tu-clave-hmac-minimo-32-caracteres
```

### 3. Configurar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo cluster
3. Añade tu IP a la whitelist
4. Crea un usuario de base de datos
5. Obtén la connection string y añádela a `MONGODB_URI`

### 4. Configurar Stripe

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Obtén tus API keys del dashboard (modo test)
3. Crea un producto de suscripción anual para la membresía
4. Copia el Price ID a `STRIPE_MEMBERSHIP_PRICE_ID`
5. Configura un webhook endpoint: `https://tu-dominio.com/api/stripe/webhook`
6. Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Copia el signing secret del webhook a `STRIPE_WEBHOOK_SECRET`

### 5. Configurar Resend

1. Crea una cuenta en [Resend](https://resend.com)
2. Verifica tu dominio
3. Obtén tu API key
4. Añádela a `RESEND_API_KEY`

### 6. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🎭 Roles de Usuario

### User (usuario)
- Ver eventos públicos
- Comprar tickets
- Gestionar suscripción premium
- Ver sus tickets con QR codes

### Organizer (organizador)
- Todas las funcionalidades de usuario
- Crear y gestionar eventos
- Escanear y validar tickets
- Ver estadísticas de eventos

### Admin (administrador)
- Todas las funcionalidades de organizador
- Gestionar cualquier evento
- Acceso completo al sistema

## 🔐 Seguridad

- **Autenticación JWT** con sesiones firmadas
- **HMAC signatures** en códigos QR para prevenir falsificación
- **Rate limiting** en endpoints críticos
- **Validación de entrada** con Zod
- **Variables de entorno** para secretos
- **Middleware** para protección de rutas basada en roles
- **HTTPS only** en producción
- **Cookies seguras** con flags httpOnly y secure

## 📧 Flujo de Emails

- **Bienvenida:** Al registrarse
- **Ticket:** Después de comprar un ticket (incluye QR)
- **Membresía:** Al activar la suscripción premium

## 🎫 Sistema de Tickets

1. Usuario compra ticket → Stripe Checkout
2. Webhook confirma pago → Crea ticket en DB
3. Genera QR único con firma HMAC
4. Envía email con ticket y QR
5. Organizador escanea QR en evento
6. Sistema valida firma y marca como usado
7. Log de todas las validaciones

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Añade todas las variables de entorno
3. Configura el webhook de Stripe con la URL de producción
4. Despliega

```bash
# Build para producción
npm run build

# Iniciar en producción
npm start
```

## 🧪 Testing Local del Webhook

Usa Stripe CLI para probar webhooks localmente:

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 📱 Escaneo de QR

El escáner QR funciona con:
- Cámaras de dispositivos móviles
- Webcams de escritorio
- Entrada manual como fallback

Para mejores resultados:
- Asegura buena iluminación
- Mantén el QR dentro del marco
- Usa cámara trasera en móviles

## 🤝 Creación de Usuarios Organizadores

Por defecto, los usuarios registrados tienen rol `user`. Para promover a `organizer`:

1. Accede a MongoDB Atlas
2. Encuentra el usuario en la colección `users`
3. Cambia el campo `role` de `"user"` a `"organizer"`

## 📝 Próximas Mejoras

- [ ] Panel de administración
- [ ] Exportar datos de tickets
- [ ] Múltiples imágenes por evento
- [ ] Sistema de reseñas
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] Integración con calendarios
- [ ] Multi-idioma (i18n)

## 🐛 Troubleshooting

### Error de conexión a MongoDB
- Verifica que tu IP está en la whitelist
- Comprueba las credenciales en MONGODB_URI
- Asegura que el cluster está activo

### Webhook de Stripe no funciona
- Verifica el signing secret
- Comprueba que la URL es accesible públicamente
- Revisa los logs del webhook en Stripe Dashboard

### QR Scanner no funciona
- Permite permisos de cámara en el navegador
- Usa HTTPS (requerido para getUserMedia)
- Prueba con entrada manual como alternativa

## 📄 Licencia

MIT License - Innovators Hub 2025

## 👥 Contacto

Para soporte o consultas: hello@innovatorshub.com

---

Hecho con ❤️ en Sevilla, España



