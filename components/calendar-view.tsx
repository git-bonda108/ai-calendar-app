
'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrainingDetailsDialog } from './training-details-dialog'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'

interface Booking {
  id: string
  title: string
  startTime: string
  endTime: string
  category?: string | null
  clientName?: string | null
}

export const CalendarView = forwardRef<{ refreshBookings: () => void }, {}>((props, ref) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isTrainingDetailsOpen, setIsTrainingDetailsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Calculate the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = monthStart.getDay()
  
  // Create empty cells for days before the first day of the month
  const emptyDaysAtStart = Array.from({ length: firstDayOfMonth }, (_, index) => null)
  
  // Calculate remaining empty cells to complete the last week (optional for cleaner grid)
  const totalCells = emptyDaysAtStart.length + monthDays.length
  const emptyDaysAtEnd = totalCells % 7 === 0 ? [] : Array.from({ length: 7 - (totalCells % 7) }, () => null)
  
  // Combine empty cells and actual month days
  const calendarDays = [...emptyDaysAtStart, ...monthDays, ...emptyDaysAtEnd]

  useEffect(() => {
    fetchBookings()
  }, [currentDate])

  // Expose refreshBookings method to parent component
  useImperativeHandle(ref, () => ({
    refreshBookings: fetchBookings
  }))

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookings?month=${format(currentDate, 'yyyy-MM')}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime)
      return bookingDate.toDateString() === date.toDateString()
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsTrainingDetailsOpen(true)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  const getCategoryColor = (category: string | null | undefined) => {
    if (!category) {
      return 'bg-gray-500 text-white'
    }
    
    switch (category.toLowerCase()) {
      case 'training':
        return 'bg-emerald-500 text-white'
      case 'workshop':
        return 'bg-blue-500 text-white'
      case 'meeting':
        return 'bg-purple-500 text-white'
      case 'consultation':
        return 'bg-orange-500 text-white'
      case 'review':
        return 'bg-indigo-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const shortenTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) return title
    
    // Common abbreviations for training sessions
    const abbreviations: { [key: string]: string } = {
      'Introduction to': 'Intro',
      'Machine Learning': 'ML',
      'Artificial Intelligence': 'AI',
      'Fundamentals': 'Fund.',
      'Workshop': 'Workshop',
      'Applications': 'Apps',
      'Management': 'Mgmt',
      'Development': 'Dev',
      'Deployment': 'Deploy',
      'Security': 'Sec',
      'Optimization': 'Opt',
      'Advanced': 'Adv',
      'with Python': 'Python',
      'Computer Vision': 'CV',
      'Natural Language Processing': 'NLP'
    }
    
    let shortened = title
    Object.entries(abbreviations).forEach(([full, abbrev]) => {
      shortened = shortened.replace(new RegExp(full, 'gi'), abbrev)
    })
    
    if (shortened.length > maxLength) {
      return shortened.substring(0, maxLength - 3) + '...'
    }
    
    return shortened
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'UTC' // Display times consistently in UTC to match database storage
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            disabled={loading}
            className="ml-2 rounded-lg"
            title="Refresh calendar data"
          >
            <motion.div
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 text-center font-semibold text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="calendar-grid">
            {calendarDays.map((date, index) => {
              // Handle empty cells (null values)
              if (date === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-day other-month"
                    style={{ visibility: 'hidden' }}
                  />
                )
              }

              const dayBookings = getBookingsForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isTodayDate = isToday(date)

              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${isTodayDate ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                      {date.getDate()}
                    </span>
                    {dayBookings.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-1">
                        {dayBookings.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className={`booking-item ${getCategoryColor(booking.category)}`}
                        title={`${booking.title}\nTime: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}\nClient: ${booking.clientName || 'Not specified'}\nCategory: ${booking.category || 'General'}`}
                      >
                        <div className="font-medium text-xs leading-tight">
                          {shortenTitle(booking.title, 18)}
                        </div>
                        <div className="text-xs opacity-90 mt-0.5">
                          {formatTime(booking.startTime)}
                        </div>
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-100">
                        +{dayBookings.length - 3} more sessions
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Categories Legend */}
      <Card className="mt-6 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-sm text-gray-600">Training</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Workshop</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Meeting</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">Consultation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              <span className="text-sm text-gray-600">Review</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Details Dialog */}
      <TrainingDetailsDialog
        isOpen={isTrainingDetailsOpen}
        onClose={() => setIsTrainingDetailsOpen(false)}
        selectedDate={selectedDate}
        bookings={selectedDate ? getBookingsForDate(selectedDate) : []}
      />
    </div>
  )
})

CalendarView.displayName = 'CalendarView'
