class Commands {
    private store: Map<string, string>;
  
    constructor(store: Map<string, string>) {
      this.store = store;
    }
  
    incr(key: string): number {
      const value = this.store.get(key);
      if (value === null) {
        this.store.set(key, '1');
        return 1;
      }
      const num = parseInt(value || '0', 10);
      if (isNaN(num)) {
        throw new Error('ERR value is not an integer or out of range');
      }
      const incrementedValue = num + 1;
      this.store.set(key, incrementedValue.toString());
      return incrementedValue;
    }
  
    multi(commands: string[]): void {
      // implement multi-command logic
    }
  
    exec(commands: string[]): void {
      // implement exec-command logic
    }
  
    discard(): void {
      // implement discard-command logic
    }
  }
  
  export default Commands;
  