import { useEffect, useState } from 'react'
import { supabase, Order } from './supabase'

export const useOrderStatus = (customerPhone: string) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showBillNotification, setShowBillNotification] = useState(false)

  useEffect(() => {
    if (!customerPhone) return

    // Initial fetch
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false })
      
      setOrders(data || [])
      setLoading(false)
    }

    fetchOrders()

    // Set up real-time subscription
    const subscription = supabase
      .channel('order_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_phone=eq.${customerPhone}`
        },
        (payload) => {
          const updatedOrder = payload.new as Order
          
          // Update orders state
          setOrders(prev => 
            prev.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            )
          )

          // Auto-download bill if payment approved
          if (updatedOrder.status === 'approved' && updatedOrder.final_amount) {
            downloadBill(updatedOrder.id)
            setShowBillNotification(true)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [customerPhone])

  const downloadBill = async (orderId: string) => {
    try {
      const response = await fetch(`/api/bill?orderId=${orderId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `SeaTale_Bill_${new Date().toISOString().slice(0, 10)}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Sea Tale Restaurant', {
            body: 'Your bill has been downloaded successfully! 🧾',
            icon: '/logo.jpg'
          })
        }
      }
    } catch (error) {
      console.error('Error downloading bill:', error)
    }
  }

  return { 
    orders, 
    loading, 
    downloadBill, 
    showBillNotification, 
    setShowBillNotification 
  }
}