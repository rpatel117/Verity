/**
 * Mobile Navigation Drawer Component
 * 
 * Mobile drawer for navigation using Sheet component
 */

"use client"

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { SidebarContent } from './SidebarContent'

export function MobileNavDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full glass-panel">
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  )
}

