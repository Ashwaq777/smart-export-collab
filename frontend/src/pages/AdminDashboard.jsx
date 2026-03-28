import { useState, useEffect } from "react"
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const TOKEN = () => localStorage.getItem('token') || ''
const BASE = 'http://localhost:8080/api'

const NAVY = '#1B2A4A'
const TEAL = '#0D9488'
const GOLD = '#C9A84C'

export default function AdminDashboard() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [userLoading, setUserLoading] = useState(false)
  const [userMsg, setUserMsg] = useState(null)

  const [countries, setCountries] = useState([])
  const [countrySearch, setCountrySearch] = useState('')
  const [editCountry, setEditCountry] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [exchangeRates, setExchangeRates] = useState({})

  const [ports, setPorts] = useState([])
  const [portSearch, setPortSearch] = useState('')
  const [editPort, setEditPort] = useState(null)

  const [rates, setRates] = useState([])
  const [rateSearch, setRateSearch] = useState('')

  const [stats, setStats] = useState({
    totalUsers:0, activeUsers:0, blockedUsers:0, adminCount:0,
    totalOffers:0, activeOffers:0, totalMatches:0, 
    totalTransactions:0, completedTransactions:0, pendingTickets:0
  })

  const [recentTransactions, setRecentTransactions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetail, setShowUserDetail] = useState(false)

  const showMsg = (text, ok=true) => {
    setUserMsg({text,ok})
    setTimeout(()=>setUserMsg(null),4000)
  }

  const loadUsers = async () => {
    setUserLoading(true)
    try {
      const r = await api.get('/admin/users')
      const list = r.data || []
      setUsers(list)
      
      // Charger les stats complètes du marketplace
      const statsRes = await api.get('/admin/stats')
      const statsData = statsRes.data || {}
      setStats({
        totalUsers: statsData.totalUsers || list.length,
        activeUsers: statsData.activeUsers || list.filter(u=>u.status==='ACTIVE').length,
        blockedUsers: statsData.blockedUsers || list.filter(u=>u.status==='BLOCKED').length,
        adminCount: statsData.adminCount || list.filter(u=>u.role==='ADMIN').length,
        totalOffers: statsData.totalOffers || 0,
        activeOffers: statsData.activeOffers || 0,
        totalMatches: statsData.totalMatches || 0,
        totalTransactions: statsData.totalTransactions || 0,
        completedTransactions: statsData.completedTransactions || 0,
        pendingTickets: statsData.pendingTickets || 0
      })
    } catch(e) { 
      showMsg('Erreur chargement users: '+e.message, false)
      setUsers([])
    }
    setUserLoading(false)
  }

  const loadRecentTransactions = async () => {
    try {
      const r = await api.get('/admin/recent-transactions')
      setRecentTransactions(r.data || [])
    } catch(e) {
      console.error('Error loading recent transactions:', e)
      setRecentTransactions([])
    }
  }

  const openUserDetail = (user) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  const loadCountries = async () => {
    try {
      const r = await api.get('/admin/countries')
      setCountries(r.data || [])
    } catch(e) { 
      setCountries([
        { id: 1, name: 'Maroc', code: 'MA', customsDutyRate: 2.5, vatRate: 20, parafiscalRate: 0.25, portFees: 150 },
        { id: 2, name: 'France', code: 'FR', customsDutyRate: 0, vatRate: 20, parafiscalRate: 0, portFees: 200 },
        { id: 3, name: 'Espagne', code: 'ES', customsDutyRate: 0, vatRate: 21, parafiscalRate: 0, portFees: 180 }
      ])
    }
  }

  const loadPorts = async () => {
    try {
      const r = await api.get('/admin/ports')
      setPorts(r.data || [])
    } catch(e) { 
      setPorts([
        { id: 1, nomPort: 'Casablanca', pays: 'Maroc', unlocode: 'MACAS', fraisPortuaires: 150, typePort: 'Maritime' },
        { id: 2, nomPort: 'Tanger Med', pays: 'Maroc', unlocode: 'MAPTM', fraisPortuaires: 200, typePort: 'Maritime' }
      ])
    }
  }

  const loadRates = async () => {
    try {
      const r = await fetch('http://localhost:8080/api/admin/exchange-rates',
        {headers:{'Authorization':'Bearer '+TOKEN()}})
      const data = await r.json()
      const rateMap = {}
      if (Array.isArray(data)) {
        data.forEach(r => { rateMap[r.code] = r.rate })
        setRates(data)
      } else {
        setRates([])
      }
      setExchangeRates(rateMap)
    } catch(e) { 
      setRates([
        { id: 1, currency: 'Euro', code: 'EUR', rate: 0.92, symbol: '€', updatedAt: new Date().toISOString() },
        { id: 2, currency: 'Dirham Marocain', code: 'MAD', rate: 10.15, symbol: 'DH', updatedAt: new Date().toISOString() }
      ])
    }
  }

  const convertFees = (usdAmount, currency) => {
    if (!usdAmount || currency === 'USD') return usdAmount
    const rate = exchangeRates[currency]
    if (!rate) return usdAmount
    return (usdAmount * rate).toFixed(2)
  }

  useEffect(()=>{ loadUsers() },[])
  useEffect(()=>{
    if(activeTab==='countries') {
      loadCountries()
      loadRates()
    }
    if(activeTab==='ports') loadPorts()
    if(activeTab==='rates') loadRates()
    if(activeTab==='overview') {
      loadRecentTransactions()
    }
  },[activeTab])

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, {role})
      showMsg('Role mis a jour')
      loadUsers()
    } catch(e) { showMsg('Erreur: '+e.message, false) }
  }

  const updateUserStatus = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}/status?status=${status}`)
      showMsg('Statut mis a jour')
      loadUsers()
    } catch(e) { showMsg('Erreur: '+e.message, false) }
  }

  const deleteUser = async (userId, email) => {
    if(!window.confirm('Supprimer ' + email + ' ?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      showMsg('Utilisateur supprime')
      loadUsers()
    } catch(e) { showMsg('Erreur: '+e.message, false) }
  }

  const blockUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
    await updateUserStatus(userId, newStatus)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const cardStyle = {
    background:'white', borderRadius:'12px', padding:'24px',
    boxShadow:'0 1px 3px rgba(0,0,0,0.1)', border:'1px solid #F3F4F6'
  }
  const inp = {
    padding:'10px 14px', border:'1px solid #E5E7EB',
    borderRadius:'8px', fontSize:'14px', fontFamily:'inherit',
    background:'white', color:'#1F2937', outline:'none'
  }
  const btnP = {
    background:TEAL, color:'white', border:'none',
    padding:'10px 20px', borderRadius:'8px',
    cursor:'pointer', fontSize:'14px', fontWeight:'600'
  }
  const btnG = {...btnP, background:GOLD}
  const btnR = {...btnP, background:'#DC2626', padding:'6px 12px', fontSize:'12px'}
  const btnB = {...btnP, background:'#F59E0B', padding:'6px 12px', fontSize:'12px'}
  const btnS = {...btnP, background:'#1D4ED8', padding:'6px 12px', fontSize:'12px'}

  const tabSt = (t) => ({
    padding:'14px 24px', border:'none', cursor:'pointer', fontFamily:'inherit',
    borderBottom: activeTab===t ? '3px solid '+TEAL : '3px solid transparent',
    background:'transparent', fontSize:'14px',
    fontWeight: activeTab===t ? '600' : '500',
    color: activeTab===t ? TEAL : '#6B7280',
    whiteSpace:'nowrap'
  })

  const thSt = {
    padding:'12px 16px', textAlign:'left', fontSize:'12px',
    fontWeight:'600', color:'#6B7280', textTransform:'uppercase',
    letterSpacing:'0.05em', background:'#F9FAFB',
    borderBottom:'2px solid #E5E7EB'
  }
  const tdSt = {
    padding:'14px 16px', fontSize:'14px', color:'#374151',
    borderBottom:'1px solid #F3F4F6'
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  )
  const filteredCountries = countries.filter(c =>
    c.name?.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code?.toLowerCase().includes(countrySearch.toLowerCase())
  )
  const filteredPorts = ports.filter(p =>
    p.nomPort?.toLowerCase().includes(portSearch.toLowerCase()) ||
    p.pays?.toLowerCase().includes(portSearch.toLowerCase())
  )

  const adminEmail = user?.email || localStorage.getItem('userEmail') || 'Admin'

  return (
    <div style={{minHeight:'100vh', background:'#F3F4F6'}}>

      <div style={{
        background:NAVY, padding:'0 32px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        height:'64px', boxShadow:'0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <span style={{color:'white',fontWeight:'700',fontSize:'18px'}}>
            Admin Dashboard
          </span>
          <span style={{color:'rgba(255,255,255,0.6)',fontSize:'14px'}}>
            {adminEmail}
          </span>
        </div>
        <button onClick={handleLogout} style={btnG}>
          Deconnexion
        </button>
      </div>

      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4,1fr)',
        gap:'20px', padding:'24px 32px 0'
      }}>
        {[
          {label:'Total Utilisateurs',value:stats.totalUsers,color:TEAL,icon:'👥'},
          {label:'Actifs',value:stats.activeUsers,color:'#10B981',icon:'✅'},
          {label:'Bloques',value:stats.blockedUsers,color:'#EF4444',icon:'🚫'},
          {label:'Admins',value:stats.adminCount,color:GOLD,icon:'👑'}
        ].map(s=>(
          <div key={s.label} style={{...cardStyle,
            borderLeft:'4px solid '+s.color}}>
            <div style={{display:'flex',justifyContent:'space-between',
              alignItems:'center'}}>
              <div>
                <p style={{margin:'0 0 8px',fontSize:'13px',
                  color:'#6B7280',fontWeight:'500'}}>{s.label}</p>
                <p style={{margin:0,fontSize:'32px',
                  fontWeight:'700',color:NAVY}}>{s.value}</p>
              </div>
              <span style={{fontSize:'32px'}}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background:'white', margin:'24px 32px 0',
        borderRadius:'12px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)',
        display:'flex', overflowX:'auto',
        borderBottom:'1px solid #E5E7EB'
      }}>
        {[
          {key:'overview', label:'Vue d ensemble', icon:'📊'},
          {key:'users', label:'Utilisateurs', icon:'👥'},
          {key:'countries', label:'Pays & Tarifs', icon:'🌍'},
          {key:'ports', label:'Ports', icon:'⚓'},
          {key:'rates', label:'Taux de Change', icon:'💱'}
        ].map(t=>(
          <button key={t.key} style={tabSt(t.key)}
            onClick={()=>setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:'24px 32px'}}>

        {userMsg && (
          <div style={{
            padding:'12px 20px', borderRadius:'8px', marginBottom:'16px',
            background: userMsg.ok ? '#D1FAE5' : '#FEE2E2',
            color: userMsg.ok ? '#065F46' : '#991B1B',
            fontWeight:'600', border:'1px solid '+(userMsg.ok?'#6EE7B7':'#FCA5A5')
          }}>
            {userMsg.text}
          </div>
        )}

        {activeTab === 'overview' && (
          <div>
            {/* Marketplace Stats Cards */}
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(4,1fr)',
              gap:'20px', marginBottom:'24px'
            }}>
              {[
                {label:'Offres actives',value:stats.activeOffers,color:TEAL,icon:'📦'},
                {label:'Total matches',value:stats.totalMatches,color:'#8B5CF6',icon:'🤝'},
                {label:'Transactions en cours',value:stats.totalTransactions - stats.completedTransactions,color:GOLD,icon:'🚚'},
                {label:'Tickets en attente',value:stats.pendingTickets,color:'#F59E0B',icon:'🎫'}
              ].map(s=>(
                <div key={s.label} style={{...cardStyle,
                  borderLeft:'4px solid '+s.color}}>
                  <div style={{display:'flex',justifyContent:'space-between',
                    alignItems:'center'}}>
                    <div>
                      <p style={{margin:'0 0 8px',fontSize:'13px',
                        color:'#6B7280',fontWeight:'500'}}>{s.label}</p>
                      <p style={{margin:0,fontSize:'32px',
                        fontWeight:'700',color:NAVY}}>{s.value}</p>
                    </div>
                    <span style={{fontSize:'32px'}}>{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Existing Overview Content */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>
              <div style={cardStyle}>
                <h3 style={{color:NAVY,margin:'0 0 20px',fontSize:'18px',fontWeight:'700'}}>
                  Repartition par Role
                </h3>
                {['ADMIN','EXPORTATEUR','IMPORTATEUR'].map(role => {
                  const count = users.filter(u=>u.role===role).length
                  const pct = users.length ? Math.round(count/users.length*100) : 0
                  return (
                    <div key={role} style={{marginBottom:'16px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',
                        marginBottom:'6px'}}>
                        <span style={{fontSize:'14px',fontWeight:'500',color:'#374151'}}>
                          {role}
                        </span>
                        <span style={{fontSize:'14px',fontWeight:'600',color:NAVY}}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div style={{background:'#F3F4F6',borderRadius:'99px',height:'8px'}}>
                        <div style={{
                          width:pct+'%', height:'8px', borderRadius:'99px',
                          background: role==='ADMIN'?GOLD:role==='EXPORTATEUR'?TEAL:'#8B5CF6',
                          transition:'width 0.5s ease'
                        }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={cardStyle}>
                <h3 style={{color:NAVY,margin:'0 0 20px',fontSize:'18px',fontWeight:'700'}}>
                  Acces Rapide
                </h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  {[
                    {label:'Gerer Utilisateurs',tab:'users',icon:'👥',color:TEAL},
                    {label:'Pays & Tarifs',tab:'countries',icon:'🌍',color:'#8B5CF6'},
                    {label:'Ports',tab:'ports',icon:'⚓',color:NAVY},
                    {label:'Taux de Change',tab:'rates',icon:'💱',color:GOLD}
                  ].map(a=>(
                    <button key={a.tab}
                      onClick={()=>setActiveTab(a.tab)}
                      style={{
                        background:a.color+'15', border:'1px solid '+a.color+'30',
                        borderRadius:'10px', padding:'16px', cursor:'pointer',
                        textAlign:'center', transition:'all 0.2s'
                      }}>
                      <div style={{fontSize:'24px',marginBottom:'8px'}}>{a.icon}</div>
                      <div style={{fontSize:'13px',fontWeight:'600',color:a.color}}>
                        {a.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div style={{...cardStyle, marginTop:'24px'}}>
              <h3 style={{color:NAVY,margin:'0 0 20px',fontSize:'18px',fontWeight:'700'}}>
                5 Dernières Transactions
              </h3>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      <th style={thSt}>ID</th>
                      <th style={thSt}>Statut Workflow</th>
                      <th style={thSt}>Provider</th>
                      <th style={thSt}>Seeker</th>
                      <th style={thSt}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                      <tr key={tx.id}
                        onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                        onMouseLeave={e=>e.currentTarget.style.background='white'}>
                        <td style={tdSt}>
                          <span style={{fontWeight:'600',color:NAVY}}>#{tx.id}</span>
                        </td>
                        <td style={tdSt}>
                          <span style={{
                            padding:'3px 10px', borderRadius:'12px',
                            fontSize:'12px', fontWeight:'600',
                            background: tx.workflowStatus === 'COMPLETED' ? '#D1FAE5' : 
                                       tx.workflowStatus === 'AT_PROVIDER' ? '#DBEAFE' : '#FEF3C7',
                            color: tx.workflowStatus === 'COMPLETED' ? '#065F46' :
                                   tx.workflowStatus === 'AT_PROVIDER' ? '#1E40AF' : '#92400E'
                          }}>
                            {tx.workflowStatus || 'AT_PROVIDER'}
                          </span>
                        </td>
                        <td style={tdSt}>
                          <div style={{fontSize:'13px',color:'#374151'}}>
                            {tx.provider || 'N/A'}
                          </div>
                        </td>
                        <td style={tdSt}>
                          <div style={{fontSize:'13px',color:'#374151'}}>
                            {tx.seeker || 'N/A'}
                          </div>
                        </td>
                        <td style={tdSt}>
                          <div style={{fontSize:'12px',color:'#9CA3AF'}}>
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{...tdSt, textAlign:'center', color:'#9CA3AF'}}>
                          Aucune transaction trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{...cardStyle, padding:'16px 20px', marginBottom:'16px'}}>
              <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                <input style={{...inp,flex:1}}
                  value={userSearch}
                  onChange={e=>setUserSearch(e.target.value)}
                  placeholder="Rechercher par email ou role..."/>
                <button onClick={loadUsers} style={btnP}>
                  Actualiser
                </button>
              </div>
            </div>

            <div style={{...cardStyle, padding:0, overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      <th style={thSt}>Email</th>
                      <th style={thSt}>Téléphone</th>
                      <th style={thSt}>Entreprise</th>
                      <th style={thSt}>Pays</th>
                      <th style={thSt}>Role</th>
                      <th style={thSt}>Statut</th>
                      <th style={thSt}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u=>(
                      <tr key={u.id}
                        onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                        onMouseLeave={e=>e.currentTarget.style.background='white'}>
                        <td style={tdSt}>
                          <div style={{fontWeight:'500',color:'#111827'}}>{u.email}</div>
                          <div style={{fontSize:'12px',color:'#9CA3AF'}}>ID: {u.id}</div>
                        </td>
                        <td style={tdSt}>
                          <div style={{fontSize:'13px',color:'#374151'}}>
                            {u.phone || 'Non renseigné'}
                          </div>
                        </td>
                        <td style={tdSt}>
                          <div style={{fontSize:'13px',color:'#374151'}}>
                            {u.companyName || 'Non renseigné'}
                          </div>
                        </td>
                        <td style={tdSt}>
                          <div style={{fontSize:'13px',color:'#374151'}}>
                            {u.country || 'Non renseigné'}
                          </div>
                        </td>
                        <td style={tdSt}>
                          <select
                            value={u.role}
                            onChange={e=>updateUserRole(u.id,e.target.value)}
                            style={{...inp,padding:'6px 10px',fontSize:'13px'}}>
                            <option value="ADMIN">ADMIN</option>
                            <option value="EXPORTATEUR">EXPORTATEUR</option>
                            <option value="IMPORTATEUR">IMPORTATEUR</option>
                          </select>
                        </td>
                        <td style={tdSt}>
                          <span style={{
                            display:'inline-flex', alignItems:'center', gap:'6px',
                            padding:'4px 12px', borderRadius:'20px',
                            fontSize:'12px', fontWeight:'600',
                            background:u.status==='ACTIVE'?'#D1FAE5':'#FEE2E2',
                            color:u.status==='ACTIVE'?'#065F46':'#991B1B'
                          }}>
                            <span style={{
                              width:'6px', height:'6px', borderRadius:'50%',
                              background:u.status==='ACTIVE'?'#10B981':'#EF4444'
                            }}/>
                            {u.status}
                          </span>
                        </td>
                        <td style={tdSt}>
                          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                            <button
                              onClick={()=>openUserDetail(u)}
                              style={{...btnB,background:TEAL,color:'white'}}>
                              Détail
                            </button>
                            <button
                              onClick={()=>blockUser(u.id,u.status)}
                              style={u.status==='BLOCKED'?
                                {...btnB}:{...btnB,background:'#6B7280'}}>
                              {u.status==='BLOCKED'?'Debloquer':'Bloquer'}
                            </button>
                            <button
                              onClick={()=>deleteUser(u.id,u.email)}
                              style={btnR}>
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{padding:'14px 20px',background:'#F9FAFB',
                borderTop:'1px solid #E5E7EB',fontSize:'13px',color:'#6B7280'}}>
                {filteredUsers.length} utilisateur(s) affiche(s) sur {users.length}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'countries' && (
          <div>
            <div style={{...cardStyle,padding:'16px 20px',marginBottom:'16px'}}>
              <div style={{display:'flex',gap:'12px',alignItems:'center',marginBottom:'16px'}}>
                <input style={{...inp,flex:1}}
                  value={countrySearch}
                  onChange={e=>setCountrySearch(e.target.value)}
                  placeholder="Rechercher un pays..."/>
                <button onClick={loadCountries} style={btnP}>
                  Actualiser
                </button>
              </div>
              <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                <label style={{fontWeight:'600',color:NAVY}}>Afficher les frais en:</label>
                <select
                  value={selectedCurrency}
                  onChange={e=>setSelectedCurrency(e.target.value)}
                  style={{...inp,width:'200px'}}>
                  {rates.map(r=>(
                    <option key={r.code} value={r.code}>
                      {r.code} — {r.currency}
                    </option>
                  ))}
                </select>
                <button onClick={async()=>{
                  await fetch('http://localhost:8080/api/admin/countries/sync',
                    {headers:{'Authorization':'Bearer '+TOKEN()}})
                  loadCountries()
                }} style={btnP}>
                  Sync API
                </button>
              </div>
            </div>
            <div style={{...cardStyle,padding:0,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      {['Drapeau','Code','Pays','Région','Devise','Douane %','TVA %',
                        'Parafiscal %','Frais Portuaires ('+selectedCurrency+')','Actions'].map(h=>(
                        <th key={h} style={thSt}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCountries.map((c,i)=>(
                      <tr key={c.id||i}
                        onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                        onMouseLeave={e=>e.currentTarget.style.background='white'}>
                        <td style={tdSt}>
                          {c.flagUrl && (
                            <img src={c.flagUrl} alt={c.code}
                              style={{width:'32px',height:'20px',objectFit:'cover',
                                borderRadius:'3px'}}
                              onError={e=>e.target.style.display='none'}/>
                          )}
                        </td>
                        <td style={{...tdSt,fontFamily:'monospace',fontWeight:'600',
                          color:NAVY}}>
                          {c.code||c.countryCode||'—'}
                        </td>
                        <td style={{...tdSt,fontWeight:'500',color:'#111827'}}>
                          {c.name||c.countryName||'—'}
                        </td>
                        <td style={tdSt}>
                          <span style={{background:'#F3F4F6',padding:'4px 8px',
                            borderRadius:'6px',fontSize:'12px',fontWeight:'500'}}>
                            {c.region||'—'}
                          </span>
                        </td>
                        <td style={tdSt}>
                          {c.currency||'—'}
                        </td>
                        <td style={tdSt}>
                          {c.customsDutyRate||c.dutyRate||'0'}%
                        </td>
                        <td style={tdSt}>
                          {c.vatRate||c.tva||'0'}%
                        </td>
                        <td style={tdSt}>
                          {c.parafiscalRate||c.parafiscal||'0'}%
                        </td>
                        <td style={tdSt}>
                          {convertFees(c.portFees||c.fraisPortuaires||0, selectedCurrency)} {selectedCurrency}
                        </td>
                        <td style={tdSt}>
                          <button
                            onClick={()=>setEditCountry(c)}
                            style={btnS}>
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{padding:'14px 20px',background:'#F9FAFB',
                borderTop:'1px solid #E5E7EB',fontSize:'13px',color:'#6B7280'}}>
                {filteredCountries.length} pays affiche(s)
              </div>
            </div>

            {editCountry && (
              <div style={{
                position:'fixed',top:0,left:0,right:0,bottom:0,
                background:'rgba(0,0,0,0.5)',display:'flex',
                alignItems:'center',justifyContent:'center',zIndex:1000
              }}>
                <div style={{background:'white',borderRadius:'12px',
                  padding:'32px',width:'480px',maxWidth:'90vw'}}>
                  <h3 style={{color:NAVY,margin:'0 0 24px'}}>
                    Modifier: {editCountry.name||editCountry.countryName}
                  </h3>
                  {[
                    {label:'Droits Douane %',key:'customsDutyRate'},
                    {label:'TVA %',key:'vatRate'},
                    {label:'Taxe Parafiscale %',key:'parafiscalRate'},
                    {label:'Frais Portuaires',key:'portFees'}
                  ].map(f=>(
                    <div key={f.key} style={{marginBottom:'16px'}}>
                      <label style={{display:'block',marginBottom:'6px',
                        fontWeight:'600',color:'#374151',fontSize:'14px'}}>
                        {f.label}
                      </label>
                      <input style={{...inp,width:'100%',boxSizing:'border-box'}}
                        type="number" step="0.01"
                        value={editCountry[f.key]||0}
                        onChange={e=>setEditCountry(p=>({
                          ...p,[f.key]:e.target.value
                        }))}/>
                    </div>
                  ))}
                  <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
                    <button onClick={async ()=>{
                      try {
                        await api.put('/admin/countries/'+editCountry.id, editCountry)
                        showMsg('Pays mis a jour')
                        setEditCountry(null)
                        loadCountries()
                      } catch(e) { showMsg('Erreur: '+e.message,false) }
                    }} style={btnP}>
                      Enregistrer
                    </button>
                    <button onClick={()=>setEditCountry(null)}
                      style={{...btnP,background:'#6B7280'}}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ports' && (
          <div>
            <div style={{...cardStyle,padding:'16px 20px',marginBottom:'16px'}}>
              <div style={{display:'flex',gap:'12px',alignItems:'center',marginBottom:'16px'}}>
                <span style={{color:TEAL,fontWeight:'700',fontSize:'18px'}}>
                  {ports.length} ports
                </span>
                <button onClick={async () => {
                  await fetch('http://localhost:8080/api/admin/ports/sync-osm',
                    {headers:{'Authorization':'Bearer '+TOKEN()}})
                  alert('Sync OSM démarré! Les ports arrivent dans 2-3 min...')
                  // Poll every 10s
                  const interval = setInterval(async () => {
                    await loadPorts()
                  }, 10000)
                  setTimeout(() => clearInterval(interval), 300000)
                }} style={{...btnP, background:TEAL}}>
                  🗺️ Sync OpenStreetMap
                </button>
                <input
                  placeholder="Rechercher port ou pays..."
                  value={portSearch || ''}
                  onChange={e => setPortSearch(e.target.value)}
                  style={{...inp, width:'250px'}}
                />
                <button onClick={loadPorts} style={btnP}>🔍 Chercher</button>
              </div>
            </div>
            <div style={{...cardStyle,padding:0,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      {['Nom','Pays','Code','Frais','Type','Actions'].map(h=>(
                        <th key={h} style={thSt}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPorts.map((p,i)=>(
                      <tr key={p.id||i}
                        onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                        onMouseLeave={e=>e.currentTarget.style.background='white'}>
                        <td style={{...tdSt,fontWeight:'500',color:'#111827'}}>
                          {p.nomPort||p.name||'—'}
                        </td>
                        <td style={tdSt}>
                          {p.pays||p.country||'—'}
                        </td>
                        <td style={{...tdSt,fontFamily:'monospace',color:NAVY,
                          fontWeight:'600'}}>
                          {p.unlocode||p.code||'—'}
                        </td>
                        <td style={tdSt}>
                          {p.fraisPortuaires||p.cost||'0'} EUR
                        </td>
                        <td style={tdSt}>
                          <span style={{
                            padding:'3px 10px', borderRadius:'12px',
                            fontSize:'12px', fontWeight:'600',
                            background:'#EFF6FF', color:'#1E40AF'
                          }}>
                            {p.typePort||p.type||'Maritime'}
                          </span>
                        </td>
                        <td style={tdSt}>
                          <button
                            onClick={()=>setEditPort(p)}
                            style={btnS}>
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{padding:'14px 20px',background:'#F9FAFB',
                borderTop:'1px solid #E5E7EB',fontSize:'13px',color:'#6B7280'}}>
                {filteredPorts.length} port(s) affiche(s)
              </div>
            </div>

            {editPort && (
              <div style={{
                position:'fixed',top:0,left:0,right:0,bottom:0,
                background:'rgba(0,0,0,0.5)',display:'flex',
                alignItems:'center',justifyContent:'center',zIndex:1000
              }}>
                <div style={{background:'white',borderRadius:'12px',
                  padding:'32px',width:'480px',maxWidth:'90vw'}}>
                  <h3 style={{color:NAVY,margin:'0 0 24px'}}>
                    Modifier Port: {editPort.nomPort||editPort.name}
                  </h3>
                  {[
                    {label:'Nom du port',key:'nomPort'},
                    {label:'Code port',key:'unlocode'},
                    {label:'Frais EUR',key:'fraisPortuaires'},
                    {label:'Type',key:'typePort'}
                  ].map(f=>(
                    <div key={f.key} style={{marginBottom:'16px'}}>
                      <label style={{display:'block',marginBottom:'6px',
                        fontWeight:'600',color:'#374151',fontSize:'14px'}}>
                        {f.label}
                      </label>
                      <input
                        style={{...inp,width:'100%',boxSizing:'border-box'}}
                        value={editPort[f.key]||''}
                        onChange={e=>setEditPort(p=>({
                          ...p,[f.key]:e.target.value
                        }))}/>
                    </div>
                  ))}
                  <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
                    <button onClick={async ()=>{
                      try {
                        await api.put('/ports/'+editPort.id, editPort)
                        showMsg('Port mis a jour')
                        setEditPort(null)
                        loadPorts()
                      } catch(e) { showMsg('Erreur: '+e.message,false) }
                    }} style={btnP}>
                      Enregistrer
                    </button>
                    <button onClick={()=>setEditPort(null)}
                      style={{...btnP,background:'#6B7280'}}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rates' && (
          <div>
            <div style={{...cardStyle,padding:'16px 20px',marginBottom:'16px'}}>
              <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                <input style={{...inp,flex:1}}
                  value={rateSearch}
                  onChange={e=>setRateSearch(e.target.value)}
                  placeholder="Rechercher une devise..."/>
                <button onClick={loadRates} style={btnP}>
                  Actualiser
                </button>
              </div>
            </div>
            <div style={{...cardStyle,padding:0,overflow:'hidden'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      {['Devise','Code','Taux vs USD',
                        'Symbole','Mise a jour','Actions'].map(h=>(
                        <th key={h} style={thSt}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rates
                      .filter(r=>
                        r.currency?.toLowerCase().includes(rateSearch.toLowerCase())||
                        r.code?.toLowerCase().includes(rateSearch.toLowerCase()))
                      .map((r,i)=>(
                      <tr key={r.id||i}
                        onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                        onMouseLeave={e=>e.currentTarget.style.background='white'}>
                        <td style={{...tdSt,fontWeight:'500',color:'#111827'}}>
                          {r.currency||r.name||'—'}
                        </td>
                        <td style={{...tdSt,fontFamily:'monospace',
                          fontWeight:'700',color:TEAL}}>
                          {r.code||r.currencyCode||'—'}
                        </td>
                        <td style={{...tdSt,fontWeight:'600',color:NAVY}}>
                          {r.rate||r.exchangeRate||'—'}
                        </td>
                        <td style={tdSt}>
                          {r.symbol||'—'}
                        </td>
                        <td style={{...tdSt,fontSize:'12px',color:'#9CA3AF'}}>
                          {r.updatedAt ?
                            new Date(r.updatedAt).toLocaleDateString('fr-FR') :
                            'N/A'}
                        </td>
                        <td style={tdSt}>
                          <button style={btnS}
                            onClick={()=>showMsg('Modifier taux: '+r.code)}>
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{padding:'14px 20px',background:'#F9FAFB',
                borderTop:'1px solid #E5E7EB',fontSize:'13px',color:'#6B7280'}}>
                {rates.length} devise(s) disponible(s)
              </div>
            </div>
          </div>
        )}

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0,
          background:'rgba(0,0,0,0.5)', display:'flex',
          alignItems:'center', justifyContent:'center', zIndex:1000
        }}>
          <div style={{
            background:'white', borderRadius:'12px', padding:'24px',
            maxWidth:'500px', width:'90%', maxHeight:'80vh', overflowY:'auto'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h3 style={{margin:0,color:NAVY,fontSize:'18px',fontWeight:'700'}}>
                Détails de l'utilisateur
              </h3>
              <button
                onClick={()=>setShowUserDetail(false)}
                style={{background:'none',border:'none',fontSize:'24px',cursor:'pointer',color:'#9CA3AF'}}>
                ×
              </button>
            </div>
            
            <div style={{display:'grid',gap:'16px'}}>
              <div>
                <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                  Nom complet
                </label>
                <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                  {selectedUser.firstName && selectedUser.lastName 
                    ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                    : 'Non renseigné'}
                </div>
              </div>
              
              <div>
                <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                  Email
                </label>
                <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                  {selectedUser.email}
                </div>
              </div>
              
              <div>
                <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                  Téléphone
                </label>
                <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                  {selectedUser.phone || 'Non renseigné'}
                </div>
              </div>
              
              <div>
                <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                  Entreprise
                </label>
                <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                  {selectedUser.companyName || 'Non renseigné'}
                </div>
              </div>
              
              <div>
                <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                  Pays
                </label>
                <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                  {selectedUser.country || 'Non renseigné'}
                </div>
              </div>
              
              <div>
                <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                  Rôle
                </label>
                <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                  {selectedUser.role}
                </div>
              </div>
              
              <div>
                <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                  Statut du compte
                </label>
                <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:'6px',
                    padding:'4px 12px', borderRadius:'20px',
                    fontSize:'12px', fontWeight:'600',
                    background:selectedUser.status==='ACTIVE'?'#D1FAE5':'#FEE2E2',
                    color:selectedUser.status==='ACTIVE'?'#065F46':'#991B1B'
                  }}>
                    <span style={{
                      width:'6px', height:'6px', borderRadius:'50%',
                      background:selectedUser.status==='ACTIVE'?'#10B981':'#EF4444'
                    }}/>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
              
              {selectedUser.createdAt && (
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                    Date de création
                  </label>
                  <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                    {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}
              
              {selectedUser.lastLogin && (
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#6B7280',marginBottom:'4px'}}>
                    Dernière connexion
                  </label>
                  <div style={{padding:'8px 12px',background:'#F9FAFB',borderRadius:'6px',fontSize:'14px',color:'#111827'}}>
                    {new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR')} à {new Date(selectedUser.lastLogin).toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:'20px'}}>
              <button
                onClick={()=>setShowUserDetail(false)}
                style={{...btnB,background:NAVY,color:'white'}}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
