
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../prisma/generated/client'

const prisma = new PrismaClient()

// Current system date - FIXED: Use real current date (Today is July 5, 2025 - Saturday)
const CURRENT_DATE = new Date() // Use real current date instead of hardcoded

// DATE VALIDATION HELPER FUNCTIONS
function isDateInPast(date: Date): boolean {
  const currentDateOnly = new Date(CURRENT_DATE)
  currentDateOnly.setHours(0, 0, 0, 0)
  
  const inputDateOnly = new Date(date)
  inputDateOnly.setHours(0, 0, 0, 0)
  
  const isPast = inputDateOnly.getTime() < currentDateOnly.getTime()
  console.log(`🚨 DATE VALIDATION CHECK:`)
  console.log(`   Current Date: ${currentDateOnly.toDateString()} (${currentDateOnly.getTime()})`)
  console.log(`   Requested Date: ${inputDateOnly.toDateString()} (${inputDateOnly.getTime()})`)
  console.log(`   Is Past Date: ${isPast ? 'YES - WILL BLOCK' : 'NO - WILL ALLOW'}`)
  return isPast
}

function validateDateForOperation(date: Date | undefined, operation: 'CREATE' | 'UPDATE' | 'DELETE'): { isValid: boolean; error?: string } {
  if (!date) {
    return { 
      isValid: false, 
      error: `Please specify a date for the ${operation.toLowerCase()} operation.` 
    }
  }
  
  if (isDateInPast(date)) {
    return { 
      isValid: false, 
      error: `Cannot ${operation.toLowerCase()} sessions for past dates. Please choose a current or future date.` 
    }
  }
  
  return { isValid: true }
}

// SIMPLIFIED CONVERSATION STATE FOR RELIABILITY
interface ConversationState {
  sessionId: string
  lastIntent: 'book' | 'query' | 'delete' | 'update' | 'general' | null
  partialBookingInfo: {
    date?: Date
    time?: { hour: number; minute: number }
    duration?: number
    category?: string
    clientName?: string
    title?: string
  }
}

// SIMPLIFIED SESSION MANAGEMENT FOR WORKING CREATE/QUERY OPERATIONS
const conversationStates = new Map<string, ConversationState>()

function getSessionId(): string {
  return 'simple_session' // Use single session for simplicity during rollback
}

function getConversationState(): ConversationState {
  const sessionId = getSessionId()
  if (!conversationStates.has(sessionId)) {
    conversationStates.set(sessionId, {
      sessionId,
      lastIntent: null,
      partialBookingInfo: {}
    })
  }
  return conversationStates.get(sessionId)!
}

// ENHANCED INFORMATION EXTRACTION FOR ALL OPERATIONS INCLUDING NEW FEATURES
interface ExtractedInfo {
  intent: 'book' | 'query' | 'delete' | 'update' | 'system_date' | 'free_slots' | 'general'
  date?: Date
  time?: { hour: number; minute: number }
  endTime?: { hour: number; minute: number }
  duration?: number
  category?: string
  confidence: number
  isCurrentMonthQuery?: boolean // For "show all free slots" queries
}

