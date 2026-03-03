import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = {
  NAVY_DEEP: [10, 35, 66],
  OCEAN_BLUE: [0, 90, 156],
  WAVE_BLUE: [0, 164, 204],
  SEAFOAM: [224, 247, 250],
  GOLD_ACCENT: [212, 160, 23],
  WHITE: [255, 255, 255],
  LIGHT_ROW: [240, 248, 255],
  TEXT_MAIN: [15, 23, 42],
  TEXT_MUTED: [100, 116, 139],
}

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

const formatDateTime = (d = new Date()) => {
  try {
    return d.toLocaleString('fr-FR')
  } catch {
    return d.toLocaleString()
  }
}

const makeRef = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = now.getFullYear()
  const mm = pad(now.getMonth() + 1)
  const dd = pad(now.getDate())
  const hh = pad(now.getHours())
  const mi = pad(now.getMinutes())
  const rnd = Math.random().toString(16).slice(2, 10).toUpperCase()
  return `REF-MAR-${yyyy}${mm}${dd}-${hh}${mi}-${rnd}`
}

const fitTextToWidth = ({ doc, text, maxWidth, initialFontSize = 14, minFontSize = 10 }) => {
  let size = initialFontSize
  doc.setFontSize(size)
  while (size > minFontSize && doc.getTextWidth(String(text)) > maxWidth) {
    size -= 0.5
    doc.setFontSize(size)
  }
  return size
}

const addCoverPage = ({ doc, pageWidth, pageHeight, meta }) => {
  doc.setFillColor(...COLORS.NAVY_DEEP)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.WHITE)
  doc.setFontSize(32)
  doc.text('SMART EXPORT', pageWidth / 2, 120, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.SEAFOAM)
  doc.setFontSize(14)
  doc.text('Global Maritime Trade', pageWidth / 2, 145, { align: 'center' })

  doc.setDrawColor(...COLORS.WAVE_BLUE)
  doc.setLineWidth(2)
  doc.line(80, 170, pageWidth - 80, 170)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.WHITE)
  doc.setFontSize(24)
  doc.text('RAPPORT DE TRANSPORT MARITIME', pageWidth / 2, 230, { align: 'center' })

  doc.setFillColor(...COLORS.OCEAN_BLUE)
  const cardX = 70
  const cardY = 270
  const cardW = pageWidth - 140
  const cardH = 60
  doc.roundedRect(cardX, cardY, cardW, cardH, 10, 10, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.WHITE)
  doc.setFontSize(14)
  const route = `${safeText(meta.originPort)}  >  ${safeText(meta.destinationPort)}`
  fitTextToWidth({ doc, text: route, maxWidth: cardW - 20, initialFontSize: 14, minFontSize: 10 })
  doc.text(route, pageWidth / 2, cardY + 35, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.SEAFOAM)
  doc.setFontSize(11)
  const lines = [
    `Pays départ: ${safeText(meta.originCountry)}        Pays destination: ${safeText(meta.destinationCountry)}`,
    `Distance: ${safeText(meta.distanceNm)} milles nautiques`,
    `Conteneur: ${safeText(meta.container)}   |   Poids: ${safeText(meta.weightTonnes)} T   |   Incoterm: ${safeText(meta.incoterm)}`,
  ]
  doc.text(lines, 70, 380)

  doc.setTextColor(...COLORS.SEAFOAM)
  doc.setFontSize(10)
  doc.text(`Généré le : ${safeText(meta.generatedAt)}`, 70, pageHeight - 90)
  doc.text(`Réf : ${safeText(meta.ref)}`, 70, pageHeight - 72)

  doc.setFillColor(...COLORS.GOLD_ACCENT)
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F')
}

const addHeaderFooter = ({ doc, pageWidth, pageHeight, meta }) => {
  const pageNumber = doc.getCurrentPageInfo?.().pageNumber || 1
  if (pageNumber === 1) return

  doc.setFillColor(...COLORS.NAVY_DEEP)
  doc.rect(0, 0, pageWidth, 52, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.WHITE)
  doc.setFontSize(11)
  doc.text('SMART EXPORT', 40, 32)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.SEAFOAM)
  doc.setFontSize(10)
  doc.text('Maritime Report', pageWidth - 40, 32, { align: 'right' })

  doc.setDrawColor(...COLORS.GOLD_ACCENT)
  doc.setLineWidth(2)
  doc.line(0, 52, pageWidth, 52)

  doc.setDrawColor(...COLORS.WAVE_BLUE)
  doc.setLineWidth(1)
  doc.line(40, pageHeight - 50, pageWidth - 40, pageHeight - 50)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.TEXT_MUTED)
  doc.setFontSize(9)

  let totalPagesText = ''
  if (typeof doc.putTotalPages === 'function') {
    totalPagesText = ` / ${safeText(meta.totalPagesPlaceholder)}`
  }
  doc.text(`Smart Export © 2026 | Page ${pageNumber}${totalPagesText} | Réf: ${safeText(meta.ref)}`, 40, pageHeight - 32)
  doc.text('Estimations indicatives — données susceptibles de varier selon opérateur, saison et disponibilité.', 40, pageHeight - 18)
}

const addSectionTitle = ({ doc, x = 40, y, width, title, icon }) => {
  const iconW = 26
  const barH = 22

  doc.setFillColor(...COLORS.OCEAN_BLUE)
  doc.roundedRect(x, y, iconW, barH, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.WHITE)
  doc.setFontSize(11)
  doc.text(String(icon || ''), x + iconW / 2, y + 15, { align: 'center' })

  doc.setFillColor(...COLORS.SEAFOAM)
  doc.roundedRect(x + iconW + 8, y, width - iconW - 8, barH, 4, 4, 'F')
  doc.setDrawColor(...COLORS.OCEAN_BLUE)
  doc.setLineWidth(2)
  doc.line(x + iconW + 8, y, x + iconW + 8, y + barH)

  doc.setTextColor(...COLORS.NAVY_DEEP)
  doc.setFontSize(11)
  doc.text(String(title || ''), x + iconW + 18, y + 15)

  return y + barH
}

