import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql', // or 'postgres' or your chosen database
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'pass',
      database: process.env.DB_NAME || 'collaboration_platform',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Adjust to your entity file paths
      synchronize: true, // Only for development! Use migrations for production.
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
