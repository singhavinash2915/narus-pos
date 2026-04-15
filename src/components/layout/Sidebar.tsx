import { useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, ClipboardList, Settings, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { APP_SHORT_NAME } from '@/lib/constants'

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

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { staff, logout } = useAuth()

  const visibleItems = navItems.filter(item =>
    staff && item.roles.includes(staff.role)
  )

  return (
    <aside className="w-16 bg-neutral-900 flex flex-col items-center py-4 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-lg mb-6">
        N
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 w-full px-2">
        {visibleItems.map(item => {
          const Icon = iconMap[item.icon]
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer group relative",
                isActive
                  ? "bg-brand-500 text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Staff name + Logout */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-white font-medium" title={staff?.name}>
          {staff?.name?.charAt(0) || '?'}
        </div>
        <button
          onClick={logout}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}
