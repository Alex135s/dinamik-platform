import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// ── EXPORTAR PROYECTOS A PDF ─────────────────────────────
export function exportProjectsPDF(projects) {
  const doc = new jsPDF()

  // Header
  doc.setFillColor(249, 115, 22) // naranja
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DINAMIK DK GROUP SAC', 14, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Arquitectura, Ingeniería & Construcción', 14, 20)

  // Título
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Reporte de Proyectos', 14, 38)

  // Fecha
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })}`, 14, 45)
  doc.text(`Total: ${projects.length} proyectos`, 14, 51)

  // Tabla
  autoTable(doc, {
    startY: 57,
    head: [['Código', 'Nombre', 'Cliente', 'Servicio', 'Estado', 'Inicio']],
    body: projects.map(p => [
      p.projectCode || '-',
      p.name        || '-',
      p.client      || '-',
      p.serviceType || '-',
      p.status      || '-',
      p.startDate   || '-',
    ]),
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 45 },
      2: { cellWidth: 40 },
      3: { cellWidth: 25 },
      4: { cellWidth: 22 },
      5: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `DinamikPlatform · Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 8
    )
  }

  doc.save(`Proyectos_DINAMIK_${new Date().toISOString().slice(0,10)}.pdf`)
}

// ── EXPORTAR PROYECTOS A EXCEL ───────────────────────────
export function exportProjectsExcel(projects) {
  const data = projects.map(p => ({
    'Código':        p.projectCode || '',
    'Nombre':        p.name        || '',
    'Cliente':       p.client      || '',
    'Tipo Servicio': p.serviceType || '',
    'Estado':        p.status      || '',
    'Fecha Inicio':  p.startDate   || '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 14 },
    { wch: 40 },
    { wch: 35 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Proyectos')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(
    new Blob([buf], { type: 'application/octet-stream' }),
    `Proyectos_DINAMIK_${new Date().toISOString().slice(0,10)}.xlsx`
  )
}

// ── EXPORTAR DOCUMENTOS A PDF ────────────────────────────
export function exportDocumentsPDF(docs, projects) {
  const doc = new jsPDF()

  const getProjectName = (id) =>
    projects.find(p => p.id === id)?.name || 'Sin proyecto'

  // Header
  doc.setFillColor(249, 115, 22)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DINAMIK DK GROUP SAC', 14, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Arquitectura, Ingeniería & Construcción', 14, 20)

  // Título
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Reporte de Documentos', 14, 38)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })}`, 14, 45)
  doc.text(`Total: ${docs.length} documentos`, 14, 51)

  // Tabla
  autoTable(doc, {
    startY: 57,
    head: [['Nombre', 'Proyecto', 'Tipo', 'Estado', 'Subido']],
    body: docs.map(d => [
      d.name                  || '-',
      getProjectName(d.projectId),
      d.type                  || '-',
      d.enabled ? 'Habilitado' : 'Deshabilitado',
      d.uploadedAt
        ? new Date(d.uploadedAt).toLocaleDateString('es-PE')
        : '-',
    ]),
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 45 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  })

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `DinamikPlatform · Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 8
    )
  }

  doc.save(`Documentos_DINAMIK_${new Date().toISOString().slice(0,10)}.pdf`)
}

// ── EXPORTAR DOCUMENTOS A EXCEL ──────────────────────────
export function exportDocumentsExcel(docs, projects) {
  const getProjectName = (id) =>
    projects.find(p => p.id === id)?.name || 'Sin proyecto'

  const data = docs.map(d => ({
    'Nombre':    d.name || '',
    'Proyecto':  getProjectName(d.projectId),
    'Tipo':      d.type || '',
    'Estado':    d.enabled ? 'Habilitado' : 'Deshabilitado',
    'Subido':    d.uploadedAt
      ? new Date(d.uploadedAt).toLocaleDateString('es-PE')
      : '',
    'URL':       d.fileUrl || '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [
    { wch: 40 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 14 },
    { wch: 60 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Documentos')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(
    new Blob([buf], { type: 'application/octet-stream' }),
    `Documentos_DINAMIK_${new Date().toISOString().slice(0,10)}.xlsx`
  )
}