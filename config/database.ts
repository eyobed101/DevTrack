// src/config/database.ts
import { DataSource } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';
// Import other entities here...

export const AppDataSource = new DataSource({
  type: 'mysql', // or 'mysql', 'sqlite', 'postgres' etc.
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV !== 'production', // auto-create tables in dev
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    // Add other entities here...
  ],
  migrations: ['src/migrations/*.ts'],
});