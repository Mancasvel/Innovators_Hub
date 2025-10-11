# 🚀 Innovators Hub - Seville

A modern community platform for digital nomads and innovators in Seville, Spain.

## 📋 Main Features

- ✅ **Secure Authentication** with NextAuth (Credentials + OAuth ready)
- 🎟️ **Event Management System** with ticket purchases via Stripe
- 💳 **Premium Annual Membership** with free access to selected events
- 📷 **QR Code Scanner** for ticket validation by organizers (rear camera by default)
- 📧 **Transactional Emails** automated with Nodemailer
- 🖼️ **Image Upload** with UploadThing (multi-image support)
- 🔍 **Advanced Search & Filters** (search, category, dates, membership-free)
- 🔒 **Robust Security** with HMAC, rate limiting, and input validation
- 🎨 **Modern UI** with Tailwind CSS and Framer Motion
- 📊 **Organizer Dashboard** with real-time statistics
- 📱 **Fully Responsive** design for mobile, tablet, and desktop
- 🎫 **Capacity Control** with sold-out detection and atomic ticket increments
- ✏️ **Editable User Profiles** with email and name updates
- 🌐 **Multi-language Support** ready (i18n infrastructure)
- 📥 **QR Code Download** in ticket emails and user portal
- 📅 **Calendar Integration** - Add events to external calendars (Google, Apple, Outlook)
- 👥 **Event Attendants Management** - Organizers can view complete attendee lists with ticket details and digital check-in
- 📱 **Mobile-Optimized Interface** - Responsive design for all devices with mobile-first approach

## 🛠️ Technology Stack

- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB Atlas (Mongoose with indexing)
- **Authentication:** NextAuth v4 with JWT sessions
- **Payments:** Stripe (Checkout + Webhooks + Customer Portal)
- **Email:** Nodemailer (SMTP)
- **Image Storage:** UploadThing
- **Styling:** Tailwind CSS v3
- **Animations:** Framer Motion
- **Validation:** Zod schemas
- **QR Codes:** qrcode (generation) + @zxing/browser (scanning)
- **Rate Limiting:** Custom middleware
- **Internationalization:** next-intl (ready)

## 📁 Project Structure

```
innovators-hub/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Authentication and registration
│   │   │   └── register/      # User registration with role selection
│   │   ├── events/            # Event CRUD operations
│   │   │   └── [id]/          # Event detail and updates
│   │   ├── stripe/            # Stripe integration
│   │   │   ├── checkout/      # Create checkout sessions
│   │   │   ├── webhook/       # Handle Stripe events
│   │   │   └── portal/        # Customer portal access
│   │   ├── tickets/           # Ticket management
│   │   │   ├── validate/      # QR validation endpoint
│   │   │   └── free-claim/    # Free ticket claiming
│   │   ├── qr/                # QR code generation
│   │   ├── uploadthing/       # Image upload handlers
│   │   ├── organizer/         # Organizer-specific APIs
│   │   │   └── stats/         # Dashboard statistics
│   │   ├── user/              # User-specific APIs
│   │   │   ├── tickets/       # User ticket list
│   │   │   └── profile/       # Profile updates
│   │   └── admin/             # Admin APIs
│   │       └── export/        # Data export
│   ├── auth/                  # Auth pages
│   │   ├── login/            # Login page (responsive)
│   │   └── register/         # Registration with role selection
│   ├── events/               # Event pages
│   │   ├── page.tsx          # Events list with search/filters
│   │   └── [id]/             # Event detail page
│   ├── user/                 # User dashboard
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── tickets/          # Ticket management
│   │   ├── membership/       # Membership management
│   │   └── profile/          # Editable profile
│   ├── organizer/            # Organizer dashboard
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── events/           # Event management
│   │   │   ├── page.tsx      # Event list
│   │   │   ├── create/       # Create event form
│   │   │   └── [id]/edit/    # Edit event form
│   │   └── scan/             # QR scanner page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/               # Reusable components
│   ├── Navbar.tsx           # Responsive navbar with mobile menu
│   ├── Footer.tsx           # Site footer
│   ├── ImageUpload.tsx      # Multi-image upload with preview
│   ├── CalendarIntegration.tsx  # Add to calendar
│   ├── LanguageSwitcher.tsx     # Language selector
│   └── IntlProvider.tsx         # i18n provider
├── lib/                      # Utilities and configuration
│   ├── db.ts                # MongoDB connection with caching
│   ├── auth.ts              # NextAuth configuration
│   ├── stripe.ts            # Stripe client setup
│   ├── email.ts             # Email service with templates
│   ├── uploadthing.ts       # UploadThing helpers
│   ├── validation.ts        # Zod schemas
│   ├── permissions.ts       # Role-based access control
│   ├── i18n.ts              # Internationalization config
│   └── verifyTicket.ts      # HMAC ticket verification
├── models/                   # Mongoose models
│   ├── User.ts              # User model with roles
│   ├── Event.ts             # Event model with capacity
│   ├── Ticket.ts            # Ticket model with QR
│   └── Review.ts            # Review model (future)
├── messages/                 # i18n translations
│   ├── en.json              # English
│   └── es.json              # Spanish
├── types/                    # TypeScript definitions
├── middleware.ts             # Route protection & i18n
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind customization
├── i18n.ts                   # i18n routing config
└── package.json              # Dependencies
```

