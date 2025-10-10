/**
 * Script to promote a user to organizer role
 * Usage: node scripts/create-organizer.js user@example.com
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function promoteToOrganizer(email) {
  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/create-organizer.js user@example.com');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Load User model
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { role: 'organizer' } },
      { new: true }
    );

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Successfully promoted ${email} to organizer`);
    console.log(`User ID: ${user._id}`);
    console.log(`Name: ${user.name}`);
    console.log(`New Role: ${user.role}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
promoteToOrganizer(email);



