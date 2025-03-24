import express, { Request, Response } from 'express';
import http from 'http';
import fs from 'fs';
import cors from 'cors';
import ws from './sockets.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// const options = {
//   key: fs.readFileSync('./cert/cert.key'),
//   cert: fs.readFileSync('./cert/cert.crt'),
// };
const server = http.createServer(app) as any;
ws(server);

app.use(
  cors({
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
  express.static(join(__dirname, '../public'))
);
const port = process.env.PORT || 3005;

app.get('/', (_: Request, res: Response) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

const HOST = '0.0.0.0';
server.listen(port, HOST as any, () => {
  console.log(`server running at ${server.address()?.address} ${port}`);
});
