import { useState, useCallback } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useMenuData } from '@/contexts/MenuDataContext'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogFooter } from '@/components/ui/responsive-dialog'
import { Plus, Edit2, Trash2, Search, X, AlertTriangle } from 'lucide-react'
import type { MenuItem, Category, Coupon, ItemType, DiscountType } from '@/types'

// ──────────────────────────────────────
// Confirm Delete Modal
// ──────────────────────────────────────
function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>
      <div className="flex items-start gap-3 py-2">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-sm text-neutral-600">{message}</p>
      </div>
      <ResponsiveDialogFooter>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm}>Delete</Button>
        </div>
      </ResponsiveDialogFooter>
    </ResponsiveDialog>
  )
}

// ──────────────────────────────────────
// Menu Item Form Modal
// ──────────────────────────────────────
interface MenuItemFormData {
  name: string
  category_id: string
  type: ItemType
  price_half: string // string for input, parsed on save
  price_full: string
  is_available: boolean
}

const emptyItemForm: MenuItemFormData = {
  name: '',
  category_id: '',
  type: 'veg',
  price_half: '',
  price_full: '',
  is_available: true,
}

function MenuItemFormModal({
  open,
  onClose,
  editingItem,
  categories,
  onSave,
}: {
  open: boolean
  onClose: () => void
  editingItem: MenuItem | null
  categories: Category[]
  onSave: (data: MenuItemFormData) => void
}) {
  const [form, setForm] = useState<MenuItemFormData>(() => {
    if (editingItem) {
      return {
        name: editingItem.name,
        category_id: editingItem.category_id,
        type: editingItem.type,
        price_half: editingItem.price_half != null ? String(editingItem.price_half) : '',
        price_full: String(editingItem.price_full),
        is_available: editingItem.is_available,
      }
    }
    return { ...emptyItemForm, category_id: categories[0]?.id || '' }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.category_id) e.category_id = 'Category is required'
    if (!form.price_full || Number(form.price_full) <= 0) e.price_full = 'Full price is required'
    if (form.price_half && Number(form.price_half) <= 0) e.price_half = 'Invalid half price'
    if (form.price_half && Number(form.price_half) >= Number(form.price_full)) e.price_half = 'Half price must be less than full'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSave(form)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="space-y-4 py-2">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-neutral-500 mb-1 block">Item Name *</label>
          <Input
            placeholder="e.g. Chicken Biryani"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-neutral-500 mb-1 block">Category *</label>
          <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
            <option value="" disabled>Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-medium text-neutral-500 mb-1 block">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: 'veg' }))}
              className={cn(
                "flex-1 h-10 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer",
                form.type === 'veg'
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
              )}
            >
              Veg
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: 'non-veg' }))}
              className={cn(
                "flex-1 h-10 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer",
                form.type === 'non-veg'
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
              )}
            >
              Non-Veg
            </button>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1 block">Half Price</label>
            <Input
              type="number"
              placeholder="Optional"
              value={form.price_half}
              onChange={e => setForm(f => ({ ...f, price_half: e.target.value }))}
            />
            {errors.price_half && <p className="text-xs text-red-500 mt-1">{errors.price_half}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1 block">Full Price *</label>
            <Input
              type="number"
              placeholder="e.g. 320"
              value={form.price_full}
              onChange={e => setForm(f => ({ ...f, price_full: e.target.value }))}
            />
            {errors.price_full && <p className="text-xs text-red-500 mt-1">{errors.price_full}</p>}
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700">Available</label>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative cursor-pointer",
              form.is_available ? "bg-green-500" : "bg-neutral-300"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform",
              form.is_available ? "translate-x-5" : "translate-x-0.5"
            )} />
          </button>
        </div>
      </div>

      <ResponsiveDialogFooter>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {editingItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </ResponsiveDialogFooter>
    </ResponsiveDialog>
  )
}

// ──────────────────────────────────────
// Category Form Modal
// ──────────────────────────────────────
function CategoryFormModal({
  open,
  onClose,
  editingCategory,
  onSave,
  nextSortOrder,
}: {
  open: boolean
  onClose: () => void
  editingCategory: Category | null
  onSave: (name: string, sortOrder: number) => void
  nextSortOrder: number
}) {
  const [name, setName] = useState(editingCategory?.name || '')
  const [sortOrder, setSortOrder] = useState(String(editingCategory?.sort_order ?? nextSortOrder))
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    onSave(name.trim(), Number(sortOrder) || nextSortOrder)
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="space-y-4 py-2">
        <div>
          <label className="text-xs font-medium text-neutral-500 mb-1 block">Category Name *</label>
          <Input
            placeholder="e.g. Biryani"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            autoFocus
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 mb-1 block">Sort Order</label>
          <Input
            type="number"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          />
        </div>
      </div>

      <ResponsiveDialogFooter>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {editingCategory ? 'Save Changes' : 'Add Category'}
          </Button>
        </div>
      </ResponsiveDialogFooter>
    </ResponsiveDialog>
  )
}

// ──────────────────────────────────────
// Coupon Form Modal
// ──────────────────────────────────────
interface CouponFormData {
  code: string
  discount_type: DiscountType
  discount_value: string
  min_order_value: string
  max_discount: string
  is_active: boolean
}

