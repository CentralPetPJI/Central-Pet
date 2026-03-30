import { Controller, Get } from '@nestjs/common';
import { PersonalityTraitsService } from './personality-traits.service';

@Controller('personality-traits')
export class PersonalityTraitsController {
  constructor(
    private readonly personalityTraitsService: PersonalityTraitsService,
  ) {}

  @Get()
  findAll() {
    return this.personalityTraitsService.findAll();
  }
}
