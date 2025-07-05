
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, Zap, Clock, Target, TrendingUp } from 'lucide-react'
import { CalendarView } from '@/components/calendar-view'
import { AIChat } from '@/components/ai-chat'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const calendarRef = useRef<{ refreshBookings: () => void }>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBookingCreated = () => {
    // Refresh the calendar when a booking is created via Schedula
    if (calendarRef.current) {
      calendarRef.current.refreshBookings()
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen epoch-gradient-bg">
      <Header />
      
      {/* Main Content Container */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div 
              className="relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="schedula-avatar p-4 rounded-3xl animate-pulse-glow">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-2 schedula-avatar rounded-3xl opacity-20 blur-lg animate-float"></div>
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="epoch-text-gradient">Epoch</span>
            <br />
            <span className="text-3xl md:text-4xl text-gray-700 font-semibold">
              Redefining Time with AI
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Meet <span className="font-semibold text-[hsl(var(--epoch-teal))]">Schedula</span>, your intelligent scheduling assistant. 
            Experience the future of calendar management with contextual AI that understands your needs.
          </motion.p>

          {/* Feature Badges */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-[hsl(var(--epoch-navy))] border-blue-200 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Intelligent Conversations
            </Badge>
            <Badge variant="secondary" className="bg-gradient-to-r from-teal-50 to-cyan-50 text-[hsl(var(--epoch-teal))] border-teal-200 px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Contextual Memory
            </Badge>
            <Badge variant="secondary" className="bg-gradient-to-r from-emerald-50 to-green-50 text-green-700 border-green-200 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Real-time Sync
            </Badge>
          </motion.div>
        </motion.div>

        {/* Calendar Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="calendar-section bg-white/80 backdrop-blur-xl rounded-3xl epoch-card-shadow border border-gray-200/50 overflow-hidden mb-8"
        >
          <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white/50 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-[hsl(var(--epoch-navy))]" />
              <h2 className="text-2xl font-bold text-gray-900">Your Intelligent Calendar</h2>
            </div>
            <p className="text-gray-600 mt-2">AI-powered scheduling with real-time synchronization</p>
          </div>
          <CalendarView ref={calendarRef} />
        </motion.div>

        {/* Schedula AI Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="chat-section bg-white/80 backdrop-blur-xl rounded-3xl epoch-card-shadow border border-gray-200/50 overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="schedula-avatar p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Schedula AI</h2>
                  <p className="text-gray-600">Your intelligent scheduling assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Active</span>
              </div>
            </div>
          </div>
          <AIChat onBookingCreated={handleBookingCreated} />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12 py-8"
        >
          <p className="text-gray-500 text-sm">
            Powered by advanced AI technology • Built for the future of scheduling
          </p>
        </motion.div>
      </div>
    </div>
  )
}