const emptyCouponForm: CouponFormData = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_value: '0',
  max_discount: '',
  is_active: true,
}

function CouponFormModal({
  open,
  onClose,
  editingCoupon,
  onSave,
}: {
  open: boolean
  onClose: () => void
  editingCoupon: Coupon | null
  onSave: (data: CouponFormData) => void
}) {
  const [form, setForm] = useState<CouponFormData>(() => {
    if (editingCoupon) {
      return {
        code: editingCoupon.code,
        discount_type: editingCoupon.discount_type,
        discount_value: String(editingCoupon.discount_value),
        min_order_value: String(editingCoupon.min_order_value),
        max_discount: editingCoupon.max_discount != null ? String(editingCoupon.max_discount) : '',
        is_active: editingCoupon.is_active,
      }
    }
    return { ...emptyCouponForm }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.code.trim()) e.code = 'Code is required'
    if (!form.discount_value || Number(form.discount_value) <= 0) e.discount_value = 'Discount value is required'
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) e.discount_value = 'Max 100%'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSave(form)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="space-y-4 py-2">
        {/* Code */}
        <div>
          <label className="text-xs font-medium text-neutral-500 mb-1 block">Coupon Code *</label>
          <Input
            placeholder="e.g. NARU10"
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
          />
          {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
        </div>

        {/* Discount Type */}
        <div>
          <label className="text-xs font-medium text-neutral-500 mb-1 block">Discount Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, discount_type: 'percentage' }))}
              className={cn(
                "flex-1 h-10 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer",
                form.discount_type === 'percentage'
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
              )}
            >
              Percentage (%)
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, discount_type: 'fixed' }))}
              className={cn(
                "flex-1 h-10 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer",
                form.discount_type === 'fixed'
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
              )}
            >
              Fixed Amount
            </button>
          </div>
        </div>

        {/* Value */}
        <div>
          <label className="text-xs font-medium text-neutral-500 mb-1 block">
            Discount Value * {form.discount_type === 'percentage' ? '(%)' : '(Rs)'}
          </label>
          <Input
            type="number"
            placeholder={form.discount_type === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
            value={form.discount_value}
            onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
          />
          {errors.discount_value && <p className="text-xs text-red-500 mt-1">{errors.discount_value}</p>}
        </div>

        {/* Min Order + Max Discount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1 block">Min Order Value</label>
            <Input
              type="number"
              placeholder="0"
              value={form.min_order_value}
              onChange={e => setForm(f => ({ ...f, min_order_value: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1 block">Max Discount</label>
            <Input
              type="number"
              placeholder="Optional"
              value={form.max_discount}
              onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))}
            />
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700">Active</label>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative cursor-pointer",
              form.is_active ? "bg-green-500" : "bg-neutral-300"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform",
              form.is_active ? "translate-x-5" : "translate-x-0.5"
            )} />
          </button>
        </div>
      </div>

      <ResponsiveDialogFooter>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {editingCoupon ? 'Save Changes' : 'Add Coupon'}
          </Button>
        </div>
      </ResponsiveDialogFooter>
    </ResponsiveDialog>
  )
}

// ──────────────────────────────────────
// Menu Items Tab
// ──────────────────────────────────────
function MenuItemsTab() {
  const { isMobile } = useBreakpoint()
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability } = useMenuData()
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null)

  const filtered = searchQuery
    ? menuItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : menuItems

  const getCategoryName = (catId: string) =>
    categories.find(c => c.id === catId)?.name || 'Unknown'

  const handleSave = (data: MenuItemFormData) => {
    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: data.name,
        category_id: data.category_id,
        type: data.type,
        price_half: data.price_half ? Number(data.price_half) : null,
        price_full: Number(data.price_full),
        is_available: data.is_available,
      })
    } else {
      addMenuItem({
        name: data.name,
        category_id: data.category_id,
        type: data.type,
        price_half: data.price_half ? Number(data.price_half) : null,
        price_full: Number(data.price_full),
        is_available: data.is_available,
      })
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleDelete = () => {
    if (deletingItem) {
      deleteMenuItem(deletingItem.id)
      setDeletingItem(null)
    }
  }

  const openEdit = (item: MenuItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const openAdd = () => {
    setEditingItem(null)
    setShowForm(true)
  }

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
        <Button size="touch" onClick={openAdd}>
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-3 h-3 rounded-sm border-2 shrink-0",
                      item.type === 'veg' ? "border-veg" : "border-nonveg"
                    )}>
                      <span className={cn(
                        "block w-1.5 h-1.5 rounded-full m-auto mt-[1px]",
                        item.type === 'veg' ? "bg-veg" : "bg-nonveg"
                      )} />
                    </span>
                    <span className="font-medium text-sm truncate">{item.name}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{getCategoryName(item.category_id)}</p>
                  <div className="text-sm mt-1">
                    {item.price_half != null && <span className="text-neutral-500">H: {formatCurrency(item.price_half)} · </span>}
                    <span className="font-semibold">{formatCurrency(item.price_full)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleMenuItemAvailability(item.id)}
                    className="cursor-pointer"
                  >
                    <Badge variant={item.is_available ? "success" : "secondary"} className="text-[10px] cursor-pointer">
                      {item.is_available ? 'Available' : 'Hidden'}
                    </Badge>
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-brand-500 hover:bg-brand-50 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                        "w-3 h-3 rounded-sm border-2 shrink-0",
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
                    {item.price_half != null ? formatCurrency(item.price_half) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.price_full)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleMenuItemAvailability(item.id)} className="cursor-pointer">
                      <Badge variant={item.is_available ? "success" : "secondary"} className="text-[10px] cursor-pointer">
                        {item.is_available ? 'Available' : 'Hidden'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-brand-500 hover:bg-brand-50 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                      >
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

      {/* Add/Edit Modal */}
      {showForm && (
        <MenuItemFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditingItem(null) }}
          editingItem={editingItem}
          categories={categories}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}

