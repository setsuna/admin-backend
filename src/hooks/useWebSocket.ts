import { useEffect, useState } from 'react'
import { wsService } from '@/services/websocket'

// WebSocket连接hook
export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  
  useEffect(() => {
    wsService.connect()
      .then(() => setConnected(true))
      .catch(console.error)
    
    return () => {
      wsService.disconnect()
      setConnected(false)
    }
  }, [])
  
  return { connected }
}