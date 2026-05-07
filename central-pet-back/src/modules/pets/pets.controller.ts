import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { FindPetsQueryDto } from './dto/find-pets-query.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { SessionGuard } from '@/modules/auth/guards/session.guard';
import { PetOwnerGuard } from './guards/pet-owner.guard';
import { CurrentUser } from '@/decorators/current-user.decorator';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @UseGuards(SessionGuard)
  create(@Body() createPetDto: CreatePetDto, @CurrentUser() user: { id: string }) {
    return this.petsService.create(createPetDto, user.id);
  }

  @Get()
  findAll(@Query() dto: FindPetsQueryDto) {
    return this.petsService.findAll(dto.responsibleUserId, dto.adoptionStatus);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SessionGuard, PetOwnerGuard)
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  @UseGuards(SessionGuard, PetOwnerGuard)
  async remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
