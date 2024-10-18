class MasterSlaveReplication {
  private master: any; // The main data store (master node)
  private slaves: any[]; // Array of slave nodes (replicas)
  private clientName: string; // Identifier for the client (tenant)

  constructor(master: any, slaves: any[] = [], clientName: string) {
    this.master = master;
    this.slaves = slaves;
    this.clientName = clientName;
  }

  // Writes the key-value pair to the master and replicates it to all slaves
  set(key: string, value: string, expire: number | null = null): void {
    console.log(`[${this.clientName}] Saving key: ${key} with value: ${value}`);
    this.master.set(key, value, expire); // Write to master
    this.slaves.forEach((slave) => slave.set(key, value, expire)); // Replicate to slaves
  }

  // Reads the key-value pair from the first slave that has the value or falls back to the master
  get(key: string): string | null {
    for (let slave of this.slaves) {
      const value = slave.get(key);
      if (value !== null) return value; // Return value from first available slave
    }
    return this.master.get(key); // Fallback to master if not found in slaves
  }

  // Deletes the key-value pair from the master and all slaves
  delete(key: string): void {
    this.master.delete(key);
    this.slaves.forEach((slave) => slave.delete(key));
  }

  // Retrieves all keys from the master node
  keys(): string[] {
    return this.master.keys();
  }
}

export default MasterSlaveReplication;
