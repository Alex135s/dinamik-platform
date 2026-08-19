import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const today = () => new Date().toISOString().slice(0, 10)

// ── Chrome compartido de los reportes PDF ────────────────
function addPdfHeader(doc, title, countLabel) {
  doc.setFillColor(249, 115, 22) // naranja
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DINAMIK DK GROUP SAC', 14, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Arquitectura, Ingeniería & Construcción', 14, 20)

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 38)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })}`, 14, 45)
  doc.text(countLabel, 14, 51)
}

function addPdfFooter(doc) {
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
}

const TABLE_STYLE = {
  headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', fontSize: 9 },
  bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
  alternateRowStyles: { fillColor: [248, 248, 248] },
  margin: { left: 14, right: 14 },
}

function buildPdfTable(doc, head, body, columnStyles) {
  autoTable(doc, { startY: 57, head: [head], body, columnStyles, ...TABLE_STYLE })
}

function buildExcel(data, colWidths, sheetName, filename) {
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = colWidths.map(wch => ({ wch }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename)
}

// ── EXPORTAR PROYECTOS ───────────────────────────────────
export function exportProjectsPDF(projects) {
  const doc = new jsPDF()
  addPdfHeader(doc, 'Reporte de Proyectos', `Total: ${projects.length} proyectos`)
  buildPdfTable(doc,
    ['Código', 'Nombre', 'Cliente', 'Servicio', 'Estado', 'Inicio'],
    projects.map(p => [p.projectCode || '-', p.name || '-', p.client || '-', p.serviceType || '-', p.status || '-', p.startDate || '-']),
    { 0: { cellWidth: 25 }, 1: { cellWidth: 45 }, 2: { cellWidth: 40 }, 3: { cellWidth: 25 }, 4: { cellWidth: 22 }, 5: { cellWidth: 25 } }
  )
  addPdfFooter(doc)
  doc.save(`Proyectos_DINAMIK_${today()}.pdf`)
}

export function exportProjectsExcel(projects) {
  const data = projects.map(p => ({
    'Código': p.projectCode || '', 'Nombre': p.name || '', 'Cliente': p.client || '',
    'Tipo Servicio': p.serviceType || '', 'Estado': p.status || '', 'Fecha Inicio': p.startDate || '',
  }))
  buildExcel(data, [14, 40, 35, 18, 14, 14], 'Proyectos', `Proyectos_DINAMIK_${today()}.xlsx`)
}

// ── EXPORTAR DOCUMENTOS ──────────────────────────────────
export function exportDocumentsPDF(docs, projects) {
  const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Sin proyecto'
  const doc = new jsPDF()
  addPdfHeader(doc, 'Reporte de Documentos', `Total: ${docs.length} documentos`)
  buildPdfTable(doc,
    ['Nombre', 'Proyecto', 'Tipo', 'Estado', 'Subido'],
    docs.map(d => [
      d.name || '-', getProjectName(d.projectId), d.type || '-',
      d.enabled ? 'Habilitado' : 'Deshabilitado',
      d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('es-PE') : '-',
    ]),
    { 0: { cellWidth: 50 }, 1: { cellWidth: 45 }, 2: { cellWidth: 28 }, 3: { cellWidth: 28 }, 4: { cellWidth: 25 } }
  )
  addPdfFooter(doc)
  doc.save(`Documentos_DINAMIK_${today()}.pdf`)
}

export function exportDocumentsExcel(docs, projects) {
  const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Sin proyecto'
  const data = docs.map(d => ({
    'Nombre': d.name || '', 'Proyecto': getProjectName(d.projectId), 'Tipo': d.type || '',
    'Estado': d.enabled ? 'Habilitado' : 'Deshabilitado',
    'Subido': d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('es-PE') : '',
    'URL': d.fileUrl || '',
  }))
  buildExcel(data, [40, 35, 15, 15, 14, 60], 'Documentos', `Documentos_DINAMIK_${today()}.xlsx`)
}

// ── EXPORTAR USUARIOS ────────────────────────────────────
const roleLabelsExport = {
  admin: 'Administrador', empleado: 'Empleado', ingeniero: 'Ingeniero', tecnico: 'Técnico',
}

export function exportUsersPDF(users) {
  const doc = new jsPDF()
  addPdfHeader(doc, 'Reporte de Usuarios', `Total: ${users.length} usuarios`)
  buildPdfTable(doc,
    ['Nombre', 'Email', 'Rol', 'Sede', 'Registrado'],
    users.map(u => [
      u.name || '-', u.email || '-', roleLabelsExport[u.role] || u.role || '-', u.sede || '-',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-PE') : '-',
    ]),
    { 0: { cellWidth: 40 }, 1: { cellWidth: 50 }, 2: { cellWidth: 30 }, 3: { cellWidth: 25 }, 4: { cellWidth: 25 } }
  )
  addPdfFooter(doc)
  doc.save(`Usuarios_DINAMIK_${today()}.pdf`)
}

export function exportUsersExcel(users) {
  const data = users.map(u => ({
    'Nombre': u.name || '', 'Email': u.email || '', 'Rol': roleLabelsExport[u.role] || u.role || '',
    'Sede': u.sede || '', 'DNI': u.dni || '',
    'Registrado': u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-PE') : '',
  }))
  buildExcel(data, [30, 35, 18, 14, 14, 14], 'Usuarios', `Usuarios_DINAMIK_${today()}.xlsx`)
}

// ── EXPORTAR CLIENTES ────────────────────────────────────
export function exportClientsPDF(clients, projects) {
  const proyectosDe = (clientId) => projects.filter(p => p.clientId === clientId).length
  const doc = new jsPDF()
  addPdfHeader(doc, 'Reporte de Clientes', `Total: ${clients.length} clientes`)
  buildPdfTable(doc,
    ['Nombre', 'Tipo', 'Documento', 'Email', 'Proyectos'],
    clients.map(c => [
      c.name || '-', c.tipo || '-', c.docNumber ? `${c.docType || ''} ${c.docNumber}`.trim() : '-',
      c.email || '-', String(proyectosDe(c.id)),
    ]),
    { 0: { cellWidth: 45 }, 1: { cellWidth: 25 }, 2: { cellWidth: 35 }, 3: { cellWidth: 50 }, 4: { cellWidth: 20 } }
  )
  addPdfFooter(doc)
  doc.save(`Clientes_DINAMIK_${today()}.pdf`)
}

export function exportClientsExcel(clients, projects) {
  const proyectosDe = (clientId) => projects.filter(p => p.clientId === clientId).length
  const data = clients.map(c => ({
    'Nombre': c.name || '', 'Tipo': c.tipo || '', 'Documento': c.docNumber ? `${c.docType || ''} ${c.docNumber}`.trim() : '',
    'Email': c.email || '', 'Proyectos': proyectosDe(c.id),
    'Registrado': c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-PE') : '',
  }))
  buildExcel(data, [35, 15, 20, 35, 12, 14], 'Clientes', `Clientes_DINAMIK_${today()}.xlsx`)
}

// ── EXPORTAR TAREAS ──────────────────────────────────────
export function exportTasksPDF(tasks, projectName) {
  const doc = new jsPDF()
  addPdfHeader(doc, `Reporte de Tareas — ${projectName}`, `Total: ${tasks.length} tareas`)
  buildPdfTable(doc,
    ['Tarea', 'Prioridad', 'Estado', 'Responsable', 'Vence'],
    tasks.map(t => [
      t.title || '-', t.priority || '-', t.status || '-', t.assignedTo || '-',
      t.dueDate || '-',
    ]),
    { 0: { cellWidth: 60 }, 1: { cellWidth: 25 }, 2: { cellWidth: 28 }, 3: { cellWidth: 35 }, 4: { cellWidth: 25 } }
  )
  addPdfFooter(doc)
  doc.save(`Tareas_DINAMIK_${today()}.pdf`)
}

export function exportTasksExcel(tasks, projectName) {
  const data = tasks.map(t => ({
    'Tarea': t.title || '', 'Prioridad': t.priority || '', 'Estado': t.status || '',
    'Responsable': t.assignedTo || '', 'Vence': t.dueDate || '',
  }))
  buildExcel(data, [45, 15, 18, 30, 14], projectName.slice(0, 31) || 'Tareas', `Tareas_DINAMIK_${today()}.xlsx`)
}
