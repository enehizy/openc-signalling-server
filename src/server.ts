import express, { Request, Response } from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import ws from './sockets';

const app = express();

const options = {
  key: fs.readFileSync('./cert/cert.key'),
  cert: fs.readFileSync('./cert/cert.crt'),
};
const server = https.createServer(options, app) as any;
ws(server);

app.use(
  cors({
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
  express.static('public')
);
const port = process.env.PORT || 3005;

app.get('/', (_: Request, res: Response) => {
  res.status(200).send();
  res.end();
});

const HOST = '0.0.0.0';
server.listen(port, HOST as any, () => {
  console.log(`server running at ${server.address()?.address} ${port}`);
});
