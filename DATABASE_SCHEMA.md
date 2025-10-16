# 🗄️ MongoDB Schema Documentation - Innovators Hub

## Overview

Este documento describe el esquema completo de la base de datos MongoDB para Innovators Hub, incluyendo todas las entidades, relaciones, índices y lógica de negocio.

## 📊 Diagrama de Relaciones

```
┌─────────────┐
│    User     │
│  (Usuario)  │
└──────┬──────┘
       │
       │ createdBy
       ├──────────────┐
       │              │
       │ userId       │
       ▼              ▼
┌─────────────┐   ┌─────────────┐
│   Ticket    │   │    Event    │
│  (Entrada)  │◄──│  (Evento)   │
└─────────────┘   └─────────────┘
       ▲              │
       │              │ eventId
       └──────────────┘
```

## 🧍‍♂️ User (Usuario)

Representa cualquier usuario registrado en la plataforma.

### Schema

```typescript
interface IUser {
  _id: ObjectId; // ID único generado por MongoDB
  name: string; // Nombre completo del usuario
  email: string; // Email único (usado para login)
  password?: string; // Hash bcrypt de la contraseña (opcional para OAuth)
  role: "user" | "organizer" | "admin"; // Rol del usuario
  image?: string; // URL de imagen de perfil
  emailVerified?: Date; // Fecha de verificación de email
  stripeCustomerId?: string; // ID de cliente en Stripe
  hasMembership: boolean; // true = membresía anual activa
  membershipExpires?: Date; // Fecha de expiración de la membresía
  createdAt: Date; // Fecha de registro
  updatedAt: Date; // Última actualización
}
```

### Validaciones

- `name`: Requerido, 2-100 caracteres
- `email`: Requerido, único, formato email válido, lowercase
- `password`: Mínimo 8 caracteres, hasheado con bcrypt (salt rounds: 12)
- `role`: Enum ['user', 'organizer', 'admin'], default: 'user'
- `hasMembership`: Boolean, default: false
- `stripeCustomerId`: Único (sparse index para permitir nulls)

### Índices

```javascript
{ email: 1 }                              // Búsqueda por email (login)
{ stripeCustomerId: 1 }                   // Búsqueda por customer ID (webhooks)
{ hasMembership: 1, membershipExpires: 1 } // Filtrar usuarios con membresía activa
```

### Roles

- **user**: Usuario regular, puede comprar tickets y gestionar su cuenta
- **organizer**: Puede crear eventos y escanear tickets (+ permisos de user)
- **admin**: Acceso completo a todas las funcionalidades

### Lógica de Negocio

1. **Registro**:
   - Password se hashea con bcrypt antes de guardar
   - Role inicial: 'user'
   - Email de bienvenida enviado automáticamente

2. **Membresía**:
   - `hasMembership` se actualiza vía webhook de Stripe
   - Cuando subscription.status === 'active' → hasMembership = true
   - Cuando subscription.deleted → hasMembership = false
   - `membershipExpires` se sincroniza con current_period_end de Stripe

3. **Promoción a Organizer**:
   - Manualmente vía script: `npm run create-organizer email@example.com`
   - O directamente en MongoDB Atlas

## 🎤 Event (Evento)

Representa un evento creado por un organizador.

### Schema

```typescript
interface IEvent {
  _id: ObjectId; // ID único
  title: string; // Título del evento
  description: string; // Descripción detallada
  date: Date; // Fecha y hora del evento
  location: string; // Ubicación física
  price: number; // Precio en céntimos (2500 = €25.00)
  membershipFree: boolean; // Si true, miembros entran gratis
  capacity?: number; // Capacidad máxima (opcional)
  ticketsSold: number; // Contador de tickets vendidos
  image?: string; // URL de imagen del evento
  category?: string; // Categoría del evento
  createdBy: ObjectId; // Referencia a User (organizador)
  status: string; // Estado: draft | published | cancelled
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Última actualización
}
```

### Validaciones

- `title`: Requerido, 3-150 caracteres
- `description`: Requerido, 10-2000 caracteres
- `date`: Requerido, debe ser fecha futura
- `location`: Requerido, mínimo 3 caracteres
- `price`: Requerido, mínimo 0
- `membershipFree`: Boolean, default: false
- `capacity`: Opcional, mínimo 1 si se especifica
- `ticketsSold`: Default: 0, mínimo 0
- `category`: Enum ['networking', 'workshop', 'talk', 'social', 'other']
- `status`: Enum ['draft', 'published', 'cancelled'], default: 'published'
- `createdBy`: Requerido, ObjectId válido

### Índices

```javascript
{ date: 1, status: 1 }        // Listar eventos próximos publicados
{ createdBy: 1 }              // Ver eventos de un organizador
{ status: 1 }                 // Filtrar por estado
{ membershipFree: 1 }         // Encontrar eventos gratis para miembros
```

