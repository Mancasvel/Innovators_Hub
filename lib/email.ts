import nodemailer from 'nodemailer';

/**
 * Email service using Gmail SMTP
 * Sends transactional emails and ticket notifications
 */

// SMTP Configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Verify SMTP configuration
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️ SMTP credentials not configured. Email functionality will be disabled.');
  console.warn('⚠️ Please set SMTP_USER and SMTP_PASS in your .env file');
}

// Create reusable transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Verify connection on startup (optional, for debugging)
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP connection error:', error);
    } else {
      console.log('✅ SMTP server is ready to send emails');
    }
  });
}

const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@unsent.app';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send ticket email with QR code
 */
export async function sendTicketEmail(
  to: string,
  userName: string,
  event: any,
  ticket: any
) {
  const ticketUrl = `${APP_URL}/user/tickets/${ticket._id}`;
  const qrImageUrl = `${APP_URL}/api/qr?code=${ticket.qrCode}`;
  
  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .ticket { background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid #FF6B35; }
          .ticket h2 { color: #FF6B35; margin: 0 0 15px 0; font-size: 24px; }
          .ticket-info { margin: 10px 0; font-size: 16px; }
          .ticket-info strong { color: #333; }
          .qr-code { text-align: center; margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; }
          .qr-code img { max-width: 220px; border: 3px solid #FF6B35; border-radius: 12px; padding: 15px; background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          .qr-code p { color: #666; font-size: 14px; margin-top: 15px; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white !important; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(255,107,53,0.3); transition: transform 0.2s; }
          .button:hover { transform: translateY(-2px); }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px; color: #856404; font-size: 14px; }
          .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 13px; border-top: 1px solid #e0e0e0; }
          .footer a { color: #FF6B35; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎟️ ¡Tu Entrada Está Lista!</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; color: #333;">Hola <strong>${userName}</strong>,</p>
            <p style="font-size: 16px; color: #555;">¡Gracias por registrarte! Aquí está tu entrada para:</p>
            
            <div class="ticket">
              <h2>${event.title}</h2>
              <div class="ticket-info">
                <p><strong>📅 Fecha:</strong> ${eventDate}</p>
                <p><strong>📍 Ubicación:</strong> ${event.location}</p>
                ${event.capacity ? `<p><strong>👥 Capacidad:</strong> ${event.ticketsSold}/${event.capacity} entradas vendidas</p>` : ''}
              </div>
            </div>

            <div class="qr-code">
              <img src="${qrImageUrl}" alt="QR Code" />
              <p><strong>Muestra este código QR en la entrada del evento</strong></p>
            </div>

            <div style="text-align: center;">
              <a href="${ticketUrl}" class="button">Ver Entrada Completa</a>
            </div>

            <div class="warning">
              <strong>⚠️ Importante:</strong> Este código QR es único y sólo puede usarse una vez. 
              Por favor, no compartas este email con otras personas.
            </div>

            <p style="color: #555; font-size: 14px; margin-top: 30px;">
              Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este email.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Innovators Hub</strong> - Sevilla, España 🇪🇸</p>
            <p>Tu comunidad de nómadas digitales e innovadores</p>
            <p style="margin-top: 10px;">
              <a href="${APP_URL}/events">Ver más eventos</a> | 
              <a href="${APP_URL}/user/tickets">Mis entradas</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Innovators Hub" <${FROM_EMAIL}>`,
      to,
      subject: `🎟️ Tu entrada: ${event.title}`,
      html,
    });

    console.log('✅ Ticket email sent via SMTP:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending ticket email:', error);
    throw error;
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white !important; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(255,107,53,0.3); }
          .features { margin: 30px 0; }
          .feature { padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #FF6B35; }
          .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">¡Bienvenido a Innovators Hub! 🎉</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Hola <strong>${userName}</strong>,</p>
            <p style="font-size: 16px; color: #555;">
              ¡Estamos emocionados de tenerte en nuestra comunidad de nómadas digitales e innovadores en Sevilla!
            </p>
            
            <div class="features">
              <div class="feature">
                <strong>🎪 Eventos Exclusivos</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Networking, talleres, charlas y eventos sociales</p>
              </div>
              <div class="feature">
                <strong>⭐ Membresía Premium</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Acceso gratuito a eventos seleccionados</p>
              </div>
              <div class="feature">
                <strong>🌟 Comunidad Activa</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Conecta con personas como tú</p>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/events" class="button">Explorar Eventos</a>
            </div>

            <p style="color: #555; margin-top: 30px;">
              ¡Nos vemos pronto en Sevilla! ☀️
            </p>
            <p style="color: #333; font-weight: bold;">El equipo de Innovators Hub</p>
          </div>
          
          <div class="footer">
            <p><strong>Innovators Hub</strong> - Sevilla, España 🇪🇸</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Innovators Hub" <${FROM_EMAIL}>`,
      to,
      subject: '¡Bienvenido a Innovators Hub! 🎉',
      html,
    });
    console.log('✅ Welcome email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
}

/**
 * Send membership confirmation email
 */
export async function sendMembershipEmail(
  to: string,
  userName: string,
  expiresAt: Date
) {
  const formattedDate = new Date(expiresAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #333; padding: 40px 20px; text-align: center; }
          .content { padding: 30px; }
          .membership-card { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #333; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 8px 16px rgba(255,165,0,0.3); text-align: center; }
          .membership-card h2 { margin: 0 0 10px 0; font-size: 28px; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white !important; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(255,107,53,0.3); }
          .benefits { margin: 30px 0; }
          .benefit { padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #FFD700; }
          .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">⭐ ¡Bienvenido a Premium! ⭐</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Hola <strong>${userName}</strong>,</p>
            <p style="font-size: 16px; color: #555;">
              ¡Tu membresía anual ya está activa! Disfruta de acceso gratuito a eventos seleccionados.
            </p>
            
            <div class="membership-card">
              <div style="font-size: 48px; margin-bottom: 10px;">⭐</div>
              <h2>MIEMBRO PREMIUM</h2>
              <p style="font-size: 18px; margin: 15px 0;"><strong>Válida hasta:</strong></p>
              <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${formattedDate}</p>
            </div>

            <div class="benefits">
              <h3 style="color: #FF6B35; text-align: center;">Tus Beneficios Premium:</h3>
              <div class="benefit">
                <strong>🎟️ Entradas Gratuitas</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Acceso sin coste a todos los eventos marcados como "Free for members"</p>
              </div>
              <div class="benefit">
                <strong>⚡ Reserva Prioritaria</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Sé el primero en reservar para eventos populares</p>
              </div>
              <div class="benefit">
                <strong>🎓 Contenido Exclusivo</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Acceso a talleres y workshops exclusivos para miembros</p>
              </div>
              <div class="benefit">
                <strong>🤝 Networking Premium</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Conecta con los mejores innovadores de Sevilla</p>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/events?membershipFree=true" class="button">Ver Eventos Gratuitos</a>
            </div>

            <p style="color: #555; margin-top: 30px; text-align: center;">
              ¡Gracias por apoyar a Innovators Hub! 💛
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Innovators Hub</strong> - Sevilla, España 🇪🇸</p>
            <p>Tu comunidad de nómadas digitales e innovadores</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Innovators Hub" <${FROM_EMAIL}>`,
      to,
      subject: '⭐ ¡Tu Membresía Premium está Activa!',
      html,
    });
    console.log('✅ Membership email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending membership email:', error);
  }
}

export default transporter;
