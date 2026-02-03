export class WSRateLimiter {
  constructor(windowMs = 10000, maxConnections = 5) {
    this.windowMs = windowMs;
    this.maxConnections = maxConnections;
    this.clients = new Map();
  }

  canConnect(ip) {
    const now = Date.now();

    if (!this.clients.has(ip)) {
      this.clients.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
        sockets: [ip],
      });
      return true;
    }

    const client = this.clients.get(ip);

    if (now > client.resetTime) {
      client.count = 0;
      client.resetTime = now + this.windowMs;
    }

    if (client.count < this.maxConnections) {
      client.count++;
      return true;
    }

    return false;
  }

  onDisconnect(ip) {
    if (this.clients.has(ip)) {
      const client = this.clients.get(ip);
      client.count = Math.max(0, client.count - 1);

      if (client.count === 0) {
        this.clients.delete(ip);
      }
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [ip] of this.clients) {
      if (now > this.clients.get(ip).resetTime) {
        this.clients.delete(ip);
      }
    }
  }
}
