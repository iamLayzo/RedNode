import net from 'net';
import Commands from '../api/commands';
import MultiTenantManager from './multitenant';
import Authentication from '../api/authentication';

// Custom interface to extend the standard socket with clientName
interface CustomSocket extends net.Socket {
  clientName?: string;
}

class Server {
  private port: number;
  public tenantManager: MultiTenantManager;
  private auth: Authentication;
  private tokens: Record<string, string>;
  private server: net.Server;

  constructor(port = 6379) {
    this.port = port;
    this.tenantManager = new MultiTenantManager(); // Manager for tenant-specific data
    this.auth = new Authentication(); // Authentication handler

    // Create example tenants
    this.tenantManager.createTenant('ClientA', 3, 1000);
    this.tenantManager.createTenant('ClientB', 3, 1000);

    // Generate authentication tokens for clients
    this.tokens = {
      ClientA: this.auth.generateToken('ClientA'),
      ClientB: this.auth.generateToken('ClientB'),
    };

    // Create a TCP server that listens for connections
    this.server = net.createServer(this.handleConnection.bind(this));
  }

  start(): void {
    this.server.listen(this.port, () => {
      console.log(`Redis-like server listening on port ${this.port}`);
      console.log('Authentication tokens:', this.tokens);
    });
  }

  // Handle client connection
  private handleConnection(socket: CustomSocket): void {
    socket.on('data', (data) => {
      const commandLine = data.toString().trim();
      const commands = commandLine.split(' ');
      this.processCommands(commands, socket);
    });

    socket.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }

  // Process incoming commands
  private processCommands(commands: string[], socket: CustomSocket): void {
    const command = commands[0].toUpperCase();

    switch (command) {
      case 'AUTH':
        if (commands.length < 2) {
          socket.write(`-ERR invalid AUTH command\r\n`);
          return;
        }
        const token = commands[1];
        const clientName = this.auth.authenticate(token);
        if (clientName) {
          socket.write(`+OK\r\n`);
          socket.clientName = clientName;
        } else {
          socket.write(`-ERR invalid token\r\n`);
        }
        break;

      case 'PING':
        socket.write(`+PONG\r\n`);
        break;

      case 'ECHO':
        if (commands.length < 2) {
          socket.write(`-ERR invalid ECHO command\r\n`);
          return;
        }
        const message = commands.slice(1).join(' ');
        socket.write(`${message}\r\n`);
        break;

      // Handle SET command with optional TTL expiration
      case 'SET':
        if (!socket.clientName) {
          socket.write(`-ERR not authenticated\r\n`);
          return;
        }
        if (commands.length < 3) {
          socket.write(`-ERR invalid SET command\r\n`);
          return;
        }
        const setKey = commands[1];
        const setValue = commands[2];

        // Parse optional TTL
        let ttl: number | null = null;
        if (commands.length >= 4) {
          ttl = parseInt(commands[3]);
          if (isNaN(ttl)) {
            socket.write(`-ERR invalid TTL value\r\n`);
            return;
          }
        }

        this.tenantManager.set(socket.clientName, setKey, setValue, ttl);
        socket.write(`+OK\r\n`);
        break;

      // Handle GET command and check if key is expired
      case 'GET':
        if (!socket.clientName) {
          socket.write(`-ERR not authenticated\r\n`);
          return;
        }
        if (commands.length < 2) {
          socket.write(`-ERR invalid GET command\r\n`);
          return;
        }
        const getKey = commands[1];
        const value = this.tenantManager.get(socket.clientName, getKey);

        if (value !== null) {
          console.log(`Key ${getKey} retrieved successfully.`);
          socket.write(`${value}\r\n`);
        } else {
          console.log(`Key ${getKey} has expired or does not exist.`);
          socket.write(`(nil)\r\n`);
        }
        break;

      default:
        socket.write(`-ERR unknown command\r\n`);
        break;
    }
  }
}

export default Server;
