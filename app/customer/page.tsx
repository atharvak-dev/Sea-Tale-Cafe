'use client'
import { useState, useEffect } from 'react'
import { supabase, Dish, Category, Event } from '@/lib/supabase'
import { useOrderStatus } from '@/lib/useOrderStatus'
import DishCard from '@/components/DishCard'
import StaggeredSidebar from '@/components/StaggeredSidebar'
import BillNotification from '@/components/BillNotification'
import Image from 'next/image'

export default function CustomerPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [bestSellers, setBestSellers] = useState<Dish[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all')
  const [showMenu, setShowMenu] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [cart, setCart] = useState<{dish: Dish, quantity: number}[]>([])
  const [showCart, setShowCart] = useState(false)
  const [phone, setPhone] = useState('')
  const [tableId, setTableId] = useState('')
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const { orders: customerOrders, showBillNotification, setShowBillNotification, downloadBill } = useOrderStatus(phone)

  useEffect(() => {
    fetchData()
    const params = new URLSearchParams(window.location.search)
    setTableId(params.get('table') || '')
    
    // Request notification permission
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
      setShowCart(false)
      alert('Order placed successfully! 🌊\nYour bill will be automatically downloaded once approved by our staff.')
    }
  }

  const getFilteredDishes = () => {
    let filtered = dishes

    if (selectedCategory) {
      filtered = filtered.filter(dish => dish.category_id === selectedCategory)
    }

    if (vegFilter === 'veg') {
      filtered = filtered.filter(dish => {
        const category = categories.find(c => c.id === dish.category_id)
        return category?.is_veg || dish.tags.includes('Vegetarian')
      })
    } else if (vegFilter === 'non-veg') {
      filtered = filtered.filter(dish => {
        const category = categories.find(c => c.id === dish.category_id)
        return !category?.is_veg && !dish.tags.includes('Vegetarian')
      })
    }

    return filtered
  }

  if (showMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Staggered Sidebar */}
        <StaggeredSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          categories={categories}
          selectedCategory={selectedCategory}
          vegFilter={vegFilter}
          onCategorySelect={setSelectedCategory}
          onVegFilterChange={setVegFilter}
          onBackToHome={() => setShowMenu(false)}
        />

        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-xl z-40">
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setShowMenu(false)}
                className="text-gray-700 hover:text-ocean-600 flex items-center gap-2 font-medium transition-colors"
              >
                ← Back to Home
              </button>
            </div>

            {/* Dietary Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-lg text-gray-800 mb-4 uppercase tracking-wide">
                Dietary
              </h3>
              <div className="space-y-3">
                {[
                  { value: 'all', label: 'All Items', icon: '🍽️' },
                  { value: 'veg', label: 'Vegetarian', icon: '🥬' },
                  { value: 'non-veg', label: 'Non-Vegetarian', icon: '🍖' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setVegFilter(option.value as any)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                      vegFilter === option.value
                        ? 'bg-ocean-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-4 uppercase tracking-wide">
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    !selectedCategory
                      ? 'bg-ocean-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-semibold text-lg">All Categories</div>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                      selectedCategory === category.id
                        ? 'bg-ocean-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">
                      {category.cuisine_type === 'chinese' && '🥢'}
                      {category.cuisine_type === 'desi' && '🍛'}
                      {category.cuisine_type === 'italian' && '🍝'}
                      {category.cuisine_type === 'drinks' && '🥤'}
                      {category.cuisine_type === 'desserts' && '🍰'}
                      {!['chinese', 'desi', 'italian', 'drinks', 'desserts'].includes(category.cuisine_type) && '🍽️'}
                    </span>
                    <div>
                      <div className="font-semibold text-lg">{category.name}</div>
                      <div className="text-sm opacity-75 capitalize">{category.cuisine_type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-80">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSidebar(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 flex flex-col justify-center gap-1">
                    <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                    <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                    <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                  </div>
                </button>
                <Image 
                  src="/logo.jpg" 
                  alt="Sea Tale" 
                  width={32} 
                  height={32} 
                  className="rounded-full shadow-lg"
                />
                <div>
                  <h1 className="text-lg lg:text-xl font-display font-bold text-gray-800">Sea Tale Menu</h1>
                  <p className="text-xs lg:text-sm text-gray-600">
                    {selectedCategory 
                      ? categories.find(c => c.id === selectedCategory)?.name 
                      : 'All Items'
                    } • {getFilteredDishes().length} items
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCart(true)}
                className="relative bg-ocean-600 text-white px-4 py-2 rounded-xl hover:bg-ocean-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                🛒 <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-coral-600 text-white text-xs rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center animate-bounce">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Menu Items */}
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {getFilteredDishes().map((dish, index) => (
                <div key={dish.id} className="animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
                  <DishCard dish={dish} onAddToCart={addToCart} />
                </div>
              ))}
            </div>
            {getFilteredDishes().length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-md w-full max-h-[80vh] rounded-t-3xl p-6 animate-slide-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-800">Your Order</h2>
                <button 
                  onClick={() => setShowCart(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto mb-6 space-y-3">
                {cart.map(item => (
                  <div key={item.dish.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <span className="font-medium">{item.dish.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-ocean-700">${(item.dish.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-modern mb-4"
                />
                <div className="flex justify-between items-center mb-4 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-2xl text-ocean-700">${cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={placeOrder}
                    disabled={!phone || cart.length === 0}
                    className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Order 🌊
                  </button>
                  {phone && customerOrders.length > 0 && (
                    <button
                      onClick={() => setShowOrderHistory(true)}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors text-sm"
                    >
                      📜 View Order History ({customerOrders.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/20 p-4">
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
          </div>
          <button 
            onClick={() => setShowCart(true)}
            className="relative bg-ocean-600 text-white px-4 py-2 rounded-xl hover:bg-ocean-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
          >
            🛒 <span className="hidden sm:inline">Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-coral-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Categories Section */}
        <div className="p-4">
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">Menu Categories</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id)
                  setShowMenu(true)
                }}
                className="px-6 py-3 rounded-full whitespace-nowrap transition-all flex items-center gap-2 bg-white text-gray-700 hover:bg-ocean-50 hover:text-ocean-700 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <span>
                  {category.cuisine_type === 'chinese' && '🥢'}
                  {category.cuisine_type === 'desi' && '🍛'}
                  {category.cuisine_type === 'italian' && '🍝'}
                  {category.cuisine_type === 'drinks' && '🥤'}
                  {category.cuisine_type === 'desserts' && '🍰'}
                  {!['chinese', 'desi', 'italian', 'drinks', 'desserts'].includes(category.cuisine_type) && '🍽️'}
                </span>
                {category.name}
              </button>
            ))}
            <button
              onClick={() => setShowMenu(true)}
              className="px-6 py-3 rounded-full whitespace-nowrap transition-all bg-ocean-600 text-white hover:bg-ocean-700 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View Full Menu
            </button>
          </div>
        </div>

        {/* Bestsellers Carousel */}
        {bestSellers.length > 0 && (
          <div className="p-4">
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">⭐ Bestsellers</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {bestSellers.map(dish => (
                <div key={dish.id} className="flex-shrink-0 w-72">
                  <DishCard dish={dish} onAddToCart={addToCart} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About the Café Section */}
        <div className="p-4 bg-white/50 mx-4 rounded-2xl mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">About Sea Tale Café</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to Sea Tale, where maritime tradition meets culinary excellence. Our café offers a unique dining experience 
            with fresh seafood, authentic flavors, and a warm nautical atmosphere. From traditional dishes to modern fusion cuisine, 
            every meal tells a story of the sea.
          </p>
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <div className="p-4">
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">🎉 Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {events.map(event => (
                <div key={event.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🎉</div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-xl text-gray-800 mb-2">{event.title}</h3>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm text-ocean-600">
                        <span>📅</span>
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bill Notification */}
      <BillNotification 
        show={showBillNotification} 
        onClose={() => setShowBillNotification(false)} 
      />

      {/* Order History Modal */}
      {showOrderHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md w-full max-h-[80vh] rounded-t-3xl p-6 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-800">Order History</h2>
              <button 
                onClick={() => setShowOrderHistory(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-4">
              {customerOrders.map(order => (
                <div key={order.id} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        order.status === 'approved' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ocean-700">
                        ${(order.final_amount || order.total_amount).toFixed(2)}
                      </p>
                      {order.status === 'approved' && order.final_amount && (
                        <button
                          onClick={() => downloadBill(order.id)}
                          className="mt-2 bg-ocean-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-ocean-700 transition-colors"
                        >
                          💾 Download Bill
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.dish_name || 'Item'} x{item.quantity}</span>
                        <span>${((item.dish_price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {customerOrders.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-600">No orders found</p>
                  <p className="text-sm text-gray-500">Place your first order to see it here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-30 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md w-full max-h-[80vh] rounded-t-3xl p-6 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-800">Your Order</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto mb-6 space-y-3">
              {cart.map(item => (
                <div key={item.dish.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-medium">{item.dish.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-ocean-700">${(item.dish.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-modern mb-4"
              />
              <div className="flex justify-between items-center mb-4 text-lg font-bold">
                <span>Total:</span>
                <span className="text-2xl text-ocean-700">${cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={placeOrder}
                  disabled={!phone || cart.length === 0}
                  className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order 🌊
                </button>
                {phone && customerOrders.length > 0 && (
                  <button
                    onClick={() => setShowOrderHistory(true)}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors text-sm"
                  >
                    📜 View Order History ({customerOrders.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}