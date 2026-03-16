
/**
 * Derive the WebSocket base URL.
 *
 * Priority:
 *   1. REACT_APP_WS_URL  – explicit ws:// / wss:// value
 *   2. REACT_APP_API_BASE_URL – convert http(s) → ws(s) and strip /api suffix
 *   3. Fallback to ws://localhost:3001
 *
 * The returned value never has a trailing slash.
 */
const getWebSocketBaseUrl = () => {
  // 1. Explicit WS URL
  const raw = process.env.REACT_APP_WS_URL;
  if (raw) {
    return raw.split('#')[0].trim().replace(/\/+$/, '');
  }

  // 2. Derive from API base URL
  const apiBase = process.env.REACT_APP_API_BASE_URL;
  if (apiBase) {
    return apiBase
      .replace(/\/api\/?$/, '')       // strip /api suffix
      .replace(/^http:/, 'ws:')       // http → ws
      .replace(/^https:/, 'wss:')     // https → wss
      .replace(/\/+$/, '');
  }

  // 3. Fallback
  return 'ws://localhost:3001';
};

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.listeners = new Map();
    this.pendingMessages = [];
    this._consecutiveHandshakeFailures = 0;
    this._maxHandshakeFailures = 3;
    this._intentionalClose = false;
    this._connectTimer = null;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    // Don't try to connect without a token
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
    if (!token) {
      console.log('WebSocket: No auth token, skipping connection');
      return;
    }

    // Stop if we've had too many consecutive handshake failures
    if (this._consecutiveHandshakeFailures >= this._maxHandshakeFailures) {
      console.error(
        `WebSocket: ${this._consecutiveHandshakeFailures} consecutive handshake failures. ` +
        'Stopping reconnection — check the WebSocket server endpoint.'
      );
      return;
    }

    // Debounce the actual connection attempt to avoid StrictMode thrashing
    if (this._connectTimer) {
      clearTimeout(this._connectTimer);
    }

    this._connectTimer = setTimeout(() => {
      this._connectTimer = null;
      this._executeConnect(token);
    }, 50);
  }

  _executeConnect(token) {
    try {
      const base = getWebSocketBaseUrl();
      const wsUrl = `${base}/ws?token=${encodeURIComponent(token)}`;

      console.log('Connecting to WebSocket server:', `${base}/ws`);
      this._intentionalClose = false;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch(error) {
      console.error('WebSocket connection error:', error);
      this._consecutiveHandshakeFailures++;
      this.attemptReconnect();
    }
  }

disconnect() {
  if (this._connectTimer) {
    clearTimeout(this._connectTimer);
    this._connectTimer = null;
  }

  this._intentionalClose = true;
  this.reconnectAttempts = 0;
  this._consecutiveHandshakeFailures = 0;
  if (this.socket) {
    this.socket.close(1000, 'Client disconnect');
    this.socket = null;
    this.isConnected = false;
    console.log('WebSocket disconnected');
  }
}

handleOpen(event) {
  if (this.socket && event.target !== this.socket) return;

  console.log('WebSocket connected');
  this.isConnected = true;
  this.reconnectAttempts = 0;
  // Reset handshake failure counter on successful connection
  this._consecutiveHandshakeFailures = 0;

  // Send any pending messages
  if (this.pendingMessages.length > 0) {
    console.log(`Sending ${this.pendingMessages.length} pending messages`);
    this.pendingMessages.forEach(msg => this.send(msg.event, msg.data));
    this.pendingMessages = [];
  }

  // Notify connection listeners
  this.notifyListeners('connection', { connected: true });
}

handleMessage(event) {
  if (this.socket && event.target !== this.socket) return;

  try {
    const message = JSON.parse(event.data);
    const { type, data } = message;

    if (type) {
      this.notifyListeners(type, data);
    }
  } catch (error) {
    console.error('Error parsing WebSocket message:', error);
  }
}

handleClose(event) {
  if (event.target !== this.socket) {
    console.log('WebSocket: ignoring close event from stale connection');
    return;
  }

  const wasConnected = this.isConnected;
  this.isConnected = false;
  this.notifyListeners('connection', { connected: false });

  // If we never successfully connected (wasConnected is false) and
  // the close code indicates an abnormal closure or error, count it
  // as a handshake failure.
  if (!wasConnected && event.code !== 1000) {
    this._consecutiveHandshakeFailures++;
    console.log(
      `WebSocket handshake failure #${this._consecutiveHandshakeFailures} ` +
      `(code: ${event.code}, reason: ${event.reason || 'none'})`
    );
  } else {
    console.log(`WebSocket closed: ${event.code} - ${event.reason || 'none'}`);
  }

  // Attempt to reconnect unless it was an intentional closure
  if (!this._intentionalClose && event.code !== 1000) {
    this.attemptReconnect();
  }
}

handleError(event) {
  if (this.socket && event.target !== this.socket) return;

  // The onerror event fires before onclose; just log it.
  // Reconnect logic is handled in handleClose.
  console.error('WebSocket error:', event);
  this.notifyListeners('error', { error: event });
}

attemptReconnect() {
  if (this.reconnectAttempts >= this.maxReconnectAttempts) {
    console.log('WebSocket: Maximum reconnection attempts reached');
    return;
  }

  if (this._consecutiveHandshakeFailures >= this._maxHandshakeFailures) {
    console.error('WebSocket: Too many handshake failures, not retrying');
    return;
  }

  this.reconnectAttempts++;
  const delay = this.reconnectInterval * this.reconnectAttempts;
  console.log(
    `WebSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`
  );

  setTimeout(() => {
    this.connect();
  }, delay);
}

send(event, data) {
  if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
    console.log('WebSocket not connected, queueing message');
    this.pendingMessages.push({ event, data });
    this.connect(); // Try to connect
    return false;
  }

  try {
    const message = JSON.stringify({ type: event, data });
    this.socket.send(message);
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
}

subscribe(event, callback) {
  if (!this.listeners.has(event)) {
    this.listeners.set(event, []);
  }

  this.listeners.get(event).push(callback);
  return () => this.unsubscribe(event, callback);
}

unsubscribe(event, callback) {
  if (!this.listeners.has(event)) return;

  const callbacks = this.listeners.get(event);
  const index = callbacks.indexOf(callback);

  if (index !== -1) {
    callbacks.splice(index, 1);
  }

  if (callbacks.length === 0) {
    this.listeners.delete(event);
  }
}

notifyListeners(event, data) {
  if (!this.listeners.has(event)) return;

  this.listeners.get(event).forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error in WebSocket ${event} listener:`, error);
    }
  });
}
}

const websocketService = new WebSocketService();
export default websocketService;