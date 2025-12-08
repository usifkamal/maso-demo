'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    email?: string | null
    user_metadata?: {
      full_name?: string
    }
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isDashboardRoot = pathname === '/dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-950">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


