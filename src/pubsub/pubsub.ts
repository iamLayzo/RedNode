class PubSub {
  private subscribers: Map<string, Function[]>; // Channel subscribers

  constructor() {
    this.subscribers = new Map();
  }

  // Publish a message to a specific channel
  publish(channel: string, message: string): void {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel)!.forEach((callback) => callback(message));
    }
  }

  // Subscribe to a channel with a callback
  subscribe(channel: string, callback: Function): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)!.push(callback);
  }

  // Unsubscribe from a channel by removing the callback
  unsubscribe(channel: string, callback: Function): void {
    if (this.subscribers.has(channel)) {
      this.subscribers.set(channel, this.subscribers.get(channel)!.filter((cb) => cb !== callback));
    }
  }
}

export default PubSub;
