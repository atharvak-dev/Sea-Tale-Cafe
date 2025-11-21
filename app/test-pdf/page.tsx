'use client'
import { useState } from 'react'
import { downloadBill, BillData } from '@/lib/pdfGenerator'

export default function TestPDFPage() {
  const [loading, setLoading] = useState(false)

  const generateTestBill = () => {
    setLoading(true)

    // Mock data for testing
    const testBillData: BillData = {
      order: {
        id: 'test-order-12345678',
        table_id: 'table-1',
        customer_phone: '+1234567890',
        items: [
          {
            dish_id: '1',
            quantity: 2,
            dish_name: 'Grilled Salmon',
            dish_price: 24.99
          },
          {
            dish_id: '2',
            quantity: 1,
            dish_name: 'Caesar Salad',
            dish_price: 12.50
          },
          {
            dish_id: '3',
            quantity: 3,
            dish_name: 'Fish & Chips',
            dish_price: 18.75
          }
        ],
        total_amount: 118.73,
        bill_amount: 118.73,
        tax_amount: 21.37,
        final_amount: 140.10,
        status: 'approved',
        created_at: new Date().toISOString()
      },
      dishes: [
        {
          id: '1',
          name: 'Grilled Salmon',
          description: 'Fresh Atlantic salmon grilled to perfection',
          price: 24.99,
          image_url: '',
          is_spicy: false,
          is_veg: false,
          tags: ['Best Seller'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Caesar Salad',
          description: 'Classic Caesar salad with croutons',
          price: 12.50,
          image_url: '',
          is_spicy: false,
          is_veg: true,
          tags: ['Vegetarian'],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Fish & Chips',
          description: 'Traditional British fish and chips',
          price: 18.75,
          image_url: '',
          is_spicy: false,
          is_veg: false,
          tags: [],
          created_at: new Date().toISOString()
        }
      ],
      table: {
        id: 'table-1',
        number: 'T5',
        qr_code: '',
        created_at: new Date().toISOString()
      },
      taxes: [
        {
          id: 'tax-1',
          name: 'CGST',
          percentage: 9.00,
          is_active: true
        },
        {
          id: 'tax-2',
          name: 'SGST',
          percentage: 9.00,
          is_active: true
        }
      ],
      restaurantPhone: '+1-555-SEA-TALE'
    }

    try {
      downloadBill(testBillData)
      alert('Test PDF generated successfully! Check your downloads folder.')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-display font-bold text-gray-800 mb-6 text-center">
            🧾 PDF Bill Generator Test
          </h1>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-semibold text-blue-800 mb-2">Test Bill Details:</h2>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Table: T5</li>
                <li>• Customer: +1234567890</li>
                <li>• Items: Grilled Salmon (x2), Caesar Salad (x1), Fish & Chips (x3)</li>
                <li>• Subtotal: $118.73</li>
                <li>• Tax (CGST + SGST): $21.37</li>
                <li>• Total: $140.10</li>
              </ul>
            </div>

            <button
              onClick={generateTestBill}
              disabled={loading}
              className="w-full bg-ocean-600 text-white px-6 py-4 rounded-xl hover:bg-ocean-700 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating PDF...' : '📄 Generate Test Bill PDF'}
            </button>

            <div className="text-center text-sm text-gray-600">
              <p>This will download a sample restaurant bill in PDF format</p>
              <p>with professional formatting and tax calculations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}