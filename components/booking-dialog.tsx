
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Clock, User, Mail, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface BookingDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  onBookingCreated: () => void
}

interface Category {
  id: string
  name: string
  description: string
}

export function BookingDialog({ isOpen, onClose, selectedDate, onBookingCreated }: BookingDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    clientName: '',
    clientEmail: '',
    category: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      // Set default times if date is selected
      if (selectedDate) {
        const defaultStart = new Date(selectedDate)
        defaultStart.setHours(10, 0, 0, 0)
        const defaultEnd = new Date(selectedDate)
        defaultEnd.setHours(12, 0, 0, 0)
        
        setFormData(prev => ({
          ...prev,
          startTime: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(defaultEnd, "yyyy-MM-dd'T'HH:mm")
        }))
      }
    }
  }, [isOpen, selectedDate])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/training-types')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Booking Created",
          description: "Your session has been successfully scheduled.",
        })
        onBookingCreated()
        onClose()
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          clientName: '',
          clientEmail: '',
          category: ''
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to create booking.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Schedule New Session</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Category</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center space-x-2">
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Strategic Planning Meeting"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the session..."
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Start Time</span>
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Client Name</span>
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Client's full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Client Email</span>
              </Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
