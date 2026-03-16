import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('kudan_token')?.value
  
  // Middleware handles redirects, but this is a safety check
  if (!token) {
    // Middleware will have already redirected, but as fallback:
    redirect('/login')
  }
  
  return <div>{children}</div>
}