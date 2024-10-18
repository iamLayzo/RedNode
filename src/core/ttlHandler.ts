class TTLHandler {
  private store: any;
  private ttl: Map<string, number>;

  constructor(store: any) {
    this.store = store;
    this.ttl = new Map();
  }

  // Sets a TTL (expiration time) for a key
  set(key: string, expire: number | null): void {
    if (expire) {
      const now = Date.now();
      this.ttl.set(key, now + expire * 1000);
    }
  }

  // Checks if the key is expired and removes it if necessary
  isExpired(key: string): boolean {
    const now = Date.now();
    const expireTime = this.ttl.get(key);
    if (expireTime && now > expireTime) {
      this.store.delete(key);
      this.ttl.delete(key);
      return true;
    }
    return false;
  }

  // Extends the TTL for a key by adding extra time
  extendTTL(key: string, extraTime: number): void {
    const now = Date.now();
    const expireTime = this.ttl.get(key);
    if (expireTime && now <= expireTime - 1000) {
      this.ttl.set(key, now + extraTime * 1000);
    }
  }

  // Deletes the TTL for a key
  delete(key: string): void {
    this.ttl.delete(key);
  }

  // Periodically checks and removes expired keys
  checkExpired(): void {
    const now = Date.now();
    for (const [key, expireTime] of this.ttl.entries()) {
      if (now > expireTime) {
        this.store.delete(key);
        this.ttl.delete(key);
      }
    }
  }
}

export default TTLHandler;
