'use client'
import { useState } from 'react'
import { Event } from '@/lib/supabase'

interface EventsTabProps {
  events: Event[]
  onAddEvent: (event: Omit<Event, 'id' | 'created_at'>) => void
  onToggleEvent: (eventId: string, isActive: boolean) => void
  onDeleteEvent: (eventId: string, eventTitle: string) => void
}

export default function EventsTab({ events, onAddEvent, onToggleEvent, onDeleteEvent }: EventsTabProps) {
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'created_at'>>({
    title: '',
    description: '',
    event_date: '',
    is_active: true
  })

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.event_date) return
    onAddEvent(newEvent)
    setNewEvent({ title: '', description: '', event_date: '', is_active: true })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="maritime-card p-6 sticky top-6">
          <h2 className="text-xl font-display font-bold text-gray-800 mb-6">Add New Event</h2>
          
          <div className="space-y-4">
            <input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              className="input-modern"
            />
            
            <textarea
              placeholder="Event description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              className="input-modern h-20 resize-none"
            />
            
            <input
              type="date"
              value={newEvent.event_date}
              onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
              className="input-modern"
            />
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newEvent.is_active}
                onChange={(e) => setNewEvent({...newEvent, is_active: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm font-medium">🎉 Active Event</span>
            </label>

            <button 
              onClick={handleAddEvent} 
              disabled={!newEvent.title.trim() || !newEvent.event_date}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Event
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-6">Events ({events.length})</h2>
        
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="maritime-card p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                  <p className="text-sm text-ocean-600">
                    📅 {new Date(event.event_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {event.is_active ? '🎉 Active' : '⏸️ Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onToggleEvent(event.id, !event.is_active)}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    event.is_active
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {event.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onDeleteEvent(event.id, event.title)}
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