/**
 * Script to check if all environment variables are properly configured
 * Usage: node scripts/setup-check.js
 */

require('dotenv').config({ path: '.env' })

const requiredVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_MEMBERSHIP_PRICE_ID',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'SECRET_TICKET_KEY'
]

const optionalVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']

console.log('🔍 Checking environment variables...\n')

let allGood = true
const warnings = []

// Check required variables
console.log('📋 Required Variables:')
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: MISSING`)
    allGood = false
  } else if (value.includes('your-') || value.includes('tu-')) {
    console.log(`⚠️  ${varName}: Set but looks like placeholder`)
    warnings.push(varName)
  } else {
    const preview = value.length > 20 ? value.substring(0, 20) + '...' : value
    console.log(`✅ ${varName}: ${preview}`)
  }
})

// Check optional variables
console.log('\n📋 Optional Variables (for Google OAuth):')
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  if (!value) {
    console.log(`⚪ ${varName}: Not set (optional)`)
  } else {
    const preview = value.length > 20 ? value.substring(0, 20) + '...' : value
    console.log(`✅ ${varName}: ${preview}`)
  }
})

// Check SECRET_TICKET_KEY length
if (
  process.env.SECRET_TICKET_KEY &&
  process.env.SECRET_TICKET_KEY.length < 32
) {
  console.log(
    '\n⚠️  WARNING: SECRET_TICKET_KEY should be at least 32 characters'
  )
  warnings.push('SECRET_TICKET_KEY too short')
}

// Summary
console.log('\n' + '='.repeat(50))
if (allGood && warnings.length === 0) {
  console.log('✅ All environment variables are properly configured!')
  console.log('\nYou can now run: npm run dev')
} else if (!allGood) {
  console.log('❌ Some required environment variables are missing.')
  console.log('\nPlease check your .env file and refer to SETUP_GUIDE.md')
  process.exit(1)
} else {
  console.log(
    `⚠️  Configuration complete but with ${warnings.length} warning(s).`
  )
  console.log('\nWarnings:')
  warnings.forEach((w) => console.log(`  - ${w}`))
  console.log('\nThe app may work but double-check these values.')
}

console.log('='.repeat(50))
