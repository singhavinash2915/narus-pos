import { useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, ClipboardList, Settings, BarChart3 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const iconMap = {
  ShoppingCart,
  ClipboardList,
  Settings,
  BarChart3,
}

const navItems = [
  { path: '/pos', label: 'POS', icon: 'ShoppingCart' as const, roles: ['staff', 'owner'] },
  { path: '/orders', label: 'Orders', icon: 'ClipboardList' as const, roles: ['staff', 'owner'] },
  { path: '/manage', label: 'Manage', icon: 'Settings' as const, roles: ['owner'] },
  { path: '/dashboard', label: 'Dashboard', icon: 'BarChart3' as const, roles: ['owner'] },
]

export function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { staff } = useAuth()

  const visibleItems = navItems.filter(item =>
    staff && item.roles.includes(staff.role)
  )

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border flex items-center justify-around"
      style={{ paddingBottom: 'var(--sab)', height: `calc(56px + var(--sab))` }}
    >
      {visibleItems.map(item => {
        const Icon = iconMap[item.icon]
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[48px] cursor-pointer transition-colors",
              isActive
                ? "text-brand-500"
                : "text-neutral-400"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
