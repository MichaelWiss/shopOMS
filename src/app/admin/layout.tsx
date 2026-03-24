import Link from 'next/link'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Warehouse, 
  RefreshCw, 
  Settings,
  ChevronRight
} from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'
import { siteConfig } from '@/lib/site-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    ...(siteConfig.flags.adminInventoryDashboard
      ? [{ href: '/admin/inventory', label: 'Inventory', icon: Warehouse }]
      : []),
    ...(siteConfig.flags.adminProductDashboard
      ? [{ href: '/admin/products', label: 'Products', icon: Package }]
      : []),
    { href: '/admin/sync', label: 'Sync Logs', icon: RefreshCw },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Top Bar */}
      <header className="bg-[#1a1a1a] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-[16px] font-medium tracking-[-0.01em]">
            Press & Co <span className="text-[#666] ml-1">OMS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-[13px] text-[#999] hover:text-white transition-colors rounded"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#666]">{siteConfig.email}</span>
          <Link href="/" className="text-[12px] text-[#666] hover:text-white">
            View Store →
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
