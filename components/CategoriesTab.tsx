'use client'
import { useState } from 'react'
import { Category } from '@/lib/supabase'

interface CategoriesTabProps {
  categories: Category[]
  onAddCategory: (category: Omit<Category, 'id' | 'created_at'>) => void
  onDeleteCategory: (categoryId: string, categoryName: string) => void
}

export default function CategoriesTab({ categories, onAddCategory, onDeleteCategory }: CategoriesTabProps) {
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id' | 'created_at'>>({
    name: '',
    description: '',
    is_veg: false,
    cuisine_type: 'general'
  })

  const cuisineTypes = [
    'general', 'chinese', 'desi', 'italian', 'drinks', 'desserts', 'fast-food', 'healthy'
  ]

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return
    onAddCategory(newCategory)
    setNewCategory({ name: '', description: '', is_veg: false, cuisine_type: 'general' })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="maritime-card p-6 sticky top-6">
          <h2 className="text-xl font-display font-bold text-gray-800 mb-6">Add New Category</h2>
          
          <div className="space-y-4">
            <input
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              className="input-modern"
            />
            
            <textarea
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              className="input-modern h-20 resize-none"
            />
            
            <select
              value={newCategory.cuisine_type}
              onChange={(e) => setNewCategory({...newCategory, cuisine_type: e.target.value})}
              className="input-modern"
            >
              {cuisineTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newCategory.is_veg}
                onChange={(e) => setNewCategory({...newCategory, is_veg: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm font-medium">🥬 Vegetarian</span>
            </label>

            <button 
              onClick={handleAddCategory} 
              disabled={!newCategory.name.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-6">Categories ({categories.length})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(category => (
            <div key={category.id} className="maritime-card p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-display font-bold text-lg text-gray-800">{category.name}</h3>
                <div className="flex gap-2">
                  {category.is_veg && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      🥬 Veg
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    {category.cuisine_type}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => onDeleteCategory(category.id, category.name)}
                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}