import { useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, ClipboardList, Settings, BarChart3, LogOut } from 'lucide-react'
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
  { path: '/dashboard', label: 'Admin', icon: 'BarChart3' as const, roles: ['owner'] },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { staff, logout } = useAuth()

  const visibleItems = navItems.filter(item =>
    staff && item.roles.includes(staff.role)
  )

  return (
    <aside className="w-16 bg-white border-r border-neutral-200 flex flex-col items-center py-4 shrink-0">
      {/* Logo (avatar circle) */}
      <div
        className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-sm mb-6"
        title={staff?.name}
      >
        {staff?.name?.charAt(0).toUpperCase() || 'N'}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-2">
        {visibleItems.map(item => {
          const Icon = iconMap[item.icon]
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-12 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer",
                isActive
                  ? "bg-brand-50 text-brand-600"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-none font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer mt-4"
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </aside>
  )
}
