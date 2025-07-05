
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Clock, User, BookOpen } from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  title: string
  startTime: string
  endTime: string
  category?: string | null
  clientName?: string | null
  description?: string | null
}

interface TrainingDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  bookings: Booking[]
}

export function TrainingDetailsDialog({ isOpen, onClose, selectedDate, bookings }: TrainingDetailsDialogProps) {
  if (!selectedDate) return null

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'UTC'
    })
  }

  const getCategoryColor = (category: string | null | undefined) => {
    if (!category) return 'bg-gray-500 text-white'
    
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

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>Training Sessions - {format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Scheduled</h3>
              <p className="text-gray-500 mb-4">
                There are no training sessions scheduled for this date.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💬 <strong>Want to book a session?</strong> Use Schedula, your AI scheduling assistant in the chat below!
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Try: "Book a training session for {format(selectedDate, 'MMMM d')} at 2 PM"
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {bookings.length} Session{bookings.length > 1 ? 's' : ''} Scheduled
                </h3>
                <Badge variant="outline" className="text-sm">
                  {format(selectedDate, 'MMM d')}
                </Badge>
              </div>

              <div className="space-y-3">
                {bookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">
                          {booking.title}
                        </h4>
                        {booking.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {booking.description}
                          </p>
                        )}
                      </div>
                      <Badge className={getCategoryColor(booking.category)}>
                        {booking.category || 'General'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>Duration: {calculateDuration(booking.startTime, booking.endTime)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{booking.clientName || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-green-800">
                  💬 <strong>Need to make changes?</strong> Use Schedula to modify, delete, or book additional sessions!
                </p>
                <div className="text-xs text-green-600 mt-1 space-y-1">
                  <p>• To reschedule: "Change {format(selectedDate, 'MMMM d')} session to 3 PM"</p>
                  <p>• To cancel: "Clear sessions on {format(selectedDate, 'MMMM d')}"</p>
                  <p>• To book more: "Book another session on {format(selectedDate, 'MMMM d')} at 4 PM"</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
