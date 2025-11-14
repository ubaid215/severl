// admin/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import AdminSideBar from '@/components/admin/AdminSidebar'

interface User {
  id: string
  name?: string
  email: string
  role: string
}

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        const userData = localStorage.getItem('admin_user')

        if (!token || !userData) {
          router.push('/auth/login')
          return
        }

        const parsedUser = JSON.parse(userData)
        
        // Check if user has admin privileges
        if (!['ADMIN', 'SUPER_ADMIN'].includes(parsedUser.role)) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          router.push('/auth/login')
          return
        }

        // Optionally verify token with backend
        const response = await fetch('/api/auth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          // Token is invalid, clear storage and redirect
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          router.push('/auth/login')
          return
        }

        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center space-x-2">
          <svg 
            className="animate-spin h-8 w-8 text-yellow-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-yellow-400">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (redirect is in progress)
  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Fixed Sidebar */}
      <div className="flex-shrink-0">
        <AdminSideBar user={user!} />
      </div>
      
      {/* Main Content Area with Scroll */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}