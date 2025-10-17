# Testing Documentation

## Overview

This project includes comprehensive test coverage for all critical functionality, edge cases, and security features. The test suite is built using Jest and React Testing Library, with a minimum coverage target of 80%.

## Test Structure

### Unit Tests

#### Utility Functions (`__tests__/lib/`)

- **validation.test.ts**: Tests for Zod schemas and input validation
  - Registration, login, event creation schemas
  - Query parameter validation
  - Edge cases (empty values, invalid types, boundary conditions)

- **permissions.test.ts**: Tests for role-based access control
  - Admin identification
  - Organizer/admin checks
  - Membership validation
  - Event management permissions

- **verifyTicket.test.ts**: Tests for QR code generation and verification
  - Secure QR code generation
  - HMAC signature verification
  - Tamper detection
  - Edge cases (empty values, invalid signatures)

### API Route Tests (`__tests__/api/`)

#### Authentication

- **auth/register.test.ts**: User registration flow
  - Successful registration
  - Duplicate email prevention
  - Invalid data rejection
  - Organizer approval workflow
  - Email normalization
  - Security checks

#### Events

- **events/route.test.ts**: Event CRUD operations
  - Event creation with proper authorization
  - Event listing with filters
  - Search functionality
  - Category and date filtering
  - Permission enforcement
  - Default values

#### Tickets

- **tickets/validate.test.ts**: Ticket validation
  - Valid ticket scanning
  - Authentication requirements
  - Role-based validation access
  - Already-used ticket detection
  - Invalid signature rejection
  - Cancelled/refunded ticket handling

- **tickets/free-claim.test.ts**: Free ticket claiming
  - Member-free events
  - Price = 0 events (free for everyone)
  - Duplicate claim prevention
  - Capacity enforcement
  - Atomic operations
  - Authentication checks

### Component Tests (`__tests__/components/`)

- **Navbar.test.tsx**: Navigation component
  - Link rendering
  - Authentication state handling
  - Role-based menu items
  - Mobile menu toggling
  - Active route highlighting
  - Membership badge display

- **ImageUpload.test.tsx**: Image upload component
  - File selection
  - Preview display
  - Multiple image handling
  - Upload progress
  - Error handling
  - File type validation
  - Max image limit enforcement

### Model Tests (`__tests__/models/`)

#### User Model

- **User.test.ts**: User schema validation
  - Required fields
  - Email uniqueness
  - Role validation
  - Membership management
  - Timestamps
  - Email normalization
  - Stripe integration

#### Event Model

- **Event.test.ts**: Event schema validation
  - Required fields
  - Default values (capacity: 50, status: published)
  - Price constraints (min: 0)
  - Capacity constraints (min: 1, max: 10000)
  - Category validation
  - Image storage
  - Creator reference

#### Ticket Model

- **Ticket.test.ts**: Ticket schema validation
  - Required fields
  - Status types (valid, used, cancelled, refunded)
  - QR code uniqueness
  - User/Event references
  - Timestamps
  - Payment tracking
  - Membership flag

### Integration Tests (`__tests__/integration/`)

#### Ticket Flow

- **ticket-flow.test.ts**: End-to-end ticket operations
  - Free event ticket claiming
  - Member-free event access
  - Capacity tracking and enforcement
  - Atomic capacity updates
  - Ticket validation workflow
  - Security checks (QR reuse prevention, signature integrity)

#### Authentication Flow

- **auth-flow.test.ts**: End-to-end auth operations
  - User registration with all roles
  - Email uniqueness enforcement
  - Password hashing verification
  - Role-based access control
  - Event management permissions
  - Membership lifecycle
  - Admin approval workflow

## Running Tests

### All Tests with Coverage

```bash
npm test
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### CI Mode

```bash
npm run test:ci
```

### Coverage Report

Coverage reports are generated in the `coverage/` directory after running tests.

```bash
npm test
# Open coverage/lcov-report/index.html in browser
```

## Coverage Targets

The project enforces minimum coverage thresholds:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Categories

### Security Tests

- Password hashing (bcrypt)
- QR code signature verification
- HMAC tamper detection
- Role-based authorization
- Input validation and sanitization
- Duplicate prevention
- Capacity race conditions (atomic operations)

### Edge Cases

- Empty/null/undefined values
- Boundary conditions (min/max)
- Invalid data types
- Expired memberships
- Sold-out events
- Already-used tickets
- Duplicate claims
- Concurrent operations

### Regular Cases

- Standard user flows
- CRUD operations
- Authentication/authorization
- Payment processing
- Email delivery
- Image uploads
- Search and filtering

## Mocking Strategy

### External Services

- **next-auth**: Session management
- **next/navigation**: Router and navigation hooks
- **framer-motion**: Animation components
- **next/image**: Image optimization
- **uploadthing**: File uploads (in component tests)

### Database

Tests use actual MongoDB connections with test database for:

- Model validation tests
- Integration tests

### Environment Variables

All required environment variables are mocked in `jest.setup.js`

## Best Practices

1. **Isolation**: Each test is independent and cleans up after itself
2. **Descriptive Names**: Test names clearly describe what they verify
3. **AAA Pattern**: Arrange, Act, Assert structure
4. **Edge Cases**: Explicit tests for boundary conditions
5. **Security Focus**: Dedicated tests for security features
6. **Integration**: Critical flows tested end-to-end
7. **Mocking**: External dependencies properly mocked
8. **Coverage**: Comprehensive coverage of all critical paths

## Adding New Tests

When adding new features:

1. Write unit tests for new utility functions
2. Add API route tests with security checks
3. Test React components with user interactions
4. Verify model schemas and constraints
5. Create integration tests for critical flows
6. Ensure coverage targets are met

## Continuous Integration

Tests run automatically on:

- Pull requests
- Commits to main branch
- Pre-deployment checks

CI configuration uses `npm run test:ci` for optimal performance.

## Troubleshooting

### MongoDB Connection Issues

Ensure MongoDB is running locally or set `MONGODB_URI` in test environment.

### Timeout Errors

Increase Jest timeout in test file:

```javascript
jest.setTimeout(10000); // 10 seconds
```

### Coverage Not Meeting Threshold

Run with verbose coverage:

```bash
npm test -- --coverage --verbose
```

## Security Testing Checklist

- ✅ Authentication bypass attempts
- ✅ Authorization for protected routes
- ✅ Input validation and sanitization
- ✅ SQL/NoSQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection (via NextAuth)
- ✅ Password hashing verification
- ✅ QR code signature tampering
- ✅ Rate limiting (via API routes)
- ✅ Capacity race conditions
- ✅ Duplicate prevention
- ✅ Role escalation attempts

## Future Improvements

- [ ] E2E tests with Playwright/Cypress
- [ ] Performance/load testing
- [ ] Visual regression testing
- [ ] API contract testing
- [ ] Mutation testing
- [ ] Accessibility testing
