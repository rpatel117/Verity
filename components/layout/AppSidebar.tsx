/**
 * App Sidebar Component
 * 
 * Modern fixed sidebar with glassmorphism and smooth animations
 */

"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// import { motion } from 'framer-motion'
// import { slideInFromLeft, staggerChildren, staggerItem, fadeInUp } from '@/lib/motion'
import { CheckCircle, Database, FileText, Shield } from 'lucide-react'

const navigationItems = [
  { name: 'Check-In', href: '/dashboard/check-in', icon: CheckCircle },
  { name: 'Data', href: '/dashboard/data', icon: Database },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 w-60 h-full glass-panel border-r border-white/20 z-40 lg:block md:hidden">
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-heading font-semibold gradient-text">
            Verity
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <div key={item.href}>
              <Link href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start transition-all duration-120',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-white/50 hover:text-primary'
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
