
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../prisma/generated/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Return common booking categories instead of database training types
    const categories = [
      {
        id: '1',
        name: 'Meeting',
        description: 'General business meetings and discussions',
        category: 'Business',
        duration: 60
      },
      {
        id: '2', 
        name: 'Training',
        description: 'Professional development and learning sessions',
        category: 'Education',
        duration: 120
      },
      {
        id: '3',
        name: 'Consultation',
        description: 'Client consultations and advice sessions', 
        category: 'Service',
        duration: 60
      },
      {
        id: '4',
        name: 'Workshop',
        description: 'Interactive learning and skill development',
        category: 'Education', 
        duration: 180
      },
      {
        id: '5',
        name: 'Review',
        description: 'Performance reviews and feedback sessions',
        category: 'Business',
        duration: 90
      }
    ]

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
