import jsPDF from 'jspdf'
import { Order, Dish, Table, TaxConfig } from './supabase'

export interface BillData {
  order: Order
  dishes: Dish[]
  table: Table
  taxes: TaxConfig[]
  restaurantPhone: string
  gstin?: string
}

// Convert number to words for GST compliance
const convertToWords = (amount: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const thousands = ['', 'Thousand', 'Lakh', 'Crore']

  if (amount === 0) return 'Zero'

  const convertHundreds = (num: number): string => {
    let result = ''
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred '
      num %= 100
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' '
      num %= 10
    } else if (num >= 10) {
      result += teens[num - 10] + ' '
      return result
    }
    if (num > 0) {
      result += ones[num] + ' '
    }
    return result
  }

  let integerPart = Math.floor(amount)
  let result = ''
  let thousandIndex = 0

  while (integerPart > 0) {
    const chunk = integerPart % (thousandIndex === 0 ? 1000 : 100)
    if (chunk !== 0) {
      result = convertHundreds(chunk) + thousands[thousandIndex] + ' ' + result
    }
    integerPart = Math.floor(integerPart / (thousandIndex === 0 ? 1000 : 100))
    thousandIndex++
  }

  return result.trim()
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
  doc.text(`GSTIN: ${billData.gstin || '29ABCDE1234F1Z5'}`, 105, 42, { align: 'center' })

  // Bill Details - Indian GST Compliance
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(220, 38, 127) // Coral color
  doc.text('TAX INVOICE', 105, 55, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  
  // GST Compliance Note
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('(As per GST Rules)', 105, 60, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // Order Info in two columns - GST Compliant
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Left column
  doc.text(`Invoice No: ST${order.id.slice(-8).toUpperCase()}`, 20, 70)
  doc.text(`Table: ${table.number}`, 20, 77)
  doc.text(`Customer: ${order.customer_phone}`, 20, 84)
  doc.text(`Place of Supply: Karnataka`, 20, 91)

  // Right column
  const orderDate = new Date(order.created_at)
  doc.text(`Date: ${orderDate.toLocaleDateString('en-IN')}`, 120, 70)
  doc.text(`Time: ${orderDate.toLocaleTimeString('en-IN')}`, 120, 77)
  doc.text(`Status: ${order.status.toUpperCase()}`, 120, 84)
  doc.text(`Payment Mode: Cash/UPI`, 120, 91)

  // Line separator
  doc.setDrawColor(0, 105, 199)
  doc.setLineWidth(0.8)
  doc.line(20, 98, 190, 98)

  // Items Header with background - GST Compliant
  doc.setFillColor(240, 248, 255) // Light blue background
  doc.rect(20, 103, 170, 10, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('S.No', 22, 108)
  doc.text('ITEM DESCRIPTION', 35, 108)
  doc.text('HSN', 100, 108)
  doc.text('QTY', 120, 108)
  doc.text('RATE (₹)', 135, 108)
  doc.text('AMOUNT (₹)', 165, 108)

  doc.setDrawColor(0, 105, 199)
  doc.line(20, 113, 190, 113)

  // Items - GST Compliant
  let yPos = 125
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  order.items.forEach((item, index) => {
    const dish = dishes.find(d => d.id === item.dish_id)
    const dishName = dish?.name || item.dish_name || 'Unknown Item'
    const dishPrice = dish?.price || item.dish_price || 0
    const amount = dishPrice * item.quantity

    // Serial number
    doc.text((index + 1).toString(), 24, yPos)
    
    // Wrap long dish names
    const splitName = doc.splitTextToSize(dishName, 60)
    doc.text(splitName, 37, yPos)
    
    // HSN Code (Food items)
    doc.text('9958', 102, yPos)
    
    doc.text(item.quantity.toString(), 125, yPos)
    doc.text(`${dishPrice.toFixed(2)}`, 140, yPos)
    doc.text(`${amount.toFixed(2)}`, 170, yPos)

    yPos += Math.max(splitName.length * 5, 8) + 2
  })

  // Subtotal line
  yPos += 8
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(20, yPos, 190, yPos)
  yPos += 12

  // GST Calculations
  const subtotal = order.total_amount || 0
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Taxable Amount
  doc.text('Taxable Amount:', 130, yPos)
  doc.text(`₹${subtotal.toFixed(2)}`, 170, yPos)
  yPos += 7

  // GST Breakdown
  let totalTax = 0
  taxes.forEach(tax => {
    const taxAmount = (subtotal * tax.percentage) / 100
    totalTax += taxAmount
    
    // For GST compliance, split CGST and SGST if applicable
    if (tax.name.toLowerCase().includes('gst') && tax.percentage === 18) {
      const cgst = taxAmount / 2
      const sgst = taxAmount / 2
      doc.text(`CGST (9%):`, 130, yPos)
      doc.text(`₹${cgst.toFixed(2)}`, 170, yPos)
      yPos += 6
      doc.text(`SGST (9%):`, 130, yPos)
      doc.text(`₹${sgst.toFixed(2)}`, 170, yPos)
    } else {
      doc.text(`${tax.name} (${tax.percentage}%):`, 130, yPos)
      doc.text(`₹${taxAmount.toFixed(2)}`, 170, yPos)
    }
    yPos += 7
  })

  // Final Total with highlight - GST Compliant
  const finalAmount = order.final_amount || subtotal + totalTax
  yPos += 5

  // Total Tax Amount
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Total Tax Amount:', 130, yPos)
  doc.text(`₹${totalTax.toFixed(2)}`, 170, yPos)
  yPos += 10

  // Highlight box for total
  doc.setFillColor(0, 105, 199)
  doc.rect(125, yPos - 5, 65, 12, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL AMOUNT:', 130, yPos + 2)
  doc.text(`₹${finalAmount.toFixed(2)}`, 170, yPos + 2)
  doc.setTextColor(0, 0, 0)

  yPos += 15

  // Amount in Words (GST Requirement)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Amount in Words: ${convertToWords(finalAmount)} Rupees Only`, 20, yPos)
  yPos += 10

  // GST Declaration
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Declaration: We declare that this invoice shows the actual price of goods', 20, yPos)
  doc.text('described and that all particulars are true and correct.', 20, yPos + 5)
  yPos += 15

  // Footer with maritime theme
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
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 105, yPos + 5, { align: 'center' })

  return doc
}

export const downloadBill = (billData: BillData) => {
  const pdf = generateBillPDF(billData)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const fileName = `SeaTale_GST_Invoice_T${billData.table.number}_${timestamp}.pdf`
  pdf.save(fileName)
}

export const generateAndDownloadBill = async (orderId: string) => {
  try {
    const response = await fetch(`/api/bill?orderId=${orderId}`)
    if (!response.ok) throw new Error('Failed to generate bill')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SeaTale_GST_Invoice_${new Date().toISOString().slice(0, 10)}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error downloading bill:', error)
    return false
  }
}