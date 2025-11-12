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
        <div className="lg:ml-60">
          {/* Floating Header */}
          <AppHeader />
          
          {/* Content */}
          <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-6 py-4 sm:py-6 lg:py-8 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
