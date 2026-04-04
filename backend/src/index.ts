import express, { Application } from 'express';
import Middleware from './app/routes/middleware';
import Routes from './app/routes';
import sequelize from './app/models/db';
import './app/models';
import { env } from './app/utils/env';

const app: Application = express();

app.get('/', (_req, res) => {
  res.status(200).json({
    message: "Hurray!! You've found HouseHunt on the web.",
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: env.database.name,
  });
});

Middleware(app);
Routes(app);

const boot = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[DB] Connected to ${env.database.name} on ${env.database.host}`);
  } catch (error) {
    console.warn('[DB] Connection unavailable. API will continue with limited mock support.', error);
  }

  app.listen(env.port, () => {
    console.log(`HouseHunt API running on http://localhost:${env.port}`);
  });
};

void boot();

export default app;
