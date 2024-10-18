class ScriptEngine {
  private store: any; // Storage for script data

  constructor(store: any) {
    this.store = store;
  }

  // Execute a dynamic script with optional arguments
  execute(script: string, args: string[] = []): any {
    try {
      const fn = new Function('store', ...args, script); // Create a function with 'store' and arguments
      return fn(this.store, ...args); // Execute the function with the store and arguments
    } catch (error) {
      console.error('Error executing script:', error);
      return null; // Return null if execution fails
    }
  }
}

export default ScriptEngine;
