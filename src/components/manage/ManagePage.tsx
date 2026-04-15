import { useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { demoCategories, demoMenuItems, demoCoupons } from '@/lib/demo-data'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogFooter } from '@/components/ui/responsive-dialog'
import { Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import type { MenuItem, Category, Coupon } from '@/types'

// ──────────────────────────────────────
// Menu Items Tab
// ──────────────────────────────────────
function MenuItemsTab() {
  const { isMobile } = useBreakpoint()
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [items] = useState(demoMenuItems)

  const filtered = searchQuery
    ? items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items

  const getCategoryName = (catId: string) =>
    demoCategories.find(c => c.id === catId)?.name || 'Unknown'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="touch">
          <Plus className="w-4 h-4" />
          {!isMobile && "Add Item"}
        </Button>
      </div>

      {isMobile ? (
        // Mobile: Card Layout
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-3 h-3 rounded-sm border-2",
                      item.type === 'veg' ? "border-veg" : "border-nonveg"
                    )}>
                      <span className={cn(
                        "block w-1.5 h-1.5 rounded-full m-auto mt-[1px]",
                        item.type === 'veg' ? "bg-veg" : "bg-nonveg"
                      )} />
                    </span>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{getCategoryName(item.category_id)}</p>
                  <div className="text-sm mt-1">
                    {item.price_half && <span className="text-neutral-500">H: {formatCurrency(item.price_half)} · </span>}
                    <span className="font-semibold">{formatCurrency(item.price_full)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={item.is_available ? "success" : "secondary"} className="text-[10px]">
                    {item.is_available ? 'Available' : 'Hidden'}
                  </Badge>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-brand-500 hover:bg-brand-50 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop/Tablet: Table Layout
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Item</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Category</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">Half</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">Full</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500">Status</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
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
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{getCategoryName(item.category_id)}</td>
                  <td className="px-4 py-3 text-right text-neutral-500">
                    {item.price_half ? formatCurrency(item.price_half) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.price_full)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.is_available ? "success" : "secondary"} className="text-[10px]">
                      {item.is_available ? 'Available' : 'Hidden'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-brand-500 hover:bg-brand-50 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-neutral-400 text-center">{filtered.length} items</p>
    </div>
  )
}

// ──────────────────────────────────────
// Categories Tab
// ──────────────────────────────────────
function CategoriesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-500">{demoCategories.length} categories</h3>
        <Button size="sm">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {demoCategories.map(cat => {
          const itemCount = demoMenuItems.filter(i => i.category_id === cat.id).length
          return (
            <div key={cat.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{cat.name}</span>
                <p className="text-xs text-neutral-500">{itemCount} items</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-brand-500 hover:bg-brand-50 cursor-pointer">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ──────────────────────────────────────
// Coupons Tab
// ──────────────────────────────────────
function CouponsTab() {
  const { isMobile } = useBreakpoint()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-500">{demoCoupons.length} coupons</h3>
        <Button size="sm">
          <Plus className="w-4 h-4" />
          Add Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {demoCoupons.map(coupon => (
          <div key={coupon.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-brand-600">{coupon.code}</span>
              <Badge variant={coupon.is_active ? "success" : "secondary"} className="text-[10px]">
                {coupon.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-neutral-600">
              {coupon.discount_type === 'percentage'
                ? `${coupon.discount_value}% off`
                : `${formatCurrency(coupon.discount_value)} off`}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Min order: {formatCurrency(coupon.min_order_value)}
              {coupon.max_discount && ` · Max: ${formatCurrency(coupon.max_discount)}`}
            </p>
            <div className="flex items-center justify-end gap-1 mt-3">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-brand-500 hover:bg-brand-50 cursor-pointer">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────
// Main Manage Page
// ──────────────────────────────────────
export function ManagePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b bg-white">
        <h1 className="text-lg font-bold">Manage</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="items">
          <TabsList className="w-full sm:w-auto mb-4">
            <TabsTrigger value="items" className="flex-1 sm:flex-none">Menu Items</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1 sm:flex-none">Categories</TabsTrigger>
            <TabsTrigger value="coupons" className="flex-1 sm:flex-none">Coupons</TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <MenuItemsTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="coupons">
            <CouponsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
