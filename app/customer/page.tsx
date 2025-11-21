'use client'
import { useState, useEffect } from 'react'
import { supabase, Dish, Category, Event } from '@/lib/supabase'
import { useOrderStatus } from '@/lib/useOrderStatus'
import DishCard from '@/components/DishCard'
import BillNotification from '@/components/BillNotification'
import Image from 'next/image'

export default function CustomerPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [bestSellers, setBestSellers] = useState<Dish[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all')
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'cart' | 'orders'>('home')
  const [cart, setCart] = useState<{ dish: Dish, quantity: number }[]>([])
  const [phone, setPhone] = useState('')
  const [tableId, setTableId] = useState('')
  const { orders: customerOrders, showBillNotification, setShowBillNotification, downloadBill } = useOrderStatus(phone)

  useEffect(() => {
    fetchData()
    const params = new URLSearchParams(window.location.search)
    setTableId(params.get('table') || '')

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const fetchData = async () => {
    const [dishesRes, categoriesRes, eventsRes, bestSellersRes] = await Promise.all([
      supabase.from('dishes').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('events').select('*').eq('is_active', true).gte('event_date', new Date().toISOString().split('T')[0]),
      supabase.from('dishes').select('*').contains('tags', ['Best Seller'])
    ])

    setDishes(dishesRes.data || [])
    setCategories(categoriesRes.data || [])
    setEvents(eventsRes.data || [])
    setBestSellers(bestSellersRes.data || [])
  }

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id)
      if (existing) {
        return prev.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { dish, quantity: 1 }]
    })
    // Optional: Switch to cart tab or show toast
  }

  const placeOrder = async () => {
    if (!phone || cart.length === 0) return

    const total = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0)

    const { error } = await supabase.from('orders').insert({
      table_id: tableId,
      customer_phone: phone,
      items: cart.map(item => ({
        dish_id: item.dish.id,
        quantity: item.quantity,
        dish_name: item.dish.name,
        dish_price: item.dish.price
      })),
      total_amount: total,
      tax_amount: 0,
      status: 'pending'
    })

    if (!error) {
      setCart([])
      setActiveTab('orders')
      alert('Order placed successfully! 🌊\nYour bill will be automatically downloaded once approved by our staff.')
    }
  }

  const getFilteredDishes = () => {
    let filtered = dishes

    if (selectedCategory) {
      filtered = filtered.filter(dish => dish.category_id === selectedCategory)
    }

    if (vegFilter === 'veg') {
      filtered = filtered.filter(dish => dish.is_veg)
    } else if (vegFilter === 'non-veg') {
      filtered = filtered.filter(dish => !dish.is_veg)
    }

    return filtered
  }

  return (
    <div className="min-h-screen bg-sea-cream font-inter pb-24">
      {/* Header */}
      <header className="bg-sea-cream p-6 pb-2 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sea-gold shadow-sm">
              <Image
                src="/logo.jpg"
                alt="Sea Tale"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-atlassian-blue-700 font-bold text-lg leading-tight">Sea Tale Café</h1>
              <p className="text-atlassian-neutral-500 text-xs">
                {tableId ? `Table ${tableId}` : 'Welcome, Guest!'}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-atlassian-neutral-200 flex items-center justify-center text-atlassian-blue-700">
            👤
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Featured Card (Gold) */}
            <div
              onClick={() => setActiveTab('menu')}
              className="bg-white rounded-xl p-5 border-2 border-sea-gold shadow-sm relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">⭐</span>
              </div>
              <h3 className="text-lg font-bold text-atlassian-blue-700 mb-1">Bestsellers</h3>
              <p className="text-atlassian-neutral-500 text-sm mb-4">Try our most popular dishes</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {bestSellers.slice(0, 3).map(dish => (
                  <div key={dish.id} className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative">
                    {dish.image_url ? (
                      <Image src={dish.image_url} alt={dish.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Events Card (Green) */}
            {events.length > 0 && (
              <div className="bg-white rounded-xl p-5 border-2 border-atlassian-green shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="text-6xl">🎉</span>
                </div>
                <h3 className="text-lg font-bold text-atlassian-blue-700 mb-1">Upcoming Events</h3>
                <div className="mt-2 space-y-3">
                  {events.slice(0, 2).map(event => (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
                        {new Date(event.event_date).getDate()}
                      </div>
                      <div>
                        <p className="font-medium text-atlassian-neutral-800 text-sm">{event.title}</p>
                        <p className="text-xs text-atlassian-neutral-500 truncate">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Card (Red/Coral) */}
            <div className="bg-white rounded-xl p-5 border-2 border-coral-500 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-6xl">⚓</span>
              </div>
              <h3 className="text-lg font-bold text-atlassian-blue-700 mb-2">About Us</h3>
              <p className="text-atlassian-neutral-600 text-sm leading-relaxed">
                Experience the finest maritime dining with fresh ingredients and a warm atmosphere.
              </p>
            </div>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-fade-in">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sticky top-[88px] bg-sea-cream z-10 py-2 -mx-4 px-4">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!selectedCategory
                  ? 'bg-atlassian-blue-700 text-white'
                  : 'bg-white text-atlassian-neutral-600 border border-atlassian-neutral-300'
                  }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? 'bg-atlassian-blue-700 text-white'
                    : 'bg-white text-atlassian-neutral-600 border border-atlassian-neutral-300'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Dishes */}
            <div className="grid grid-cols-1 gap-4">
              {getFilteredDishes().map(dish => (
                <div key={dish.id} className="bg-white rounded-xl p-4 shadow-sm border border-atlassian-neutral-200 flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative">
                    {dish.image_url ? (
                      <Image src={dish.image_url} alt={dish.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-atlassian-neutral-800">{dish.name}</h3>
                        <span className="font-bold text-atlassian-blue-700">₹{dish.price}</span>
                      </div>
                      <p className="text-xs text-atlassian-neutral-500 line-clamp-2 mt-1">{dish.description}</p>
                    </div>
                    <button
                      onClick={() => addToCart(dish)}
                      className="self-end bg-sea-gold/10 text-sea-gold font-bold px-3 py-1 rounded-full text-xs hover:bg-sea-gold hover:text-white transition-colors mt-2"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CART TAB */}
        {activeTab === 'cart' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-atlassian-blue-700">Your Cart</h2>

            {cart.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-atlassian-neutral-300">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-atlassian-neutral-500">Your cart is empty</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 text-atlassian-blue-600 font-medium hover:underline"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-atlassian-neutral-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg">
                          🍽️
                        </div>
                        <div>
                          <p className="font-bold text-atlassian-neutral-800">{item.dish.name}</p>
                          <p className="text-xs text-atlassian-neutral-500">x{item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-atlassian-blue-700">₹{(item.dish.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-5 border-2 border-atlassian-blue-600 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-atlassian-neutral-600">Total Amount</span>
                    <span className="text-2xl font-bold text-atlassian-blue-700">
                      ₹{cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-atlassian-neutral-50 border border-atlassian-neutral-300 rounded-lg mb-4 focus:outline-none focus:border-atlassian-blue-500"
                  />

                  <button
                    onClick={placeOrder}
                    disabled={!phone}
                    className="w-full bg-atlassian-blue-700 text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-atlassian-blue-800 transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-atlassian-blue-700">Order History</h2>

            <div className="space-y-4">
              {customerOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl p-5 shadow-sm border border-atlassian-neutral-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold mb-2 ${order.status === 'approved' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {order.status.toUpperCase()}
                      </span>
                      <p className="text-xs text-atlassian-neutral-500">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="font-bold text-xl text-atlassian-blue-700">
                      ₹{(order.final_amount || order.total_amount).toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-atlassian-neutral-100 pt-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm text-atlassian-neutral-600">
                        <span>{item.quantity}x {item.dish_name}</span>
                        <span>₹{((item.dish_price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.status === 'approved' && (
                    <button
                      onClick={() => downloadBill(order.id)}
                      className="mt-4 w-full py-2 bg-atlassian-neutral-100 text-atlassian-blue-700 font-medium rounded-lg hover:bg-atlassian-neutral-200 transition-colors text-sm"
                    >
                      Download Bill 📄
                    </button>
                  )}
                </div>
              ))}

              {customerOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-atlassian-neutral-500">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-atlassian-blue-700 text-white pb-safe pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="flex justify-around items-center h-16">
          {[
            { id: 'home', icon: '⚓', label: 'Home' },
            { id: 'menu', icon: '🍽️', label: 'Menu' },
            { id: 'cart', icon: '🛒', label: 'Cart', badge: cart.length },
            { id: 'orders', icon: '📋', label: 'Orders' }
          ].map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center w-full h-full transition-all relative ${isActive ? 'text-sea-gold' : 'text-atlassian-blue-200 hover:text-white'
                  }`}
              >
                {isActive && (
                  <div className="absolute top-0 w-12 h-1 bg-sea-gold rounded-b-full shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                )}
                <div className="relative">
                  <span className={`text-2xl mb-1 block transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                    {item.icon}
                  </span>
                  {item.badge ? (
                    <span className="absolute -top-2 -right-2 bg-coral-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <BillNotification
        show={showBillNotification}
        onClose={() => setShowBillNotification(false)}
      />
    </div>
  )
}