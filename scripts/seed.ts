
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing bookings for a fresh start
  console.log('🧹 Clearing existing bookings...')
  await prisma.booking.deleteMany({})
  
  console.log('✅ Database cleared successfully')

  // Create July 2025 schedule with sample bookings
  console.log('📅 Creating July 2025 schedule...')

  const july2025Bookings = [
    // Week 1 (July 1-6, 2025)
    {
      title: 'Introduction to Machine Learning',
      description: 'Fundamentals of ML algorithms and applications',
      startTime: new Date('2025-07-01T10:00:00'),
      endTime: new Date('2025-07-01T12:00:00'),
      clientName: 'TechCorp Solutions',
      clientEmail: 'sarah.johnson@techcorp.com',
      category: 'Training',
    },
    {
      title: 'Azure Fundamentals Workshop',
      description: 'Azure basics and core services overview',
      startTime: new Date('2025-07-02T14:00:00'),
      endTime: new Date('2025-07-02T17:00:00'),
      clientName: 'Global Enterprises',
      clientEmail: 'mike.chen@globalent.com',
      category: 'Workshop',
    },
    {
      title: 'Network Security Consultation',
      description: 'IT security best practices and implementation',
      startTime: new Date('2025-07-03T09:00:00'),
      endTime: new Date('2025-07-03T11:30:00'),
      clientName: 'SecureNet Inc.',
      clientEmail: 'anna.davis@securenet.com',
      category: 'Consultation',
    },
    {
      title: 'Deep Learning Strategy Meeting',
      description: 'Advanced neural networks and deep learning planning',
      startTime: new Date('2025-07-04T13:00:00'),
      endTime: new Date('2025-07-04T16:00:00'),
      clientName: 'DataScience Pro',
      clientEmail: 'raj.patel@datasci.com',
      category: 'Meeting',
    },

    // Week 2 (July 7-13, 2025)
    {
      title: 'Azure DevOps Training',
      description: 'CI/CD pipelines and deployment automation',
      startTime: new Date('2025-07-07T10:00:00'),
      endTime: new Date('2025-07-07T13:00:00'),
      clientName: 'DevOps Masters',
      clientEmail: 'lisa.wong@devopsm.com',
      category: 'Training',
    },
    {
      title: 'Computer Vision Workshop',
      description: 'Image processing and computer vision with ML',
      startTime: new Date('2025-07-08T14:00:00'),
      endTime: new Date('2025-07-08T17:00:00'),
      clientName: 'Vision AI Labs',
      clientEmail: 'carlos.rodriguez@visionai.com',
      category: 'Workshop',
    },
    {
      title: 'Database Management Review',
      description: 'SQL and NoSQL database performance review',
      startTime: new Date('2025-07-09T09:30:00'),
      endTime: new Date('2025-07-09T12:30:00'),
      clientName: 'Data Systems Corp',
      clientEmail: 'emily.brown@datasys.com',
      category: 'Review',
    },
    {
      title: 'Azure ML Consultation',
      description: 'Cloud-based ML model development consultation',
      startTime: new Date('2025-07-10T15:00:00'),
      endTime: new Date('2025-07-10T18:00:00'),
      clientName: 'CloudML Innovations',
      clientEmail: 'david.kim@cloudml.com',
      category: 'Consultation',
    },
    {
      title: 'NLP Strategy Meeting',
      description: 'Natural language processing project planning',
      startTime: new Date('2025-07-11T10:00:00'),
      endTime: new Date('2025-07-11T13:00:00'),
      clientName: 'TextAnalytics Inc.',
      clientEmail: 'sofia.garcia@textanalytics.com',
      category: 'Meeting',
    },

    // Week 3 (July 14-20, 2025)
    {
      title: 'Azure Security and Compliance',
      description: 'Security best practices in Azure cloud',
      startTime: new Date('2025-07-14T09:00:00'),
      endTime: new Date('2025-07-14T12:00:00'),
      clientName: 'SecureCloud Solutions',
      clientEmail: 'robert.taylor@securecloud.com',
      category: 'Training',
    },
    {
      title: 'Cloud Infrastructure Management',
      description: 'Managing and monitoring cloud resources',
      startTime: new Date('2025-07-15T14:00:00'),
      endTime: new Date('2025-07-15T17:00:00'),
      clientName: 'InfraManage Pro',
      clientEmail: 'jennifer.lee@inframanage.com',
      category: 'Consultation',
    },
    {
      title: 'Reinforcement Learning Workshop',
      description: 'RL algorithms and practical applications',
      startTime: new Date('2025-07-16T10:30:00'),
      endTime: new Date('2025-07-16T13:30:00'),
      clientName: 'RL Research Group',
      clientEmail: 'alex.nguyen@rlresearch.com',
      category: 'Workshop',
    },
    {
      title: 'Azure Kubernetes Service',
      description: 'Container orchestration with AKS',
      startTime: new Date('2025-07-17T15:00:00'),
      endTime: new Date('2025-07-17T18:00:00'),
      clientName: 'Container Solutions',
      clientEmail: 'maria.gonzalez@containersol.com',
      category: 'Training',
    },
    {
      title: 'Cybersecurity Fundamentals',
      description: 'Essential cybersecurity concepts and practices',
      startTime: new Date('2025-07-18T09:00:00'),
      endTime: new Date('2025-07-18T12:00:00'),
      clientName: 'CyberDefense Academy',
      clientEmail: 'thomas.wilson@cyberdefense.com',
      category: 'Training',
    },

    // Week 4 (July 21-27, 2025)
    {
      title: 'MLOps and Model Deployment',
      description: 'Production ML systems and operations',
      startTime: new Date('2025-07-21T14:00:00'),
      endTime: new Date('2025-07-21T17:00:00'),
      clientName: 'MLOps Experts',
      clientEmail: 'priya.sharma@mlopsexperts.com',
      category: 'Training',
    },
    {
      title: 'Azure Data Factory Workshop',
      description: 'Data integration and ETL processes',
      startTime: new Date('2025-07-22T10:00:00'),
      endTime: new Date('2025-07-22T13:00:00'),
      clientName: 'DataFlow Systems',
      clientEmail: 'kevin.anderson@dataflow.com',
      category: 'Workshop',
    },
    {
      title: 'Advanced Python Programming',
      description: 'Advanced Python concepts for developers',
      startTime: new Date('2025-07-23T13:30:00'),
      endTime: new Date('2025-07-23T16:30:00'),
      clientName: 'Python Professionals',
      clientEmail: 'rachel.white@pythonpro.com',
      category: 'Training',
    },
    {
      title: 'Computer Vision with Azure',
      description: 'Azure Cognitive Services for computer vision',
      startTime: new Date('2025-07-24T09:30:00'),
      endTime: new Date('2025-07-24T12:30:00'),
      clientName: 'Vision Cloud Inc.',
      clientEmail: 'james.martin@visioncloud.com',
      category: 'Consultation',
    },
    {
      title: 'Predictive Analytics Workshop',
      description: 'Statistical modeling and predictive techniques',
      startTime: new Date('2025-07-25T14:00:00'),
      endTime: new Date('2025-07-25T17:00:00'),
      clientName: 'Analytics Solutions',
      clientEmail: 'stephanie.jones@analyticsol.com',
      category: 'Workshop',
    },

    // Week 5 (July 28-31, 2025)
    {
      title: 'Azure IoT Solutions',
      description: 'Internet of Things development with Azure',
      startTime: new Date('2025-07-28T10:00:00'),
      endTime: new Date('2025-07-28T13:00:00'),
      clientName: 'IoT Innovations',
      clientEmail: 'brian.thompson@iotinnovations.com',
      category: 'Training',
    },
    {
      title: 'DevOps Best Practices',
      description: 'Modern DevOps methodologies and tools',
      startTime: new Date('2025-07-29T14:30:00'),
      endTime: new Date('2025-07-29T17:30:00'),
      clientName: 'DevOps Academy',
      clientEmail: 'nicole.clark@devopsacademy.com',
      category: 'Review',
    },
    {
      title: 'AI Ethics and Responsible AI',
      description: 'Ethical considerations in AI development',
      startTime: new Date('2025-07-30T09:00:00'),
      endTime: new Date('2025-07-30T11:30:00'),
      clientName: 'Ethical AI Institute',
      clientEmail: 'michael.davis@ethicalai.org',
      category: 'Meeting',
    },
    {
      title: 'Azure Cost Optimization',
      description: 'Managing and optimizing Azure costs',
      startTime: new Date('2025-07-31T15:00:00'),
      endTime: new Date('2025-07-31T17:30:00'),
      clientName: 'CloudCost Consultants',
      clientEmail: 'laura.miller@cloudcost.com',
      category: 'Consultation',
    },
  ]

  // Insert bookings
  for (const booking of july2025Bookings) {
    await prisma.booking.create({
      data: booking,
    })
  }

  console.log(`✅ Created ${july2025Bookings.length} sessions for July 2025`)
  
  // Display summary
  const totalBookings = await prisma.booking.count()
  const categories = [...new Set(july2025Bookings.map(b => b.category))]
  
  console.log('\n📊 Database Summary:')
  console.log(`   Available Categories: ${categories.join(', ')}`)
  console.log(`   Total Bookings: ${totalBookings}`)
  console.log(`   July 2025 Sessions: ${july2025Bookings.length}`)
  
  console.log('\n🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