## 🚀 Installation and Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd innovators-hub
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and configure the following variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Innovators?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secure-secret-change-this-min-32-chars

# Stripe Configuration (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MEMBERSHIP_PRICE_ID=price_...

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@innovatorshub.com

# UploadThing (Image Storage)
UPLOADTHING_TOKEN=ut_token_your_actual_token_here_from_dashboard

# Security
SECRET_TICKET_KEY=your-hmac-secret-for-ticket-signatures-minimum-32-characters-required

# Debug (optional)
DEBUG=true
```

### 3. Set Up MongoDB Atlas

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Add your IP address to the IP whitelist (or allow all: 0.0.0.0/0 for development)
4. Create a database user with password
5. Get the connection string and add it to `MONGODB_URI`
6. Create a database named `Innovators`

**Important Collections:**
- `users` - User accounts with roles
- `events` - Event listings with capacity
- `tickets` - Purchased tickets with QR codes

### 4. Set Up Stripe

1. Create an account at [Stripe](https://stripe.com)
2. Get your API keys from the dashboard (use test mode)
3. Create an annual subscription product for membership:
   - Name: "Premium Membership"
   - Price: €99/year (or your preferred amount)
   - Recurring: Yearly
4. Copy the Price ID to `STRIPE_MEMBERSHIP_PRICE_ID`
5. Set up a webhook endpoint: `https://your-domain.com/api/stripe/webhook`
6. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Set Up Email (SMTP)

#### Option A: Gmail
1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
3. Use these settings:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password (16 characters)
   ```

#### Option B: Other SMTP Providers
- **SendGrid:** smtp.sendgrid.net:587
- **Mailgun:** smtp.mailgun.org:587
- **AWS SES:** email-smtp.region.amazonaws.com:587

### 6. Set Up UploadThing (Image Storage)

1. Create an account at [UploadThing](https://uploadthing.com)
2. Create a new app
3. Get your token from the dashboard
4. Add it to `UPLOADTHING_TOKEN`
5. Configure file size limits:
   - Event images: Max 4MB, up to 10 images
   - Profile images: Max 2MB, 1 image

See `IMAGE_STORAGE_GUIDE.md` for detailed instructions.

### 7. Generate Security Keys

```bash
# Generate NEXTAUTH_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SECRET_TICKET_KEY (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 8. Run in Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 9. Build for Production

```bash
npm run build
npm start
```

## 🎭 User Roles

