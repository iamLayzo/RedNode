import crypto from 'crypto';

class ConsistentHashing {
  public ring: Map<string, any>; // Map to store virtual node hash and its corresponding actual node
  private sortedKeys: string[]; // Sorted array of virtual node hashes
  private virtualNodes: number; // Number of virtual nodes per actual node

  constructor(nodes: any[] = [], virtualNodes: number = 100) {
    this.virtualNodes = virtualNodes;
    this.ring = new Map();
    this.sortedKeys = [];
    console.log('Initializing ConsistentHashing with nodes:', nodes);
    nodes.forEach((node) => this.addNode(node)); // Add nodes to the hash ring
  }

  // Hashes a key using MD5
  private hash(key: string): string {
    const hashedKey = crypto.createHash('md5').update(key).digest('hex');
    console.log(`Hash for key "${key}":`, hashedKey);
    return hashedKey;
  }

  // Adds a node with multiple virtual nodes to the ring
  addNode(node: any): void {
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualNodeKey = `${node}-${i}`;
      const hash = this.hash(virtualNodeKey);
      console.log(`Adding virtual node: ${virtualNodeKey} with hash: ${hash}`);
      this.ring.set(hash, node); // Link the virtual node hash to the actual node
      this.sortedKeys.push(hash);
    }
    this.sortedKeys.sort(); // Keep the ring sorted by hash
  }

  // Removes a node and its virtual nodes from the ring
  removeNode(node: any): void {
    console.log(`Removing node: ${node}`);
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualNodeKey = `${node}-${i}`;
      const hash = this.hash(virtualNodeKey);
      this.ring.delete(hash); // Remove the virtual node hash
      this.sortedKeys = this.sortedKeys.filter((h) => h !== hash);
    }
  }

  // Retrieves the node responsible for the given key based on its hash
  getNode(key: string): any {
    const hash = this.hash(key);
    for (let sortedKey of this.sortedKeys) {
      if (hash <= sortedKey) {
        const node = this.ring.get(sortedKey);
        console.log(`Node found for key "${key}":`, node);
        return node;
      }
    }
    const node = this.ring.get(this.sortedKeys[0]); // If no match, return the first node
    console.log(`Default node for key "${key}":`, node);
    return node;
  }
}

export default ConsistentHashing;
