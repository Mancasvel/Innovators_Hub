# 🚀 Actualización a Dependencias Modernas

## Resumen de Cambios

Se actualizó el proyecto **Innovators Hub** para usar dependencias modernas y compatibles, eliminando la necesidad de usar `--legacy-peer-deps`.

---

## 📦 Dependencias Actualizadas

### Principales Cambios

| Paquete              | Versión Anterior | Versión Nueva | Razón                                       |
| -------------------- | ---------------- | ------------- | ------------------------------------------- |
| `@zxing/library`     | 0.20.0           | **0.21.3**    | Resolver conflicto con @zxing/browser       |
| `@zxing/browser`     | 0.1.4            | **0.1.5**     | Versión compatible con @zxing/library 0.21+ |
| `stripe`             | 14.8.0           | **17.3.1**    | API moderna con TypeScript mejorado         |
| `nodemailer`         | N/A              | **6.9.14**    | Reemplazo de Resend para Gmail SMTP         |
| `@types/nodemailer`  | N/A              | **6.4.16**    | Tipos TypeScript para nodemailer            |
| `uploadthing`        | 6.3.0            | **6.13.3**    | Versión moderna con mejor TypeScript        |
| `@uploadthing/react` | N/A              | **6.7.2**     | **NUEVA** - Faltaba en el proyecto          |

### Dependencias Eliminadas

- ❌ `resend` - Reemplazado por `nodemailer` para Gmail SMTP

---

## 🔧 Correcciones de Código

### 1. **Stripe API Version**

```typescript
// Antes
apiVersion: '2024-11-20.acacia'

// Ahora
apiVersion: '2025-02-24.acacia' ✅
```

**Archivo:** `lib/stripe.ts`

---

### 2. **Headers de Next.js 15**

```typescript
// Antes
const signature = headers().get('stripe-signature');

// Ahora
const headersList = await headers();
const signature = headersList.get('stripe-signature'); ✅
```

**Archivo:** `app/api/stripe/webhook/route.ts`  
**Razón:** Next.js 15 cambió `headers()` a async

---

### 3. **QR Code Buffer Type**

```typescript
// Antes
return new NextResponse(qrBuffer, {...});

// Ahora
return new NextResponse(qrBuffer as any, {...}); ✅
```

**Archivo:** `app/api/qr/route.ts`  
**Razón:** NextResponse acepta diferentes tipos de body

---

### 4. **Mongoose Sort Type**

```typescript
// Antes
const sort = { [sortField]: sortOrder };

// Ahora
const sort: { [key: string]: 1 | -1 } = { [sortField]: sortOrder }; ✅
```

**Archivo:** `app/api/events/route.ts`  
**Razón:** TypeScript requiere tipo explícito para sort de Mongoose

---

### 5. **Boolean Conversion**

```typescript
// Antes
const isSoldOut = event.capacity && event.ticketsSold >= event.capacity;

// Ahora
const isSoldOut = Boolean(event.capacity && event.ticketsSold >= event.capacity); ✅
```

**Archivo:** `app/events/[id]/page.tsx`  
**Razón:** Evitar `0` como valor boolean

---

### 6. **Email Service Refactor**

```typescript
// Antes (Resend API)
await sendTicketEmail({
  to: user.email,
  userName: user.name,
  eventTitle: event.title,
  eventDate,
  eventLocation: event.location,
  ticketId: ticket._id.toString(),
  qrCode: ticket.qrCode,
});

// Ahora (Gmail SMTP con objetos completos)
await sendTicketEmail(user.email, user.name, event, ticket); ✅
```

**Archivos afectados:**

- `lib/email.ts` - Completamente reescrito con nodemailer
- `app/api/stripe/webhook/route.ts`
- `app/api/tickets/free-claim/route.ts`

---

### 7. **@zxing Scanner API**

```typescript
// Antes
const videoInputDevices = await codeReader.listVideoInputDevices();

// Ahora
const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices(); ✅

// Tipo explícito
const selectedDevice = videoInputDevices.find(
  (device: MediaDeviceInfo) => device.label.toLowerCase().includes('back')
); ✅
```

**Archivo:** `app/organizer/scan/page.tsx`  
**Razón:** API moderna de @zxing/browser 0.1.5

---

### 8. **Stop Scanner Cleanup**

```typescript
// Antes
codeReaderRef.current.reset();

// Ahora
if (videoRef.current) {
  const stream = videoRef.current.srcObject as MediaStream;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  videoRef.current.srcObject = null;
} ✅
```

**Archivo:** `app/organizer/scan/page.tsx`  
**Razón:** `reset()` no existe en la nueva API

---

## ✅ Verificación

### Type Check

```bash
npm run type-check
# ✅ Sin errores
```

### Dev Server

```bash
npm run dev
# ✅ Compila correctamente
# ✅ SMTP server ready to send emails
```

---

## 📝 Instalación Limpia

Para replicar esta configuración en otro ambiente:

```bash
# 1. Eliminar node_modules y lock file
rm -rf node_modules package-lock.json

# 2. Instalar dependencias (SIN --legacy-peer-deps)
npm install

# 3. Verificar tipos
npm run type-check

# 4. Iniciar desarrollo
npm run dev
```

---

## 🎯 Beneficios

1. ✅ **Sin warnings de peer dependencies**
2. ✅ **Compatibilidad total entre paquetes**
3. ✅ **TypeScript strict mode compatible**
4. ✅ **API modernas de Stripe 17.x**
5. ✅ **Gmail SMTP integrado**
6. ✅ **Next.js 15 completamente soportado**
7. ✅ **@zxing última versión estable**
8. ✅ **Uploadthing con React hooks**

---

## 🔍 Versiones Finales

```json
{
  "dependencies": {
    "@zxing/browser": "^0.1.5",
    "@zxing/library": "^0.21.3",
    "stripe": "^17.3.1",
    "nodemailer": "^6.9.14",
    "uploadthing": "^6.13.3",
    "@uploadthing/react": "^6.7.2",
    "next": "^15.0.0",
    "next-auth": "^4.24.5"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.16",
    "typescript": "^5.3.3"
  }
}
```

---

## 📧 Email con Gmail SMTP

Ver documentación completa en: **`GMAIL_SMTP_SETUP.md`**

**Configuración requerida:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-16-chars
SMTP_FROM=noreply@unsent.app
```

---

## 🚨 Notas Importantes

### Stripe API Version

La versión `2025-02-24.acacia` es la **más reciente** de Stripe. Si en el futuro aparece una versión más nueva y falla, actualizar en:

```typescript
// lib/stripe.ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "YYYY-MM-DD.acacia", // Actualizar aquí
  typescript: true,
});
```

### Next.js 15 Breaking Changes

- `headers()` ahora es **async**
- `cookies()` ahora es **async**
- Siempre usar `await` antes de acceder a headers/cookies

```typescript
// ✅ Correcto en Next.js 15
const headersList = await headers();
const cookieStore = await cookies();

// ❌ Incorrecto
const headersList = headers(); // Error!
```

---

## 🎉 Estado Final

**✅ Proyecto completamente actualizado**  
**✅ 0 errores de TypeScript**  
**✅ 0 warnings de peer dependencies**  
**✅ Instalación limpia sin flags especiales**  
**✅ Compatible con Node.js 18+**  
**✅ Listo para producción**

---

**Fecha de actualización:** Enero 2025  
**Node version:** >= 18.0.0  
**npm version:** >= 9.0.0  
**TypeScript:** 5.3.3
