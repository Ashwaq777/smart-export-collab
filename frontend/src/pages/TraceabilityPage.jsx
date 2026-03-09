import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { Check, X, Pencil, Trash2, Download } from 'lucide-react'

const TOKEN = () => localStorage.getItem('token') || ''
const BASE = 'http://localhost:8080/api/traceability'

const INITIAL = {
  traceabilityLotCode:'',descriptionProduit:'',gtin:'',
  lotCommercial:'',lotSanitaire:'',quantite:'',uniteMesure:'kg',
  paysOrigine:'',siteProductionNom:'',siteProductionAdresse:'',
  numeroAgrementSanitaire:'',dateProduction:'',dateRecolte:'',
  producteur:'',parcelle:'',traitements:'',destination:'',lot:'',
  nomExpediteur:'',adresseExpediteur:'',glnExpediteur:'',
  dateExpedition:'',moyenTransport:'Mer',temperatureTransport:'',
  nomDestinataire:'',adresseDestinataire:'',glnDestinataire:'',
  dateReception:'',operateurUE:'',adresseOperateurUE:'',
  numeroEori:'',typeDocument:'Invoice',numeroDocument:'',
  certificatSanitaire:'',statut:'BROUILLON',
  glnCreateurTlc:'',systemeSource:'',signatureElectronique:'',
  dateValidation:'',donneesExactes:false
}

const inp = {width:'100%',padding:'10px 12px',border:'1px solid #ddd',
  borderRadius:'8px',fontSize:'14px',boxSizing:'border-box',
  fontFamily:'inherit',background:'white'}
const sel = {...inp,cursor:'pointer'}
const lbl = {display:'block',marginBottom:'6px',fontWeight:'600',
  color:'#1B2A4A',fontSize:'13px'}
const sec = {background:'white',borderRadius:'12px',padding:'24px',
  marginBottom:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}
const secT = {color:'#1B2A4A',fontSize:'16px',fontWeight:'700',
  marginBottom:'20px',paddingBottom:'10px',
  borderBottom:'2px solid #C9A84C',margin:'0 0 20px 0'}
