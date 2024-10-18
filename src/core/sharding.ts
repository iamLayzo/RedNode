import ConsistentHashing from '../utils/consistentHashing';

class Sharding {
  private consistentHashing: ConsistentHashing;
  private clientName: string;

  constructor(nodes: any[], clientName: string) {
    this.consistentHashing = new ConsistentHashing(nodes);
    this.clientName = clientName;
    console.log(`[${this.clientName}] Sharding initialized with nodes:`, nodes);
  }

  // Assigns a key to a node and stores the value
  set(key: string, value: string, expire: number | null = null): void {
    const node = this.consistentHashing.getNode(key);
    console.log(`[${this.clientName}] Assigning key to shard: ${key} on node:`, node);
    node.set(key, value, expire);
  }

  // Retrieves the value for a given key from its node
  get(key: string): string | null {
    const node = this.consistentHashing.getNode(key);
    console.log(`[${this.clientName}] Retrieving key: ${key} from node:`, node);
    return node.get(key);
  }

  // Deletes the key from its assigned node
  delete(key: string): void {
    const node = this.consistentHashing.getNode(key);
    console.log(`[${this.clientName}] Deleting key: ${key} on node:`, node);
    node.delete(key);
  }

  // Retrieves all keys across the shards
  keys(): string[] {
    const allKeys = this.consistentHashing.ring.size > 0 
      ? [...this.consistentHashing.ring.values()].flatMap((node) => node.keys()) 
      : [];
    console.log(`[${this.clientName}] Retrieving all keys:`, allKeys);
    return allKeys;
  }
}

export default Sharding;
