class EvictionHandler {
  private limit: number;
  private lru: Set<string>; // Least Recently Used set

  constructor(limit = 1000) {
    this.limit = limit;
    this.lru = new Set();
  }

  // Mark the key as recently used
  markAsRecentlyUsed(key: string): void {
    this.lru.delete(key);
    this.lru.add(key);
  }

  // Evicts the least recently used key if store exceeds the limit
  evictIfNecessary(store: Map<string, string>): void {
    while (store.size >= this.limit) {
      const oldestKey = this.lru.values().next().value;
      if (oldestKey) {
        store.delete(oldestKey);
        this.lru.delete(oldestKey);
      } else {
        break;
      }
    }
  }

  // Deletes the key from the LRU set
  delete(key: string): void {
    this.lru.delete(key);
  }
}

export default EvictionHandler;
