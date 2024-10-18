class Stream {
  private streams: Map<string, any[]>; // Map to store streams with their entries

  constructor() {
    this.streams = new Map();
  }

  // Adds a new entry to the stream
  xadd(stream: string, id: string, fields: any): void {
    if (!this.streams.has(stream)) {
      this.streams.set(stream, []); // Initialize the stream if it doesn't exist
    }
    const streamEntries = this.streams.get(stream)!;
    streamEntries.push({ id, fields }); // Push the new entry
    this.streams.set(stream, streamEntries); // Update the stream
  }

  // Reads a specified number of entries from the stream
  xread(stream: string, count: number): any[] {
    if (!this.streams.has(stream)) {
      return [];
    }
    const streamEntries = this.streams.get(stream)!;
    return streamEntries.slice(0, count); // Return the requested number of entries
  }

  // Returns the length of the stream
  xlen(stream: string): number {
    if (!this.streams.has(stream)) {
      return 0;
    }
    return this.streams.get(stream)!.length; // Return the total number of entries
  }
}

export default Stream;
