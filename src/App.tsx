import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { CurrentOrderProvider } from '@/contexts/CurrentOrderContext'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/components/auth/LoginPage'
import { POSPage } from '@/components/pos/POSPage'
import { OrdersPage } from '@/components/orders/OrdersPage'
import { ManagePage } from '@/components/manage/ManagePage'
import { DashboardPage } from '@/components/dashboard/DashboardPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrentOrderProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }>
                <Route path="/pos" element={<POSPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/manage" element={
                  <ProtectedRoute requiredRole="owner">
                    <ManagePage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="owner">
                    <DashboardPage />
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </HashRouter>
        </CurrentOrderProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
