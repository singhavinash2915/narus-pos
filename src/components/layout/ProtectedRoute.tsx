import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { StaffRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: StaffRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, staff } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole === 'owner' && staff?.role !== 'owner') {
    return <Navigate to="/pos" replace />
  }

  return <>{children}</>
}
