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

function getStoredUser(): User | null {
  try {
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    if (!token || !userData) return null
    const parsed = JSON.parse(userData)
    if (!['ADMIN', 'SUPER_ADMIN'].includes(parsed.role)) return null
    return parsed
  } catch {
    return null
  }
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Synchronous first-pass: read localStorage immediately so we never show
  // a skeleton on navigation — localStorage is always available on the client.
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    return getStoredUser()
  })
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = getStoredUser()

    if (!stored) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      router.replace('/auth/login')
      return
    }

    setUser(stored)
    setReady(true)

    // Background token verification — doesn't block rendering
    const token = localStorage.getItem('admin_token')
    fetch('/api/auth/verify', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }).catch(() => {
      // Silently ignore network errors; only hard-redirect on 401
    }).then((res) => {
      if (res && res.status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        router.replace('/auth/login')
      }
    })
  }, [router])

  // On the very first client render, if localStorage had valid creds we already
  // have `user` — render immediately without any loading state.
  if (!user && !ready) return null

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <div className="flex-shrink-0">
        <AdminSideBar user={user!} />
      </div>
      <main className="flex-1 overflow-y-auto bg-black">
        {children}
      </main>
    </div>
  )
}