### Lógica de Negocio

1. **Creación**:
   - Solo usuarios con role 'organizer' o 'admin' pueden crear
   - Validación: fecha debe ser futura
   - `ticketsSold` inicia en 0

2. **Edición**:
   - Solo el creador o admin puede editar
   - No se puede modificar `createdBy` ni `ticketsSold` directamente

3. **Eliminación**:
   - Soft delete: cambia status a 'cancelled'
   - No elimina físicamente el registro

4. **Verificación de Capacidad**:
   - Al vender ticket: verificar `ticketsSold < capacity`
   - Si se alcanza capacidad: mostrar "Sold Out"

5. **Precio para Miembros**:
   ```javascript
   if (event.membershipFree && user.hasMembership) {
     finalPrice = 0; // Gratis
   } else {
     finalPrice = event.price; // Precio normal
   }
   ```

## 🎟️ Ticket (Entrada)

Representa un ticket comprado por un usuario para un evento.

### Schema

```typescript
interface ITicket {
  _id: ObjectId; // ID único
  userId: ObjectId; // Referencia a User (comprador)
  eventId: ObjectId; // Referencia a Event
  qrCode: string; // UUID único del ticket
  qrSignature: string; // Firma HMAC para validación
  assisted: boolean; // true = usuario asistió (escaneado)
  status: TicketStatus; // Estado del ticket
  paymentId?: string; // ID de pago de Stripe (opcional)
  purchasePrice: number; // Precio pagado en céntimos
  purchasedWithMembership: boolean; // true si obtenido vía membresía
  usedAt?: Date; // Fecha/hora de escaneo
  usedBy?: ObjectId; // Referencia a User (organizador que escaneó)
  createdAt: Date; // Fecha de compra/creación
  updatedAt: Date; // Última actualización
}

type TicketStatus = "valid" | "used" | "cancelled" | "refunded";
```

### Validaciones

- `userId`: Requerido, ObjectId válido
- `eventId`: Requerido, ObjectId válido
- `qrCode`: Requerido, único, formato UUID v4
- `qrSignature`: Requerido, firma HMAC SHA-256
- `assisted`: Boolean, default: false
- `status`: Enum ['valid', 'used', 'cancelled', 'refunded'], default: 'valid'
- `paymentId`: Opcional (no requerido para tickets gratuitos)
- `purchasePrice`: Requerido, mínimo 0
- `purchasedWithMembership`: Boolean, default: false

### Índices

```javascript
{ userId: 1, eventId: 1 }     // Tickets de un usuario para un evento
{ qrCode: 1, status: 1 }      // Validación rápida de QR
{ eventId: 1, status: 1 }     // Estadísticas por evento
{ qrCode: 1 }                 // Búsqueda única (unique index)
{ assisted: 1 }               // Contar asistentes
```

### Generación de QR Code

```javascript
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

// 1. Generar UUID único
const qrCode = uuidv4();

// 2. Firmar con HMAC
const secret = process.env.SECRET_TICKET_KEY;
const hmac = crypto.createHmac("sha256", secret);
hmac.update(qrCode);
const qrSignature = hmac.digest("hex");

// 3. Crear ticket
const ticket = {
  qrCode,
  qrSignature,
  // ... otros campos
};
```

### Validación de QR Code

```javascript
// En /api/tickets/validate

// 1. Verificar firma HMAC
const expectedSignature = crypto
  .createHmac("sha256", SECRET_KEY)
  .update(ticket.qrCode)
  .digest("hex");

if (ticket.qrSignature !== expectedSignature) {
  return { error: "Invalid signature" };
}

// 2. Verificar status
if (ticket.status !== "valid") {
  return { error: "Ticket not valid" };
}

// 3. Verificar si ya fue usado
if (ticket.assisted === true) {
  return { error: "Ticket already used", code: "ALREADY_USED" };
}

// 4. Marcar como usado (atomic update)
const updated = await Ticket.findOneAndUpdate(
  { _id: ticket._id, status: "valid", assisted: false },
  {
    status: "used",
    assisted: true,
    usedAt: new Date(),
    usedBy: organizerId,
  },
  { new: true },
);

if (!updated) {
  return { error: "Concurrent validation" };
}

return { success: true, ticket: updated };
```

### Lógica de Negocio

1. **Creación de Ticket**:

   **Caso A: Compra Normal (Stripe)**

   ```
   Usuario → Click "Buy Ticket" → Stripe Checkout
   → Pago exitoso → Webhook → Crear Ticket → Email con QR
   ```

   **Caso B: Ticket Gratis (Membresía)**

   ```
   Usuario (miembro) → Click "Get Free Ticket"
   → Verificar event.membershipFree && user.hasMembership
   → Crear Ticket → Email con QR
   ```

