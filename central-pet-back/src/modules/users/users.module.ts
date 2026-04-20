import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserPersistenceService } from './user-persistence.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserPersistenceService],
  exports: [UsersService, UserPersistenceService],
})
export class UsersModule {}
