# 📸 Image Storage Guide - Innovators Hub

Guía completa para manejar imágenes en la plataforma.

## 🎯 Solución Elegida: Uploadthing

**Uploadthing** es la solución recomendada por ser:
- ✅ Específicamente diseñada para Next.js
- ✅ Hosting automático en CDN global
- ✅ Optimización automática de imágenes
- ✅ Integración nativa con Vercel
- ✅ Plan gratuito generoso (2GB storage, 2GB bandwidth/mes)
- ✅ No requiere configuración de buckets

## 🚀 Setup de Uploadthing

### 1. Crear cuenta

1. Ve a https://uploadthing.com
2. Sign in con GitHub
3. Crea un nuevo proyecto: "Innovators Hub"

### 2. Obtener credenciales

En el dashboard de Uploadthing:
1. Ve a "API Keys"
2. Copia:
   - `UPLOADTHING_SECRET` (sk_live_...)
   - `UPLOADTHING_APP_ID` (tu ID de app)

### 3. Configurar variables de entorno

Añade a tu `.env`:

```bash
UPLOADTHING_SECRET=sk_live_your_secret_here
UPLOADTHING_APP_ID=your_app_id_here
```

### 4. Instalar dependencias

```bash
npm install uploadthing @uploadthing/react react-dropzone
```

Ya está todo configurado en el proyecto! ✅

## 📁 Estructura de Archivos

```
app/
├── api/
│   └── uploadthing/
│       ├── core.ts          # Configuración de upload
│       └── route.ts         # API route handler
components/
└── ImageUpload.tsx          # Componente de upload
lib/
└── uploadthing.ts           # Helper components
```

## 🎨 Uso del Componente ImageUpload

### En cualquier formulario:

```tsx
import ImageUpload from '@/components/ImageUpload';

function MyForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUpload
      value={imageUrl}
      onChange={setImageUrl}
      disabled={loading}
    />
  );
}
```

### Características del componente:

- ✅ Drag & drop
- ✅ Click para seleccionar archivo
- ✅ Preview de imagen
- ✅ Botón para remover
- ✅ Validación de tamaño (4MB max)
- ✅ Validación de tipo (imágenes solamente)
- ✅ Alternativa: pegar URL directa
- ✅ Loading states
- ✅ Error handling

## 🔒 Seguridad

### Middleware de autenticación

```typescript
// app/api/uploadthing/core.ts

.middleware(async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!isOrganizerOrAdmin(session)) {
    throw new Error("Only organizers can upload");
  }

  return { userId: session.user.id };
})
```

### Restricciones:

- **Tamaño máximo:** 4MB para event images, 2MB para profiles
- **Tipos permitidos:** PNG, JPG, JPEG, GIF, WEBP
- **Autenticación:** Requerida para upload
- **Autorización:** Solo organizers/admins para event images

## 📸 Tipos de Upload Configurados

### 1. Event Images

```typescript
endpoint: 'eventImage'
max size: 4MB
max files: 1
permissions: organizer, admin
```

### 2. Profile Images

```typescript
endpoint: 'profileImage'
max size: 2MB
max files: 1
permissions: authenticated users
```

## 🌐 URLs Generadas

Las imágenes subidas obtienen URLs del CDN:

```
https://utfs.io/f/abc123...xyz.jpg
```

Características:
- ✅ HTTPS seguro
- ✅ CDN global (ultra-rápido)
- ✅ Optimización automática
- ✅ Permanente (no expira)
- ✅ Compatible con Next.js Image

## 🖼️ Uso con Next.js Image

```tsx
import Image from 'next/image';

<Image
  src={event.image}
  alt={event.title}
  width={800}
  height={400}
  className="object-cover"
/>
```

