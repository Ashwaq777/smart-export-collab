import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const formatMoney = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '--'
  return `$${Math.round(n).toLocaleString('en-US')}`
}

const safeText = (v) => {
  if (v === null || v === undefined) return '--'
  const s = String(v)
  return s.length ? s : '--'
}

export const generateMaritimeShippingPdf = (payload) => {
  const {
    originPort,
    destinationPort,
    distanceNm,
    weightTonnes,
    incoterm,
    cargoCategory,
    containerType,
    shipping,
    recommendation,
  } = payload || {}

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  const title = 'Maritime Shipping Report'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title, 40, 48)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 66)

  doc.setDrawColor(30, 58, 138)
  doc.setLineWidth(2)
  doc.line(40, 76, pageWidth - 40, 76)

  autoTable(doc, {
    startY: 92,
    theme: 'grid',
    head: [['Section', 'Value']],
    body: [
      ['Origin country', safeText(originPort?.pays || originPort?.country)],
      ['Origin port', safeText(originPort?.nomPort || originPort?.name)],
      ['Destination country', safeText(destinationPort?.pays || destinationPort?.country)],
      ['Destination port', safeText(destinationPort?.nomPort || destinationPort?.name)],
      ['Distance (NM)', safeText(distanceNm)],
      ['Weight (tonnes)', safeText(weightTonnes)],
      ['Container', safeText(containerType ? `${containerType} ft` : '')],
      ['Cargo category', safeText(cargoCategory)],
      ['Incoterm', safeText(incoterm)],
    ],
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [30, 58, 138] },
    columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 'auto' } },
  })

  const estimateStartY = (doc.lastAutoTable?.finalY || 92) + 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Cost breakdown (estimate)', 40, estimateStartY)

  autoTable(doc, {
    startY: estimateStartY + 10,
    theme: 'grid',
    head: [['Item', 'Amount']],
    body: [
      ['Base shipping', formatMoney(shipping?.baseShippingCost)],
      ['Origin port fees', formatMoney(shipping?.originPortFees)],
      ['Destination port fees', formatMoney(shipping?.destPortFees)],
      ['Total', formatMoney(shipping?.totalCost)],
    ],
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [5, 150, 105] },
    columnStyles: { 0: { cellWidth: 220 }, 1: { cellWidth: 120, halign: 'right' } },
  })

  const recStartY = (doc.lastAutoTable?.finalY || estimateStartY) + 22
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Recommendation', 40, recStartY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Level: ${safeText(recommendation?.level)}`, 40, recStartY + 16)

  const recText = safeText(recommendation?.text)
  const wrapped = doc.splitTextToSize(`Comment: ${recText}`, pageWidth - 80)
  doc.text(wrapped, 40, recStartY + 32)

  doc.save(`maritime-shipping-${Date.now()}.pdf`)
}
