
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../prisma/generated/client'

const prisma = new PrismaClient()

// Search bookings with semantic matching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!query) {
      return NextResponse.json(
        { message: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Build where clause for semantic search
    const whereClause: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { clientName: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Add date range if provided
    if (startDate && endDate) {
      whereClause.AND = {
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      }
    }

    // Enhanced semantic matching - split query into keywords
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2)
    if (keywords.length > 0) {
      // Add additional OR conditions for each keyword
      keywords.forEach(keyword => {
        whereClause.OR.push(
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { category: { contains: keyword, mode: 'insensitive' } }
        )
      })
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
    console.error('Error searching bookings:', error)
    return NextResponse.json(
      { message: 'Failed to search bookings' },
      { status: 500 }
    )
  }
}

// Get all unique categories for filtering
export async function POST(request: NextRequest) {
  try {
    const categories = await prisma.booking.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      where: {
        category: {
          not: null,
        },
      },
    })

    const uniqueCategories = categories
      .map(item => item.category)
      .filter(Boolean)
      .sort()

    return NextResponse.json(uniqueCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
