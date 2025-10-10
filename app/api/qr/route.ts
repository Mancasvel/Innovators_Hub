import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

/**
 * Generate QR code image
 * GET /api/qr?code=xxx
 * Returns PNG image
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code parameter required' }, { status: 400 });
    }

    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(code, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return new NextResponse(qrBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}



