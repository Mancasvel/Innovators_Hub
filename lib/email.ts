import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

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
  const ticketUrl = `${APP_URL}/user/tickets`;
  
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate QR code as base64 data URL
  let qrCodeDataUrl: string;
  try {
    qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code for email');
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: #FF6B35; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .ticket { background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid #FF6B35; }
          .ticket h2 { color: #FF6B35; margin: 0 0 15px 0; font-size: 24px; }
          .ticket-info { margin: 10px 0; font-size: 16px; }
          .ticket-info strong { color: #333; }
          .qr-code { text-align: center; margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; }
          .qr-code img { max-width: 280px; width: 100%; height: auto; border: 3px solid #FF6B35; border-radius: 12px; padding: 15px; background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: block; margin: 0 auto; }
          .qr-code p { color: #666; font-size: 14px; margin-top: 15px; }
          .button { display: inline-block; background-color: #FF6B35 !important; color: #FFFFFF !important; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(255,107,53,0.3); font-size: 16px; }
          .button:hover { background-color: #F7931E !important; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px; color: #856404; font-size: 14px; }
          .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 13px; border-top: 1px solid #e0e0e0; }
          .footer a { color: #FF6B35; text-decoration: none; }
          @media only screen and (max-width: 600px) {
            .container { margin: 10px; }
            .content { padding: 20px; }
            .qr-code img { max-width: 220px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎟️ Your Ticket is Ready!</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
            <p style="font-size: 16px; color: #555;">Thank you for registering! Here is your ticket for:</p>
            
            <div class="ticket">
              <h2>${event.title}</h2>
              <div class="ticket-info">
                <p><strong>📅 Date:</strong> ${eventDate}</p>
                <p><strong>📍 Location:</strong> ${event.location}</p>
                ${event.capacity ? `<p><strong>👥 Capacity:</strong> ${event.ticketsSold}/${event.capacity} tickets sold</p>` : ''}
              </div>
            </div>

            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="Ticket QR Code" style="display: block; margin: 0 auto;" />
              <p><strong>Show this QR code at the event entrance</strong></p>
            </div>

            <div style="text-align: center;">
              <a href="${ticketUrl}" class="button" style="background-color: #FF6B35 !important; color: #FFFFFF !important;">View My Tickets</a>
            </div>

            <div class="warning">
              <strong>⚠️ Important:</strong> This QR code is unique and can only be used once. 
              Please do not share this email with others.
            </div>

            <p style="color: #555; font-size: 14px; margin-top: 30px;">
              If you have any questions, feel free to contact us by replying to this email.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Innovators Hub</strong> - Seville, Spain 🇪🇸</p>
            <p>Your community for digital nomads and innovators</p>
            <p style="margin-top: 10px;">
              <a href="${APP_URL}/events">View more events</a> | 
              <a href="${APP_URL}/user/tickets">My tickets</a>
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
      subject: `🎟️ Your Ticket: ${event.title}`,
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
 * @param emailType - 'standard' for regular users, 'organizer-pending' for organizer requests
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  emailType: 'standard' | 'organizer-pending' = 'standard'
) {
  const isOrganizerRequest = emailType === 'organizer-pending';
  const title = isOrganizerRequest
    ? 'Organizer Request Received! 🎯'
    : 'Welcome to Innovators Hub! 🎉';
  const subtitle = isOrganizerRequest
    ? 'Your organizer request is being reviewed'
    : 'We\'re excited to have you in our community of digital nomads and innovators in Seville!';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: #FF6B35; color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background-color: #FF6B35 !important; color: #FFFFFF !important; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(255,107,53,0.3); font-size: 16px; }
          .button:hover { background-color: #F7931E !important; }
          .features { margin: 30px 0; }
          .feature { padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #FF6B35; }
          .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">${title}</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Hi <strong>${userName}</strong>,</p>
            <p style="font-size: 16px; color: #555;">
              ${subtitle}
            </p>
            
            ${
              isOrganizerRequest
                ? `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0; color: #856404;"><strong>📋 Status:</strong> Pending review</p>
              <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
                An administrator will review your request and we'll contact you soon with more information.
                Meanwhile, you can explore events and use all regular user features.
              </p>
            </div>
            `
                : ''
            }
            
            <div class="features">
              <div class="feature">
                <strong>🎪 Exclusive Events</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Networking, workshops, talks and social events</p>
              </div>
              <div class="feature">
                <strong>⭐ Premium Membership</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Free access to selected events</p>
              </div>
              <div class="feature">
                <strong>🌟 Active Community</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Connect with people like you</p>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/events" class="button" style="background-color: #FF6B35 !important; color: #FFFFFF !important;">Explore Events</a>
            </div>

            <p style="color: #555; margin-top: 30px;">
              See you soon in Seville! ☀️
            </p>
            <p style="color: #333; font-weight: bold;">The Innovators Hub Team</p>
          </div>
          
          <div class="footer">
            <p><strong>Innovators Hub</strong> - Seville, Spain 🇪🇸</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const subject = isOrganizerRequest
    ? '🎯 Organizer Request Received'
    : 'Welcome to Innovators Hub! 🎉';

  try {
    await transporter.sendMail({
      from: `"Innovators Hub" <${FROM_EMAIL}>`,
      to,
      subject,
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
  const formattedDate = new Date(expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: #FFD700; color: #333; padding: 40px 20px; text-align: center; }
          .content { padding: 30px; }
          .membership-card { background: #FFD700; color: #333; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 8px 16px rgba(255,165,0,0.3); text-align: center; }
          .membership-card h2 { margin: 0 0 10px 0; font-size: 28px; }
          .button { display: inline-block; background-color: #FF6B35 !important; color: #FFFFFF !important; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(255,107,53,0.3); font-size: 16px; }
          .button:hover { background-color: #F7931E !important; }
          .benefits { margin: 30px 0; }
          .benefit { padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #FFD700; }
          .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">⭐ Welcome to Premium! ⭐</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Hi <strong>${userName}</strong>,</p>
            <p style="font-size: 16px; color: #555;">
              Your annual membership is now active! Enjoy free access to selected events.
            </p>
            
            <div class="membership-card">
              <div style="font-size: 48px; margin-bottom: 10px;">⭐</div>
              <h2>PREMIUM MEMBER</h2>
              <p style="font-size: 18px; margin: 15px 0;"><strong>Valid until:</strong></p>
              <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${formattedDate}</p>
            </div>

            <div class="benefits">
              <h3 style="color: #FF6B35; text-align: center;">Your Premium Benefits:</h3>
              <div class="benefit">
                <strong>🎟️ Free Tickets</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Free access to all events marked as "Free for members"</p>
              </div>
              <div class="benefit">
                <strong>⚡ Priority Booking</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Be the first to book popular events</p>
              </div>
              <div class="benefit">
                <strong>🎓 Exclusive Content</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Access to workshops and exclusive content for members</p>
              </div>
              <div class="benefit">
                <strong>🤝 Premium Networking</strong>
                <p style="margin: 5px 0 0 0; color: #666;">Connect with the best innovators in Seville</p>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${APP_URL}/events?membershipFree=true" class="button" style="background-color: #FF6B35 !important; color: #FFFFFF !important;">View Free Events</a>
            </div>

            <p style="color: #555; margin-top: 30px; text-align: center;">
              Thank you for supporting Innovators Hub! 💛
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Innovators Hub</strong> - Seville, Spain 🇪🇸</p>
            <p>Your community for digital nomads and innovators</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Innovators Hub" <${FROM_EMAIL}>`,
      to,
      subject: '⭐ Your Premium Membership is Active!',
      html,
    });
    console.log('✅ Membership email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending membership email:', error);
  }
}

export default transporter;
