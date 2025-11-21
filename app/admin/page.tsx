'use client'
import { useState, useEffect } from 'react'
import { supabase, Dish, Order, Table, TaxConfig, Category, Event } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import OrdersTab from '@/components/OrdersTab'
import DishesTab from '@/components/DishesTab'
import EventsTab from '@/components/EventsTab'

export default function AdminPage() {
  const router = useRouter()
  const [currentReceptionist, setCurrentReceptionist] = useState('')
  const [newReceptionistPhone, setNewReceptionistPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'dishes' | 'tables' | 'settings' | 'admin'>('dashboard')
  const [dishes, setDishes] = useState<Dish[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [taxes, setTaxes] = useState<TaxConfig[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [restaurantPhone, setRestaurantPhone] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('admin_authenticated')
    const authTime = localStorage.getItem('admin_auth_time')

    // Session expires after 8 hours
    const SESSION_DURATION = 8 * 60 * 60 * 1000
    const isSessionValid = authTime && (Date.now() - parseInt(authTime)) < SESSION_DURATION

    if (!adminAuth || adminAuth !== 'true' || !isSessionValid) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = async () => {
    const [dishesRes, ordersRes, tablesRes, taxesRes, categoriesRes, eventsRes, configRes, receptionistRes] = await Promise.all([
      supabase.from('dishes').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('tables').select('*'),
      supabase.from('tax_config').select('*').eq('is_active', true),
      supabase.from('categories').select('*'),
      supabase.from('events').select('*').order('event_date', { ascending: false }),
      supabase.from('system_config').select('*').eq('key', 'restaurant_phone'),
      supabase.from('system_config').select('*').eq('key', 'receptionist_phone')
    ])
    setDishes(dishesRes.data || [])
    setOrders(ordersRes.data || [])
    setTables(tablesRes.data || [])
    setTaxes(taxesRes.data || [])
    setCategories(categoriesRes.data || [])
    setEvents(eventsRes.data || [])
    setRestaurantPhone(configRes.data?.[0]?.value || '')
    setCurrentReceptionist(receptionistRes.data?.[0]?.value || '')
  }

  const addReceptionist = async () => {
    if (!newReceptionistPhone.trim()) return

    setLoading(true)
    const { error } = await supabase
      .from('system_config')
      .update({ value: newReceptionistPhone.trim() })
      .eq('key', 'receptionist_phone')

    if (!error) {
      setCurrentReceptionist(newReceptionistPhone.trim())
      setNewReceptionistPhone('')
      alert(`✅ Receptionist ${newReceptionistPhone} added successfully!`)
    } else {
      alert('❌ Failed to add receptionist')
    }
    setLoading(false)
  }

  const removeReceptionist = async () => {
    if (!confirm(`Remove receptionist ${currentReceptionist}?`)) return

    setLoading(true)
    const { error } = await supabase
      .from('system_config')
      .update({ value: '' })
      .eq('key', 'receptionist_phone')

    if (!error) {
      setCurrentReceptionist('')
      alert('✅ Receptionist removed successfully!')
    } else {
      alert('❌ Failed to remove receptionist')
    }
    setLoading(false)
  }

  const addDish = async (dish: Omit<Dish, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('dishes').insert(dish)
    if (!error) fetchData()
  }

  const updateDishTags = async (dishId: string, tags: string[]) => {
    const { error } = await supabase.from('dishes').update({ tags }).eq('id', dishId)
    if (!error) fetchData()
  }

  const deleteDish = async (dishId: string, dishName: string) => {
    if (!confirm(`Delete "${dishName}"?`)) return
    const { error } = await supabase.from('dishes').delete().eq('id', dishId)
    if (!error) fetchData()
  }

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('categories').insert(category)
    if (!error) fetchData()
  }

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Delete "${categoryName}"?`)) return
    const { error } = await supabase.from('categories').delete().eq('id', categoryId)
    if (!error) fetchData()
  }

  const updateCategory = async (categoryId: string, category: Omit<Category, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('categories').update(category).eq('id', categoryId)
    if (!error) fetchData()
  }

  const addEvent = async (event: Omit<Event, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('events').insert(event)
    if (!error) fetchData()
  }

  const toggleEvent = async (eventId: string, isActive: boolean) => {
    const { error } = await supabase.from('events').update({ is_active: isActive }).eq('id', eventId)
    if (!error) fetchData()
  }

  const deleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Delete "${eventTitle}"?`)) return
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (!error) fetchData()
  }

  const removeDishFromOrder = async (orderId: string, dishIndex: number) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    const updatedItems = order.items.filter((_: any, index: number) => index !== dishIndex)
    const newTotal = updatedItems.reduce((sum: number, item: any) => {
      const dish = dishes.find(d => d.id === item.dish_id)
      return sum + (dish?.price || 0) * item.quantity
    }, 0)

    const { error } = await supabase
      .from('orders')
      .update({ items: updatedItems, total_amount: newTotal })
      .eq('id', orderId)

    if (!error) fetchData()
  }

  const approveTableOrders = async (tableId: string, tableOrderList: Order[], totalAmount: number, taxAmount: number, finalAmount: number) => {
    const orderIds = tableOrderList.map(order => order.id)
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'approved',
        bill_amount: totalAmount,
        tax_amount: taxAmount,
        final_amount: finalAmount
      })
      .in('id', orderIds)

    if (!error) {
      const table = tables.find(t => t.id === tableId)
      alert(`Combined bill approved for Table ${table?.number}!\nTotal: $${finalAmount.toFixed(2)}\nCustomer's bill will be automatically downloaded.`)
      fetchData()
    }
  }

  const updateTax = async (taxId: string, percentage: number) => {
    const { error } = await supabase.from('tax_config').update({ percentage }).eq('id', taxId)
    if (!error) fetchData()
  }

  const updateRestaurantPhone = async (phone: string) => {
    const { error } = await supabase.from('system_config').update({ value: phone }).eq('key', 'restaurant_phone')
    if (!error) {
      setRestaurantPhone(phone)
      fetchData()
    }
  }

  const addTable = async (tableNumber: string) => {
    if (!tableNumber.trim()) return

    try {
      const { data: tableData, error: insertError } = await supabase
        .from('tables')
        .insert({ number: tableNumber.trim() })
        .select()
        .single()

      if (insertError) throw insertError

      const qrData = `${window.location.origin}/customer?table=${tableData.id}`
      const QRCode = (await import('qrcode')).default
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: { dark: '#0369a1', light: '#ffffff' }
      })

      const { error: updateError } = await supabase
        .from('tables')
        .update({ qr_code: qrCode })
        .eq('id', tableData.id)

      if (!updateError) {
        fetchData()
        alert(`Table ${tableNumber} created successfully!`)
      }
    } catch (err) {
      alert('Failed to generate QR code')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white/80 backdrop-blur-md p-4 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Sea Tale"
              width={40}
              height={40}
              className="rounded-full shadow-lg"
            />
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-ocean-700 to-coral-600 bg-clip-text text-transparent">
              Sea Tale
            </h1>
            <span className="bg-coral-500 text-white px-2 py-1 rounded-full text-xs font-bold">Admin Panel</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('admin_authenticated')
              localStorage.removeItem('admin_auth_time')
              router.push('/admin/login')
            }}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white shadow-sm border-b border-atlassian-neutral-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {(['dashboard', 'orders', 'dishes', 'tables', 'settings', 'admin'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                  ? 'border-atlassian-blue-600 text-atlassian-blue-600'
                  : 'border-transparent text-atlassian-neutral-600 hover:text-atlassian-neutral-800 hover:bg-atlassian-neutral-50'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-6 max-w-7xl mx-auto pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-atlassian-neutral-800">Dashboard</h2>
              <span className="text-sm text-atlassian-neutral-500">
                {mounted ? new Date().toLocaleDateString() : ''}
              </span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Live Orders Card */}
              <div
                onClick={() => setActiveTab('orders')}
                className="maritime-card p-5 border-l-4 border-l-atlassian-blue-600 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl">🔥</span>
                </div>
                <h3 className="text-sm font-semibold text-atlassian-neutral-500 uppercase tracking-wider">Live Orders</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-atlassian-neutral-800">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>

              {/* Today's Sales Card */}
              <div className="maritime-card p-5 border-l-4 border-l-sea-gold relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl">💰</span>
                </div>
                <h3 className="text-sm font-semibold text-atlassian-neutral-500 uppercase tracking-wider">Today's Sales</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-atlassian-neutral-800">
                    ${orders
                      .filter(o => o.status === 'approved' && new Date(o.created_at).toDateString() === new Date().toDateString())
                      .reduce((sum, o) => sum + (o.final_amount || 0), 0)
                      .toFixed(0)}
                  </span>
                  <span className="text-sm text-atlassian-neutral-500 font-medium">Gross</span>
                </div>
              </div>

              {/* Active Tables Card */}
              <div
                onClick={() => setActiveTab('tables')}
                className="maritime-card p-5 border-l-4 border-l-coral-500 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl">🍽️</span>
                </div>
                <h3 className="text-sm font-semibold text-atlassian-neutral-500 uppercase tracking-wider">Active Tables</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-atlassian-neutral-800">{tables.length}</span>
                  <span className="text-sm text-atlassian-neutral-500 font-medium">Total</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-atlassian-neutral-300 overflow-hidden">
              <div className="p-4 border-b border-atlassian-neutral-200 flex justify-between items-center bg-atlassian-neutral-50">
                <h3 className="font-bold text-atlassian-neutral-800 flex items-center gap-2">
                  <span>🔔</span> Recent Orders
                </h3>
                <button onClick={() => setActiveTab('orders')} className="text-sm text-atlassian-blue-600 font-medium hover:underline">
                  View All
                </button>
              </div>
              <div className="divide-y divide-atlassian-neutral-100 max-h-[300px] overflow-y-auto">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 hover:bg-atlassian-neutral-50 transition-colors flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      #{order.id.slice(0, 4)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-atlassian-neutral-800">
                          Table {tables.find(t => t.id === order.table_id)?.number || 'Unknown'}
                        </h4>
                        <span className="text-xs text-atlassian-neutral-400">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-atlassian-neutral-600 truncate">
                        {order.items.length} items • ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="p-8 text-center text-atlassian-neutral-500">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            tables={tables}
            dishes={dishes}
            taxes={taxes}
            onApproveTableOrders={approveTableOrders}
            onRemoveDishFromOrder={removeDishFromOrder}
          />
        )}

        {activeTab === 'dishes' && (
          <DishesTab
            dishes={dishes}
            categories={categories}
            onAddDish={addDish}
            onUpdateDishTags={updateDishTags}
            onDeleteDish={deleteDish}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
            onUpdateCategory={updateCategory}
          />
        )}

        {activeTab === 'tables' && (
          <div className="animate-fade-in">
            <div className="maritime-card p-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Add Table</h2>
              <div className="flex gap-4">
                <input
                  id="admin-table-number-input"
                  placeholder="Table number (e.g., T1, T2)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      if (input.value.trim()) {
                        addTable(input.value.trim())
                        input.value = ''
                      }
                    }
                  }}
                  className="input-modern flex-1"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('admin-table-number-input') as HTMLInputElement
                    if (input?.value.trim()) {
                      addTable(input.value.trim())
                      input.value = ''
                    }
                  }}
                  className="btn-primary"
                >
                  Add Table
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">Tables ({tables.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map(table => (
                <div key={table.id} className="maritime-card p-6 text-center hover:shadow-xl transition-shadow">
                  <h3 className="font-display font-bold text-xl text-ocean-900 mb-4">Table {table.number}</h3>
                  {table.qr_code ? (
                    <div className="mb-4">
                      <img
                        src={table.qr_code}
                        alt={`QR Code for Table ${table.number}`}
                        className="mx-auto border-2 border-ocean-200 rounded-lg shadow-md"
                        width={160}
                        height={160}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">QR Code not generated</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-2">📱 Scan to order from this table</p>
                  <button
                    onClick={() => {
                      if (confirm(`Delete Table ${table.number}?`)) {
                        supabase.from('tables').delete().eq('id', table.id).then(() => fetchData())
                      }
                    }}
                    className="mt-3 text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete Table
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="maritime-card p-4">
              <h2 className="text-xl font-bold mb-4">Tax Configuration</h2>
              {taxes.map(tax => (
                <div key={tax.id} className="flex items-center gap-4 mb-3">
                  <span className="w-20">{tax.name}:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tax.percentage}
                    onChange={(e) => updateTax(tax.id, Number(e.target.value))}
                    className="p-2 border rounded w-20"
                  />
                  <span>%</span>
                </div>
              ))}
            </div>

            <div className="maritime-card p-4">
              <h2 className="text-xl font-bold mb-4">Restaurant Phone</h2>
              <div className="flex gap-4">
                <input
                  type="tel"
                  value={restaurantPhone}
                  onChange={(e) => setRestaurantPhone(e.target.value)}
                  placeholder="Restaurant phone number"
                  className="input-modern flex-1"
                />
                <button
                  onClick={() => updateRestaurantPhone(restaurantPhone)}
                  className="btn-primary"
                >
                  Update
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This number will be used to send bills and messages to customers
              </p>
            </div>

            <EventsTab
              events={events}
              onAddEvent={addEvent}
              onToggleEvent={toggleEvent}
              onDeleteEvent={deleteEvent}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="maritime-card p-8 animate-fade-in">
            <h2 className="text-3xl font-display font-bold text-gray-800 mb-8 text-center">
              Receptionist Management
            </h2>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl mb-8 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-800 mb-3">Current Status</h3>
              {currentReceptionist ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 text-lg">
                      📞 <strong>{currentReceptionist}</strong>
                    </p>
                    <p className="text-blue-600 text-sm">Active Receptionist</p>
                  </div>
                  <button
                    onClick={removeReceptionist}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              ) : (
                <p className="text-gray-600 text-lg">
                  ❌ No receptionist registered
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4">
                {currentReceptionist ? 'Change Receptionist' : 'Add New Receptionist'}
              </h3>

              <div className="flex gap-4">
                <input
                  type="tel"
                  placeholder="Enter phone number (e.g., 9876543210)"
                  value={newReceptionistPhone}
                  onChange={(e) => setNewReceptionistPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addReceptionist()}
                  className="input-modern flex-1 text-lg"
                  disabled={loading}
                />
                <button
                  onClick={addReceptionist}
                  disabled={loading || !newReceptionistPhone.trim()}
                  className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting...' : currentReceptionist ? 'Change' : 'Add'}
                </button>
              </div>

              <p className="text-green-600 text-sm mt-3">
                💡 This person will be able to manage orders, dishes, and tables
              </p>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600 text-sm text-center">
                🔐 Admin Access: 9518377949, 7499795424
              </p>
            </div>
          </div>
        )}
      </main>


      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-atlassian-neutral-300 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50 flex justify-around items-center pb-[env(safe-area-inset-bottom)]">
        {[
          { id: 'dashboard', icon: '⚓', label: 'Home' },
          { id: 'orders', icon: '📋', label: 'Orders' },
          { id: 'dishes', icon: '🍽️', label: 'Menu' },
          { id: 'tables', icon: '🪑', label: 'Tables' },
          { id: 'settings', icon: '⚙️', label: 'More' }
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center w-full py-3 transition-all relative ${isActive ? 'text-atlassian-blue-700' : 'text-atlassian-neutral-500 hover:text-atlassian-neutral-700'
                }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-sea-gold rounded-b-full" />
              )}
              <span className={`text-2xl mb-1 transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Floating Action Button (FAB) - Context Sensitive */}
      <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40">
        {activeTab === 'dishes' && (
          <button
            onClick={() => document.getElementById('add-dish-btn')?.click()}
            className="w-14 h-14 bg-atlassian-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-atlassian-blue-700 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-atlassian-blue-400"
          >
            <span>+</span>
          </button>
        )}
        {activeTab === 'tables' && (
          <button
            onClick={() => document.getElementById('admin-table-number-input')?.focus()}
            className="w-14 h-14 bg-atlassian-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-atlassian-blue-700 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-atlassian-blue-400"
          >
            <span>+</span>
          </button>
        )}
      </div>
    </div>
  )
}