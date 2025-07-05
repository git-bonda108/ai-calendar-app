
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Sparkles, Menu, X, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-200/50 epoch-card-shadow"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="relative">
              <div className="epoch-brand-gradient p-2.5 rounded-xl animate-pulse-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 epoch-brand-gradient rounded-xl opacity-20 blur animate-float"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold epoch-text-gradient">Epoch</h1>
              <p className="text-xs text-gray-600 font-medium">Redefining Time with AI</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button 
              variant="ghost" 
              className="text-gray-700 hover:text-[hsl(var(--epoch-navy))] hover:bg-[hsl(var(--epoch-light))] transition-all duration-300"
              onClick={() => {
                const calendarSection = document.querySelector('.calendar-section')
                calendarSection?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-700 hover:text-[hsl(var(--epoch-teal))] hover:bg-[hsl(var(--epoch-light))] transition-all duration-300"
              onClick={() => {
                const chatSection = document.querySelector('.chat-section')
                chatSection?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Schedula AI
            </Button>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200/50 py-4"
          >
            <nav className="flex flex-col space-y-3">
              <Button 
                variant="ghost" 
                className="justify-start text-gray-700 hover:text-[hsl(var(--epoch-navy))] hover:bg-[hsl(var(--epoch-light))]"
                onClick={() => {
                  const calendarSection = document.querySelector('.calendar-section')
                  calendarSection?.scrollIntoView({ behavior: 'smooth' })
                  setIsMenuOpen(false)
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-gray-700 hover:text-[hsl(var(--epoch-teal))] hover:bg-[hsl(var(--epoch-light))]"
                onClick={() => {
                  const chatSection = document.querySelector('.chat-section')
                  chatSection?.scrollIntoView({ behavior: 'smooth' })
                  setIsMenuOpen(false)
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Schedula AI
              </Button>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 self-start">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Live & Active</span>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
