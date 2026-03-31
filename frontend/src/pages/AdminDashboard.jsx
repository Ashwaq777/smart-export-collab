import { useState, useEffect } from "react"
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Ship, Anchor, Users, CreditCard, MapPin, Package, BarChart2, Globe, DollarSign, MessageSquare } from "lucide-react"
import api from '../services/api'
import AdminContainerManager from '../components/admin/AdminContainerManager'

const TOKEN = () => localStorage.getItem('token') || ''
const NAVY = '#0B1F3A';
const OCEAN = '#1CA7C7';
const TEAL = '#0D9488';
const GOLD = '#C9A84C';
const BG = '#F4F7FB';
const BASE = 'http://localhost:8080/api'

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
    activeOffers:0, totalMatches:0, totalTransactions:0, completedTransactions:0,
    pendingTickets:0
  })

  const [recentTransactions, setRecentTransactions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [claims, setClaims] = useState([])
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimResponse, setClaimResponse] = useState('')
  const [claimStatus, setClaimStatus] = useState('')

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

  const loadClaims = async () => {
    try {
      const r = await api.get('/v1/support/admin/all')
      setClaims(r.data || [])
    } catch(e) {
      console.error('Error loading claims:', e)
      setClaims([])
    }
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
    if(activeTab==='transactions') {
      loadRecentTransactions()
    }
    if(activeTab==='claims') {
      loadClaims()
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

  const sidebarItems = [
    { 
      key: 'overview', 
      label: 'Tableau de bord', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    { key: 'users', label: 'Utilisateurs', icon: Users },
    { 
      key: 'containers', 
      label: 'Marketplace', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      )
    },
    { key: 'transactions', label: 'Transactions', icon: CreditCard },
    { 
      key: 'claims', 
      label: 'Réclamations', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    { 
      key: 'countries', 
      label: 'Pays & Tarifs', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    { key: 'ports', label: 'Ports', icon: MapPin },
    { 
      key: 'rates', 
      label: 'Taux de change', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    }
  ]

  const getRoleColor = (role) => {
    switch(role) {
      case 'IMPORTATEUR': return { bg: '#EFF6FF', text: '#1D4ED8' }
      case 'EXPORTATEUR': return { bg: '#F0FDFA', text: '#0F766E' }
      case 'ADMIN': return { bg: '#FEF9C3', text: '#854D0E' }
      default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return { bg: '#DCFCE7', text: '#15803D' }
      case 'BLOCKED': return { bg: '#FEE2E2', text: '#DC2626' }
      default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return { bg: '#FEE2E2', text: '#DC2626' }
      case 'HIGH': return { bg: '#FED7AA', text: '#EA580C' }
      case 'MEDIUM': return { bg: '#FEF3C7', text: '#D97706' }
      case 'LOW': return { bg: '#F3F4F6', text: '#6B7280' }
      default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  const getWorkflowStatusColor = (status) => {
    switch(status) {
      case 'AT_PROVIDER': return { bg: '#FEF3C7', text: '#92400E' }
      case 'IN_TRANSIT': return { bg: '#DBEAFE', text: '#1E40AF' }
      case 'DELIVERED_TO_EXPORTER': return { bg: '#D1FAE5', text: '#065F46' }
      case 'COMPLETED': return { bg: '#E0F2FE', text: '#0369A1' }
      case 'LOADING': return { bg: '#F3F4F6', text: '#6B7280' }
      default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      margin: 0, 
      padding: 0,
      background: '#F4F7FA' 
    }}>
      
      {/* Sidebar */}
      <div style={{
        width: '240px',
        minWidth: '240px',
        maxWidth: '240px',
        flexShrink: 0,
        overflow: 'hidden',
        background: '#0B1F3A',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100vh',
        zIndex: 1000
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              position: 'relative',
              width: '32px',
              height: '32px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #0B1F3A, #0E3A5D, #1CA7C7)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '1px solid rgba(28, 167, 199, 0.2)'
              }}>
                <Ship size={16} color="white" />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-3px',
                right: '-3px',
                width: '14px',
                height: '14px',
                background: 'linear-gradient(135deg, #1CA7C7, #16869F)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid white'
              }}>
                <Anchor size={7} color="white" />
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.2'
              }}>
                Smart Export
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#1CA7C7',
                fontWeight: '500',
                lineHeight: '1.2'
              }}>
                Administration
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {sidebarItems.map(item => {
            const IconComponent = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.25rem',
                  background: activeTab === item.key ? '#1CA7C7' : 'transparent',
                  color: activeTab === item.key ? 'white' : 'rgba(255,255,255,0.75)',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === item.key ? '500' : '400',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderRadius: '8px',
                  margin: '0 0.75rem'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.key) {
                    e.target.style.background = 'rgba(255,255,255,0.08)'
                    e.target.style.color = 'white'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.key) {
                    e.target.style.background = 'transparent'
                    e.target.style.color = 'rgba(255,255,255,0.75)'
                  }
                }}
              >
                {typeof IconComponent === 'function' ? (
                  <IconComponent />
                ) : (
                  <IconComponent size={16} />
                )}
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#1CA7C7',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {(adminEmail[0] || 'A').toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '500'
              }}>
                {adminEmail}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        minWidth: 0, 
        overflowY: 'auto' 
      }}>
        
        {/* Page Header */}
        <div style={{
          background: 'white',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#0B1F3A',
              margin: '0 0 0.25rem 0'
            }}>
              {sidebarItems.find(item => item.key === activeTab)?.label || 'Admin Dashboard'}
            </h1>
            <p style={{
              fontSize: '0.8125rem',
              color: '#64748B',
              margin: 0
            }}>
              Gestion de la plateforme Smart Export Global
            </p>
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: '#64748B',
            fontWeight: '500'
          }}>
            {currentDate}
          </div>
        </div>

        {/* Messages */}
        {userMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            margin: '1rem 2rem',
            background: userMsg.ok ? '#D1FAE5' : '#FEE2E2',
            color: userMsg.ok ? '#065F46' : '#991B1B',
            fontWeight: '500',
            border: `1px solid ${userMsg.ok ? '#6EE7B7' : '#FCA5A5'}`
          }}>
            {userMsg.text}
          </div>
        )}

        {/* Content Area */}
        <div style={{ padding: '2rem' }}>
        
        {activeTab === 'overview' && (
          <div>
            {/* Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {[
                { label: 'Total utilisateurs', value: stats.totalUsers, color: '#0B1F3A', bgColor: '#EFF6FF', icon: Users },
                { label: 'Utilisateurs actifs', value: stats.activeUsers, color: '#0B1F3A', bgColor: '#DCFCE7', icon: Users },
                { label: 'Importateurs', value: users.filter(u => u.role === 'IMPORTATEUR').length, color: '#0B1F3A', bgColor: '#EFF6FF', icon: Package },
                { label: 'Exportateurs', value: users.filter(u => u.role === 'EXPORTATEUR').length, color: '#0B1F3A', bgColor: '#F0FDFA', icon: Package },
                { label: 'Offres actives', value: stats.activeOffers, color: '#0B1F3A', bgColor: '#DCFCE7', icon: Package },
                { label: 'Matches total', value: stats.totalMatches, color: '#0B1F3A', bgColor: '#EDE9FE', icon: Users },
                { label: 'Transactions', value: stats.totalTransactions, color: '#0B1F3A', bgColor: '#EFF6FF', icon: CreditCard },
                { label: 'Tickets en attente', value: stats.pendingTickets, color: '#0B1F3A', bgColor: '#FEE2E2', icon: MessageSquare }
              ].map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div key={index} style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: metric.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={24} color={metric.color} />
                      </div>
                      <div style={{
                        padding: '0.25rem 0.5rem',
                        background: '#F0FDF4',
                        color: '#16A34A',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        ↑ actif
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: '#0B1F3A',
                      marginBottom: '0.25rem'
                    }}>
                      {metric.value}
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: '#64748B',
                      fontWeight: '500'
                    }}>
                      {metric.label}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent Transactions */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#0B1F3A',
                margin: '0 0 1rem 0'
              }}>
                Transactions récentes
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0B1F3A' }}>
                      {['ID', 'Client', 'Type', 'Montant', 'Statut', 'Date'].map(header => (
                        <th key={header} style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx, index) => (
                      <tr key={tx.id || index} style={{
                        background: index % 2 === 0 ? 'white' : '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B',
                          fontWeight: '500'
                        }}>
                          #{tx.id || index + 1}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B'
                        }}>
                          {tx.client || 'Client anonyme'}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B'
                        }}>
                          {tx.type || 'Standard'}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B',
                          fontWeight: '500'
                        }}>
                          {tx.amount || '0'} €
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: '600',
                            background: '#DCFCE7',
                            color: '#15803D'
                          }}>
                            {tx.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#64748B'
                        }}>
                          {tx.date ? new Date(tx.date).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            {/* Search Bar */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <input
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Rechercher par email ou rôle..."
              />
              <button
                onClick={loadUsers}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0B3D5C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Actualiser
              </button>
            </div>

            {/* Users Table */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0B3D5C' }}>
                      <th style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Avatar + Nom
                      </th>
                      <th style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Email
                      </th>
                      <th style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Rôle
                      </th>
                      <th style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Statut
                      </th>
                      <th style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Entreprise
                      </th>
                      <th style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Pays
                      </th>
                      <th style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user.id} style={{
                        background: index % 2 === 0 ? 'white' : '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <td style={{
                          padding: '1rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#125D86',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <div style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#1B2A4A'
                              }}>
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : user.email}
                              </div>
                              <div style={{
                                fontSize: '0.75rem',
                                color: '#64748B'
                              }}>
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: '#374151'
                        }}>
                          {user.email}
                        </td>
                        <td style={{
                          padding: '1rem'
                        }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: `${getRoleColor(user.role)}20`,
                            color: getRoleColor(user.role)
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{
                          padding: '1rem'
                        }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: `${getStatusColor(user.status)}20`,
                            color: getStatusColor(user.status)
                          }}>
                            {user.status}
                          </span>
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: '#374151'
                        }}>
                          {user.companyName || 'Non renseigné'}
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontSize: '0.875rem',
                          color: '#374151'
                        }}>
                          {user.country || 'Non renseigné'}
                        </td>
                        <td style={{
                          padding: '1rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                          }}>
                            <button
                              onClick={() => openUserDetail(user)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                background: 'transparent',
                                color: '#0B3D5C',
                                border: '1px solid #0B3D5C',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#0B3D5C'
                                e.target.style.color = 'white'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'transparent'
                                e.target.style.color = '#0B3D5C'
                              }}
                            >
                              Détail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{
                padding: '0.875rem 1rem',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                fontSize: '0.8125rem',
                color: '#64748B'
              }}>
                {filteredUsers.length} utilisateur(s) affiché(s) sur {users.length}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'countries' && (
          <div>
            {/* Search and Controls */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <input
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Rechercher un pays..."
              />
              <select
                value={selectedCurrency}
                onChange={e => setSelectedCurrency(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                {rates.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.code} — {r.currency}
                  </option>
                ))}
              </select>
              <button
                onClick={loadCountries}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0B3D5C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Actualiser
              </button>
            </div>

            {/* Countries Table */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0B3D5C' }}>
                      {['Drapeau', 'Code', 'Pays', 'Région', 'Devise', 'Douane %', 'TVA %', 'Parafiscal %', `Frais (${selectedCurrency})`, 'Actions'].map(header => (
                        <th key={header} style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCountries.map((country, index) => (
                      <tr key={country.id || index} style={{
                        background: index % 2 === 0 ? 'white' : '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <td style={{ padding: '1rem' }}>
                          {country.flagUrl && (
                            <img 
                              src={country.flagUrl} 
                              alt={country.code}
                              style={{
                                width: '32px',
                                height: '20px',
                                objectFit: 'cover',
                                borderRadius: '0.25rem'
                              }}
                              onError={e => e.target.style.display = 'none'}
                            />
                          )}
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          color: '#1B2A4A'
                        }}>
                          {country.code || country.countryCode || '—'}
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontWeight: '500',
                          color: '#1B2A4A'
                        }}>
                          {country.name || country.countryName || '—'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: '#F1F5F9',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {country.region || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {country.currency || '—'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {country.customsDutyRate || country.dutyRate || '0'}%
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {country.vatRate || country.tva || '0'}%
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {country.parafiscalRate || country.parafiscal || '0'}%
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {convertFees(country.portFees || country.fraisPortuaires || 0, selectedCurrency)} {selectedCurrency}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => setEditCountry(country)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: 'transparent',
                              color: '#0B3D5C',
                              border: '1px solid #0B3D5C',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#0B3D5C'
                              e.target.style.color = 'white'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent'
                              e.target.style.color = '#0B3D5C'
                            }}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ports' && (
          <div>
            {/* Search and Controls */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{
                color: '#0D9488',
                fontWeight: '600',
                fontSize: '1.125rem'
              }}>
                {ports.length} ports
              </span>
              <input
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                value={portSearch || ''}
                onChange={e => setPortSearch(e.target.value)}
                placeholder="Rechercher port ou pays..."
              />
              <button
                onClick={loadPorts}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0B3D5C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Actualiser
              </button>
            </div>

            {/* Ports Table */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0B3D5C' }}>
                      {['Nom', 'Pays', 'Code', 'Frais', 'Type', 'Actions'].map(header => (
                        <th key={header} style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPorts.map((port, index) => (
                      <tr key={port.id || index} style={{
                        background: index % 2 === 0 ? 'white' : '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <td style={{
                          padding: '1rem',
                          fontWeight: '500',
                          color: '#1B2A4A'
                        }}>
                          {port.nomPort || port.name || '—'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {port.pays || port.country || '—'}
                        </td>
                        <td style={{
                          padding: '1rem',
                          fontFamily: 'monospace',
                          color: '#1B2A4A',
                          fontWeight: '600'
                        }}>
                          {port.unlocode || port.code || '—'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {port.fraisPortuaires || port.cost || '0'} EUR
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: '#EFF6FF',
                            color: '#1E40AF'
                          }}>
                            {port.typePort || port.type || 'Maritime'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => setEditPort(port)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: 'transparent',
                              color: '#0B3D5C',
                              border: '1px solid #0B3D5C',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#0B3D5C'
                              e.target.style.color = 'white'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent'
                              e.target.style.color = '#0B3D5C'
                            }}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rates' && (
          <div>
            {/* Search Bar */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <input
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                value={rateSearch}
                onChange={e => setRateSearch(e.target.value)}
                placeholder="Rechercher une devise..."
              />
              <button
                onClick={loadRates}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0B3D5C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Actualiser
              </button>
            </div>

            {/* Rates Table */}
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0B3D5C' }}>
                      {['Devise', 'Code', 'Taux vs USD', 'Symbole', 'Mise à jour', 'Actions'].map(header => (
                        <th key={header} style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rates
                      .filter(rate =>
                        rate.currency?.toLowerCase().includes(rateSearch.toLowerCase()) ||
                        rate.code?.toLowerCase().includes(rateSearch.toLowerCase())
                      )
                      .map((rate, index) => (
                        <tr key={rate.id || index} style={{
                          background: index % 2 === 0 ? 'white' : '#F8FAFC',
                          borderBottom: '1px solid #E2E8F0'
                        }}>
                          <td style={{
                            padding: '1rem',
                            fontWeight: '500',
                            color: '#1B2A4A'
                          }}>
                            {rate.currency || rate.name || '—'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontFamily: 'monospace',
                            fontWeight: '600',
                            color: '#0D9488'
                          }}>
                            {rate.code || rate.currencyCode || '—'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontWeight: '600',
                            color: '#1B2A4A'
                          }}>
                            {rate.rate || rate.exchangeRate || '—'}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {rate.symbol || '—'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontSize: '0.875rem',
                            color: '#64748B'
                          }}>
                            {rate.updatedAt 
                              ? new Date(rate.updatedAt).toLocaleDateString('fr-FR')
                              : 'N/A'
                            }
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <button
                              onClick={() => showMsg('Modifier taux: ' + rate.code)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                background: 'transparent',
                                color: '#0B3D5C',
                                border: '1px solid #0B3D5C',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#0B3D5C'
                                e.target.style.color = 'white'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'transparent'
                                e.target.style.color = '#0B3D5C'
                              }}
                            >
                              Modifier
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* Placeholder Tabs */}
        {activeTab === 'containers' && <AdminContainerManager />}

        {activeTab === 'transactions' && (
          <div>
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#0B1F3A',
                margin: '0 0 1rem 0'
              }}>
                Transactions récentes
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0B1F3A' }}>
                      {['ID', 'Provider', 'Seeker', 'Statut', 'Date'].map(header => (
                        <th key={header} style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx, index) => (
                      <tr key={tx.id || index} style={{
                        background: index % 2 === 0 ? 'white' : '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B',
                          fontWeight: '500'
                        }}>
                          #{tx.id || index + 1}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B'
                        }}>
                          {tx.provider?.email || tx.providerEmail || 'N/A'}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B'
                        }}>
                          {tx.seeker?.email || tx.seekerEmail || 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: '600',
                            background: getWorkflowStatusColor(tx.workflowStatus || 'AT_PROVIDER').bg,
                            color: getWorkflowStatusColor(tx.workflowStatus || 'AT_PROVIDER').text
                          }}>
                            {tx.workflowStatus || 'AT_PROVIDER'}
                          </span>
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#64748B'
                        }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div>
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#0B1F3A',
                margin: '0 0 1rem 0'
              }}>
                Réclamations
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0B1F3A' }}>
                      {['Utilisateur', 'Sujet', 'Catégorie', 'Priorité', 'Statut', 'Date', 'Actions'].map(header => (
                        <th key={header} style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim, index) => (
                      <tr key={claim.id || index} style={{
                        background: index % 2 === 0 ? 'white' : '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B',
                          fontWeight: '500'
                        }}>
                          {claim.user?.email || claim.userEmail || 'N/A'}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B'
                        }}>
                          {claim.subject || 'N/A'}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#1E293B'
                        }}>
                          {claim.category || 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: '600',
                            background: getPriorityColor(claim.priority || 'LOW').bg,
                            color: getPriorityColor(claim.priority || 'LOW').text
                          }}>
                            {claim.priority || 'LOW'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: '600',
                            background: getStatusColor(claim.status || 'OPEN').bg,
                            color: getStatusColor(claim.status || 'OPEN').text
                          }}>
                            {claim.status || 'OPEN'}
                          </span>
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: '#64748B'
                        }}>
                          {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button
                            onClick={() => {
                              setSelectedClaim(claim)
                              setClaimResponse('')
                              setClaimStatus(claim.status || 'OPEN')
                              setShowClaimModal(true)
                            }}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: '#0B1F3A',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#1CA7C7'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#0B1F3A'
                            }}
                          >
                            Répondre
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Claim Response Modal */}
        {showClaimModal && selectedClaim && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px'
            }}>
              <h3 style={{
                color: '#1B2A4A',
                margin: '0 0 1.5rem',
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                Répondre à la réclamation
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  Sujet
                </label>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: '#F8FAFC',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  color: '#1B2A4A'
                }}>
                  {selectedClaim.subject}
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  Réponse
                </label>
                <textarea
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  value={claimResponse}
                  onChange={e => setClaimResponse(e.target.value)}
                  placeholder="Tapez votre réponse..."
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  Statut
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  value={claimStatus}
                  onChange={e => setClaimStatus(e.target.value)}
                >
                  <option value="OPEN">Ouvert</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="RESOLVED">Résolu</option>
                  <option value="CLOSED">Fermé</option>
                </select>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.5rem'
              }}>
                <button
                  onClick={async () => {
                    try {
                      await api.put(`/api/v1/support/admin/${selectedClaim.id}`, {
                        response: claimResponse,
                        status: claimStatus
                      })
                      showMsg('Réponse envoyée')
                      setShowClaimModal(false)
                      loadClaims()
                    } catch(e) { 
                      showMsg('Erreur: ' + e.message, false)
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0B1F3A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Envoyer
                </button>
                <button
                  onClick={() => setShowClaimModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showUserDetail && selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #E2E8F0'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#1B2A4A',
                  fontSize: '1.125rem',
                  fontWeight: '600'
                }}>
                  Détails de l'utilisateur
                </h3>
                <button
                  onClick={() => setShowUserDetail(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: '0',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748B',
                    marginBottom: '0.25rem'
                  }}>
                    Nom complet
                  </label>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#1B2A4A'
                  }}>
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                      : 'Non renseigné'}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748B',
                    marginBottom: '0.25rem'
                  }}>
                    Email
                  </label>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#1B2A4A'
                  }}>
                    {selectedUser.email}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748B',
                    marginBottom: '0.25rem'
                  }}>
                    Téléphone
                  </label>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#1B2A4A'
                  }}>
                    {selectedUser.phone || 'Non renseigné'}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748B',
                    marginBottom: '0.25rem'
                  }}>
                    Entreprise
                  </label>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#1B2A4A'
                  }}>
                    {selectedUser.companyName || 'Non renseigné'}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748B',
                    marginBottom: '0.25rem'
                  }}>
                    Pays
                  </label>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#1B2A4A'
                  }}>
                    {selectedUser.country || 'Non renseigné'}
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748B',
                    marginBottom: '0.25rem'
                  }}>
                    Rôle
                  </label>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#1B2A4A'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: `${getRoleColor(selectedUser.role)}20`,
                      color: getRoleColor(selectedUser.role)
                    }}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748B',
                    marginBottom: '0.25rem'
                  }}>
                    Statut du compte
                  </label>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#1B2A4A'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: `${getStatusColor(selectedUser.status)}20`,
                      color: getStatusColor(selectedUser.status)
                    }}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
                
                {selectedUser.createdAt && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748B',
                      marginBottom: '0.25rem'
                    }}>
                      Date de création
                    </label>
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: '#F8FAFC',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: '#1B2A4A'
                    }}>
                      {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                )}
                
                {selectedUser.lastLogin && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#64748B',
                      marginBottom: '0.25rem'
                    }}>
                      Dernière connexion
                    </label>
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: '#F8FAFC',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      color: '#1B2A4A'
                    }}>
                      {new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR')} à {new Date(selectedUser.lastLogin).toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #E2E8F0'
              }}>
                <button
                  onClick={() => setShowUserDetail(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0B3D5C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Country Modal */}
        {editCountry && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '480px'
            }}>
              <h3 style={{
                color: '#1B2A4A',
                margin: '0 0 1.5rem',
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                Modifier: {editCountry.name || editCountry.countryName}
              </h3>
              {[
                { label: 'Droits Douane %', key: 'customsDutyRate' },
                { label: 'TVA %', key: 'vatRate' },
                { label: 'Taxe Parafiscale %', key: 'parafiscalRate' },
                { label: 'Frais Portuaires', key: 'portFees' }
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.875rem'
                  }}>
                    {field.label}
                  </label>
                  <input
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    type="number"
                    step="0.01"
                    value={editCountry[field.key] || 0}
                    onChange={e => setEditCountry(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                  />
                </div>
              ))}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.5rem'
              }}>
                <button
                  onClick={async () => {
                    try {
                      await api.put('/admin/countries/' + editCountry.id, editCountry)
                      showMsg('Pays mis à jour')
                      setEditCountry(null)
                      loadCountries()
                    } catch(e) { 
                      showMsg('Erreur: ' + e.message, false)
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0B3D5C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setEditCountry(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Port Modal */}
        {editPort && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '480px'
            }}>
              <h3 style={{
                color: '#1B2A4A',
                margin: '0 0 1.5rem',
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                Modifier Port: {editPort.nomPort || editPort.name}
              </h3>
              {[
                { label: 'Nom du port', key: 'nomPort' },
                { label: 'Code port', key: 'unlocode' },
                { label: 'Frais EUR', key: 'fraisPortuaires' },
                { label: 'Type', key: 'typePort' }
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.875rem'
                  }}>
                    {field.label}
                  </label>
                  <input
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    value={editPort[field.key] || ''}
                    onChange={e => setEditPort(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                  />
                </div>
              ))}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.5rem'
              }}>
                <button
                  onClick={async () => {
                    try {
                      await api.put('/ports/' + editPort.id, editPort)
                      showMsg('Port mis à jour')
                      setEditPort(null)
                      loadPorts()
                    } catch(e) { 
                      showMsg('Erreur: ' + e.message, false)
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0B3D5C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setEditPort(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
