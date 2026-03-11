'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/admin'
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-1 text-[12px] text-[#666] hover:text-white transition-colors disabled:opacity-50"
    >
      <LogOut className="h-3 w-3" />
      {isPending ? 'Logging out...' : 'Logout'}
    </button>
  )
}
