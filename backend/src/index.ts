// src/app.ts
import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json, urlencoded } from 'body-parser';
import { DataSource } from 'typeorm';
import { AppDataSource } from './config/database';
import { logger } from './config/logger';
import { rateLimiter } from './middlewares/rate-limiter';
import { errorHandler } from './middlewares/error-handler';
import { createConnection } from 'mysql2/promise';
import { initializeBackgroundJobs } from './jobs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Routers
import userRouter from '../src/modules/users/routes';
import projectRouter from '../src/modules/projects/routes';
import taskRouter from '../src/modules/tasks/routes';
import teamRouter from '../src/modules/teams/routes';
import notificationRouter from '../src/modules/notifications/routes';
import analyticsRouter from '../src/modules/analytics/routes';
import reportRouter from '../src/modules/reports/routes';
import { ExpressAdapter } from '@nestjs/platform-express';

class AppServer {
  private app: Application;
  private server: http.Server;
  private port: number;
  private nestApp: any;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.server = http.createServer(this.app);
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const dbName = 'collaboration_platform';
      const connection = await createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });

      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await connection.end();

      await AppDataSource.initialize();
      logger.info('Database connected successfully');

      if (process.env.NODE_ENV === 'production') {
        await AppDataSource.runMigrations();
        logger.info('Migrations executed');
      }
    } catch (error) {
      console.error(error);
      logger.error('Database connection failed', error);
      process.exit(1);
    }
  }

  private async initializeNestJS(): Promise<void> {
  this.nestApp = await NestFactory.create(AppModule, new ExpressAdapter(this.app));
    
  this.nestApp.enableCors({
    origin: 'http://localhost:3000', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allow common HTTP methods
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
  });
  this.nestApp.setGlobalPrefix('api/v1');
    
    // Apply NestJS middleware that needs to run before Express middleware
    await this.nestApp.init();
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());
    this.app.use(cors({
      origin:  'http://localhost:3000',
      credentials: true
    }));
    this.app.use(cors());

    // Request logging
    this.app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', { 
      stream: { write: (message) => logger.info(message.trim()) } 
    }));

    // Rate limiting
    this.app.use(rateLimiter);

    // Body parsing
    this.app.use(json({ limit: '10mb' }));
    this.app.use(urlencoded({ extended: true }));

    // Static files (if needed)
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy', timestamp: new Date() });
    });

    // Mount Express routers
    this.app.use('/api/v1/users', userRouter);
    this.app.use('/api/v1/projects', projectRouter);
    this.app.use('/api/v1/tasks', taskRouter);
    this.app.use('/api/v1/teams', teamRouter);
    this.app.use('/api/v1/notifications', notificationRouter);
    this.app.use('/api/v1/analytics', analyticsRouter);
    this.app.use('/api/v1/reports', reportRouter);

    // 404 Handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Resource not found' });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private initializeBackgroundJobs(): void {
    if (process.env.NODE_ENV !== 'test') {
      initializeBackgroundJobs();
      logger.info('Background jobs initialized');
    }
  }

  public async start(): Promise<void> {
    await this.initializeDatabase();
    await this.initializeNestJS();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeBackgroundJobs();

    this.server.listen(this.port, () => {
      logger.info(`Server running on port ${this.port} in ${process.env.NODE_ENV} mode`);
    });
  }

  public getServer(): Application {
    return this.app;
  }

  public getDataSource(): DataSource {
    return AppDataSource;
  }

  public getNestApp(): any {
    return this.nestApp;
  }
}

// Configuration
const PORT = parseInt(process.env.PORT || '3000');
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start the server
if (NODE_ENV !== 'test') {
  const appServer = new AppServer(PORT);
  appServer.start();
}

export default AppServer;