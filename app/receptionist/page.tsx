'use client'
import { useState, useEffect } from 'react'
import { supabase, Dish, Order, Table, TaxConfig, SystemConfig, Category, Event } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import QRCode from 'qrcode'
import OrdersTab from '@/components/OrdersTab'
import DishesTab from '@/components/DishesTab'
import CategoriesTab from '@/components/CategoriesTab'
import EventsTab from '@/components/EventsTab'

export default function ReceptionistPage() {
  const router = useRouter()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [taxes, setTaxes] = useState<TaxConfig[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState<'orders' | 'dishes' | 'categories' | 'events' | 'tables' | 'settings' | 'admin'>('orders')
  const [restaurantPhone, setRestaurantPhone] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentReceptionist, setCurrentReceptionist] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('receptionist_auth')
    const role = localStorage.getItem('user_role')
    if (!auth) {
      router.push('/receptionist/login')
      return
    }

    if (role !== 'admin' && role !== 'receptionist') {
      router.push('/receptionist/login')
      return
    }

    setIsAdmin(role === 'admin')
    fetchData()
  }, [router])

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
      alert(`Combined bill approved for Table ${table?.number}!\nTotal: ₹${finalAmount.toFixed(2)}`)
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

  const updateReceptionist = async (phone: string) => {
    if (!isAdmin) return
    const { error } = await supabase.from('system_config').update({ value: phone }).eq('key', 'receptionist_phone')
    if (!error) {
      setCurrentReceptionist(phone)
      fetchData()
      alert(phone ? `Receptionist set to ${phone}` : 'Receptionist removed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-coral-500 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Sea Tale" width={40} height={40} className="rounded-full shadow-lg" />
            <h1 className="text-2xl font-display font-bold text-white">⚓ Staff Portal</h1>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-coral-600 px-4 py-2 rounded-lg hover:bg-coral-700"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('receptionist_auth')
                localStorage.removeItem('user_role')
                router.push('/receptionist/login')
              }}
              className="bg-coral-600 px-4 py-2 rounded-lg hover:bg-coral-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="flex overflow-x-auto">
          {(['orders', 'dishes', 'categories', 'events', 'tables', 'settings', ...(isAdmin ? ['admin'] : [])] as const).map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 capitalize whitespace-nowrap ${activeTab === tab ? 'bg-ocean-600 text-white' : 'text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6">
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

        {activeTab === 'categories' && (
          <CategoriesTab
            categories={categories}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
          />
        )}

        {activeTab === 'events' && (
          <EventsTab
            events={events}
            onAddEvent={addEvent}
            onToggleEvent={toggleEvent}
            onDeleteEvent={deleteEvent}
          />
        )}

        {activeTab === 'tables' && (
          <div>
            <div className="maritime-card p-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Add Table</h2>
              <div className="flex gap-4">
                <input
                  id="table-number-input"
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
                    const input = document.getElementById('table-number-input') as HTMLInputElement
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
          <div className="space-y-6">
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
                  className="p-3 border rounded-lg flex-1"
                />
                <button
                  onClick={() => updateRestaurantPhone(restaurantPhone)}
                  className="bg-ocean-600 text-white px-4 py-2 rounded-lg"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="maritime-card p-6">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-6">Admin Panel</h2>

              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <h3 className="font-bold text-blue-800 mb-2">Current Receptionist</h3>
                <p className="text-blue-700">
                  {currentReceptionist || 'No receptionist registered'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">Add New Receptionist</h3>
                  <input
                    type="tel"
                    placeholder="New receptionist phone"
                    className="input-modern"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const phone = (e.target as HTMLInputElement).value
                        if (phone) {
                          updateReceptionist(phone)
                            ; (e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="New receptionist phone"]') as HTMLInputElement
                      if (input?.value) {
                        updateReceptionist(input.value)
                        input.value = ''
                      }
                    }}
                    className="btn-primary w-full"
                  >
                    Set as Receptionist
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">Remove Receptionist</h3>
                  <button
                    onClick={() => {
                      if (confirm('Remove current receptionist?')) {
                        updateReceptionist('')
                      }
                    }}
                    className="btn-secondary w-full"
                    disabled={!currentReceptionist}
                  >
                    Remove Current Receptionist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}