No olvides añadir el dominio en `next.config.js`:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'utfs.io', // Uploadthing CDN
    ],
  },
}
```

## 🔄 Alternativas (si prefieres otras soluciones)

### 1. **Cloudinary** (Más potente, más complejo)

```bash
npm install cloudinary next-cloudinary
```

**Pros:** Transformaciones avanzadas, video support  
**Cons:** Más configuración, límites más restrictivos en free tier

### 2. **Vercel Blob** (Integración nativa)

```bash
npm install @vercel/blob
```

**Pros:** Integración perfecta con Vercel  
**Cons:** Solo disponible en planes de pago

### 3. **AWS S3** (Máximo control)

```bash
npm install @aws-sdk/client-s3 aws-sdk
```

**Pros:** Totalmente personalizable, escalable  
**Cons:** Requiere configuración compleja de buckets, IAM, etc.

### 4. **Supabase Storage** (Open source)

```bash
npm install @supabase/supabase-js
```

**Pros:** Open source, generoso free tier  
**Cons:** Requiere cuenta y proyecto de Supabase

## 📊 Comparación de Soluciones

| Característica | Uploadthing | Cloudinary | Vercel Blob | AWS S3 |
|----------------|-------------|------------|-------------|--------|
| **Setup** | ⭐⭐⭐⭐⭐ Muy fácil | ⭐⭐⭐ Medio | ⭐⭐⭐⭐ Fácil | ⭐⭐ Difícil |
| **Free Tier** | 2GB storage | 25GB storage | ❌ Pago | 5GB storage |
| **CDN** | ✅ Global | ✅ Global | ✅ Global | ✅ Global |
| **Next.js** | ✅ Nativo | ✅ Compatible | ✅ Nativo | ⚠️ Manual |
| **Optimización** | ✅ Auto | ✅ Avanzada | ✅ Auto | ❌ Manual |
| **Costo** | $10/mes (10GB) | $0-99/mes | $0.03/GB | $0.023/GB |

## 💡 Recomendación

Para **Innovators Hub**:

**Usar Uploadthing** porque:
1. Setup ultra-rápido (5 minutos)
2. Perfecto para Next.js + Vercel
3. Free tier suficiente para empezar
4. CDN global incluido
5. Optimización automática
6. Seguridad incorporada

**Migrar a Cloudinary** solo si:
- Necesitas transformaciones avanzadas (filtros, watermarks)
- Vas a manejar video
- Necesitas más de 25GB de storage gratis

## 🔧 Troubleshooting

### Error: "Unauthorized"
→ Verifica que el usuario tiene sesión activa y rol correcto

### Error: "File too large"
→ Imagen excede 4MB, comprime antes de subir

### Imagen no carga
→ Verifica que el dominio `utfs.io` está en `next.config.js`

### Upload muy lento
→ Uploadthing usa CDN, pero archivos muy grandes tardan. Comprime imágenes.

## 📱 Optimización de Imágenes

### Antes de subir (cliente):

```bash
# Comprimir con ImageOptim, TinyPNG, o:
npx sharp-cli input.jpg --output output.jpg --quality 85
```

### En el servidor (automático):

Uploadthing optimiza automáticamente, pero puedes configurar:

```typescript
// core.ts
eventImage: f({ 
  image: { 
    maxFileSize: "4MB",
    maxFileCount: 1,
  } 
})
.middleware(...)
.onUploadComplete(async ({ file }) => {
  // file.url ya está optimizado
  return { url: file.url };
})
```

## 🚀 Deployment

### Vercel (automático)

1. Añade las variables de entorno en Vercel dashboard
2. Deploy → funciona automáticamente

### Otros hosts

Uploadthing funciona en cualquier host que soporte Next.js:
- Railway
- Render
- Netlify
- AWS Amplify

Solo asegúrate de configurar las variables de entorno.

---

## ✅ Checklist Final

- [x] Cuenta de Uploadthing creada
- [x] API keys configuradas en `.env`
- [x] Componente `ImageUpload` implementado
- [x] Dominio `utfs.io` añadido a `next.config.js`
- [x] Middleware de autenticación configurado
- [x] Validaciones de tamaño y tipo
- [x] Error handling implementado

**¡Listo para producción!** 🎉

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Solución:** Uploadthing + Next.js 15

