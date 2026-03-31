import { useState, useEffect, useRef } from 'react'

const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const pollingRef = useRef(null)
  const mountedRef = useRef(true)

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const response = await fetch('http://localhost:8080/api/v1/notifications/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) return
      const data = await response.json()
      if (mountedRef.current) {
        setNotifications(data || [])
        setUnreadCount((data || []).filter(n => !n.read).length)
      }
    } catch (e) {}
  }

  useEffect(() => {
    mountedRef.current = true
    fetchNotifications()
    pollingRef.current = setInterval(fetchNotifications, 30000)
    return () => {
      mountedRef.current = false
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:8080/api/v1/notifications/${id}/mark-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (e) {}
  }

  return { notifications, unreadCount, markAsRead }
}

export default useNotifications
