import jsPDF from 'jspdf'
import { Order, Dish, Table, TaxConfig } from './supabase'

export interface BillData {
  order: Order
  dishes: Dish[]
  table: Table
  taxes: TaxConfig[]
  restaurantPhone: string
}

export const generateBillPDF = (billData: BillData): jsPDF => {
  const { order, dishes, table, taxes, restaurantPhone } = billData
  const doc = new jsPDF()
  
  // Restaurant Header with border
  doc.setDrawColor(0, 105, 199) // Ocean blue
  doc.setLineWidth(0.5)
  doc.rect(15, 10, 180, 35)
  
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 105, 199)
  doc.text('SEA TALE RESTAURANT', 105, 22, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text('🌊 Maritime Dining Experience 🌊', 105, 30, { align: 'center' })
  doc.text(`📞 Phone: ${restaurantPhone || 'Contact Restaurant'}`, 105, 37, { align: 'center' })
  doc.text('GSTIN: 29ABCDE1234F1Z5 (Sample)', 105, 42, { align: 'center' })
  
  // Bill Details
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(220, 38, 127) // Coral color
  doc.text('TAX INVOICE', 105, 55, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  
  // Order Info in two columns
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Left column
  doc.text(`Invoice No: ST${order.id.slice(-8).toUpperCase()}`, 20, 68)
  doc.text(`Table: ${table.number}`, 20, 75)
  doc.text(`Customer: ${order.customer_phone}`, 20, 82)
  
  // Right column
  const orderDate = new Date(order.created_at)
  doc.text(`Date: ${orderDate.toLocaleDateString()}`, 120, 68)
  doc.text(`Time: ${orderDate.toLocaleTimeString()}`, 120, 75)
  doc.text(`Status: ${order.status.toUpperCase()}`, 120, 82)
  
  // Line separator
  doc.setDrawColor(0, 105, 199)
  doc.setLineWidth(0.8)
  doc.line(20, 90, 190, 90)
  
  // Items Header with background
  doc.setFillColor(240, 248, 255) // Light blue background
  doc.rect(20, 95, 170, 8, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('ITEM DESCRIPTION', 22, 100)
  doc.text('QTY', 120, 100)
  doc.text('RATE ($)', 140, 100)
  doc.text('AMOUNT ($)', 165, 100)
  
  doc.setDrawColor(0, 105, 199)
  doc.line(20, 103, 190, 103)
  
  // Items
  let yPos = 115
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  
  order.items.forEach((item) => {
    const dish = dishes.find(d => d.id === item.dish_id)
    const dishName = dish?.name || item.dish_name || 'Unknown Item'
    const dishPrice = dish?.price || item.dish_price || 0
    const amount = dishPrice * item.quantity
    
    // Wrap long dish names
    const splitName = doc.splitTextToSize(dishName, 85)
    doc.text(splitName, 22, yPos)
    doc.text(item.quantity.toString(), 125, yPos)
    doc.text(`${dishPrice.toFixed(2)}`, 145, yPos)
    doc.text(`${amount.toFixed(2)}`, 170, yPos)
    
    yPos += Math.max(splitName.length * 6, 8) + 3
  })
  
  // Subtotal line
  yPos += 8
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(20, yPos, 190, yPos)
  yPos += 12
  
  // Calculations with better formatting
  const subtotal = order.total_amount || 0
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  doc.text('Subtotal:', 130, yPos)
  doc.text(`$${subtotal.toFixed(2)}`, 170, yPos)
  yPos += 8
  
  // Taxes
  let totalTax = 0
  taxes.forEach(tax => {
    const taxAmount = (subtotal * tax.percentage) / 100
    totalTax += taxAmount
    doc.text(`${tax.name} (${tax.percentage}%):`, 130, yPos)
    doc.text(`$${taxAmount.toFixed(2)}`, 170, yPos)
    yPos += 7
  })
  
  // Final Total with highlight
  const finalAmount = order.final_amount || subtotal + totalTax
  yPos += 5
  
  // Highlight box for total
  doc.setFillColor(0, 105, 199)
  doc.rect(125, yPos - 5, 65, 12, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('GRAND TOTAL:', 130, yPos + 2)
  doc.text(`$${finalAmount.toFixed(2)}`, 170, yPos + 2)
  doc.setTextColor(0, 0, 0)
  
  yPos += 15
  
  // Footer with maritime theme
  yPos += 15
  doc.setDrawColor(0, 105, 199)
  doc.setLineWidth(0.5)
  doc.line(20, yPos, 190, yPos)
  
  yPos += 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 105, 199)
  doc.text('🌊 Thank you for dining with Sea Tale! 🌊', 105, yPos, { align: 'center' })
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text('Visit us again for more maritime culinary adventures', 105, yPos + 8, { align: 'center' })
  doc.text('Follow us on social media @SeaTaleRestaurant', 105, yPos + 15, { align: 'center' })
  
  yPos += 25
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('This is a computer generated invoice. No signature required.', 105, yPos, { align: 'center' })
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 5, { align: 'center' })
  
  return doc
}

export const downloadBill = (billData: BillData) => {
  const pdf = generateBillPDF(billData)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const fileName = `SeaTale_Invoice_T${billData.table.number}_${timestamp}.pdf`
  pdf.save(fileName)
}