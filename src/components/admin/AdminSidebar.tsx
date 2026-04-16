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
  DollarSignIcon,
  Home,
  Menu,
  X
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
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Close mobile sidebar when route changes on mobile
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Close mobile sidebar when pathname changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }, [pathname, isMobile])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen, isMobile])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
    router.push('/auth/login')
  }

  const navigationItems = [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { label: 'Food Menu', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'All Orders', href: '/admin/orders', icon: ClipboardList },
    { label: 'Create Orders', href: '/admin/orders/create', icon: ClipboardCheckIcon },
    { label: 'Income', href: '/admin/revenue', icon: DollarSignIcon },
    { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp }
  ]

  const isActiveRoute = (href: string) => {
  // Exact match for dashboard
  if (href === '/admin') {
    return pathname === href
  }
  
  // For orders routes - handle parent/child relationship
  if (href === '/admin/orders') {
    // Only match exactly '/admin/orders' or '/admin/orders/' 
    // but not '/admin/orders/create' or '/admin/orders/123'
    return pathname === href || pathname === href + '/'
  }
  
  // For all other routes, exact match only
  return pathname === href
}

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  const SidebarContent = () => (
    <>
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 md:p-6">
          {/* Header with Toggle */}
          <div className="flex items-center justify-between mb-6">
            {(!isCollapsed || isMobile) && (
              <h2 className="text-xl font-bold text-yellow-400">Admin Panel</h2>
            )}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}
            {isMobile && (
              <button
                onClick={closeMobileSidebar}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors md:hidden"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* User Info */}
          {(!isCollapsed || isMobile) && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold shrink-0">
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
                </div>
              </div>
            </div>
          )}

          {/* Collapsed User Avatar (Desktop only) */}
          {!isMobile && isCollapsed && (
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
              const active = isActiveRoute(item.href)
              
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={`
                    group flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg 
                    transition-all duration-200 cursor-pointer
                    ${active 
                      ? 'bg-yellow-500 text-gray-900 font-semibold shadow-lg' 
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                    }
                    ${(!isMobile && isCollapsed) ? 'justify-center px-2' : ''}
                  `}
                  title={(!isMobile && isCollapsed) ? item.label : ''}
                >
                  <IconComponent className={`w-5 h-5 shrink-0 ${active ? 'text-gray-900' : ''}`} />
                  {((!isCollapsed && !isMobile) || isMobile) && (
                    <span className="font-medium flex-1">{item.label}</span>
                  )}
                  {((!isCollapsed && !isMobile) || isMobile) && active && (
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  )}
                </a>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Logout Section - Fixed at Bottom */}
      <div className="p-4 md:p-6 border-t border-gray-800 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 
            bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors 
            font-medium group
            ${(!isMobile && isCollapsed) ? 'justify-center' : ''}
          `}
          title={(!isMobile && isCollapsed) ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {((!isCollapsed && !isMobile) || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </>
  )

  // Loading state
  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="hidden md:block h-screen bg-[#1A1C20] w-64"></div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-[#1A1C20] text-white rounded-lg shadow-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          bg-[#1A1C20] text-white flex flex-col transition-all duration-300
          ${isMobile 
            ? `fixed top-0 left-0 h-full z-50 shadow-2xl transform ${
                isMobileOpen ? 'translate-x-0' : '-translate-x-full'
              } w-72`
            : `h-screen ${isCollapsed ? 'w-20' : 'w-64'} sticky top-0`
          }
        `}
      >
        <SidebarContent />
      </aside>

      {/* Global Styles for custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2D3748;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4A5568;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </>
  )
}