### User (Regular User)
- Browse and search public events
- Purchase tickets via Stripe
- Manage premium membership subscription
- View tickets with QR codes
- Download tickets
- Edit profile (name, email)

### Member (Annual Subscriber)
- All user features
- Free access to membership-free events
- Priority access to events
- Special member badge

### Organizer
- All user features
- Create and manage events (with images)
- Set event capacity and pricing
- Scan and validate tickets with QR scanner
- View event statistics (tickets sold, revenue)
- Access organizer dashboard

### Admin
- All organizer features
- Manage any event in the system
- Export data (CSV)
- Full system access
- User management capabilities

## 🔐 Security Features

### Authentication & Authorization
- **JWT Sessions** with NextAuth signed tokens
- **Role-Based Access Control** (RBAC) middleware
- **Protected Routes** based on user roles
- **Secure Cookies** with httpOnly and secure flags

### Ticket Security
- **HMAC Signatures** on QR codes to prevent forgery
- **Unique QR Codes** generated with UUID v4
- **One-Time Use** validation system
- **Timestamp Tracking** for all validations
- **Organizer Verification** for scanning

### API Security
- **Rate Limiting** on critical endpoints (5 req/min for validation)
- **Input Validation** with Zod schemas
- **MongoDB Injection Prevention** via Mongoose
- **XSS Protection** via sanitization
- **CSRF Protection** built into NextAuth

### Data Security
- **Environment Variables** for all secrets
- **Encrypted Connections** (MongoDB TLS, Stripe HTTPS)
- **Password Hashing** with NextAuth bcrypt
- **Secure Image Upload** with UploadThing validation

## 📧 Email System

### Email Templates (English)

#### 1. Welcome Email
- **Trigger:** User registration
- **Content:**
  - Welcome message
  - Account type confirmation
  - Call-to-action to browse events
  - Orange button with white text

#### 2. Ticket Email
- **Trigger:** Successful ticket purchase
- **Content:**
  - Event details (title, date, location)
  - QR code embedded as base64 image
  - Ticket ID and purchase info
  - Capacity status (X/Y attendees)
  - Link to view all tickets
  - Orange button with white text
  - Important: Show QR at entrance

#### 3. Membership Email
- **Trigger:** Subscription activation
- **Content:**
  - Membership confirmation
  - Benefits list
  - Expiration date
  - Link to membership-free events
  - Orange button with white text

#### 4. Organizer Pending Email
- **Trigger:** User requests organizer role
- **Content:**
  - Request confirmation
  - Review pending notice
  - Admin will contact soon

### Email Configuration

All emails use:
- **From:** noreply@innovatorshub.com
- **Brand Color:** #FF6B35 (Seville Orange)
- **Button Style:** Orange background, white text
- **QR Codes:** Embedded as base64 data URLs
- **Responsive:** Mobile-friendly design

## 🎫 Ticket System Flow

### Purchase Flow
1. **User selects event** → Views details with capacity indicator
2. **Checks availability** → System shows "X/Y tickets sold"
3. **Initiates purchase:**
   - Free for members → Modal confirmation → Instant claim
   - Paid event → Stripe Checkout redirect
4. **Payment processing:**
   - Stripe handles payment
   - Webhook confirms successful payment
5. **Ticket creation:**
   - Generates unique UUID
   - Creates HMAC signature
   - **Atomic increment** of ticketsSold
   - Checks capacity before creating
6. **Email delivery:**
   - Sends ticket with embedded QR code
   - Shows updated capacity (including new ticket)
7. **User receives:**
   - Email with QR code
   - Access to ticket in user portal
   - Download option available

### Free Claim Flow (Members)
1. **Member clicks "Claim Free Ticket"**
2. **System validates:**
   - User has active membership
   - Event is membership-free
   - Capacity not exceeded
   - User doesn't already have ticket (1 per user)
3. **Atomic operation:**
   - Creates ticket
   - Increments ticketsSold
   - Checks capacity in same query
