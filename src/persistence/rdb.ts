import fs from 'fs';
import path from 'path';

class RDB {
  private filePath: string; // Path to the RDB file

  constructor(filePath = 'dump.rdb') {
    this.filePath = path.resolve(__dirname, filePath);
  }

  // Save data to the RDB file
  save(data: any): void {
    const rdbData = Buffer.from(JSON.stringify(data));
    fs.writeFileSync(this.filePath, rdbData);
  }

  // Load data from the RDB file
  load(): any {
    if (fs.existsSync(this.filePath)) {
      const rdbData = fs.readFileSync(this.filePath);
      return JSON.parse(rdbData.toString());
    }
    return {};
  }
}

export default RDB;
