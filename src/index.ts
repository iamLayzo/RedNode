import Server from './network/server';
import Persistence from './persistence/persistence';

const port = Number(process.env.PORT) || 6379;  

const server = new Server(port);

const persistence = new Persistence(server.tenantManager);

persistence.load();

persistence.startAutoSave();

server.start();
