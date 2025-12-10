/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google OAuth profile images
      'utfs.io' // Uploadthing CDN for event images
    ]
  },
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  // Enable experimental features for App Router
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', 'innovatorshub.com']
    }
  }
}

module.exports = nextConfig
