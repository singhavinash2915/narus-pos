import { useState, useMemo, useEffect } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useCurrentOrder } from '@/contexts/CurrentOrderContext'
import type { OrderTotals } from '@/contexts/CurrentOrderContext'
import { demoCategories, demoMenuItems, demoCoupons } from '@/lib/demo-data'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Minus, Plus, Trash2, X, Percent, CreditCard, Banknote, Smartphone, Printer, Receipt, Tag, IndianRupee } from 'lucide-react'
import { ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog'
import { hapticLight, hapticMedium } from '@/lib/native'
import { RESTAURANT_NAME, RESTAURANT_GSTIN, RESTAURANT_ADDRESS, RESTAURANT_PHONE, CGST_RATE, SGST_RATE } from '@/lib/constants'
import type { MenuItem, Variation, CartItem, CartDiscount, OrderType, PaymentMethod } from '@/types'

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
    <div className={cn(
      "bg-neutral-50 border-r overflow-y-auto shrink-0",
      layout === 'sidebar' ? "w-36 lg:w-40" : "w-[120px]"
    )}>
      <button
        onClick={() => onSelect('all')}
        className={cn(
          "w-full text-left px-3 py-3 text-sm font-medium border-b transition-colors cursor-pointer min-h-[48px]",
          selectedId === 'all'
            ? "bg-brand-50 text-brand-600 border-l-3 border-l-brand-500"
            : "text-neutral-600 hover:bg-neutral-100"
        )}
      >
        All Items
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "w-full text-left px-3 py-3 text-sm font-medium border-b transition-colors cursor-pointer min-h-[48px]",
            selectedId === cat.id
              ? "bg-brand-50 text-brand-600 border-l-3 border-l-brand-500"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

// ──────────────────────────────────────
// Menu Item Card
// ──────────────────────────────────────
function MenuItemCard({
  item,
  onAdd,
}: {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}) {
  return (
    <button
      onClick={() => onAdd(item)}
      disabled={!item.is_available}
      className={cn(
        "bg-white rounded-xl border p-3 text-left transition-all cursor-pointer hover:shadow-md hover:border-brand-200 active:scale-[0.98] min-h-[80px] flex flex-col justify-between",
        !item.is_available && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-sm font-medium text-neutral-800 leading-tight">{item.name}</span>
        <span className={cn(
          "w-3 h-3 rounded-sm border-2 shrink-0 mt-0.5",
          item.type === 'veg' ? "border-veg" : "border-nonveg"
        )}>
          <span className={cn(
            "block w-1.5 h-1.5 rounded-full m-auto mt-[1px]",
            item.type === 'veg' ? "bg-veg" : "bg-nonveg"
          )} />
        </span>
      </div>
      <div className="flex items-end justify-between mt-2">
        <div className="text-xs text-neutral-500">
          {item.price_half && <span>H: {formatCurrency(item.price_half)} </span>}
          <span className="font-semibold text-neutral-700">{formatCurrency(item.price_full)}</span>
        </div>
        {!item.is_available && (
          <Badge variant="secondary" className="text-[10px]">Unavailable</Badge>
        )}
      </div>
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
}: {
  onPayment: () => void
  onOpenDiscount: () => void
  onPrintKOT: () => void
}) {
  const { order, removeItem, updateQuantity, setOrderType, setDiscount } = useCurrentOrder()
  const { isMobile } = useBreakpoint()

  return (
    <div className={cn(
      "flex flex-col h-full bg-white",
      !isMobile && "w-[380px] border-l shrink-0"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex gap-1">
          {(['dine-in', 'delivery', 'pickup'] as const).map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={cn(
                "flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer capitalize",
                order.order_type === type
                  ? "bg-brand-500 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {type.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No items added</p>
            <p className="text-xs mt-1">Tap menu items to add</p>
          </div>
        ) : (
          order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    item.type === 'veg' ? "bg-veg" : "bg-nonveg"
                  )} />
                  <span className="text-sm font-medium truncate">{item.item_name}</span>
                </div>
                <span className="text-xs text-neutral-500">{item.variation} &middot; {formatCurrency(item.unit_price)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-sm font-medium w-16 text-right">{formatCurrency(item.line_total)}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals + Actions */}
      {order.items.length > 0 && (
        <div className="border-t p-4 space-y-3">
          {/* Discount row */}
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
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span>{formatCurrency(order.totals.subtotal)}</span>
            </div>
            {order.totals.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500">
              <span>CGST ({(CGST_RATE * 100).toFixed(1)}%)</span>
              <span>{formatCurrency(order.totals.cgstAmount)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>SGST ({(SGST_RATE * 100).toFixed(1)}%)</span>
              <span>{formatCurrency(order.totals.sgstAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(order.totals.total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="touch"
              onClick={onOpenDiscount}
            >
              <Percent className="w-4 h-4" />
              Discount
            </Button>
            <Button
              variant="outline"
              size="touch"
              onClick={onPrintKOT}
            >
              <Printer className="w-4 h-4" />
              Print KOT
            </Button>
          </div>
          <Button
            size="touch"
            className="w-full"
            onClick={onPayment}
          >
            <Receipt className="w-4 h-4" />
            Pay {formatCurrency(order.totals.total)}
          </Button>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// Discount Modal
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

  // Reset state every time the modal opens
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
      if (!code) {
        setError('Enter a coupon code')
        return
      }
      const coupon = demoCoupons.find(c => c.code === code && c.is_active)
      if (!coupon) {
        setError('Invalid or inactive coupon')
        return
      }
      if (subtotal < coupon.min_order_value) {
        setError(`Minimum order ${formatCurrency(coupon.min_order_value)} required`)
        return
      }
      let amount = coupon.discount_type === 'percentage'
        ? Math.round(subtotal * (coupon.discount_value / 100))
        : coupon.discount_value
      if (coupon.max_discount && amount > coupon.max_discount) {
        amount = coupon.max_discount
      }
      const discount: CartDiscount = {
        type: 'fixed',
        value: amount,
        label: `Coupon ${coupon.code}`,
        coupon_code: coupon.code,
      }
      setDiscount(discount)
      onClose()
      return
    }

    const num = parseFloat(value)
    if (!num || num <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (mode === 'percentage' && num > 100) {
      setError('Percentage cannot exceed 100')
      return
    }
    if (mode === 'fixed' && num > subtotal) {
      setError('Discount cannot exceed subtotal')
      return
    }

    const discount: CartDiscount = {
      type: mode,
      value: num,
      label: mode === 'percentage' ? `${num}% off` : `Flat ${formatCurrency(num)} off`,
    }
    setDiscount(discount)
    onClose()
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Apply Discount</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      {/* Mode tabs */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setMode('percentage')}
          className={cn(
            'py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
            mode === 'percentage' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-neutral-600 hover:bg-neutral-50'
          )}
        >
          <Percent className="w-4 h-4 inline mr-1" />
          Percent
        </button>
        <button
          onClick={() => setMode('fixed')}
          className={cn(
            'py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
            mode === 'fixed' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-neutral-600 hover:bg-neutral-50'
          )}
        >
          <IndianRupee className="w-4 h-4 inline mr-1" />
          Flat
        </button>
        <button
          onClick={() => setMode('coupon')}
          className={cn(
            'py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer',
            mode === 'coupon' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-neutral-600 hover:bg-neutral-50'
          )}
        >
          <Tag className="w-4 h-4 inline mr-1" />
          Coupon
        </button>
      </div>

      {/* Input area */}
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
          <p className="text-[11px] text-neutral-400">
            Subtotal: {formatCurrency(subtotal)}
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" onClick={apply}>Apply</Button>
      </div>
    </ResponsiveDialog>
  )
}

// ──────────────────────────────────────
// Print Ticket — KOT (kitchen) and Receipt (customer)
// Renders into a hidden div that becomes visible only when window.print() fires.
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
          <span>Order: {data.orderNumber}</span>
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

// Build a PrintTicketData from current order + chosen mode
function buildTicket(
  mode: 'kot' | 'receipt',
  order: ReturnType<typeof useCurrentOrder>['order'],
  paymentMethod?: PaymentMethod,
): PrintTicketData {
  // Short tag: K-HHMMSS for KOT, R-HHMMSS for receipt
  const now = new Date()
  const stamp = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  const prefix = mode === 'kot' ? 'K' : 'R'
  return {
    mode,
    orderNumber: `${prefix}-${stamp}`,
    orderType: order.order_type,
    tableNumber: order.table_number || undefined,
    customerName: order.customer_name || undefined,
    items: order.items,
    totals: order.totals,
    discount: order.discount,
    paymentMethod,
    printedAt: now,
  }
}

// ──────────────────────────────────────
// Variation Modal
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
// Payment Modal
// ──────────────────────────────────────
function PaymentModal({
  open,
  onClose,
  onComplete,
}: {
  open: boolean
  onClose: () => void
  onComplete: (method: 'cash' | 'card' | 'upi') => void
}) {
  const { order } = useCurrentOrder()

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Payment</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-brand-600">{formatCurrency(order.totals.total)}</p>
        <p className="text-sm text-neutral-500 mt-1">{order.totals.itemCount} items</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          size="xl"
          className="flex-col h-20"
          onClick={() => { onComplete('cash'); onClose() }}
        >
          <Banknote className="w-6 h-6 text-green-600" />
          <span className="text-sm mt-1">Cash</span>
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="flex-col h-20"
          onClick={() => { onComplete('card'); onClose() }}
        >
          <CreditCard className="w-6 h-6 text-blue-600" />
          <span className="text-sm mt-1">Card</span>
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="flex-col h-20"
          onClick={() => { onComplete('upi'); onClose() }}
        >
          <Smartphone className="w-6 h-6 text-purple-600" />
          <span className="text-sm mt-1">UPI</span>
        </Button>
      </div>
    </ResponsiveDialog>
  )
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
  const { order, addItem, clearOrder } = useCurrentOrder()

  const triggerPrint = (data: PrintTicketData) => {
    setPrintData(data)
    // Wait one tick for React to render the print div, then fire the print dialog
    setTimeout(() => {
      window.print()
      // Clear after print dialog closes
      setTimeout(() => setPrintData(null), 500)
    }, 50)
  }

  const handlePrintKOT = () => {
    if (order.items.length === 0) return
    triggerPrint(buildTicket('kot', order))
  }

  const filteredItems = useMemo(() =>
    selectedCategory === 'all'
      ? demoMenuItems.filter(i => i.is_available)
      : demoMenuItems.filter(i => i.category_id === selectedCategory && i.is_available),
    [selectedCategory]
  )

  const handleAddItem = (item: MenuItem) => {
    hapticLight()
    if (item.price_half) {
      setVariationItem(item)
    } else {
      addItem(item, 'Full')
    }
  }

  const handlePaymentComplete = (method: 'cash' | 'card' | 'upi') => {
    hapticMedium()
    // Print receipt with the captured order before clearing
    triggerPrint(buildTicket('receipt', order, method))
    clearOrder()
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

  if (step === 'payment') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <button onClick={() => setStep('cart')} className="text-sm text-brand-500 cursor-pointer">&larr; Cart</button>
          <h2 className="font-semibold">Payment</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-brand-600">{formatCurrency(order.totals.total)}</p>
              <p className="text-sm text-neutral-500 mt-1">{order.totals.itemCount} items</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" size="xl" className="flex-col h-20" onClick={() => handlePaymentComplete('cash')}>
                <Banknote className="w-6 h-6 text-green-600" />
                <span className="text-sm mt-1">Cash</span>
              </Button>
              <Button variant="outline" size="xl" className="flex-col h-20" onClick={() => handlePaymentComplete('card')}>
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span className="text-sm mt-1">Card</span>
              </Button>
              <Button variant="outline" size="xl" className="flex-col h-20" onClick={() => handlePaymentComplete('upi')}>
                <Smartphone className="w-6 h-6 text-purple-600" />
                <span className="text-sm mt-1">UPI</span>
              </Button>
            </div>
          </div>
        </div>
        <PrintTicket data={printData} />
      </div>
    )
  }

  // Step: Menu
  return (
    <div className="h-full flex flex-col">
      {/* Category Chips */}
      <div className="pt-3 border-b">
        <CategorySelector
          categories={demoCategories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
          layout="chips"
        />
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} onAdd={handleAddItem} />
          ))}
        </div>
      </div>

      {/* View Cart Bar */}
      {order.items.length > 0 && (
        <div className="border-t p-3 bg-white">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setStep('cart')}
          >
            <ShoppingCart className="w-4 h-4" />
            View Cart ({order.totals.itemCount} items) &middot; {formatCurrency(order.totals.total)}
          </Button>
        </div>
      )}

      {/* Variation Modal */}
      <VariationModal
        item={variationItem}
        open={!!variationItem}
        onClose={() => setVariationItem(null)}
        onSelect={(variation) => {
          if (variationItem) addItem(variationItem, variation)
        }}
      />

      {/* Print ticket (shown only on print) */}
      <PrintTicket data={printData} />
    </div>
  )
}

// ──────────────────────────────────────
// Desktop/Tablet POS Layout
// ──────────────────────────────────────
function DesktopPOSLayout() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [variationItem, setVariationItem] = useState<MenuItem | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showOrderPanel, setShowOrderPanel] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [printData, setPrintData] = useState<PrintTicketData | null>(null)
  const { addItem, order, clearOrder } = useCurrentOrder()
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
    triggerPrint(buildTicket('kot', order))
  }

  const filteredItems = useMemo(() =>
    selectedCategory === 'all'
      ? demoMenuItems.filter(i => i.is_available)
      : demoMenuItems.filter(i => i.category_id === selectedCategory && i.is_available),
    [selectedCategory]
  )

  const handleAddItem = (item: MenuItem) => {
    hapticLight()
    if (item.price_half) {
      setVariationItem(item)
    } else {
      addItem(item, 'Full')
    }
  }

  const handlePaymentComplete = (method: 'cash' | 'card' | 'upi') => {
    hapticMedium()
    triggerPrint(buildTicket('receipt', order, method))
    clearOrder()
    setShowPayment(false)
    setShowOrderPanel(false)
  }

  return (
    <div className="h-full flex relative">
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
      </div>

      {/* Order Panel: always visible on desktop, slide-over on tablet */}
      {isTablet ? (
        <>
          {/* FAB */}
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

          {/* Slide-over panel */}
          {showOrderPanel && (
            <>
              <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowOrderPanel(false)} />
              <div className="fixed right-0 top-0 bottom-0 z-50 w-[360px] shadow-xl">
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
        />
      )}

      {/* Modals */}
      <VariationModal
        item={variationItem}
        open={!!variationItem}
        onClose={() => setVariationItem(null)}
        onSelect={(variation) => {
          if (variationItem) addItem(variationItem, variation)
        }}
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

  if (isMobile) {
    return <MobilePOSFlow />
  }

  return <DesktopPOSLayout />
}
