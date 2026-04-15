import { useState, useMemo } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useCurrentOrder } from '@/contexts/CurrentOrderContext'
import { demoCategories, demoMenuItems } from '@/lib/demo-data'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Minus, Plus, Trash2, X, Percent, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogFooter } from '@/components/ui/responsive-dialog'
import type { MenuItem, Variation } from '@/types'

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
function OrderPanel({ onPayment }: { onPayment: () => void }) {
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
            <div className="flex justify-between">
              <span className="text-neutral-500">Tax (5%)</span>
              <span>{formatCurrency(order.totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(order.totals.total)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="touch"
              className="flex-1"
              onClick={() => {/* TODO: discount modal */}}
            >
              <Percent className="w-4 h-4" />
              Discount
            </Button>
            <Button
              size="touch"
              className="flex-1"
              onClick={onPayment}
            >
              Pay {formatCurrency(order.totals.total)}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
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
  const { order, addItem, clearOrder } = useCurrentOrder()

  const filteredItems = useMemo(() =>
    selectedCategory === 'all'
      ? demoMenuItems.filter(i => i.is_available)
      : demoMenuItems.filter(i => i.category_id === selectedCategory && i.is_available),
    [selectedCategory]
  )

  const handleAddItem = (item: MenuItem) => {
    if (item.price_half) {
      setVariationItem(item)
    } else {
      addItem(item, 'Full')
    }
  }

  const handlePaymentComplete = (_method: 'cash' | 'card' | 'upi') => {
    // TODO: save order to DB
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
        <OrderPanel onPayment={() => setStep('payment')} />
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
  const { addItem, order, clearOrder } = useCurrentOrder()
  const { isTablet } = useBreakpoint()

  const filteredItems = useMemo(() =>
    selectedCategory === 'all'
      ? demoMenuItems.filter(i => i.is_available)
      : demoMenuItems.filter(i => i.category_id === selectedCategory && i.is_available),
    [selectedCategory]
  )

  const handleAddItem = (item: MenuItem) => {
    if (item.price_half) {
      setVariationItem(item)
    } else {
      addItem(item, 'Full')
    }
  }

  const handlePaymentComplete = (_method: 'cash' | 'card' | 'upi') => {
    // TODO: save order to DB
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
                  <OrderPanel onPayment={() => setShowPayment(true)} />
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <OrderPanel onPayment={() => setShowPayment(true)} />
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
