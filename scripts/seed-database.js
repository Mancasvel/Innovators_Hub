/**
 * Seed script for Innovators Hub database
 * Creates sample data for testing
 *
 * Usage: node scripts/seed-database.js
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const crypto = require('crypto')
require('dotenv').config({ path: '.env' })

// Simple schemas for seeding (without full validation)
const UserSchema = new mongoose.Schema({}, { strict: false })
const EventSchema = new mongoose.Schema({}, { strict: false })
const TicketSchema = new mongoose.Schema({}, { strict: false })

const User = mongoose.model('User', UserSchema)
const Event = mongoose.model('Event', EventSchema)
const Ticket = mongoose.model('Ticket', TicketSchema)

/**
 * Generate HMAC signature for QR code
 */
function generateHMAC (qrCode) {
  const secret =
    process.env.SECRET_TICKET_KEY || 'default-secret-key-for-testing'
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(qrCode)
  return hmac.digest('hex')
}

async function seedDatabase () {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Event.deleteMany({})
    await Ticket.deleteMany({})
    console.log('✅ Database cleared\n')

    // ========================================
    // 1. CREATE USERS
    // ========================================
    console.log('👥 Creating users...')

    const passwordHash = await bcrypt.hash('password123', 12)

    // Admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@innovatorshub.com',
      password: passwordHash,
      role: 'admin',
      hasMembership: true,
      membershipExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      stripeCustomerId: 'cus_admin_test_123',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Organizer user
    const organizer = await User.create({
      name: 'María González',
      email: 'maria@innovatorshub.com',
      password: passwordHash,
      role: 'organizer',
      hasMembership: true,
      membershipExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      stripeCustomerId: 'cus_organizer_test_456',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Regular user with membership
    const memberUser = await User.create({
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      password: passwordHash,
      role: 'user',
      hasMembership: true,
      membershipExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      stripeCustomerId: 'cus_member_test_789',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Regular user without membership
    const regularUser = await User.create({
      name: 'Ana Martínez',
      email: 'ana@example.com',
      password: passwordHash,
      role: 'user',
      hasMembership: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log(`✅ Created ${4} users`)
    console.log(`   - Admin: ${admin.email}`)
    console.log(`   - Organizer: ${organizer.email}`)
    console.log(`   - Member: ${memberUser.email}`)
    console.log(`   - Regular: ${regularUser.email}\n`)

    // ========================================
    // 2. CREATE EVENTS
    // ========================================
    console.log('📅 Creating events...')

    // Event 1: Free for members
    const event1 = await Event.create({
      title: 'Web3 Workshop for Beginners',
      description:
        'Learn the fundamentals of blockchain technology and Web3 development. Perfect for beginners who want to enter the decentralized world.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Innovators Hub, Calle Sierpes 45, Seville',
      price: 2500, // €25 for non-members
      membershipFree: true, // Free for members
      capacity: 50,
      ticketsSold: 0,
      category: 'workshop',
      createdBy: organizer._id,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Event 2: Paid event
    const event2 = await Event.create({
      title: 'Digital Nomad Networking Night',
      description:
        "Connect with fellow digital nomads, share experiences, and build meaningful relationships in Seville's vibrant tech community.",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      location: 'La Alameda Rooftop, Seville',
      price: 1500, // €15
      membershipFree: false, // Everyone pays
      capacity: 100,
      ticketsSold: 0,
      category: 'networking',
      createdBy: organizer._id,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Event 3: Free event
    const event3 = await Event.create({
      title: 'AI & Machine Learning Talk',
      description:
        'Discover the latest trends in artificial intelligence and machine learning with industry experts.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      location: 'Innovators Hub, Calle Sierpes 45, Seville',
      price: 0, // Free for everyone
      membershipFree: false,
      capacity: 80,
      ticketsSold: 0,
      category: 'talk',
      createdBy: admin._id,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Event 4: Past event (for testing history)
    const event4 = await Event.create({
      title: 'Startup Pitch Competition',
      description:
        'Watch innovative startups pitch their ideas to investors and win prizes.',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      location: 'Impact Hub Seville',
      price: 1000, // €10
      membershipFree: true,
      capacity: 60,
      ticketsSold: 3,
      category: 'other',
      createdBy: organizer._id,
      status: 'published',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    })

    console.log(`✅ Created ${4} events`)
    console.log(`   - ${event1.title}`)
    console.log(`   - ${event2.title}`)
    console.log(`   - ${event3.title}`)
    console.log(`   - ${event4.title}\n`)

    // ========================================
    // 3. CREATE TICKETS
    // ========================================
    console.log('🎟️  Creating tickets...')

    // Ticket 1: Member user - free ticket for event 1
    const qrCode1 = uuidv4()
    const ticket1 = await Ticket.create({
      userId: memberUser._id,
      eventId: event1._id,
      qrCode: qrCode1,
      qrSignature: generateHMAC(qrCode1),
      assisted: false,
      status: 'valid',
      paymentId: 'free-membership',
      purchasePrice: 0,
      purchasedWithMembership: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Ticket 2: Regular user - paid ticket for event 2
    const qrCode2 = uuidv4()
    const ticket2 = await Ticket.create({
      userId: regularUser._id,
      eventId: event2._id,
      qrCode: qrCode2,
      qrSignature: generateHMAC(qrCode2),
      assisted: false,
      status: 'valid',
      paymentId: 'pi_test_abc123',
      purchasePrice: 1500,
      purchasedWithMembership: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Ticket 3: Admin user - already used (past event)
    const qrCode3 = uuidv4()
    const ticket3 = await Ticket.create({
      userId: admin._id,
      eventId: event4._id,
      qrCode: qrCode3,
      qrSignature: generateHMAC(qrCode3),
      assisted: true,
      status: 'used',
      paymentId: 'free-membership',
      purchasePrice: 0,
      purchasedWithMembership: true,
      usedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      usedBy: organizer._id,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    })

    // Update ticketsSold count
    await Event.findByIdAndUpdate(event1._id, { ticketsSold: 1 })
    await Event.findByIdAndUpdate(event2._id, { ticketsSold: 1 })
    await Event.findByIdAndUpdate(event4._id, { ticketsSold: 1 })

    console.log(`✅ Created ${3} tickets`)
    console.log(`   - Ticket for ${memberUser.name} (free via membership)`)
    console.log(`   - Ticket for ${regularUser.name} (paid €15)`)
    console.log(`   - Ticket for ${admin.name} (used, past event)\n`)

    // ========================================
    // SUMMARY
    // ========================================
    console.log('='.repeat(50))
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!')
    console.log('='.repeat(50))
    console.log('\n📊 Summary:')
    console.log(`   Users: ${await User.countDocuments()}`)
    console.log(`   Events: ${await Event.countDocuments()}`)
    console.log(`   Tickets: ${await Ticket.countDocuments()}`)
    console.log('\n🔐 Test Credentials:')
    console.log('   Email: admin@innovatorshub.com')
    console.log('   Email: maria@innovatorshub.com (organizer)')
    console.log('   Email: carlos@example.com (member)')
    console.log('   Email: ana@example.com (regular user)')
    console.log('   Password (all): password123')
    console.log('\n💡 Next Steps:')
    console.log('   1. Start the app: npm run dev')
    console.log('   2. Login with any test account')
    console.log('   3. Test the flows!')
    console.log('\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