4. **Shows modal:**
   - Success: "Ticket claimed! Check your email"
   - Error: Specific reason (sold out, already claimed, etc.)
5. **Redirects:** To /user/tickets after 2 seconds

### Validation Flow
1. **Organizer opens scanner** → Rear camera activates by default
2. **Scans QR code** → ZXing library decodes
3. **System validates:**
   - QR format correct
   - HMAC signature valid
   - Ticket exists in database
   - Ticket status is 'valid' (not used)
   - Event matches ticket
4. **Updates ticket:**
   - Sets status to 'used'
   - Records timestamp (usedAt)
   - Logs validator ID (usedBy)
5. **Shows result:**
   - Success: Green screen with check mark
   - Error: Red screen with reason
   - Result stays visible until "Scan Next Ticket"
6. **Scanner pauses** → Manual control to scan next

### Capacity Control
- **Default capacity:** 50 attendees per event
- **Required field:** Cannot create event without capacity
- **Atomic operations:** Race condition prevention
- **Sold out detection:** Automatic based on capacity
- **Visual indicators:**
  - "X/Y sold" on event cards
  - "✓ Available tickets" or "⚠️ Sold Out"
  - Disabled purchase button when sold out

## 🔍 Search & Filter System

### Search Bar
- **Real-time search** (client-side filtering)
- **Searches in:**
  - Event titles
  - Descriptions
  - Locations
- **Auto-clear button** when typing
- **Responsive:** Full width on mobile

### Filters
- **Membership Free** (checkbox)
  - Shows only events free for members
  - Badge indicator when active
  
- **Category** (dropdown)
  - Networking
  - Workshop
  - Talk
  - Social
  - Other
  
- **Date Range** (date pickers)
  - From date (inclusive)
  - To date (end of day)
  - Partial ranges supported

### Filter UI
- **Expandable panel** with animation
- **Badge counter** shows active filters
- **Clear all button** when filters active
- **Results counter** shows "X of Y events"
- **Empty state** with helpful messages
- **Responsive:**
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 4 columns

## 🖼️ Image Upload System

### Multi-Image Support
- **Event images:** Up to 10 images per event
- **File size limit:** 4MB per image
- **Formats supported:** JPEG, PNG, WebP
- **Preview system:** See images before upload
- **Individual removal:** X button on each preview
- **Drag and drop:** Upload multiple files at once

### Upload Flow
1. Select images → Preview shown
2. Can remove images before final upload
3. Click upload → Sends to UploadThing
4. Returns CDN URLs → Stored in database
5. Images displayed in event gallery

### Image Display
- **Event cards:** First image as thumbnail
- **Event detail:** Gallery with responsive grid
  - 1 image: Full width
  - 2 images: 2 columns
  - 3+ images: 2-3 column grid
- **Tickets:** Event image in ticket card
- **Emails:** First image in email template

## 📱 Responsive Design

### Breakpoints (Tailwind)
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md)
- **Desktop:** > 1024px (lg)

### Components

#### Navbar
- **Desktop:** Full menu with links
- **Mobile:** Hamburger menu with slide-in drawer
- **User menu:** Dropdown with avatar

#### Event Cards
- **Mobile:** 1 column stack
- **Tablet:** 2 columns
- **Desktop:** 3 columns

#### Forms
- **Mobile:** Single column, stacked buttons
- **Desktop:** Multi-column grids, inline buttons

#### Search & Filters
- **Mobile:**
  - Stack vertically
  - Filters in 1 column
  - Full-width search
- **Desktop:**
  - Inline search + filter button
  - Filters in 4 columns

#### Dashboards
- **Mobile:** Card stack
- **Tablet:** 2-column grid
- **Desktop:** 3-column grid

## 🎨 Design System

