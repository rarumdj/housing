import compression from 'compression';
import cors from 'cors';
import { Application, json, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '../utils/env';
import { apiLimiter } from '../utils/rateLimit';

export default (app: Application) => {
  app.use(compression());
  app.use(helmet());
  app.use(cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }));
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
  app.use('/api', apiLimiter);
};
