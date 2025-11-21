'use client'
import { Dish } from '@/lib/supabase'
import Image from 'next/image'

interface DishCardProps {
  dish: Dish
  onAddToCart?: (dish: Dish) => void
}

export default function DishCard({ dish, onAddToCart }: DishCardProps) {
  return (
    <div className="maritime-card group hover:scale-105 transition-all duration-300">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={dish.image_url || '/placeholder-dish.jpg'}
          alt={dish.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {dish.tags.map(tag => (
            <span key={tag} className="bg-coral-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              {tag}
            </span>
          ))}
          {dish.is_spicy && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              🌶️ Spicy
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display font-bold text-gray-800 mb-2 text-lg">{dish.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-ocean-700 bg-clip-text text-transparent">
            ₹{dish.price}
          </span>
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(dish)}
              className="btn-primary text-sm px-4 py-2 group-hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}