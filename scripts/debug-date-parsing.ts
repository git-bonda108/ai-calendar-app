
// Debug script to test date parsing logic
const CURRENT_DATE = new Date('2025-07-02T12:00:00')

function debugDateParsing(message: string) {
  console.log(`\n🔍 TESTING DATE PARSING FOR: "${message}"`)
  const lowerMessage = message.toLowerCase()
  
  let date: Date | undefined
  
  // Handle "today" and "tomorrow" first - most reliable
  if (lowerMessage.includes('today')) {
    date = new Date(CURRENT_DATE)
    console.log(`📅 Date parsed: TODAY (${date.toDateString()})`)
  } else if (lowerMessage.includes('tomorrow')) {
    date = new Date(CURRENT_DATE)
    date.setDate(date.getDate() + 1)
    console.log(`📅 Date parsed: TOMORROW (${date.toDateString()})`)
  }
  
  // Handle specific dates like "July 19", "19th July", "Jul 19", etc.
  if (!date) {
    const specificDatePatterns = [
      // July 19, Jul 19, July 19th
      /(?:july|jul)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
      // 19th July, 19 Jul, 19 July  
      /(\d{1,2})(?:st|nd|rd|th)?\s+(?:july|jul)/i,
      // More months can be added here as needed
      /(?:august|aug)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
      /(\d{1,2})(?:st|nd|rd|th)?\s+(?:august|aug)/i
    ]
    
    console.log('🔍 Testing against patterns...')
    
    for (let i = 0; i < specificDatePatterns.length; i++) {
      const pattern = specificDatePatterns[i]
      console.log(`   Pattern ${i + 1}: ${pattern}`)
      const match = message.match(pattern)
      console.log(`   Match result:`, match)
      
      if (match) {
        const day = parseInt(match[1])
        let month = 6 // July default (0-indexed)
        
        console.log(`   Extracted day: ${day}`)
        console.log(`   Default month: ${month} (July)`)
        
        if (lowerMessage.includes('aug')) {
          month = 7 // August
          console.log(`   Adjusted month: ${month} (August)`)
        }
        
        const year = message.includes('2025') ? 2025 : CURRENT_DATE.getFullYear()
        console.log(`   Year: ${year}`)
        
        date = new Date(year, month, day)
        console.log(`📅 Date parsed: SPECIFIC DATE (${date.toDateString()})`)
        console.log(`   Raw Date object: ${date.toISOString()}`)
        break
      }
    }
    
    if (!date) {
      console.log('❌ No date patterns matched!')
    }
  }
  
  return date
}

// Test various formats
const testMessages = [
  "book training 19-Jul 1 PM to 2 PM",
  "book training July 19 1 PM to 2 PM", 
  "book training 19th July 1 PM to 2 PM",
  "book training Jul 19 1 PM to 2 PM",
  "schedule 19 July session"
]

console.log('🚀 STARTING DATE PARSING DEBUG TESTS')

testMessages.forEach(message => {
  const result = debugDateParsing(message)
  console.log(`✅ Final result for "${message}": ${result ? result.toDateString() : 'undefined'}`)
  console.log('─'.repeat(80))
})
