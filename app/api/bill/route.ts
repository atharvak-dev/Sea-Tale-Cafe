import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateBillPDF } from '@/lib/pdfGenerator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Fetch related data
    const [dishesRes, tableRes, taxesRes, phoneRes, gstinRes] = await Promise.all([
      supabase.from('dishes').select('*'),
      supabase.from('tables').select('*').eq('id', order.table_id).single(),
      supabase.from('tax_config').select('*').eq('is_active', true),
      supabase.from('system_config').select('*').eq('key', 'restaurant_phone').single(),
      supabase.from('system_config').select('*').eq('key', 'gstin').single()
    ])

    const dishes = dishesRes.data || []
    const table = tableRes.data
    const taxes = taxesRes.data || []
    const restaurantPhone = phoneRes.data?.value || ''
    const gstin = gstinRes.data?.value || '29ABCDE1234F1Z5'

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    // Generate PDF
    const pdf = generateBillPDF({
      order,
      dishes,
      table,
      taxes,
      restaurantPhone,
      gstin
    })

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SeaTale_Bill_${table.number}_${new Date().toISOString().slice(0, 10)}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating bill:', error)
    return NextResponse.json({ error: 'Failed to generate bill' }, { status: 500 })
  }
}