'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Category } from '@/lib/supabase'

interface StaggeredSidebarProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  selectedCategory: string
  vegFilter: 'all' | 'veg' | 'non-veg'
  onCategorySelect: (categoryId: string) => void
  onVegFilterChange: (filter: 'all' | 'veg' | 'non-veg') => void
  onBackToHome: () => void
}

export default function StaggeredSidebar({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  vegFilter,
  onCategorySelect,
  onVegFilterChange,
  onBackToHome
}: StaggeredSidebarProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      openSidebar()
    } else {
      closeSidebar()
    }
  }, [isOpen])

  const openSidebar = () => {
    if (isAnimating) return
    setIsAnimating(true)

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false)
    })

    // Animate overlay
    tl.fromTo(overlayRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.15, ease: 'power2.out' }
    )

    // Animate sidebar
    tl.fromTo(sidebarRef.current,
      { x: '-100%' },
      { x: '0%', duration: 0.25, ease: 'power3.out' },
      0.05
    )

    // Animate items with stagger
    tl.fromTo(itemsRef.current,
      { y: 20, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.3, 
        ease: 'power2.out',
        stagger: 0.04
      },
      0.15
    )
  }

  const closeSidebar = () => {
    if (isAnimating) return
    setIsAnimating(true)

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false)
    })

    // Animate items out
    tl.to(itemsRef.current, {
      y: -15,
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in',
      stagger: 0.02
    })

    // Animate sidebar out
    tl.to(sidebarRef.current, {
      x: '-100%',
      duration: 0.2,
      ease: 'power2.in'
    }, 0.05)

    // Animate overlay out
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in'
    }, 0.1)
  }

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !itemsRef.current.includes(el)) {
      itemsRef.current.push(el)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="absolute left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl"
        style={{ transform: 'translateX(-100%)' }}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div ref={addToRefs} className="flex items-center justify-between mb-8">
            <button 
              onClick={onBackToHome}
              className="text-gray-700 hover:text-ocean-600 flex items-center gap-2 font-medium transition-colors"
            >
              ← Back to Home
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Dietary Filter */}
          <div ref={addToRefs} className="mb-8">
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
                  onClick={() => onVegFilterChange(option.value as any)}
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
          <div ref={addToRefs}>
            <h3 className="font-bold text-lg text-gray-800 mb-4 uppercase tracking-wide">
              Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onCategorySelect('')
                  onClose()
                }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                  !selectedCategory
                    ? 'bg-ocean-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-semibold text-lg">All Categories</div>
              </button>
              
              {categories.map((category, index) => (
                <div key={category.id} ref={addToRefs}>
                  <button
                    onClick={() => {
                      onCategorySelect(category.id)
                      onClose()
                    }}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}