function extractInformationFromMessage(message: string): ExtractedInfo {
  const lowerMessage = message.toLowerCase()
  let confidence = 0
  
  console.log(`🔍 EXTRACTING INFO FROM: "${message}"`)
  
  // STEP 1: ENHANCED INTENT DETECTION - Include all operations plus new features
  let intent: 'book' | 'query' | 'delete' | 'update' | 'system_date' | 'free_slots' | 'general' = 'general'
  
  const bookingKeywords = ['book', 'schedule', 'create', 'add', 'set up', 'arrange', 'plan', 'reserve']
  const queryKeywords = ['show', 'what', 'when', 'which', 'sessions', 'bookings', 'check', 'see', 'display', 'tell me', 'find', 'have', 'do i have', 'list', 'view']
  const deleteKeywords = ['delete', 'remove', 'cancel', 'clear', 'cancel appointment', 'cancel meeting', 'clear calendar', 'remove booking']
  const updateKeywords = ['update', 'change', 'modify', 'edit', 'reschedule', 'move', 'shift', 'adjust', 'change time', 'move to']
  const confirmationKeywords = ['yes', 'yeah', 'yep', 'confirm', 'correct', 'right', 'book it', 'go ahead', 'proceed']
  
  // NEW: System date query keywords
  const systemDateKeywords = ['today', 'current date', 'what is today', 'whats today', 'today date', 'current day', 'what day is it', 'what date is it']
  
  // NEW: Free slots query keywords
  const freeSlotsKeywords = ['free slots', 'available slots', 'free time', 'available time', 'when am i free', 'show free', 'available', 'open slots', 'what slots are free']
  
  // DEBUGGING: Check each keyword array individually
  console.log(`🔍 DEBUGGING INTENT DETECTION FOR: "${lowerMessage}"`)
  
  const confirmationMatches = confirmationKeywords.filter(keyword => lowerMessage.includes(keyword))
  const deleteMatches = deleteKeywords.filter(keyword => lowerMessage.includes(keyword))  
  const updateMatches = updateKeywords.filter(keyword => lowerMessage.includes(keyword))
  const queryMatches = queryKeywords.filter(keyword => lowerMessage.includes(keyword))
  const bookingMatches = bookingKeywords.filter(keyword => lowerMessage.includes(keyword))
  
  // NEW: Check for system date and free slots matches
  const systemDateMatches = systemDateKeywords.filter(keyword => lowerMessage.includes(keyword))
  const freeSlotsMatches = freeSlotsKeywords.filter(keyword => lowerMessage.includes(keyword))
  
  console.log(`📊 KEYWORD MATCHES:`)
  console.log(`   Confirmation: [${confirmationMatches.join(', ')}]`)
  console.log(`   Delete: [${deleteMatches.join(', ')}]`) 
  console.log(`   Update: [${updateMatches.join(', ')}]`)
  console.log(`   Query: [${queryMatches.join(', ')}]`)
  console.log(`   Booking: [${bookingMatches.join(', ')}]`)
  console.log(`   System Date: [${systemDateMatches.join(', ')}]`)
  console.log(`   Free Slots: [${freeSlotsMatches.join(', ')}]`)

  // Handle confirmation messages first
  if (confirmationMatches.length > 0) {
    intent = 'book'
    confidence += 80
    console.log(`✅ CONFIRMATION INTENT SELECTED`)
  } 
  // NEW: Handle system date queries with high priority
  else if (systemDateMatches.length > 0) {
    intent = 'system_date'
    confidence += 90  // High confidence for system date queries
    console.log(`✅ SYSTEM DATE INTENT SELECTED - matched: [${systemDateMatches.join(', ')}]`)
  }
  // NEW: Handle free slots queries with high priority  
  else if (freeSlotsMatches.length > 0) {
    intent = 'free_slots'
    confidence += 85  // High confidence for free slots queries
    console.log(`✅ FREE SLOTS INTENT SELECTED - matched: [${freeSlotsMatches.join(', ')}]`)
  }
  // PRIORITIZE DELETE DETECTION OVER UPDATE - Critical fix for "remove" misclassification
  else if (deleteMatches.length > 0) {
    intent = 'delete'
    confidence += 70  // Increased confidence for delete operations
    console.log(`✅ DELETE INTENT SELECTED - matched: [${deleteMatches.join(', ')}]`)
  } 
  else if (updateMatches.length > 0) {
    intent = 'update'
    confidence += 60
    console.log(`✅ UPDATE INTENT SELECTED - matched: [${updateMatches.join(', ')}]`)
  } 
  else if (queryMatches.length > 0) {
    intent = 'query'
    confidence += 60
    console.log(`✅ QUERY INTENT SELECTED - matched: [${queryMatches.join(', ')}]`)
  } else if (bookingMatches.length > 0) {
    intent = 'book'
    confidence += 50
    console.log(`✅ BOOKING INTENT SELECTED - matched: [${bookingMatches.join(', ')}]`)
  }

  console.log(`Intent detected: ${intent} (confidence: ${confidence})`)
  
  // STEP 2: ENHANCED DATE PARSING - Handle all query types including free slots
  let date: Date | undefined
  let isCurrentMonthQuery = false
  
  if (lowerMessage.includes('today')) {
    date = new Date(CURRENT_DATE)
    confidence += 25
  } else if (lowerMessage.includes('tomorrow')) {
    date = new Date(CURRENT_DATE)
    date.setDate(date.getDate() + 1)
    confidence += 25
  }
  
  // NEW: Handle "show all free slots" queries (for current month)
  if (intent === 'free_slots' && (lowerMessage.includes('all free') || lowerMessage.includes('show free') || lowerMessage.includes('all slots'))) {
    isCurrentMonthQuery = true
    date = new Date(CURRENT_DATE) // Set to current date for context
    confidence += 30
    console.log(`📅 Current month free slots query detected`)
  }
  
  // Handle specific dates like "July 12", "12-Jul", "7th Jun" 
  if (!date || (intent === 'free_slots' && !isCurrentMonthQuery)) {
    const datePatterns = [
      /(\d{1,2})[-\/](?:july|jul)/i,
      /(?:july|jul)\s+(\d{1,2})/i,
      /(\d{1,2})(?:st|nd|rd|th)?\s+(?:june|jun)/i,  // NEW: Handle "7th Jun"
      /(?:june|jun)\s+(\d{1,2})/i,                   // NEW: Handle "Jun 7th"
      /(\d{1,2})(?:st|nd|rd|th)?\s+(?:july|jul)/i,  // NEW: Handle "7th Jul" 
      /(\d{1,2})[-\/](?:june|jun)/i                  // NEW: Handle "7-Jun"
    ]
    
    for (const pattern of datePatterns) {
      const match = message.match(pattern)
      if (match) {
        const day = parseInt(match[1])
        const year = CURRENT_DATE.getFullYear()
        
        // Determine month based on pattern
        let month = 6 // July (0-indexed)
        if (pattern.source.includes('june|jun')) {
          month = 5 // June (0-indexed)
        }
        
        date = new Date(year, month, day)
        confidence += 25
        console.log(`📅 Date parsed: ${date.toDateString()}`)
        break
      }
    }
  }

  // STEP 3: ENHANCED TIME PARSING - Handle UPDATE vs CREATE contexts differently
  let time: { hour: number; minute: number } | undefined
  let endTime: { hour: number; minute: number } | undefined
  let duration: number | undefined
  
  // For UPDATE operations, handle "from X to Y" differently than CREATE operations
  if (intent === 'update') {
    console.log(`🕐 PARSING UPDATE TIME from message: "${message}"`)
    
    // UPDATE-specific pattern: "from X:XX PM to Y:YY PM" means change start time from X:XX to Y:YY
    const updateTimePattern = /from\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)\s+to\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)/i
    const updateTimeMatch = message.match(updateTimePattern)
    
    if (updateTimeMatch) {
      // For UPDATE: "from 9:30 AM to 10:00 AM" means NEW start time is 10:00 AM
      let newStartHour = parseInt(updateTimeMatch[4])  // Use the target time hour (group 4)
      const newStartMinute = parseInt(updateTimeMatch[5] || '0')  // Use target time minutes (group 5, default 0)
      const newStartMeridiem = updateTimeMatch[6].toLowerCase()  // Use target time meridiem (group 6)
      
      // Convert to 24-hour format
      if (newStartMeridiem === 'pm' && newStartHour !== 12) newStartHour += 12
      if (newStartMeridiem === 'am' && newStartHour === 12) newStartHour = 0
      
      time = { hour: newStartHour, minute: newStartMinute }
      confidence += 40
      console.log(`🎯 UPDATE TIME PARSED: New start time will be ${newStartHour}:${newStartMinute.toString().padStart(2, '0')}`)
    } else {
      // Fallback: look for "to X PM" or "at X PM" patterns for updates
      const simpleUpdatePattern = /(?:to|at)\s+(\d{1,2})\s*(pm|am)/i
      const simpleUpdateMatch = message.match(simpleUpdatePattern)
      
      if (simpleUpdateMatch) {
        let newHour = parseInt(simpleUpdateMatch[1])
        const newMeridiem = simpleUpdateMatch[2].toLowerCase()
        
        if (newMeridiem === 'pm' && newHour !== 12) newHour += 12
        if (newMeridiem === 'am' && newHour === 12) newHour = 0
        
        time = { hour: newHour, minute: 0 }
        confidence += 30
        console.log(`🎯 UPDATE TIME PARSED (simple): New start time will be ${newHour}:00`)
      }
    }
  } else {
    // For CREATE/other operations: Parse time ranges like "4 PM to 5 PM" as session duration
    const timeRangePattern = /(\d{1,2})\s*(pm|am)\s+(?:to|until|-)\s+(\d{1,2})\s*(pm|am)/i
    const timeRangeMatch = message.match(timeRangePattern)
    
    if (timeRangeMatch) {
      let startHour = parseInt(timeRangeMatch[1])
      const startMeridiem = timeRangeMatch[2].toLowerCase()
      let endHour = parseInt(timeRangeMatch[3])
      const endMeridiem = timeRangeMatch[4].toLowerCase()
      
      // Convert to 24-hour format
      if (startMeridiem === 'pm' && startHour !== 12) startHour += 12
      if (startMeridiem === 'am' && startHour === 12) startHour = 0
      if (endMeridiem === 'pm' && endHour !== 12) endHour += 12
      if (endMeridiem === 'am' && endHour === 12) endHour = 0
      
      time = { hour: startHour, minute: 0 }
      endTime = { hour: endHour, minute: 0 }
      duration = endHour - startHour
      confidence += 30
    } else {
      // Parse single time like "2 PM"
      const singleTimePattern = /(\d{1,2})\s*(am|pm)/i
      const singleTimeMatch = message.match(singleTimePattern)
      
      if (singleTimeMatch) {
        let hour = parseInt(singleTimeMatch[1])
        const meridiem = singleTimeMatch[2].toLowerCase()
        
        if (meridiem === 'pm' && hour !== 12) hour += 12
        if (meridiem === 'am' && hour === 12) hour = 0
        
        time = { hour, minute: 0 }
        duration = 1 // Default 1 hour
        confidence += 20
      }
    }
  }

  // STEP 4: BASIC CATEGORY DETECTION
  let category: string | undefined
  const categoryKeywords = {
    'training': 'Training',
    'meeting': 'Meeting',
    'azure': 'Azure',
    'python': 'Python'
  }
  
  for (const [keyword, cat] of Object.entries(categoryKeywords)) {
    if (lowerMessage.includes(keyword)) {
      category = cat
      confidence += 10
      break
    }
  }

  return {
    intent,
    date,
    time,
    endTime,
    duration,
    category,
    confidence,
    isCurrentMonthQuery
  }
}
// SIMPLIFIED SMART DEFAULTS FOR WORKING CREATE OPERATIONS
async function applySmartDefaults(extracted: ExtractedInfo): Promise<{
  startTime?: Date
  endTime?: Date
  category: string
  clientName: string
  title: string
}> {
  console.log('🔧 APPLYING SMART DEFAULTS TO:', extracted)
  
  // Use extracted date or default to tomorrow
  let workingDate = extracted.date
  if (!workingDate) {
    workingDate = new Date(CURRENT_DATE)
    workingDate.setDate(CURRENT_DATE.getDate() + 1)
  }

  // Use extracted time or default to 10 AM
  const hour = extracted.time?.hour ?? 10
  const minute = extracted.time?.minute ?? 0
  
  // Create start time
  const startTime = new Date(workingDate.getTime())
  startTime.setHours(hour, minute, 0, 0)
  
  // Create end time (1 hour later or use duration)
  const endTime = new Date(startTime.getTime())
  if (extracted.endTime) {
    endTime.setHours(extracted.endTime.hour, extracted.endTime.minute, 0, 0)
  } else {
    const duration = extracted.duration ?? 1
    endTime.setTime(startTime.getTime() + (duration * 60 * 60 * 1000))
  }
  
  const defaults = {
    startTime,
    endTime,
    category: extracted.category || 'Training',
    clientName: 'Client',
    title: extracted.category ? `${extracted.category} Training` : 'Training Session'
  }

  console.log('✅ SMART DEFAULTS APPLIED:', defaults)
  return defaults
}

