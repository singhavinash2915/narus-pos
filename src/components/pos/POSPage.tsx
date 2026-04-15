import { useState, useMemo, useEffect } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useCurrentOrder } from '@/contexts/CurrentOrderContext'
import type { OrderTotals } from '@/contexts/CurrentOrderContext'
import { demoCategories, demoMenuItems, demoCoupons } from '@/lib/demo-data'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ShoppingCart, Minus, Plus, Trash2, X, Percent,
  CreditCard, Banknote, Smartphone, Printer, Tag, IndianRupee,
  Search,
} from 'lucide-react'
import { ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog'
import { hapticLight, hapticMedium } from '@/lib/native'
import {
  RESTAURANT_NAME, RESTAURANT_GSTIN, RESTAURANT_ADDRESS, RESTAURANT_PHONE,
  CGST_RATE, SGST_RATE,
} from '@/lib/constants'
import type { MenuItem, Variation, CartItem, CartDiscount, OrderType, PaymentMethod } from '@/types'

// ──────────────────────────────────────
// Live clock — updates each minute
// ──────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000)
    return () => clearInterval(id)
  }, [])
  return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
}

// ──────────────────────────────────────
// POS Top Header — logo, order-type tabs, search, clock
// ──────────────────────────────────────
function POSHeader({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (q: string) => void
}) {
  const { order, setOrderType } = useCurrentOrder()
  const time = useClock()

  return (
    <div className="px-4 py-2.5 border-b bg-white flex items-center gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
          N
        </div>
        <span className="text-brand-500 font-bold text-base hidden md:inline">NARU&apos;s POS</span>
      </div>

      {/* Order Type Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
        {(['dine-in', 'delivery', 'pickup'] as const).map(type => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize cursor-pointer',
              order.order_type === type
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            {type === 'dine-in' ? 'Dine In' : type === 'pickup' ? 'Pick Up' : 'Delivery'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 h-9 bg-neutral-50 border-neutral-200"
        />
      </div>

      {/* Clock */}
      <div className="text-sm text-neutral-500 shrink-0 tabular-nums hidden sm:block">
        {time}
      </div>
    </div>
  )
}

// ──────────────────────────────────────
// Category Sidebar / Chips
// ──────────────────────────────────────
function CategorySelector({
  categories,
  selectedId,
  onSelect,
  layout,
}: {
  categories: typeof demoCategories
  selectedId: string
  onSelect: (id: string) => void
  layout: 'sidebar' | 'chips'
}) {
  if (layout === 'chips') {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
        <button
          onClick={() => onSelect('all')}
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
            selectedId === 'all'
              ? "bg-brand-500 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
              selectedId === cat.id
                ? "bg-brand-500 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white border-r overflow-y-auto shrink-0 w-40 lg:w-44">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          "w-full text-left px-4 py-3 text-sm font-medium transition-colors cursor-pointer min-h-[48px]",
          selectedId === 'all'
            ? "bg-brand-50 text-brand-600 font-semibold"
            : "text-neutral-600 hover:bg-neutral-50"
        )}
      >
        All Items
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "w-full text-left px-4 py-3 text-sm font-medium transition-colors cursor-pointer min-h-[48px]",
            selectedId === cat.id
              ? "bg-brand-50 text-brand-600 font-semibold"
              : "text-neutral-600 hover:bg-neutral-50"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

