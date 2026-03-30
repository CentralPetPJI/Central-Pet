import { Module } from '@nestjs/common';
import { PersonalityTraitsController } from './personality-traits.controller';
import { PersonalityTraitsService } from './personality-traits.service';

@Module({
  controllers: [PersonalityTraitsController],
  providers: [PersonalityTraitsService],
  exports: [PersonalityTraitsService],
})
export class PersonalityTraitsModule {}