// ──────────────────────────────────────
// Categories Tab
// ──────────────────────────────────────
function CategoriesTab() {
  const { categories, menuItems, addCategory, updateCategory, deleteCategory } = useMenuData()
  const [showForm, setShowForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [deletingCat, setDeletingCat] = useState<Category | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order)
  const nextSortOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order)) + 1 : 1

  const handleSave = (name: string, sortOrder: number) => {
    if (editingCat) {
      updateCategory(editingCat.id, { name, sort_order: sortOrder })
    } else {
      addCategory({ name, sort_order: sortOrder })
    }
    setShowForm(false)
    setEditingCat(null)
  }

  const handleDelete = () => {
    if (deletingCat) {
      const itemCount = menuItems.filter(i => i.category_id === deletingCat.id).length
      if (itemCount > 0) {
        setDeleteError(`Cannot delete "${deletingCat.name}" — it has ${itemCount} menu item(s). Move or delete them first.`)
        setDeletingCat(null)
        return
      }
      deleteCategory(deletingCat.id)
      setDeletingCat(null)
    }
  }

  const openEdit = (cat: Category) => {
    setEditingCat(cat)
    setShowForm(true)
  }

  const openAdd = () => {
    setEditingCat(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-500">{categories.length} categories</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{deleteError}</p>
          <button onClick={() => setDeleteError('')} className="text-red-400 hover:text-red-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedCategories.map(cat => {
          const itemCount = menuItems.filter(i => i.category_id === cat.id).length
          return (
            <div key={cat.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{cat.name}</span>
                <p className="text-xs text-neutral-500">{itemCount} items · Order: {cat.sort_order}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-brand-500 hover:bg-brand-50 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingCat(cat)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <CategoryFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditingCat(null) }}
          editingCategory={editingCat}
          onSave={handleSave}
          nextSortOrder={nextSortOrder}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        open={!!deletingCat}
        onClose={() => setDeletingCat(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCat?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}

// ──────────────────────────────────────
// Coupons Tab
// ──────────────────────────────────────
function CouponsTab() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponActive } = useMenuData()
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)

  const handleSave = (data: CouponFormData) => {
    const parsed = {
      code: data.code.trim().toUpperCase(),
      discount_type: data.discount_type,
      discount_value: Number(data.discount_value),
      min_order_value: Number(data.min_order_value) || 0,
      max_discount: data.max_discount ? Number(data.max_discount) : null,
      is_active: data.is_active,
      valid_from: null as string | null,
      valid_until: null as string | null,
    }

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, parsed)
    } else {
      addCoupon(parsed)
    }
    setShowForm(false)
    setEditingCoupon(null)
  }

  const handleDelete = () => {
    if (deletingCoupon) {
      deleteCoupon(deletingCoupon.id)
      setDeletingCoupon(null)
    }
  }

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setShowForm(true)
  }

  const openAdd = () => {
    setEditingCoupon(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-500">{coupons.length} coupons</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-brand-600">{coupon.code}</span>
              <button onClick={() => toggleCouponActive(coupon.id)} className="cursor-pointer">
                <Badge variant={coupon.is_active ? "success" : "secondary"} className="text-[10px] cursor-pointer">
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </button>
            </div>
            <p className="text-sm text-neutral-600">
              {coupon.discount_type === 'percentage'
                ? `${coupon.discount_value}% off`
                : `${formatCurrency(coupon.discount_value)} off`}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Min order: {formatCurrency(coupon.min_order_value)}
              {coupon.max_discount != null && ` · Max: ${formatCurrency(coupon.max_discount)}`}
            </p>
            <div className="flex items-center justify-end gap-1 mt-3">
              <button
                onClick={() => openEdit(coupon)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-brand-500 hover:bg-brand-50 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeletingCoupon(coupon)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center text-neutral-400 py-8">
          <p className="text-sm">No coupons yet</p>
          <p className="text-xs mt-1">Click "Add Coupon" to create one</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <CouponFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditingCoupon(null) }}
          editingCoupon={editingCoupon}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        open={!!deletingCoupon}
        onClose={() => setDeletingCoupon(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${deletingCoupon?.code}"? This action cannot be undone.`}
      />
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
