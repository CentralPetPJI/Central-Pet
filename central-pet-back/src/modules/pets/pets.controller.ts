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
  create(@Body() createPetDto: CreatePetDto, @Headers('x-user-id') userId?: string) {
    // Prioriza o userId do header em vez do responsibleUserId enviado no body
    const responsibleUserId = userId ?? createPetDto.responsibleUserId;

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
    @Headers('x-user-id') userId?: string,
  ) {
    // Se não especificar responsibleUserId, usa o user-id do header
    const resolvedUserId = responsibleUserId ?? createdByUserId ?? userId;
    return this.petsService.findAll(resolvedUserId);
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
