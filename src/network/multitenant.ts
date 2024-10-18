import DataStore from '../core/dataStore';
import Sharding from '../core/sharding';
import MasterSlaveReplication from '../utils/replication';
import Monitoring from '../monitoring/monitoring';
import TTLHandler from '../core/ttlHandler';

class MultiTenantManager {
  private tenants: Map<string, any>;
  private nodePool: DataStore[];
  private monitoring: Monitoring;

  constructor() {
    this.tenants = new Map(); // Map of tenant names to their associated data
    this.nodePool = []; // Pool of available data nodes
    this.monitoring = new Monitoring(); // Monitoring instance for tracking tenant usage
  }

  // Creates a new tenant with replication, sharding, and TTL handling
  createTenant(clientName: string, nodeCount = 3, limit = 1000): void {
    if (this.tenants.has(clientName)) {
      console.warn(`Tenant ${clientName} already exists.`);
      return;
    }

    const nodes = this.assignNodesToTenant(nodeCount, limit);
    const replication = new MasterSlaveReplication(nodes[0], nodes.slice(1), clientName);
    const sharding = new Sharding(nodes, clientName);
    const ttlHandler = new TTLHandler(nodes[0]); // TTLHandler for expiration of keys

    this.tenants.set(clientName, {
      replication,
      sharding,
      ttlHandler,
    });

    console.log(`Tenant created: ${clientName}`);
  }

  // Assigns nodes to a tenant, either from the pool or by creating new ones
  assignNodesToTenant(count: number, limit: number): DataStore[] {
    const nodes: DataStore[] = [];
    for (let i = 0; i < count; i++) {
      if (this.nodePool.length > 0) {
        nodes.push(this.nodePool.pop()!);
      } else {
        nodes.push(new DataStore(limit));
      }
    }
    return nodes;
  }

  // Retrieves tenant data by client name
  getTenant(clientName: string): any {
    return this.tenants.get(clientName);
  }

  // Generates a namespaced key for a tenant
  getKeyWithNamespace(clientName: string, key: string): string {
    return `${clientName}:${key}`;
  }

  // Sets a key-value pair with optional TTL for a tenant
  set(clientName: string, key: string, value: string, expire: number | null = null): void {
    const tenant = this.getTenant(clientName);
    if (!tenant) {
      console.warn(`Tenant ${clientName} not found.`);
      return;
    }

    const namespacedKey = this.getKeyWithNamespace(clientName, key);
    tenant.replication.set(namespacedKey, value, expire);

    if (expire) {
      tenant.ttlHandler.set(namespacedKey, expire); // Set TTL for the key if expiration is provided
    }
  }

  // Retrieves a key's value for a tenant, returning null if expired
  get(clientName: string, key: string): string | null {
    const tenant = this.getTenant(clientName);
    if (!tenant) {
      console.warn(`Tenant ${clientName} not found.`);
      return null;
    }

    const namespacedKey = this.getKeyWithNamespace(clientName, key);

    if (tenant.ttlHandler.isExpired(namespacedKey)) {
      return null; // Key has expired, return null
    }

    return tenant.replication.get(namespacedKey);
  }

  // Deletes a key from a tenant
  delete(clientName: string, key: string): void {
    const tenant = this.getTenant(clientName);
    if (!tenant) {
      console.warn(`Tenant ${clientName} not found.`);
      return;
    }

    const namespacedKey = this.getKeyWithNamespace(clientName, key);
    tenant.replication.delete(namespacedKey);
    tenant.ttlHandler.delete(namespacedKey);
  }

  // Retrieves all keys for a tenant
  keys(clientName: string): string[] {
    const tenant = this.getTenant(clientName);
    if (!tenant) {
      console.warn(`Tenant ${clientName} not found.`);
      return [];
    }
    return tenant.replication.keys();
  }
}

export default MultiTenantManager;
