'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, Category, Dish, Event } from '@/lib/supabase'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [bestSellerDishes, setBestSellerDishes] = useState<Dish[]>([])
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [categoriesRes, dishesRes, eventsRes] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('dishes').select('*').contains('tags', ['Best Seller']),
      supabase.from('events').select('*').eq('is_active', true).gte('event_date', new Date().toISOString().split('T')[0])
    ])
    
    setCategories(categoriesRes.data || [])
    setBestSellerDishes(dishesRes.data || [])
    setEvents(eventsRes.data || [])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-ocean-500/10 rounded-full blur-3xl animate-bounce-gentle"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="maritime-card p-10 max-w-lg mx-4 animate-fade-in">
            <div className="text-center">
              <div className="mb-6">
                <Image 
                  src="/logo.jpg" 
                  alt="Sea Tale Restaurant" 
                  width={120} 
                  height={120} 
                  className="mx-auto rounded-full shadow-2xl border-4 border-white/50"
                />
              </div>
              
              <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-ocean-700 to-coral-600 bg-clip-text text-transparent mb-3">
                Sea Tale
              </h1>
              <p className="text-gray-600 mb-8 text-lg">Maritime Dining Experience</p>
              
              <div className="space-y-4">
                <Link 
                  href="/customer" 
                  className="btn-primary block w-full text-center group"
                >
                  <span className="flex items-center justify-center gap-3">
                    🍽️ <span>Customer Menu</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
                
                <Link 
                  href="/receptionist/login" 
                  className="btn-secondary block w-full text-center group"
                >
                  <span className="flex items-center justify-center gap-3">
                    ⚓ <span>Staff Portal</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center text-gray-800 mb-12">Our Menu Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map(category => (
                <Link key={category.id} href={`/customer?category=${category.id}`}>
                  <div className="maritime-card p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="text-4xl mb-3">
                      {category.cuisine_type === 'chinese' && '🥢'}
                      {category.cuisine_type === 'desi' && '🍛'}
                      {category.cuisine_type === 'italian' && '🍝'}
                      {category.cuisine_type === 'drinks' && '🥤'}
                      {category.cuisine_type === 'desserts' && '🍰'}
                      {category.cuisine_type === 'general' && (category.is_veg ? '🥬' : '🍖')}
                      {!['chinese', 'desi', 'italian', 'drinks', 'desserts', 'general'].includes(category.cuisine_type) && '🍽️'}
                    </div>
                    <h3 className="font-display font-bold text-lg text-gray-800 mb-2 group-hover:text-ocean-700 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    {category.is_veg && (
                      <span className="inline-block mt-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        🥬 Vegetarian
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Best Sellers Section */}
      {bestSellerDishes.length > 0 && (
        <div className="py-16 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center text-gray-800 mb-12">⭐ Best Sellers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {bestSellerDishes.slice(0, 6).map(dish => (
                <div key={dish.id} className="maritime-card overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    {dish.image_url ? (
                      <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">🍽️</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ⭐ Best Seller
                    </div>
                    {dish.is_spicy && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        🌶️ Spicy
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-lg text-gray-800 mb-2">{dish.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dish.description}</p>
                    <p className="text-2xl font-bold text-ocean-700">${dish.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/customer" className="btn-primary">
                View Full Menu
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center text-gray-800 mb-12">🎉 Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.slice(0, 4).map(event => (
                <div key={event.id} className="maritime-card p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎉</div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-xl text-gray-800 mb-2">{event.title}</h3>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm text-ocean-600">
                        <span>📅</span>
                        <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      <div className="py-16 px-4 bg-ocean-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-8">About Sea Tale</h2>
          <p className="text-lg text-ocean-100 mb-8 leading-relaxed">
            Welcome to Sea Tale, where maritime tradition meets culinary excellence. Our restaurant offers a unique dining experience 
            with fresh seafood, authentic flavors, and a warm nautical atmosphere. From traditional dishes to modern fusion cuisine, 
            every meal tells a story of the sea.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">🌊</div>
              <h3 className="font-bold text-xl mb-2">Fresh Ingredients</h3>
              <p className="text-ocean-200">Daily fresh catch and premium ingredients</p>
            </div>
            <div>
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="font-bold text-xl mb-2">Expert Chefs</h3>
              <p className="text-ocean-200">Skilled culinary artists with maritime expertise</p>
            </div>
            <div>
              <div className="text-4xl mb-4">⚓</div>
              <h3 className="font-bold text-xl mb-2">Nautical Ambiance</h3>
              <p className="text-ocean-200">Authentic maritime atmosphere and decor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}