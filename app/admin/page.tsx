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
  const [activeTab, setActiveTab] = useState<'orders' | 'dishes' | 'tables' | 'settings' | 'admin'>('orders')
  const [dishes, setDishes] = useState<Dish[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [taxes, setTaxes] = useState<TaxConfig[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [restaurantPhone, setRestaurantPhone] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('receptionist_auth')
    const role = localStorage.getItem('user_role')
    
    if (!auth || role !== 'admin') {
      router.push('/receptionist/login')
      return
    }
    
    fetchAllData()
  }, [router])

  const fetchAllData = async () => {
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
    if (!error) fetchAllData()
  }

  const updateDishTags = async (dishId: string, tags: string[]) => {
    const { error } = await supabase.from('dishes').update({ tags }).eq('id', dishId)
    if (!error) fetchAllData()
  }

  const deleteDish = async (dishId: string, dishName: string) => {
    if (!confirm(`Delete "${dishName}"?`)) return
    const { error } = await supabase.from('dishes').delete().eq('id', dishId)
    if (!error) fetchAllData()
  }

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('categories').insert(category)
    if (!error) fetchAllData()
  }

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Delete "${categoryName}"?`)) return
    const { error } = await supabase.from('categories').delete().eq('id', categoryId)
    if (!error) fetchAllData()
  }

  const updateCategory = async (categoryId: string, category: Omit<Category, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('categories').update(category).eq('id', categoryId)
    if (!error) fetchAllData()
  }

  const addEvent = async (event: Omit<Event, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('events').insert(event)
    if (!error) fetchAllData()
  }

  const toggleEvent = async (eventId: string, isActive: boolean) => {
    const { error } = await supabase.from('events').update({ is_active: isActive }).eq('id', eventId)
    if (!error) fetchAllData()
  }

  const deleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Delete "${eventTitle}"?`)) return
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (!error) fetchAllData()
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
    
    if (!error) fetchAllData()
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
      fetchAllData()
    }
  }

  const updateTax = async (taxId: string, percentage: number) => {
    const { error } = await supabase.from('tax_config').update({ percentage }).eq('id', taxId)
    if (!error) fetchAllData()
  }

  const updateRestaurantPhone = async (phone: string) => {
    const { error } = await supabase.from('system_config').update({ value: phone }).eq('key', 'restaurant_phone')
    if (!error) {
      setRestaurantPhone(phone)
      fetchAllData()
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
        fetchAllData()
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
              localStorage.removeItem('receptionist_auth')
              localStorage.removeItem('user_role')
              router.push('/receptionist/login')
            }}
            className="btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="flex overflow-x-auto">
          {(['orders', 'dishes', 'tables', 'settings', 'admin'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 capitalize whitespace-nowrap ${activeTab === tab ? 'bg-ocean-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
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
                        supabase.from('tables').delete().eq('id', table.id).then(() => fetchAllData())
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
    </div>
  )
}