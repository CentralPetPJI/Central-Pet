import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Headers,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(
    @Body() createPetDto: CreatePetDto,
    @Headers('x-mock-user-id') mockUserId?: string,
  ) {
    const responsibleUserId = createPetDto.responsibleUserId ?? mockUserId;

    if (!responsibleUserId) {
      throw new BadRequestException('responsibleUserId is required');
    }

    return this.petsService.create({
      ...createPetDto,
      responsibleUserId,
    });
  }

  @Get()
  findAll(
    @Query('createdByUserId') createdByUserId?: string,
    @Query('responsibleUserId') responsibleUserId?: string,
    @Headers('x-mock-user-id') mockUserId?: string,
  ) {
    // Se não especificar responsibleUserId, usa o mock-user-id do header
    const userId = responsibleUserId ?? createdByUserId ?? mockUserId;
    return this.petsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }
}
