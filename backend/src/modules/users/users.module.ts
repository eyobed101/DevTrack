import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // This provides the User repository
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [
    UserService,
    TypeOrmModule.forFeature([User]), // Export the repository
  ],
})
export class UsersModule {}