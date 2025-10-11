import '@testing-library/jest-dom'

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only-minimum-32-chars'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.SECRET_TICKET_KEY = 'test-hmac-secret-for-testing-minimum-32-characters'
process.env.UPLOADTHING_TOKEN = 'test-uploadthing-token'
process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789'
process.env.SMTP_HOST = 'smtp.test.com'
process.env.SMTP_PORT = '587'
process.env.SMTP_USER = 'test@test.com'
process.env.SMTP_PASS = 'test-password'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

