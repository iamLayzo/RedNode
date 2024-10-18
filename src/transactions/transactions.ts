class Transactions {
  private queue: Function[]; // Queue to hold commands during the transaction
  private inTransaction: boolean; // Tracks if a transaction is in progress

  constructor() {
    this.queue = [];
    this.inTransaction = false;
  }

  // Starts a transaction
  multi(): string {
    this.inTransaction = true;
    this.queue = []; // Clears the queue for new commands
    return 'OK';
  }

  // Adds a command to the queue during a transaction
  queueCommand(command: Function): string {
    if (!this.inTransaction) {
      throw new Error('ERR No transaction started');
    }
    this.queue.push(command); // Pushes command to the transaction queue
    return 'QUEUED';
  }

  // Executes all queued commands and ends the transaction
  exec(): any[] {
    if (!this.inTransaction) {
      throw new Error('ERR No transaction started');
    }
    const results = this.queue.map((cmd) => cmd()); // Executes each command
    this.inTransaction = false; // Ends the transaction
    this.queue = []; // Clears the queue
    return results;
  }

  // Discards all queued commands and ends the transaction
  discard(): string {
    this.inTransaction = false; // Ends the transaction
    this.queue = []; // Clears the queue without executing commands
    return 'OK';
  }
}

export default Transactions;
