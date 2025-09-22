import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve)
  })
}

// To create Admin npm run db:seed


async function createAdmin() {
  try {
    console.log('🚀 Creating Admin User...\n')

    const email = (await question('Enter admin email: ')).trim()
    const password = (await question('Enter admin password: ')).trim()
    const name = (await question('Enter admin name: ')).trim()
    const roleInput = (await question('Enter role (ADMIN/SUPER_ADMIN) [SUPER_ADMIN]: ')).trim()

    // ✅ Default role handling
    const role: Role = (roleInput && ['ADMIN', 'SUPER_ADMIN'].includes(roleInput.toUpperCase()))
      ? (roleInput.toUpperCase() as Role)
      : 'SUPER_ADMIN'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`)
    }

    // ✅ Hash password properly
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('🔒 Password hashed successfully')

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('📋 User Details:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Created: ${user.createdAt}`)
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Handle script arguments
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: npx tsx scripts/create-admin.ts

This script creates an admin user for the system.
You will be prompted to enter:
- Email address
- Password
- Name
- Role (ADMIN or SUPER_ADMIN) [defaults to SUPER_ADMIN]

Environment Variables Required:
- DATABASE_URL: PostgreSQL connection string

Example:
  npx tsx scripts/create-admin.ts
  `)
  process.exit(0)
}

createAdmin()
