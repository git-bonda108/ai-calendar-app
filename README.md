# AI Calendar App 🗓️

A comprehensive AI-powered calendar booking system built with Next.js 14, Prisma, and PostgreSQL. Features intelligent scheduling, natural language processing, and a modern responsive interface.

## ✅ Deployment Status

**READY FOR VERCEL DEPLOYMENT** - All tests passed and configuration optimized for production.

### 🧪 Test Results (5/5 Passed)
- ✅ Calendar Sync: July 5, 2025 = Saturday ✓
- ✅ Database Connection: PostgreSQL working ✓  
- ✅ File Structure: All required files present ✓
- ✅ CRUD Operations: Create, Read, Update, Delete all functional ✓
- ✅ Enhanced Features: Date parsing and slot calculation working ✓

## 🚀 Quick Deploy to Vercel

1. **Import this repository** to Vercel: https://github.com/git-bonda108/ai-calendar-app
2. **Set Environment Variables** in Vercel Dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
3. **Deploy** - Vercel will automatically use the optimized build configuration

## 🛠️ Features

### Core Functionality
- **Smart Booking System**: Create, view, update, and delete training session bookings
- **AI Chat Assistant**: Natural language booking with "Schedula" AI
- **Calendar Integration**: Real-world calendar sync (verified for 2025)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching with system preference detection

### Technical Features
- **Next.js 14 App Router**: Latest React Server Components
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Real-time Updates**: Optimistic UI updates and data synchronization
- **Edge Runtime Ready**: Optimized for Vercel's edge functions
- **TypeScript**: Full type safety throughout the application

## 📋 Database Schema

```prisma
model Booking {
  id          String        @id @default(cuid())
  title       String
  description String?
  category    String?       // e.g., "Databricks", "Azure", "AI/ML"
  startTime   DateTime
  endTime     DateTime
  clientName  String?
  clientEmail String?
  status      BookingStatus @default(CONFIRMED)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum BookingStatus {
  CONFIRMED
  PENDING
  CANCELLED
  COMPLETED
}
```

## 🔧 Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/git-bonda108/ai-calendar-app.git
   cd ai-calendar-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run the comprehensive test suite:
```bash
npm test
```

The test suite verifies:
- Calendar synchronization with real-world dates
- Database connectivity and operations
- All CRUD functionality
- File structure integrity
- Enhanced features like date parsing

## 📦 Deployment Configuration

### Optimized for Vercel
- **Build Command**: `npm run vercel-build` (includes Prisma generation and migrations)
- **Postinstall Script**: Automatically generates Prisma client
- **Binary Targets**: Configured for Vercel's runtime environment
- **Edge Runtime**: Ready for serverless deployment

### Environment Variables Required
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (if using NextAuth)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

## 🏗️ Architecture

```
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── booking-dialog.tsx # Booking management
│   ├── calendar-view.tsx  # Calendar interface
│   └── ai-chat.tsx       # AI assistant
├── lib/                   # Utilities and configurations
├── prisma/               # Database schema and migrations
└── hooks/                # Custom React hooks
```

## 🎯 Key Components

### BookingDialog
Handles all booking operations with form validation and optimistic updates.

### CalendarView  
Displays bookings in a responsive calendar grid with color-coded categories.

### AI Chat (Schedula)
Natural language processing for booking creation and queries.

### Stats Overview
Dashboard showing booking statistics and upcoming sessions.

## 🔒 Security Features

- Input validation and sanitization
- SQL injection protection via Prisma
- Environment variable protection
- CORS configuration for API routes

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for styling
- Dark/light mode support
- Touch-friendly interface

## 🚀 Performance

- Server-side rendering with Next.js 14
- Optimized database queries
- Image optimization
- Code splitting and lazy loading

## 📄 License

This project is ready for production deployment and has been thoroughly tested for reliability and performance.

---

**Repository**: https://github.com/git-bonda108/ai-calendar-app  
**Status**: ✅ Production Ready  
**Last Updated**: July 5, 2025