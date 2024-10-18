import TTLHandler from './ttlHandler';
import EvictionHandler from './evictionHandler';

class DataStore {
  private store: Map<string, string>;
  private ttlHandler: TTLHandler;
  private evictionHandler: EvictionHandler;

  constructor(limit = 1000) {
    this.store = new Map();
    this.ttlHandler = new TTLHandler(this);
    this.evictionHandler = new EvictionHandler(limit);
    this.startExpirationCheck();
  }

  // Periodically checks for expired keys
  private startExpirationCheck(interval = 5000): void {
    setInterval(() => {
      this.ttlHandler.checkExpired();
    }, interval);
  }

  // Stores a key-value pair with optional TTL
  set(key: string, value: string, expire: number | null = null): void {
    this.evictionHandler.evictIfNecessary(this.store);
    this.store.set(key, value);
    this.ttlHandler.set(key, expire);
    this.evictionHandler.markAsRecentlyUsed(key);
  }

  get(key: string): string | null {
    if (this.ttlHandler.isExpired(key)) return null;
    this.evictionHandler.markAsRecentlyUsed(key);
    return this.store.get(key) || null;
  }

  delete(key: string): void {
    this.store.delete(key);
    this.ttlHandler.delete(key);
    this.evictionHandler.delete(key);
  }

  keys(): string[] {
    return [...this.store.keys()];
  }
}

export default DataStore;
