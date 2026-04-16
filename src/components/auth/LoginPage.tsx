import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PinPad } from './PinPad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { APP_NAME } from '@/lib/constants'

export function LoginPage() {
  const { isAuthenticated, login, loginOwner } = useAuth()
  const [pinError, setPinError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ownerError, setOwnerError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/pos" replace />
  }

  const handlePinSubmit = async (pin: string) => {
    setIsLoading(true)
    setPinError('')
    const result = await login(pin)
    if (!result.success) {
      setPinError(result.error || 'Invalid PIN')
    }
    setIsLoading(false)
  }

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setOwnerError('')
    const result = await loginOwner(email, password)
    if (!result.success) {
      setOwnerError(result.error || 'Login failed')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            N
          </div>
          <h1 className="text-xl font-bold text-neutral-900">{APP_NAME}</h1>
          <p className="text-sm text-neutral-500 mt-1">POS System</p>
        </div>

        {/* Login Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <Tabs defaultValue="pin">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="pin">Staff PIN</TabsTrigger>
              <TabsTrigger value="owner">Owner Login</TabsTrigger>
            </TabsList>

            <TabsContent value="pin">
              <div className="text-center mb-4">
                <p className="text-sm text-neutral-500">Enter your 4-digit PIN</p>
              </div>
              <PinPad onSubmit={handlePinSubmit} isLoading={isLoading} error={pinError} />
              <div className="mt-4 text-center">
                <p className="text-xs text-neutral-400">Contact your manager for your PIN</p>
              </div>
            </TabsContent>

            <TabsContent value="owner">
              <form onSubmit={handleOwnerLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="owner@narusbiryani.com"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="h-12"
                  />
                </div>
                {ownerError && (
                  <p className="text-sm text-destructive">{ownerError}</p>
                )}
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                <p className="text-xs text-neutral-400 text-center">
                  Use your Supabase Auth credentials
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
