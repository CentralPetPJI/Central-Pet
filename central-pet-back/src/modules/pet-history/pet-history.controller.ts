import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CreatePetHistoryDto } from './dto/create-pet-history.dto';
import { PetHistoryService } from './pet-history.service';

@Controller('pet-history')
export class PetHistoryController {
  constructor(private readonly petHistoryService: PetHistoryService) {}

  @Post()
  create(@Body() createPetHistoryDto: CreatePetHistoryDto) {
    return this.petHistoryService.create(createPetHistoryDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('petId') petId?: string) {
    return this.petHistoryService.findAll(userId, petId);
  }

  @Get('pet/:petId')
  findByPetId(@Param('petId', ParseUUIDPipe) petId: string) {
    return this.petHistoryService.findByPetId(petId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.petHistoryService.findOne(id);
  }
}
