import { Outlet } from 'react-router-dom'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { Sidebar } from './Sidebar'
import { BottomTabBar } from './BottomTabBar'

export function AppShell() {
  const { isMobile } = useBreakpoint()

  return (
    <div className="h-svh flex overflow-hidden" style={{ paddingTop: 'var(--sat)' }}>
      {/* Desktop/Tablet: Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <main
        className="flex-1 overflow-hidden"
        style={isMobile ? { paddingBottom: 'calc(56px + var(--sab))' } : undefined}
      >
        <Outlet />
      </main>

      {/* Mobile: Bottom Tab Bar */}
      {isMobile && <BottomTabBar />}
    </div>
  )
}
