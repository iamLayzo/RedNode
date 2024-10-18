class Monitoring {
  private usage: Map<string, number>;

  constructor() {
    this.usage = new Map(); // Tracks data usage per client
  }

  // Tracks the amount of bytes used by a client
  trackUsage(clientName: string, bytes: number): void {
    if (!this.usage.has(clientName)) {
      this.usage.set(clientName, 0);
    }
    this.usage.set(clientName, (this.usage.get(clientName) || 0) + bytes);
  }

  // Retrieves the current usage for a client
  getUsage(clientName: string): number {
    return this.usage.get(clientName) || 0;
  }

  // Checks if the client has exceeded their usage limit
  checkLimit(clientName: string, limit: number): boolean {
    const usage = this.getUsage(clientName);
    if (usage > limit) {
      console.warn(`[ALERT] Client ${clientName} exceeded usage limit: ${usage} bytes`);
      return true;
    }
    return false;
  }
}

export default Monitoring;
