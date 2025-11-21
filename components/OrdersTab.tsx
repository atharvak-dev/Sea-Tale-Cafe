'use client'
import { Order, Table, Dish, TaxConfig } from '@/lib/supabase'

interface OrdersTabProps {
  orders: Order[]
  tables: Table[]
  dishes: Dish[]
  taxes: TaxConfig[]
  onApproveTableOrders: (tableId: string, orders: Order[], total: number, tax: number, final: number) => void
  onRemoveDishFromOrder: (orderId: string, dishIndex: number) => void
}

export default function OrdersTab({ 
  orders, 
  tables, 
  dishes, 
  taxes, 
  onApproveTableOrders, 
  onRemoveDishFromOrder 
}: OrdersTabProps) {
  const calculateTaxAndTotal = (baseAmount: number) => {
    const taxAmount = taxes.reduce((sum, tax) => sum + (baseAmount * tax.percentage / 100), 0)
    return { taxAmount, finalAmount: baseAmount + taxAmount }
  }

  const tableOrders = orders
    .filter(o => o.status === 'pending')
    .reduce((acc, order) => {
      const tableId = order.table_id
      if (!acc[tableId]) acc[tableId] = []
      acc[tableId].push(order)
      return acc
    }, {} as Record<string, Order[]>)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-gray-800">Table Orders</h2>
      {Object.entries(tableOrders).map(([tableId, tableOrderList]: [string, Order[]]) => {
        const table = tables.find(t => t.id === tableId)
        const totalAmount = tableOrderList.reduce((sum: number, order: Order) => sum + order.total_amount, 0)
        const { taxAmount, finalAmount } = calculateTaxAndTotal(totalAmount)

        return (
          <div key={tableId} className="maritime-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-display font-bold text-ocean-900">
                  🍽️ Table {table?.number || tableId}
                </h3>
                <p className="text-gray-600">📞 {tableOrderList[0]?.customer_phone}</p>
                <p className="text-sm text-gray-500">{tableOrderList.length} order(s)</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-ocean-700">${finalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total with tax</p>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              {tableOrderList.map((order: Order, orderIndex: number) => (
                <div key={order.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-800">Order #{orderIndex + 1}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item: any, itemIndex: number) => {
                      const dish = dishes.find(d => d.id === item.dish_id)
                      return (
                        <div key={itemIndex} className="flex justify-between items-center">
                          <span className="text-sm">
                            {dish?.name} x{item.quantity} - ${((dish?.price || 0) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemoveDishFromOrder(order.id, itemIndex)}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-4 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-blue-800">Bill Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                {taxes.map(tax => (
                  <div key={tax.id} className="flex justify-between text-sm text-gray-600">
                    <span>{tax.name} ({tax.percentage}%):</span>
                    <span>${((totalAmount * tax.percentage) / 100).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Final Total:</span>
                  <span className="text-ocean-700">${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onApproveTableOrders(tableId, tableOrderList, totalAmount, taxAmount, finalAmount)}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              💳 Approve & Send Combined Bill (${finalAmount.toFixed(2)})
            </button>
          </div>
        )
      })}
    </div>
  )
}