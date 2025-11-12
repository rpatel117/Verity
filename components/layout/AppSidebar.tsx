/**
 * App Sidebar Component
 * 
 * Modern fixed sidebar with glassmorphism and smooth animations
 * Hidden on mobile, visible on desktop (≥lg)
 */

"use client"

import { SidebarContent } from './SidebarContent'

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 w-60 h-full glass-panel border-r border-white/20 z-40 hidden lg:flex flex-col">
      <SidebarContent />
    </aside>
  )
}
