
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatItem {
  icon: React.ComponentType<any>
  label: string
  value: number
  suffix?: string
  color: string
}

export function StatsOverview() {
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0])

  const stats: StatItem[] = [
    { icon: Calendar, label: 'Scheduled Sessions', value: 24, color: 'text-blue-600' },
    { icon: Users, label: 'Total Clients', value: 18, color: 'text-green-600' },
    { icon: Clock, label: 'Hours This Month', value: 96, color: 'text-orange-600' },
    { icon: TrendingUp, label: 'Completion Rate', value: 98, suffix: '%', color: 'text-purple-600' },
  ]

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      return setTimeout(() => {
        let current = 0
        const increment = stat.value / 30
        const timer = setInterval(() => {
          current += increment
          if (current >= stat.value) {
            current = stat.value
            clearInterval(timer)
          }
          setAnimatedValues(prev => {
            const newValues = [...prev]
            newValues[index] = Math.floor(current)
            return newValues
          })
        }, 50)
      }, index * 200)
    })

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Card className="text-center p-4 md:p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className={`mx-auto w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3 md:mb-4`}>
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                {animatedValues[index]}{stat.suffix || ''}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
