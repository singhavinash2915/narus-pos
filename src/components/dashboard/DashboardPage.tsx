import { useState, useMemo } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { generateDemoOrders, demoMenuItems } from '@/lib/demo-data'
import { cn, formatCurrency, formatDate, formatShortDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, ShoppingBag, TrendingUp, Star } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import type { DashboardPeriod, Order } from '@/types'

const { orders: allOrders } = generateDemoOrders(85)

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899']

function getDateRange(period: DashboardPeriod): Date {
  const now = new Date()
  switch (period) {
    case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week': { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
    case 'month': { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d }
    case 'quarter': { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d }
  }
}

function KPICard({ title, value, icon: Icon, color }: { title: string; value: string; icon: typeof DollarSign; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center", color)}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { isMobile, isTablet } = useBreakpoint()
  const [period, setPeriod] = useState<DashboardPeriod>('month')

  const filteredOrders = useMemo(() => {
    const startDate = getDateRange(period)
    return allOrders.filter(o =>
      o.status === 'completed' && new Date(o.created_at) >= startDate
    )
  }, [period])

  // KPI calculations
  const kpis = useMemo(() => {
    const revenue = filteredOrders.reduce((s, o) => s + o.total, 0)
    const orderCount = filteredOrders.length
    const avgValue = orderCount > 0 ? revenue / orderCount : 0

    // Top item
    const itemCounts: Record<string, number> = {}
    filteredOrders.forEach(o => o.items?.forEach(i => {
      itemCounts[i.item_name] = (itemCounts[i.item_name] || 0) + i.quantity
    }))
    const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return { revenue, orderCount, avgValue, topItem }
  }, [filteredOrders])

  // Revenue trend data
  const revenueTrend = useMemo(() => {
    const dailyMap: Record<string, number> = {}
    filteredOrders.forEach(o => {
      const day = formatShortDate(o.created_at)
      dailyMap[day] = (dailyMap[day] || 0) + o.total
    })
    return Object.entries(dailyMap)
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
      .reverse()
      .slice(-14) // Last 14 data points
  }, [filteredOrders])

  // Order type distribution
  const orderTypeData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredOrders.forEach(o => {
      counts[o.order_type] = (counts[o.order_type] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }))
  }, [filteredOrders])

  // Top items
  const topItems = useMemo(() => {
    const itemCounts: Record<string, { quantity: number; revenue: number }> = {}
    filteredOrders.forEach(o => o.items?.forEach(i => {
      if (!itemCounts[i.item_name]) itemCounts[i.item_name] = { quantity: 0, revenue: 0 }
      itemCounts[i.item_name].quantity += i.quantity
      itemCounts[i.item_name].revenue += i.line_total
    }))
    return Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8)
  }, [filteredOrders])

  // Payment methods
  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredOrders.forEach(o => {
      if (o.payment_method) {
        counts[o.payment_method] = (counts[o.payment_method] || 0) + 1
      }
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }))
  }, [filteredOrders])

  // Recent orders
  const recentOrders = filteredOrders.slice(0, 10)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as DashboardPeriod)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* KPI Cards */}
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : isTablet ? "grid-cols-2" : "grid-cols-4"
        )}>
          <KPICard title="Revenue" value={formatCurrency(kpis.revenue)} icon={DollarSign} color="bg-green-500" />
          <KPICard title="Orders" value={kpis.orderCount.toString()} icon={ShoppingBag} color="bg-blue-500" />
          <KPICard title="Avg Value" value={formatCurrency(kpis.avgValue)} icon={TrendingUp} color="bg-purple-500" />
          <KPICard title="Top Item" value={kpis.topItem} icon={Star} color="bg-amber-500" />
        </div>

        {/* Charts */}
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-2"
        )}>
          {/* Revenue Trend */}
          <Card className={cn(!isMobile && "col-span-2")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                  <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Types Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={orderTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {orderTypeData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {paymentData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-2">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="text-sm font-medium">#{order.order_number}</span>
                      <p className="text-xs text-neutral-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatCurrency(order.total)}</span>
                      <p className="text-xs text-neutral-500 capitalize">{order.payment_method}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-neutral-500">#</th>
                      <th className="text-left px-3 py-2 font-medium text-neutral-500">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-neutral-500">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-neutral-500">Items</th>
                      <th className="text-left px-3 py-2 font-medium text-neutral-500">Payment</th>
                      <th className="text-right px-3 py-2 font-medium text-neutral-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50">
                        <td className="px-3 py-2 font-medium">{order.order_number}</td>
                        <td className="px-3 py-2 text-neutral-500">{formatDate(order.created_at)}</td>
                        <td className="px-3 py-2 capitalize">{order.order_type.replace('-', ' ')}</td>
                        <td className="px-3 py-2">{order.items?.length || 0}</td>
                        <td className="px-3 py-2 capitalize">{order.payment_method}</td>
                        <td className="px-3 py-2 text-right font-bold">{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
