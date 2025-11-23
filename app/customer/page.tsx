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
    <div className="min-h-screen bg-seatale-cream font-display pb-24">
      {/* Header */}
      <header className="bg-seatale-primary p-6 pb-8 rounded-b-[2rem] shadow-xl relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-seatale-secondary shadow-lg">
              <Image
                src="/logo.jpg"
                alt="Sea Tale"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-seatale-cream font-bold text-xl tracking-wide">Sea Tale Café</h1>
              <p className="text-seatale-secondary text-xs uppercase tracking-widest mt-0.5">
                {tableId ? `Table ${tableId}` : 'Welcome, Guest!'}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-seatale-secondary/20 flex items-center justify-center text-seatale-secondary border border-seatale-secondary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 relative z-20">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Bestsellers Card */}
            <div
              onClick={() => setActiveTab('menu')}
              className="bg-seatale-light border-2 border-seatale-secondary/50 rounded-xl p-1 shadow-lg transform transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <div className="border-2 border-dashed border-seatale-secondary/30 rounded-lg p-6 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-seatale-secondary to-transparent"></div>
                <div className="text-5xl text-seatale-secondary drop-shadow-md">
                  ⭐
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-seatale-primary mb-1">Bestsellers</h2>
                  <p className="text-seatale-primary/70 text-sm font-sans">Try our most popular dishes</p>
                </div>
              </div>
            </div>

            {/* About Us Card */}
            <div className="bg-seatale-primary rounded-xl p-1 shadow-lg transform transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer border border-seatale-secondary/20">
              <div className="border border-seatale-secondary/30 rounded-lg p-6 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #C5A059 10px, #C5A059 11px)`
                }}></div>

                <div className="text-5xl text-seatale-secondary relative z-10">
                  ⚓
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-seatale-cream mb-1">About Us</h2>
                  <p className="text-seatale-secondary text-sm font-sans">@cafe_sea_tale_karvenagar</p>
                </div>
              </div>
            </div>

            {/* Follow Us Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-seatale-secondary/30 rounded-2xl blur-sm"></div>
              <div className="bg-seatale-primary rounded-xl p-1 relative shadow-xl border-4 border-dashed border-seatale-secondary">
                <div className="rounded-lg p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%234E6E5D' fill-opacity='1' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'bottom'
                  }}></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl p-1 mb-3 shadow-lg transform group-hover:rotate-6 transition-transform">
                      <div className="bg-white w-full h-full rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-seatale-cream mb-1">Follow Us on Instagram</h3>
                    <p className="text-seatale-cream/80 text-sm mb-4 font-sans">Follow us on Instagram for updates!</p>
                    <a
                      href="https://www.instagram.com/cafe_sea_tale_karvenagar/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-seatale-secondary text-seatale-primary px-6 py-2 rounded-full font-bold text-sm hover:bg-seatale-cream transition-colors shadow-md"
                    >
                      Visit Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-fade-in">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sticky top-0 bg-seatale-cream z-10 py-2 -mx-4 px-4">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!selectedCategory
                  ? 'bg-seatale-primary text-seatale-cream'
                  : 'bg-white text-seatale-primary border border-seatale-secondary/30'
                  }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? 'bg-seatale-primary text-seatale-cream'
                    : 'bg-white text-seatale-primary border border-seatale-secondary/30'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Dishes */}
            <div className="grid grid-cols-1 gap-4">
              {getFilteredDishes().map(dish => (
                <div key={dish.id} className="bg-white rounded-xl p-4 shadow-sm border border-seatale-secondary/20 flex gap-4">
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
                        <h3 className="font-bold text-seatale-primary">{dish.name}</h3>
                        <span className="font-bold text-seatale-secondary">₹{dish.price}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{dish.description}</p>
                    </div>
                    <button
                      onClick={() => addToCart(dish)}
                      className="self-end bg-seatale-secondary/10 text-seatale-secondary font-bold px-3 py-1 rounded-full text-xs hover:bg-seatale-secondary hover:text-seatale-primary transition-colors mt-2"
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
            <h2 className="text-2xl font-bold text-seatale-primary">Your Cart</h2>

            {cart.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-seatale-secondary/30">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-gray-500">Your cart is empty</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 text-seatale-primary font-medium hover:underline"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-seatale-secondary/20 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg">
                          🍽️
                        </div>
                        <div>
                          <p className="font-bold text-seatale-primary">{item.dish.name}</p>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-seatale-secondary">₹{(item.dish.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-5 border-2 border-seatale-primary shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-2xl font-bold text-seatale-primary">
                      ₹{cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-seatale-primary"
                  />

                  <button
                    onClick={placeOrder}
                    disabled={!phone}
                    className="w-full bg-seatale-primary text-seatale-cream py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-seatale-primary/90 transition-colors"
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
            <h2 className="text-2xl font-bold text-seatale-primary">Order History</h2>

            <div className="space-y-4">
              {customerOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl p-5 shadow-sm border border-seatale-secondary/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold mb-2 ${order.status === 'approved' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {order.status.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="font-bold text-xl text-seatale-primary">
                      ₹{(order.final_amount || order.total_amount).toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-gray-100 pt-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-600">
                        <span>{item.quantity}x {item.dish_name}</span>
                        <span>₹{((item.dish_price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.status === 'approved' && (
                    <button
                      onClick={() => downloadBill(order.id)}
                      className="mt-4 w-full py-2 bg-seatale-light text-seatale-primary font-medium rounded-lg hover:bg-seatale-cream transition-colors text-sm border border-seatale-secondary/30"
                    >
                      Download Bill 📄
                    </button>
                  )}
                </div>
              ))}

              {customerOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-seatale-primary text-seatale-cream pb-safe pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-50 rounded-t-2xl">
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
                className={`flex flex-col items-center justify-center w-full h-full transition-all relative ${isActive ? 'text-seatale-secondary' : 'text-seatale-cream/60 hover:text-seatale-cream'
                  }`}
              >
                {isActive && (
                  <div className="absolute top-0 w-12 h-1 bg-seatale-secondary rounded-b-full shadow-[0_0_8px_rgba(197,160,89,0.6)]" />
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