// SIMPLIFIED BOOKING EXECUTOR FOR WORKING CREATE OPERATIONS
async function executeBooking(extracted: ExtractedInfo, defaults: any): Promise<{
  success: boolean
  booking?: any
  error?: string
}> {
  console.log('=== SIMPLIFIED BOOKING EXECUTION START ===')
  console.log('Creating booking with defaults:', defaults)

  // Validate we have required information
  if (!defaults.startTime || !defaults.endTime) {
    return {
      success: false,
      error: 'Missing required time information'
    }
  }

  // 🚨 DATE VALIDATION: Check if booking date is in the past
  const dateValidation = validateDateForOperation(defaults.startTime, 'CREATE')
  if (!dateValidation.isValid) {
    console.log('❌ DATE VALIDATION FAILED FOR CREATE:', dateValidation.error)
    return {
      success: false,
      error: dateValidation.error
    }
  }

  try {
    // Prepare booking data
    const requestBody = {
      title: defaults.title,
      description: 'Session scheduled via Schedula AI',
      category: defaults.category,
      startTime: defaults.startTime.toISOString(),
      endTime: defaults.endTime.toISOString(),
      clientName: defaults.clientName,
    }

    console.log('📝 CREATING BOOKING WITH DATA:', requestBody)

    // Call the booking API
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bookings`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      const booking = await response.json()
      console.log('🎉 BOOKING SUCCESSFULLY CREATED:', booking.id)
      
      return {
        success: true,
        booking
      }
    } else {
      const errorText = await response.text()
      console.log('❌ BOOKING API ERROR:', errorText)
      
      return {
        success: false,
        error: 'Failed to create booking'
      }
    }
  } catch (error) {
    console.error('❌ BOOKING EXECUTION ERROR:', error)
    return {
      success: false,
      error: `System error: ${(error as Error).message}`
    }
  }
}

// DELETE EXECUTOR FOLLOWING SAME PATTERN AS BOOKING EXECUTOR
async function executeDelete(extracted: ExtractedInfo): Promise<{
  success: boolean
  deletedCount: number
  deletedBookings?: any[]
  error?: string
}> {
  console.log('=== DELETE EXECUTION START ===')
  console.log('Processing delete request for:', extracted)

  // 🚨 DATE VALIDATION: Check if delete date is in the past
  const dateValidation = validateDateForOperation(extracted.date, 'DELETE')
  if (!dateValidation.isValid) {
    console.log('❌ DATE VALIDATION FAILED FOR DELETE:', dateValidation.error)
    return {
      success: false,
      deletedCount: 0,
      error: dateValidation.error
    }
  }

  try {
    // Find bookings to delete based on extracted date
    let bookingsToDelete: any[] = []
    
    if (extracted.date) {
      // Get bookings for the specific date
      const startOfDay = new Date(extracted.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(extracted.date)
      endOfDay.setHours(23, 59, 59, 999)
      
      bookingsToDelete = await getBookingsForDateRange(startOfDay, endOfDay)
      console.log(`🔍 Found ${bookingsToDelete.length} bookings to delete on ${extracted.date.toDateString()}`)
    } else {
      console.log('❌ No specific date provided for deletion')
      return {
        success: false,
        deletedCount: 0,
        error: 'Please specify a date for deletion'
      }
    }

    if (bookingsToDelete.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        deletedBookings: [],
        error: 'No bookings found to delete for the specified date'
      }
    }

    // Delete each booking using the booking API
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bookings`
    let deletedCount = 0
    let deletedBookings: any[] = []

    for (const booking of bookingsToDelete) {
      try {
        console.log(`🗑️ Deleting booking: ${booking.id} - ${booking.title}`)
        
        const response = await fetch(`${apiUrl}?id=${booking.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          deletedCount++
          deletedBookings.push(booking)
          console.log(`✅ Successfully deleted booking: ${booking.id}`)
        } else {
          const errorText = await response.text()
          console.log(`❌ Failed to delete booking ${booking.id}: ${errorText}`)
        }
      } catch (deleteError) {
        console.error(`❌ Error deleting booking ${booking.id}:`, deleteError)
      }
    }

    console.log(`🎉 DELETE EXECUTION COMPLETE: ${deletedCount} bookings deleted`)
    
    return {
      success: true,
      deletedCount,
      deletedBookings
    }
  } catch (error) {
    console.error('❌ DELETE EXECUTION ERROR:', error)
    return {
      success: false,
      deletedCount: 0,
      error: `System error: ${(error as Error).message}`
    }
  }
}

// UPDATE EXECUTOR FOLLOWING SAME PATTERN AS DELETE AND BOOKING EXECUTORS
async function executeUpdate(extracted: ExtractedInfo): Promise<{
  success: boolean
  updatedBooking?: any
  originalBooking?: any
  error?: string
}> {
  console.log('=== UPDATE EXECUTION START ===')
  console.log('Processing update request for:', extracted)

  // 🚨 DATE VALIDATION: Check if update date is in the past
  const dateValidation = validateDateForOperation(extracted.date, 'UPDATE')
  if (!dateValidation.isValid) {
    console.log('❌ DATE VALIDATION FAILED FOR UPDATE:', dateValidation.error)
    return {
      success: false,
      error: dateValidation.error
    }
  }

  try {
    // Find booking to update based on extracted date
    let bookingToUpdate: any = null
    
    if (extracted.date) {
      // Get bookings for the specific date
      const startOfDay = new Date(extracted.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(extracted.date)
      endOfDay.setHours(23, 59, 59, 999)
      
      const bookings = await getBookingsForDateRange(startOfDay, endOfDay)
      console.log(`🔍 Found ${bookings.length} bookings on ${extracted.date.toDateString()}`)
      
      if (bookings.length === 1) {
        bookingToUpdate = bookings[0]
      } else if (bookings.length > 1) {
        // For simplicity, update the first booking found
        bookingToUpdate = bookings[0]
        console.log(`📝 Multiple bookings found, updating first one: ${bookingToUpdate.title}`)
      } else {
        return {
          success: false,
          error: 'No bookings found to update on the specified date'
        }
      }
    } else {
      console.log('❌ No specific date provided for update')
      return {
        success: false,
        error: 'Please specify a date for the booking to update'
      }
    }

    // Apply new time if provided
    let newStartTime: Date
    let newEndTime: Date
    
    if (extracted.time) {
      // Use the same date but new time
      newStartTime = new Date(bookingToUpdate.startTime)
      newStartTime.setHours(extracted.time.hour, extracted.time.minute, 0, 0)
      
      if (extracted.endTime) {
        newEndTime = new Date(bookingToUpdate.startTime)
        newEndTime.setHours(extracted.endTime.hour, extracted.endTime.minute, 0, 0)
      } else {
        // Default to 1 hour duration or use existing duration
        const originalDuration = (new Date(bookingToUpdate.endTime).getTime() - new Date(bookingToUpdate.startTime).getTime()) / (1000 * 60 * 60)
        const duration = extracted.duration || originalDuration
        newEndTime = new Date(newStartTime.getTime() + (duration * 60 * 60 * 1000))
      }
    } else {
      console.log('❌ No new time provided for update')
      return {
        success: false,
        error: 'Please specify a new time for the update'
      }
    }

    // Prepare update data
    const updateData = {
      id: bookingToUpdate.id,
      title: bookingToUpdate.title,
      description: bookingToUpdate.description,
      category: extracted.category || bookingToUpdate.category,
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString(),
      clientName: bookingToUpdate.clientName,
    }

    console.log('📝 UPDATING BOOKING WITH DATA:', updateData)

    // Call the booking API for update
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bookings`
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })

    if (response.ok) {
      const updatedBooking = await response.json()
      console.log('🎉 BOOKING SUCCESSFULLY UPDATED:', updatedBooking.id)
      
      return {
        success: true,
        updatedBooking,
        originalBooking: bookingToUpdate
      }
    } else {
      const errorText = await response.text()
      console.log('❌ UPDATE API ERROR:', errorText)
      
      return {
        success: false,
        error: 'Failed to update booking'
      }
    }
  } catch (error) {
    console.error('❌ UPDATE EXECUTION ERROR:', error)
    return {
      success: false,
      error: `System error: ${(error as Error).message}`
    }
  }
}

// HELPER FUNCTION FOR QUERY OPERATIONS - GET BOOKINGS FOR DATE RANGE
async function getBookingsForDateRange(startDate: Date, endDate: Date) {
  try {
    return await prisma.booking.findMany({
      where: { 
        startTime: { 
          gte: startDate, 
          lte: endDate 
        } 
      },
      orderBy: { startTime: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
}

// NEW: SYSTEM DATE QUERY HANDLER
function executeSystemDateQuery(): {
  success: boolean
  response: string
  suggestions: string[]
} {
  console.log('=== SYSTEM DATE QUERY EXECUTION START ===')
  
  const currentDate = new Date(CURRENT_DATE)
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' })
  const day = currentDate.getDate()
  const year = currentDate.getFullYear()
  
  const formattedDate = `${dayName}, ${monthName} ${day}, ${year}`
  
  const response = `📅 <strong>Today is ${formattedDate}</strong>
  
  <div style="margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
    <div style="font-size: 16px; font-weight: 600;">Current Date Information</div>
    <div style="margin-top: 8px; opacity: 0.9;">
      • Day: ${dayName}<br>
      • Date: ${monthName} ${day}, ${year}<br>
      • Time zone: UTC
    </div>
  </div>
  
  What would you like to schedule for today or another date?`
  
  const suggestions = [
    "Schedule a meeting for today",
    "Show my calendar for this week", 
    "Book a training session tomorrow",
    "What are my free slots today?"
  ]
  
  console.log('✅ SYSTEM DATE QUERY COMPLETE')
  return {
    success: true,
    response,
    suggestions
  }
}

// NEW: FREE SLOTS CALCULATION HELPER
async function calculateFreeSlots(date: Date, isCurrentMonthQuery: boolean = false): Promise<{
  freeSlots: Array<{ date: Date; timeSlots: Array<{ start: string; end: string }> }>
  totalSlots: number
}> {
  console.log('=== CALCULATING FREE SLOTS ===')
  
  // Working hours configuration (9 AM to 6 PM)
  const WORKING_START_HOUR = 9
  const WORKING_END_HOUR = 18
  const SLOT_DURATION_HOURS = 1
  
  let startDate: Date
  let endDate: Date
  
  if (isCurrentMonthQuery) {
    // Get current month's dates
    const currentDate = new Date(CURRENT_DATE)
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    console.log(`📅 Calculating free slots for current month: ${startDate.toDateString()} to ${endDate.toDateString()}`)
  } else {
    // Get specific date
    startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)
    console.log(`📅 Calculating free slots for specific date: ${startDate.toDateString()}`)
  }
  
  // Get existing bookings for the date range
  const existingBookings = await getBookingsForDateRange(startDate, endDate)
  console.log(`📋 Found ${existingBookings.length} existing bookings`)
  
  const freeSlots: Array<{ date: Date; timeSlots: Array<{ start: string; end: string }> }> = []
  let totalSlots = 0
  
  // Iterate through each date in the range
  const currentIterationDate = new Date(startDate)
  while (currentIterationDate <= endDate) {
    // Skip weekends for business hours
    const dayOfWeek = currentIterationDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
      currentIterationDate.setDate(currentIterationDate.getDate() + 1)
      continue
    }
    
    // Skip past dates (except for current date)
    const isCurrentDate = currentIterationDate.toDateString() === CURRENT_DATE.toDateString()
    if (currentIterationDate < CURRENT_DATE && !isCurrentDate) {
      currentIterationDate.setDate(currentIterationDate.getDate() + 1)
      continue
    }
    
    // Get bookings for this specific day
    const dayStart = new Date(currentIterationDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(currentIterationDate)
    dayEnd.setHours(23, 59, 59, 999)
    
    const dayBookings = existingBookings.filter(booking => {
      const bookingDate = new Date(booking.startTime)
      return bookingDate >= dayStart && bookingDate <= dayEnd
    })
    
    // Generate time slots for this day
    const dayTimeSlots: Array<{ start: string; end: string }> = []
    
    for (let hour = WORKING_START_HOUR; hour < WORKING_END_HOUR; hour += SLOT_DURATION_HOURS) {
      const slotStart = new Date(currentIterationDate)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(currentIterationDate)
      slotEnd.setHours(hour + SLOT_DURATION_HOURS, 0, 0, 0)
      
      // Check if this slot conflicts with any existing booking
      const hasConflict = dayBookings.some(booking => {
        const bookingStart = new Date(booking.startTime)
        const bookingEnd = new Date(booking.endTime)
        
        return (slotStart < bookingEnd && slotEnd > bookingStart)
      })
      
      if (!hasConflict) {
        dayTimeSlots.push({
          start: slotStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          end: slotEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        })
        totalSlots++
      }
    }
    
    // Only add days that have free slots
    if (dayTimeSlots.length > 0) {
      freeSlots.push({
        date: new Date(currentIterationDate),
        timeSlots: dayTimeSlots
      })
    }
    
    currentIterationDate.setDate(currentIterationDate.getDate() + 1)
  }
  
  console.log(`✅ Free slots calculation complete: ${totalSlots} total free slots found`)
  return { freeSlots, totalSlots }
}

// NEW: FREE SLOTS QUERY HANDLER
async function executeFreeSlots(extracted: ExtractedInfo): Promise<{
  success: boolean
  response: string
  suggestions: string[]
  error?: string
}> {
  console.log('=== FREE SLOTS EXECUTION START ===')
  console.log('Processing free slots request for:', extracted)
  
  try {
    const date = extracted.date || new Date(CURRENT_DATE)
    const isCurrentMonthQuery = extracted.isCurrentMonthQuery || false
    
    const { freeSlots, totalSlots } = await calculateFreeSlots(date, isCurrentMonthQuery)
    
    if (freeSlots.length === 0) {
      const dateRange = isCurrentMonthQuery ? 'this month' : date.toDateString()
      return {
        success: true,
        response: `📅 <strong>No free slots found for ${dateRange}</strong>
        
        <div style="text-align: center; padding: 20px; color: #666; font-style: italic;">
          Your calendar is fully booked during business hours (9 AM - 6 PM, weekdays only).
        </div>`,
        suggestions: [
          "Show my bookings for today",
          "Schedule a meeting for next week", 
          "Check free slots for tomorrow",
          "Book a training session next month"
        ]
      }
    }
    
    // Generate table for free slots
    let table = `
      <div style="margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
              <th style="padding: 12px; text-align: left; font-weight: 600;">Date</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">Day</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">Available Time Slots</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">Total Slots</th>
            </tr>
          </thead>
          <tbody>`

    freeSlots.forEach((daySlots, index) => {
      const rowBg = index % 2 === 0 ? '#f0fdf4' : 'white'
      const dayName = daySlots.date.toLocaleDateString('en-US', { weekday: 'short' })
      const formattedDate = daySlots.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const timeSlotsList = daySlots.timeSlots.map(slot => `${slot.start} - ${slot.end}`).join('<br>')
      
      table += `
        <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: 500; color: #2d3748;">${formattedDate}</td>
          <td style="padding: 12px; color: #4a5568;">${dayName}</td>
          <td style="padding: 12px; color: #4a5568; font-family: monospace; font-size: 13px;">${timeSlotsList}</td>
          <td style="padding: 12px; color: #059669; font-weight: 600; text-align: center;">${daySlots.timeSlots.length}</td>
        </tr>`
    })

    table += `
          </tbody>
        </table>
      </div>`
    
    const dateRangeText = isCurrentMonthQuery ? 'this month' : date.toDateString()
    const response = `🕒 <strong>Free Time Slots Available for ${dateRangeText}</strong>
    
    <div style="margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 8px;">
      <div style="font-size: 16px; font-weight: 600;">📊 Summary</div>
      <div style="margin-top: 8px; opacity: 0.9;">
        • Total free slots: ${totalSlots}<br>
        • Business hours: 9:00 AM - 6:00 PM<br>
        • Weekdays only (excluding weekends)
      </div>
    </div>
    
    ${table}
    
    <div style="margin-top: 15px; font-size: 13px; color: #666; text-align: center;">
      💡 <em>You can book any of these available time slots by asking me to schedule a session!</em>
    </div>`
    
    const suggestions = [
      `Book a training for ${isCurrentMonthQuery ? 'next available slot' : date.toDateString()}`,
      "Show my current bookings",
      "Schedule a meeting tomorrow", 
      "Check free slots for next week"
    ]
    
    console.log('🎉 FREE SLOTS EXECUTION COMPLETE')
    return {
      success: true,
      response,
      suggestions
    }
  } catch (error) {
    console.error('❌ FREE SLOTS EXECUTION ERROR:', error)
    return {
      success: false,
      response: "I encountered an error while calculating your free slots. Please try again.",
      suggestions: [
        "Show my calendar for today",
        "Book a training session",
        "Check my schedule for this week"
      ],
      error: `System error: ${(error as Error).message}`
    }
  }
}

// SIMPLIFIED TABLE GENERATOR FOR QUERY RESPONSES
function generateBookingsTable(bookings: any[], dateRange?: string): string {
  if (bookings.length === 0) {
    return `<div style="text-align: center; padding: 20px; color: #666; font-style: italic;">No bookings found${dateRange ? ` for ${dateRange}` : ''}.</div>`
  }

  let table = `
    <div style="margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <th style="padding: 12px; text-align: left; font-weight: 600;">Training Name</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Date</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Time</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Duration</th>
            <th style="padding: 12px; text-align: left; font-weight: 600;">Client</th>
          </tr>
        </thead>
        <tbody>`

  bookings.forEach((booking, index) => {
    const startTime = new Date(booking.startTime)
    const endTime = new Date(booking.endTime)
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) * 10) / 10
    const rowBg = index % 2 === 0 ? '#f8fafc' : 'white'
    
    table += `
      <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 500; color: #2d3748;">${booking.title}</td>
        <td style="padding: 12px; color: #4a5568;">${startTime.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })}</td>
        <td style="padding: 12px; color: #4a5568; font-family: monospace;">${startTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })} - ${endTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })}</td>
        <td style="padding: 12px; color: #4a5568;">${duration}h</td>
        <td style="padding: 12px; color: #4a5568;">${booking.clientName || 'Not specified'}</td>
      </tr>`
  })

  table += `
        </tbody>
      </table>
    </div>`
  
  return table
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 ============= SIMPLIFIED CHAT API START =============')
    const { message } = await request.json()
    console.log('📩 RECEIVED MESSAGE:', message)

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      )
    }

    // STEP 1: Extract information from message
    const extracted = extractInformationFromMessage(message)
    console.log('📊 EXTRACTED INFO:', extracted)

    let response = "Hello! I'm Schedula, your intelligent scheduling assistant. I can help you book training sessions and view your calendar."
    let suggestions = [
      "Book a training session tomorrow at 2 PM",
      "Show me my calendar for July 12",
      "Schedule a meeting for today at 10 AM",
      "What sessions do I have this week?"
    ]
    let bookingCreated = false
    let actionTaken = false

    // STEP 2: Handle NEW FEATURES - System Date and Free Slots
    if (extracted.intent === 'system_date' && extracted.confidence >= 80) {
      console.log('🎯 SYSTEM DATE QUERY DETECTED')
      
      const result = executeSystemDateQuery()
      console.log('📥 SYSTEM DATE RESULT:', result)
      
      return NextResponse.json({
        response: result.response,
        suggestions: result.suggestions,
        actionTaken: false
      })
    }
    
    if (extracted.intent === 'free_slots' && extracted.confidence >= 80) {
      console.log('🎯 FREE SLOTS QUERY DETECTED')
      
      try {
        const result = await executeFreeSlots(extracted)
        console.log('📥 FREE SLOTS RESULT:', result)
        
        if (result.success) {
          return NextResponse.json({
            response: result.response,
            suggestions: result.suggestions,
            actionTaken: false
          })
        } else {
          return NextResponse.json({
            response: result.response,
            suggestions: result.suggestions,
            actionTaken: false
          })
        }
      } catch (error) {
        console.error('❌ FREE SLOTS ERROR:', error)
        return NextResponse.json({
          response: "I encountered an error while calculating your free slots. Please try again.",
          suggestions: [
            "Show my calendar for today",
            "Book a training session",
            "Check my schedule for this week"
          ],
          actionTaken: false
        })
      }
    }

    // STEP 3: Handle BOOKING requests
    if (extracted.intent === 'book' && extracted.confidence >= 50) {
      console.log('🎯 BOOKING REQUEST DETECTED')
      
      try {
        const defaults = await applySmartDefaults(extracted)
        console.log('🎛️ DEFAULTS APPLIED:', defaults)
        
        const result = await executeBooking(extracted, defaults)
        console.log('📥 BOOKING RESULT:', result)
        
        if (result.success) {
          const startDate = new Date(result.booking.startTime)
          const endDate = new Date(result.booking.endTime)
          
          response = `Perfect! I've booked your ${result.booking.title} for ${startDate.toDateString()} from ${startDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })} to ${endDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })}. The booking is confirmed!`
          
          bookingCreated = true
          actionTaken = true
          suggestions = [
            "Show me my updated calendar",
            "Book another session this week",
            "Schedule a follow-up meeting",
            "What's my availability tomorrow?"
          ]
        } else {
          response = `I wasn't able to create that booking. ${result.error || 'Please try with different details.'}`
          suggestions = [
            "Try a different time slot",
            "Book for tomorrow instead",
            "Show me my calendar first",
            "Schedule for next week"
          ]
        }
      } catch (error) {
        console.error('Booking error:', error)
        response = "I encountered an error while trying to book that session. Please try again."
      }
    }
    
    // STEP 2.5: Handle DELETE requests - Following same pattern as BOOKING
    else if (extracted.intent === 'delete' && extracted.confidence >= 50) {
      console.log('🗑️ DELETE REQUEST DETECTED')
      
      try {
        const result = await executeDelete(extracted)
        console.log('📥 DELETE RESULT:', result)
        
        if (result.success) {
          if (result.deletedCount > 0) {
            const dateText = extracted.date ? extracted.date.toDateString() : 'the specified date'
            response = `Successfully deleted ${result.deletedCount} session${result.deletedCount > 1 ? 's' : ''} from ${dateText}. Your calendar has been updated!`
            
            // List the deleted sessions for confirmation
            if (result.deletedBookings && result.deletedBookings.length > 0) {
              const deletedTitles = result.deletedBookings.map(booking => booking.title).join(', ')
              response += `\n\nDeleted sessions: ${deletedTitles}`
            }
          } else {
            const dateText = extracted.date ? extracted.date.toDateString() : 'the specified date'
            response = `No sessions found to delete on ${dateText}. Your calendar is already clear for that date.`
          }
          
          actionTaken = true
          suggestions = [
            "Show me my updated calendar",
            "Book a new session",
            "Check my availability",
            "View next week's schedule"
          ]
        } else {
          response = `I wasn't able to delete those sessions. ${result.error || 'Please try again.'}`
          suggestions = [
            "Show me my calendar first",
            "Try specifying a date",
            "Cancel a specific session",
            "Clear a different date"
          ]
        }
      } catch (error) {
        console.error('Delete error:', error)
        response = "I encountered an error while trying to delete those sessions. Please try again."
      }
    }
    
    // STEP 2.75: Handle UPDATE requests - Following same pattern as DELETE and BOOKING
    else if (extracted.intent === 'update' && extracted.confidence >= 50) {
      console.log('✏️ UPDATE REQUEST DETECTED')
      
      try {
        const result = await executeUpdate(extracted)
        console.log('📥 UPDATE RESULT:', result)
        
        if (result.success) {
          const updatedDate = new Date(result.updatedBooking.startTime)
          const updatedEndDate = new Date(result.updatedBooking.endTime)
          const originalDate = new Date(result.originalBooking.startTime)
          
          response = `Perfect! I've updated your "${result.updatedBooking.title}" session from ${originalDate.toDateString()} to ${updatedDate.toDateString()} at ${updatedDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })} - ${updatedEndDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })}. The update is confirmed!`
          
          actionTaken = true
          suggestions = [
            "Show me my updated calendar",
            "Make another change",
            "Book a new session",
            "Check my availability"
          ]
        } else {
          response = `I wasn't able to update that session. ${result.error || 'Please try again with different details.'}`
          suggestions = [
            "Show me my calendar first",
            "Try a different time",
            "Specify the date to update",
            "Book a new session instead"
          ]
        }
      } catch (error) {
        console.error('Update error:', error)
        response = "I encountered an error while trying to update that session. Please try again."
      }
    }
    
    // STEP 3: Handle QUERY requests
    else if (extracted.intent === 'query' && extracted.confidence >= 50) {
      console.log('🔍 QUERY REQUEST DETECTED')
      
      try {
        let bookings: any[] = []
        let dateRangeText = ''
        
        if (extracted.date) {
          const startOfDay = new Date(extracted.date)
          startOfDay.setHours(0, 0, 0, 0)
          const endOfDay = new Date(extracted.date)
          endOfDay.setHours(23, 59, 59, 999)
          
          bookings = await getBookingsForDateRange(startOfDay, endOfDay)
          dateRangeText = extracted.date.toDateString()
        } else {
          // Default to showing next 7 days
          const startDate = new Date(CURRENT_DATE)
          const endDate = new Date(CURRENT_DATE)
          endDate.setDate(endDate.getDate() + 7)
          
          bookings = await getBookingsForDateRange(startDate, endDate)
          dateRangeText = 'the next 7 days'
        }
        
        console.log(`Found ${bookings.length} bookings`)
        
        if (bookings.length > 0) {
          const htmlTable = generateBookingsTable(bookings, dateRangeText)
          response = `Here are your scheduled sessions for ${dateRangeText}:\n\n${htmlTable}`
          
          suggestions = [
            "Book another session",
            "Show me next week's calendar",
            "Schedule a meeting for tomorrow",
            "Check my availability"
          ]
        } else {
          response = `You don't have any sessions scheduled for ${dateRangeText}. Would you like to book something?`
          
          suggestions = [
            "Book a training session tomorrow",
            "Schedule a meeting for this week",
            "Set up a consultation call",
            "Plan a team workshop"
          ]
        }
        
        actionTaken = true
      } catch (error) {
        console.error('Query error:', error)
        response = "I encountered an error while retrieving your calendar. Please try again."
      }
    }
    
    // STEP 4: Handle general/unclear requests
    else {
      response = "I'm Schedula, your AI scheduling assistant! I can help you book training sessions and view your calendar. What would you like to do?"
      suggestions = [
        "Book a training session tomorrow at 2 PM",
        "Show me my calendar for July 12",
        "Schedule a meeting for today",
        "What sessions do I have this week?"
      ]
    }

    // STEP 5: Save conversation to database
    try {
      await prisma.chatConversation.create({
        data: {
          message,
          response,
        },
      })
    } catch (dbError) {
      console.error('Error saving chat conversation:', dbError)
    }

    // STEP 6: Return response
    console.log('📤 RESPONSE:', response)
    console.log('🏁 ============= CHAT API END =============')
    
    return NextResponse.json({
      response,
      suggestions,
      bookingCreated,
      actionTaken,
      conversationState: 'active'
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    
    return NextResponse.json({
      response: "Hello! I'm Schedula, your intelligent scheduling assistant. I can help you book training sessions and view your calendar. What would you like to do?",
      suggestions: [
        "Book a training session tomorrow at 2 PM",
        "Show me my calendar for July 12",
        "Schedule a meeting for today",
        "What sessions do I have this week?"
      ],
      actionTaken: false,
      bookingCreated: false,
      conversationState: 'initial'
    })
  }
}


