import type { Metadata } from 'next'
import { getSiteConfig } from '@/lib/site-config'

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig()
  const adminLabel = config.dashboard?.adminLabel ?? `${config.siteName ?? 'Kudan'} Admin`
  return {
    title: `Settings | ${adminLabel}`,
    description: 'Manage your dashboard settings',
  }
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <p className="text-gray-600">Settings management coming soon...</p>
    </div>
  )
}