2. **Estados del Ticket**:
   - `valid` + `assisted: false`: Ticket válido, no usado
   - `valid` + `assisted: true`: Equivalente a `used` (legacy support)
   - `used`: Ticket escaneado, usuario asistió
   - `cancelled`: Ticket cancelado (evento cancelado)
   - `refunded`: Ticket reembolsado

3. **Escaneo y Validación**:

   ```
   Organizador → Scanner → Lee QR → POST /api/tickets/validate
   → Verifica HMAC → Verifica status → Marca assisted = true
   → Response con datos del usuario
   ```

4. **Email con QR**:
   - Enviado automáticamente después de crear el ticket
   - Incluye: detalles del evento, QR code embebido, link al ticket
   - Via Resend API

## 🔗 Relaciones Entre Entidades

### User → Event (1:N)

- Un usuario puede crear múltiples eventos
- Campo: `Event.createdBy → User._id`
- Tipo: Reference (ObjectId)
- Cascade: No delete (mantener eventos si se borra usuario)

### User → Ticket (1:N)

- Un usuario puede tener múltiples tickets
- Campo: `Ticket.userId → User._id`
- Tipo: Reference (ObjectId)
- Cascade: Opcional (decidir si borrar tickets con usuario)

### Event → Ticket (1:N)

- Un evento puede tener múltiples tickets
- Campo: `Ticket.eventId → Event._id`
- Tipo: Reference (ObjectId)
- Cascade: No delete (mantener historial)

### User → Ticket (N:1) - Validador

- Un organizador puede validar múltiples tickets
- Campo: `Ticket.usedBy → User._id`
- Tipo: Reference (ObjectId)
- Opcional: Solo se llena cuando se escanea

## 📈 Consultas Comunes

### 1. Listar eventos próximos

```javascript
const events = await Event.find({
  status: "published",
  date: { $gte: new Date() },
}).sort({ date: 1 });
```

### 2. Obtener tickets de un usuario

```javascript
const tickets = await Ticket.find({ userId })
  .populate("eventId")
  .sort({ createdAt: -1 });
```

### 3. Verificar si usuario ya tiene ticket

```javascript
const existingTicket = await Ticket.findOne({
  userId,
  eventId,
  status: { $in: ["valid", "used"] },
});
```

### 4. Contar tickets vendidos

```javascript
const soldCount = await Ticket.countDocuments({
  eventId,
  status: { $ne: "cancelled" },
});
```

### 5. Estadísticas de organizador

```javascript
const events = await Event.find({ createdBy: userId });
const eventIds = events.map((e) => e._id);

const stats = {
  totalEvents: events.length,
  totalTickets: await Ticket.countDocuments({ eventId: { $in: eventIds } }),
  assistedTickets: await Ticket.countDocuments({
    eventId: { $in: eventIds },
    assisted: true,
  }),
};
```

## 🔒 Seguridad

### 1. Prevención de Falsificación de Tickets

- QR code firmado con HMAC SHA-256
- Secret key en variable de entorno
- Verificación en cada validación

### 2. Protección Contra Race Conditions

- Atomic updates con condiciones:
  ```javascript
  findOneAndUpdate(
    { _id, status: "valid", assisted: false }, // Condición
    { status: "used", assisted: true }, // Update
    { new: true },
  );
  ```

### 3. Rate Limiting

- Máximo 50 validaciones por minuto por organizador
- Implementado en `/api/tickets/validate`

### 4. Validación de Entrada

- Zod schemas en todos los endpoints
- Sanitización de strings
- Verificación de tipos de ObjectId

## 📊 Ejemplo de Datos

Ver archivo: `scripts/seed-database.js` para ejemplos completos.

### Comando de Seed

```bash
npm run seed-db
```

Crea:

- 4 usuarios (admin, organizador, miembro, usuario regular)
- 4 eventos (mixto de próximos y pasados)
- 3 tickets (válidos, usados, gratuitos)

## 🛠️ Mantenimiento

### Backup

```bash
mongodump --uri="$MONGODB_URI" --out=./backup/$(date +%Y%m%d)
```

### Restore

```bash
mongorestore --uri="$MONGODB_URI" --drop ./backup/20250110
```

### Limpiar tickets expirados

```javascript
// Tickets de eventos pasados hace más de 1 año
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

const expiredEvents = await Event.find({
  date: { $lt: oneYearAgo },
}).select("_id");

await Ticket.deleteMany({
  eventId: { $in: expiredEvents.map((e) => e._id) },
});
```

---

**Última actualización:** Enero 2025  
**Versión del schema:** 1.0.0  
**MongoDB versión:** 6.0+  
**Mongoose versión:** 8.0+
