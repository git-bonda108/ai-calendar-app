
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../prisma/generated/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const bookingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
})

// Get bookings for a specific month
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    let whereClause = {}
    
    if (month) {
      const [year, monthNum] = month.split('-')
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)
      
      whereClause = {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc',
      },
    })

    // Convert BigInt to string for JSON serialization
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      id: booking.id.toString(),
    }))

    return NextResponse.json(serializedBookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// Create a new booking
// Update an existing booking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const validatedData = bookingSchema.parse(updateData)
    const startTime = new Date(validatedData.startTime)
    const endTime = new Date(validatedData.endTime)

    // Validate that end time is after start time
    if (endTime <= startTime) {
      return NextResponse.json(
        { message: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check for conflicts (excluding the current booking)
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        AND: [
          { id: { not: id } },
          {
            startTime: {
              lt: endTime,
            },
          },
          {
            endTime: {
              gt: startTime,
            },
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { message: 'Time slot conflicts with existing booking' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        startTime,
        endTime,
        clientName: validatedData.clientName || null,
        clientEmail: validatedData.clientEmail || null,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { message: 'Booking ID is required' },
        { status: 400 }
      )
    }

    await prisma.booking.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { message: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔶 =============== BOOKING API POST REQUEST ===============')
    const body = await request.json()
    console.log('📥 BOOKING API RECEIVED BODY:', JSON.stringify(body, null, 2))
    
    const validatedData = bookingSchema.parse(body)
    console.log('✅ BOOKING DATA VALIDATION PASSED:', JSON.stringify(validatedData, null, 2))

    const startTime = new Date(validatedData.startTime)
    const endTime = new Date(validatedData.endTime)

    // Validate that end time is after start time
    if (endTime <= startTime) {
      return NextResponse.json(
        { message: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check for conflicts
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        AND: [
          {
            startTime: {
              lt: endTime,
            },
          },
          {
            endTime: {
              gt: startTime,
            },
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { message: 'Time slot conflicts with existing booking' },
        { status: 400 }
      )
    }

    console.log('🔄 CREATING BOOKING IN DATABASE...')
    const booking = await prisma.booking.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        startTime,
        endTime,
        clientName: validatedData.clientName || null,
        clientEmail: validatedData.clientEmail || null,
      },
    })

    console.log('🎉 BOOKING CREATED SUCCESSFULLY IN DATABASE:', JSON.stringify(booking, null, 2))

    // Convert BigInt to string for JSON serialization
    const serializedBooking = {
      ...booking,
    }

    console.log('📤 RETURNING SERIALIZED BOOKING:', JSON.stringify(serializedBooking, null, 2))
    console.log('🔶 =============== BOOKING API POST SUCCESS ===============')
    return NextResponse.json(serializedBooking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