const grid2 = {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}
const grid3 = {display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px'}
const fld = (label, key, form, set, type='text', opts=null) => (
  <div key={key}>
    <label style={lbl}>{label}</label>
    {opts ? (
      <select style={sel} value={form[key]||''} 
        onChange={e=>set(p=>({...p,[key]:e.target.value}))}>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input style={inp} type={type} value={form[key]||''}
        onChange={e=>set(p=>({...p,[key]:e.target.value}))}/>
    )}
  </div>
)

export default function TraceabilityPage() {
  const [tab, setTab] = useState('nouveau')
  const [form, setForm] = useState(INITIAL)
  const [records, setRecords] = useState([])
  const [history, setHistory] = useState([])
  const [selRecord, setSelRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [filters, setFilters] = useState({producteur:'',dateDebut:'',dateFin:'',lot:''})

  // États pour la sélection et les modales
  const [selectedRecords, setSelectedRecords] = useState(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editHistoryModal, setEditHistoryModal] = useState(null)
  const [deleteHistoryModal, setDeleteHistoryModal] = useState(null)

  // États pour la gestion des documents et signatures
  const [documentFile, setDocumentFile] = useState(null)
  const [signatureFile, setSignatureFile] = useState(null)
  const [documentPreview, setDocumentPreview] = useState('')
  const [signaturePreview, setSignaturePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [dragActiveSignature, setDragActiveSignature] = useState(false)

  const showMsg = (text, ok=true) => {
    setMsg({text, ok})
    setTimeout(()=>setMsg(null), 4000)
  }

  const loadRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({page:0,size:100})
      if(filters.producteur) params.append('producteur',filters.producteur)
      if(filters.dateDebut) params.append('dateDebut',filters.dateDebut)
      if(filters.dateFin) params.append('dateFin',filters.dateFin)
      const r = await fetch(BASE+'?'+params, {
        headers:{'Authorization':'Bearer '+TOKEN()}
      })
      const d = await r.json()
      setRecords(d.content || d || [])
    } catch(e) { showMsg('Erreur chargement: '+e.message, false) }
    setLoading(false)
  }, [filters])

  const loadHistory = async (id, record) => {
    setSelRecord(record)
    setTab('historique')
    try {
      const r = await fetch(BASE+'/'+id+'/history', {
        headers:{'Authorization':'Bearer '+TOKEN()}
      })
      const d = await r.json()
      setHistory(Array.isArray(d)?d:[])
    } catch(e) { setHistory([]) }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const r = await fetch(BASE, {
        method:'POST',
        headers:{'Authorization':'Bearer '+TOKEN(),
          'Content-Type':'application/json'},
        body:JSON.stringify(form)
      })
      const text = await r.text()
      if(!r.ok) throw new Error(text)
      showMsg('✅ Enregistrement créé avec succès!')
      setForm(INITIAL)
      setTab('records')
      setTimeout(loadRecords, 500)
    } catch(e) { showMsg('❌ Erreur: '+e.message, false) }
    setLoading(false)
  }

  const handleExport = async () => {
    try {
      const r = await fetch(BASE+'/export', {
        headers:{'Authorization':'Bearer '+TOKEN()}
      })
      if(!r.ok) throw new Error('Export failed '+r.status)
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href=url; a.download='traceabilite.xlsx'
      document.body.appendChild(a); a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch(e) { showMsg('❌ Export: '+e.message, false) }
  }

  // Fonctions pour la gestion de la sélection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set())
      setSelectAll(false)
    } else {
      const allIds = new Set(records.map(r => r.id))
      setSelectedRecords(allIds)
      setSelectAll(true)
    }
  }

  const handleSelectRecord = (id) => {
    const newSelected = new Set(selectedRecords)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRecords(newSelected)
    setSelectAll(newSelected.size === records.length && records.length > 0)
  }

  // Export Excel sélectif
  const handleSelectiveExport = () => {
    if (selectedRecords.size === 0) {
      showMsg('❌ Veuillez sélectionner au moins un enregistrement', false)
      return
    }

    try {
      const selectedData = records.filter(r => selectedRecords.has(r.id))
      
      // Préparer les données pour Excel
      const wsData = [
        ['Identifiant', 'Producteur', 'Parcelle', 'Date Récolte', 'Destination', 'Statut', 'TLC', 'Description Produit', 'GTIN', 'Lot Commercial', 'Pays Origine', 'Site Production', 'Date Production', 'Nom Expéditeur', 'Nom Destinataire', 'Date Expédition', 'Date Réception']
      ]
      
      selectedData.forEach(r => {
        wsData.push([
          r.identifiant || ('REC-' + r.id),
          r.producteur || '-',
          r.parcelle || '-',
          r.dateRecolte || '-',
          r.destination || '-',
          r.statut || 'BROUILLON',
          r.traceabilityLotCode || '-',
          r.descriptionProduit || '-',
          r.gtin || '-',
          r.lotCommercial || '-',
          r.paysOrigine || '-',
          r.siteProductionNom || '-',
          r.dateProduction || '-',
          r.nomExpediteur || '-',
          r.nomDestinataire || '-',
          r.dateExpedition || '-',
          r.dateReception || '-'
        ])
      })

      // Ajouter une ligne de résumé
      wsData.push([])
      wsData.push(['RÉSUMÉ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''])
      wsData.push(['Total exporté', selectedData.length, 'enregistrements', '', '', '', '', '', '', '', '', '', '', '', '', '', ''])
      wsData.push(['Date export', new Date().toLocaleString('fr-FR'), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''])

      // Créer le workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      
      // Style des en-têtes
      ws['!ref'] = 'A1:R' + (wsData.length)
      for (let col = 0; col < 18; col++) {
        const cellAddress = XLSX.utils.encode_cell({r: 0, c: col})
        ws[cellAddress] = {
          v: wsData[0][col],
          t: 's',
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1B2A4A" } },
            alignment: { horizontal: "center" }
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Traceabilité Export')
      
      // Générer le nom du fichier avec date et heure
      const now = new Date()
      const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-')
      const timeStr = now.toLocaleTimeString('fr-FR').replace(/:/g, '-')
      const fileName = `trace_export_${dateStr}_${timeStr}.xlsx`
      
      XLSX.writeFile(wb, fileName)
      showMsg(`✅ Export réussi — ${selectedRecords.size} enregistrements exportés`)
    } catch (e) {
      showMsg('❌ Erreur lors de l\'export: ' + e.message, false)
    }
  }

  // Fonctions pour la gestion de l'historique
  const handleEditHistory = (historyItem) => {
    setEditHistoryModal({...historyItem})
  }

  const handleDeleteHistory = (historyItem) => {
    setDeleteHistoryModal(historyItem)
  }

  const saveHistoryEdit = async () => {
    try {
      // Simulation de sauvegarde (adapter avec API réelle)
      const updatedHistory = history.map(h => 
        h.id === editHistoryModal.id ? editHistoryModal : h
      )
      setHistory(updatedHistory)
      setEditHistoryModal(null)
      showMsg('✅ Trace modifiée avec succès')
    } catch (e) {
      showMsg('❌ Erreur lors de la modification: ' + e.message, false)
    }
  }

  const confirmDeleteHistory = async () => {
    try {
      // Simulation de suppression (adapter avec API réelle)
      const updatedHistory = history.filter(h => h.id !== deleteHistoryModal.id)
      setHistory(updatedHistory)
      setDeleteHistoryModal(null)
      showMsg('✅ Trace supprimée avec succès')
    } catch (e) {
      showMsg('❌ Erreur lors de la suppression: ' + e.message, false)
    }
  }

  // Fonctions de gestion des fichiers
  const handleDocumentFileChange = (file) => {
    if (file) {
      // Validation du type de fichier
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        showMsg('❌ Type de fichier non autorisé. Formats acceptés : PDF, Word, JPG, PNG', false)
        return
      }
      
      // Validation de la taille (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showMsg('❌ Le fichier dépasse la taille maximale de 10MB', false)
        return
      }
      
      setDocumentFile(file)
      setDocumentPreview(file.name)
    }
  }

  const handleSignatureFileChange = (file) => {
    if (file) {
      // Validation du type de fichier (uniquement images)
      const allowedTypes = ['image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        showMsg('❌ Type de fichier non autorisé. Formats acceptés : JPG, PNG uniquement', false)
        return
      }
      
      // Validation de la taille (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showMsg('❌ Le fichier dépasse la taille maximale de 10MB', false)
        return
      }
      
      setSignatureFile(file)
      
      // Prévisualisation de l'image
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignaturePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadDocuments = async (recordId) => {
    if (!documentFile && !signatureFile) {
      showMsg('❌ Veuillez sélectionner au moins un fichier', false)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      if (documentFile) formData.append('document', documentFile)
      if (signatureFile) formData.append('signature', signatureFile)

      const response = await fetch(`${BASE}/${recordId}/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + TOKEN()
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const updatedRecord = await response.json()
      
      // Mettre à jour l'enregistrement dans la liste
      setRecords(records.map(r => r.id === recordId ? updatedRecord : r))
      
      // Réinitialiser les états
      setDocumentFile(null)
      setSignatureFile(null)
      setDocumentPreview('')
      setSignaturePreview('')
      
      showMsg('✅ Documents uploadés avec succès!')
      
      // Recharger les enregistrements pour voir les mises à jour
      setTimeout(loadRecords, 500)
      
    } catch (e) {
      showMsg('❌ Erreur lors de l\'upload: ' + e.message, false)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e, isSignature = false) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      if (isSignature) {
        setDragActiveSignature(true)
      } else {
        setDragActive(true)
      }
    } else if (e.type === "dragleave") {
      if (isSignature) {
        setDragActiveSignature(false)
      } else {
        setDragActive(false)
      }
    }
  }

  const handleDrop = (e, isSignature = false) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isSignature) {
      setDragActiveSignature(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSignatureFileChange(e.dataTransfer.files[0])
      }
    } else {
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleDocumentFileChange(e.dataTransfer.files[0])
      }
    }
  }

  const tabStyle = (t) => ({
    padding:'12px 24px', border:'none', cursor:'pointer',
    borderBottom: tab===t ? '3px solid #C9A84C' : '3px solid transparent',
    background:'transparent', fontSize:'15px', fontWeight: tab===t?'700':'400',
    color: tab===t?'#1B2A4A':'#666'
  })

  const btnPrimary = {background:'#1B2A4A',color:'white',border:'none',
    padding:'12px 28px',borderRadius:'8px',cursor:'pointer',
    fontSize:'15px',fontWeight:'600'}
  const btnGold = {...btnPrimary,background:'#C9A84C'}

  return (
    <div style={{minHeight:'100vh',background:'#F0F2F5',
  padding:'24px',paddingTop:'90px'}}>
      <div style={{maxWidth:'1100px',margin:'0 auto'}}>

        {/* Header */}
        <div style={{background:'linear-gradient(135deg,#1B2A4A,#2D4A7A)',
          borderRadius:'12px',padding:'24px 32px',marginBottom:'24px',
          display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h1 style={{color:'white',margin:0,fontSize:'26px'}}>
              🌿 Traçabilité Internationale
            </h1>
            <p style={{color:'#C9A84C',margin:'4px 0 0',fontSize:'14px'}}>
              Conforme FSMA 204 (US) & Réglementation UE
            </p>
          </div>
          <button onClick={()=>{setTab('nouveau');setForm(INITIAL)}}
            style={{background:'#C9A84C',color:'white',border:'none',
              padding:'12px 24px',borderRadius:'8px',cursor:'pointer',
              fontSize:'15px',fontWeight:'700',
              boxShadow:'0 4px 12px rgba(201,168,76,0.4)'}}>
            ✚ Nouveau
          </button>
        </div>

        {/* Message */}
        {msg && (
          <div style={{padding:'14px 20px',borderRadius:'8px',
            marginBottom:'16px',fontSize:'14px',fontWeight:'600',
            background:msg.ok?'#d4edda':'#f8d7da',
            color:msg.ok?'#155724':'#721c24',
            border:`1px solid ${msg.ok?'#c3e6cb':'#f5c6cb'}`}}>
            {msg.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{background:'white',borderRadius:'12px',
          marginBottom:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
          display:'flex',borderBottom:'1px solid #eee'}}>
          <button style={tabStyle('nouveau')} onClick={()=>setTab('nouveau')}>
            ➕ Nouveau Formulaire
          </button>
          <button style={tabStyle('records')} 
            onClick={()=>{setTab('records');loadRecords()}}>
            📋 Enregistrements
          </button>
          <button style={tabStyle('historique')} onClick={()=>setTab('historique')}>
            📜 Historique
          </button>
        </div>

        {/* TAB: NOUVEAU */}
        {tab==='nouveau' && (
          <div>
            {/* A - Metadata */}
            <div style={{background:'white',borderRadius:'12px',padding:'24px',
              marginBottom:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
              borderLeft:'4px solid #C9A84C'}}>
              <h3 style={{color:'#1B2A4A',fontSize:'16px',fontWeight:'700',
                margin:'0 0 20px 0',paddingBottom:'10px',
                borderBottom:'2px solid #C9A84C'}}>
                A. Métadonnées Système
              </h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px'}}>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>ID Enregistrement</label>
                  <div style={{padding:'10px 12px',background:'#F0F2F5',
                    borderRadius:'8px',fontSize:'13px',color:'#666',
                    border:'1px solid #ddd'}}>Auto-généré</div>
                </div>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>Date/heure création</label>
                  <div style={{padding:'10px 12px',background:'#F0F2F5',
                    borderRadius:'8px',fontSize:'13px',color:'#666',
                    border:'1px solid #ddd'}}>
                    {new Date().toLocaleString('fr-FR')}
                  </div>
                </div>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>Utilisateur créateur</label>
                  <div style={{padding:'10px 12px',background:'#F0F2F5',
                    borderRadius:'8px',fontSize:'13px',color:'#666',
                    border:'1px solid #ddd'}}>
                    {localStorage.getItem('userEmail') || 'Utilisateur connecté'}
                  </div>
                </div>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>Version formulaire</label>
                  <div style={{padding:'10px 12px',background:'#F0F2F5',
                    borderRadius:'8px',fontSize:'13px',color:'#666',
                    border:'1px solid #ddd'}}>v1.0 — FSMA 204 / UE</div>
                </div>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>Statut initial</label>
                  <div style={{padding:'10px 12px',background:'#fff3cd',
                    borderRadius:'8px',fontSize:'13px',color:'#856404',
                    border:'1px solid #ffc107',fontWeight:'600'}}>BROUILLON</div>
                </div>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>Conformité</label>
                  <div style={{padding:'10px 12px',background:'#d4edda',
                    borderRadius:'8px',fontSize:'13px',color:'#155724',
                    border:'1px solid #c3e6cb',fontWeight:'600'}}>
                    ✅ FSMA 204 + UE
                  </div>
                </div>
              </div>
            </div>
            {/* B - Identification */}
            <div style={sec}>
              <h3 style={secT}>B. Identification du Produit</h3>
              <div style={grid2}>
                {fld('Traceability Lot Code (TLC)*','traceabilityLotCode',form,setForm)}
                {fld('Description Produit*','descriptionProduit',form,setForm)}
                {fld('GTIN (14 chiffres)','gtin',form,setForm)}
                {fld('Lot Commercial*','lotCommercial',form,setForm)}
                {fld('Lot Sanitaire*','lotSanitaire',form,setForm)}
                {fld('Quantité','quantite',form,setForm,'number')}
                {fld('Unité','uniteMesure',form,setForm,'text',['kg','box','pallet','unit'])}
              </div>
            </div>

            {/* C - Origine */}
            <div style={sec}>
              <h3 style={secT}>C. Origine & Production</h3>
              <div style={grid2}>
                {fld('Pays d\'origine*','paysOrigine',form,setForm)}
                {fld('Site de production – nom*','siteProductionNom',form,setForm)}
                {fld('Site de production – adresse*','siteProductionAdresse',form,setForm)}
                {fld('N° Agrément Sanitaire','numeroAgrementSanitaire',form,setForm)}
                {fld('Date de production*','dateProduction',form,setForm,'date')}
                {fld('Date de récolte*','dateRecolte',form,setForm,'date')}
                {fld('Producteur','producteur',form,setForm)}
                {fld('Parcelle','parcelle',form,setForm)}
                {fld('Traitements','traitements',form,setForm)}
              </div>
            </div>

            {/* D - Expédition */}
            <div style={sec}>
              <h3 style={secT}>D. Expédition</h3>
              <div style={grid2}>
                {fld('Nom expéditeur*','nomExpediteur',form,setForm)}
                {fld('Adresse expéditeur*','adresseExpediteur',form,setForm)}
                {fld('GLN expéditeur','glnExpediteur',form,setForm)}
                {fld('Date & heure expédition*','dateExpedition',form,setForm,'datetime-local')}
                {fld('Moyen de transport','moyenTransport',form,setForm,'text',['Route','Mer','Air','Rail'])}
                {fld('Température transport (°C)','temperatureTransport',form,setForm,'number')}
              </div>
            </div>

            {/* E - Réception */}
            <div style={sec}>
              <h3 style={secT}>E. Réception</h3>
              <div style={grid2}>
                {fld('Nom destinataire*','nomDestinataire',form,setForm)}
                {fld('Adresse destinataire*','adresseDestinataire',form,setForm)}
                {fld('GLN destinataire','glnDestinataire',form,setForm)}
                {fld('Date & heure réception*','dateReception',form,setForm,'datetime-local')}
                {fld('Destination','destination',form,setForm)}
              </div>
            </div>

            {/* F - Import UE */}
            <div style={sec}>
              <h3 style={secT}>F. Importation UE</h3>
              <div style={grid2}>
                {fld('Opérateur responsable UE','operateurUE',form,setForm)}
                {fld('Adresse opérateur UE','adresseOperateurUE',form,setForm)}
                {fld('Numéro EORI','numeroEori',form,setForm)}
              </div>
            </div>

            {/* G - Documents */}
            <div style={sec}>
              <h3 style={secT}>G. Documents & Références</h3>
              <div style={grid2}>
                {fld('Type de document','typeDocument',form,setForm,'text',['BOL','Invoice','CMR'])}
                {fld('Numéro document*','numeroDocument',form,setForm)}
                {fld('Certificat sanitaire','certificatSanitaire',form,setForm)}
                {fld('Lot de référence','lot',form,setForm)}
              </div>
            </div>

            {/* H - Liaison Traçabilité */}
            <div style={{background:'white',borderRadius:'12px',padding:'24px',
              marginBottom:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
              <h3 style={{color:'#1B2A4A',fontSize:'16px',fontWeight:'700',
                margin:'0 0 20px 0',paddingBottom:'10px',
                borderBottom:'2px solid #C9A84C'}}>
                H. Liaison de Traçabilité
              </h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>
                    GLN Créateur du TLC (13 chiffres) — FSMA 204
                  </label>
                  <input style={{width:'100%',padding:'10px 12px',border:'1px solid #ddd',
                    borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}
                    type="text" maxLength="13"
                    value={form.glnCreateurTlc||''}
                    onChange={e=>setForm(p=>({...p,glnCreateurTlc:e.target.value}))}
                    placeholder="1234567890123"/>
                </div>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>
                    Système Source — Audit
                  </label>
                  <input style={{width:'100%',padding:'10px 12px',border:'1px solid #ddd',
                    borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}
                    type="text"
                    value={form.systemeSource||''}
                    onChange={e=>setForm(p=>({...p,systemeSource:e.target.value}))}
                    placeholder="ex: ERP SAP, WMS, Manuel"/>
                </div>
              </div>
            </div>

            {/* I - Validation & Conformité */}
            <div style={{background:'white',borderRadius:'12px',padding:'24px',
              marginBottom:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
              border:'2px solid #C9A84C'}}>
              <h3 style={{color:'#1B2A4A',fontSize:'16px',fontWeight:'700',
                margin:'0 0 20px 0',paddingBottom:'10px',
                borderBottom:'2px solid #C9A84C'}}>
                I. Validation & Conformité
              </h3>
              
              {/* Checkbox confirmation */}
              <div style={{background:'#F8F9FA',borderRadius:'10px',padding:'20px',
                marginBottom:'20px',border:'1px solid #E8ECF0'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:'12px',
                  marginBottom:'16px'}}>
                  <input type="checkbox" id="donneesExactes"
                    checked={form.donneesExactes||false}
                    onChange={e=>setForm(p=>({...p,donneesExactes:e.target.checked}))}
                    style={{width:'20px',height:'20px',marginTop:'2px',cursor:'pointer',
                      accentColor:'#1B2A4A'}}/>
                  <label htmlFor="donneesExactes" style={{fontSize:'14px',
                    color:'#1B2A4A',fontWeight:'600',cursor:'pointer',lineHeight:'1.5'}}>
                    ✅ Je certifie que toutes les données saisies sont exactes, 
                    complètes et conformes aux réglementations FSMA 204 (US) 
                    et à la réglementation européenne applicable.
                  </label>
                </div>
              </div>

              {/* Signature + Date validation */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',
                marginBottom:'20px'}}>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>
                    Signature électronique responsable
                  </label>
                  <input style={{width:'100%',padding:'10px 12px',border:'1px solid #ddd',
                    borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}
                    type="text"
                    value={form.signatureElectronique||''}
                    onChange={e=>setForm(p=>({...p,signatureElectronique:e.target.value}))}
                    placeholder="Nom complet du responsable"/>
                </div>
                <div>
                  <label style={{display:'block',marginBottom:'6px',fontWeight:'600',
                    color:'#1B2A4A',fontSize:'13px'}}>
                    Date de validation
                  </label>
                  <input style={{width:'100%',padding:'10px 12px',border:'1px solid #ddd',
                    borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'}}
                    type="datetime-local"
                    value={form.dateValidation||''}
                    onChange={e=>setForm(p=>({...p,dateValidation:e.target.value}))}/>
                </div>
              </div>

              {/* Statut final */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                {['BROUILLON','VALIDÉ','VERROUILLÉ'].map(s=>(
                  <div key={s}
                    onClick={()=>setForm(p=>({...p,statut:s}))}
                    style={{padding:'16px',borderRadius:'10px',cursor:'pointer',
                      textAlign:'center',fontWeight:'700',fontSize:'14px',
                      border: form.statut===s ? '2px solid #1B2A4A' : '2px solid #E8ECF0',
                      background: form.statut===s ?
                        (s==='VALIDÉ'?'#d4edda':s==='VERROUILLÉ'?'#cce5ff':'#fff3cd') :
                        'white',
                      color: form.statut===s ?
                        (s==='VALIDÉ'?'#155724':s==='VERROUILLÉ'?'#004085':'#856404') :
                        '#666',
                      transform: form.statut===s ? 'scale(1.02)' : 'scale(1)',
                      transition:'all 0.2s'}}>
                    {s==='BROUILLON'?'📝':s==='VALIDÉ'?'✅':'🔒'} {s}
                  </div>
                ))}
              </div>
            </div>

            {/* J - Documents & Signature officielle */}
            <div style={{background:'white',borderRadius:'12px',padding:'24px',
              marginBottom:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
              border:'2px solid #28a745'}}>
              <h3 style={{color:'#1B2A4A',fontSize:'16px',fontWeight:'700',
                margin:'0 0 20px 0',paddingBottom:'10px',
                borderBottom:'2px solid #28a745'}}>
                📄 J. Documents & Signature officielle
              </h3>

              <div style={grid2}>
                {/* Zone d'import du document principal */}
                <div>
                  <label style={lbl}>Document principal</label>
                  <div style={{marginBottom:'8px',fontSize:'12px',color:'#666'}}>
                    Formats acceptés : PDF, Word, JPG, PNG (max 10MB)
                  </div>
                  <div 
                    style={{
                      border: dragActive ? '2px dashed #28a745' : '2px dashed #ddd',
                      borderRadius:'8px',padding:'20px',textAlign:'center',
                      background: dragActive ? '#f8fff9' : '#fafafa',
                      cursor:'pointer',transition:'all 0.3s'
                    }}
                    onDragEnter={(e) => handleDrag(e, false)}
                    onDragLeave={(e) => handleDrag(e, false)}
                    onDragOver={(e) => handleDrag(e, false)}
                    onDrop={(e) => handleDrop(e, false)}
                    onClick={() => document.getElementById('documentFileInput').click()}
                  >
                    <input
                      id="documentFileInput"
                      type="file"
                      style={{display:'none'}}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files[0] && handleDocumentFileChange(e.target.files[0])}
                    />
                    {documentPreview ? (
                      <div>
                        <div style={{fontSize:'14px',color:'#28a745',fontWeight:'600',marginBottom:'8px'}}>
                          ✅ {documentPreview}
                        </div>
                        <div style={{fontSize:'12px',color:'#666'}}>
                          {(documentFile?.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize:'24px',marginBottom:'8px'}}>📁</div>
                        <div style={{fontSize:'14px',color:'#666'}}>
                          Glissez-déposez un fichier ici
                        </div>
                        <div style={{fontSize:'12px',color:'#999',marginTop:'4px'}}>
                          ou cliquez pour choisir
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Zone d'import de la signature scannée */}
                <div>
                  <label style={lbl}>Signature scannée</label>
                  <div style={{marginBottom:'8px',fontSize:'12px',color:'#666'}}>
                    Formats acceptés : JPG, PNG uniquement (max 10MB)
                  </div>
                  <div 
                    style={{
                      border: dragActiveSignature ? '2px dashed #28a745' : '2px dashed #ddd',
                      borderRadius:'8px',padding:'20px',textAlign:'center',
                      background: dragActiveSignature ? '#f8fff9' : '#fafafa',
                      cursor:'pointer',transition:'all 0.3s'
                    }}
                    onDragEnter={(e) => handleDrag(e, true)}
                    onDragLeave={(e) => handleDrag(e, true)}
                    onDragOver={(e) => handleDrag(e, true)}
                    onDrop={(e) => handleDrop(e, true)}
                    onClick={() => document.getElementById('signatureFileInput').click()}
                  >
                    <input
                      id="signatureFileInput"
                      type="file"
                      style={{display:'none'}}
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => e.target.files[0] && handleSignatureFileChange(e.target.files[0])}
                    />
                    {signaturePreview ? (
                      <div>
                        <img 
                          src={signaturePreview} 
                          alt="Signature" 
                          style={{maxWidth:'100px',maxHeight:'60px',border:'1px solid #ddd',borderRadius:'4px'}}
                        />
                        <div style={{fontSize:'12px',color:'#28a745',fontWeight:'600',marginTop:'8px'}}>
                          ✅ Signature officielle du responsable
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize:'24px',marginBottom:'8px'}}>✍️</div>
                        <div style={{fontSize:'14px',color:'#666'}}>
                          Glissez-déposez votre signature
                        </div>
                        <div style={{fontSize:'12px',color:'#999',marginTop:'4px'}}>
                          ou cliquez pour choisir
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div style={{background:'#e8f5e8',borderRadius:'8px',padding:'16px',marginTop:'16px'}}>
                <div style={{fontSize:'13px',color:'#155724',lineHeight:'1.5'}}>
                  <strong>📋 Instructions :</strong><br/>
                  • Le document principal peut être un contrat, certificat, ou tout document officiel<br/>
                  • La signature doit être une image claire et lisible de la signature du responsable<br/>
                  • Les fichiers seront automatiquement associés à cet enregistrement de traçabilité<br/>
                  • Vous pourrez télécharger ou remplacer ces fichiers ultérieurement
                </div>
              </div>
            </div>

            <div style={{textAlign:'right',marginBottom:'32px'}}>
              <button onClick={()=>setForm(INITIAL)}
                style={{...btnPrimary,background:'#6c757d',marginRight:'12px'}}>
                🔄 Réinitialiser
              </button>
              <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
                {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* TAB: RECORDS */}
        {tab==='records' && (
          <div>
            {/* Filters */}
            <div style={sec}>
              <h3 style={secT}>🔍 Filtres</h3>
              <div style={grid3}>
                <div>
                  <label style={lbl}>Producteur</label>
                  <input style={inp} value={filters.producteur}
                    onChange={e=>setFilters(p=>({...p,producteur:e.target.value}))}
                    placeholder="Nom producteur"/>
                </div>
                <div>
                  <label style={lbl}>Date début</label>
                  <input style={inp} type="date" value={filters.dateDebut}
                    onChange={e=>setFilters(p=>({...p,dateDebut:e.target.value}))}/>
                </div>
                <div>
                  <label style={lbl}>Date fin</label>
                  <input style={inp} type="date" value={filters.dateFin}
                    onChange={e=>setFilters(p=>({...p,dateFin:e.target.value}))}/>
                </div>
              </div>
              <div style={{marginTop:'16px',display:'flex',gap:'12px',alignItems:'center'}}>
                <button onClick={loadRecords} style={btnPrimary}>
                  {loading?'⏳ Chargement...':'🔄 Charger / Filtrer'}
                </button>
                <button onClick={handleExport} style={btnGold}>
                  📥 Export Excel (tout)
                </button>
                <button 
                  onClick={handleSelectiveExport} 
                  disabled={selectedRecords.size === 0}
                  style={{
                    ...btnGold, 
                    background: selectedRecords.size > 0 ? '#C9A84C' : '#ccc',
                    cursor: selectedRecords.size > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                  <Download size={16} />
                  Exporter la sélection ({selectedRecords.size})
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={sec}>
              <h3 style={{...secT,marginBottom:'16px'}}>
                📋 Enregistrements ({records.length})
              </h3>
              {records.length===0 ? (
                <div style={{textAlign:'center',padding:'40px',color:'#666'}}>
                  <div style={{fontSize:'48px',marginBottom:'12px'}}>📭</div>
                  <p>Aucun enregistrement. Cliquez "Charger" ou créez un nouveau.</p>
                </div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{background:'#1B2A4A'}}>
                        <th style={{padding:'14px 16px',color:'white',
                          textAlign:'center',fontSize:'13px',fontWeight:'600',width:'50px'}}>
                          <input 
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            style={{width:'18px',height:'18px',cursor:'pointer',accentColor:'#C9A84C'}}
                          />
                        </th>
                        {['Identifiant','Producteur','Parcelle','Date Récolte',
                          'Destination','Statut','Actions'].map(h=>(
                          <th key={h} style={{padding:'14px 16px',color:'white',
                            textAlign:'left',fontSize:'13px',fontWeight:'600'}}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r,i)=>(
                        <tr key={r.id} style={{
                          background: selectedRecords.has(r.id) ? '#E6F7FF' : (i%2===0?'white':'#F8F9FA'),
                          borderBottom:'1px solid #E8ECF0',
                          borderLeft: selectedRecords.has(r.id) ? '3px solid #0e7fa3' : 'none'
                        }}>
                          <td style={{padding:'14px 16px',textAlign:'center'}}>
                            <input 
                              type="checkbox"
                              checked={selectedRecords.has(r.id)}
                              onChange={() => handleSelectRecord(r.id)}
                              style={{width:'18px',height:'18px',cursor:'pointer',accentColor:'#0e7fa3'}}
                            />
                          </td>
                          <td style={{padding:'14px 16px',fontSize:'12px',
                            color:'#666',fontFamily:'monospace'}}>
                            {r.identifiant||('REC-'+r.id)}
                          </td>
                          <td style={{padding:'14px 16px',fontWeight:'500'}}>
                            {r.producteur||'-'}
                          </td>
                          <td style={{padding:'14px 16px'}}>{r.parcelle||'-'}</td>
                          <td style={{padding:'14px 16px'}}>{r.dateRecolte||'-'}</td>
                          <td style={{padding:'14px 16px'}}>{r.destination||'-'}</td>
                          <td style={{padding:'14px 16px'}}>
                            <span style={{padding:'4px 12px',borderRadius:'20px',
                              fontSize:'12px',fontWeight:'600',
                              background:r.statut==='VALIDÉ'?'#d4edda':
                                r.statut==='VERROUILLÉ'?'#cce5ff':'#fff3cd',
                              color:r.statut==='VALIDÉ'?'#155724':
                                r.statut==='VERROUILLÉ'?'#004085':'#856404'}}>
                              {r.statut||'BROUILLON'}
                            </span>
                          </td>
                          <td style={{padding:'14px 16px'}}>
                            <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                              {/* Icônes de statut de documents */}
                              {r.documentFileName && (
                                <span title="Document attaché" style={{fontSize:'16px',cursor:'pointer'}}>
                                  📎
                                </span>
                              )}
                              {r.signatureFileName && (
                                <span title="Signature attachée" style={{fontSize:'16px',cursor:'pointer'}}>
                                  ✍️
                                </span>
                              )}
                              
                              {/* Bouton Historique */}
                              <button onClick={()=>loadHistory(r.id,r)}
                                style={{background:'#C9A84C',color:'white',
                                  border:'none',padding:'6px 14px',
                                  borderRadius:'6px',cursor:'pointer',
                                  fontSize:'12px',fontWeight:'600'}}>
                                📜 Historique
                              </button>
                              
                              {/* Bouton Upload Documents */}
                              <button 
                                onClick={() => {
                                  setSelRecord(r)
                                  // Réinitialiser les états de fichiers
                                  setDocumentFile(null)
                                  setSignatureFile(null)
                                  setDocumentPreview('')
                                  setSignaturePreview('')
                                  // Ouvrir une modal ou scroller vers la section d'upload
                                  const uploadSection = document.getElementById('upload-section-' + r.id)
                                  if (uploadSection) {
                                    uploadSection.scrollIntoView({behavior: 'smooth'})
                                  }
                                }}
                                style={{background:'#28a745',color:'white',
                                  border:'none',padding:'6px 14px',
                                  borderRadius:'6px',cursor:'pointer',
                                  fontSize:'12px',fontWeight:'600'}}>
                                📄 Docs
                              </button>
                              
                              {/* Actions de téléchargement */}
                              {r.documentFileName && (
                                <button 
                                  onClick={() => window.open(`${BASE}/${r.id}/document`, '_blank')}
                                  style={{background:'#007bff',color:'white',
                                    border:'none',padding:'6px 14px',
                                    borderRadius:'6px',cursor:'pointer',
                                    fontSize:'12px',fontWeight:'600'}}>
                                  📥 Doc
                                </button>
                              )}
                              
                              {r.signatureFileName && (
                                <button 
                                  onClick={() => window.open(`${BASE}/${r.id}/signature`, '_blank')}
                                  style={{background:'#6f42c1',color:'white',
                                    border:'none',padding:'6px 14px',
                                    borderRadius:'6px',cursor:'pointer',
                                    fontSize:'12px',fontWeight:'600'}}>
                                  🖊️ Sig
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Section d'upload rapide pour documents */}
              {selRecord && (
                <div id={`upload-section-${selRecord.id}`} style={sec}>
                  <h3 style={secT}>
                    📄 Upload Documents - {selRecord.identifiant||'Record '+selRecord.id}
                  </h3>
                  
                  <div style={grid2}>
                    {/* Upload document principal */}
                    <div>
                      <label style={lbl}>Document principal</label>
                      <div style={{marginBottom:'8px',fontSize:'12px',color:'#666'}}>
                        Formats: PDF, Word, JPG, PNG (max 10MB)
                      </div>
                      <div 
                        style={{
                          border: dragActive ? '2px dashed #28a745' : '2px dashed #ddd',
                          borderRadius:'8px',padding:'16px',textAlign:'center',
                          background: dragActive ? '#f8fff9' : '#fafafa',
                          cursor:'pointer'
                        }}
                        onDragEnter={(e) => handleDrag(e, false)}
                        onDragLeave={(e) => handleDrag(e, false)}
                        onDragOver={(e) => handleDrag(e, false)}
                        onDrop={(e) => handleDrop(e, false)}
                        onClick={() => document.getElementById('quickDocumentInput').click()}
                      >
                        <input
                          id="quickDocumentInput"
                          type="file"
                          style={{display:'none'}}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => e.target.files[0] && handleDocumentFileChange(e.target.files[0])}
                        />
                        {documentPreview ? (
                          <div style={{fontSize:'13px',color:'#28a745',fontWeight:'600'}}>
                            ✅ {documentPreview}
                          </div>
                        ) : (
                          <div style={{fontSize:'13px',color:'#666'}}>
                            📁 Glissez ou cliquez pour choisir
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload signature */}
                    <div>
                      <label style={lbl}>Signature scannée</label>
                      <div style={{marginBottom:'8px',fontSize:'12px',color:'#666'}}>
                        Formats: JPG, PNG uniquement (max 10MB)
                      </div>
                      <div 
                        style={{
                          border: dragActiveSignature ? '2px dashed #28a745' : '2px dashed #ddd',
                          borderRadius:'8px',padding:'16px',textAlign:'center',
                          background: dragActiveSignature ? '#f8fff9' : '#fafafa',
                          cursor:'pointer'
                        }}
                        onDragEnter={(e) => handleDrag(e, true)}
                        onDragLeave={(e) => handleDrag(e, true)}
                        onDragOver={(e) => handleDrag(e, true)}
                        onDrop={(e) => handleDrop(e, true)}
                        onClick={() => document.getElementById('quickSignatureInput').click()}
                      >
                        <input
                          id="quickSignatureInput"
                          type="file"
                          style={{display:'none'}}
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => e.target.files[0] && handleSignatureFileChange(e.target.files[0])}
                        />
                        {signaturePreview ? (
                          <div>
                            <img 
                              src={signaturePreview} 
                              alt="Signature" 
                              style={{maxWidth:'80px',maxHeight:'50px',border:'1px solid #ddd',borderRadius:'4px'}}
                            />
                            <div style={{fontSize:'12px',color:'#28a745',fontWeight:'600',marginTop:'4px'}}>
                              ✅ Signature chargée
                            </div>
                          </div>
                        ) : (
                          <div style={{fontSize:'13px',color:'#666'}}>
                            ✍️ Glissez ou cliquez pour choisir
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div style={{marginTop:'16px',display:'flex',gap:'12px',alignItems:'center'}}>
                    <button 
                      onClick={() => handleUploadDocuments(selRecord.id)}
                      disabled={uploading || (!documentFile && !signatureFile)}
                      style={{
                        ...btnPrimary,
                        background: (!documentFile && !signatureFile) ? '#ccc' : '#28a745',
                        cursor: (!documentFile && !signatureFile) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {uploading ? '⏳ Upload...' : '📤 Uploader les fichiers'}
                    </button>
                    
                    <button 
                      onClick={() => {
                        setSelRecord(null)
                        setDocumentFile(null)
                        setSignatureFile(null)
                        setDocumentPreview('')
                        setSignaturePreview('')
                      }}
                      style={{...btnPrimary,background:'#6c757d'}}
                    >
                      ❌ Annuler
                    </button>
                  </div>

                  {/* Statut actuel des documents */}
                  <div style={{marginTop:'16px',padding:'12px',background:'#f8f9fa',borderRadius:'6px'}}>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'#1B2A4A',marginBottom:'8px'}}>
                      📋 Statut actuel :
                    </div>
                    <div style={{display:'flex',gap:'16px',fontSize:'12px'}}>
                      <div>
                        Document : {selRecord.documentFileName ? 
                          <span style={{color:'#28a745',fontWeight:'600'}}>✅ {selRecord.documentFileName}</span> : 
                          <span style={{color:'#dc3545'}}>❌ Non uploadé</span>
                        }
                      </div>
                      <div>
                        Signature : {selRecord.signatureFileName ? 
                          <span style={{color:'#28a745',fontWeight:'600'}}>✅ {selRecord.signatureFileName}</span> : 
                          <span style={{color:'#dc3545'}}>❌ Non uploadée</span>
                        }
                      </div>
                    </div>
                    {selRecord.documentUploadedAt && (
                      <div style={{marginTop:'8px',fontSize:'11px',color:'#666'}}>
                        Dernier upload : {new Date(selRecord.documentUploadedAt).toLocaleString('fr-FR')} 
                        par {selRecord.documentUploadedBy || 'Utilisateur'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: HISTORIQUE */}
        {tab==='historique' && (
          <div style={sec}>
            <h3 style={secT}>
              📜 Historique {selRecord ? `— ${selRecord.identifiant||'Record '+selRecord.id}` : ''}
            </h3>
            {!selRecord ? (
              <div style={{textAlign:'center',padding:'40px',color:'#666'}}>
                <div style={{fontSize:'48px',marginBottom:'12px'}}>📜</div>
                <p>Sélectionnez un enregistrement depuis l'onglet "Enregistrements"
                  et cliquez sur "Historique".</p>
                <button onClick={()=>setTab('records')} style={btnPrimary}>
                  Voir les enregistrements
                </button>
              </div>
            ) : history.length===0 ? (
              <div style={{textAlign:'center',padding:'40px',color:'#666'}}>
                <p>Aucun historique pour cet enregistrement.</p>
              </div>
            ) : (
              <div style={{position:'relative',paddingLeft:'20px'}}>
                {history.map((h,i)=>(
                  <div key={h.id||i} style={{display:'flex',
                    marginBottom:'24px',position:'relative'}}>
                    <div style={{display:'flex',flexDirection:'column',
                      alignItems:'center',marginRight:'20px',flexShrink:0}}>
                      <div style={{width:'40px',height:'40px',borderRadius:'50%',
                        background:'#C9A84C',color:'white',display:'flex',
                        alignItems:'center',justifyContent:'center',
                        fontWeight:'bold',fontSize:'14px',
                        boxShadow:'0 2px 8px rgba(201,168,76,0.4)'}}>
                        v{h.version||i+1}
                      </div>
                      {i<history.length-1 && (
                        <div style={{width:'2px',flex:1,background:'#E8ECF0',
                          minHeight:'30px',marginTop:'4px'}}/>
                      )}
                    </div>
                    <div style={{flex:1,background:'#F8F9FA',borderRadius:'10px',
                      padding:'16px',border:'1px solid #E8ECF0'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                        <div style={{fontWeight:'700',color:'#1B2A4A',
                          fontSize:'15px'}}>
                          {h.changeDescription||'Modification effectuée'}
                        </div>
                        <div style={{display:'flex',gap:'8px'}}>
                          <button
                            onClick={() => handleEditHistory(h)}
                            style={{
                              background:'#0e7fa3',
                              color:'white',
                              border:'none',
                              padding:'6px 8px',
                              borderRadius:'4px',
                              cursor:'pointer',
                              display:'flex',
                              alignItems:'center',
                              justifyContent:'center',
                              transition:'all 0.2s'
                            }}
                            title="Modifier">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(h)}
                            style={{
                              background:'#dc2626',
                              color:'white',
                              border:'none',
                              padding:'6px 8px',
                              borderRadius:'4px',
                              cursor:'pointer',
                              display:'flex',
                              alignItems:'center',
                              justifyContent:'center',
                              transition:'all 0.2s'
                            }}
                            title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{color:'#666',fontSize:'13px',
                        display:'flex',gap:'16px',flexWrap:'wrap'}}>
                        <span>👤 {h.modifiedBy||'Système'}</span>
                        <span>🕐 {h.modifiedAt ?
                          new Date(h.modifiedAt).toLocaleString('fr-FR') : ''}</span>
                        <span>📋 Version {h.version||i+1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODALE D'ÉDITION HISTORIQUE */}
        {editHistoryModal && (
          <div style={{
            position:'fixed',top:0,left:0,right:0,bottom:0,
            background:'rgba(0,0,0,0.5)',display:'flex',
            alignItems:'center',justifyContent:'center',zIndex:1000
          }}>
            <div style={{
              background:'white',borderRadius:'12px',
              padding:'32px',width:'500px',maxWidth:'90vw',
              boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{color:'#1B2A4A',margin:'0 0 24px',fontSize:'18px',fontWeight:'700'}}>
                Modifier la trace
              </h3>
              
              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div>
                  <label style={lbl}>Description</label>
                  <input 
                    style={inp}
                    value={editHistoryModal.changeDescription || ''}
                    onChange={e=>setEditHistoryModal(p=>({...p,changeDescription:e.target.value}))}
                    placeholder="Description de la modification"
                  />
                </div>
                
                <div>
                  <label style={lbl}>Modifié par</label>
                  <input 
                    style={inp}
                    value={editHistoryModal.modifiedBy || ''}
                    onChange={e=>setEditHistoryModal(p=>({...p,modifiedBy:e.target.value}))}
                    placeholder="Nom du modificateur"
                  />
                </div>
                
                <div>
                  <label style={lbl}>Statut</label>
                  <select 
                    style={sel}
                    value={editHistoryModal.statut || 'BROUILLON'}
                    onChange={e=>setEditHistoryModal(p=>({...p,statut:e.target.value}))}
                  >
                    <option value="BROUILLON">BROUILLON</option>
                    <option value="VALIDÉ">VALIDÉ</option>
                    <option value="VERROUILLÉ">VERROUILLÉ</option>
                  </select>
                </div>
                
                <div>
                  <label style={lbl}>Date de modification</label>
                  <input 
                    style={inp}
                    type="datetime-local"
                    value={editHistoryModal.modifiedAt || ''}
                    onChange={e=>setEditHistoryModal(p=>({...p,modifiedAt:e.target.value}))}
                  />
                </div>
              </div>
              
              <div style={{display:'flex',gap:'12px',marginTop:'24px',justifyContent:'flex-end'}}>
                <button 
                  onClick={()=>setEditHistoryModal(null)}
                  style={{
                    ...btnPrimary,
                    background:'#6c757d',
                    padding:'10px 20px'
                  }}>
                  Annuler
                </button>
                <button 
                  onClick={saveHistoryEdit}
                  style={btnPrimary}>
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODALE DE SUPPRESSION HISTORIQUE */}
        {deleteHistoryModal && (
          <div style={{
            position:'fixed',top:0,left:0,right:0,bottom:0,
            background:'rgba(0,0,0,0.5)',display:'flex',
            alignItems:'center',justifyContent:'center',zIndex:1000
          }}>
            <div style={{
              background:'white',borderRadius:'12px',
              padding:'32px',width:'400px',maxWidth:'90vw',
              textAlign:'center',
              boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width:'48px',height:'48px',background:'#fee2e2',
                borderRadius:'50%',display:'flex',alignItems:'center',
                justifyContent:'center',margin:'0 auto 16px'
              }}>
                <Trash2 size={24} color="#dc2626" />
              </div>
              
              <h3 style={{color:'#1B2A4A',margin:'0 0 12px',fontSize:'18px',fontWeight:'700'}}>
                Supprimer cette trace ?
              </h3>
              
              <p style={{color:'#6b7280',margin:'0 0 24px',fontSize:'14px',lineHeight:'1.5'}}>
                Êtes-vous sûr de vouloir supprimer cette trace ?<br/>
                Cette action est irréversible.
              </p>
              
              <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
                <button 
                  onClick={()=>setDeleteHistoryModal(null)}
                  style={{
                    ...btnPrimary,
                    background:'#6c757d',
                    padding:'10px 24px'
                  }}>
                  Annuler
                </button>
                <button 
                  onClick={confirmDeleteHistory}
                  style={{
                    background:'#dc2626',color:'white',border:'none',
                    padding:'10px 24px',borderRadius:'8px',cursor:'pointer',
                    fontSize:'15px',fontWeight:'600'
                  }}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