### Color Palette
- **Primary:** #FF6B35 (Seville Orange)
- **Secondary:** #F7931E (Golden Orange)
- **Background:** #F9FAFB (Light Gray)
- **Text:** #111827 (Dark Gray)
- **Success:** #10B981 (Green)
- **Error:** #EF4444 (Red)
- **Warning:** #F59E0B (Amber)

### Typography
- **Font:** Inter (system font fallback)
- **Headings:** Bold, dark color
- **Body:** Regular, dark gray
- **Captions:** Small, medium gray

### Components
- **Cards:** White background, rounded corners, subtle shadow
- **Buttons:** Rounded, hover effects, disabled states
- **Inputs:** Border, focus ring, validation states
- **Badges:** Rounded full, small text, colored backgrounds

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project from GitHub/GitLab
   - Auto-detects Next.js

2. **Configure Environment Variables**
   - Add all .env.local variables
   - Set NEXT_PUBLIC_APP_URL to production URL

3. **Set Up Domains**
   - Configure custom domain
   - SSL certificate auto-generated

4. **Configure Stripe Webhook**
   - Update webhook URL to production
   - Use production API keys
   - Update STRIPE_WEBHOOK_SECRET

5. **Deploy**
   - Push to main branch
   - Automatic deployments
   - Preview deployments for PRs

### Environment Setup

```bash
# Build command
npm run build

# Output directory
.next

# Install command
npm install

# Node version
18.x or higher
```

## 🧪 Testing

### Test Stripe Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

### Test Email Sending