const addRecommendedCard = ({ doc, x = 40, y, width, shipping, recommendation, incoterm }) => {
  const cardW = width
  const cardX = x

  doc.setDrawColor(...COLORS.WAVE_BLUE)
  doc.setLineWidth(2)
  doc.roundedRect(cardX, y, cardW, 190, 10, 10, 'S')

  doc.setFillColor(...COLORS.OCEAN_BLUE)
  doc.roundedRect(cardX, y, cardW, 34, 10, 10, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.WHITE)
  doc.setFontSize(12)
  doc.text('OPTION RECOMMANDÉE', cardX + 14, y + 22)

  const rows = [
    ['Incoterm', safeText(incoterm)],
    ['Base shipping', formatMoney(shipping?.baseShippingCost)],
    ['Origin port fees', formatMoney(shipping?.originPortFees)],
    ['Destination port fees', formatMoney(shipping?.destPortFees)],
    ['Total estimé', formatMoney(shipping?.totalCost)],
  ]

  let cy = y + 48
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  rows.forEach(([k, v], idx) => {
    const alt = idx % 2 === 0
    doc.setFillColor(...(alt ? COLORS.LIGHT_ROW : COLORS.WHITE))
    doc.rect(cardX + 2, cy - 14, cardW - 4, 22, 'F')

    doc.setTextColor(...COLORS.TEXT_MUTED)
    doc.text(String(k), cardX + 14, cy)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.TEXT_MAIN)
    doc.text(String(v), cardX + cardW - 14, cy, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    cy += 22
  })

  doc.setTextColor(...COLORS.TEXT_MAIN)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(`Niveau: ${safeText(recommendation?.level)}`, cardX + 14, y + 170)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.TEXT_MUTED)
  const rec = safeText(recommendation?.text)
  const wrapped = doc.splitTextToSize(rec, cardW - 28)
  doc.text(wrapped, cardX + 14, y + 186)

  return y + 200
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
  const pageHeight = doc.internal.pageSize.getHeight()

  const ref = makeRef()
  const generatedAt = formatDateTime(new Date())
  const meta = {
    ref,
    generatedAt,
    totalPagesPlaceholder: '{total_pages}',
    originCountry: originPort?.pays || originPort?.country,
    originPort: originPort?.nomPort || originPort?.name,
    destinationCountry: destinationPort?.pays || destinationPort?.country,
    destinationPort: destinationPort?.nomPort || destinationPort?.name,
    distanceNm,
    weightTonnes,
    container: containerType ? `${containerType} ft` : '',
    incoterm,
  }

  addCoverPage({ doc, pageWidth, pageHeight, meta })

  doc.addPage()

  const tableCommon = {
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: COLORS.TEXT_MAIN,
      cellPadding: 7,
      lineColor: [220, 230, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: COLORS.OCEAN_BLUE,
      textColor: COLORS.WHITE,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: COLORS.LIGHT_ROW,
    },
    didDrawPage: () => addHeaderFooter({ doc, pageWidth, pageHeight, meta }),
    margin: { top: 80, left: 40, right: 40, bottom: 60 },
  }

  let y = 86
  y = addSectionTitle({ doc, y, width: pageWidth - 80, title: 'RÉSUMÉ DU TRAJET', icon: '🗺' }) + 12

  autoTable(doc, {
    ...tableCommon,
    startY: y,
    head: [['Élément', 'Valeur']],
    body: [
      ['Port départ', safeText(meta.originPort)],
      ['Pays départ', safeText(meta.originCountry)],
      ['Port destination', safeText(meta.destinationPort)],
      ['Pays destination', safeText(meta.destinationCountry)],
      ['Distance (NM)', safeText(distanceNm)],
      ['Poids (tonnes)', safeText(weightTonnes)],
      ['Conteneur', safeText(meta.container)],
      ['Catégorie cargo', safeText(cargoCategory)],
      ['Incoterm', safeText(incoterm)],
    ],
    columnStyles: { 0: { cellWidth: 200 }, 1: { cellWidth: 'auto' } },
  })

  y = (doc.lastAutoTable?.finalY || y) + 18
  y = addSectionTitle({ doc, y, width: pageWidth - 80, title: 'COMPARATIF DES COÛTS (ESTIMATION)', icon: '⚖' }) + 12

  autoTable(doc, {
    ...tableCommon,
    startY: y,
    head: [['Poste', 'Montant']],
    body: [
      ['Base shipping', formatMoney(shipping?.baseShippingCost)],
      ['Origin port fees', formatMoney(shipping?.originPortFees)],
      ['Destination port fees', formatMoney(shipping?.destPortFees)],
      ['Total', formatMoney(shipping?.totalCost)],
    ],
    columnStyles: { 0: { cellWidth: 260 }, 1: { cellWidth: 140, halign: 'right' } },
  })

  y = (doc.lastAutoTable?.finalY || y) + 18
  y = addSectionTitle({ doc, y, width: pageWidth - 80, title: 'OPTION RECOMMANDÉE', icon: '⭐' }) + 12

  y = addRecommendedCard({
    doc,
    y,
    width: pageWidth - 80,
    shipping,
    recommendation,
    incoterm,
  })

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(meta.totalPagesPlaceholder)
  }

  doc.save(`maritime-shipping-${Date.now()}.pdf`)
}
