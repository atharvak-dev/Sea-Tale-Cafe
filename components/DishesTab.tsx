'use client'
import { useState } from 'react'
import { Dish, Category } from '@/lib/supabase'

interface DishesTabProps {
  dishes: Dish[]
  categories: Category[]
  onAddDish: (dish: Omit<Dish, 'id' | 'created_at'>) => void
  onUpdateDishTags: (dishId: string, tags: string[]) => void
  onDeleteDish: (dishId: string, dishName: string) => void
  onAddCategory: (category: Omit<Category, 'id' | 'created_at'>) => void
  onDeleteCategory: (categoryId: string, categoryName: string) => void
  onUpdateCategory: (categoryId: string, category: Omit<Category, 'id' | 'created_at'>) => void
}

export default function DishesTab({ 
  dishes, 
  categories, 
  onAddDish, 
  onUpdateDishTags, 
  onDeleteDish,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory
}: DishesTabProps) {
  const [newDish, setNewDish] = useState<Omit<Dish, 'id' | 'created_at'>>({ 
    name: '', description: '', price: 0, is_spicy: false, tags: [], image_url: '', category_id: '' 
  })
  const [customTag, setCustomTag] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id' | 'created_at'>>({ 
    name: '', description: '', is_veg: false, cuisine_type: 'general' 
  })

  const quickTags = ['Best Seller', 'Chef Recommended', 'New', 'Popular', 'Signature']
  const cuisineTypes = ['general', 'chinese', 'desi', 'italian', 'drinks', 'desserts', 'fast-food', 'healthy']

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setImagePreview(base64)
        setNewDish({...newDish, image_url: base64})
      }
      reader.readAsDataURL(file)
    }
  }

  const addQuickTag = (tag: string) => {
    if (!newDish.tags.includes(tag)) {
      setNewDish({...newDish, tags: [...newDish.tags, tag]})
    }
  }

  const addCustomTag = () => {
    if (customTag.trim() && !newDish.tags.includes(customTag.trim())) {
      setNewDish({...newDish, tags: [...newDish.tags, customTag.trim()]})
      setCustomTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewDish({...newDish, tags: newDish.tags.filter(tag => tag !== tagToRemove)})
  }

  const handleAddDish = () => {
    if (!newDish.name || !newDish.price || !newDish.category_id) return
    onAddDish(newDish)
    setNewDish({ name: '', description: '', price: 0, is_spicy: false, tags: [], image_url: '', category_id: '' })
    setImagePreview('')
  }

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return
    onAddCategory(newCategory)
    setNewCategory({ name: '', description: '', is_veg: false, cuisine_type: 'general' })
    setShowAddCategory(false)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      description: category.description,
      is_veg: category.is_veg,
      cuisine_type: category.cuisine_type
    })
    setShowAddCategory(true)
  }

  const handleUpdateCategory = () => {
    if (!newCategory.name.trim() || !editingCategory) return
    onUpdateCategory(editingCategory.id, newCategory)
    setNewCategory({ name: '', description: '', is_veg: false, cuisine_type: 'general' })
    setEditingCategory(null)
    setShowAddCategory(false)
  }

  const filteredDishes = selectedCategory 
    ? dishes.filter(dish => dish.category_id === selectedCategory)
    : dishes

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="maritime-card p-6 sticky top-6">
          <h2 className="text-xl font-display font-bold text-gray-800 mb-6">Add New Dish</h2>
          
          <div className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={newDish.category_id}
                  onChange={(e) => setNewDish({...newDish, category_id: e.target.value})}
                  className="input-modern flex-1"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.cuisine_type}) {cat.is_veg ? '🥬' : '🍖'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  + Category
                </button>
              </div>
              {!newDish.category_id && (
                <p className="text-red-500 text-sm">Please select a category to add the dish</p>
              )}
            </div>

            {/* Dish Image */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dish Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-ocean-500 transition-colors relative">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                    <button
                      onClick={() => {
                        setImagePreview('')
                        setNewDish({...newDish, image_url: ''})
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-sm">Click to upload image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <input
              placeholder="Dish name"
              value={newDish.name}
              onChange={(e) => setNewDish({...newDish, name: e.target.value})}
              className="input-modern"
            />
            
            <input
              type="number"
              placeholder="Price"
              value={newDish.price || ''}
              onChange={(e) => setNewDish({...newDish, price: Number(e.target.value)})}
              className="input-modern"
            />
            
            <textarea
              placeholder="Description"
              value={newDish.description}
              onChange={(e) => setNewDish({...newDish, description: e.target.value})}
              className="input-modern h-20 resize-none"
            />
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newDish.is_spicy}
                onChange={(e) => setNewDish({...newDish, is_spicy: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm font-medium">🌶️ Spicy</span>
            </label>

            {/* Quick Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => addQuickTag(tag)}
                    disabled={newDish.tags.includes(tag)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      newDish.tags.includes(tag)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-ocean-100 hover:text-ocean-700'
                    }`}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  placeholder="Add custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  className="input-modern flex-1 text-sm"
                />
                <button onClick={addCustomTag} className="bg-ocean-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-ocean-700">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newDish.tags.map(tag => (
                  <span key={tag} className="bg-coral-100 text-coral-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-coral-500 hover:text-coral-700">×</button>
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAddDish} 
              disabled={!newDish.name || !newDish.price || !newDish.category_id}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Dish
            </button>
          </div>
        </div>

        {/* Add/Edit Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
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
                  <span className="text-sm font-medium">🥬 Vegetarian Category</span>
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddCategory(false)
                      setEditingCategory(null)
                      setNewCategory({ name: '', description: '', is_veg: false, cuisine_type: 'general' })
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                    disabled={!newCategory.name.trim()}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        {/* Categories Management */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Manage Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <span>
                  {category.cuisine_type === 'chinese' && '🥢'}
                  {category.cuisine_type === 'desi' && '🍛'}
                  {category.cuisine_type === 'italian' && '🍝'}
                  {category.cuisine_type === 'drinks' && '🥤'}
                  {category.cuisine_type === 'desserts' && '🍰'}
                  {!['chinese', 'desi', 'italian', 'drinks', 'desserts'].includes(category.cuisine_type) && '🍽️'}
                </span>
                <span className="text-sm font-medium">{category.name}</span>
                {category.is_veg ? (
                  <span className="text-xs bg-green-100 text-green-700 px-1 rounded">🥬</span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-1 rounded">🍖</span>
                )}
                <button
                  onClick={() => handleEditCategory(category)}
                  className="text-blue-500 hover:text-blue-700 text-xs ml-1"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteCategory(category.id, category.name)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-800">Menu Items ({filteredDishes.length})</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-modern w-48"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDishes.map(dish => {
            const category = categories.find(c => c.id === dish.category_id)
            return (
              <div key={dish.id} className="maritime-card overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  {dish.image_url ? (
                    <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  {dish.is_spicy && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      🌶️ Spicy
                    </span>
                  )}
                  {category && (
                    <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs ${
                      category.is_veg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {category.is_veg ? '🥬 Veg' : '🍖 Non-Veg'}
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-display font-bold text-lg text-gray-800 mb-2">{dish.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dish.description}</p>
                  <p className="text-2xl font-bold text-ocean-700 mb-3">${dish.price}</p>
                  
                  {category && (
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mb-2">
                      {category.name}
                    </span>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {dish.tags.map(tag => (
                      <span key={tag} className="bg-coral-100 text-coral-700 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {!dish.tags.includes('Best Seller') && (
                        <button
                          onClick={() => onUpdateDishTags(dish.id, [...dish.tags, 'Best Seller'])}
                          className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                        >
                          + Best Seller
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteDish(dish.id, dish.name)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}