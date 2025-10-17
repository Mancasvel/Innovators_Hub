# 📧 Gmail SMTP - Configuración Completa

Guía paso a paso para configurar el envío de emails con **Gmail SMTP** en Innovators Hub.

---

## 🎯 ¿Por qué Gmail SMTP?

- ✅ **Gratis** para uso personal/desarrollo
- ✅ **Fácil de configurar** si ya tienes Gmail
- ✅ **Confiable** y buen deliverability
- ✅ **Hasta 500 emails/día** (suficiente para empezar)

---

## 📋 Configuración Paso a Paso

### 1️⃣ Habilitar Autenticación de 2 Pasos

**OBLIGATORIO** - Gmail requiere 2FA para usar contraseñas de aplicación.

1. Ve a tu **Cuenta de Google**: https://myaccount.google.com/security
2. Busca **"Verificación en 2 pasos"**
3. Click en **"Comenzar"**
4. Sigue los pasos para configurar (SMS, app Authenticator, etc.)
5. ✅ Confirma que está activa

---

### 2️⃣ Generar Contraseña de Aplicación

**NO uses tu contraseña normal de Gmail** - Usa una contraseña específica para apps.

1. Ve a: https://myaccount.google.com/apppasswords

   > Si no ves esta opción, asegúrate de que 2FA esté activada primero.

2. Puede pedirte que inicies sesión de nuevo

3. En **"Selecciona la app"**, elige:
   - **Correo** (o "Mail")

4. En **"Selecciona el dispositivo"**, elige:
   - **Otro (nombre personalizado)**
   - Escribe: **"Innovators Hub"**

5. Click en **"Generar"**

6. Google te mostrará una **contraseña de 16 caracteres** como:

   ```
   abcd efgh ijkl mnop
   ```

7. **¡COPIA ESTA CONTRASEÑA!** - Solo se muestra una vez
   - Guárdala sin espacios: `abcdefghijklmnop`
   - Esta será tu `SMTP_PASS`

---

### 3️⃣ Configurar Variables de Entorno

Edita tu archivo `.env` (crea uno desde `env.example` si no existe):

```env
# EMAIL - Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=noreply@unsent.app
```

**Reemplaza:**

- `tu-email@gmail.com` → Tu email de Gmail real
- `abcdefghijklmnop` → La contraseña de 16 caracteres que copiaste

---

### 4️⃣ Instalar Dependencias

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

**Ya está hecho** si aceptaste los cambios en `package.json` ✅

---

### 5️⃣ Verificar Configuración

Inicia tu proyecto:

```bash
npm run dev
```

Deberías ver en la consola:

```
✅ SMTP server is ready to send emails
```

Si ves un error, revisa tus credenciales.

---

## 🧪 Testing de Emails

### Test 1: Email de Bienvenida

1. Registra un nuevo usuario:

   ```
   http://localhost:3000/auth/register
   ```

2. Verifica tu Gmail - deberías recibir el email de bienvenida

### Test 2: Email de Entrada

1. Compra un ticket de prueba usando Stripe test mode:
   - Card: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: `123`

2. Después de la compra, recibirás un email con:
   - ✅ Detalles del evento
   - ✅ Código QR embebido
   - ✅ Link a la entrada

### Test 3: Email de Membresía

1. Suscríbete a la membresía premium
2. Recibirás email de confirmación con fecha de expiración

---

## ⚠️ Troubleshooting

### Error: "Invalid login credentials"

**Causa:** Contraseña incorrecta o no es una contraseña de aplicación

**Solución:**

1. Verifica que 2FA esté activa
2. Genera una **nueva** contraseña de aplicación
3. Cópiala SIN espacios
4. Actualiza `SMTP_PASS` en `.env`
5. Reinicia el servidor: `npm run dev`

---

### Error: "self signed certificate in certificate chain"

**Causa:** Problema con certificados SSL en desarrollo

**Solución temporal (solo desarrollo):**

En `lib/email.ts`, cambia la configuración:

```typescript
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Solo para desarrollo
  },
};
```

---

### Emails van a Spam

**Soluciones:**

1. **Verifica el remitente:**
   - Gmail puede mostrar "enviado a través de gmail.com"
   - Esto es normal cuando usas Gmail SMTP

2. **Usa un dominio verificado:**
   - Para producción, verifica tu dominio personalizado
   - Configura SPF, DKIM y DMARC

3. **Mejora el contenido:**
   - Evita palabras spam: "free", "winner", "click here"
   - Incluye texto plano además de HTML
   - Añade un link de unsubscribe

---

### Límite de 500 emails/día alcanzado

**Soluciones:**

1. **Para desarrollo:** Suficiente para testing
2. **Para producción:**
   - Cambia a un servicio profesional:
     - **Resend** (3,000 emails/mes gratis)
     - **SendGrid** (100 emails/día gratis)
     - **Mailgun** (5,000 emails/mes gratis)

---

## 🚀 Producción Checklist

