export class StompClient {
  constructor(url, token, onConnect, onMessage, onError, onDisconnect) {
    this.url = url
    this.token = token
    this.onConnect = onConnect
    this.onMessage = onMessage
    this.onError = onError
    this.onDisconnect = onDisconnect
    this.ws = null
    this.connected = false
    this.subscriptions = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = null
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }
    console.log("Conectando WebSocket a:", this.url)
    // Usar la API nativa de WebSocket con el query param del token para el handshake interceptor
    this.ws = new WebSocket(`${this.url}?token=${this.token}`)

    this.ws.onopen = () => {
      // Enviar frame CONNECT en formato STOMP
      const connectFrame = 
        `CONNECT\n` +
        `accept-version:1.1,1.2\n` +
        `heart-beat:10000,10000\n` +
        `\n` +
        `\u0000`
      this.ws.send(connectFrame)
    }

    this.ws.onmessage = (event) => {
      const frame = this.parseFrame(event.data)
      if (!frame) return

      if (frame.command === 'CONNECTED') {
        this.connected = true
        this.reconnectAttempts = 0
        console.log("STOMP conectado con éxito!")
        if (this.onConnect) this.onConnect()
        // Volver a suscribir canales si se perdió la conexión
        this.subscriptions.forEach(sub => {
          this.sendSubscribe(sub.id, sub.destination)
        })
      } else if (frame.command === 'MESSAGE') {
        if (this.onMessage) {
          try {
            this.onMessage(frame.headers.destination, JSON.parse(frame.body))
          } catch {
            this.onMessage(frame.headers.destination, frame.body)
          }
        }
      } else if (frame.command === 'ERROR') {
        console.error("Error de STOMP recibido:", frame.body)
        if (this.onError) this.onError(frame.body)
      }
    }

    this.ws.onerror = (err) => {
      console.error("Error en WebSocket:", err)
      if (this.onError) this.onError(err)
    }

    this.ws.onclose = () => {
      this.connected = false
      if (this.onDisconnect) this.onDisconnect()
      this.attemptReconnect()
    }
  }

  subscribe(id, destination) {
    const sub = { id, destination }
    this.subscriptions.push(sub)
    if (this.connected) {
      this.sendSubscribe(id, destination)
    }
    // Retornar función para desuscribirse
    return () => {
      this.subscriptions = this.subscriptions.filter(s => s.id !== id)
      if (this.connected && this.ws.readyState === WebSocket.OPEN) {
        const unsubscribeFrame = `UNSUBSCRIBE\nid:${id}\n\n\u0000`
        this.ws.send(unsubscribeFrame)
      }
    }
  }

  sendSubscribe(id, destination) {
    const subscribeFrame = 
      `SUBSCRIBE\n` +
      `id:${id}\n` +
      `destination:${destination}\n` +
      `ack:auto\n` +
      `\n` +
      `\u0000`
    this.ws.send(subscribeFrame)
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("Llegado al máximo de intentos de reconexión WebSocket. Activando fallback a Polling.")
      return
    }
    this.reconnectAttempts++
    // Backoff exponencial: 2s, 4s, 8s, 16s, 32s
    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000)
    console.log(`Reintentando conexión WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts}) en ${delay}ms...`)
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
    this.maxReconnectAttempts = 0 // Prevenir reconexión automática al desconectar
    if (this.ws) {
      this.ws.close()
    }
  }

  parseFrame(data) {
    const raw = data.toString().trim()
    if (!raw) return null
    const parts = raw.split('\n\n')
    const headerLines = parts[0].split('\n')
    const command = headerLines[0].trim()
    const headers = {}
    for (let i = 1; i < headerLines.length; i++) {
      const line = headerLines[i]
      const idx = line.indexOf(':')
      if (idx !== -1) {
        headers[line.substring(0, idx).trim()] = line.substring(idx + 1).trim()
      }
    }
    const body = parts.slice(1).join('\n\n').replace(/\u0000$/, '').trim()
    return { command, headers, body }
  }
}
