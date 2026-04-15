import { useState, useMemo } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { generateDemoOrders } from '@/lib/demo-data'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog'
import { Eye, Play, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Order, OrderStatus } from '@/types'

const { orders: demoOrders } = generateDemoOrders(85)

const statusColors: Record<OrderStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  saved: 'bg-blue-100 text-blue-800',
  held: 'bg-amber-100 text-amber-800',
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md hover:border-brand-200 transition-all active:scale-[0.99]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">#{order.order_number}</span>
        <Badge className={cn('text-[10px]', statusColors[order.status])}>
          {order.status}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
        <span className="capitalize">{order.order_type.replace('-', ' ')}</span>
        <span>{formatDate(order.created_at)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {order.items?.length || 0} items
          {order.table_number && ` · ${order.table_number}`}
        </span>
        <span className="font-bold text-brand-600">{formatCurrency(order.total)}</span>
      </div>
      {order.payment_method && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {order.payment_method}
          </Badge>
        </div>
      )}
    </div>
  )
}

function OrderDetailModal({ order, open, onClose }: { order: Order | null; open: boolean; onClose: () => void }) {
  if (!order) return null

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Order #{order.order_number}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn(statusColors[order.status])}>{order.status}</Badge>
          <Badge variant="secondary" className="capitalize">{order.order_type.replace('-', ' ')}</Badge>
          {order.payment_method && (
            <Badge variant="secondary" className="capitalize">{order.payment_method}</Badge>
          )}
          {order.table_number && (
            <Badge variant="outline">{order.table_number}</Badge>
          )}
        </div>

        <div className="text-xs text-neutral-500">{formatDate(order.created_at)}</div>

        {/* Items */}
        <div className="space-y-2">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-dashed">
              <div>
                <span className="font-medium">{item.item_name}</span>
                <span className="text-neutral-500 ml-1">({item.variation})</span>
                <span className="text-neutral-400 ml-1">x{item.quantity}</span>
              </div>
              <span className="font-medium">{formatCurrency(item.line_total)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1 text-sm pt-2 border-t">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {order.discount_label && `(${order.discount_label})`}</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-neutral-500">Tax</span>
            <span>{formatCurrency(order.tax_amount)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t">
            <span>Total</span>
            <span className="text-brand-600">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {order.status === 'held' && (
          <Button className="w-full" size="touch">
            <Play className="w-4 h-4" />
            Resume Order
          </Button>
        )}
      </div>
    </ResponsiveDialog>
  )
}

export function OrdersPage() {
  const { isMobile, isTablet } = useBreakpoint()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = useMemo(() => {
    let filtered = demoOrders
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(o =>
        o.order_number.toString().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.items?.some(i => i.item_name.toLowerCase().includes(q))
      )
    }
    return filtered
  }, [statusFilter, searchQuery])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Orders</h1>
          <Badge variant="secondary">{filteredOrders.length} orders</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
            <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
            <TabsTrigger value="held" className="flex-1">On Hold</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-3"
        )}>
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => setSelectedOrder(order)}
            />
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center text-neutral-400 py-12">
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