### ⚠️ Gmail NO es recomendado para producción

Para producción, usa un servicio profesional como:

- **Resend** ⭐ (recomendado)
- **SendGrid**
- **Mailgun**
- **Amazon SES**

**¿Por qué?**

- ❌ Gmail tiene límite de 500 emails/día
- ❌ Puede bloquear tu cuenta por "actividad sospechosa"
- ❌ No tiene analytics (opens, clicks, bounces)
- ❌ Menos deliverability profesional

### Si aún así quieres usar Gmail en producción:

- [ ] Cuenta de Gmail separada (no uses tu cuenta personal)
- [ ] 2FA activado
- [ ] Contraseña de aplicación configurada
- [ ] Monitores de límites implementados
- [ ] Backoff/retry logic para errores
- [ ] Alertas si falla el envío

---

## 📊 Comparación: Gmail vs Servicios Profesionales

| Característica       | Gmail SMTP | Resend API    | SendGrid     |
| -------------------- | ---------- | ------------- | ------------ |
| **Costo**            | Gratis     | $0-$20/mes    | $0-$20/mes   |
| **Límite diario**    | 500        | 3,000 (free)  | 100 (free)   |
| **Límite mensual**   | 15,000     | 3,000 (free)  | 3,000 (free) |
| **Setup**            | ⭐⭐⭐     | ⭐⭐⭐⭐⭐    | ⭐⭐⭐       |
| **Deliverability**   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐     |
| **Analytics**        | ❌         | ✅            | ✅           |
| **Templates**        | ❌         | ✅            | ✅           |
| **Webhooks**         | ❌         | ✅            | ✅           |
| **Recomendado para** | Testing    | Producción ⭐ | Producción   |

---

## 💡 Pro Tips

### 1. Usa cuentas separadas

```env
# Desarrollo
SMTP_USER=dev@tu-dominio.com

# Producción
SMTP_USER=noreply@tu-dominio.com
```

### 2. Implementa retry logic

```typescript
async function sendEmailWithRetry(emailFn: Function, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await emailFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. Monitorea los límites

```typescript
let emailsSentToday = 0;

export async function sendEmail(...args) {
  if (emailsSentToday >= 500) {
    console.error('Gmail daily limit reached!');
    return;
  }

  await transporter.sendMail(...);
  emailsSentToday++;
}
```

### 4. Logs detallados

```typescript
transporter.sendMail({...}, (error, info) => {
  if (error) {
    console.error('Email error:', error);
  } else {
    console.log('Email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
});
```

---

## 📧 Emails Implementados

Tu proyecto ya tiene estos 3 emails listos:

### 1. 🎟️ Email de Entrada (Ticket)

- **Trigger:** Después de compra exitosa
- **Incluye:**
  - Detalles del evento
  - Código QR embebido
  - Link a la entrada online
  - Diseño responsive

### 2. 👋 Email de Bienvenida

- **Trigger:** Registro de nuevo usuario
- **Incluye:**
  - Mensaje de bienvenida
  - Beneficios de la plataforma
  - Link a eventos

### 3. ⭐ Email de Membresía

- **Trigger:** Activación de membresía premium
- **Incluye:**
  - Confirmación de membresía
  - Fecha de expiración
  - Beneficios premium
  - Link a eventos gratuitos

---

## 🎨 Personalización de Emails

### Cambiar colores

En `lib/email.ts`, busca los estilos CSS y modifica:

```typescript
const html = `
  <style>
    .header { 
      background: linear-gradient(135deg, #TU_COLOR 0%, #TU_COLOR 100%); 
    }
  </style>
`;
```

### Añadir logo

```typescript
<div class="header">
  <img src="https://tu-cdn.com/logo.png" alt="Logo" style="max-width: 150px;" />
  <h1>Tu Título</h1>
</div>
```

### Cambiar idioma

Los emails están en español. Para cambiar a inglés, edita los strings en `lib/email.ts`.

---

## ✅ Estado Actual

**Tu proyecto ya tiene:**

- ✅ Gmail SMTP configurado
- ✅ 3 tipos de emails implementados
- ✅ Templates HTML responsive y modernos
- ✅ QR codes embebidos
- ✅ Error handling y logging
- ✅ Emails en español

**Solo necesitas:**

1. ✅ Habilitar 2FA en Gmail
2. ✅ Generar contraseña de aplicación
3. ✅ Configurar `.env`
4. ✅ `npm install` (si no lo hiciste)
5. ✅ `npm run dev`
6. ✅ ¡Funciona! 🎉

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola para errores
2. Verifica que 2FA esté activo
3. Genera una nueva contraseña de aplicación
4. Verifica que no haya espacios en `SMTP_PASS`
5. Prueba con una cuenta de Gmail diferente

---

**Última actualización:** Enero 2025  
**Método actual:** Gmail SMTP ✅  
**Código listo:** `lib/email.ts`  
**Siguiente paso:** Configurar tus credenciales de Gmail 🚀