// ──────────────────────────────────────
// Menu Item Card — tinted background by veg/non-veg
// ──────────────────────────────────────
function MenuItemCard({
  item,
  onAdd,
}: {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}) {
  const isVeg = item.type === 'veg'
  return (
    <button
      onClick={() => onAdd(item)}
      disabled={!item.is_available}
      className={cn(
        "rounded-xl border p-3 text-left transition-all cursor-pointer hover:shadow-md active:scale-[0.98] min-h-[88px] flex flex-col justify-between",
        isVeg
          ? "bg-green-50 border-green-100 hover:border-green-200"
          : "bg-rose-50 border-rose-100 hover:border-rose-200",
        !item.is_available && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0 flex-1">
          {/* Veg/non-veg indicator square */}
          <span className={cn(
            "w-3 h-3 rounded-sm border-2 shrink-0 mt-0.5",
            isVeg ? "border-veg" : "border-nonveg"
          )}>
            <span className={cn(
              "block w-1.5 h-1.5 rounded-full m-auto mt-[1px]",
              isVeg ? "bg-veg" : "bg-nonveg"
            )} />
          </span>
          <span className="text-sm font-semibold text-neutral-800 leading-tight">
            {item.name}
          </span>
        </div>
        <span className="text-sm font-bold text-neutral-700 shrink-0">
          ₹{item.price_full}
        </span>
      </div>
      {item.price_half != null && (
        <div className="text-[11px] text-neutral-500 mt-1.5">
          Half: ₹{item.price_half}
        </div>
      )}
    </button>
  )
}

// ──────────────────────────────────────
// Order Panel
// ──────────────────────────────────────
function OrderPanel({
  onPayment,
  onOpenDiscount,
  onPrintKOT,
  onSave,
  onHold,
}: {
  onPayment: () => void
  onOpenDiscount: () => void
  onPrintKOT: () => void
  onSave: () => void
  onHold: () => void
}) {
  const {
    order, orderNumber, removeItem, updateQuantity, setDiscount,
    setCustomer, setTable, clearOrder,
  } = useCurrentOrder()
  const { isMobile } = useBreakpoint()
  const [showTable, setShowTable] = useState(false)

  return (
    <div className={cn(
      "flex flex-col h-full bg-white",
      !isMobile && "w-[380px] border-l shrink-0"
    )}>
      {/* Header: order # + table + clear */}
      <div className="px-4 py-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-base">
            Order <span className="text-brand-500">#{orderNumber}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTable(v => !v)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded border transition-colors cursor-pointer',
                order.table_number
                  ? 'bg-brand-50 text-brand-600 border-brand-200'
                  : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {order.table_number ? `Table ${order.table_number}` : 'Table #'}
            </button>
            <button
              onClick={clearOrder}
              className="text-xs text-neutral-500 hover:text-red-500 cursor-pointer font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table number input (toggle) */}
        {showTable && (
          <Input
            autoFocus
            placeholder="Enter table number"
            value={order.table_number}
            onChange={e => setTable(e.target.value)}
            onBlur={() => setShowTable(false)}
            className="h-9"
          />
        )}

        {/* Customer fields */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Customer name"
            value={order.customer_name}
            onChange={e => setCustomer(e.target.value, order.customer_phone)}
            className="h-9 text-sm"
          />
          <Input
            placeholder="Phone"
            value={order.customer_phone}
            onChange={e => setCustomer(order.customer_name, e.target.value)}
            className="h-9 text-sm"
            inputMode="tel"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm font-medium">No items yet</p>
            <p className="text-xs mt-1">Select items from the menu</p>
          </div>
        ) : (
          order.items.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    item.type === 'veg' ? "bg-veg" : "bg-nonveg"
                  )} />
                  <span className="text-sm font-medium truncate">{item.item_name}</span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  {item.variation} &middot; {formatCurrency(item.unit_price)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-sm font-semibold w-14 text-right">{formatCurrency(item.line_total)}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals + Actions */}
      <div className="border-t p-3 space-y-2 bg-white">
        {/* Discount row (only if applied) */}
        {order.discount && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Percent className="w-3 h-3" />
              {order.discount.label}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-green-600">-{formatCurrency(order.totals.discountAmount)}</span>
              <button
                onClick={() => setDiscount(null)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.totals.subtotal)}</span>
          </div>
          {order.totals.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(order.totals.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-500 text-[12px]">
            <span>CGST ({(CGST_RATE * 100).toFixed(1)}%)</span>
            <span>{formatCurrency(order.totals.cgstAmount)}</span>
          </div>
          <div className="flex justify-between text-neutral-500 text-[12px]">
            <span>SGST ({(SGST_RATE * 100).toFixed(1)}%)</span>
            <span>{formatCurrency(order.totals.sgstAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-1 border-t mt-1">
            <span>Total</span>
            <span className="text-brand-500">{formatCurrency(order.totals.total)}</span>
          </div>
        </div>

        {/* Action button rows */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="touch"
            onClick={onOpenDiscount}
            disabled={order.items.length === 0}
          >
            <Percent className="w-4 h-4" />
            Discount
          </Button>
          <Button
            size="touch"
            onClick={onPayment}
            disabled={order.items.length === 0}
          >
            Pay &amp; Complete
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            size="touch"
            onClick={onSave}
            disabled={order.items.length === 0}
            className="bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Save
          </Button>
          <Button
            variant="outline"
            size="touch"
            onClick={onPrintKOT}
            disabled={order.items.length === 0}
          >
            <Printer className="w-4 h-4" />
            KOT
          </Button>
          <Button
            variant="outline"
            size="touch"
            onClick={onHold}
            disabled={order.items.length === 0}
          >
            Hold
          </Button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────
// Discount Modal — percent / flat / coupon
// ──────────────────────────────────────
function DiscountModal({
  open,
  onClose,
  subtotal,
}: {
  open: boolean
  onClose: () => void
  subtotal: number
}) {
  const { setDiscount } = useCurrentOrder()
  const [mode, setMode] = useState<'percentage' | 'fixed' | 'coupon'>('percentage')
  const [value, setValue] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMode('percentage')
      setValue('')
      setCouponCode('')
      setError(null)
    }
  }, [open])

  const apply = () => {
    setError(null)

    if (mode === 'coupon') {
      const code = couponCode.trim().toUpperCase()
      if (!code) { setError('Enter a coupon code'); return }
      const coupon = demoCoupons.find(c => c.code === code && c.is_active)
      if (!coupon) { setError('Invalid or inactive coupon'); return }
      if (subtotal < coupon.min_order_value) {
        setError(`Minimum order ${formatCurrency(coupon.min_order_value)} required`); return
      }
      let amount = coupon.discount_type === 'percentage'
        ? Math.round(subtotal * (coupon.discount_value / 100))
        : coupon.discount_value
      if (coupon.max_discount && amount > coupon.max_discount) amount = coupon.max_discount
      setDiscount({ type: 'fixed', value: amount, label: `Coupon ${coupon.code}`, coupon_code: coupon.code })
      onClose()
      return
    }

    const num = parseFloat(value)
    if (!num || num <= 0) { setError('Enter a valid amount'); return }
    if (mode === 'percentage' && num > 100) { setError('Percentage cannot exceed 100'); return }
    if (mode === 'fixed' && num > subtotal) { setError('Discount cannot exceed subtotal'); return }

    setDiscount({
      type: mode,
      value: num,
      label: mode === 'percentage' ? `${num}% off` : `Flat ${formatCurrency(num)} off`,
    })
    onClose()
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Apply Discount</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {([
          ['percentage', Percent, 'Percent'],
          ['fixed', IndianRupee, 'Flat'],
          ['coupon', Tag, 'Coupon'],
        ] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={cn(
              'py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
              mode === key
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
            )}
          >
            <Icon className="w-4 h-4 inline mr-1" />
            {label}
          </button>
        ))}
      </div>

      {mode === 'coupon' ? (
        <div className="space-y-2">
          <label className="text-xs text-neutral-500">Coupon code</label>
          <Input
            autoFocus
            placeholder="e.g. NARU10"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
            className="uppercase tracking-wider"
            onKeyDown={e => e.key === 'Enter' && apply()}
          />
          <p className="text-[11px] text-neutral-400">Try: NARU10, DROOL20, FLAT50</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs text-neutral-500">
            {mode === 'percentage' ? 'Percent off (0–100)' : 'Flat amount off'}
          </label>
          <div className="relative">
            <Input
              autoFocus
              type="number"
              inputMode="decimal"
              placeholder={mode === 'percentage' ? '10' : '50'}
              value={value}
              onChange={e => setValue(e.target.value)}
              className="pl-8"
              onKeyDown={e => e.key === 'Enter' && apply()}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              {mode === 'percentage' ? '%' : '₹'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">Subtotal: {formatCurrency(subtotal)}</p>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" onClick={apply}>Apply</Button>
      </div>
    </ResponsiveDialog>
  )
}

// ──────────────────────────────────────
// Variation Modal — Half / Full
// ──────────────────────────────────────
function VariationModal({
  item,
  open,
  onClose,
  onSelect,
}: {
  item: MenuItem | null
  open: boolean
  onClose: () => void
  onSelect: (variation: Variation) => void
}) {
  if (!item) return null

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Choose Portion</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>
      <div className="flex items-center gap-2 mb-4">
        <span className={cn(
          "w-3 h-3 rounded-sm border-2",
          item.type === 'veg' ? "border-veg" : "border-nonveg"
        )}>
          <span className={cn(
            "block w-1.5 h-1.5 rounded-full m-auto mt-[1px]",
            item.type === 'veg' ? "bg-veg" : "bg-nonveg"
          )} />
        </span>
        <span className="font-medium">{item.name}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {item.price_half && (
          <Button
            variant="outline"
            size="xl"
            className="flex-col h-20"
            onClick={() => { onSelect('Half'); onClose() }}
          >
            <span className="text-base font-semibold">Half</span>
            <span className="text-sm text-neutral-500">{formatCurrency(item.price_half)}</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="xl"
          className={cn("flex-col h-20", !item.price_half && "col-span-2")}
          onClick={() => { onSelect('Full'); onClose() }}
        >
          <span className="text-base font-semibold">Full</span>
          <span className="text-sm text-neutral-500">{formatCurrency(item.price_full)}</span>
        </Button>
      </div>
    </ResponsiveDialog>
  )
}

// ──────────────────────────────────────
// Payment Modal — method picker + amount received + change
// ──────────────────────────────────────
function PaymentModal({
  open,
  onClose,
  onComplete,
}: {
  open: boolean
  onClose: () => void
  onComplete: (method: PaymentMethod, amountReceived: number) => void
}) {
  const { order } = useCurrentOrder()
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (open) {
      setMethod('cash')
      // For card / UPI, amount received always equals total
      setAmount('')
    }
  }, [open])

  const total = order.totals.total
  const received = method === 'cash' ? parseFloat(amount) || 0 : total
  const change = Math.max(0, received - total)
  const canComplete = method !== 'cash' || received >= total

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Payment</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      {/* Total Amount */}
      <div className="text-center mb-5">
        <div className="text-xs text-neutral-500 uppercase tracking-wide">Total Amount</div>
        <div className="text-4xl font-bold text-brand-500 mt-1">{formatCurrency(total)}</div>
      </div>

      {/* Payment Method */}
      <div className="mb-5">
        <div className="text-xs font-medium text-neutral-700 mb-2">Payment Method</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMethod('cash')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-colors cursor-pointer',
              method === 'cash'
                ? 'border-brand-500 bg-brand-50 text-brand-600'
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
            )}
          >
            <Banknote className="w-5 h-5" />
            <span className="text-sm font-medium">Cash</span>
          </button>
          <button
            onClick={() => setMethod('card')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-colors cursor-pointer',
              method === 'card'
                ? 'border-brand-500 bg-brand-50 text-brand-600'
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
            )}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-sm font-medium">Card</span>
          </button>
          <button
            onClick={() => setMethod('upi')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-colors cursor-pointer',
              method === 'upi'
                ? 'border-brand-500 bg-brand-50 text-brand-600'
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
            )}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-sm font-medium">UPI</span>
          </button>
        </div>
      </div>

      {/* Amount Received (cash only) */}
      {method === 'cash' && (
        <div className="mb-4">
          <div className="text-xs font-medium text-neutral-700 mb-2">Amount Received</div>
          <Input
            autoFocus
            type="number"
            inputMode="decimal"
            placeholder={String(Math.ceil(total))}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="h-12 text-lg font-semibold"
          />
          <div className="flex gap-2 mt-2">
            {[total, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500]
              .filter((v, i, a) => v >= total && a.indexOf(v) === i)
              .slice(0, 4)
              .map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  className="flex-1 py-1.5 text-xs font-medium rounded border border-neutral-200 hover:bg-neutral-50 cursor-pointer"
                >
                  ₹{v}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Change row */}
      <div className="flex items-center justify-between py-3 border-t border-b mb-5">
        <span className="text-sm font-medium text-neutral-600">Change:</span>
        <span className={cn(
          'text-base font-bold tabular-nums',
          change > 0 ? 'text-green-600' : 'text-neutral-400'
        )}>
          {formatCurrency(change)}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!canComplete}
          onClick={() => { onComplete(method, received); onClose() }}
        >
          Complete
        </Button>
      </div>
    </ResponsiveDialog>
  )
}

// ──────────────────────────────────────
// Print Ticket — KOT (kitchen) and Receipt (customer)
// ──────────────────────────────────────
interface PrintTicketData {
  mode: 'kot' | 'receipt'
  orderNumber: string
  orderType: OrderType
  tableNumber?: string
  customerName?: string
  items: CartItem[]
  totals: OrderTotals
  discount: CartDiscount | null
  paymentMethod?: PaymentMethod
  printedAt: Date
}

function PrintTicket({ data }: { data: PrintTicketData | null }) {
  if (!data) return null
  const isReceipt = data.mode === 'receipt'
  const dt = data.printedAt

  return (
    <div className="kot-print" style={{ fontFamily: 'monospace', color: '#000', padding: '8px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{RESTAURANT_NAME}</div>
        {isReceipt && (
          <>
            <div style={{ fontSize: '10px' }}>{RESTAURANT_ADDRESS}</div>
            <div style={{ fontSize: '10px' }}>{RESTAURANT_PHONE}</div>
            <div style={{ fontSize: '10px' }}>GSTIN: {RESTAURANT_GSTIN}</div>
          </>
        )}
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '2px 0' }}>
          {isReceipt ? 'TAX INVOICE' : '*** KOT ***'}
        </div>
      </div>

      <div style={{ fontSize: '11px', marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Order: #{data.orderNumber}</span>
          <span style={{ textTransform: 'capitalize' }}>{data.orderType.replace('-', ' ')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{dt.toLocaleDateString('en-IN')}</span>
          <span>{dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {data.tableNumber && <div>Table: {data.tableNumber}</div>}
        {data.customerName && <div>Customer: {data.customerName}</div>}
      </div>

      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0', marginBottom: '6px' }}>
        {data.items.map((item, idx) => (
          <div key={idx} style={{ fontSize: '11px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>
                {item.quantity} x {item.item_name}
                {item.variation === 'Half' ? ' (H)' : ''}
              </span>
              {isReceipt && <span>{formatCurrency(item.line_total)}</span>}
            </div>
            {isReceipt && (
              <div style={{ fontSize: '9px', paddingLeft: '8px', color: '#666' }}>
                @ {formatCurrency(item.unit_price)}
              </div>
            )}
          </div>
        ))}
      </div>

      {isReceipt && (
        <div style={{ fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(data.totals.subtotal)}</span>
          </div>
          {data.totals.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount{data.discount?.label ? ` (${data.discount.label})` : ''}</span>
              <span>-{formatCurrency(data.totals.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Taxable</span>
            <span>{formatCurrency(data.totals.taxableAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>CGST @ {(CGST_RATE * 100).toFixed(1)}%</span>
            <span>{formatCurrency(data.totals.cgstAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>SGST @ {(SGST_RATE * 100).toFixed(1)}%</span>
            <span>{formatCurrency(data.totals.sgstAmount)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '13px',
            borderTop: '1px dashed #000',
            marginTop: '4px',
            paddingTop: '4px',
          }}>
            <span>TOTAL</span>
            <span>{formatCurrency(data.totals.total)}</span>
          </div>
          {data.paymentMethod && (
            <div style={{ marginTop: '4px', textAlign: 'center', textTransform: 'uppercase' }}>
              Paid by {data.paymentMethod}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px' }}>
            Thank you, visit again!
          </div>
        </div>
      )}

      {!isReceipt && (
        <div style={{ fontSize: '11px', textAlign: 'center', marginTop: '4px' }}>
          Total items: {data.totals.itemCount}
        </div>
      )}
    </div>
  )
}

function buildTicket(
  mode: 'kot' | 'receipt',
  order: ReturnType<typeof useCurrentOrder>['order'],
  orderNumber: string,
  paymentMethod?: PaymentMethod,
): PrintTicketData {
  return {
    mode,
    orderNumber,
    orderType: order.order_type,
    tableNumber: order.table_number || undefined,
    customerName: order.customer_name || undefined,
    items: order.items,
    totals: order.totals,
    discount: order.discount,
    paymentMethod,
    printedAt: new Date(),
  }
}

// ──────────────────────────────────────
// Mobile POS Flow (3-step)
// ──────────────────────────────────────
function MobilePOSFlow() {
  const [step, setStep] = useState<'menu' | 'cart' | 'payment'>('menu')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [variationItem, setVariationItem] = useState<MenuItem | null>(null)
  const [showDiscount, setShowDiscount] = useState(false)
  const [printData, setPrintData] = useState<PrintTicketData | null>(null)
  const { order, orderNumber, addItem, clearOrder, bumpOrderNumber } = useCurrentOrder()

  const triggerPrint = (data: PrintTicketData) => {
    setPrintData(data)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrintData(null), 500)
    }, 50)
  }

  const handlePrintKOT = () => {
    if (order.items.length === 0) return
    triggerPrint(buildTicket('kot', order, orderNumber))
  }

  const filteredItems = useMemo(() =>
    selectedCategory === 'all'
      ? demoMenuItems.filter(i => i.is_available)
      : demoMenuItems.filter(i => i.category_id === selectedCategory && i.is_available),
    [selectedCategory]
  )

  const handleAddItem = (item: MenuItem) => {
    hapticLight()
    if (item.price_half) setVariationItem(item)
    else addItem(item, 'Full')
  }

  const handlePaymentComplete = (method: PaymentMethod) => {
    hapticMedium()
    triggerPrint(buildTicket('receipt', order, orderNumber, method))
    clearOrder()
    bumpOrderNumber()
    setStep('menu')
  }

  const handleSave = () => {
    // TODO: persist as 'saved' to Supabase
    clearOrder()
    bumpOrderNumber()
    setStep('menu')
  }

  const handleHold = () => {
    // TODO: persist as 'held' to Supabase
    clearOrder()
    bumpOrderNumber()
    setStep('menu')
  }

  if (step === 'cart') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <button onClick={() => setStep('menu')} className="text-sm text-brand-500 cursor-pointer">&larr; Menu</button>
          <h2 className="font-semibold">Your Order</h2>
        </div>
        <OrderPanel
          onPayment={() => setStep('payment')}
          onOpenDiscount={() => setShowDiscount(true)}
          onPrintKOT={handlePrintKOT}
          onSave={handleSave}
          onHold={handleHold}
        />
        <DiscountModal open={showDiscount} onClose={() => setShowDiscount(false)} subtotal={order.totals.subtotal} />
        <PrintTicket data={printData} />
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <button onClick={() => setStep('cart')} className="text-sm text-brand-500 cursor-pointer">&larr; Cart</button>
          <h2 className="font-semibold">Payment</h2>
        </div>
        <PaymentModal open onClose={() => setStep('cart')} onComplete={handlePaymentComplete} />
        <PrintTicket data={printData} />
      </div>
    )
  }

  // Step: Menu
  return (
    <div className="h-full flex flex-col">
      <div className="pt-3 border-b">
        <CategorySelector
          categories={demoCategories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
          layout="chips"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} onAdd={handleAddItem} />
          ))}
        </div>
      </div>
      {order.items.length > 0 && (
        <div className="border-t p-3 bg-white">
          <Button className="w-full" size="lg" onClick={() => setStep('cart')}>
            <ShoppingCart className="w-4 h-4" />
            View Cart ({order.totals.itemCount} items) &middot; {formatCurrency(order.totals.total)}
          </Button>
        </div>
      )}
      <VariationModal
        item={variationItem}
        open={!!variationItem}
        onClose={() => setVariationItem(null)}
        onSelect={(variation) => { if (variationItem) addItem(variationItem, variation) }}
      />
      <PrintTicket data={printData} />
    </div>
  )
}

// ──────────────────────────────────────
// Desktop / Tablet POS Layout
// ──────────────────────────────────────
function DesktopPOSLayout() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [variationItem, setVariationItem] = useState<MenuItem | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showOrderPanel, setShowOrderPanel] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [printData, setPrintData] = useState<PrintTicketData | null>(null)
  const { addItem, order, orderNumber, clearOrder, bumpOrderNumber } = useCurrentOrder()
  const { isTablet } = useBreakpoint()

  const triggerPrint = (data: PrintTicketData) => {
    setPrintData(data)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrintData(null), 500)
    }, 50)
  }

  const handlePrintKOT = () => {
    if (order.items.length === 0) return
    triggerPrint(buildTicket('kot', order, orderNumber))
  }

  const filteredItems = useMemo(() => {
    let list = demoMenuItems.filter(i => i.is_available)
    if (selectedCategory !== 'all') {
      list = list.filter(i => i.category_id === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q))
    }
    return list
  }, [selectedCategory, searchQuery])

  const handleAddItem = (item: MenuItem) => {
    hapticLight()
    if (item.price_half) setVariationItem(item)
    else addItem(item, 'Full')
  }

  const handlePaymentComplete = (method: PaymentMethod) => {
    hapticMedium()
    triggerPrint(buildTicket('receipt', order, orderNumber, method))
    clearOrder()
    bumpOrderNumber()
    setShowPayment(false)
    setShowOrderPanel(false)
  }

  const handleSave = () => {
    clearOrder()
    bumpOrderNumber()
  }
  const handleHold = () => {
    clearOrder()
    bumpOrderNumber()
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      <POSHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex-1 flex relative overflow-hidden">
        {/* Category Sidebar */}
        <CategorySelector
          categories={demoCategories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
          layout="sidebar"
        />

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className={cn(
            "grid gap-3",
            isTablet ? "grid-cols-3" : "grid-cols-4"
          )}>
            {filteredItems.map(item => (
              <MenuItemCard key={item.id} item={item} onAdd={handleAddItem} />
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <Search className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No items match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Order Panel */}
        {isTablet ? (
          <>
            {!showOrderPanel && (
              <button
                onClick={() => setShowOrderPanel(true)}
                className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-brand-600 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-6 h-6" />
                {order.totals.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {order.totals.itemCount}
                  </span>
                )}
              </button>
            )}
            {showOrderPanel && (
              <>
                <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowOrderPanel(false)} />
                <div className="fixed right-0 top-0 bottom-0 z-50 w-[380px] shadow-xl">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                      <h2 className="font-semibold">Order</h2>
                      <button onClick={() => setShowOrderPanel(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <OrderPanel
                      onPayment={() => setShowPayment(true)}
                      onOpenDiscount={() => setShowDiscount(true)}
                      onPrintKOT={handlePrintKOT}
                      onSave={handleSave}
                      onHold={handleHold}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <OrderPanel
            onPayment={() => setShowPayment(true)}
            onOpenDiscount={() => setShowDiscount(true)}
            onPrintKOT={handlePrintKOT}
            onSave={handleSave}
            onHold={handleHold}
          />
        )}
      </div>

      {/* Modals */}
      <VariationModal
        item={variationItem}
        open={!!variationItem}
        onClose={() => setVariationItem(null)}
        onSelect={(variation) => { if (variationItem) addItem(variationItem, variation) }}
      />
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={handlePaymentComplete}
      />
      <DiscountModal
        open={showDiscount}
        onClose={() => setShowDiscount(false)}
        subtotal={order.totals.subtotal}
      />
      <PrintTicket data={printData} />
    </div>
  )
}

// ──────────────────────────────────────
// Main POS Page (responsive switcher)
// ──────────────────────────────────────
export function POSPage() {
  const { isMobile } = useBreakpoint()
  if (isMobile) return <MobilePOSFlow />
  return <DesktopPOSLayout />
}
