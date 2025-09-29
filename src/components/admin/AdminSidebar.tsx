'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  FolderOpen, 
  UtensilsCrossed, 
  ClipboardList, 
  Zap, 
  TrendingUp, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  ClipboardCheckIcon,
  DollarSignIcon
} from 'lucide-react'

interface User {
  id: string
  name?: string
  email: string
  role: string
}

interface AdminSideBarProps {
  user: User
}

export default function AdminSideBar({ user }: AdminSideBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
    router.push('/auth/login')
  }

  const navigationItems = [
    
    { 
      label: 'Categories', 
      href: '/admin/categories', 
      icon: FolderOpen
    },
    { 
      label: 'Food Menu', 
      href: '/admin/menu', 
      icon: UtensilsCrossed
    },
    { 
      label: 'All Orders', 
      href: '/admin/orders', 
      icon: ClipboardList
    },
    { 
      label: 'Create Orders', 
      href: '/admin/orders/create', 
      icon: ClipboardCheckIcon
    },
    { 
      label: 'Income', 
      href: '/admin/revenue', 
      icon: DollarSignIcon
    },
    // { 
    //   label: 'Special Deals', 
    //   href: '/admin/special-deals', 
    //   icon: Zap
    // },
    { 
      label: 'Analytics', 
      href: '/admin/analytics', 
      icon: TrendingUp
    }
  ]

 const isActiveRoute = (href: string) => {
  if (href === '/admin/orders') {
    // Only match exactly /admin/orders, not its children
    return pathname === '/admin/orders'
  }
  return pathname === href || pathname.startsWith(href + '/')
}

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <aside className={`h-screen bg-gray-900 text-white flex flex-col ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-6"></div>
            <div className="h-20 bg-gray-800 rounded mb-6"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-800 flex-shrink-0">
          <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className={`h-screen bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header with Toggle */}
          <div className="flex items-center justify-between mb-6">
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-yellow-400">Admin Panel</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {/* User Info */}
          {!isCollapsed && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                  {user.name?.[0] || user.email[0] ? (
                    (user.name?.[0] || user.email[0]).toUpperCase()
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400">Welcome back,</p>
                  <p className="text-white font-medium truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-yellow-400 uppercase font-semibold">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed User Avatar */}
          {isCollapsed && (
            <div className="mb-6 flex justify-center">
              <div 
                className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold cursor-pointer"
                title={`${user.name || user.email} (${user.role})`}
              >
                {user.name?.[0] || user.email[0] ? (
                  (user.name?.[0] || user.email[0]).toUpperCase()
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActiveRoute(item.href) 
                      ? 'bg-yellow-500 text-gray-900 font-semibold shadow-lg' 
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <IconComponent className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {!isCollapsed && isActiveRoute(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-gray-900 rounded-full"></div>
                  )}
                </a>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Logout Section - Fixed at Bottom */}
      <div className="p-6 border-t border-gray-800 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 
            text-white rounded-lg transition-colors font-medium
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}