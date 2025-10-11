import { GET } from '@/app/api/tickets/free-claim/route'
import { NextRequest } from 'next/server'
import Event from '@/models/Event'
import Ticket from '@/models/Ticket'
import User from '@/models/User'
import { connectDB } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { sendTicketEmail } from '@/lib/email'

jest.mock('@/lib/db')
jest.mock('@/models/Event')
jest.mock('@/models/Ticket')
jest.mock('@/models/User')
jest.mock('next-auth')
jest.mock('@/lib/email')
jest.mock('@/lib/verifyTicket', () => ({
  generateSecureQRCode: jest.fn(() => ({
    qrCode: 'generated-qr-code',
    signature: 'generated-signature',
  })),
}))

describe('GET /api/tickets/free-claim', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should claim free ticket for member when event is free', async () => {
    const mockSession = {
      user: { id: 'user123' },
    }

    const mockEvent = {
      _id: 'event123',
      title: 'Free Event',
      membershipFree: true,
      price: 0,
      capacity: 50,
      ticketsSold: 10,
    }

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      hasMembership: true,
    }

    const mockUpdatedEvent = {
      ...mockEvent,
      ticketsSold: 11,
    }

    const mockTicket = {
      _id: 'ticket123',
      qrCode: 'generated-qr-code',
      userId: 'user123',
      eventId: 'event123',
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Event.findById as jest.Mock).mockResolvedValue(mockEvent)
    ;(User.findById as jest.Mock).mockResolvedValue(mockUser)
    ;(Ticket.findOne as jest.Mock).mockResolvedValue(null)
    ;(Event.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedEvent)
    ;(Ticket.create as jest.Mock).mockResolvedValue(mockTicket)
    ;(sendTicketEmail as jest.Mock).mockResolvedValue(undefined)

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=event123'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user123',
        eventId: 'event123',
        purchasePrice: 0,
      })
    )
  })

  it('should claim free ticket for non-member when event price is 0', async () => {
    const mockSession = {
      user: { id: 'user123' },
    }

    const mockEvent = {
      _id: 'event123',
      title: 'Free Event',
      membershipFree: false,
      price: 0, // Free for everyone
      capacity: 50,
      ticketsSold: 10,
    }

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      hasMembership: false,
    }

    const mockUpdatedEvent = {
      ...mockEvent,
      ticketsSold: 11,
    }

    const mockTicket = {
      _id: 'ticket123',
      qrCode: 'generated-qr-code',
      userId: 'user123',
      eventId: 'event123',
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Event.findById as jest.Mock).mockResolvedValue(mockEvent)
    ;(User.findById as jest.Mock).mockResolvedValue(mockUser)
    ;(Ticket.findOne as jest.Mock).mockResolvedValue(null)
    ;(Event.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedEvent)
    ;(Ticket.create as jest.Mock).mockResolvedValue(mockTicket)
    ;(sendTicketEmail as jest.Mock).mockResolvedValue(undefined)

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=event123'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should reject claim without authentication', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=event123'
    )

    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it('should reject claim for non-member on paid event', async () => {
    const mockSession = {
      user: { id: 'user123' },
    }

    const mockEvent = {
      _id: 'event123',
      title: 'Paid Event',
      membershipFree: true,
      price: 20,
      capacity: 50,
      ticketsSold: 10,
    }

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      hasMembership: false,
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Event.findById as jest.Mock).mockResolvedValue(mockEvent)
    ;(User.findById as jest.Mock).mockResolvedValue(mockUser)

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=event123'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toContain('membership')
  })

  it('should reject duplicate ticket claim', async () => {
    const mockSession = {
      user: { id: 'user123' },
    }

    const mockEvent = {
      _id: 'event123',
      title: 'Free Event',
      membershipFree: true,
      price: 0,
      capacity: 50,
      ticketsSold: 10,
    }

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      hasMembership: true,
    }

    const existingTicket = {
      _id: 'existing-ticket',
      userId: 'user123',
      eventId: 'event123',
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Event.findById as jest.Mock).mockResolvedValue(mockEvent)
    ;(User.findById as jest.Mock).mockResolvedValue(mockUser)
    ;(Ticket.findOne as jest.Mock).mockResolvedValue(existingTicket)

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=event123'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.code).toBe('ALREADY_CLAIMED')
  })

  it('should reject claim when event is sold out', async () => {
    const mockSession = {
      user: { id: 'user123' },
    }

    const mockEvent = {
      _id: 'event123',
      title: 'Sold Out Event',
      membershipFree: true,
      price: 0,
      capacity: 50,
      ticketsSold: 50, // At capacity
    }

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      hasMembership: true,
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Event.findById as jest.Mock).mockResolvedValue(mockEvent)
    ;(User.findById as jest.Mock).mockResolvedValue(mockUser)
    ;(Ticket.findOne as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=event123'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.code).toBe('SOLD_OUT')
  })

  it('should handle capacity check atomically', async () => {
    const mockSession = {
      user: { id: 'user123' },
    }

    const mockEvent = {
      _id: 'event123',
      title: 'Event',
      membershipFree: true,
      price: 0,
      capacity: 50,
      ticketsSold: 49,
    }

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      hasMembership: true,
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Event.findById as jest.Mock).mockResolvedValue(mockEvent)
    ;(User.findById as jest.Mock).mockResolvedValue(mockUser)
    ;(Ticket.findOne as jest.Mock).mockResolvedValue(null)
    ;(Event.findOneAndUpdate as jest.Mock).mockResolvedValue(null) // Sold out during atomic update

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=event123'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.code).toBe('SOLD_OUT')
  })

  it('should reject claim for non-existent event', async () => {
    const mockSession = {
      user: { id: 'user123' },
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Event.findById as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=nonexistent'
    )

    const response = await GET(request)
    expect(response.status).toBe(404)
  })

  it('should reject claim for non-free event', async () => {
    const mockSession = {
      user: { id: 'user123' },
    }

    const mockEvent = {
      _id: 'event123',
      title: 'Paid Event',
      membershipFree: false,
      price: 20,
      capacity: 50,
      ticketsSold: 10,
    }

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      hasMembership: true,
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(connectDB as jest.Mock).mockResolvedValue(undefined)
    ;(Event.findById as jest.Mock).mockResolvedValue(mockEvent)
    ;(User.findById as jest.Mock).mockResolvedValue(mockUser)

    const request = new NextRequest(
      'http://localhost:3000/api/tickets/free-claim?eventId=event123'
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.code).toBe('NOT_FREE')
  })
})

