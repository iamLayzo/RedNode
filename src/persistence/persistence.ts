import fs from 'fs';
import path from 'path';

class Persistence {
  private store: any; // Store holding tenant data
  private filePath: string; // Path to persist data

  constructor(store: any, filePath = 'data.json') {
    this.store = store;
    this.filePath = path.resolve(__dirname, filePath);
  }

  // Save the current state of tenants' data to a file
  save(): void {
    const tenantsData: Record<string, any> = {};
    for (const [tenantName, tenant] of this.store.tenants.entries()) {
      tenantsData[tenantName] = {
        data: [...tenant.replication.master.store],
        ttl: [...tenant.ttlHandler.ttl], // Persist TTL for each tenant
      };
    }

    try {
      fs.writeFileSync(this.filePath, JSON.stringify(tenantsData), 'utf8');
    } catch (error) {
      console.error(`Error saving file ${this.filePath}:`, error);
    }
  }

  // Load persisted data for each tenant, including their keys and TTLs
  load(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        for (const tenantName in data) {
          if (this.store.tenants.has(tenantName)) {
            const tenant = this.store.tenants.get(tenantName);
            console.log(`Loading data for tenant ${tenantName}`);
            tenant.replication.master.store = new Map(data[tenantName].data); // Restore tenant's data
            tenant.ttlHandler.ttl = new Map(data[tenantName].ttl); // Restore TTLs
            console.log(`Data for tenant ${tenantName}:`, data[tenantName].data);
            console.log(`TTL for tenant ${tenantName}:`, data[tenantName].ttl);
          }
        }
        console.log(`Data loaded successfully from ${this.filePath}`);
      } catch (error) {
        console.error(`Error reading file ${this.filePath}:`, error);
      }
    } else {
      console.log(`File ${this.filePath} does not exist. A new one will be created when saving.`);
    }
  }

  // Automatically save data at regular intervals
  startAutoSave(interval = 5000): void {
    setInterval(() => {
      this.save();
    }, interval);
  }
}

export default Persistence;
