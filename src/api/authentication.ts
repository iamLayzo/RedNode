import crypto from 'crypto';

class Authentication {
  private tokens: Map<string, string>;

  constructor() {
    this.tokens = new Map(); // token -> clientName
  }

  generateToken(clientName: string): string {
    const token = crypto.randomBytes(16).toString('hex');
    this.tokens.set(token, clientName);
    return token;
  }

  authenticate(token: string): string | null {
    return this.tokens.get(token) || null;
  }

  revokeToken(token: string): void {
    this.tokens.delete(token);
  }
}

export default Authentication;
