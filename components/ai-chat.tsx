
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Calendar, Clock, CheckCircle, Zap, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIChatProps {
  onBookingCreated?: () => void
}

export function AIChat({ onBookingCreated }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Schedula, your intelligent scheduling assistant. I have contextual memory and can help you create, update, delete, and query your bookings with natural conversation. What would you like to schedule today?",
      timestamp: new Date(),
      suggestions: [
        "Schedule a meeting tomorrow at 2 PM",
        "Show me my availability next week",
        "Book an AI training session",
        "What's my schedule for today?"
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim()
    if (!messageText || isLoading) return

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions
        }
        setMessages(prev => [...prev, assistantMessage])
        
        // If a booking was created, refresh the calendar
        if (data.bookingCreated && onBookingCreated) {
          onBookingCreated()
        }
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing connectivity issues. Please try again in a moment. I'm here to help with all your scheduling needs!",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[650px] max-h-[650px]">
      {/* Schedula Header */}
      <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-teal-50/30 to-cyan-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="schedula-avatar p-2.5 rounded-xl animate-pulse-glow"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Schedula</h3>
              <p className="text-sm text-gray-600">Your intelligent scheduling assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200">
              <Brain className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4 custom-scrollbar">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    message.role === 'user'
                      ? 'epoch-button text-white shadow-lg'
                      : 'bg-gradient-to-br from-gray-50 to-white text-gray-900 border border-gray-200/50 epoch-card-shadow'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.role === 'assistant' && (
                      <div className="schedula-avatar p-1.5 rounded-lg mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {message.role === 'user' && (
                      <User className="w-4 h-4 mt-1 flex-shrink-0 text-white/80" />
                    )}
                    <div className="flex-1">
                      {/* Render HTML content for assistant messages, plain text for user messages */}
                      {message.role === 'assistant' && message.content.includes('<') ? (
                        <div 
                          className="text-sm leading-relaxed font-medium prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                      )}
                      <p className={`text-xs mt-2.5 ${
                        message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Quick actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-xs h-8 px-3 rounded-full border border-gray-300 bg-white hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:border-[hsl(var(--epoch-teal))] hover:text-[hsl(var(--epoch-teal))] transition-all duration-300 font-medium"
                            onClick={() => handleSendMessage(suggestion)}
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl px-5 py-4 max-w-[85%] border border-gray-200/50 epoch-card-shadow">
                <div className="flex items-center space-x-3">
                  <div className="schedula-avatar p-1.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[hsl(var(--epoch-teal))] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[hsl(var(--epoch-blue))] rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-[hsl(var(--epoch-navy))] rounded-full animate-pulse delay-200"></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Schedula is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Section */}
      <div className="px-6 py-5 border-t border-gray-200/50 bg-gradient-to-r from-white/50 to-gray-50/30">
        <div className="flex space-x-3 mb-4">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Schedula to schedule, modify, or query your calendar..."
            className="flex-1 rounded-xl border-gray-300 focus:border-[hsl(var(--epoch-teal))] focus:ring-[hsl(var(--epoch-teal))] text-sm font-medium placeholder:text-gray-500"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="epoch-button rounded-xl px-6 py-2.5 font-medium"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Enhanced Features Display */}
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1.5">
            <Zap className="w-3 h-3 text-[hsl(var(--epoch-teal))]" />
            <span className="font-medium">Contextual Memory</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3 h-3 text-[hsl(var(--epoch-blue))]" />
            <span className="font-medium">Full CRUD Operations</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="font-medium">Real-time Sync</span>
          </div>
        </div>
      </div>
    </div>
  )
}
