import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PersonalityTraitsModule } from '../personality-traits/personality-traits.module';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  imports: [PersonalityTraitsModule],
  controllers: [PetsController],
  providers: [PetsService],
})
export class PetsModule {}
