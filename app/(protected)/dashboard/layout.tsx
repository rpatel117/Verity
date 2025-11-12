/**
 * Dashboard Layout
 * 
 * Modern dashboard shell with floating header, fixed sidebar, and animated transitions
 */

import { AuthGuard } from '@/components/auth/AuthGuard'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
// import { motion } from 'framer-motion'
// import { fadeInUp } from '@/lib/motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Fixed Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="ml-60 lg:ml-60 md:ml-0">
          {/* Floating Header */}
          <AppHeader />
          
          {/* Content */}
          <main className="max-w-[1200px] mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