1. Use a test SMTP server like [Mailtrap](https://mailtrap.io)
2. Configure SMTP settings in .env.local
3. Register a new user
4. Check inbox for welcome email

### Test QR Scanner

1. Open organizer scan page
2. Allow camera permissions
3. Print a test QR code or use phone screen
4. Scan and verify validation works
5. Check database for updated ticket status

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** Cannot connect to MongoDB
```
Error: MongooseError: Operation timed out
```

**Solutions:**
- Verify IP address is whitelisted (or use 0.0.0.0/0)
- Check username/password are correct
- Ensure cluster is active (not paused)
- Test connection string with MongoDB Compass
- Check for firewall blocking port 27017

### Stripe Webhook Issues

**Problem:** Webhook not receiving events
```
Error: No signatures found matching the expected signature
```

**Solutions:**
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check webhook URL is publicly accessible
- Ensure you're using the correct environment (test/prod)
- Review webhook logs in Stripe dashboard
- Use Stripe CLI for local testing

### QR Scanner Not Working

**Problem:** Camera won't start

**Solutions:**
- Allow camera permissions in browser
- **Use HTTPS** (required for getUserMedia)
- Try different browser (Chrome recommended)
- Check camera is not in use by another app
- Use "Change Camera" button to try different cameras
- Fall back to manual entry if scanner fails

### Image Upload Failures

**Problem:** Images not uploading to UploadThing

**Solutions:**
- Verify UPLOADTHING_TOKEN is set correctly
- Check file size < 4MB
- Ensure file format is JPEG/PNG/WebP
- Check UploadThing dashboard for quota
- Review browser console for detailed errors
- Test with single small image first

### Email Not Sending

**Problem:** Emails not being delivered

**Solutions:**
- Verify SMTP credentials are correct
- Check SMTP_HOST and SMTP_PORT settings
- For Gmail: Use app-specific password
- Check spam folder
- Review server logs for SMTP errors
- Test with a simple SMTP test script
- Ensure sender email is verified

### Build Errors

**Problem:** npm run build fails

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Check TypeScript errors
npm run type-check

# Update dependencies
npm update
```

### Session/Auth Issues

**Problem:** Users logged out constantly

**Solutions:**
- Verify NEXTAUTH_SECRET is set (32+ chars)
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies
- Ensure cookies are not blocked
- Check session token in database

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique, indexed),
  password: string (hashed),
  role: 'user' | 'organizer' | 'admin',
  requestedRole: 'organizer' | null,
  hasMembership: boolean,
  membershipExpires: Date | null,
  stripeCustomerId: string | null (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### Events Collection
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  date: Date (indexed),
  location: string,
  price: number (in euros, not cents),
  membershipFree: boolean (indexed),
  capacity: number (required, default: 50),
  ticketsSold: number (default: 0),
  images: string[] (URLs, max 10),
  category: 'networking' | 'workshop' | 'talk' | 'social' | 'other',
  createdBy: ObjectId (ref: User, indexed),
  status: 'draft' | 'published' | 'cancelled' (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### Tickets Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  eventId: ObjectId (ref: Event),
  qrCode: string (unique, UUID v4),
  qrSignature: string (HMAC),
  status: 'valid' | 'used' | 'cancelled' | 'refunded',
  assisted: boolean,
  paymentId: string,
  purchasePrice: number,
  purchasedWithMembership: boolean,
  usedAt: Date | null,
  usedBy: ObjectId | null (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes for Performance
- Users: email, stripeCustomerId
- Events: date+status, createdBy, status, membershipFree
- Tickets: userId, eventId, qrCode

## 📈 Performance Optimizations

- **MongoDB Indexes** on frequently queried fields
- **Mongoose Lean Queries** for read-only operations
- **Connection Pooling** with cached connections
- **Image Optimization** via UploadThing CDN
- **Static Generation** for public pages
- **API Response Caching** where appropriate
- **Atomic Operations** for concurrent ticket purchases
- **Rate Limiting** to prevent abuse

## 🔜 Future Enhancements

- [ ] Admin panel for user management
- [ ] Advanced analytics dashboard
- [ ] Event reviews and ratings system
- [ ] Real-time chat for event attendees
- [ ] Push notifications for event reminders
- [ ] Social sharing features
- [ ] Waiting list for sold-out events
- [ ] Refund management system
- [ ] Discount codes and promotions
- [ ] Event calendar integration (Google, Apple)
- [ ] Multi-language support (Spanish, French, etc.)
- [ ] Mobile app (React Native)
- [ ] Email verification for new accounts
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, GitHub, etc.)

## 🧪 Testing

### Comprehensive Test Suite

The project includes a robust test suite with **150+ test cases** covering:

#### Test Categories
- ✅ **Unit Tests**: Utility functions (validation, permissions, ticket verification)
- ✅ **API Route Tests**: Authentication, events, tickets with security checks
- ✅ **Component Tests**: Navbar, ImageUpload with user interactions
- ✅ **Model Tests**: User, Event, Ticket schema validation
- ✅ **Integration Tests**: Complete ticket flow and authentication flow

#### Coverage Targets
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+
- **Statements**: 80%+

#### Running Tests

```bash
# Run all tests with coverage
npm test

# Watch mode for development
npm run test:watch

# CI environment
npm run test:ci

# View coverage report
# Open coverage/lcov-report/index.html after running
```

#### Security Testing
- ✅ Password hashing verification
- ✅ QR code signature tampering detection
- ✅ Role-based authorization
- ✅ Input validation and sanitization
- ✅ Atomic operations for race conditions
- ✅ Duplicate prevention mechanisms

See [TESTING.md](./TESTING.md) and [TEST_SUMMARY.md](./TEST_SUMMARY.md) for comprehensive documentation.

## 📄 License

Copyright (c) 2025 Manuel Castillejo

This software is licensed under a Single Commercial Use License.

This license grants the purchaser:
  - The right to use this codebase in one (1) commercial or non-commercial project.
  - The right to modify and deploy the code for that single project.

This license explicitly forbids:
  - Resale, redistribution, sublicensing, or making the code publicly available.
  - Using the codebase to build competing templates, generators, or similar products.
  - Sharing or publishing parts of the source code for others to use.

Violations of this license may result in legal action.

## 👥 Support

For support or inquiries: hello@innovatorshub.com

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Stripe](https://stripe.com/)
- [UploadThing](https://uploadthing.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

Made with ❤️ in Seville, Spain
