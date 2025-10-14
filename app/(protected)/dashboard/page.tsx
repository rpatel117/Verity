/**
 * Dashboard Home Page
 * 
 * Redirects to /dashboard/check-in as the default route
 */

import { redirect } from 'next/navigation'

export default function DashboardPage() {
  redirect('/dashboard/check-in')
}

